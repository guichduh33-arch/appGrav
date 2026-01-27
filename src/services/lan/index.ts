/**
 * LAN Services Index
 * Epic 4 - Communication LAN Inter-Appareils
 *
 * Exports all LAN-related services and types.
 */

// Protocol and types
export * from './lanProtocol';

// Hub service (POS)
export { lanHub } from './lanHub';

// Client service (KDS, Display, Mobile)
export { lanClient } from './lanClient';
