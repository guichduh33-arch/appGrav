/**
 * Production-safe logging utility
 * Only logs in development mode to avoid leaking sensitive data
 */

const isDevelopment = import.meta.env.DEV

/**
 * Debug log - only in development
 */
export function logDebug(message: string, ...args: unknown[]): void {
    if (isDevelopment) {
        console.log(`[DEBUG] ${message}`, ...args)
    }
}

/**
 * Info log - only in development
 */
export function logInfo(message: string, ...args: unknown[]): void {
    if (isDevelopment) {
        console.info(`[INFO] ${message}`, ...args)
    }
}

/**
 * Warning log - in development and production
 */
export function logWarn(message: string, ...args: unknown[]): void {
    console.warn(`[WARN] ${message}`, ...args)
}

/**
 * Error log - in development and production
 * Never log sensitive data in error messages
 */
export function logError(message: string, error?: unknown): void {
    // In production, only log the message, not the full error details
    if (isDevelopment) {
        console.error(`[ERROR] ${message}`, error)
    } else {
        console.error(`[ERROR] ${message}`)
        // Optionally send to error tracking service here
    }
}

/**
 * Group logs - only in development
 */
export function logGroup(label: string, fn: () => void): void {
    if (isDevelopment) {
        console.group(label)
        fn()
        console.groupEnd()
    }
}

// Default export for convenience
const logger = {
    debug: logDebug,
    info: logInfo,
    warn: logWarn,
    error: logError,
    group: logGroup,
}

export default logger
