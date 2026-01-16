/**
 * Receipt Template
 * Full customer receipt with all order details
 */
const EscPosBuilder = require('../services/EscPosBuilder');

/**
 * Generate receipt ESC/POS data
 * @param {Object} order - Order data
 * @returns {Buffer} ESC/POS command buffer
 */
function receiptTemplate(order) {
    const builder = new EscPosBuilder();
    const width = 48;

    builder.initialize();

    // =====================
    // HEADER
    // =====================
    builder
        .centerAlign()
        .doubleSize()
        .bold(true)
        .text('THE BREAKERY')
        .bold(false)
        .normalSize()
        .newLine()
        .text('French Bakery & Coffee')
        .newLine()
        .text('Lombok, Indonesia')
        .newLine(2);

    // =====================
    // ORDER INFO
    // =====================
    builder
        .leftAlign()
        .separator('=', width)
        .bold(true)
        .text(`Order: ${order.order_number}`)
        .bold(false)
        .newLine()
        .text(`Date: ${builder.formatDateTime(order.created_at)}`)
        .newLine()
        .text(`Type: ${formatOrderType(order.order_type)}`)
        .newLine();

    if (order.table_number) {
        builder.text(`Table: ${order.table_number}`).newLine();
    }

    if (order.customer_name) {
        builder.text(`Customer: ${order.customer_name}`).newLine();
    }

    builder
        .text(`Staff: ${order.staff_name || 'POS'}`)
        .newLine()
        .separator('=', width)
        .newLine();

    // =====================
    // ITEMS
    // =====================
    const items = order.items || [];

    for (const item of items) {
        // Product name with quantity
        builder
            .bold(true)
            .text(`${item.quantity}x ${item.product_name || item.name}`)
            .bold(false)
            .newLine();

        // Modifiers
        const modifiers = item.modifiers || [];
        for (const mod of modifiers) {
            const modLabel = mod.option || mod.label || mod;
            const modPrice = mod.price || 0;

            if (modPrice > 0) {
                builder.text(`   + ${modLabel} (+${builder.formatCurrency(modPrice)})`).newLine();
            } else {
                builder.text(`   + ${modLabel}`).newLine();
            }
        }

        // Notes
        if (item.notes) {
            builder.text(`   Note: ${item.notes}`).newLine();
        }

        // Price aligned right
        const itemTotal = item.total_price || (item.unit_price * item.quantity);
        builder
            .rightAlign()
            .text(builder.formatCurrency(itemTotal))
            .leftAlign()
            .newLine(2);
    }

    // =====================
    // TOTALS
    // =====================
    builder.separator('-', width);

    builder.line('Subtotal', builder.formatCurrency(order.subtotal), width);

    if (order.discount_amount && order.discount_amount > 0) {
        const discountLabel = order.discount_type === 'percentage'
            ? `Discount (${order.discount_value}%)`
            : 'Discount';
        builder.line(discountLabel, `-${builder.formatCurrency(order.discount_amount)}`, width);
    }

    if (order.points_used && order.points_used > 0) {
        builder.line(`Points (${order.points_used} pts)`, `-${builder.formatCurrency(order.points_discount || 0)}`, width);
    }

    const taxRate = order.tax_rate || 11;
    builder.line(`Tax (${taxRate}%)`, builder.formatCurrency(order.tax_amount || 0), width);

    builder.separator('-', width);

    // Total - emphasized
    builder
        .bold(true)
        .doubleHeight()
        .line('TOTAL', builder.formatCurrency(order.total), width)
        .normalSize()
        .bold(false)
        .newLine();

    // =====================
    // PAYMENT
    // =====================
    builder.separator('-', width);

    const paymentMethod = (order.payment_method || 'cash').toUpperCase();

    if (order.payment_method === 'cash') {
        builder
            .line('Payment', paymentMethod, width)
            .line('Cash', builder.formatCurrency(order.cash_received || order.total), width)
            .line('Change', builder.formatCurrency(order.change_given || 0), width);
    } else if (order.payment_method === 'card') {
        builder.line('Card Payment', builder.formatCurrency(order.total), width);
    } else if (order.payment_method === 'qris') {
        builder.line('QRIS Payment', builder.formatCurrency(order.total), width);
    } else {
        builder.line('Payment', `${paymentMethod} ${builder.formatCurrency(order.total)}`, width);
    }

    // =====================
    // LOYALTY
    // =====================
    if (order.points_earned && order.points_earned > 0) {
        builder
            .newLine()
            .centerAlign()
            .text(`🎉 You earned ${order.points_earned} loyalty points!`)
            .leftAlign()
            .newLine();
    }

    // =====================
    // FOOTER
    // =====================
    builder
        .newLine()
        .centerAlign()
        .separator('=', width)
        .newLine()
        .text('Merci de votre visite!')
        .newLine()
        .text('See you soon!')
        .newLine(2)
        .text('www.thebreakery.com')
        .newLine()
        .text('@thebreakery.lombok')
        .newLine()
        .cut();

    return builder.build();
}

/**
 * Format order type for display
 */
function formatOrderType(type) {
    switch (type) {
        case 'dine_in':
            return 'Dine In';
        case 'take_away':
        case 'takeaway':
            return 'Take Away';
        case 'delivery':
            return 'Delivery';
        default:
            return type || 'Unknown';
    }
}

module.exports = receiptTemplate;
