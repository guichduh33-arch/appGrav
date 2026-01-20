// Edge Function: auth-verify-pin
// Securely verify user PIN and create session
// POST /auth-verify-pin { user_id: string, pin: string, device_type?: string, device_name?: string }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

interface VerifyPinRequest {
  user_id: string;
  pin: string;
  device_type?: 'desktop' | 'tablet' | 'pos';
  device_name?: string;
}

interface UserProfile {
  id: string;
  name: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  employee_code: string | null;
  avatar_url: string | null;
  preferred_language: string;
  is_active: boolean;
  failed_login_attempts: number;
  locked_until: string | null;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const { user_id, pin, device_type, device_name }: VerifyPinRequest = await req.json();

    // Validate input
    if (!user_id || !pin) {
      return errorResponse('user_id and pin are required', 400);
    }

    if (pin.length < 4 || pin.length > 6) {
      return errorResponse('PIN must be 4-6 digits', 400);
    }

    // Create Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, name, display_name, first_name, last_name, employee_code, avatar_url, preferred_language, is_active, failed_login_attempts, locked_until, pin_hash')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      return errorResponse('User not found', 404);
    }

    // Check if account is active
    if (!profile.is_active) {
      return errorResponse('Account is inactive', 403);
    }

    // Check if account is locked
    if (profile.locked_until && new Date(profile.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(profile.locked_until).getTime() - Date.now()) / 60000);
      return jsonResponse({
        success: false,
        error: 'account_locked',
        message: `Account locked. Try again in ${minutesLeft} minutes.`,
        locked_until: profile.locked_until,
        minutes_left: minutesLeft
      }, 403);
    }

    // Verify PIN using database function (bcrypt comparison)
    const { data: isValid, error: verifyError } = await supabase.rpc('verify_user_pin', {
      p_user_id: user_id,
      p_pin: pin
    });

    if (verifyError) {
      console.error('PIN verification error:', verifyError);
      return errorResponse('Verification failed', 500);
    }

    if (!isValid) {
      // Get updated failed attempts count
      const { data: updatedProfile } = await supabase
        .from('user_profiles')
        .select('failed_login_attempts, locked_until')
        .eq('id', user_id)
        .single();

      const attemptsRemaining = 5 - (updatedProfile?.failed_login_attempts || 0);

      // Log failed attempt
      await supabase.from('audit_logs').insert({
        user_id: user_id,
        action: 'LOGIN_FAILED',
        module: 'auth',
        entity_type: 'user_profiles',
        entity_id: user_id,
        new_values: { reason: 'invalid_pin', device_type, device_name },
        severity: attemptsRemaining <= 1 ? 'warning' : 'info'
      });

      if (updatedProfile?.locked_until) {
        const minutesLeft = Math.ceil((new Date(updatedProfile.locked_until).getTime() - Date.now()) / 60000);
        return jsonResponse({
          success: false,
          error: 'account_locked',
          message: `Too many failed attempts. Account locked for ${minutesLeft} minutes.`,
          locked_until: updatedProfile.locked_until
        }, 403);
      }

      return jsonResponse({
        success: false,
        error: 'invalid_pin',
        message: 'Invalid PIN',
        attempts_remaining: attemptsRemaining > 0 ? attemptsRemaining : 0
      }, 401);
    }

    // PIN is valid - create session
    const sessionToken = crypto.randomUUID();
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || null;
    const userAgent = req.headers.get('user-agent') || null;

    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user_id,
        session_token: sessionToken,
        device_type: device_type || 'desktop',
        device_name: device_name || null,
        ip_address: clientIp,
        user_agent: userAgent,
        started_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return errorResponse('Failed to create session', 500);
    }

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
      .eq('user_id', user_id)
      .or('valid_until.is.null,valid_until.gt.now()');

    // Get user permissions
    const { data: permissions } = await supabase.rpc('get_user_permissions', {
      p_user_id: user_id
    });

    // Log successful login
    await supabase.from('audit_logs').insert({
      user_id: user_id,
      action: 'LOGIN',
      module: 'auth',
      entity_type: 'user_sessions',
      entity_id: session.id,
      new_values: { device_type, device_name, ip_address: clientIp },
      session_id: session.id,
      ip_address: clientIp,
      user_agent: userAgent,
      severity: 'info'
    });

    // Return success with user data
    return jsonResponse({
      success: true,
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
        token: sessionToken,
        device_type: session.device_type,
        started_at: session.started_at
      },
      roles: userRoles?.map(ur => ur.role).filter(Boolean) || [],
      permissions: permissions || []
    });

  } catch (error) {
    console.error('Auth error:', error);
    return errorResponse('Internal server error', 500);
  }
});
