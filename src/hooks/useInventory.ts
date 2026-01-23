import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Product, Supplier, Insertable } from '../types/database'
import { useAuthStore } from '../stores/authStore'
import { MOCK_PRODUCTS } from './products'

// Type that matches what InventoryTable expects (with optional is_raw_material for mock data compatibility)
type InventoryItem = Product & { category: { name: string } | null; is_raw_material?: boolean }

export function useInventoryItems() {
    return useQuery({
        queryKey: ['inventory'],
        queryFn: async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select(`
                        *,
                        category:categories(name)
                    `)
                    .order('name')

                if (error) {
                    console.error('Inventory Supabase Error:', error)
                    throw error
                }

                if (!data || data.length === 0) {
                    console.warn('No inventory from Supabase, using mock')
                    return MOCK_PRODUCTS.map((p, i) => ({
                        ...p,
                        current_stock: 50 - (i % 20),
                        min_stock_level: 10,
                        unit: 'pcs',
                        // Ensure product_type matches expected enum strings if missing
                        product_type: i % 3 === 0 ? 'raw_material' : (i % 3 === 1 ? 'finished' : 'semi_finished'),
                        is_raw_material: i % 3 === 0
                    })) as unknown as InventoryItem[]
                }

                return data as InventoryItem[]
            } catch (err) {
                console.warn('Failed to fetch inventory, using mock data', err)
                return MOCK_PRODUCTS.map((p, i) => ({
                    ...p,
                    current_stock: 50 - (i % 20),
                    min_stock_level: 10,
                    unit: 'pcs',
                    product_type: i % 3 === 0 ? 'raw_material' : (i % 3 === 1 ? 'finished' : 'semi_finished'),
                    is_raw_material: i % 3 === 0
                })) as unknown as InventoryItem[]
            }
        }
    })
}

export function useSuppliers() {
    return useQuery({
        queryKey: ['suppliers'],
        queryFn: async (): Promise<Supplier[]> => {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) {
                console.error('Suppliers Fetch Error:', error);
                return [];
            }
            return data || [];
        }
    });
}

export function useStockAdjustment() {
    const queryClient = useQueryClient()
    const { user } = useAuthStore()

    return useMutation({
        mutationFn: async ({
            productId,
            type,
            quantity,
            reason,
            notes,
            supplierId
        }: {
            productId: string
            type: 'purchase' | 'waste' | 'adjustment_in' | 'adjustment_out'
            quantity: number
            reason: string
            notes?: string
            supplierId?: string
        }) => {
            if (!user) {
                // Allow non-logged in users to "simulate" for demo
                console.warn('No user logged in, simulating adjustment')
                return { success: true }
            }

            const movementData = {
                product_id: productId,
                movement_type: type,
                quantity: quantity,
                reason: reason,
                notes: notes || null,
                created_by: user.id,
                supplier_id: supplierId || null
            } as unknown as Insertable<'stock_movements'>

            const { data, error } = await supabase
                .from('stock_movements')
                .insert(movementData)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] })
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        }
    })
}

export function useProductRecipe(productId: string | null) {
    return useQuery({
        queryKey: ['recipe', productId],
        queryFn: async () => {
            if (!productId) return []

            try {
                const { data, error } = await supabase
                    .from('recipes')
                    .select(`
                        *,
                        material:products!material_id(id, name, unit, current_stock)
                    `)
                    .eq('product_id', productId)
                    .eq('is_active', true)

                if (error) {
                    console.warn('Recipe query error:', error)
                    return []
                }
                return data || []
            } catch (err) {
                console.warn('Failed to fetch recipe:', err)
                return []
            }
        },
        enabled: !!productId
    })
}
