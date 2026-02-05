/**
 * Tests for useOfflinePayment Hook (Story 3.4)
 *
 * Tests cover:
 * - Payment processing flow
 * - Validation (user, cart, amount)
 * - Cash payment change calculation
 * - Error handling
 * - State management (isProcessing, error)
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOfflinePayment } from '../useOfflinePayment';

// Mock dependencies
vi.mock('@/stores/cartStore', () => ({
  useCartStore: vi.fn(),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('../useNetworkStatus', () => ({
  useNetworkStatus: vi.fn(() => ({ isOnline: true })),
}));

vi.mock('@/services/offline/offlineOrderService', () => ({
  createOfflineOrder: vi.fn(),
}));

vi.mock('@/services/offline/offlinePaymentService', () => ({
  saveOfflinePayment: vi.fn(),
  calculateChange: vi.fn((total, received) => Math.max(0, received - total)),
}));

vi.mock('@/services/offline/kitchenDispatchService', () => ({
  dispatchOrderToKitchen: vi.fn(() => Promise.resolve({ dispatched: [], queued: [] })),
}));

import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useNetworkStatus } from '../useNetworkStatus';
import { createOfflineOrder } from '@/services/offline/offlineOrderService';
import { saveOfflinePayment } from '@/services/offline/offlinePaymentService';

const mockCartState = {
  items: [{ id: 'item-1', name: 'Test Product', quantity: 1, price: 50000 }],
  orderType: 'dine_in' as const,
  tableNumber: '5',
  customerId: null,
  discountType: null,
  discountValue: 0,
  discountReason: null,
  subtotal: 50000,
  discountAmount: 0,
  total: 50000,
  clearCart: vi.fn(),
};

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

describe('useOfflinePayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    (useCartStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockCartState);
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockUser,
      sessionId: 'session-123',
    });
    (useNetworkStatus as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isOnline: true });

    (createOfflineOrder as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      order: { id: 'LOCAL-order-123', order_number: 'OFFLINE-20260201-001' },
      items: [{ id: 'item-1', product_name: 'Test Product' }],
    });

    (saveOfflinePayment as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'LOCAL-PAY-123',
      order_id: 'LOCAL-order-123',
      method: 'cash',
      amount: 50000,
      sync_status: 'pending_sync',
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initial state', () => {
    it('should return initial state correctly', () => {
      const { result } = renderHook(() => useOfflinePayment());

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.isOffline).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.processPayment).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });

    it('should return isOffline=true when network is offline', () => {
      (useNetworkStatus as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isOnline: false });

      const { result } = renderHook(() => useOfflinePayment());

      expect(result.current.isOffline).toBe(true);
    });
  });

  describe('processPayment validation', () => {
    it('should return null and set error when user is not authenticated', async () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: null,
        sessionId: null,
      });

      const { result } = renderHook(() => useOfflinePayment());

      let paymentResult: unknown;
      await act(async () => {
        paymentResult = await result.current.processPayment({
          method: 'cash',
          amount: 50000,
          cashReceived: 50000,
        });
      });

      expect(paymentResult).toBeNull();
      expect(result.current.error).toBe('User must be authenticated to process payments');
    });

    it('should return null and set error when cart is empty', async () => {
      (useCartStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockCartState,
        items: [],
      });

      const { result } = renderHook(() => useOfflinePayment());

      let paymentResult: unknown;
      await act(async () => {
        paymentResult = await result.current.processPayment({
          method: 'cash',
          amount: 50000,
          cashReceived: 50000,
        });
      });

      expect(paymentResult).toBeNull();
      expect(result.current.error).toBe('Cart is empty');
    });

    it('should return null and set error when amount is zero or negative', async () => {
      const { result } = renderHook(() => useOfflinePayment());

      let paymentResult: unknown;
      await act(async () => {
        paymentResult = await result.current.processPayment({
          method: 'cash',
          amount: 0,
          cashReceived: 50000,
        });
      });

      expect(paymentResult).toBeNull();
      expect(result.current.error).toBe('Payment amount must be positive');
    });

    it('should return null and set error when cash received is less than amount', async () => {
      const { result } = renderHook(() => useOfflinePayment());

      let paymentResult: unknown;
      await act(async () => {
        paymentResult = await result.current.processPayment({
          method: 'cash',
          amount: 50000,
          cashReceived: 40000, // Less than amount
        });
      });

      expect(paymentResult).toBeNull();
      expect(result.current.error).toBe('Cash received must be at least the payment amount');
    });

    it('should return null and set error when amount does not match cart total', async () => {
      const { result } = renderHook(() => useOfflinePayment());

      let paymentResult: unknown;
      await act(async () => {
        paymentResult = await result.current.processPayment({
          method: 'cash',
          amount: 30000, // Does not match cart total of 50000
          cashReceived: 30000,
        });
      });

      expect(paymentResult).toBeNull();
      expect(result.current.error).toBe('Payment amount must match cart total');
    });

    it('should allow 1 IDR tolerance for rounding differences', async () => {
      const { result } = renderHook(() => useOfflinePayment());

      // Amount is 49999 (1 off from 50000) - should be allowed
      await act(async () => {
        await result.current.processPayment({
          method: 'cash',
          amount: 49999,
          cashReceived: 50000,
        });
      });

      // Should succeed (no error about amount mismatch)
      expect(result.current.error).not.toBe('Payment amount must match cart total');
    });
  });

  describe('processPayment success', () => {
    it('should process cash payment successfully', async () => {
      const { result } = renderHook(() => useOfflinePayment());

      let paymentResult: unknown;
      await act(async () => {
        paymentResult = await result.current.processPayment({
          method: 'cash',
          amount: 50000,
          cashReceived: 60000,
        });
      });

      expect(paymentResult).not.toBeNull();
      expect((paymentResult as { order: { id: string } }).order.id).toBe('LOCAL-order-123');
      expect((paymentResult as { change: number }).change).toBe(10000);
      expect(mockCartState.clearCart).toHaveBeenCalled();
    });

    it('should process card payment successfully (no cashReceived needed)', async () => {
      (saveOfflinePayment as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'LOCAL-PAY-456',
        order_id: 'LOCAL-order-123',
        method: 'card',
        amount: 50000,
        sync_status: 'pending_validation',
      });

      const { result } = renderHook(() => useOfflinePayment());

      let paymentResult: unknown;
      await act(async () => {
        paymentResult = await result.current.processPayment({
          method: 'card',
          amount: 50000,
          reference: 'TXN-12345',
        });
      });

      expect(paymentResult).not.toBeNull();
      expect((paymentResult as { payment: { method: string } }).payment.method).toBe('card');
      expect((paymentResult as { change: number }).change).toBe(0);
    });

    it('should call createOfflineOrder with correct cart data', async () => {
      const { result } = renderHook(() => useOfflinePayment());

      await act(async () => {
        await result.current.processPayment({
          method: 'cash',
          amount: 50000,
          cashReceived: 50000,
        });
      });

      expect(createOfflineOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          items: mockCartState.items,
          orderType: 'dine_in',
          tableNumber: '5',
          total: 50000,
        }),
        'user-123',
        'session-123'
      );
    });

    it('should call saveOfflinePayment with correct payment data', async () => {
      const { result } = renderHook(() => useOfflinePayment());

      await act(async () => {
        await result.current.processPayment({
          method: 'cash',
          amount: 50000,
          cashReceived: 60000,
        });
      });

      expect(saveOfflinePayment).toHaveBeenCalledWith({
        order_id: 'LOCAL-order-123',
        method: 'cash',
        amount: 50000,
        cash_received: 60000,
        change_given: 10000,
        reference: undefined,
        user_id: 'user-123',
        session_id: 'session-123',
      });
    });
  });

  describe('error handling', () => {
    it('should set error when createOfflineOrder fails', async () => {
      (createOfflineOrder as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error')
      );

      const { result } = renderHook(() => useOfflinePayment());

      let paymentResult: unknown;
      await act(async () => {
        paymentResult = await result.current.processPayment({
          method: 'cash',
          amount: 50000,
          cashReceived: 50000,
        });
      });

      expect(paymentResult).toBeNull();
      expect(result.current.error).toBe('Database error');
    });

    it('should set error when saveOfflinePayment fails', async () => {
      (saveOfflinePayment as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Payment save failed')
      );

      const { result } = renderHook(() => useOfflinePayment());

      let paymentResult: unknown;
      await act(async () => {
        paymentResult = await result.current.processPayment({
          method: 'cash',
          amount: 50000,
          cashReceived: 50000,
        });
      });

      expect(paymentResult).toBeNull();
      expect(result.current.error).toBe('Payment save failed');
    });

    it('should clearError reset error to null', async () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        user: null,
        sessionId: null,
      });

      const { result } = renderHook(() => useOfflinePayment());

      // Trigger an error
      await act(async () => {
        await result.current.processPayment({
          method: 'cash',
          amount: 50000,
          cashReceived: 50000,
        });
      });

      expect(result.current.error).not.toBeNull();

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('isProcessing state', () => {
    it('should set isProcessing during payment processing', async () => {
      // Create a delayed mock to observe isProcessing state
      let resolvePayment: () => void;
      const paymentPromise = new Promise<void>((resolve) => {
        resolvePayment = resolve;
      });

      (createOfflineOrder as unknown as ReturnType<typeof vi.fn>).mockImplementation(async () => {
        await paymentPromise;
        return {
          order: { id: 'LOCAL-order-123' },
          items: [],
        };
      });

      const { result } = renderHook(() => useOfflinePayment());

      expect(result.current.isProcessing).toBe(false);

      // Start payment but don't await yet
      let paymentResultPromise: Promise<unknown>;
      act(() => {
        paymentResultPromise = result.current.processPayment({
          method: 'cash',
          amount: 50000,
          cashReceived: 50000,
        });
      });

      // isProcessing should be true during processing
      await waitFor(() => {
        expect(result.current.isProcessing).toBe(true);
      });

      // Resolve the payment
      await act(async () => {
        resolvePayment!();
        await paymentResultPromise;
      });

      // isProcessing should be false after completion
      expect(result.current.isProcessing).toBe(false);
    });
  });
});
