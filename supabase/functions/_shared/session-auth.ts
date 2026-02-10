// Edge Functions - Session Token Authentication
// Validates x-session-token header against pin_auth_sessions table

import { supabaseAdmin } from './supabase-client.ts';

interface SessionValidationResult {
  userId: string;
  sessionId: string;
}

/**
 * Validate a session token from the request.
 * Checks the x-session-token header against active (non-expired, non-closed) sessions
 * in the pin_auth_sessions table.
 *
 * @returns { userId, sessionId } on success, null on failure
 */
export async function validateSessionToken(
  req: Request
): Promise<SessionValidationResult | null> {
  // Check x-session-token header first, fallback to x-user-id for backwards compat
  const sessionToken = req.headers.get('x-session-token');

  if (!sessionToken) {
    return null;
  }

  try {
    const { data: session, error } = await supabaseAdmin
      .from('pin_auth_sessions')
      .select('id, user_id, expires_at, ended_at')
      .eq('session_token', sessionToken)
      .is('ended_at', null)
      .single();

    if (error || !session) {
      return null;
    }

    // Check if session is expired
    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      return null;
    }

    return {
      userId: session.user_id,
      sessionId: session.id,
    };
  } catch {
    return null;
  }
}

/**
 * Require a valid session token. Returns error response if invalid.
 * Use in edge functions: const session = requireSession(req); if (session instanceof Response) return session;
 */
export async function requireSession(
  req: Request
): Promise<SessionValidationResult | Response> {
  const session = await validateSessionToken(req);

  if (!session) {
    return new Response(
      JSON.stringify({ error: 'Valid session token required' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return session;
}
