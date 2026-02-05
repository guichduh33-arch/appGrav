/**
 * Financial Operation Service Tests
 *
 * Tests for void/refund validation and conflict resolution.
 */

import { describe, it, expect } from 'vitest';
import {
  validateVoidInput,
  validateRefundInput,
  shouldRejectForConflict,
  VOID_REASON_LABELS,
  REFUND_REASON_LABELS,
  VOID_REASON_OPTIONS,
  REFUND_REASON_OPTIONS,
} from '../financialOperationService';
import type { IVoidInput, IRefundInput, IConflictResolution } from '@/types/payment';

describe('financialOperationService', () => {
  describe('validateVoidInput', () => {
    it('should accept valid void input', () => {
      const input: IVoidInput = {
        orderId: 'order-123',
        reason: 'Customer changed their mind',
        reasonCode: 'customer_changed_mind',
        voidedBy: 'user-123',
      };

      const errors = validateVoidInput(input);

      expect(errors).toHaveLength(0);
    });

    it('should reject missing orderId', () => {
      const input: IVoidInput = {
        orderId: '',
        reason: 'Customer changed their mind',
        reasonCode: 'customer_changed_mind',
        voidedBy: 'user-123',
      };

      const errors = validateVoidInput(input);

      expect(errors).toContain('Order ID is required');
    });

    it('should reject missing reason', () => {
      const input: IVoidInput = {
        orderId: 'order-123',
        reason: '',
        reasonCode: 'customer_changed_mind',
        voidedBy: 'user-123',
      };

      const errors = validateVoidInput(input);

      expect(errors).toContain('Void reason is required');
    });

    it('should reject whitespace-only reason', () => {
      const input: IVoidInput = {
        orderId: 'order-123',
        reason: '   ',
        reasonCode: 'customer_changed_mind',
        voidedBy: 'user-123',
      };

      const errors = validateVoidInput(input);

      expect(errors).toContain('Void reason is required');
    });

    it('should reject missing reasonCode', () => {
      const input = {
        orderId: 'order-123',
        reason: 'Customer changed their mind',
        reasonCode: undefined as never,
        voidedBy: 'user-123',
      };

      const errors = validateVoidInput(input);

      expect(errors).toContain('Void reason code is required');
    });

    it('should reject missing voidedBy', () => {
      const input: IVoidInput = {
        orderId: 'order-123',
        reason: 'Customer changed their mind',
        reasonCode: 'customer_changed_mind',
        voidedBy: '',
      };

      const errors = validateVoidInput(input);

      expect(errors).toContain('User ID (voidedBy) is required');
    });

    it('should return multiple errors for multiple issues', () => {
      const input = {
        orderId: '',
        reason: '',
        reasonCode: undefined as never,
        voidedBy: '',
      };

      const errors = validateVoidInput(input);

      expect(errors.length).toBeGreaterThan(1);
    });
  });

  describe('validateRefundInput', () => {
    it('should accept valid refund input', () => {
      const input: IRefundInput = {
        orderId: 'order-123',
        amount: 50000,
        reason: 'Product quality issue',
        reasonCode: 'product_quality',
        method: 'cash',
        refundedBy: 'user-123',
      };

      const errors = validateRefundInput(input, 100000);

      expect(errors).toHaveLength(0);
    });

    it('should reject zero amount', () => {
      const input: IRefundInput = {
        orderId: 'order-123',
        amount: 0,
        reason: 'Product quality issue',
        reasonCode: 'product_quality',
        method: 'cash',
        refundedBy: 'user-123',
      };

      const errors = validateRefundInput(input, 100000);

      expect(errors).toContain('Refund amount must be greater than 0');
    });

    it('should reject negative amount', () => {
      const input: IRefundInput = {
        orderId: 'order-123',
        amount: -100,
        reason: 'Product quality issue',
        reasonCode: 'product_quality',
        method: 'cash',
        refundedBy: 'user-123',
      };

      const errors = validateRefundInput(input, 100000);

      expect(errors).toContain('Refund amount must be greater than 0');
    });

    it('should reject amount exceeding order total', () => {
      const input: IRefundInput = {
        orderId: 'order-123',
        amount: 150000,
        reason: 'Product quality issue',
        reasonCode: 'product_quality',
        method: 'cash',
        refundedBy: 'user-123',
      };

      const errors = validateRefundInput(input, 100000);

      expect(errors).toContain('Refund amount cannot exceed order total');
    });

    it('should accept full refund (amount equals total)', () => {
      const input: IRefundInput = {
        orderId: 'order-123',
        amount: 100000,
        reason: 'Product quality issue',
        reasonCode: 'product_quality',
        method: 'cash',
        refundedBy: 'user-123',
      };

      const errors = validateRefundInput(input, 100000);

      expect(errors).toHaveLength(0);
    });

    it('should reject missing method', () => {
      const input: IRefundInput = {
        orderId: 'order-123',
        amount: 50000,
        reason: 'Product quality issue',
        reasonCode: 'product_quality',
        method: '' as never,
        refundedBy: 'user-123',
      };

      const errors = validateRefundInput(input, 100000);

      expect(errors).toContain('Refund method is required');
    });
  });

  describe('shouldRejectForConflict', () => {
    it('should reject when server is newer with reject_if_server_newer rule', () => {
      const resolution: IConflictResolution = {
        serverUpdatedAt: new Date('2026-02-05T12:00:00Z'),
        localOperationAt: new Date('2026-02-05T11:00:00Z'),
        rule: 'reject_if_server_newer',
      };

      expect(shouldRejectForConflict(resolution)).toBe(true);
    });

    it('should not reject when local is newer with reject_if_server_newer rule', () => {
      const resolution: IConflictResolution = {
        serverUpdatedAt: new Date('2026-02-05T10:00:00Z'),
        localOperationAt: new Date('2026-02-05T11:00:00Z'),
        rule: 'reject_if_server_newer',
      };

      expect(shouldRejectForConflict(resolution)).toBe(false);
    });

    it('should not reject with force_apply rule regardless of timestamps', () => {
      const resolution: IConflictResolution = {
        serverUpdatedAt: new Date('2026-02-05T12:00:00Z'),
        localOperationAt: new Date('2026-02-05T11:00:00Z'),
        rule: 'force_apply',
      };

      expect(shouldRejectForConflict(resolution)).toBe(false);
    });

    it('should not reject when timestamps are equal', () => {
      const sameTime = new Date('2026-02-05T11:00:00Z');
      const resolution: IConflictResolution = {
        serverUpdatedAt: sameTime,
        localOperationAt: sameTime,
        rule: 'reject_if_server_newer',
      };

      expect(shouldRejectForConflict(resolution)).toBe(false);
    });
  });

  describe('Reason Labels and Options', () => {
    it('should have labels for all void reason codes', () => {
      expect(VOID_REASON_LABELS.customer_changed_mind).toBe('Customer Changed Mind');
      expect(VOID_REASON_LABELS.duplicate_order).toBe('Duplicate Order');
      expect(VOID_REASON_LABELS.wrong_items).toBe('Wrong Items Entered');
      expect(VOID_REASON_LABELS.system_error).toBe('System Error');
      expect(VOID_REASON_LABELS.other).toBe('Other');
    });

    it('should have labels for all refund reason codes', () => {
      expect(REFUND_REASON_LABELS.product_quality).toBe('Product Quality Issue');
      expect(REFUND_REASON_LABELS.wrong_item_delivered).toBe('Wrong Item Delivered');
      expect(REFUND_REASON_LABELS.customer_dissatisfied).toBe('Customer Dissatisfied');
      expect(REFUND_REASON_LABELS.overcharge).toBe('Overcharge');
      expect(REFUND_REASON_LABELS.other).toBe('Other');
    });

    it('should generate correct void reason options', () => {
      expect(VOID_REASON_OPTIONS).toHaveLength(5);
      expect(VOID_REASON_OPTIONS[0]).toEqual({
        value: 'customer_changed_mind',
        label: 'Customer Changed Mind',
      });
    });

    it('should generate correct refund reason options', () => {
      expect(REFUND_REASON_OPTIONS).toHaveLength(5);
      expect(REFUND_REASON_OPTIONS[0]).toEqual({
        value: 'product_quality',
        label: 'Product Quality Issue',
      });
    });
  });
});
