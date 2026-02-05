import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  LAN_MESSAGE_TYPES,
  createMessage,
  hashPayload,
} from './lanProtocol';
import type { TLanMessageType, ILanMessage, ICartUpdatePayload } from './lanProtocol';

// Mock crypto.subtle for testing
const mockDigest = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  // Mock crypto.subtle.digest and randomUUID
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => 'mock-uuid-1234-5678-9abc-def012345678',
      subtle: {
        digest: mockDigest.mockImplementation(async (_algorithm: string, data: ArrayBuffer) => {
          const view = new Uint8Array(data);
          const hash = new Uint8Array(32);
          for (let i = 0; i < 32; i++) {
            hash[i] = (view[i % view.length] + i) % 256;
          }
          return hash.buffer;
        }),
      },
    },
    writable: true,
    configurable: true,
  });
});

describe('lanProtocol', () => {
  describe('LAN_MESSAGE_TYPES', () => {
    it('should have all required connection message types', () => {
      expect(LAN_MESSAGE_TYPES.HEARTBEAT).toBe('heartbeat');
      expect(LAN_MESSAGE_TYPES.NODE_REGISTER).toBe('node_register');
      expect(LAN_MESSAGE_TYPES.NODE_DEREGISTER).toBe('node_deregister');
      expect(LAN_MESSAGE_TYPES.HUB_ANNOUNCE).toBe('hub_announce');
    });

    it('should have all required cart/order message types', () => {
      expect(LAN_MESSAGE_TYPES.CART_UPDATE).toBe('cart_update');
      expect(LAN_MESSAGE_TYPES.CART_CLEAR).toBe('cart_clear');
      expect(LAN_MESSAGE_TYPES.ORDER_CREATE).toBe('order_create');
      expect(LAN_MESSAGE_TYPES.ORDER_UPDATE).toBe('order_update');
      expect(LAN_MESSAGE_TYPES.ORDER_COMPLETE).toBe('order_complete');
    });

    it('should have all required display message types', () => {
      expect(LAN_MESSAGE_TYPES.DISPLAY_CART).toBe('display_cart');
      expect(LAN_MESSAGE_TYPES.DISPLAY_TOTAL).toBe('display_total');
      expect(LAN_MESSAGE_TYPES.DISPLAY_WELCOME).toBe('display_welcome');
      expect(LAN_MESSAGE_TYPES.DISPLAY_ORDER_READY).toBe('display_order_ready');
    });

    it('should have all required KDS message types', () => {
      expect(LAN_MESSAGE_TYPES.KDS_NEW_ORDER).toBe('kds_new_order');
      expect(LAN_MESSAGE_TYPES.KDS_ORDER_READY).toBe('kds_order_ready');
      expect(LAN_MESSAGE_TYPES.KDS_ORDER_BUMP).toBe('kds_order_bump');
    });

    it('should have all required sync message types', () => {
      expect(LAN_MESSAGE_TYPES.SYNC_REQUEST).toBe('sync_request');
      expect(LAN_MESSAGE_TYPES.SYNC_RESPONSE).toBe('sync_response');
      expect(LAN_MESSAGE_TYPES.FULL_SYNC).toBe('full_sync');
    });
  });

  describe('createMessage', () => {
    it('should create a message with all required fields', () => {
      const payload = { test: 'data' };
      const message = createMessage(
        LAN_MESSAGE_TYPES.HEARTBEAT,
        'device-123',
        payload
      );

      expect(message.id).toBe('mock-uuid-1234-5678-9abc-def012345678');
      expect(message.type).toBe('heartbeat');
      expect(message.from).toBe('device-123');
      expect(message.to).toBeUndefined();
      expect(message.payload).toEqual(payload);
      expect(message.timestamp).toBeDefined();
    });

    it('should create a message with recipient', () => {
      const payload = { order_id: 'order-1' };
      const message = createMessage(
        LAN_MESSAGE_TYPES.ORDER_CREATE,
        'pos-device-1',
        payload,
        'kds-device-1'
      );

      expect(message.from).toBe('pos-device-1');
      expect(message.to).toBe('kds-device-1');
    });

    it('should create cart update message with proper structure', () => {
      const cartPayload: ICartUpdatePayload = {
        cart_id: 'cart-123',
        items: [
          { product_id: 'prod-1', quantity: 2, price: 15000, name: 'Croissant' },
          { product_id: 'prod-2', quantity: 1, price: 25000, name: 'Pain au chocolat' },
        ],
        total: 55000,
        customer_id: 'cust-123',
      };

      const message: ILanMessage<ICartUpdatePayload> = createMessage(
        LAN_MESSAGE_TYPES.CART_UPDATE,
        'pos-1',
        cartPayload
      );

      expect(message.type).toBe('cart_update');
      expect(message.payload.cart_id).toBe('cart-123');
      expect(message.payload.items).toHaveLength(2);
      expect(message.payload.total).toBe(55000);
    });

    it('should generate ISO timestamp', () => {
      const message = createMessage(LAN_MESSAGE_TYPES.HEARTBEAT, 'device-1', {});

      // Should be valid ISO date string
      expect(() => new Date(message.timestamp)).not.toThrow();
      expect(message.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('hashPayload', () => {
    it('should generate a 64-character hex hash', async () => {
      const payload = { test: 'data' };
      const hash = await hashPayload(payload);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64);
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });

    it('should generate same hash for same payload', async () => {
      const payload = { key: 'value', num: 123 };
      const hash1 = await hashPayload(payload);
      const hash2 = await hashPayload(payload);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different payloads', async () => {
      const hash1 = await hashPayload({ a: 1 });
      const hash2 = await hashPayload({ a: 2 });

      expect(hash1).not.toBe(hash2);
    });

    it('should call crypto.subtle.digest with SHA-256', async () => {
      await hashPayload({ test: 'payload' });

      expect(mockDigest).toHaveBeenCalledTimes(1);
      const [algorithm, data] = mockDigest.mock.calls[0];
      expect(algorithm).toBe('SHA-256');
      // Verify data is a typed array (Uint8Array or ArrayBuffer view)
      expect(data.constructor.name).toBe('Uint8Array');
    });
  });

  describe('Message type validation', () => {
    it('should have unique message type values', () => {
      const values = Object.values(LAN_MESSAGE_TYPES);
      const uniqueValues = new Set(values);

      expect(uniqueValues.size).toBe(values.length);
    });

    it('should have all message types as lowercase snake_case', () => {
      const values = Object.values(LAN_MESSAGE_TYPES);

      for (const value of values) {
        expect(value).toMatch(/^[a-z_]+$/);
      }
    });
  });

  describe('Type exports', () => {
    it('should export TLanMessageType correctly', () => {
      const messageType: TLanMessageType = LAN_MESSAGE_TYPES.HEARTBEAT;
      expect(messageType).toBe('heartbeat');
    });

    it('should allow all defined message types', () => {
      const types: TLanMessageType[] = [
        'heartbeat',
        'node_register',
        'cart_update',
        'display_cart',
        'kds_new_order',
        'sync_request',
      ];

      expect(types).toHaveLength(6);
    });
  });
});
