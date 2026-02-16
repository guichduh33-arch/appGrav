/**
 * KDS Sound Service
 * Centralized service for managing KDS notification sounds
 */

import { playNewOrderSound, playUrgentSound, playOrderReadySound } from '../utils/audio';

class KdsSoundService {
    private enabled: boolean = true;

    /**
     * Enable or disable sounds
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Play sound for a new incoming order
     */
    playNewOrder(): void {
        if (this.enabled) {
            playNewOrderSound();
        }
    }

    /**
     * Play sound for an order that has become urgent (critical time exceeded)
     */
    playUrgent(): void {
        if (this.enabled) {
            playUrgentSound();
        }
    }

    /**
     * Play sound for an order item marked as ready
     */
    playReady(): void {
        if (this.enabled) {
            playOrderReadySound();
        }
    }
}

export const kdsSoundService = new KdsSoundService();
export default kdsSoundService;
