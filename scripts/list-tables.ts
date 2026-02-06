import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function run() {
    console.log('📡 Database:', supabaseUrl);

    // List all tables using Postgres metadata
    const { data, error } = await supabase
        .from('pg_catalog.pg_tables') // This might be blocked by RLS/Permissions
        .select('tablename')
        .eq('schemaname', 'public');

    if (error) {
        console.log('Cannot access pg_tables directly (expected). Trying another way...');

        // Try to query common tables to see if they exist and have data
        const tables = [
            'products', 'categories', 'orders', 'order_items',
            'customers', 'stock_movements', 'user_profiles'
        ];

        for (const table of tables) {
            const { count, error: tError } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (tError) {
                console.log(`❌ ${table}: ${tError.message}`);
            } else {
                console.log(`✅ ${table}: ${count} rows`);
            }
        }
    } else {
        console.log('Tables found:', data.map(t => t.tablename).join(', '));
    }
}

run();
