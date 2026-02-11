// Edge Functions - Session Token Authentication
// Validates x-session-token header against user_sessions table using SHA-256 hash

import { supabaseAdmin } from './supabase-client.ts';

interface SessionValidationResult {
  userId: string;
  sessionId: string;
}

/**
 * Compute SHA-256 hex hash of a session token (matches DB trigger output).
 */
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate a session token from the request.
 * Hashes the token and looks up by session_token_hash in user_sessions.
 *
 * @returns { userId, sessionId } on success, null on failure
 */
export async function validateSessionToken(
  req: Request
): Promise<SessionValidationResult | null> {
  const sessionToken = req.headers.get('x-session-token');

  if (!sessionToken) {
    return null;
  }

  try {
    const tokenHash = await hashToken(sessionToken);

    const { data: session, error } = await supabaseAdmin
      .from('user_sessions')
      .select('id, user_id, ended_at')
      .eq('session_token_hash', tokenHash)
      .is('ended_at', null)
      .single();

    if (error || !session) {
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
