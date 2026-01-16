/**
 * Barista Ticket Template
 * For coffee/beverage preparation station
 */
const EscPosBuilder = require('../services/EscPosBuilder');

/**
 * Generate barista ticket ESC/POS data
 * @param {Object} order - Order data
 * @param {Array} items - Barista items to print
 * @returns {Buffer} ESC/POS command buffer
 */
function baristaTemplate(order, items) {
    const builder = new EscPosBuilder();
    const width = 48;

    builder.initialize();

    // Buzzer alert for new order
    if (process.env.ENABLE_BUZZER === 'true') {
        builder.buzzer(2, 3);
    }

    // =====================
    // HEADER
    // =====================
    builder
        .centerAlign()
        .bold(true)
        .text('☕ BARISTA ☕')
        .bold(false)
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
        .leftAlign();

    // =====================
    // DRINKS
    // =====================
    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        builder.newLine();

        // Quantity - extra large
        builder
            .doubleSize()
            .bold(true)
            .text(`${item.quantity}x`)
            .normalSize()
            .bold(false)
            .newLine();

        // Drink name
        builder
            .doubleHeight()
            .text(item.product_name || item.name)
            .normalSize()
            .newLine();

        // Modifiers - important for drinks
        const modifiers = item.modifiers || [];
        for (const mod of modifiers) {
            const modLabel = mod.option || mod.label || mod;
            builder
                .bold(true)
                .text(`  ▶ ${modLabel}`)
                .bold(false)
                .newLine();
        }

        // Notes - underlined for emphasis
        if (item.notes) {
            builder
                .bold(true)
                .underline(true)
                .text(`  ⚠ ${item.notes}`)
                .underline(false)
                .bold(false)
                .newLine();
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
        .text(`${items.length} drink${items.length > 1 ? 's' : ''}`)
        .bold(false)
        .cut();

    return builder.build();
}

/**
 * Extract short order number from full order number
 */
function getShortOrderNumber(orderNumber) {
    if (!orderNumber) return '0000';
    const parts = orderNumber.split('-');
    return parts[parts.length - 1] || orderNumber;
}

module.exports = baristaTemplate;
