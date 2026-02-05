/**
 * Print Service Tests
 *
 * Tests for print server integration functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
import {
  checkPrintServer,
  printReceipt,
  printKitchenTicket,
  printBaristaTicket,
  openCashDrawer,
  type IOrderPrintData,
  type IKitchenTicketData,
} from '../printService';

describe('printService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkPrintServer', () => {
    it('should return true when server responds ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const result = await checkPrintServer();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/health',
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });

    it('should return false when server responds not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await checkPrintServer();

      expect(result).toBe(false);
    });

    it('should return false when fetch throws error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await checkPrintServer();

      expect(result).toBe(false);
    });

    it('should return false on timeout', async () => {
      // Simulate abort
      mockFetch.mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'));

      const result = await checkPrintServer();

      expect(result).toBe(false);
    });
  });

  describe('printReceipt', () => {
    const sampleOrderData: IOrderPrintData = {
      orderNumber: 'ORD-001',
      orderType: 'dine_in',
      tableNumber: 'A1',
      customerName: 'John Doe',
      items: [
        {
          name: 'Croissant',
          quantity: 2,
          price: 50000,
          modifiers: ['Extra butter'],
          notes: 'Warm',
        },
      ],
      subtotal: 50000,
      tax: 4545,
      total: 50000,
      payments: [{ method: 'cash', amount: 50000 }],
      change: 0,
      cashierName: 'Jane',
      createdAt: '2026-02-05T10:00:00Z',
    };

    it('should return success when print server accepts request', async () => {
      // Health check
      mockFetch.mockResolvedValueOnce({ ok: true });
      // Print request
      mockFetch.mockResolvedValueOnce({ ok: true });

      const result = await printReceipt(sampleOrderData);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:3001/print/receipt',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sampleOrderData),
        })
      );
    });

    it('should return error when print server unavailable', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      const result = await printReceipt(sampleOrderData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Print server not available');
    });

    it('should return error when print request fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Printer offline'),
      });

      const result = await printReceipt(sampleOrderData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Print failed');
    });

    it('should return error when fetch throws', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await printReceipt(sampleOrderData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection refused');
    });
  });

  describe('printKitchenTicket', () => {
    const sampleTicketData: IKitchenTicketData = {
      orderNumber: 'ORD-001',
      orderType: 'takeaway',
      items: [
        {
          name: 'Pain au Chocolat',
          quantity: 3,
          modifiers: [],
        },
      ],
      createdAt: '2026-02-05T10:00:00Z',
      priority: 'rush',
    };

    it('should return success when kitchen ticket printed', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      mockFetch.mockResolvedValueOnce({ ok: true });

      const result = await printKitchenTicket(sampleTicketData);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:3001/print/kitchen',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(sampleTicketData),
        })
      );
    });

    it('should return error when server unavailable', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await printKitchenTicket(sampleTicketData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Print server not available');
    });
  });

  describe('printBaristaTicket', () => {
    const sampleTicketData: IKitchenTicketData = {
      orderNumber: 'ORD-002',
      orderType: 'dine_in',
      tableNumber: 'B3',
      items: [
        {
          name: 'Cappuccino',
          quantity: 2,
          modifiers: ['Extra shot'],
          notes: 'Oat milk',
        },
      ],
      createdAt: '2026-02-05T10:05:00Z',
    };

    it('should return success when barista ticket printed', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      mockFetch.mockResolvedValueOnce({ ok: true });

      const result = await printBaristaTicket(sampleTicketData);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:3001/print/barista',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(sampleTicketData),
        })
      );
    });
  });

  describe('openCashDrawer', () => {
    it('should return success when drawer opens', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      mockFetch.mockResolvedValueOnce({ ok: true });

      const result = await openCashDrawer();

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:3001/drawer/open',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should return error when drawer fails to open', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Drawer not connected'),
      });

      const result = await openCashDrawer();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cash drawer failed');
    });
  });
});
