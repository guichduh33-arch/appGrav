import { db } from '@/lib/db';
import type { IOfflineHeldOrder } from '@/types/offline';

/**
 * Service for managing held orders in IndexedDB.
 * Used for persisting orders when sending to kitchen without immediate payment.
 */
export const heldOrdersService = {
    /**
     * Saves a held order to local cache.
     */
    async saveHeldOrder(order: Omit<IOfflineHeldOrder, 'created_at'>): Promise<string> {
        const heldOrder: IOfflineHeldOrder = {
            ...order,
            created_at: new Date().toISOString(),
        };
        await db.offline_held_orders.put(heldOrder);
        return heldOrder.id;
    },

    /**
     * Retrieves all held orders for the current terminal/session.
     */
    async getHeldOrders(terminalId: string): Promise<IOfflineHeldOrder[]> {
        return db.offline_held_orders
            .where('terminal_id')
            .equals(terminalId)
            .reverse()
            .sortBy('created_at');
    },

    /**
     * Removes a held order by ID (e.g., when it becomes a real order).
     */
    async deleteHeldOrder(id: string): Promise<void> {
        await db.offline_held_orders.delete(id);
    },

    /**
     * Clears old held orders (e.g., from previous sessions).
     */
    async clearOldHeldOrders(beforeDate: Date): Promise<number> {
        const count = await db.offline_held_orders
            .where('created_at')
            .below(beforeDate.toISOString())
            .delete();
        return count;
    }
};
