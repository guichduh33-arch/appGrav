/**
 * Display Ticket Template
 * For display case station
 */
const EscPosBuilder = require('../services/EscPosBuilder');

/**
 * Generate display ticket ESC/POS data
 * @param {Object} order - Order data
 * @param {Array} items - Display items to print
 * @returns {Buffer} ESC/POS command buffer
 */
function displayTemplate(order, items) {
    const builder = new EscPosBuilder();
    const width = 48;

    builder.initialize();

    // =====================
    // HEADER
    // =====================
    builder
        .centerAlign()
        .bold(true)
        .text('🥐 VITRINE 🥐')
        .bold(false)
        .newLine(2);

    // Order number
    const shortOrderNum = getShortOrderNumber(order.order_number);
    builder
        .doubleSize()
        .text(`#${shortOrderNum}`)
        .normalSize()
        .newLine(2);

    // Order type
    const orderType = order.order_type === 'dine_in' ? 'DINE IN' : 'TAKE AWAY';
    const tableInfo = order.table_number ? ` - T${order.table_number}` : '';

    builder
        .text(`${orderType}${tableInfo}`)
        .newLine()
        .text(builder.formatTime(order.created_at || new Date()))
        .newLine()
        .separator('=', width)
        .leftAlign()
        .newLine();

    // =====================
    // ITEMS
    // =====================
    for (const item of items) {
        builder
            .doubleHeight()
            .bold(true)
            .text(`${item.quantity}x ${item.product_name || item.name}`)
            .normalSize()
            .bold(false)
            .newLine();

        if (item.notes) {
            builder
                .text(`   Note: ${item.notes}`)
                .newLine();
        }

        builder.newLine();
    }

    // =====================
    // FOOTER
    // =====================
    builder
        .separator('=', width)
        .centerAlign()
        .text(`${items.length} item${items.length > 1 ? 's' : ''}`)
        .cut();

    return builder.build();
}

/**
 * Extract short order number
 */
function getShortOrderNumber(orderNumber) {
    if (!orderNumber) return '0000';
    const parts = orderNumber.split('-');
    return parts[parts.length - 1] || orderNumber;
}

module.exports = displayTemplate;
