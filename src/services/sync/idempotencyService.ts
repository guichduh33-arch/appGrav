/**
 * Idempotency Service
 * Sprint 3 - Offline Improvements
 *
 * Prevents duplicate sync operations on retry by tracking
 * idempotency keys in the Supabase idempotency_keys table.
 */

import { supabase } from '@/lib/supabase';
import logger from '@/utils/logger';

/**
 * Generate a deterministic idempotency key from entity details.
 * Format: {entityType}:{entityId}:{operation}
 */
export function generateKey(
  entityType: string,
  entityId: string,
  operation: string
): string {
  return `${entityType}:${entityId}:${operation}`;
}

/**
 * Check if an idempotency key already exists (i.e., operation already completed).
 * Returns true if the key exists and the operation was successful.
 */
export async function checkKey(key: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('idempotency_keys')
      .select('key, response_status')
      .eq('key', key)
      .single();

    if (error || !data) return false;

    return data.response_status === 'success';
  } catch {
    // If we can't check (e.g., network error), assume not duplicate
    return false;
  }
}

/**
 * Register an idempotency key after successful operation.
 */
export async function registerKey(
  key: string,
  entityType: string,
  entityId: string
): Promise<void> {
  try {
    await supabase.from('idempotency_keys').upsert({
      key,
      entity_type: entityType,
      entity_id: entityId,
      response_status: 'success',
    });
  } catch (error) {
    // Non-fatal: log and continue
    logger.debug(`[Idempotency] Failed to register key ${key}: ${error}`);
  }
}

/**
 * Wrap an async function with idempotency protection.
 * If the key already exists, skips execution and returns { skipped: true }.
 * Otherwise, executes the function and registers the key on success.
 */
export async function wrapWithIdempotency<T>(
  key: string,
  entityType: string,
  entityId: string,
  fn: () => Promise<T>
): Promise<{ result?: T; skipped: boolean }> {
  // Check if already completed
  const exists = await checkKey(key);
  if (exists) {
    logger.debug(`[Idempotency] Skipping duplicate operation: ${key}`);
    return { skipped: true };
  }

  // Execute the operation
  const result = await fn();

  // Register the key on success
  await registerKey(key, entityType, entityId);

  return { result, skipped: false };
}

export const idempotencyService = {
  generateKey,
  checkKey,
  registerKey,
  wrapWithIdempotency,
};
