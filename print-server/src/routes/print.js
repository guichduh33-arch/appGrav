/**
 * Print Routes
 * Endpoints for printing receipts, tickets, and test prints
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const PrinterService = require('../services/PrinterService');
const EscPosBuilder = require('../services/EscPosBuilder');
const receiptTemplate = require('../templates/receipt');
const kitchenTemplate = require('../templates/kitchen');
const baristaTemplate = require('../templates/barista');
const displayTemplate = require('../templates/display');

const router = express.Router();

// Input validation helpers (SEC-012)
const MAX_STRING_LENGTH = 500;
const MAX_NOTES_LENGTH = 2000;
const MAX_ITEMS = 200;

function sanitizeString(val, maxLen = MAX_STRING_LENGTH) {
    if (typeof val !== 'string') return '';
    return val.substring(0, maxLen);
}

function validateOrder(order) {
    if (!order || typeof order !== 'object') return 'Missing or invalid order data';
    if (order.order_number && typeof order.order_number !== 'string') return 'Invalid order_number';
    return null;
}

function validateItems(items) {
    if (!Array.isArray(items)) return 'items must be an array';
    if (items.length === 0) return 'items cannot be empty';
    if (items.length > MAX_ITEMS) return `items exceeds maximum (${MAX_ITEMS})`;
    for (const item of items) {
        if (!item || typeof item !== 'object') return 'Invalid item in array';
        if (item.name && typeof item.name === 'string' && item.name.length > MAX_STRING_LENGTH) {
            return `Item name exceeds ${MAX_STRING_LENGTH} chars`;
        }
        if (item.notes && typeof item.notes === 'string' && item.notes.length > MAX_NOTES_LENGTH) {
            return `Item notes exceeds ${MAX_NOTES_LENGTH} chars`;
        }
    }
    return null;
}

/**
 * POST /print
 * Generic print endpoint (used by Edge Function)
 */
router.post('/', async (req, res) => {
    const jobId = uuidv4();
    logger.info(`Print job ${jobId}: Generic print request`);

    try {
        const { printer = 'receipt', content, type = 'text' } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                error: 'Missing content'
            });
        }

        // Validate content length (SEC-012)
        if (typeof content === 'string' && content.length > 50000) {
            return res.status(400).json({ success: false, error: 'Content too large' });
        }

        let printData;

        if (type === 'text') {
            // Plain text - convert to ESC/POS
            const builder = new EscPosBuilder();
            builder.initialize();

            const lines = content.split('\n');
            for (const line of lines) {
                builder.text(line).newLine();
            }

            builder.cut();
            printData = builder.build();
        } else if (type === 'raw') {
            // Raw ESC/POS data
            printData = Buffer.from(content, 'base64');
        } else {
            printData = content;
        }

        await PrinterService.print(printer, printData);

        logger.info(`Print job ${jobId} completed`);
        res.json({
            success: true,
            job_id: jobId,
            printer
        });

    } catch (error) {
        logger.error(`Print job ${jobId} failed:`, error);
        res.status(500).json({
            success: false,
            error: error.message,
            job_id: jobId
        });
    }
});

/**
 * POST /print/receipt
 * Print customer receipt
 */
router.post('/receipt', async (req, res) => {
    const jobId = uuidv4();
    logger.info(`Print job ${jobId}: Receipt`);

    try {
        const { order } = req.body;

        const orderErr = validateOrder(order);
        if (orderErr) {
            return res.status(400).json({ success: false, error: orderErr });
        }

        // Build ESC/POS data
        const escPosData = receiptTemplate(order);

        // Send to printer
        await PrinterService.print('receipt', escPosData);

        // Open cash drawer for cash payments
        if (order.payment_method === 'cash' && process.env.ENABLE_CASH_DRAWER === 'true') {
            await PrinterService.openCashDrawer('receipt');
            logger.info(`Cash drawer opened for order ${order.order_number}`);
        }

        logger.info(`Print job ${jobId} completed`);
        res.json({
            success: true,
            job_id: jobId,
            printer: 'receipt'
        });

    } catch (error) {
        logger.error(`Print job ${jobId} failed:`, error);
        res.status(500).json({
            success: false,
            error: error.message,
            job_id: jobId
        });
    }
});

/**
 * POST /print/kitchen
 * Print kitchen ticket
 */
