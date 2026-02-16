import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import logger from '@/utils/logger';

/**
 * Hook to subscribe to real-time status changes in the orders table.
 * When an order status changes (e.g., from 'preparing' to 'ready'),
 * it invalidates the relevant React Query keys to trigger a UI refresh.
 */
export function useOrderStatusSubscription() {
    const queryClient = useQueryClient();

    useEffect(() => {
        logger.info('[POS] Initializing order status subscription...');

        const channel = supabase
            .channel('public:orders-status')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                },
                (payload) => {
                    const { id, status, order_number } = payload.new;
                    const oldStatus = payload.old?.status;

                    if (status !== oldStatus) {
                        logger.info(`[POS] Order ${order_number} (${id}) status changed: ${oldStatus} -> ${status}`);

                        // Invalidate orders queries to refresh the UI
                        queryClient.invalidateQueries({ queryKey: ['orders'] });

                        // If it's a specific order we might be viewing, invalidate that too
                        queryClient.invalidateQueries({ queryKey: ['order', id] });

                        // Notify user of status change (this can be expanded with toast notifications)
                        if (status === 'ready') {
                            logger.info(`[POS] Order ${order_number} is READY!`);
                        }
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    logger.info('[POS] Successfully subscribed to order status changes');
                } else {
                    logger.error(`[POS] Subscription status: ${status}`);
                }
            });

        return () => {
            logger.info('[POS] Cleaning up order status subscription...');
            supabase.removeChannel(channel);
        };
    }, [queryClient]);
}
