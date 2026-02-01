/**
 * Cart Persistence Service Tests (Story 3.2)
 *
 * Tests for cart state persistence in localStorage
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import {
  saveCart,
  loadCart,
  clearPersistedCart,
  hasPersistedCart,
  validateAndFilterCartItems,
  CART_PERSISTENCE_KEY,
  type IPersistedCartState,
  type TSaveCartInput,
} from '../cartPersistenceService';
import type { CartItem } from '@/stores/cartStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test fixtures
const createMockProduct = (id: string, name: string) => ({
  id,
  name,
  sku: `SKU-${id}`,
  retail_price: 10000,
  category_id: 'cat-1',
  product_type: 'finished',
  is_active: true,
  pos_visible: true,
  available_for_sale: true,
  wholesale_price: null,
  cost_price: null,
  image_url: null,
  updated_at: new Date().toISOString(),
});

const createMockCartItem = (
  id: string,
  productId: string,
  productName: string
): CartItem => ({
  id,
  type: 'product',
  product: createMockProduct(productId, productName) as any,
  quantity: 1,
  unitPrice: 10000,
  modifiers: [],
  modifiersTotal: 0,
  notes: '',
  totalPrice: 10000,
});

const createMockCartState = (items: CartItem[] = []): TSaveCartInput => ({
  items,
  lockedItemIds: [],
  activeOrderId: null,
  activeOrderNumber: null,
  orderType: 'dine_in',
  tableNumber: null,
  customerId: null,
  customerName: null,
  discountType: null,
  discountValue: 0,
  discountReason: null,
});

describe('cartPersistenceService', () => {
  beforeEach(async () => {
    localStorageMock.clear();
    vi.clearAllMocks();
    // Clear Dexie tables
    await db.offline_products.clear();
  });

  afterEach(async () => {
    // Clear tables (don't close database)
    await db.offline_products.clear();
  });

  describe('saveCart', () => {
    it('should save cart state to localStorage', () => {
      const cartState = createMockCartState();

      saveCart(cartState);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        CART_PERSISTENCE_KEY,
        expect.any(String)
      );

      const savedData = JSON.parse(
        localStorageMock.setItem.mock.calls[0][1]
      ) as IPersistedCartState;
      expect(savedData.items).toEqual([]);
      expect(savedData.orderType).toBe('dine_in');
      expect(savedData.savedAt).toBeDefined();
    });

    it('should save cart with items and modifiers', () => {
      const item = createMockCartItem('item-1', 'prod-1', 'Test Product');
      item.modifiers = [
        {
          groupName: 'Size',
          optionId: 'opt-1',
          optionLabel: 'Large',
          priceAdjustment: 5000,
        },
      ];
      item.modifiersTotal = 5000;
      item.totalPrice = 15000;

      const cartState = createMockCartState([item]);

      saveCart(cartState);

      const savedData = JSON.parse(
        localStorageMock.setItem.mock.calls[0][1]
      ) as IPersistedCartState;
      expect(savedData.items).toHaveLength(1);
      expect(savedData.items[0].modifiers).toHaveLength(1);
      expect(savedData.items[0].modifiers[0].optionLabel).toBe('Large');
    });

    it('should save complete cart state including customer and discount', () => {
      const cartState: TSaveCartInput = {
        items: [createMockCartItem('item-1', 'prod-1', 'Product 1')],
        lockedItemIds: ['item-1'],
        activeOrderId: 'order-123',
        activeOrderNumber: 'OFFLINE-20260201-001',
        orderType: 'takeaway',
        tableNumber: 'T5',
        customerId: 'cust-1',
        customerName: 'John Doe',
        discountType: 'percent',
        discountValue: 10,
        discountReason: 'VIP customer',
      };

      saveCart(cartState);

      const savedData = JSON.parse(
        localStorageMock.setItem.mock.calls[0][1]
      ) as IPersistedCartState;
      expect(savedData.lockedItemIds).toEqual(['item-1']);
      expect(savedData.activeOrderId).toBe('order-123');
      expect(savedData.orderType).toBe('takeaway');
      expect(savedData.customerId).toBe('cust-1');
      expect(savedData.discountType).toBe('percent');
      expect(savedData.discountValue).toBe(10);
    });

    it('should not throw on localStorage error', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => saveCart(createMockCartState())).not.toThrow();
    });
  });

  describe('loadCart', () => {
    it('should return null when no cart exists', () => {
      const result = loadCart();
      expect(result).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json {{{');

      const result = loadCart();
      expect(result).toBeNull();
    });

    it('should return null when items array is missing', () => {
      localStorageMock.getItem.mockReturnValueOnce(
        JSON.stringify({ orderType: 'dine_in' })
      );

      const result = loadCart();
      expect(result).toBeNull();
    });

    it('should load and parse valid cart state', () => {
      const cartState: IPersistedCartState = {
        items: [createMockCartItem('item-1', 'prod-1', 'Product 1')],
        lockedItemIds: ['item-1'],
        activeOrderId: 'order-123',
        activeOrderNumber: 'OFFLINE-20260201-001',
        orderType: 'takeaway',
        tableNumber: 'T5',
        customerId: 'cust-1',
        customerName: 'John Doe',
        discountType: 'percent',
        discountValue: 10,
        discountReason: 'VIP',
        savedAt: '2026-02-01T10:00:00.000Z',
      };

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(cartState));

      const result = loadCart();

      expect(result).not.toBeNull();
      expect(result!.items).toHaveLength(1);
      expect(result!.lockedItemIds).toEqual(['item-1']);
      expect(result!.activeOrderId).toBe('order-123');
      expect(result!.orderType).toBe('takeaway');
      expect(result!.customerId).toBe('cust-1');
      expect(result!.discountValue).toBe(10);
    });

    it('should provide defaults for missing optional fields', () => {
      const minimalCart = {
        items: [],
      };

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(minimalCart));

      const result = loadCart();

      expect(result).not.toBeNull();
      expect(result!.lockedItemIds).toEqual([]);
      expect(result!.activeOrderId).toBeNull();
      expect(result!.orderType).toBe('dine_in');
      expect(result!.discountValue).toBe(0);
    });
  });

  describe('clearPersistedCart', () => {
    it('should remove cart from localStorage', () => {
      clearPersistedCart();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        CART_PERSISTENCE_KEY
      );
    });

    it('should not throw on localStorage error', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      expect(() => clearPersistedCart()).not.toThrow();
    });
  });

  describe('hasPersistedCart', () => {
    it('should return false when no cart exists', () => {
      expect(hasPersistedCart()).toBe(false);
    });

    it('should return true when cart exists', () => {
      localStorageMock.getItem.mockReturnValueOnce('{}');

      expect(hasPersistedCart()).toBe(true);
    });

    it('should return false when localStorage throws error', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage access denied');
      });

      expect(hasPersistedCart()).toBe(false);
    });
  });

  describe('saveCart/loadCart round-trip', () => {
    it('should preserve all data through save/load cycle', () => {
      const originalState: TSaveCartInput = {
        items: [
          {
            ...createMockCartItem('item-1', 'prod-1', 'Product 1'),
            modifiers: [
              {
                groupName: 'Temperature',
                optionId: 'opt-1',
                optionLabel: 'Iced',
                priceAdjustment: 2000,
              },
            ],
            modifiersTotal: 2000,
            totalPrice: 12000,
          },
        ],
        lockedItemIds: ['item-1'],
        activeOrderId: 'LOCAL-123',
        activeOrderNumber: 'OFFLINE-20260201-005',
        orderType: 'delivery',
        tableNumber: null,
        customerId: 'cust-abc',
        customerName: 'Test Customer',
        discountType: 'amount',
        discountValue: 5000,
        discountReason: 'Promo code',
      };

      // Save
      saveCart(originalState);

      // Get the saved string and set it up for load
      const savedString = localStorageMock.setItem.mock.calls[0][1];
      localStorageMock.getItem.mockReturnValueOnce(savedString);

      // Load
      const loadedState = loadCart();

      expect(loadedState).not.toBeNull();
      expect(loadedState!.items).toHaveLength(1);
      expect(loadedState!.items[0].id).toBe('item-1');
      expect(loadedState!.items[0].modifiers).toHaveLength(1);
      expect(loadedState!.lockedItemIds).toEqual(['item-1']);
      expect(loadedState!.activeOrderId).toBe('LOCAL-123');
      expect(loadedState!.orderType).toBe('delivery');
      expect(loadedState!.customerId).toBe('cust-abc');
      expect(loadedState!.discountType).toBe('amount');
      expect(loadedState!.discountValue).toBe(5000);
      expect(loadedState!.savedAt).toBeDefined();
    });
  });

  describe('validateAndFilterCartItems', () => {
    it('should keep items with valid products in offline cache', async () => {
      // Add product to offline cache
      await db.offline_products.add({
        id: 'prod-1',
        name: 'Valid Product',
        sku: 'SKU-1',
        retail_price: 10000,
        category_id: 'cat-1',
        product_type: 'finished',
        is_active: true,
        pos_visible: true,
        available_for_sale: true,
        wholesale_price: null,
        cost_price: null,
        image_url: null,
        updated_at: new Date().toISOString(),
      });

      const items = [createMockCartItem('item-1', 'prod-1', 'Valid Product')];

      const { validItems, removedNames } =
        await validateAndFilterCartItems(items);

      expect(validItems).toHaveLength(1);
      expect(validItems[0].id).toBe('item-1');
      expect(removedNames).toHaveLength(0);
    });

    it('should remove items with products not in offline cache', async () => {
      const items = [
        createMockCartItem('item-1', 'non-existent-prod', 'Missing Product'),
      ];

      const { validItems, removedNames } =
        await validateAndFilterCartItems(items);

      expect(validItems).toHaveLength(0);
      expect(removedNames).toHaveLength(1);
      expect(removedNames[0]).toBe('Missing Product');
    });

    it('should remove items with inactive products', async () => {
      // Add inactive product to offline cache
      await db.offline_products.add({
        id: 'prod-inactive',
        name: 'Inactive Product',
        sku: 'SKU-I',
        retail_price: 10000,
        category_id: 'cat-1',
        product_type: 'finished',
        is_active: false, // Inactive
        pos_visible: true,
        available_for_sale: true,
        wholesale_price: null,
        cost_price: null,
        image_url: null,
        updated_at: new Date().toISOString(),
      });

      const items = [
        createMockCartItem('item-1', 'prod-inactive', 'Inactive Product'),
      ];

      const { validItems, removedNames } =
        await validateAndFilterCartItems(items);

      expect(validItems).toHaveLength(0);
      expect(removedNames).toHaveLength(1);
    });

    it('should remove items with products not visible in POS', async () => {
      // Add product that is not POS visible
      await db.offline_products.add({
        id: 'prod-hidden',
        name: 'Hidden Product',
        sku: 'SKU-H',
        retail_price: 10000,
        category_id: 'cat-1',
        product_type: 'finished',
        is_active: true,
        pos_visible: false, // Not visible in POS
        available_for_sale: true,
        wholesale_price: null,
        cost_price: null,
        image_url: null,
        updated_at: new Date().toISOString(),
      });

      const items = [
        createMockCartItem('item-1', 'prod-hidden', 'Hidden Product'),
      ];

      const { validItems, removedNames } =
        await validateAndFilterCartItems(items);

      expect(validItems).toHaveLength(0);
      expect(removedNames).toHaveLength(1);
      expect(removedNames[0]).toBe('Hidden Product');
    });

    it('should remove items with products not available for sale', async () => {
      // Add product that is not available for sale
      await db.offline_products.add({
        id: 'prod-unavailable',
        name: 'Unavailable Product',
        sku: 'SKU-U',
        retail_price: 10000,
        category_id: 'cat-1',
        product_type: 'finished',
        is_active: true,
        pos_visible: true,
        available_for_sale: false, // Not available for sale
        wholesale_price: null,
        cost_price: null,
        image_url: null,
        updated_at: new Date().toISOString(),
      });

      const items = [
        createMockCartItem('item-1', 'prod-unavailable', 'Unavailable Product'),
      ];

      const { validItems, removedNames } =
        await validateAndFilterCartItems(items);

      expect(validItems).toHaveLength(0);
      expect(removedNames).toHaveLength(1);
      expect(removedNames[0]).toBe('Unavailable Product');
    });

    it('should keep combo items without validation (MVP)', async () => {
      const comboItem: CartItem = {
        id: 'combo-item-1',
        type: 'combo',
        combo: {
          id: 'combo-1',
          name: 'Breakfast Combo',
        } as any,
        quantity: 1,
        unitPrice: 25000,
        modifiers: [],
        comboSelections: [],
        modifiersTotal: 0,
        notes: '',
        totalPrice: 25000,
      };

      const { validItems, removedNames } = await validateAndFilterCartItems([
        comboItem,
      ]);

      expect(validItems).toHaveLength(1);
      expect(validItems[0].type).toBe('combo');
      expect(removedNames).toHaveLength(0);
    });

    it('should preserve locked items that are valid', async () => {
      // Add products to offline cache
      await db.offline_products.bulkAdd([
        {
          id: 'prod-1',
          name: 'Product 1',
          sku: 'SKU-1',
          retail_price: 10000,
          category_id: 'cat-1',
          product_type: 'finished',
          is_active: true,
          pos_visible: true,
          available_for_sale: true,
          wholesale_price: null,
          cost_price: null,
          image_url: null,
          updated_at: new Date().toISOString(),
        },
        {
          id: 'prod-2',
          name: 'Product 2',
          sku: 'SKU-2',
          retail_price: 15000,
          category_id: 'cat-1',
          product_type: 'finished',
          is_active: true,
          pos_visible: true,
          available_for_sale: true,
          wholesale_price: null,
          cost_price: null,
          image_url: null,
          updated_at: new Date().toISOString(),
        },
      ]);

      const items = [
        createMockCartItem('item-1', 'prod-1', 'Product 1'),
        createMockCartItem('item-2', 'prod-2', 'Product 2'),
      ];

      const { validItems, removedNames } =
        await validateAndFilterCartItems(items);

      expect(validItems).toHaveLength(2);
      expect(removedNames).toHaveLength(0);

      // Verify IDs are preserved (for locked items filtering)
      expect(validItems.map((i) => i.id)).toContain('item-1');
      expect(validItems.map((i) => i.id)).toContain('item-2');
    });

    it('should filter mixed valid and invalid items', async () => {
      // Only add one product
      await db.offline_products.add({
        id: 'prod-valid',
        name: 'Valid Product',
        sku: 'SKU-V',
        retail_price: 10000,
        category_id: 'cat-1',
        product_type: 'finished',
        is_active: true,
        pos_visible: true,
        available_for_sale: true,
        wholesale_price: null,
        cost_price: null,
        image_url: null,
        updated_at: new Date().toISOString(),
      });

      const items = [
        createMockCartItem('item-1', 'prod-valid', 'Valid Product'),
        createMockCartItem('item-2', 'prod-missing', 'Missing Product'),
        createMockCartItem('item-3', 'prod-valid', 'Valid Product Again'),
      ];

      const { validItems, removedNames } =
        await validateAndFilterCartItems(items);

      expect(validItems).toHaveLength(2);
      expect(removedNames).toHaveLength(1);
      expect(removedNames[0]).toBe('Missing Product');
    });
  });
});
