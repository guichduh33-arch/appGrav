/**
 * Unit Tests for Sensitive Permissions Constants
 *
 * Tests the isSensitivePermissionCode function and SENSITIVE_PERMISSION_CODES array.
 *
 * @see Story 1.3: Offline Permissions Cache
 */

import { describe, expect, it } from 'vitest';
import {
  SENSITIVE_PERMISSION_CODES,
  isSensitivePermissionCode,
  DISCOUNT_MANAGER_THRESHOLD,
  getSensitivePermissionsForModule,
} from '../sensitivePermissions';

describe('sensitivePermissions', () => {
  describe('SENSITIVE_PERMISSION_CODES', () => {
    it('should contain sales.void permission', () => {
      expect(SENSITIVE_PERMISSION_CODES).toContain('sales.void');
    });

    it('should contain sales.refund permission', () => {
      expect(SENSITIVE_PERMISSION_CODES).toContain('sales.refund');
    });

    it('should contain sales.discount permission', () => {
      expect(SENSITIVE_PERMISSION_CODES).toContain('sales.discount');
    });

    it('should contain inventory.adjust permission', () => {
      expect(SENSITIVE_PERMISSION_CODES).toContain('inventory.adjust');
    });

    it('should contain inventory.delete permission', () => {
      expect(SENSITIVE_PERMISSION_CODES).toContain('inventory.delete');
    });

    it('should contain users.roles permission', () => {
      expect(SENSITIVE_PERMISSION_CODES).toContain('users.roles');
    });

    it('should contain settings.update permission', () => {
      expect(SENSITIVE_PERMISSION_CODES).toContain('settings.update');
    });

    it('should NOT contain non-sensitive permissions', () => {
      expect(SENSITIVE_PERMISSION_CODES).not.toContain('sales.view');
      expect(SENSITIVE_PERMISSION_CODES).not.toContain('sales.create');
      expect(SENSITIVE_PERMISSION_CODES).not.toContain('inventory.view');
      expect(SENSITIVE_PERMISSION_CODES).not.toContain('products.view');
    });
  });

  describe('isSensitivePermissionCode', () => {
    it('should return true for sales.void', () => {
      expect(isSensitivePermissionCode('sales.void')).toBe(true);
    });

    it('should return true for sales.refund', () => {
      expect(isSensitivePermissionCode('sales.refund')).toBe(true);
    });

    it('should return true for sales.discount', () => {
      expect(isSensitivePermissionCode('sales.discount')).toBe(true);
    });

    it('should return true for inventory.adjust', () => {
      expect(isSensitivePermissionCode('inventory.adjust')).toBe(true);
    });

    it('should return true for inventory.delete', () => {
      expect(isSensitivePermissionCode('inventory.delete')).toBe(true);
    });

    it('should return true for users.roles', () => {
      expect(isSensitivePermissionCode('users.roles')).toBe(true);
    });

    it('should return true for settings.update', () => {
      expect(isSensitivePermissionCode('settings.update')).toBe(true);
    });

    it('should return false for sales.view (non-sensitive)', () => {
      expect(isSensitivePermissionCode('sales.view')).toBe(false);
    });

    it('should return false for sales.create (non-sensitive)', () => {
      expect(isSensitivePermissionCode('sales.create')).toBe(false);
    });

    it('should return false for inventory.view (non-sensitive)', () => {
      expect(isSensitivePermissionCode('inventory.view')).toBe(false);
    });

    it('should return false for products.view (non-sensitive)', () => {
      expect(isSensitivePermissionCode('products.view')).toBe(false);
    });

    it('should return false for non-existent permission code', () => {
      expect(isSensitivePermissionCode('invalid.permission')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isSensitivePermissionCode('')).toBe(false);
    });
  });

  describe('DISCOUNT_MANAGER_THRESHOLD', () => {
    it('should be 20 percent', () => {
      expect(DISCOUNT_MANAGER_THRESHOLD).toBe(20);
    });
  });

  describe('getSensitivePermissionsForModule', () => {
    it('should return sales sensitive permissions', () => {
      const salesSensitive = getSensitivePermissionsForModule('sales');

      expect(salesSensitive).toContain('sales.void');
      expect(salesSensitive).toContain('sales.refund');
      expect(salesSensitive).toContain('sales.discount');
      expect(salesSensitive).toHaveLength(3);
    });

    it('should return inventory sensitive permissions', () => {
      const inventorySensitive = getSensitivePermissionsForModule('inventory');

      expect(inventorySensitive).toContain('inventory.adjust');
      expect(inventorySensitive).toContain('inventory.delete');
      expect(inventorySensitive).toHaveLength(2);
    });

    it('should return users sensitive permissions', () => {
      const usersSensitive = getSensitivePermissionsForModule('users');

      expect(usersSensitive).toContain('users.roles');
      expect(usersSensitive).toHaveLength(1);
    });

    it('should return settings sensitive permissions', () => {
      const settingsSensitive = getSensitivePermissionsForModule('settings');

      expect(settingsSensitive).toContain('settings.update');
      expect(settingsSensitive).toHaveLength(1);
    });

    it('should return empty array for module with no sensitive permissions', () => {
      const productsSensitive = getSensitivePermissionsForModule('products');

      expect(productsSensitive).toEqual([]);
    });

    it('should return empty array for non-existent module', () => {
      const unknownSensitive = getSensitivePermissionsForModule('unknown');

      expect(unknownSensitive).toEqual([]);
    });
  });
});
