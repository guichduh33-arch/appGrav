/**
 * The Breakery Print Server
 * Node.js server for thermal printer communication
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const logger = require('./utils/logger');
const printRoutes = require('./routes/print');
const statusRoutes = require('./routes/status');
const drawerRoutes = require('./routes/drawer');
const PrinterService = require('./services/PrinterService');

const app = express();
const server = createServer(app);

// =====================
// MIDDLEWARE
// =====================

// CORS - allow all origins for local network access
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON body parsing
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use((req, res, next) => {
    if (req.url !== '/health') {
        logger.info(`${req.method} ${req.url}`, {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
    }
    next();
});

// =====================
// ROUTES
// =====================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'breakery-print-server',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Mount routers
app.use('/print', printRoutes);
app.use('/status', statusRoutes);
app.use('/drawer', drawerRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        service: 'The Breakery Print Server',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            status: 'GET /status',
            print: 'POST /print',
            printReceipt: 'POST /print/receipt',
            printKitchen: 'POST /print/kitchen',
            printBarista: 'POST /print/barista',
            printDisplay: 'POST /print/display',
            printTest: 'POST /print/test',
            drawerOpen: 'POST /drawer/open'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found',
        path: req.url
    });
});

// Error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// =====================
// SERVER START
// =====================

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, async () => {
    logger.info('═'.repeat(50));
    logger.info('  THE BREAKERY PRINT SERVER');
    logger.info('═'.repeat(50));
    logger.info(`  URL: http://${HOST}:${PORT}`);
    logger.info(`  ENV: ${process.env.NODE_ENV || 'development'}`);
    logger.info('═'.repeat(50));

    // Initialize printers
    try {
        await PrinterService.initialize();
        logger.info('All printers initialized');
    } catch (error) {
        logger.error('Failed to initialize printers:', error);
    }
});

// =====================
// GRACEFUL SHUTDOWN
// =====================

const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down gracefully...`);

    await PrinterService.cleanup();

    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });

    // Force exit after 10s
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app; // For testing
