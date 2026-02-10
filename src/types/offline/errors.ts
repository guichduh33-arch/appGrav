/**
 * Offline Error Types
 *
 * Type definitions for offline error handling
 *
 * @see _bmad-output/planning-artifacts/architecture.md#Naming-Patterns
 */

// =====================================================
// Error Types
// =====================================================

/**
 * Error codes for offline operations
 * Used with OfflineError class
 */
export type TOfflineErrorCode =
  | 'SYNC_FAILED'       // Server sync operation failed
  | 'QUEUE_FULL'        // Sync queue reached capacity
  | 'STORAGE_FULL'      // IndexedDB quota exceeded
  | 'CONFLICT'          // Data conflict detected during sync
  | 'AUTH_EXPIRED'      // Offline session expired (24h TTL)
  | 'LAN_UNREACHABLE'   // LAN hub not reachable
  | 'CACHE_MISS';       // Requested data not in offline cache

/**
 * Custom error class for offline operations
 * Includes recovery hints and error codes
 */
export class OfflineError extends Error {
  constructor(
    message: string,
    public code: TOfflineErrorCode,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'OfflineError';
  }
}
