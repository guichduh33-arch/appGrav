import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateDeviceToken,
  hashToken,
} from './syncDeviceService';

// Mock crypto.subtle for testing
const mockDigest = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  // Mock crypto.subtle.digest
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => 'mock-uuid-1234-5678-9abc-def012345678',
      subtle: {
        digest: mockDigest.mockImplementation(async (_algorithm: string, data: ArrayBuffer) => {
          // Create a deterministic hash based on input
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

describe('syncDeviceService', () => {
  describe('generateDeviceToken', () => {
    it('should generate a 64-character hex token', async () => {
      const token = await generateDeviceToken('test-device-id');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64);
      expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    });

    it('should generate different tokens for different device IDs', async () => {
      const token1 = await generateDeviceToken('device-1');
      const token2 = await generateDeviceToken('device-2');

      // With mocked crypto, tokens will differ based on input
      expect(token1).not.toBe(token2);
    });

    it('should call crypto.subtle.digest with SHA-256', async () => {
      await generateDeviceToken('test-device');

      expect(mockDigest).toHaveBeenCalledWith('SHA-256', expect.any(ArrayBuffer));
    });
  });

  describe('hashToken', () => {
    it('should hash a token to 64-character hex string', async () => {
      const hash = await hashToken('my-secret-token');

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64);
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });

    it('should produce same hash for same input', async () => {
      const hash1 = await hashToken('same-token');
      const hash2 = await hashToken('same-token');

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', async () => {
      const hash1 = await hashToken('token-a');
      const hash2 = await hashToken('token-b');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Token format validation', () => {
    it('should generate tokens in consistent hex format', async () => {
      const tokens = await Promise.all([
        generateDeviceToken('device-1'),
        generateDeviceToken('device-2'),
        generateDeviceToken('device-3'),
      ]);

      for (const token of tokens) {
        // Should be lowercase hex
        expect(token).toMatch(/^[0-9a-f]{64}$/);
      }
    });

    it('should generate hashes in consistent hex format', async () => {
      const hashes = await Promise.all([
        hashToken('token-1'),
        hashToken('token-2'),
        hashToken('token-3'),
      ]);

      for (const hash of hashes) {
        // Should be lowercase hex
        expect(hash).toMatch(/^[0-9a-f]{64}$/);
      }
    });
  });

  describe('Security properties', () => {
    it('should not expose raw secrets in generated token', async () => {
      const deviceId = 'sensitive-device-id';
      const token = await generateDeviceToken(deviceId);

      // Token should not contain the device ID
      expect(token.includes(deviceId)).toBe(false);
    });

    it('should incorporate randomness via UUID', async () => {
      // The mock UUID is used, so we verify it's incorporated
      const token = await generateDeviceToken('device-id');

      // Token should be different from just hashing the device ID
      const simpleHash = await hashToken('device-id');
      expect(token).not.toBe(simpleHash);
    });
  });
});
