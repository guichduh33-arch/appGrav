import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function createTestOrder() {
  console.log('Creating test order for KDS...')

  // 1. Get categories with dispatch_station
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, dispatch_station')
    .eq('is_active', true)
    .not('dispatch_station', 'eq', 'none')

  const kitchenCat = categories?.find(c => c.dispatch_station === 'kitchen')
  const baristaCat = categories?.find(c => c.dispatch_station === 'barista')
  const displayCat = categories?.find(c => c.dispatch_station === 'display')

  // 2. Get products for each category
  const { data: kitchenProducts } = await supabase
    .from('products')
    .select('id, name, retail_price')
    .eq('category_id', kitchenCat?.id)
    .eq('is_active', true)
    .limit(1)

  const { data: baristaProducts } = await supabase
    .from('products')
    .select('id, name, retail_price')
    .eq('category_id', baristaCat?.id)
    .eq('is_active', true)
    .limit(1)

  const { data: displayProducts } = await supabase
    .from('products')
    .select('id, name, retail_price')
    .eq('category_id', displayCat?.id)
    .eq('is_active', true)
    .limit(1)

  const kitchenProduct = kitchenProducts?.[0]
  const baristaProduct = baristaProducts?.[0]
  const displayProduct = displayProducts?.[0]

  console.log('Kitchen product:', kitchenProduct?.name || 'none')
  console.log('Barista product:', baristaProduct?.name || 'none')
  console.log('Display product:', displayProduct?.name || 'none')

  // 3. Create order with status 'new'
  const orderNumber = `TEST-KDS-${Date.now()}`
  const { data: order, error: orderErr } = await (supabase as any)
    .from('orders')
    .insert({
      order_number: orderNumber,
      order_type: 'dine_in',
      status: 'new',
      subtotal: 100000,
      tax_amount: 10000,
      tax_rate: 0.1,
      total: 110000,
      discount_value: 0,
      discount_amount: 0,
      points_earned: 0,
      points_used: 0,
      points_discount: 0,
      payment_status: 'unpaid'
    })
    .select()
    .single()

  if (orderErr) {
    console.log('Error creating order:', orderErr.message)
    return
  }

  console.log('Created order:', order.id, orderNumber)

  // 4. Create order items
  const items = []
  if (kitchenProduct) {
    items.push({
      order_id: order.id,
      product_id: kitchenProduct.id,
      product_name: kitchenProduct.name,
      quantity: 2,
      unit_price: kitchenProduct.retail_price || 25000,
      total_price: (kitchenProduct.retail_price || 25000) * 2,
      dispatch_station: 'kitchen',
      item_status: 'new'
    })
  }
  if (baristaProduct) {
    items.push({
      order_id: order.id,
      product_id: baristaProduct.id,
      product_name: baristaProduct.name,
      quantity: 1,
      unit_price: baristaProduct.retail_price || 35000,
      total_price: baristaProduct.retail_price || 35000,
      dispatch_station: 'barista',
      item_status: 'new'
    })
  }
  if (displayProduct) {
    items.push({
      order_id: order.id,
      product_id: displayProduct.id,
      product_name: displayProduct.name,
      quantity: 1,
      unit_price: displayProduct.retail_price || 20000,
      total_price: displayProduct.retail_price || 20000,
      dispatch_station: 'display',
      item_status: 'new'
    })
  }

  if (items.length === 0) {
    console.log('No products found to add to order')
    return
  }

  const { error: itemsErr } = await (supabase as any)
    .from('order_items')
    .insert(items)

  if (itemsErr) {
    console.log('Error creating items:', itemsErr.message)
    return
  }

  console.log('Created', items.length, 'order items')
  console.log('')
  console.log('=== SUCCESS! Test order created ===')
  console.log('Order number:', orderNumber)
  console.log('')
  console.log('Now refresh the KDS pages:')
  console.log('  - http://localhost:3009/kds/hot_kitchen')
  console.log('  - http://localhost:3009/kds/barista')
  console.log('  - http://localhost:3009/kds/display')
  console.log('  - http://localhost:3009/kds/waiter')
}

createTestOrder().catch(console.error)
