import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function check() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, status, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.log('Error:', error.message)
    return
  }

  console.log('Last 20 orders:')
  data?.forEach(o => {
    console.log(`  #${o.order_number} - ${o.status} - ${o.created_at}`)
  })

  // Count by status
  const { data: all } = await supabase.from('orders').select('status')
  const counts: Record<string, number> = {}
  all?.forEach(o => {
    counts[o.status] = (counts[o.status] || 0) + 1
  })
  console.log('\nStatus counts:', counts)
}

check().catch(console.error)
