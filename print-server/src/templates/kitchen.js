/**
 * Kitchen Ticket Template
 * For food preparation station
 */
const EscPosBuilder = require('../services/EscPosBuilder');

/**
 * Generate kitchen ticket ESC/POS data
 * @param {Object} order - Order data
 * @param {Array} items - Kitchen items to print
 * @returns {Buffer} ESC/POS command buffer
 */
function kitchenTemplate(order, items) {
    const builder = new EscPosBuilder();
    const width = 48;

    builder.initialize();

    // Buzzer alert for new order
    if (process.env.ENABLE_BUZZER === 'true') {
        builder.buzzer(3, 2);
    }

    // =====================
    // HEADER
    // =====================
    builder
        .centerAlign()
        .inverse(true)
        .text('   KITCHEN   ')
        .inverse(false)
        .newLine(2);

    // Large order number
    const shortOrderNum = getShortOrderNumber(order.order_number);
    builder
        .doubleSize()
        .bold(true)
        .text(`#${shortOrderNum}`)
        .normalSize()
        .bold(false)
        .newLine(2);

    // Order type and table
    const orderType = order.order_type === 'dine_in' ? 'DINE IN' : 'TAKE AWAY';
    const tableInfo = order.table_number ? ` - T${order.table_number}` : '';

    builder
        .doubleHeight()
        .text(`${orderType}${tableInfo}`)
        .normalSize()
        .newLine()
        .text(builder.formatTime(order.created_at || new Date()))
        .newLine()
        .separator('=', width)
        .leftAlign()
        .newLine();

    // =====================
    // ITEMS
    // =====================
    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Quantity and name - large
        builder
            .doubleHeight()
            .bold(true)
            .text(`${item.quantity}x ${item.product_name || item.name}`)
            .normalSize()
            .bold(false)
            .newLine();

        // Modifiers
        const modifiers = item.modifiers || [];
        for (const mod of modifiers) {
            const modLabel = mod.option || mod.label || mod;
            builder.text(`   → ${modLabel}`).newLine();
        }

        // Notes - highlighted
        if (item.notes) {
            builder
                .bold(true)
                .text(`   ⚠ ${item.notes}`)
                .bold(false)
                .newLine();
        }

        // Add spacing between items
        if (i < items.length - 1) {
            builder.newLine();
        }
    }

    // =====================
    // FOOTER
    // =====================
    builder
        .newLine()
        .separator('=', width)
        .centerAlign()
        .bold(true)
        .text(`${items.length} item${items.length > 1 ? 's' : ''}`)
        .bold(false)
        .cut();

    return builder.build();
}

/**
 * Extract short order number from full order number
 * POS-20250113-0042 -> 0042
 */
function getShortOrderNumber(orderNumber) {
    if (!orderNumber) return '0000';
    const parts = orderNumber.split('-');
    return parts[parts.length - 1] || orderNumber;
}

module.exports = kitchenTemplate;
