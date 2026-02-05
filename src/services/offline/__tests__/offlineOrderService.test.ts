/**
 * Tests for Offline Order Service (Story 3.3)
 *
 * Tests cart-to-order conversion, tax calculation,
 * and integration with ordersCacheService.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import {
  createOfflineOrder,
  convertCartItemToOrderItem,
  calculateTaxAmount,
  type ICartStateForOrder,
} from '../offlineOrderService';
import type { CartItem, CartModifier } from '@/stores/cartStore';
import type { Product } from '@/types/database';

// =====================================================
// Test Fixtures
// =====================================================

const mockProduct = {
  id: 'prod-001',
  name: 'Croissant',
  sku: 'CRO-001',
  category_id: 'cat-001',
  retail_price: 25000,
  wholesale_price: 20000,
  cost_price: 10000,
  product_type: 'finished',
  is_active: true,
  pos_visible: true,
  available_for_sale: true,
  image_url: null,
  description: null,
  unit: 'pcs',
  min_stock_level: null,
  current_stock: 100,
  deduct_ingredients: null,
  is_made_to_order: null,
  deleted_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
} as unknown as Product;

const mockModifiers: CartModifier[] = [
  {
    groupName: 'Size',
    optionId: 'opt-large',
    optionLabel: 'Large',
    priceAdjustment: 5000,
  },
];

const mockCartItem: CartItem = {
  id: 'cart-item-001',
  type: 'product',
  product: mockProduct,
  quantity: 2,
  unitPrice: 25000,
  modifiers: mockModifiers,
  modifiersTotal: 5000,
  notes: 'Extra butter',
  totalPrice: 60000, // (25000 + 5000) * 2
};

const mockComboCartItem: CartItem = {
  id: 'cart-item-002',
  type: 'combo',
  combo: {
    id: 'combo-001',
    name: 'Breakfast Deal',
    description: 'Croissant + Coffee',
    combo_price: 35000,
    is_active: true,
    available_at_pos: true,
    image_url: null,
    sort_order: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  quantity: 1,
  unitPrice: 35000,
  modifiers: [],
  comboSelections: [
    {
      group_id: 'group-001',
      group_name: 'Drink',
      item_id: 'item-001',
      product_id: 'prod-coffee',
      product_name: 'Americano',
      price_adjustment: 0,
    },
  ],
  modifiersTotal: 0,
  notes: '',
  totalPrice: 35000,
};

const mockCategory = {
  id: 'cat-001',
  name: 'Pastries',
  icon: 'croissant',
  color: '#f5a623',
  sort_order: 1,
  dispatch_station: 'kitchen' as const,
  is_active: true,
  is_raw_material: false,
  updated_at: '2026-01-01T00:00:00Z',
};

const mockCartState: ICartStateForOrder = {
  items: [mockCartItem],
  orderType: 'dine_in',
  tableNumber: 'T-05',
  customerId: 'cust-001',
  discountType: 'percent',
  discountValue: 10,
  discountReason: 'Regular customer',
  subtotal: 60000,
  discountAmount: 6000,
  total: 54000,
};

// =====================================================
// Test Setup
// =====================================================

describe('offlineOrderService', () => {
  beforeEach(async () => {
    // Clear all tables before each test
    await db.offline_orders.clear();
    await db.offline_order_items.clear();
    await db.offline_sync_queue.clear();
    await db.offline_categories.clear();

    // Add mock category for dispatch station lookup
    await db.offline_categories.add(mockCategory);
  });

  afterEach(async () => {
    // Clean up
    await db.offline_orders.clear();
    await db.offline_order_items.clear();
    await db.offline_sync_queue.clear();
    await db.offline_categories.clear();
  });

  // =====================================================
  // calculateTaxAmount Tests
  // =====================================================

  describe('calculateTaxAmount', () => {
    it('calculates 10% tax from total (included, not added)', () => {
      // Tax is included in price: total × 10/110
      expect(calculateTaxAmount(110000)).toBe(10000);
      expect(calculateTaxAmount(55000)).toBe(5000);
      expect(calculateTaxAmount(220000)).toBe(20000);
    });

    it('rounds to nearest IDR', () => {
      // 54000 × 10/110 = 4909.09... → 4909
      expect(calculateTaxAmount(54000)).toBe(4909);
      // 12345 × 10/110 = 1122.27... → 1122
      expect(calculateTaxAmount(12345)).toBe(1122);
    });

    it('handles zero total', () => {
      expect(calculateTaxAmount(0)).toBe(0);
    });
  });

  // =====================================================
  // convertCartItemToOrderItem Tests
  // =====================================================

  describe('convertCartItemToOrderItem', () => {
    it('converts product item with modifiers', async () => {
      const result = await convertCartItemToOrderItem(mockCartItem);

      expect(result.product_id).toBe('prod-001');
      expect(result.product_name).toBe('Croissant');
      expect(result.product_sku).toBe('CRO-001');
      expect(result.quantity).toBe(2);
      expect(result.unit_price).toBe(25000);
      expect(result.subtotal).toBe(60000);
      expect(result.notes).toBe('Extra butter');
      expect(result.item_status).toBe('pending');
    });

    it('maps modifiers correctly', async () => {
      const result = await convertCartItemToOrderItem(mockCartItem);

      expect(result.modifiers).toHaveLength(1);
      expect(result.modifiers[0]).toEqual({
        option_id: 'opt-large',
        group_name: 'Size',
        option_label: 'Large',
        price_adjustment: 5000,
      });
    });

    it('resolves dispatch station from category', async () => {
      const result = await convertCartItemToOrderItem(mockCartItem);

      expect(result.dispatch_station).toBe('kitchen');
    });

    it('handles product without category', async () => {
      const itemWithoutCategory: CartItem = {
        ...mockCartItem,
        product: { ...mockProduct, category_id: null },
      };

      const result = await convertCartItemToOrderItem(itemWithoutCategory);

      expect(result.dispatch_station).toBeNull();
    });

    it('converts combo item with selections', async () => {
      const result = await convertCartItemToOrderItem(mockComboCartItem);

      expect(result.product_id).toBe('combo-001');
      expect(result.product_name).toBe('Breakfast Deal');
      expect(result.product_sku).toBeNull();
      expect(result.quantity).toBe(1);
      expect(result.subtotal).toBe(35000);
      expect(result.dispatch_station).toBeNull(); // Combos have null dispatch
    });

    it('maps combo selections as modifiers', async () => {
      const result = await convertCartItemToOrderItem(mockComboCartItem);

      expect(result.modifiers).toHaveLength(1);
      expect(result.modifiers[0]).toEqual({
        option_id: 'item-001',
        group_name: 'Drink',
        option_label: 'Americano',
        price_adjustment: 0,
      });
    });

    it('throws for invalid cart item', async () => {
      const invalidItem: CartItem = {
        id: 'invalid',
        type: 'product',
        product: undefined,
        quantity: 1,
        unitPrice: 0,
        modifiers: [],
        modifiersTotal: 0,
        notes: '',
        totalPrice: 0,
      };

      await expect(convertCartItemToOrderItem(invalidItem)).rejects.toThrow(
        'Invalid cart item: must have product or combo'
      );
    });
  });

  // =====================================================
  // createOfflineOrder Tests
  // =====================================================

  describe('createOfflineOrder', () => {
    it('creates order with correct structure', async () => {
      const { order, items: _items } = await createOfflineOrder(
        mockCartState,
        'user-001',
        'session-001'
      );

      // Order structure
      expect(order.id).toMatch(/^LOCAL-/);
      expect(order.order_number).toMatch(/^OFFLINE-\d{8}-\d{3}$/);
      expect(order.status).toBe('pending');
      expect(order.order_type).toBe('dine_in');
      expect(order.sync_status).toBe('pending_sync');
      expect(order.user_id).toBe('user-001');
      expect(order.session_id).toBe('session-001');
    });

    it('calculates tax correctly (10% included)', async () => {
      const { order } = await createOfflineOrder(
        mockCartState,
        'user-001',
        null
      );

      // Total is 54000, tax = 54000 × 10/110 = 4909
      expect(order.tax_amount).toBe(4909);
      expect(order.total).toBe(54000);
    });

    it('preserves customer_id and table_number', async () => {
      const { order } = await createOfflineOrder(
        mockCartState,
        'user-001',
        null
      );

      expect(order.customer_id).toBe('cust-001');
      expect(order.table_number).toBe('T-05');
    });

    it('maps discount type correctly', async () => {
      const { order } = await createOfflineOrder(
        mockCartState,
        'user-001',
        null
      );

      // Cart uses 'percent', order uses 'percentage'
      expect(order.discount_type).toBe('percentage');
      expect(order.discount_value).toBe(10);
      expect(order.discount_amount).toBe(6000);
    });

    it('stores discount reason as notes', async () => {
      const { order } = await createOfflineOrder(
        mockCartState,
        'user-001',
        null
      );

      expect(order.notes).toBe('Regular customer');
    });

    it('converts all cart items to order items', async () => {
      const cartWithMultipleItems: ICartStateForOrder = {
        ...mockCartState,
        items: [mockCartItem, mockComboCartItem],
        total: 89000,
      };

      const { items } = await createOfflineOrder(
        cartWithMultipleItems,
        'user-001',
        null
      );

      expect(items).toHaveLength(2);
      expect(items[0].product_name).toBe('Croissant');
      expect(items[1].product_name).toBe('Breakfast Deal');
    });

    it('adds entry to sync queue', async () => {
      await createOfflineOrder(mockCartState, 'user-001', null);

      const syncItems = await db.offline_sync_queue.toArray();
      expect(syncItems).toHaveLength(1);
      expect(syncItems[0].entity).toBe('orders');
      expect(syncItems[0].action).toBe('create');
      expect(syncItems[0].status).toBe('pending');
    });

    it('throws for empty cart', async () => {
      const emptyCart: ICartStateForOrder = {
        ...mockCartState,
        items: [],
      };

      await expect(createOfflineOrder(emptyCart, 'user-001', null)).rejects.toThrow(
        'Cannot create order with empty cart'
      );
    });

    it('throws for missing user_id', async () => {
      await expect(createOfflineOrder(mockCartState, '', null)).rejects.toThrow(
        'User ID is required to create an order'
      );
    });

    it('handles null session_id', async () => {
      const { order } = await createOfflineOrder(
        mockCartState,
        'user-001',
        null
      );

      expect(order.session_id).toBeNull();
    });

    it('handles null customer_id', async () => {
      const cartWithoutCustomer: ICartStateForOrder = {
        ...mockCartState,
        customerId: null,
      };

      const { order } = await createOfflineOrder(
        cartWithoutCustomer,
        'user-001',
        null
      );

      expect(order.customer_id).toBeNull();
    });

    it('handles null table_number', async () => {
      const takeawayCart: ICartStateForOrder = {
        ...mockCartState,
        orderType: 'takeaway',
        tableNumber: null,
      };

      const { order } = await createOfflineOrder(
        takeawayCart,
        'user-001',
        null
      );

      expect(order.order_type).toBe('takeaway');
      expect(order.table_number).toBeNull();
    });

    it('handles amount discount type', async () => {
      const cartWithAmountDiscount: ICartStateForOrder = {
        ...mockCartState,
        discountType: 'amount',
        discountValue: 5000,
        discountAmount: 5000,
      };

      const { order } = await createOfflineOrder(
        cartWithAmountDiscount,
        'user-001',
        null
      );

      expect(order.discount_type).toBe('amount');
      expect(order.discount_value).toBe(5000);
    });

    it('handles null discount type', async () => {
      const cartWithoutDiscount: ICartStateForOrder = {
        ...mockCartState,
        discountType: null,
        discountValue: 0,
        discountAmount: 0,
      };

      const { order } = await createOfflineOrder(
        cartWithoutDiscount,
        'user-001',
        null
      );

      expect(order.discount_type).toBeNull();
      expect(order.discount_value).toBeNull();
      expect(order.discount_amount).toBe(0);
    });
  });
});
