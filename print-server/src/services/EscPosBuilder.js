/**
 * ESC/POS Command Builder
 * Fluent interface for building thermal printer commands
 */
class EscPosBuilder {
    constructor() {
        this.buffer = [];
    }

    // =============================
    // INITIALIZATION
    // =============================

    initialize() {
        // ESC @ - Initialize printer
        this.buffer.push(0x1B, 0x40);
        return this;
    }

    // =============================
    // TEXT OUTPUT
    // =============================

    text(content) {
        const bytes = Buffer.from(content, 'utf8');
        this.buffer.push(...bytes);
        return this;
    }

    newLine(count = 1) {
        for (let i = 0; i < count; i++) {
            this.buffer.push(0x0A); // LF
        }
        return this;
    }

    // =============================
    // ALIGNMENT
    // =============================

    leftAlign() {
        // ESC a 0
        this.buffer.push(0x1B, 0x61, 0x00);
        return this;
    }

    centerAlign() {
        // ESC a 1
        this.buffer.push(0x1B, 0x61, 0x01);
        return this;
    }

    rightAlign() {
        // ESC a 2
        this.buffer.push(0x1B, 0x61, 0x02);
        return this;
    }

    // =============================
    // TEXT STYLE
    // =============================

    bold(enabled = true) {
        // ESC E n
        this.buffer.push(0x1B, 0x45, enabled ? 0x01 : 0x00);
        return this;
    }

    underline(enabled = true) {
        // ESC - n
        this.buffer.push(0x1B, 0x2D, enabled ? 0x01 : 0x00);
        return this;
    }

    inverse(enabled = true) {
        // GS B n
        this.buffer.push(0x1D, 0x42, enabled ? 0x01 : 0x00);
        return this;
    }

    // =============================
    // TEXT SIZE
    // =============================

    doubleHeight() {
        // ESC ! 16
        this.buffer.push(0x1B, 0x21, 0x10);
        return this;
    }

    doubleWidth() {
        // ESC ! 32
        this.buffer.push(0x1B, 0x21, 0x20);
        return this;
    }

    doubleSize() {
        // ESC ! 48 (both height and width)
        this.buffer.push(0x1B, 0x21, 0x30);
        return this;
    }

    normalSize() {
        // ESC ! 0
        this.buffer.push(0x1B, 0x21, 0x00);
        return this;
    }

    // =============================
    // PAPER CONTROL
    // =============================

    cut(partial = false) {
        // Feed paper before cut
        this.newLine(3);
        // GS V n
        this.buffer.push(0x1D, 0x56, partial ? 0x01 : 0x00);
        return this;
    }

    feed(lines = 1) {
        // ESC d n
        this.buffer.push(0x1B, 0x64, lines);
        return this;
    }

    // =============================
    // CASH DRAWER
    // =============================

    openCashDrawer(pin = 0) {
        // ESC p m t1 t2
        // pin: 0 = drawer 1, 1 = drawer 2
        // t1: pulse ON time (× 2ms) = 25 → 50ms
        // t2: pulse OFF time (× 2ms) = 250 → 500ms
        this.buffer.push(0x1B, 0x70, pin, 0x19, 0xFA);
        return this;
    }

    // =============================
    // BUZZER / BEEPER
    // =============================

    buzzer(count = 3, duration = 2) {
        // ESC B n t (Epson specific)
        // n = number of buzzes (1-9)
        // t = duration (1-9, × 100ms)
        this.buffer.push(0x1B, 0x42, count, duration);
        return this;
    }

    // =============================
    // HELPER METHODS
    // =============================

    separator(char = '-', width = 48) {
        this.text(char.repeat(width));
        this.newLine();
        return this;
    }

    /**
     * Print a line with left and right aligned text
     */
    line(left, right, width = 48) {
        const rightStr = String(right);
        const leftStr = String(left);
        const spaces = width - leftStr.length - rightStr.length;
        const paddedLine = leftStr + ' '.repeat(Math.max(1, spaces)) + rightStr;
        this.text(paddedLine);
        this.newLine();
        return this;
    }

