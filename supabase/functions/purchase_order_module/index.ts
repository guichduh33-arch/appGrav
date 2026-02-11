
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { getCorsHeaders, handleCors } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight using shared origin-validated handler
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

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
    const resource = url.searchParams.get('resource') // 'suppliers' | 'orders'
    const id = url.searchParams.get('id')
    const method = req.method

    // --- SUPPLIERS ---
    if (resource === 'suppliers') {
      if (method === 'GET') {
        const { data, error } = await supabase.from('suppliers').select('*').order('name')
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      if (method === 'POST') {
        const body = await req.json()
        const { data, error } = await supabase.from('suppliers').insert(body).select()
        if (error) throw error
        return new Response(JSON.stringify(data[0]), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 })
      }
    }

    // --- PURCHASE ORDERS ---
    if (resource === 'orders') {
      if (method === 'GET') {
        // List orders with supplier name
        const { data, error } = await supabase
          .from('purchase_orders')
          .select('*, suppliers(name)')
          .order('created_at', { ascending: false })
        if (error) throw error
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      if (method === 'POST') {
        // Create PO with items (Transaction-like)
        const { supplier_id, items, ...poData } = await req.json()

        // 1. Create PO
        // Generate a simple PO number if not provided (logic could be complex, keeping simple here)
        const po_number = `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`

        const { data: po, error: poError } = await supabase
          .from('purchase_orders')
          .insert({ ...poData, supplier_id, po_number })
          .select()
          .single()

        if (poError) throw poError

        // 2. Insert Items
        if (items && items.length > 0) {
          const itemsToInsert = items.map((item: any) => ({
            po_id: po.id,
            product_id: item.product_id,
            quantity_ordered: item.quantity,
            unit_price: item.unit_price,
            total: item.quantity * item.unit_price
          }))

          const { error: itemsError } = await supabase.from('po_items').insert(itemsToInsert)
          if (itemsError) throw itemsError
        }

        return new Response(JSON.stringify(po), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 })
      }

      if (method === 'PATCH' && id) {
        // Update status
        const body = await req.json()
        const { data, error } = await supabase
          .from('purchase_orders')
          .update(body)
          .eq('id', id)
          .select()

        if (error) throw error

        // TODO: If status is 'received', we should technically update stock here or trigger a separate process
        // For now, we just update the status.

        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
    }

    // --- PRODUCTS (Helper for PO creation) ---
    if (resource === 'products') {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, current_stock, unit')
        .eq('is_active', true)
      if (error) throw error
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Resource not found' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
