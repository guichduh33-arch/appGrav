/**
 * Production Reminder Service
 *
 * Manages production reminders for offline mode.
 * When production recording is unavailable (offline), users can save
 * their intended production as reminders to complete later when online.
 *
 * Uses localStorage (not IndexedDB) because:
 * - Simple key-value storage
 * - Expected < 10 reminders at any time
 * - No complex queries needed
 *
 * @see Story 2.5: Production Records (Online-Only with Deferred Sync)
 */

import type {
  IProductionReminder,
  IProductionReminderItem,
} from '@/types/offline';
import { PRODUCTION_REMINDERS_STORAGE_KEY } from '@/types/offline';
import { logError, logDebug, logWarn } from '@/utils/logger'

/** TTL for production reminders (7 days in ms) */
const REMINDER_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Save a production reminder to localStorage
 *
 * @param items Production items to save
 * @param sectionId Section UUID
 * @param sectionName Section name for display
 * @param productionDate Intended production date
 * @param note Optional user note
 * @returns UUID of the created reminder
 */
export function saveProductionReminder(
  items: IProductionReminderItem[],
  sectionId: string,
  sectionName: string,
  productionDate: Date,
  note?: string
): string {
  const reminders = getProductionReminders();
  const id = crypto.randomUUID();

  const reminder: IProductionReminder = {
    id,
    sectionId,
    sectionName,
    productionDate: productionDate.toISOString(),
    items: items.map((item) => ({ ...item })),
    createdAt: new Date().toISOString(),
    note,
  };

  reminders.push(reminder);
  try {
    localStorage.setItem(
      PRODUCTION_REMINDERS_STORAGE_KEY,
      JSON.stringify(reminders)
    );
  } catch {
    // localStorage unavailable (Safari private mode, quota exceeded)
    logWarn('[ProductionReminder] Failed to save reminder to localStorage');
  }

  logDebug('[ProductionReminder] Saved reminder:', id);
  return id;
}

/**
 * Get all production reminders from localStorage
 *
 * Automatically filters out expired reminders (older than 7 days)
 * and updates localStorage to remove them.
 *
 * @returns Array of valid (non-expired) production reminders, empty if none
 */
export function getProductionReminders(): IProductionReminder[] {
  try {
    const data = localStorage.getItem(PRODUCTION_REMINDERS_STORAGE_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      logWarn('[ProductionReminder] Invalid data format, returning empty');
      return [];
    }

    // Filter out expired reminders (older than REMINDER_TTL_MS)
    const now = Date.now();
    const validReminders = parsed.filter((r: IProductionReminder) => {
      const createdTime = new Date(r.createdAt).getTime();
      return now - createdTime < REMINDER_TTL_MS;
    });

    // Update storage if any were removed
    if (validReminders.length !== parsed.length) {
      const removedCount = parsed.length - validReminders.length;
      logDebug(`[ProductionReminder] Auto-removed ${removedCount} expired reminder(s)`);
      localStorage.setItem(
        PRODUCTION_REMINDERS_STORAGE_KEY,
        JSON.stringify(validReminders)
      );
    }

    return validReminders;
  } catch (error) {
    logError('[ProductionReminder] Error reading reminders:', error);
    return [];
  }
}

/**
 * Get a single production reminder by ID
 *
 * @param id Reminder UUID
 * @returns Reminder or undefined if not found
 */
export function getProductionReminderById(
  id: string
): IProductionReminder | undefined {
  const reminders = getProductionReminders();
  return reminders.find((r) => r.id === id);
}

/**
 * Delete a production reminder by ID
 *
 * @param id Reminder UUID to delete
 */
export function deleteProductionReminder(id: string): void {
  const reminders = getProductionReminders().filter((r) => r.id !== id);
  try {
    localStorage.setItem(
      PRODUCTION_REMINDERS_STORAGE_KEY,
      JSON.stringify(reminders)
    );
  } catch {
    // localStorage unavailable
  }
  logDebug('[ProductionReminder] Deleted reminder:', id);
}

/**
 * Delete all production reminders
 */
export function clearAllProductionReminders(): void {
  try {
    localStorage.removeItem(PRODUCTION_REMINDERS_STORAGE_KEY);
  } catch {
    // localStorage unavailable
  }
  logDebug('[ProductionReminder] Cleared all reminders');
}

/**
 * Get the count of pending production reminders
 *
 * @returns Number of reminders
 */
export function getRemindersCount(): number {
  return getProductionReminders().length;
}

/**
 * Check if there are any pending reminders
 *
 * @returns true if there are reminders
 */
export function hasReminders(): boolean {
  return getRemindersCount() > 0;
}
