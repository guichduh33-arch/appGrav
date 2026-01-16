/**
 * Cash Drawer Routes
 * Endpoints for cash drawer control
 */
const express = require('express');
const logger = require('../utils/logger');
const PrinterService = require('../services/PrinterService');

const router = express.Router();

/**
 * POST /drawer/open
 * Open the cash drawer
 */
router.post('/open', async (req, res) => {
    logger.info('Cash drawer open request');

    try {
        const { printer = 'receipt' } = req.body;

        await PrinterService.openCashDrawer(printer);

        logger.info('Cash drawer opened');
        res.json({
            success: true,
            message: 'Cash drawer opened'
        });

    } catch (error) {
        logger.error('Failed to open cash drawer:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
