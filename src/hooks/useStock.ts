import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type Product = Database['public']['Tables']['products']['Row'] & {
    category?: { name: string } | null;
};

type StockMovementInput = {
    productId: string;
    type: 'purchase' | 'waste' | 'adjustment_in' | 'adjustment_out' | 'sale' | 'production';
    quantity: number;
    reason?: string;
};

export const useStock = () => {
    const queryClient = useQueryClient();

    // Fetch all products with current stock
    const { data: products, isLoading, error } = useQuery({
        queryKey: ['stock-products'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select(`
          *,
          category:categories(name)
        `)
                .order('name');

            if (error) throw error;
            return data as Product[];
        }
    });

    // Create a stock movement (adjust stock)
    const { mutateAsync: createMovement, isPending: isAdjusting } = useMutation({
        mutationFn: async (input: StockMovementInput) => {
            // Insert movement - DB trigger will handle stock updates

            const { data, error } = await supabase
                .from('stock_movements')
                .insert({
                    product_id: input.productId,
                    movement_type: input.type,
                    quantity: input.quantity,
                    reason: input.reason || null
                } as any)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            // Invalidate products query to refresh stock levels
            queryClient.invalidateQueries({ queryKey: ['stock-products'] });
            queryClient.invalidateQueries({ queryKey: ['products'] }); // Also invalidate POS products
        }
    });

    return {
        products,
        isLoading,
        error,
        createMovement,
        isAdjusting
    };
};
