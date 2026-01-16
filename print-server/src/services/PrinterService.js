/**
 * Printer Service
 * Manages connections and sending data to printers
 */
const net = require('net');
const logger = require('../utils/logger');
const printerConfig = require('../config/printers');
const EscPosBuilder = require('./EscPosBuilder');

class PrinterService {
    constructor() {
        this.printers = {};
        this.usbConnections = {};
    }

    /**
     * Initialize all configured printers
     */
    async initialize() {
        logger.info('Initializing printers...');

        for (const [key, config] of Object.entries(printerConfig)) {
            try {
                if (config.type === 'mock') {
                    this.printers[key] = { ...config, status: 'online' };
                    logger.info(`Printer "${config.name}" initialized (mock mode)`);
                } else if (config.type === 'usb') {
                    await this.initializeUSB(key, config);
                    this.printers[key] = { ...config, status: 'online' };
                    logger.info(`Printer "${config.name}" initialized (USB)`);
                } else if (config.type === 'network') {
                    const online = await this.testNetworkConnection(key, config);
                    this.printers[key] = { ...config, status: online ? 'online' : 'offline' };
                    logger.info(`Printer "${config.name}" initialized (network: ${online ? 'online' : 'offline'})`);
                }
            } catch (error) {
                this.printers[key] = { ...config, status: 'error', error: error.message };
                logger.error(`Failed to initialize printer "${config.name}":`, error.message);
            }
        }

        return this.printers;
    }

    /**
     * Initialize USB printer
     */
    async initializeUSB(key, config) {
        try {
            // Try to load USB module
            const usb = require('usb');
            const device = usb.findByIds(config.vid, config.pid);

            if (!device) {
                throw new Error(`USB device not found (VID: 0x${config.vid.toString(16)}, PID: 0x${config.pid.toString(16)})`);
            }

            device.open();
            this.usbConnections[key] = device;
            return true;
        } catch (error) {
            if (error.code === 'MODULE_NOT_FOUND') {
                logger.warn(`USB module not installed. Install 'usb' package for USB printer support.`);
                throw new Error('USB module not available');
            }
            throw error;
        }
    }

    /**
     * Test network printer connection
     */
    async testNetworkConnection(key, config) {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            const timeout = setTimeout(() => {
                socket.destroy();
                resolve(false);
            }, 3000);

            socket.connect(config.port, config.ip, () => {
                clearTimeout(timeout);
                socket.destroy();
                resolve(true);
            });

            socket.on('error', () => {
                clearTimeout(timeout);
                resolve(false);
            });
        });
    }

    /**
     * Print data to specified printer
     */
    async print(printerKey, data) {
        const printer = this.printers[printerKey];

        if (!printer) {
            throw new Error(`Printer "${printerKey}" not configured`);
        }

        const config = printerConfig[printerKey];
        logger.info(`Printing to ${config.name}...`);

        if (config.type === 'mock') {
            return this.printMock(printerKey, data);
        } else if (config.type === 'network') {
            return this.printNetwork(config, data);
        } else if (config.type === 'usb') {
            return this.printUSB(printerKey, data);
        } else {
            throw new Error(`Unknown printer type: ${config.type}`);
        }
    }

    /**
     * Mock print - logs output for development
     */
    printMock(printerKey, data) {
        const config = printerConfig[printerKey];

        // Convert buffer to readable text for logging
        let textContent = '';
        if (Buffer.isBuffer(data)) {
            // Try to extract readable text
            const builder = new EscPosBuilder();
            builder.buffer = [...data];
            textContent = builder.toText();
        } else if (typeof data === 'string') {
            textContent = data;
        }

        logger.info(`[MOCK PRINT: ${config.name}]`);
        logger.debug('Print content:\n' + textContent);

        return {
            success: true,
            mock: true,
            printer: config.name,
            contentLength: data.length
        };
    }

    /**
     * Print to network printer via TCP
     */
    async printNetwork(config, data) {
        return new Promise((resolve, reject) => {
            const socket = new net.Socket();
            const timeout = setTimeout(() => {
                socket.destroy();
                reject(new Error(`Print timeout to ${config.ip}:${config.port}`));
            }, 10000);

            socket.connect(config.port, config.ip, () => {
                const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

                socket.write(buffer, (err) => {
                    clearTimeout(timeout);
                    socket.end();

                    if (err) {
                        reject(err);
                    } else {
                        resolve({ success: true, printer: config.name });
                    }
                });
            });

            socket.on('error', (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });
    }

    /**
     * Print to USB printer
     */
    async printUSB(printerKey, data) {
        const device = this.usbConnections[printerKey];
        const config = printerConfig[printerKey];

        if (!device) {
            throw new Error(`USB device not connected for "${printerKey}"`);
        }

        return new Promise((resolve, reject) => {
            try {
                const iface = device.interface(0);

                if (iface.isKernelDriverActive()) {
                    iface.detachKernelDriver();
                }

                iface.claim();
                const endpoint = iface.endpoint(0x01); // OUT endpoint

                const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

                endpoint.transfer(buffer, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ success: true, printer: config.name });
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Open cash drawer (via receipt printer)
     */
    async openCashDrawer(printerKey = 'receipt') {
        logger.info('Opening cash drawer...');

        const builder = new EscPosBuilder();
        const data = builder
            .initialize()
            .openCashDrawer()
            .build();

        return this.print(printerKey, data);
    }

    /**
     * Get status of a specific printer
     */
    async getStatus(printerKey) {
        const config = printerConfig[printerKey];

        if (!config) {
            return { status: 'not_configured', printer: printerKey };
        }

        try {
            if (config.type === 'mock') {
                return {
                    status: 'online',
                    printer: config.name,
                    type: 'mock',
                    message: 'Mock printer (no hardware)'
                };
            } else if (config.type === 'network') {
                const online = await this.testNetworkConnection(printerKey, config);
                return {
                    status: online ? 'online' : 'offline',
                    printer: config.name,
                    type: 'network',
                    ip: config.ip,
                    port: config.port
                };
            } else if (config.type === 'usb') {
                const connected = !!this.usbConnections[printerKey];
                return {
                    status: connected ? 'online' : 'offline',
                    printer: config.name,
                    type: 'usb',
                    vid: `0x${config.vid.toString(16)}`,
                    pid: `0x${config.pid.toString(16)}`
                };
            }
        } catch (error) {
            return {
                status: 'error',
                printer: config.name,
                error: error.message
            };
        }
    }

    /**
     * Get status of all printers
     */
    async getAllStatus() {
        const statuses = {};

        for (const key of Object.keys(printerConfig)) {
            statuses[key] = await this.getStatus(key);
        }

        return statuses;
    }

    /**
     * Cleanup connections on shutdown
     */
    async cleanup() {
        logger.info('Cleaning up printer connections...');

        for (const [key, device] of Object.entries(this.usbConnections)) {
            try {
                if (device && device.close) {
                    device.close();
                }
                logger.info(`Closed USB connection: ${key}`);
            } catch (error) {
                logger.error(`Error closing ${key}:`, error.message);
            }
        }

        this.usbConnections = {};
    }
}

// Export singleton instance
module.exports = new PrinterService();
