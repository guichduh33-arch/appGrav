
import { createClient } from '@supabase/supabase-js'

const url = 'https://dzlkcuekwybgvrzutzbb.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bGtjdWVrd3liZ3ZyenV0emJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTg1NTQsImV4cCI6MjA4Mzg3NDU1NH0.I52t1zBWLWlG16pjT9m4YuVBWFJ_lA4s2rMRVSvMXmU'

const supabase = createClient(url, key)

async function verify() {
    console.log('--- VERIFICATION START ---')

    // 1. Check Products Count
    const { count: productCount, error: pError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

    if (pError) console.error('Product Count Error:', pError)
    else console.log(`Total Products: ${productCount}`)

    // 2. Check Specific Raw Material (Coffee Bean)
    const { data: coffeeBean, error: cError } = await supabase
        .from('products')
        .select('id, sku, name, current_stock')
        .eq('sku', 'RM-COF-001')
        .single()

    if (cError) console.error('Coffee Bean Check Error:', cError)
    else console.log('Found Coffee Bean:', coffeeBean)

    // 2b. Check 006 Specific Item (Matcha Powder)
    const { data: matcha, error: mError } = await supabase
        .from('products')
        .select('id, sku, name')
        .eq('sku', 'RM-BEV-003')
        .single()

    if (mError) console.log('Matcha Check (Expected if 006 NOT applied):', mError.message)
    else console.log('Found Matcha (006 likely applied):', matcha)

    // 3. Check Specific Raw Material (Oat Milk)
    const { data: oatMilk, error: oError } = await supabase
        .from('products')
        .select('id, sku, name, current_stock')
        .eq('sku', 'RM-BEV-002')
        .single()

    if (oError) {
        // It's possible it wasn't inserted if migration failed mid-way
        console.log('Oat Milk Check Error (Expected if not valid):', oError.message)
    } else {
        console.log('Found Oat Milk:', oatMilk)
    }

    // 4. Check Recipes Count
    const { count: recipeCount, error: rError } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })

    if (rError) console.error('Recipe Count Error:', rError)
    else console.log(`Total Recipes: ${recipeCount}`)

    // 5. Check Recipe Linkage (Cappuccino COF-007 + Coffee Bean RM-COF-001)
    // We need to fetch product ids first or join. Supabase JS joins are tricky without exact types, 
    // let's just query recipes and select related data if possible, or just raw query if we had IDs.
    // Instead, let's find the recipe by looking up the product and material.

    if (coffeeBean) {
        // Find a product linked to it
        const { data: recipes, error: linkError } = await supabase
            .from('recipes')
            .select(`
            quantity,
            unit,
            products!product_id (name, sku),
            materials:products!material_id (name, sku)
        `)
            .eq('material_id', coffeeBean.id)
            .limit(5)

        if (linkError) console.error('Recipe Link Check Error:', linkError)
        else {
            console.log('Sample recipes using Coffee Bean:', recipes?.length)
            recipes?.forEach(r => {
                // @ts-ignore
                console.log(`- ${r.products.name} uses ${r.quantity}${r.unit} of ${r.materials.name}`)
            })
        }
    }

    console.log('--- VERIFICATION END ---')
}

verify().catch(console.error)
