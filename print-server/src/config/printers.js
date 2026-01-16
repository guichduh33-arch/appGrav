/**
 * Printer Configuration
 * Defines all printers and their connection settings
 */

const printerConfig = {
    receipt: {
        name: 'Receipt Printer',
        type: process.env.RECEIPT_PRINTER_TYPE || 'mock',
        // USB config
        vid: parseInt(process.env.RECEIPT_PRINTER_VID, 16) || 0x04b8,
        pid: parseInt(process.env.RECEIPT_PRINTER_PID, 16) || 0x0202,
        // Network config
        ip: process.env.RECEIPT_PRINTER_IP,
        port: parseInt(process.env.RECEIPT_PRINTER_PORT) || 9100,
        // Options
        width: 48, // Characters per line (80mm paper)
        characterSet: 'PC437_USA',
        hasCashDrawer: true,
        autoCut: true
    },

    barista: {
        name: 'Barista Printer',
        type: process.env.BARISTA_PRINTER_TYPE || 'mock',
        ip: process.env.BARISTA_PRINTER_IP || '192.168.1.52',
        port: parseInt(process.env.BARISTA_PRINTER_PORT) || 9100,
        width: 48,
        characterSet: 'PC437_USA',
        hasBuzzer: true,
        autoCut: true
    },

    kitchen: {
        name: 'Kitchen Printer',
        type: process.env.KITCHEN_PRINTER_TYPE || 'mock',
        ip: process.env.KITCHEN_PRINTER_IP || '192.168.1.53',
        port: parseInt(process.env.KITCHEN_PRINTER_PORT) || 9100,
        width: 48,
        characterSet: 'PC437_USA',
        hasBuzzer: true,
        autoCut: true
    },

    display: {
        name: 'Display Printer',
        type: process.env.DISPLAY_PRINTER_TYPE || 'mock',
        ip: process.env.DISPLAY_PRINTER_IP || '192.168.1.54',
        port: parseInt(process.env.DISPLAY_PRINTER_PORT) || 9100,
        width: 48,
        characterSet: 'PC437_USA',
        hasBuzzer: false,
        autoCut: true
    }
};

module.exports = printerConfig;
