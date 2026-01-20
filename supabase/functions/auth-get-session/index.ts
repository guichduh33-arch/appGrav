// Edge Function: auth-get-session
// Validate session and return user data with permissions
// POST /auth-get-session { session_token: string }
// Also updates last_activity_at for session timeout tracking

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

interface GetSessionRequest {
  session_token: string;
}

// Session timeout in milliseconds (4 hours)
const SESSION_TIMEOUT_MS = 4 * 60 * 60 * 1000;

serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const { session_token }: GetSessionRequest = await req.json();

    if (!session_token) {
      return errorResponse('session_token is required', 400);
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('id, user_id, started_at, last_activity_at, ended_at, device_type')
      .eq('session_token', session_token)
      .single();

    if (sessionError || !session) {
      return jsonResponse({
        valid: false,
        error: 'session_not_found'
      }, 401);
    }

    // Check if session has ended
    if (session.ended_at) {
      return jsonResponse({
        valid: false,
        error: 'session_ended',
        end_reason: session.ended_at
      }, 401);
    }

    // Check for session timeout
    const lastActivity = new Date(session.last_activity_at).getTime();
    const now = Date.now();

    if (now - lastActivity > SESSION_TIMEOUT_MS) {
      // End the session due to timeout
      await supabase
        .from('user_sessions')
        .update({
          ended_at: new Date().toISOString(),
          end_reason: 'timeout'
        })
        .eq('id', session.id);

      return jsonResponse({
        valid: false,
        error: 'session_timeout'
      }, 401);
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, name, display_name, first_name, last_name, employee_code, avatar_url, preferred_language, is_active')
      .eq('id', session.user_id)
      .single();

    if (profileError || !profile) {
      return jsonResponse({
        valid: false,
        error: 'user_not_found'
      }, 401);
    }

    // Check if user is still active
    if (!profile.is_active) {
      // End session for inactive user
      await supabase
        .from('user_sessions')
        .update({
          ended_at: new Date().toISOString(),
          end_reason: 'forced'
        })
        .eq('id', session.id);

      return jsonResponse({
        valid: false,
        error: 'user_inactive'
      }, 401);
    }

    // Update last activity
    await supabase
      .from('user_sessions')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', session.id);

    // Get user roles
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select(`
        id,
        is_primary,
        role:roles (
          id,
          code,
          name_fr,
          name_en,
          name_id,
          hierarchy_level
        )
      `)
      .eq('user_id', session.user_id)
      .or('valid_until.is.null,valid_until.gt.now()');

    // Get user permissions
    const { data: permissions } = await supabase.rpc('get_user_permissions', {
      p_user_id: session.user_id
    });

    return jsonResponse({
      valid: true,
      user: {
        id: profile.id,
        name: profile.name,
        display_name: profile.display_name || profile.name,
        first_name: profile.first_name,
        last_name: profile.last_name,
        employee_code: profile.employee_code,
        avatar_url: profile.avatar_url,
        preferred_language: profile.preferred_language
      },
      session: {
        id: session.id,
        started_at: session.started_at,
        device_type: session.device_type
      },
      roles: userRoles?.map(ur => ur.role).filter(Boolean) || [],
      permissions: permissions || []
    });

  } catch (error) {
    console.error('Get session error:', error);
    return errorResponse('Internal server error', 500);
  }
});
