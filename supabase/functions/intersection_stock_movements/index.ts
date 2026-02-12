
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { getCorsHeaders, handleCors } from '../_shared/cors.ts'
import { requireSession } from '../_shared/session-auth.ts'

serve(async (req) => {
  // Handle CORS preflight using shared origin-validated handler
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  // Require authenticated session (SEC-006)
  const session = await requireSession(req);
  if (session instanceof Response) return session;

  try {
    // Validate Authorization header is present
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify the JWT is valid by checking the user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const url = new URL(req.url)
    const resource = url.searchParams.get('resource') // 'sections', 'stock', 'transfer'
    const method = req.method

    // --- SECTIONS ---
    if (resource === 'sections') {
      const { data, error } = await supabase.from('sections').select('*').order('name')
      if (error) throw error
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // --- STOCK PER SECTION ---
    if (resource === 'stock') {
      const section_id = url.searchParams.get('section_id')
      let query = supabase.from('section_stock').select('*, products(name, unit)')

      if (section_id) {
        query = query.eq('section_id', section_id)
      }

      const { data, error } = await query
      if (error) throw error
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // --- STOCK TRANSFER (Atomic via RPC) ---
    if (resource === 'transfer' && method === 'POST') {
      // Body: { product_id, from_section_id (null for warehouse), to_section_id (null for warehouse), quantity }
      const { product_id, from_section_id, to_section_id, quantity } = await req.json()

      if (!product_id || !quantity || quantity <= 0) {
        throw new Error("Invalid transfer parameters")
      }

      // Use atomic SQL function to prevent TOCTOU race conditions.
      // The RPC runs inside a single transaction with row-level locking.
      const { data, error } = await supabase.rpc('transfer_stock', {
        p_product_id: product_id,
        p_from_section_id: from_section_id === 'warehouse' ? null : from_section_id || null,
        p_to_section_id: to_section_id === 'warehouse' ? null : to_section_id || null,
        p_quantity: quantity,
        p_user_id: user.id,
      })

      if (error) throw error

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // --- QUERY PRODUCTS FOR SEARCH ---
    if (resource === 'products') {
      const { data, error } = await supabase.from('products').select('id, name, current_stock, unit').order('name')
      if (error) throw error
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Resource not found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
