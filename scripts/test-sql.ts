/**
 * SQL Database Connection Test Script
 * Run with: npx ts-node --esm scripts/test-sql.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    console.log('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_KEY)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TestResult {
    name: string;
    status: 'PASS' | 'FAIL';
    details?: string;
    duration?: number;
}

async function runTests(): Promise<void> {
    console.log('\n🧪 SQL Database Test Suite');
    console.log('━'.repeat(50));
    console.log(`📡 Connecting to: ${supabaseUrl}\n`);

    const results: TestResult[] = [];

    // Test 1: Basic connectivity
    console.log('1️⃣  Testing database connectivity...');
    const startConn = Date.now();
    try {
        const { data, error } = await supabase.from('products').select('id').limit(1);
        if (error) throw error;
        results.push({
            name: 'Database Connectivity',
            status: 'PASS',
            duration: Date.now() - startConn,
        });
        console.log('   ✅ Connected successfully\n');
    } catch (err: any) {
        results.push({
            name: 'Database Connectivity',
            status: 'FAIL',
            details: err.message,
        });
        console.log(`   ❌ Failed: ${err.message}\n`);
    }

    // Test 2: Check core tables exist
    console.log('2️⃣  Checking core tables...');
    const coreTables = ['products', 'categories', 'orders', 'order_items', 'customers', 'sections'];
    const tableResults: string[] = [];

    for (const table of coreTables) {
        try {
            const { error } = await supabase.from(table).select('id').limit(1);
            if (error) throw error;
            tableResults.push(`✅ ${table}`);
        } catch (err) {
            tableResults.push(`❌ ${table}`);
        }
    }

    console.log('   ' + tableResults.join('\n   ') + '\n');
    const allTablesOk = tableResults.every(r => r.includes('✅'));
    results.push({
        name: 'Core Tables Exist',
        status: allTablesOk ? 'PASS' : 'FAIL',
        details: allTablesOk ? `${coreTables.length} tables verified` : 'Some tables missing',
    });

    // Test 3: Product count query
    console.log('3️⃣  Running sample queries...');
    try {
        const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });
        if (error) throw error;
        console.log(`   ✅ Products count: ${count ?? 0}`);
        results.push({
            name: 'Product Count Query',
            status: 'PASS',
            details: `${count ?? 0} products in database`,
        });
    } catch (err: any) {
        console.log(`   ❌ Product count failed: ${err.message}`);
        results.push({
            name: 'Product Count Query',
            status: 'FAIL',
            details: err.message,
        });
    }

    try {
        const { count, error } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        if (error) throw error;
        console.log(`   ✅ Orders count: ${count ?? 0}`);
        results.push({
            name: 'Orders Count Query',
            status: 'PASS',
            details: `${count ?? 0} orders in database`,
        });
    } catch (err: any) {
        console.log(`   ❌ Orders count failed: ${err.message}`);
        results.push({
            name: 'Orders Count Query',
            status: 'FAIL',
            details: err.message,
        });
    }

    try {
        const { count, error } = await supabase.from('categories').select('*', { count: 'exact', head: true });
        if (error) throw error;
        console.log(`   ✅ Categories count: ${count ?? 0}\n`);
        results.push({
            name: 'Categories Count Query',
            status: 'PASS',
            details: `${count ?? 0} categories in database`,
        });
    } catch (err: any) {
        console.log(`   ❌ Categories count failed: ${err.message}\n`);
        results.push({
            name: 'Categories Count Query',
            status: 'FAIL',
            details: err.message,
        });
    }

    // Test 4: RLS Policy check (basic)
    console.log('4️⃣  Testing RLS policies...');
    try {
        const { data, error } = await supabase.from('products').select('id, name').limit(5);
        if (error) throw error;
        console.log(`   ✅ RLS allows read access (${data?.length || 0} products readable)\n`);
        results.push({
            name: 'RLS Read Access',
            status: 'PASS',
            details: `${data?.length || 0} products accessible`,
        });
    } catch (err: any) {
        console.log(`   ⚠️  RLS check: ${err.message}\n`);
        results.push({
            name: 'RLS Read Access',
            status: 'FAIL',
            details: err.message,
        });
    }

    // Summary
    console.log('━'.repeat(50));
    console.log('📊 TEST SUMMARY\n');

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;

    for (const result of results) {
        const icon = result.status === 'PASS' ? '✅' : '❌';
        const detail = result.details ? ` (${result.details})` : '';
        const time = result.duration ? ` [${result.duration}ms]` : '';
        console.log(`${icon} ${result.name}${detail}${time}`);
    }

    console.log('\n' + '━'.repeat(50));
    console.log(`🏁 Results: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
        console.log('🎉 All SQL tests passed!\n');
    } else {
        console.log('⚠️  Some tests failed. Check your database configuration.\n');
    }

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
