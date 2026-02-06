import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
    console.log('📡 Connecting to:', supabaseUrl);

    // 1. Check schemas
    console.log('\n--- Schémas ---');
    const { data: schemas, error: schemaError } = await supabase
        .rpc('get_schemas'); // This might fail if not permitted
    if (schemaError) {
        console.log('Could not fetch schemas (expected if no RPC):', schemaError.message);
    } else {
        console.log('Available schemas:', schemas);
    }

    // 2. Comprehensive Products Check
    console.log('\n--- Products Table ---');
    const { data: products, error: pError, count: pCount } = await supabase
        .from('products')
        .select('*', { count: 'exact' });

    if (pError) {
        console.error('Error fetching products:', pError.message);
    } else {
        console.log(`Total Products: ${pCount}`);
        if (products && products.length > 0) {
            console.log('Sample Products:');
            products.slice(0, 5).forEach(p => console.log(` - ${p.name} (${p.sku}) [Active: ${p.is_active}]`));
        }
    }

    // 3. Check Categories
    console.log('\n--- Categories Table ---');
    const { data: cats, error: cError, count: cCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact' });

    if (cError) {
        console.error('Error fetching categories:', cError.message);
    } else {
        console.log(`Total Categories: ${cCount}`);
        if (cats && cats.length > 0) {
            console.log('Sample Categories:');
            cats.slice(0, 5).forEach(c => console.log(` - ${c.name}`));
        }
    }

    // 4. Test Write (Dummy Product)
    console.log('\n--- Write Test ---');
    const dummyId = '00000000-0000-0000-0000-000000000000';
    const { data: insertData, error: insertError } = await supabase
        .from('products')
        .upsert({
            id: dummyId,
            name: 'TEST_AGENT_PRODUCT',
            sku: 'TEST-000',
            product_type: 'finished',
            retail_price: 1000,
            cost_price: 500,
            is_active: true,
            pos_visible: true
        }, { onConflict: 'id' })
        .select();

    if (insertError) {
        console.error('Insert failed:', insertError.message);
    } else {
        console.log('✅ Insert/Upsert successful:', insertData[0].name);

        // Cleanup
        const { error: delError } = await supabase
            .from('products')
            .delete()
            .eq('id', dummyId);
        if (delError) console.error('Cleanup failed:', delError.message);
        else console.log('✅ Cleanup successful');
    }
}

runTest();
