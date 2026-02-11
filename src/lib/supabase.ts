import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Supabase config missing. URL: ${supabaseUrl}, Key: ${supabaseAnonKey ? 'present' : 'missing'}`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Helper for accessing tables not yet in generated Supabase types.
 * Uses `as never` (not `as any`) to avoid leaking unsafe types.
 */
export function untypedFrom(table: string) {
  return supabase.from(table as never)
}

/**
 * Helper for calling RPC functions not yet in generated Supabase types.
 * Uses `as never` (not `as any`) to avoid leaking unsafe types.
 */
export function untypedRpc(fn: string, params?: Record<string, unknown>) {
  return supabase.rpc(fn as never, params as never)
}
