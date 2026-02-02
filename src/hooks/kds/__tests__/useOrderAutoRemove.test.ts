/**
 * useOrderAutoRemove Hook Tests
 * Story 4.6 - Order Completion & Auto-Remove
 *
 * Tests for auto-remove functionality when all items are ready
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOrderAutoRemove } from '../useOrderAutoRemove';

describe('useOrderAutoRemove', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not start countdown when allItemsReady is false', () => {
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useOrderAutoRemove({
        orderId: 'order-1',
        allItemsReady: false,
        isWaiterStation: false,
        onComplete,
      })
    );

    expect(result.current.isCountingDown).toBe(false);
    expect(result.current.isExiting).toBe(false);
  });

  it('should start countdown when allItemsReady becomes true', () => {
    const onComplete = vi.fn();

    const { result, rerender } = renderHook(
      ({ allItemsReady }) =>
        useOrderAutoRemove({
          orderId: 'order-1',
          allItemsReady,
          isWaiterStation: false,
          onComplete,
        }),
      { initialProps: { allItemsReady: false } }
    );

    expect(result.current.isCountingDown).toBe(false);

    // Set allItemsReady to true
    rerender({ allItemsReady: true });

    expect(result.current.isCountingDown).toBe(true);
    expect(result.current.timeRemaining).toBe(5);
  });

  it('should NOT start countdown for waiter station', () => {
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useOrderAutoRemove({
        orderId: 'order-1',
        allItemsReady: true,
        isWaiterStation: true,
        onComplete,
      })
    );

    expect(result.current.isCountingDown).toBe(false);
    expect(result.current.isExiting).toBe(false);

    // Even after time passes, should not trigger
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should decrement timeRemaining each second', async () => {
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useOrderAutoRemove({
        orderId: 'order-1',
        allItemsReady: true,
        isWaiterStation: false,
        onComplete,
      })
    );

    expect(result.current.timeRemaining).toBe(5);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.timeRemaining).toBe(4);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.timeRemaining).toBe(3);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.timeRemaining).toBe(2);
  });

  it('should call onComplete after autoRemoveDelay + animation', async () => {
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useOrderAutoRemove({
        orderId: 'order-1',
        allItemsReady: true,
        isWaiterStation: false,
        autoRemoveDelay: 5000,
        onComplete,
      })
    );

    expect(result.current.isCountingDown).toBe(true);
    expect(onComplete).not.toHaveBeenCalled();

    // After 5 seconds, should start exiting
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.isCountingDown).toBe(false);
    expect(result.current.isExiting).toBe(true);

    // After animation (300ms), should call onComplete - run all pending timers
    await act(async () => {
      vi.runAllTimers();
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should cancel countdown when cancelAutoRemove is called', () => {
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useOrderAutoRemove({
        orderId: 'order-1',
        allItemsReady: true,
        isWaiterStation: false,
        onComplete,
      })
    );

    expect(result.current.isCountingDown).toBe(true);

    // Advance 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Cancel
    act(() => {
      result.current.cancelAutoRemove();
    });

    expect(result.current.isCountingDown).toBe(false);
    expect(result.current.timeRemaining).toBe(5); // Reset to default

    // After more time, should NOT call onComplete
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should use custom autoRemoveDelay', async () => {
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useOrderAutoRemove({
        orderId: 'order-1',
        allItemsReady: true,
        isWaiterStation: false,
        autoRemoveDelay: 3000, // 3 seconds instead of 5
        onComplete,
      })
    );

    expect(result.current.timeRemaining).toBe(3);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.isExiting).toBe(true);

    // Run all pending timers including the animation callback
    await act(async () => {
      vi.runAllTimers();
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should allow re-trigger after cancel if items become ready again', () => {
    const onComplete = vi.fn();

    const { result, rerender } = renderHook(
      ({ allItemsReady }) =>
        useOrderAutoRemove({
          orderId: 'order-1',
          allItemsReady,
          isWaiterStation: false,
          onComplete,
        }),
      { initialProps: { allItemsReady: true } }
    );

    expect(result.current.isCountingDown).toBe(true);

    // Cancel
    act(() => {
      result.current.cancelAutoRemove();
    });

    expect(result.current.isCountingDown).toBe(false);

    // Simulate items no longer all ready
    rerender({ allItemsReady: false });

    // Now items become ready again - should restart countdown
    rerender({ allItemsReady: true });

    expect(result.current.isCountingDown).toBe(true);
  });

  it('should cleanup timers on unmount', () => {
    const onComplete = vi.fn();

    const { result, unmount } = renderHook(() =>
      useOrderAutoRemove({
        orderId: 'order-1',
        allItemsReady: true,
        isWaiterStation: false,
        onComplete,
      })
    );

    expect(result.current.isCountingDown).toBe(true);

    // Unmount before completion
    unmount();

    // Advance time after unmount
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Should not have called onComplete
    expect(onComplete).not.toHaveBeenCalled();
  });
});
