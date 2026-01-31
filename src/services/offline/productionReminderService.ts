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
  localStorage.setItem(
    PRODUCTION_REMINDERS_STORAGE_KEY,
    JSON.stringify(reminders)
  );

  console.debug('[ProductionReminder] Saved reminder:', id);
  return id;
}

/**
 * Get all production reminders from localStorage
 *
 * @returns Array of production reminders, empty if none
 */
export function getProductionReminders(): IProductionReminder[] {
  try {
    const data = localStorage.getItem(PRODUCTION_REMINDERS_STORAGE_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      console.warn('[ProductionReminder] Invalid data format, returning empty');
      return [];
    }

    return parsed;
  } catch (error) {
    console.error('[ProductionReminder] Error reading reminders:', error);
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
  localStorage.setItem(
    PRODUCTION_REMINDERS_STORAGE_KEY,
    JSON.stringify(reminders)
  );
  console.debug('[ProductionReminder] Deleted reminder:', id);
}

/**
 * Delete all production reminders
 */
export function clearAllProductionReminders(): void {
  localStorage.removeItem(PRODUCTION_REMINDERS_STORAGE_KEY);
  console.debug('[ProductionReminder] Cleared all reminders');
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
