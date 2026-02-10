// Edge Function: auth-user-management
// CRUD operations for users with permission checks
// POST /auth-user-management { action: 'create' | 'update' | 'delete' | 'toggle_active', ... }

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { validateSessionToken } from '../_shared/session-auth.ts';

interface CreateUserRequest {
  action: 'create';
  first_name: string;
  last_name: string;
  display_name?: string;
  employee_code?: string;
  phone?: string;
  avatar_url?: string;
  preferred_language?: 'fr' | 'en' | 'id';
  pin?: string;
  role_ids: string[];
  primary_role_id: string;
}

interface UpdateUserRequest {
  action: 'update';
  user_id: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  employee_code?: string;
  phone?: string;
  avatar_url?: string;
  preferred_language?: 'fr' | 'en' | 'id';
  role_ids?: string[];
  primary_role_id?: string;
}

interface DeleteUserRequest {
  action: 'delete';
  user_id: string;
}

interface ToggleActiveRequest {
  action: 'toggle_active';
  user_id: string;
  is_active: boolean;
}

type UserManagementRequest = CreateUserRequest | UpdateUserRequest | DeleteUserRequest | ToggleActiveRequest;

serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const body: UserManagementRequest = await req.json();

    // Validate session token (SEC-005: replaces spoofable x-user-id)
    const session = await validateSessionToken(req);
    if (!session) {
      return errorResponse('Valid session token required', 401, req);
    }
    const requestingUserId = session.userId;

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if requesting user has permission
    const requiredPermission = body.action === 'create' ? 'users.create' :
      body.action === 'update' ? 'users.update' :
        body.action === 'delete' ? 'users.delete' :
          'users.update';

    const { data: hasPermission } = await supabase.rpc('user_has_permission', {
      p_user_id: requestingUserId,
      p_permission_code: requiredPermission
    });

    if (!hasPermission) {
      return errorResponse(`Permission denied: ${requiredPermission}`, 403);
    }

    const clientIp = req.headers.get('x-forwarded-for') || null;
    const userAgent = req.headers.get('user-agent') || null;

    switch (body.action) {
      case 'create': {
        const { first_name, last_name, display_name, employee_code, phone, avatar_url, preferred_language, pin, role_ids, primary_role_id } = body;

        // Validate required fields
        if (!first_name || !last_name || !role_ids?.length || !primary_role_id) {
          return errorResponse('first_name, last_name, role_ids, and primary_role_id are required', 400);
        }

        // Generate employee code if not provided
        const finalEmployeeCode = employee_code || `EMP-${Date.now().toString(36).toUpperCase()}`;

        // Create user profile
        const { data: newUser, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            name: `${first_name} ${last_name}`.trim(),
            first_name,
            last_name,
            display_name: display_name || `${first_name} ${last_name}`.trim(),
            employee_code: finalEmployeeCode,
            phone,
            avatar_url,
            preferred_language: preferred_language || 'id',
            role: 'cashier', // Legacy field - default value
            pin_hash: pin ? null : null, // Will be set separately
            created_by: requestingUserId,
            updated_by: requestingUserId
          })
          .select()
          .single();

        if (createError) {
          console.error('Create user error:', createError);
          return errorResponse(`Failed to create user: ${createError.message}`, 500);
        }

        // Set PIN if provided
        if (pin) {
          const { data: hashedPin } = await supabase.rpc('hash_pin', { p_pin: pin });
          await supabase
            .from('user_profiles')
            .update({ pin_hash: hashedPin })
            .eq('id', newUser.id);
        }

        // Assign roles
        for (const roleId of role_ids) {
          await supabase.from('user_roles').insert({
            user_id: newUser.id,
            role_id: roleId,
            is_primary: roleId === primary_role_id,
            assigned_by: requestingUserId
          });
        }

        // Get the created user with roles
        const { data: userWithRoles } = await supabase
          .from('user_profiles')
          .select(`
            *,
            user_roles (
              id,
              is_primary,
              role:roles (id, code, name_fr, name_en, name_id)
            )
          `)
          .eq('id', newUser.id)
          .single();

        // Log creation
        await supabase.from('audit_logs').insert({
          user_id: requestingUserId,
          action: 'CREATE',
          module: 'users',
          entity_type: 'user_profiles',
          entity_id: newUser.id,
          new_values: { first_name, last_name, employee_code: finalEmployeeCode, role_ids },
          ip_address: clientIp,
          user_agent: userAgent,
          severity: 'info'
        });

        return jsonResponse({
          success: true,
          user: userWithRoles
        });
      }

      case 'update': {
        const { user_id, first_name, last_name, display_name, employee_code, phone, avatar_url, preferred_language, role_ids, primary_role_id } = body;

        if (!user_id) {
          return errorResponse('user_id is required', 400);
        }

        // Get current user data for audit
        const { data: currentUser } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user_id)
          .single();

        if (!currentUser) {
          return errorResponse('User not found', 404);
        }

        // Build update object
        const updates: Record<string, unknown> = {
          updated_by: requestingUserId,
          updated_at: new Date().toISOString()
        };

        if (first_name !== undefined) updates.first_name = first_name;
        if (last_name !== undefined) updates.last_name = last_name;
        if (first_name || last_name) {
          updates.name = `${first_name || currentUser.first_name} ${last_name || currentUser.last_name}`.trim();
        }
        if (display_name !== undefined) updates.display_name = display_name;
        if (employee_code !== undefined) updates.employee_code = employee_code;
        if (phone !== undefined) updates.phone = phone;
        if (avatar_url !== undefined) updates.avatar_url = avatar_url;
        if (preferred_language !== undefined) updates.preferred_language = preferred_language;

        // Update user profile
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('id', user_id);

        if (updateError) {
          console.error('Update user error:', updateError);
          return errorResponse(`Failed to update user: ${updateError.message}`, 500);
        }

        // Update roles if provided
        if (role_ids && primary_role_id) {
          // Check permission for role management
          const { data: canManageRoles } = await supabase.rpc('user_has_permission', {
            p_user_id: requestingUserId,
            p_permission_code: 'users.roles'
          });

          if (canManageRoles) {
            // Remove existing roles
            await supabase.from('user_roles').delete().eq('user_id', user_id);

            // Add new roles
            for (const roleId of role_ids) {
              await supabase.from('user_roles').insert({
                user_id: user_id,
                role_id: roleId,
                is_primary: roleId === primary_role_id,
                assigned_by: requestingUserId
              });
            }
          }
        }

        // Get updated user
        const { data: updatedUser } = await supabase
          .from('user_profiles')
          .select(`
            *,
            user_roles (
              id,
              is_primary,
              role:roles (id, code, name_fr, name_en, name_id)
            )
          `)
          .eq('id', user_id)
          .single();

        // Log update
        await supabase.from('audit_logs').insert({
          user_id: requestingUserId,
          action: 'UPDATE',
          module: 'users',
          entity_type: 'user_profiles',
          entity_id: user_id,
          old_values: currentUser,
          new_values: updates,
          ip_address: clientIp,
          user_agent: userAgent,
          severity: 'info'
        });

        return jsonResponse({
          success: true,
          user: updatedUser
        });
      }

      case 'delete': {
        const { user_id } = body;

        if (!user_id) {
          return errorResponse('user_id is required', 400);
        }

        // Prevent self-deletion
        if (user_id === requestingUserId) {
          return errorResponse('Cannot delete your own account', 400);
        }

        // Check if user is super admin
        const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', {
          p_user_id: user_id
        });

        if (isSuperAdmin) {
          return errorResponse('Cannot delete Super Admin account', 403);
        }

        // Get current user data for audit
        const { data: currentUser } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user_id)
          .single();

        if (!currentUser) {
          return errorResponse('User not found', 404);
        }

        // Soft delete - set is_active to false
        const { error: deleteError } = await supabase
          .from('user_profiles')
          .update({
            is_active: false,
            updated_by: requestingUserId,
            updated_at: new Date().toISOString()
          })
          .eq('id', user_id);

        if (deleteError) {
          console.error('Delete user error:', deleteError);
          return errorResponse(`Failed to delete user: ${deleteError.message}`, 500);
        }

        // End all active sessions
        await supabase
          .from('user_sessions')
          .update({
            ended_at: new Date().toISOString(),
            end_reason: 'forced'
          })
          .eq('user_id', user_id)
          .is('ended_at', null);

        // Log deletion
        await supabase.from('audit_logs').insert({
          user_id: requestingUserId,
          action: 'DELETE',
          module: 'users',
          entity_type: 'user_profiles',
          entity_id: user_id,
          old_values: currentUser,
          ip_address: clientIp,
          user_agent: userAgent,
          severity: 'warning'
        });

        return jsonResponse({
          success: true,
          message: 'User deactivated successfully'
        });
      }

      case 'toggle_active': {
        const { user_id, is_active } = body;

        if (!user_id || is_active === undefined) {
          return errorResponse('user_id and is_active are required', 400);
        }

        // Prevent self-deactivation
        if (user_id === requestingUserId && !is_active) {
          return errorResponse('Cannot deactivate your own account', 400);
        }

        // Check if user is super admin
        if (!is_active) {
          const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', {
            p_user_id: user_id
          });

          if (isSuperAdmin) {
            return errorResponse('Cannot deactivate Super Admin account', 403);
          }
        }

        const { error: toggleError } = await supabase
          .from('user_profiles')
          .update({
            is_active,
            updated_by: requestingUserId,
            updated_at: new Date().toISOString()
          })
          .eq('id', user_id);

        if (toggleError) {
          console.error('Toggle active error:', toggleError);
          return errorResponse(`Failed to update user status: ${toggleError.message}`, 500);
        }

        // If deactivating, end all active sessions
        if (!is_active) {
          await supabase
            .from('user_sessions')
            .update({
              ended_at: new Date().toISOString(),
              end_reason: 'forced'
            })
            .eq('user_id', user_id)
            .is('ended_at', null);
        }

        // Log status change
        await supabase.from('audit_logs').insert({
          user_id: requestingUserId,
          action: 'UPDATE',
          module: 'users',
          entity_type: 'user_profiles',
          entity_id: user_id,
          new_values: { is_active, action: is_active ? 'reactivated' : 'deactivated' },
          ip_address: clientIp,
          user_agent: userAgent,
          severity: is_active ? 'info' : 'warning'
        });

        return jsonResponse({
          success: true,
          is_active
        });
      }

      default:
        return errorResponse('Invalid action', 400);
    }

  } catch (error) {
    console.error('User management error:', error);
    return errorResponse('Internal server error', 500);
  }
});
