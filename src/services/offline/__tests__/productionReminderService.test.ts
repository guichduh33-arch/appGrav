/**
 * Tests for Production Reminder Service
 *
 * @see Story 2.5: Production Records (Online-Only with Deferred Sync)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveProductionReminder,
  getProductionReminders,
  getProductionReminderById,
  deleteProductionReminder,
  clearAllProductionReminders,
  getRemindersCount,
  hasReminders,
} from '../productionReminderService';
import { PRODUCTION_REMINDERS_STORAGE_KEY } from '@/types/offline';
import type { IProductionReminderItem } from '@/types/offline';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(7),
});

describe('productionReminderService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  const mockItems: IProductionReminderItem[] = [
    {
      productId: 'product-1',
      name: 'Croissant',
      category: 'Viennoiseries',
      icon: '🥐',
      unit: 'pcs',
      quantity: 10,
      wasted: 2,
      wasteReason: 'Burnt',
    },
    {
      productId: 'product-2',
      name: 'Pain au Chocolat',
      category: 'Viennoiseries',
      icon: '🍫',
      unit: 'pcs',
      quantity: 15,
      wasted: 0,
      wasteReason: '',
    },
  ];

  describe('saveProductionReminder', () => {
    it('should save a reminder with unique ID', () => {
      const id = saveProductionReminder(
        mockItems,
        'section-1',
        'Boulangerie',
        new Date('2026-01-30'),
        'Test note'
      );

      expect(id).toBeDefined();
      expect(id).toContain('test-uuid-');

      const reminders = getProductionReminders();
      expect(reminders).toHaveLength(1);
      expect(reminders[0].id).toBe(id);
      expect(reminders[0].sectionId).toBe('section-1');
      expect(reminders[0].sectionName).toBe('Boulangerie');
      expect(reminders[0].note).toBe('Test note');
      expect(reminders[0].items).toHaveLength(2);
    });

    it('should save multiple reminders', () => {
      saveProductionReminder(mockItems, 'section-1', 'Boulangerie', new Date());
      saveProductionReminder(mockItems, 'section-2', 'Patisserie', new Date());
      saveProductionReminder(mockItems, 'section-3', 'Cuisine', new Date());

      const reminders = getProductionReminders();
      expect(reminders).toHaveLength(3);
    });

    it('should save reminder without note', () => {
      const id = saveProductionReminder(
        mockItems,
        'section-1',
        'Boulangerie',
        new Date()
      );

      const reminder = getProductionReminderById(id);
      expect(reminder?.note).toBeUndefined();
    });

    it('should store production date as ISO string', () => {
      const date = new Date('2026-02-15T10:30:00Z');
      const id = saveProductionReminder(
        mockItems,
        'section-1',
        'Boulangerie',
        date
      );

      const reminder = getProductionReminderById(id);
      expect(reminder?.productionDate).toBe(date.toISOString());
    });
  });

  describe('getProductionReminders', () => {
    it('should return empty array when no reminders', () => {
      const reminders = getProductionReminders();
      expect(reminders).toEqual([]);
    });

    it('should return all saved reminders', () => {
      saveProductionReminder(mockItems, 'section-1', 'Boulangerie', new Date());
      saveProductionReminder(mockItems, 'section-2', 'Patisserie', new Date());

      const reminders = getProductionReminders();
      expect(reminders).toHaveLength(2);
    });

    it('should return empty array for invalid JSON', () => {
      localStorageMock.setItem(PRODUCTION_REMINDERS_STORAGE_KEY, 'invalid json');

      const reminders = getProductionReminders();
      expect(reminders).toEqual([]);
    });

    it('should return empty array for non-array data', () => {
      localStorageMock.setItem(
        PRODUCTION_REMINDERS_STORAGE_KEY,
        JSON.stringify({ not: 'an array' })
      );

      const reminders = getProductionReminders();
      expect(reminders).toEqual([]);
    });
  });

  describe('getProductionReminderById', () => {
    it('should return reminder by ID', () => {
      const id = saveProductionReminder(
        mockItems,
        'section-1',
        'Boulangerie',
        new Date()
      );

      const reminder = getProductionReminderById(id);
      expect(reminder).toBeDefined();
      expect(reminder?.id).toBe(id);
    });

    it('should return undefined for non-existent ID', () => {
      saveProductionReminder(mockItems, 'section-1', 'Boulangerie', new Date());

      const reminder = getProductionReminderById('non-existent-id');
      expect(reminder).toBeUndefined();
    });
  });

  describe('deleteProductionReminder', () => {
    it('should delete reminder by ID', () => {
      const id1 = saveProductionReminder(
        mockItems,
        'section-1',
        'Boulangerie',
        new Date()
      );
      const id2 = saveProductionReminder(
        mockItems,
        'section-2',
        'Patisserie',
        new Date()
      );

      expect(getRemindersCount()).toBe(2);

      deleteProductionReminder(id1);

      expect(getRemindersCount()).toBe(1);
      expect(getProductionReminderById(id1)).toBeUndefined();
      expect(getProductionReminderById(id2)).toBeDefined();
    });

    it('should handle deleting non-existent ID gracefully', () => {
      saveProductionReminder(mockItems, 'section-1', 'Boulangerie', new Date());

      expect(() => deleteProductionReminder('non-existent-id')).not.toThrow();
      expect(getRemindersCount()).toBe(1);
    });
  });

  describe('clearAllProductionReminders', () => {
    it('should remove all reminders', () => {
      saveProductionReminder(mockItems, 'section-1', 'Boulangerie', new Date());
      saveProductionReminder(mockItems, 'section-2', 'Patisserie', new Date());
      saveProductionReminder(mockItems, 'section-3', 'Cuisine', new Date());

      expect(getRemindersCount()).toBe(3);

      clearAllProductionReminders();

      expect(getRemindersCount()).toBe(0);
      expect(getProductionReminders()).toEqual([]);
    });
  });

  describe('getRemindersCount', () => {
    it('should return 0 for no reminders', () => {
      expect(getRemindersCount()).toBe(0);
    });

    it('should return correct count', () => {
      saveProductionReminder(mockItems, 'section-1', 'Boulangerie', new Date());
      expect(getRemindersCount()).toBe(1);

      saveProductionReminder(mockItems, 'section-2', 'Patisserie', new Date());
      expect(getRemindersCount()).toBe(2);

      deleteProductionReminder(getProductionReminders()[0].id);
      expect(getRemindersCount()).toBe(1);
    });
  });

  describe('hasReminders', () => {
    it('should return false when no reminders', () => {
      expect(hasReminders()).toBe(false);
    });

    it('should return true when reminders exist', () => {
      saveProductionReminder(mockItems, 'section-1', 'Boulangerie', new Date());
      expect(hasReminders()).toBe(true);
    });

    it('should return false after clearing all reminders', () => {
      saveProductionReminder(mockItems, 'section-1', 'Boulangerie', new Date());
      expect(hasReminders()).toBe(true);

      clearAllProductionReminders();
      expect(hasReminders()).toBe(false);
    });
  });

  describe('item cloning', () => {
    it('should clone items to avoid reference issues', () => {
      const originalItems = [...mockItems];
      saveProductionReminder(
        originalItems,
        'section-1',
        'Boulangerie',
        new Date()
      );

      // Modify original items
      originalItems[0].quantity = 999;

      // Saved reminder should have original value
      const reminder = getProductionReminders()[0];
      expect(reminder.items[0].quantity).toBe(10);
    });
  });
});