    /**
     * Print item with quantity and price
     */
    itemLine(name, quantity, price, width = 48) {
        const qtyStr = `${quantity}x `;
        const priceStr = this.formatCurrency(price);
        const availableWidth = width - qtyStr.length - priceStr.length - 1;

        let displayName = name;
        if (name.length > availableWidth) {
            displayName = name.substring(0, availableWidth - 3) + '...';
        }

        const spaces = width - qtyStr.length - displayName.length - priceStr.length;
        this.text(qtyStr + displayName + ' '.repeat(Math.max(1, spaces)) + priceStr);
        this.newLine();
        return this;
    }

    /**
     * Print columns with specified widths
     */
    columns(cols, widths) {
        let line = '';
        cols.forEach((col, i) => {
            const width = widths[i] || 10;
            const text = String(col);
            if (i === cols.length - 1) {
                // Last column right-aligned
                line += text.padStart(width);
            } else {
                line += text.padEnd(width);
            }
        });
        this.text(line);
        this.newLine();
        return this;
    }

    // =============================
    // FORMATTING HELPERS
    // =============================

    formatCurrency(amount) {
        return 'Rp ' + Number(amount).toLocaleString('id-ID');
    }

    formatDateTime(date) {
        return new Date(date).toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatTime(date) {
        return new Date(date).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // =============================
    // QR CODE (Epson)
    // =============================

    qrCode(data, size = 4) {
        // Model
        this.buffer.push(0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);
        // Size (1-16)
        this.buffer.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, size);
        // Error correction (48 = L, 49 = M, 50 = Q, 51 = H)
        this.buffer.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31);

        // Store data
        const dataBytes = Buffer.from(data, 'utf8');
        const len = dataBytes.length + 3;
        this.buffer.push(0x1D, 0x28, 0x6B, len & 0xFF, (len >> 8) & 0xFF, 0x31, 0x50, 0x30);
        this.buffer.push(...dataBytes);

        // Print QR code
        this.buffer.push(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30);
        return this;
    }

    // =============================
    // OUTPUT
    // =============================

    build() {
        return Buffer.from(this.buffer);
    }

    buildHex() {
        return Buffer.from(this.buffer).toString('hex');
    }

    /**
     * Get human-readable representation (for debugging/mock printing)
     */
    toText() {
        // Simple text extraction - strips control codes
        let text = '';
        let i = 0;
        while (i < this.buffer.length) {
            const byte = this.buffer[i];

            // Skip ESC sequences
            if (byte === 0x1B) {
                i += 2; // Skip ESC + command byte
                // Some commands have additional bytes
                if (this.buffer[i - 1] === 0x21 ||
                    this.buffer[i - 1] === 0x45 ||
                    this.buffer[i - 1] === 0x2D ||
                    this.buffer[i - 1] === 0x61 ||
                    this.buffer[i - 1] === 0x64) {
                    i++; // Skip parameter byte
                } else if (this.buffer[i - 1] === 0x70 || this.buffer[i - 1] === 0x42) {
                    i += 2; // Skip 2 parameter bytes
                }
                continue;
            }

            // Skip GS sequences
            if (byte === 0x1D) {
                i += 2;
                if (this.buffer[i - 1] === 0x42) {
                    i++; // GS B n
                }
                continue;
            }

            // Line feed
            if (byte === 0x0A) {
                text += '\n';
                i++;
                continue;
            }

            // Regular printable character
            if (byte >= 0x20 && byte <= 0x7E) {
                text += String.fromCharCode(byte);
            }
            i++;
        }
        return text;
    }

    /**
     * Reset the buffer
     */
    reset() {
        this.buffer = [];
        return this;
    }
}

module.exports = EscPosBuilder;
