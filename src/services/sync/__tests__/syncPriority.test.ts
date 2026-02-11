import { describe, it, expect } from 'vitest';
import {
  assignPriority,
  comparePriority,
  sortByPriority,
} from '../syncPriority';
import type { ILegacySyncQueueItem } from '@/types/offline';

function makeItem(
  type: string,
  createdAt: string,
  priority?: 'critical' | 'high' | 'normal' | 'low'
): ILegacySyncQueueItem {
  return {
    id: crypto.randomUUID(),
    type: type as ILegacySyncQueueItem['type'],
    payload: {},
    status: 'pending',
    createdAt,
    attempts: 0,
    lastError: null,
    priority,
  };
}

describe('syncPriority', () => {
  describe('assignPriority', () => {
    it('returns existing priority if provided', () => {
      expect(assignPriority('order', 'low')).toBe('low');
    });

    it('maps order to high', () => {
      expect(assignPriority('order')).toBe('high');
    });

    it('maps payment to critical', () => {
      expect(assignPriority('payment')).toBe('critical');
    });

    it('maps product to normal', () => {
      expect(assignPriority('product')).toBe('normal');
    });

    it('maps audit_logs to low', () => {
      expect(assignPriority('audit_logs')).toBe('low');
    });

    it('defaults unknown types to normal', () => {
      expect(assignPriority('unknown_type')).toBe('normal');
    });
  });

  describe('comparePriority', () => {
    it('critical < high', () => {
      expect(comparePriority('critical', 'high')).toBeLessThan(0);
    });

    it('high < normal', () => {
      expect(comparePriority('high', 'normal')).toBeLessThan(0);
    });

    it('normal < low', () => {
      expect(comparePriority('normal', 'low')).toBeLessThan(0);
    });

    it('same priority returns 0', () => {
      expect(comparePriority('high', 'high')).toBe(0);
    });

    it('low > critical', () => {
      expect(comparePriority('low', 'critical')).toBeGreaterThan(0);
    });
  });

  describe('sortByPriority', () => {
    it('sorts critical before normal', () => {
      const items = [
        makeItem('product', '2026-01-01T00:00:00Z'),
        makeItem('payment', '2026-01-01T00:00:01Z'),
      ];

      const sorted = sortByPriority(items);
      expect(sorted[0].type).toBe('payment'); // critical
      expect(sorted[1].type).toBe('product'); // normal
    });

    it('uses FIFO within same priority', () => {
      const earlier = makeItem('order', '2026-01-01T00:00:00Z');
      const later = makeItem('order', '2026-01-01T00:01:00Z');

      const sorted = sortByPriority([later, earlier]);
      expect(sorted[0].createdAt).toBe('2026-01-01T00:00:00Z');
      expect(sorted[1].createdAt).toBe('2026-01-01T00:01:00Z');
    });

    it('respects explicit priority over type-derived priority', () => {
      const criticalProduct = makeItem('product', '2026-01-01T00:00:00Z', 'critical');
      const normalOrder = makeItem('order', '2026-01-01T00:00:00Z');

      const sorted = sortByPriority([normalOrder, criticalProduct]);
      // criticalProduct has explicit 'critical', normalOrder derives 'high'
      expect(sorted[0].type).toBe('product');
      expect(sorted[1].type).toBe('order');
    });

    it('does not mutate original array', () => {
      const items = [
        makeItem('product', '2026-01-01T00:00:00Z'),
        makeItem('payment', '2026-01-01T00:00:01Z'),
      ];
      const original = [...items];
      sortByPriority(items);
      expect(items[0].type).toBe(original[0].type);
    });
  });
});
