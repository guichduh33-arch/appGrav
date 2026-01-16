// Edge Functions - Supabase Client
// Shared Supabase admin client for Edge Functions

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Create admin client with service role key
export const supabaseAdmin: SupabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// Create client from request authorization header
export function getSupabaseClient(req: Request): SupabaseClient {
    const authHeader = req.headers.get('Authorization');

    return createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
            global: {
                headers: {
                    Authorization: authHeader ?? '',
                },
            },
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}

// Get user from request
export async function getUser(req: Request) {
    const client = getSupabaseClient(req);
    const { data: { user }, error } = await client.auth.getUser();

    if (error || !user) {
        return null;
    }

    return user;
}
