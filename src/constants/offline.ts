/**
 * Offline mode constants
 * Used for local storage, sync queue management, and retry strategies
 */
export const OFFLINE_CONSTANTS = {
  /**
   * IndexedDB database name for offline storage
   */
  STORAGE_NAME: 'AppGravOffline',

  /**
   * Maximum number of items in sync queue
   * NFR-R4: 500 transactions minimum storage capacity
   */
  MAX_QUEUE_SIZE: 500,

  /**
   * Exponential backoff delays for sync retries (in milliseconds)
   * 5s → 10s → 30s → 1min → 5min
   */
  SYNC_RETRY_DELAYS: [5000, 10000, 30000, 60000, 300000],

  /**
   * Maximum number of sync attempts before marking as failed
   */
  MAX_SYNC_ATTEMPTS: 5,
} as const;