router.post('/kitchen', async (req, res) => {
    const jobId = uuidv4();
    logger.info(`Print job ${jobId}: Kitchen`);

    try {
        const { order, items } = req.body;

        const orderErr = validateOrder(order);
        if (orderErr) {
            return res.status(400).json({ success: false, error: orderErr });
        }
        const itemsErr = validateItems(items);
        if (itemsErr) {
            return res.status(400).json({ success: false, error: itemsErr });
        }

        // Filter kitchen items only
        const kitchenItems = items.filter(item =>
            !item.dispatch_station || item.dispatch_station === 'kitchen'
        );

        if (kitchenItems.length === 0) {
            return res.json({
                success: true,
                job_id: jobId,
                message: 'No kitchen items to print',
                skipped: true
            });
        }

        // Build ESC/POS data
        const escPosData = kitchenTemplate(order, kitchenItems);

        // Send to printer
        await PrinterService.print('kitchen', escPosData);

        logger.info(`Print job ${jobId} completed`);
        res.json({
            success: true,
            job_id: jobId,
            printer: 'kitchen',
            items_count: kitchenItems.length
        });

    } catch (error) {
        logger.error(`Print job ${jobId} failed:`, error);
        res.status(500).json({
            success: false,
            error: error.message,
            job_id: jobId
        });
    }
});

/**
 * POST /print/barista
 * Print barista ticket
 */
router.post('/barista', async (req, res) => {
    const jobId = uuidv4();
    logger.info(`Print job ${jobId}: Barista`);

    try {
        const { order, items } = req.body;

        const orderErr = validateOrder(order);
        if (orderErr) {
            return res.status(400).json({ success: false, error: orderErr });
        }
        const itemsErr = validateItems(items);
        if (itemsErr) {
            return res.status(400).json({ success: false, error: itemsErr });
        }

        // Filter barista items only
        const baristaItems = items.filter(item =>
            item.dispatch_station === 'barista'
        );

        if (baristaItems.length === 0) {
            return res.json({
                success: true,
                job_id: jobId,
                message: 'No barista items to print',
                skipped: true
            });
        }

        // Build ESC/POS data
        const escPosData = baristaTemplate(order, baristaItems);

        // Send to printer
        await PrinterService.print('barista', escPosData);

        logger.info(`Print job ${jobId} completed`);
        res.json({
            success: true,
            job_id: jobId,
            printer: 'barista',
            items_count: baristaItems.length
        });

    } catch (error) {
        logger.error(`Print job ${jobId} failed:`, error);
        res.status(500).json({
            success: false,
            error: error.message,
            job_id: jobId
        });
    }
});

/**
 * POST /print/display
 * Print display case ticket
 */
router.post('/display', async (req, res) => {
    const jobId = uuidv4();
    logger.info(`Print job ${jobId}: Display`);

    try {
        const { order, items } = req.body;

        const orderErr = validateOrder(order);
        if (orderErr) {
            return res.status(400).json({ success: false, error: orderErr });
        }
        const itemsErr = validateItems(items);
        if (itemsErr) {
            return res.status(400).json({ success: false, error: itemsErr });
        }

        // Filter display items only
        const displayItems = items.filter(item =>
            item.dispatch_station === 'display'
        );

        if (displayItems.length === 0) {
            return res.json({
                success: true,
                job_id: jobId,
                message: 'No display items to print',
                skipped: true
            });
        }

        // Build ESC/POS data
        const escPosData = displayTemplate(order, displayItems);

        // Send to printer
        await PrinterService.print('display', escPosData);

        logger.info(`Print job ${jobId} completed`);
        res.json({
            success: true,
            job_id: jobId,
            printer: 'display',
            items_count: displayItems.length
        });

    } catch (error) {
        logger.error(`Print job ${jobId} failed:`, error);
        res.status(500).json({
            success: false,
            error: error.message,
            job_id: jobId
        });
    }
});

/**
 * POST /print/test
 * Test print to verify printer connectivity
 */
router.post('/test', async (req, res) => {
    const jobId = uuidv4();
    const { printer = 'receipt' } = req.body;

    logger.info(`Test print to ${printer}`);

    try {
        const builder = new EscPosBuilder();
        const testData = builder
            .initialize()
            .centerAlign()
            .doubleSize()
            .bold(true)
            .text('*** TEST PRINT ***')
            .bold(false)
            .normalSize()
            .newLine(2)
            .text('The Breakery Print Server')
            .newLine()
            .text(new Date().toLocaleString('id-ID'))
            .newLine(2)
            .text(`Printer: ${printer}`)
            .newLine()
            .text(`Job ID: ${jobId.substring(0, 8)}...`)
            .newLine(2)
            .separator('-', 32)
            .text('If you see this, printing works!')
            .cut()
            .build();

        await PrinterService.print(printer, testData);

        res.json({
            success: true,
            job_id: jobId,
            printer,
            message: 'Test print sent successfully'
        });

    } catch (error) {
        logger.error(`Test print failed:`, error);
        res.status(500).json({
            success: false,
            error: error.message,
            printer
        });
    }
});

module.exports = router;
