
import { createClient } from '@supabase/supabase-js'

const url = 'https://dzlkcuekwybgvrzutzbb.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bGtjdWVrd3liZ3ZyenV0emJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTg1NTQsImV4cCI6MjA4Mzg3NDU1NH0.I52t1zBWLWlG16pjT9m4YuVBWFJ_lA4s2rMRVSvMXmU'

const supabase = createClient(url, key)

async function verify() {
    console.log('--- MASTER IMPORT VERIFICATION ---')

    // 1. Check Total Products (Previously ~231. Expecting ~231 + 78 = ~309)
    const { count: productCount, error: pError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

    if (pError) console.error('Product Count Error:', pError)
    else console.log(`Total Products: ${productCount}`)

    // 2. Check Specific New Item: Mayonnaise (RM-MAYONNAISE-5)
    // Note: SKU might vary if my random generation logic in script was slightly different locally vs what I wrote.
    // Actually I hardcoded the script logic but the suffix is random: `-${Math.floor(Math.random() * 1000)}`.
    // WAIT. The script I ran locally determined the SKUs.
    // The SQL file has FIXED SKUs now because I generated it. 
    // Let's check the SQL file content I read earlier.
    // Line 6: ('RM-MAYONNAISE-5', 'Mayonnaise', ...)
    // So I can look for sku 'RM-MAYONNAISE-5' exactly.

    const { data: mayo, error: mError } = await supabase
        .from('products')
        .select('id, sku, name')
        .eq('sku', 'RM-MAYONNAISE-5')
        .single()

    if (mError) {
        console.log('Mayonnaise Check (Expected if 010 NOT applied):', mError.message)
    } else {
        console.log('Found Mayonnaise:', mayo)
    }

    // 3. Check Specific New Item: Capuccino (PR-CAPUCCINO-885)
    const { data: cap, error: cError } = await supabase
        .from('products')
        .select('id, sku, name')
        .eq('sku', 'PR-CAPUCCINO-885')
        .single()

    if (cError) {
        console.log('Capuccino Check (Expected if 010 NOT applied):', cError.message)
    } else {
        console.log('Found Capuccino Product:', cap)
    }


    // 4. Check Recipes Count (Previously ~41. Expecting > 500)
    const { count: recipeCount, error: rError } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })

    if (rError) console.error('Recipe Count Error:', rError)
    else console.log(`Total Recipes: ${recipeCount}`)

    console.log('--- VERIFICATION END ---')
}

verify().catch(console.error)
