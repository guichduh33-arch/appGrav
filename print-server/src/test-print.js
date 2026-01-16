/**
 * Print Server Test Script
 * Run with: npm test
 */
require('dotenv').config();

const EscPosBuilder = require('./services/EscPosBuilder');
const PrinterService = require('./services/PrinterService');
const receiptTemplate = require('./templates/receipt');
const kitchenTemplate = require('./templates/kitchen');
const baristaTemplate = require('./templates/barista');

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

function log(icon, message) {
    console.log(`${icon} ${message}`);
}

function success(message) {
    log(`${colors.green}✓${colors.reset}`, message);
}

function fail(message) {
    log(`${colors.red}✗${colors.reset}`, message);
}

function info(message) {
    log(`${colors.cyan}ℹ${colors.reset}`, message);
}

async function runTests() {
    console.log('\n' + '═'.repeat(50));
    console.log('  🖨️  THE BREAKERY PRINT SERVER TESTS');
    console.log('═'.repeat(50) + '\n');

    // Test 1: EscPosBuilder
    console.log(`${colors.yellow}Test 1: EscPosBuilder${colors.reset}`);
    try {
        const builder = new EscPosBuilder();
        const data = builder
            .initialize()
            .centerAlign()
            .bold(true)
            .text('TEST')
            .bold(false)
            .newLine()
            .cut()
            .build();

        if (Buffer.isBuffer(data) && data.length > 0) {
            success(`EscPosBuilder works (${data.length} bytes)`);
        } else {
            fail('EscPosBuilder returned invalid data');
        }
    } catch (error) {
        fail(`EscPosBuilder error: ${error.message}`);
    }

    // Test 2: Initialize printers
    console.log(`\n${colors.yellow}Test 2: Printer Initialization${colors.reset}`);
    try {
        await PrinterService.initialize();
        success('Printers initialized');
    } catch (error) {
        fail(`Printer init error: ${error.message}`);
    }

    // Test 3: Printer status
    console.log(`\n${colors.yellow}Test 3: Printer Status${colors.reset}`);
    for (const printer of ['receipt', 'barista', 'kitchen', 'display']) {
        const status = await PrinterService.getStatus(printer);
        if (status.status === 'online') {
            success(`${printer}: ${status.status} (${status.type})`);
        } else {
            info(`${printer}: ${status.status} (${status.type || 'unknown'})`);
        }
    }

    // Test 4: Receipt template
    console.log(`\n${colors.yellow}Test 4: Receipt Template${colors.reset}`);
    try {
        const sampleOrder = {
            order_number: 'POS-20250113-TEST',
            created_at: new Date().toISOString(),
            order_type: 'dine_in',
            table_number: '5',
            customer_name: 'Test Customer',
            staff_name: 'Apni',
            items: [
                {
                    quantity: 2,
                    product_name: 'Cappuccino',
                    modifiers: [
                        { option: 'Hot', price: 0 },
                        { option: 'Oat Milk', price: 8000 }
                    ],
                    total_price: 86000
                },
                {
                    quantity: 1,
                    product_name: 'Croissant',
                    modifiers: [],
                    total_price: 25000
                }
            ],
            subtotal: 111000,
            discount_amount: 0,
            tax_amount: 12210,
            total: 123210,
            payment_method: 'cash',
            cash_received: 130000,
            change_given: 6790,
            points_earned: 123
        };

        const receiptData = receiptTemplate(sampleOrder);
        success(`Receipt template generated (${receiptData.length} bytes)`);

        // Show preview
        const builder = new EscPosBuilder();
        builder.buffer = [...receiptData];
        const preview = builder.toText();
        console.log(`\n${colors.cyan}--- Receipt Preview ---${colors.reset}`);
        console.log(preview.split('\n').slice(0, 20).join('\n'));
        console.log('...\n');

    } catch (error) {
        fail(`Receipt template error: ${error.message}`);
    }

    // Test 5: Kitchen template
    console.log(`${colors.yellow}Test 5: Kitchen Template${colors.reset}`);
    try {
        const order = { order_number: 'POS-20250113-0042', order_type: 'dine_in', table_number: '5' };
        const items = [
            { quantity: 1, product_name: 'Eggs Benedict', modifiers: [], notes: 'No runny eggs' }
        ];
        const kitchenData = kitchenTemplate(order, items);
        success(`Kitchen template generated (${kitchenData.length} bytes)`);
    } catch (error) {
        fail(`Kitchen template error: ${error.message}`);
    }

    // Test 6: Barista template
    console.log(`\n${colors.yellow}Test 6: Barista Template${colors.reset}`);
    try {
        const order = { order_number: 'POS-20250113-0042', order_type: 'take_away' };
        const items = [
            { quantity: 2, product_name: 'Flat White', modifiers: [{ option: 'Iced' }, { option: 'Oat Milk' }] }
        ];
        const baristaData = baristaTemplate(order, items);
        success(`Barista template generated (${baristaData.length} bytes)`);
    } catch (error) {
        fail(`Barista template error: ${error.message}`);
    }

    // Test 7: Mock print
    console.log(`\n${colors.yellow}Test 7: Mock Print${colors.reset}`);
    try {
        const builder = new EscPosBuilder();
        const testData = builder
            .initialize()
            .text('Test print')
            .cut()
            .build();

        const result = await PrinterService.print('receipt', testData);

        if (result.success) {
            success(`Mock print successful (mock: ${result.mock})`);
        } else {
            fail('Mock print returned failure');
        }
    } catch (error) {
        fail(`Mock print error: ${error.message}`);
    }

    console.log('\n' + '═'.repeat(50));
    console.log('  Tests completed');
    console.log('═'.repeat(50) + '\n');
}

runTests().catch(console.error);
