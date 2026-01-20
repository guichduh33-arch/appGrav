// Edge Function: auth-change-pin
// Change user PIN with verification of current PIN or admin override
// POST /auth-change-pin { user_id: string, current_pin?: string, new_pin: string, admin_override?: boolean }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

interface ChangePinRequest {
  user_id: string;
  current_pin?: string;
  new_pin: string;
  admin_override?: boolean;
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
    const { user_id, current_pin, new_pin, admin_override }: ChangePinRequest = await req.json();
    const requestingUserId = req.headers.get('x-user-id');

    if (!requestingUserId) {
      return errorResponse('User ID header required', 401);
    }

    // Validate input
    if (!user_id || !new_pin) {
      return errorResponse('user_id and new_pin are required', 400);
    }

    if (new_pin.length < 4 || new_pin.length > 6 || !/^\d+$/.test(new_pin)) {
      return errorResponse('PIN must be 4-6 digits', 400);
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const clientIp = req.headers.get('x-forwarded-for') || null;
    const userAgent = req.headers.get('user-agent') || null;

    // Check if this is self-change or admin override
    const isSelfChange = user_id === requestingUserId;

    if (!isSelfChange || admin_override) {
      // Need users.update permission for changing other users' PIN
      const { data: hasPermission } = await supabase.rpc('user_has_permission', {
        p_user_id: requestingUserId,
        p_permission_code: 'users.update'
      });

      if (!hasPermission) {
        return errorResponse('Permission denied: users.update required to change other users PIN', 403);
      }
    }

    // If self-change without admin override, verify current PIN
    if (isSelfChange && !admin_override) {
      if (!current_pin) {
        return errorResponse('current_pin is required for self-change', 400);
      }

      const { data: isValid } = await supabase.rpc('verify_user_pin', {
        p_user_id: user_id,
        p_pin: current_pin
      });

      if (!isValid) {
        // Log failed attempt
        await supabase.from('audit_logs').insert({
          user_id: requestingUserId,
          action: 'PIN_CHANGE_FAILED',
          module: 'auth',
          entity_type: 'user_profiles',
          entity_id: user_id,
          new_values: { reason: 'invalid_current_pin' },
          ip_address: clientIp,
          user_agent: userAgent,
          severity: 'warning'
        });

        return errorResponse('Current PIN is incorrect', 401);
      }
    }

    // Hash the new PIN
    const { data: hashedPin, error: hashError } = await supabase.rpc('hash_pin', {
      p_pin: new_pin
    });

    if (hashError) {
      console.error('Hash PIN error:', hashError);
      return errorResponse('Failed to process PIN', 500);
    }

    // Update the PIN
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        pin_hash: hashedPin,
        pin_code: new_pin, // Keep legacy field updated
        password_changed_at: new Date().toISOString(),
        must_change_password: false,
        failed_login_attempts: 0,
        locked_until: null,
        updated_by: requestingUserId,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id);

    if (updateError) {
      console.error('Update PIN error:', updateError);
      return errorResponse('Failed to update PIN', 500);
    }

    // Log PIN change
    await supabase.from('audit_logs').insert({
      user_id: requestingUserId,
      action: 'PIN_CHANGED',
      module: 'auth',
      entity_type: 'user_profiles',
      entity_id: user_id,
      new_values: {
        changed_by: isSelfChange ? 'self' : 'admin',
        admin_override: admin_override || false
      },
      ip_address: clientIp,
      user_agent: userAgent,
      severity: isSelfChange ? 'info' : 'warning'
    });

    return jsonResponse({
      success: true,
      message: 'PIN changed successfully'
    });

  } catch (error) {
    console.error('Change PIN error:', error);
    return errorResponse('Internal server error', 500);
  }
});
