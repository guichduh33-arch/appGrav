/**
 * Winston Logger Configuration
 */
const winston = require('winston');
const path = require('path');

const logDir = process.env.LOG_DIR || './logs';
const logLevel = process.env.LOG_LEVEL || 'info';

// Custom format for console
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${timestamp} ${level}: ${message} ${metaStr}`;
    })
);

// Custom format for files
const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create transports array
const transports = [
    // Console output
    new winston.transports.Console({
        format: consoleFormat,
        level: logLevel
    })
];

// Add file transports only if not in test mode
if (process.env.NODE_ENV !== 'test') {
    try {
        const DailyRotateFile = require('winston-daily-rotate-file');

        // Daily rotating file for all logs
        transports.push(
            new DailyRotateFile({
                dirname: logDir,
                filename: 'print-server-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxSize: '20m',
                maxFiles: '14d',
                format: fileFormat
            })
        );

        // Separate file for errors
        transports.push(
            new DailyRotateFile({
                dirname: logDir,
                filename: 'errors-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                level: 'error',
                maxSize: '20m',
                maxFiles: '30d',
                format: fileFormat
            })
        );
    } catch (err) {
        // DailyRotateFile not available, use basic file transport
        transports.push(
            new winston.transports.File({
                filename: path.join(logDir, 'print-server.log'),
                format: fileFormat
            })
        );
    }
}

const logger = winston.createLogger({
    level: logLevel,
    transports
});

module.exports = logger;
