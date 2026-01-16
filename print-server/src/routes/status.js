/**
 * Status Routes
 * Endpoints for checking printer status
 */
const express = require('express');
const PrinterService = require('../services/PrinterService');
const printerConfig = require('../config/printers');

const router = express.Router();

/**
 * GET /status
 * Get status of all printers
 */
router.get('/', async (req, res) => {
    const printerStatuses = await PrinterService.getAllStatus();

    const allOnline = Object.values(printerStatuses)
        .every(s => s.status === 'online');

    res.json({
        server: {
            status: 'online',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        },
        printers: printerStatuses,
        healthy: allOnline
    });
});

/**
 * GET /status/:printer
 * Get status of specific printer
 */
router.get('/:printer', async (req, res) => {
    const { printer } = req.params;

    if (!printerConfig[printer]) {
        return res.status(404).json({
            success: false,
            error: `Printer "${printer}" not found`,
            available: Object.keys(printerConfig)
        });
    }

    const status = await PrinterService.getStatus(printer);
    res.json(status);
});

module.exports = router;
