/**
 * Offline Auth Types
 *
 * Type definitions for offline authentication including:
 * - User credential caching (Story 1.1)
 * - PIN verification (Story 1.2)
 * - Rate limiting
 *
 * @see _bmad-output/planning-artifacts/architecture.md#Naming-Patterns
 */

import type { Role, EffectivePermission } from '../auth';

// =====================================================
// User Cache Types (Story 1.1)
// =====================================================

/**
 * Cached user data for offline PIN authentication
 *
 * Stored in Dexie table: offline_users
 * TTL: 24 hours from cached_at
 *
 * @see ADR-004: PIN Verification Offline
 * @see ADR-005: Permissions Offline
 */
export interface IOfflineUser {
  /** User UUID (primary key) */
  id: string;

  /** Bcrypt hash from server - NEVER store plaintext PIN */
  pin_hash: string;

  /** Cached user roles for permission checks */
  roles: Role[];

  /** Cached effective permissions with is_granted flags */
  permissions: EffectivePermission[];

  /** Display name for UI (nullable) */
  display_name: string | null;

  /** User's preferred language */
  preferred_language: 'fr' | 'en' | 'id';

  /** ISO 8601 timestamp of when data was cached */
  cached_at: string;
}

// =====================================================
// Offline Auth Types (Story 1.2)
// =====================================================

/**
 * Error codes for offline authentication
 * Used to return generic errors without revealing cache state
 */
export type TOfflineAuthError =
  | 'INVALID_PIN'       // PIN verification failed (also used for cache miss - security)
  | 'CACHE_EXPIRED'     // Cache older than 24h - online login required
  | 'RATE_LIMITED';     // Too many failed attempts

/**
 * Rate limit entry persisted in IndexedDB
 * Prevents brute-force PIN attacks across page refreshes
 *
 * Stored in Dexie table: offline_rate_limits
 *
 * @see Story 1.2: 3 attempts per 15 minutes
 */
export interface IOfflineRateLimit {
  /** User UUID (primary key) */
  id: string;

  /** Number of consecutive failed attempts */
  attempts: number;

  /** ISO 8601 timestamp of last failed attempt */
  last_attempt: string;
}

/**
 * Result of offline PIN verification
 * @see offlineAuthService.verifyPinOffline()
 */
export interface IOfflineAuthResult {
  /** Whether authentication succeeded */
  success: boolean;

  /** Error code if authentication failed */
  error?: TOfflineAuthError;

  /** Cached user data if authentication succeeded */
  user?: IOfflineUser;

  /** Seconds to wait if rate limited */
  waitSeconds?: number;
}

/** Cache TTL for offline user credentials (24 hours in ms) */
export const OFFLINE_USER_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
