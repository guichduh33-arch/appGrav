// Edge Function: auth-logout
// End user session and log the event
// POST /auth-logout { session_id: string, user_id: string }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

interface LogoutRequest {
  session_id: string;
  user_id: string;
  reason?: 'logout' | 'timeout' | 'forced';
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
    const { session_id, user_id, reason = 'logout' }: LogoutRequest = await req.json();

    // Validate input
    if (!session_id || !user_id) {
      return errorResponse('session_id and user_id are required', 400);
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify session exists and belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('id, user_id, ended_at')
      .eq('id', session_id)
      .eq('user_id', user_id)
      .single();

    if (sessionError || !session) {
      return errorResponse('Session not found', 404);
    }

    if (session.ended_at) {
      return jsonResponse({
        success: true,
        message: 'Session already ended'
      });
    }

    // End the session
    const { error: updateError } = await supabase
      .from('user_sessions')
      .update({
        ended_at: new Date().toISOString(),
        end_reason: reason
      })
      .eq('id', session_id);

    if (updateError) {
      console.error('Session update error:', updateError);
      return errorResponse('Failed to end session', 500);
    }

    // Log logout event
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || null;
    const userAgent = req.headers.get('user-agent') || null;

    await supabase.from('audit_logs').insert({
      user_id: user_id,
      action: 'LOGOUT',
      module: 'auth',
      entity_type: 'user_sessions',
      entity_id: session_id,
      new_values: { reason },
      session_id: session_id,
      ip_address: clientIp,
      user_agent: userAgent,
      severity: 'info'
    });

    return jsonResponse({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse('Internal server error', 500);
  }
});
