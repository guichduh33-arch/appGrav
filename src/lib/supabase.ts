import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('ENV DEBUG:', {
  supabaseUrl,
  hasKey: !!supabaseAnonKey,
  allEnv: import.meta.env
})

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Supabase config missing. URL: ${supabaseUrl}, Key: ${supabaseAnonKey ? 'present' : 'missing'}`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
