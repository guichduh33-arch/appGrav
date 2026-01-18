import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function debug() {
  // 1. Check if test order exists
  console.log('=== 1. CHECKING TEST ORDER ===')
  const { data: orders, error: ordErr } = await supabase
    .from('orders')
    .select('id, order_number, status')
    .in('status', ['new', 'preparing', 'ready'])

  if (ordErr) {
    console.log('Error:', ordErr.message)
  } else {
    console.log('Orders with new/preparing/ready status:', orders?.length)
    orders?.forEach(o => console.log(`  - ${o.order_number}: ${o.status}`))
  }

  // 2. Try the exact same query as KDS
  console.log('\n=== 2. KDS QUERY TEST ===')
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      order_type,
      status,
      created_at,
      order_items(
        id,
        quantity,
        notes,
        item_status,
        dispatch_station,
        product:products(name)
      )
    `)
    .in('status', ['new', 'preparing', 'ready'])
    .order('created_at', { ascending: true })

  if (error) {
    console.log('KDS Query ERROR:', error.message)
  } else {
    console.log('Found', data?.length, 'orders')
    data?.forEach(order => {
      console.log(`\nOrder: ${order.order_number} (${order.status})`)
      console.log('Items:')
      order.order_items?.forEach((item: any) => {
        console.log(`  - ${item.product?.name || 'Unknown'} x${item.quantity} [${item.dispatch_station}] (${item.item_status})`)
      })
    })
  }
}

debug().catch(console.error)
