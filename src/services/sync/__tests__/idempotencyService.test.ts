import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateKey,
  checkKey,
  registerKey,
  wrapWithIdempotency,
} from '../idempotencyService';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      upsert: vi.fn(),
    })),
  },
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  default: { debug: vi.fn() },
}));

import { supabase } from '@/lib/supabase';

describe('idempotencyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateKey', () => {
    it('generates deterministic key from components', () => {
      const key = generateKey('order', '123', 'create');
      expect(key).toBe('order:123:create');
    });

    it('generates unique keys for different inputs', () => {
      const key1 = generateKey('order', '123', 'create');
      const key2 = generateKey('order', '456', 'create');
      expect(key1).not.toBe(key2);
    });
  });

  describe('checkKey', () => {
    it('returns true when key exists with success status', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { key: 'test', response_status: 'success' },
        error: null,
      });
      const mockEq = vi.fn(() => ({ single: mockSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      const result = await checkKey('test-key');
      expect(result).toBe(true);
    });

    it('returns false when key does not exist', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'not found' },
      });
      const mockEq = vi.fn(() => ({ single: mockSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      const result = await checkKey('missing-key');
      expect(result).toBe(false);
    });

    it('returns false on network error', async () => {
      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await checkKey('test-key');
      expect(result).toBe(false);
    });
  });

  describe('registerKey', () => {
    it('upserts key to supabase', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.from).mockReturnValue({ upsert: mockUpsert } as never);

      await registerKey('test-key', 'order', '123');

      expect(mockUpsert).toHaveBeenCalledWith({
        key: 'test-key',
        entity_type: 'order',
        entity_id: '123',
        response_status: 'success',
      });
    });
  });

  describe('wrapWithIdempotency', () => {
    it('skips execution if key already exists', async () => {
      // Mock checkKey to return true (key exists)
      const mockSingle = vi.fn().mockResolvedValue({
        data: { key: 'test', response_status: 'success' },
        error: null,
      });
      const mockEq = vi.fn(() => ({ single: mockSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as never);

      const fn = vi.fn().mockResolvedValue('result');
      const { skipped } = await wrapWithIdempotency('existing-key', 'order', '123', fn);

      expect(skipped).toBe(true);
      expect(fn).not.toHaveBeenCalled();
    });

    it('executes function when key does not exist', async () => {
      // First call (checkKey) returns not found, second call (registerKey) succeeds
      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // checkKey - not found
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
              })),
            })),
          } as never;
        }
        // registerKey
        return { upsert: vi.fn().mockResolvedValue({ error: null }) } as never;
      });

      const fn = vi.fn().mockResolvedValue('result');
      const { result, skipped } = await wrapWithIdempotency('new-key', 'order', '123', fn);

      expect(skipped).toBe(false);
      expect(result).toBe('result');
      expect(fn).toHaveBeenCalledOnce();
    });
  });
});
