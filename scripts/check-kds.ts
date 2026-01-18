import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function checkKDS() {
  // 1. Check orders with status new/preparing/ready
  console.log('=== ORDERS (new/preparing/ready) ===')
  const { data: orders, error: ordersErr } = await supabase
    .from('orders')
    .select('id, order_number, status, created_at')
    .in('status', ['new', 'preparing', 'ready'])
    .order('created_at', { ascending: false })
    .limit(10)

  if (ordersErr) console.log('Error:', ordersErr.message)
  else console.log(`Found ${orders?.length || 0} orders:`, orders)

  // 2. Check order_items with dispatch_station
  console.log('\n=== ORDER ITEMS (last 20) ===')
  const { data: items, error: itemsErr } = await supabase
    .from('order_items')
    .select('id, order_id, dispatch_station, item_status, quantity')
    .order('created_at', { ascending: false })
    .limit(20)

  if (itemsErr) console.log('Error:', itemsErr.message)
  else console.log(`Found ${items?.length || 0} items:`, items)

  // 3. Check categories dispatch_station
  console.log('\n=== CATEGORIES with dispatch_station ===')
  const { data: cats, error: catsErr } = await supabase
    .from('categories')
    .select('id, name, dispatch_station')
    .eq('is_active', true)
    .not('dispatch_station', 'eq', 'none')
    .order('name')

  if (catsErr) console.log('Error:', catsErr.message)
  else console.log(`Found ${cats?.length || 0} categories with stations:`, cats)

  // 4. Count by dispatch_station
  console.log('\n=== CATEGORIES COUNT BY STATION ===')
  const { data: allCats } = await supabase
    .from('categories')
    .select('dispatch_station')
    .eq('is_active', true)

  const counts: Record<string, number> = {}
  allCats?.forEach(c => {
    const station = c.dispatch_station || 'none'
    counts[station] = (counts[station] || 0) + 1
  })
  console.log(counts)
}

checkKDS().catch(console.error)
