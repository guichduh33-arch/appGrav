/**
 * Sync Device Service
 * Story 1.4 - Sync Infrastructure Tables
 *
 * Handles device registration, token generation, and authentication
 * for offline sync functionality.
 */

import { supabase, untypedFrom } from '@/lib/supabase';
import type { ISyncDevice, TSyncDeviceType } from '@/types/database';

/**
 * Generate a secure token for device authentication
 * Uses crypto.subtle for SHA-256 hashing in the browser
 */
export async function generateDeviceToken(deviceId: string): Promise<string> {
  const secret = crypto.randomUUID();
  const timestamp = Date.now().toString();
  const data = `${deviceId}:${secret}:${timestamp}`;

  // Use Web Crypto API for SHA-256 hashing
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Generate a token hash from a raw token
 */
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Register a new device for sync
 * Returns the raw token (to be stored locally) - only returned once!
 */
export async function registerSyncDevice(
  deviceId: string,
  deviceType: TSyncDeviceType,
  deviceName?: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    // Generate a new token
    const token = await generateDeviceToken(deviceId);
    const tokenHash = await hashToken(token);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Insert device record
    const { error } = await untypedFrom('sync_devices')
      .upsert(
        {
          device_id: deviceId,
          device_type: deviceType,
          device_name: deviceName || null,
          user_id: user?.id || null,
          token_hash: tokenHash,
          is_active: true,
          last_seen: new Date().toISOString(),
        },
        { onConflict: 'device_id' }
      );

    if (error) {
      console.error('[syncDeviceService] Registration error:', error);
      return { success: false, error: error.message };
    }

    // Return the raw token - this should be stored locally and never exposed
    return { success: true, token };
  } catch (err) {
    console.error('[syncDeviceService] Unexpected error:', err);
    return { success: false, error: 'Failed to register device' };
  }
}

/**
 * Verify a device's token
 */
export async function verifyDeviceToken(
  deviceId: string,
  token: string
): Promise<boolean> {
  try {
    const tokenHash = await hashToken(token);

    const { data, error } = await untypedFrom('sync_devices')
      .select('token_hash')
      .eq('device_id', deviceId)
      .eq('is_active', true)
      .single() as { data: { token_hash: string } | null; error: unknown };

    if (error || !data) {
      return false;
    }

    return data.token_hash === tokenHash;
  } catch (err) {
    console.error('[syncDeviceService] Token verification error:', err);
    return false;
  }
}

/**
 * Update device's last seen timestamp
 */
export async function updateDeviceLastSeen(deviceId: string): Promise<void> {
  try {
    await untypedFrom('sync_devices')
      .update({ last_seen: new Date().toISOString() })
      .eq('device_id', deviceId);
  } catch (err) {
    console.error('[syncDeviceService] Update last seen error:', err);
  }
}

/**
 * Get device information
 */
export async function getDeviceInfo(deviceId: string): Promise<ISyncDevice | null> {
  try {
    const { data, error } = await untypedFrom('sync_devices')
      .select('*')
      .eq('device_id', deviceId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as ISyncDevice;
  } catch (err) {
    console.error('[syncDeviceService] Get device info error:', err);
    return null;
  }
}

/**
 * Deactivate a device (soft delete)
 */
export async function deactivateDevice(deviceId: string): Promise<boolean> {
  try {
    const { error } = await untypedFrom('sync_devices')
      .update({ is_active: false })
      .eq('device_id', deviceId);

    return !error;
  } catch (err) {
    console.error('[syncDeviceService] Deactivate device error:', err);
    return false;
  }
}

/**
 * Regenerate device token (for security rotation)
 * Returns the new raw token
 */
export async function regenerateDeviceToken(
  deviceId: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const token = await generateDeviceToken(deviceId);
    const tokenHash = await hashToken(token);

    const { error } = await untypedFrom('sync_devices')
      .update({
        token_hash: tokenHash,
        last_seen: new Date().toISOString(),
      })
      .eq('device_id', deviceId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, token };
  } catch (err) {
    console.error('[syncDeviceService] Regenerate token error:', err);
    return { success: false, error: 'Failed to regenerate token' };
  }
}

/**
 * Get all active devices
 */
export async function getActiveDevices(): Promise<ISyncDevice[]> {
  try {
    const { data, error } = await untypedFrom('sync_devices')
      .select('*')
      .eq('is_active', true)
      .order('last_seen', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as ISyncDevice[];
  } catch (err) {
    console.error('[syncDeviceService] Get active devices error:', err);
    return [];
  }
}

/**
 * Get offline table versions
 */
export async function getOfflineVersions(): Promise<Record<string, number>> {
  try {
    const { data, error } = await untypedFrom('offline_versions')
      .select('table_name, version') as { data: Array<{ table_name: string; version: number }> | null; error: unknown };

    if (error || !data) {
      return {};
    }

    const versions: Record<string, number> = {};
    for (const row of data) {
      versions[row.table_name] = row.version;
    }

    return versions;
  } catch (err) {
    console.error('[syncDeviceService] Get offline versions error:', err);
    return {};
  }
}

/**
 * Update offline table version
 */
export async function updateOfflineVersion(
  tableName: string,
  version: number,
  checksum?: string,
  rowCount?: number
): Promise<boolean> {
  try {
    const { error } = await untypedFrom('offline_versions')
      .upsert(
        {
          table_name: tableName,
          version,
          checksum: checksum || null,
          row_count: rowCount || 0,
          last_sync: new Date().toISOString(),
        },
        { onConflict: 'table_name' }
      );

    return !error;
  } catch (err) {
    console.error('[syncDeviceService] Update offline version error:', err);
    return false;
  }
}
