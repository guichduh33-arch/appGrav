import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Category, Product, ProductWithCategory } from '../types/database'
import { useNetworkStore } from '../stores/networkStore'
import logger from '@/utils/logger'
import {
    syncCategoriesToOffline,
    getCategoriesFromOffline,
    syncProductsToOffline,
    getProductsFromOffline,
    IOfflineCategory,
    IOfflineProduct,
} from '../services/sync/productSync'
import { MOCK_CATEGORIES } from '../data/mockCategories'
import { MOCK_PRODUCTS } from '../data/mockProducts'

// Re-export mock data for backward compatibility
export { MOCK_CATEGORIES, MOCK_PRODUCTS }

// Fetch all categories
export function useCategories() {
    const isOnline = useNetworkStore((state) => state.isOnline)

    return useQuery({
        queryKey: ['categories', isOnline],
        queryFn: async (): Promise<Category[]> => {
            // If offline, use IndexedDB data
            if (!isOnline) {
                logger.debug('[useCategories] Offline mode - loading from IndexedDB')
                try {
                    const offlineCategories = await getCategoriesFromOffline()
                    if (offlineCategories.length > 0) {
                        // Transform to Category type
                        return offlineCategories.map((c: IOfflineCategory) => ({
                            id: c.id,
                            name: c.name,
                            sort_order: c.display_order,
                            is_active: c.is_active,
                        })) as Category[]
                    }
                } catch (err) {
                    console.error('[useCategories] Error loading offline data:', err)
                }
                // Fallback to mock if no offline data
                return MOCK_CATEGORIES
            }

            // Online mode - fetch from Supabase and cache
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('is_raw_material', false)
                    .eq('is_active', true)
                    .order('sort_order')

                if (error) throw error
                if (data && data.length > 0) {
                    // Cache to IndexedDB for offline use
                    syncCategoriesToOffline().catch((err) =>
                        console.error('[useCategories] Error caching categories:', err)
                    )
                    return data
                }

                console.warn('No categories from Supabase, using mock')
                return MOCK_CATEGORIES
            } catch (err) {
                console.error('Error loading categories:', err)
                return MOCK_CATEGORIES
            }
        },
    })
}

// Fetch products (optionally filtered by category)
export function useProducts(categoryId: string | null = null) {
    const isOnline = useNetworkStore((state) => state.isOnline)

    return useQuery({
        queryKey: ['products', categoryId, isOnline],
        queryFn: async (): Promise<ProductWithCategory[]> => {
            // If offline, use IndexedDB data
            if (!isOnline) {
                logger.debug('[useProducts] Offline mode - loading from IndexedDB')
                try {
                    const offlineProducts = await getProductsFromOffline(categoryId)
                    if (offlineProducts.length > 0) {
                        // Transform to ProductWithCategory type (category will be minimal)
                        return offlineProducts.map((p: IOfflineProduct) => ({
                            id: p.id,
                            name: p.name,
                            sku: p.sku,
                            category_id: p.category_id,
                            retail_price: p.price,
                            is_active: p.is_active,
                            image_url: p.image_url,
                            category: p.category_id ? { id: p.category_id } : null,
                        })) as ProductWithCategory[]
                    }
                } catch (err) {
                    console.error('[useProducts] Error loading offline data:', err)
                }
                // Fallback to mock if no offline data
                if (categoryId) {
                    return MOCK_PRODUCTS.filter(p => p.category_id === categoryId) as ProductWithCategory[]
                }
                return MOCK_PRODUCTS as ProductWithCategory[]
            }

            // Online mode - fetch from Supabase and cache
            try {
                let query = supabase
                    .from('products')
                    .select('*, category:categories(*)')
                    .eq('pos_visible', true)
                    .eq('available_for_sale', true)
                    .eq('is_active', true)
                    .order('name')

                if (categoryId) {
                    query = query.eq('category_id', categoryId)
                }

                const { data, error } = await query

                if (error) throw error
                if (data && data.length > 0) {
                    // Cache to IndexedDB for offline use (only on full fetch, not category-filtered)
                    if (!categoryId) {
                        syncProductsToOffline().catch((err) =>
                            console.error('[useProducts] Error caching products:', err)
                        )
                    }
                    return data as ProductWithCategory[]
                }

                console.warn('No products from Supabase, using mock')
                // Filter mock by category if provided
                if (categoryId) {
                    return MOCK_PRODUCTS.filter(p => p.category_id === categoryId) as ProductWithCategory[]
                }
                return MOCK_PRODUCTS as ProductWithCategory[]
            } catch (err) {
                console.error('Error loading products:', err)
                if (categoryId) {
                    return MOCK_PRODUCTS.filter(p => p.category_id === categoryId) as ProductWithCategory[]
                }
                return MOCK_PRODUCTS as ProductWithCategory[]
            }
        },
    })
}

// Fetch single product with modifiers
export function useProductWithModifiers(productId: string) {
    return useQuery({
        queryKey: ['product', productId, 'modifiers'],
        queryFn: async () => {
            // Get product
            const { data: product, error: productError } = await supabase
                .from('products')
                .select('*, category:categories(*)')
                .eq('id', productId)
                .single()

            if (productError || !product) throw productError || new Error('Product not found')

            // Get modifiers (by product_id or category_id)
            const { data: modifiers, error: modifiersError } = await supabase
                .from('product_modifiers')
                .select('*')
                .eq('is_active', true)
                .or(`product_id.eq.${productId},category_id.eq.${product.category_id}`)
                .order('group_sort_order')
                .order('option_sort_order')

            if (modifiersError) throw modifiersError

            return {
                product,
                modifiers: modifiers || [],
            }
        },
        enabled: !!productId,
    })
}

// Search products
export function useProductSearch(query: string) {
    return useQuery({
        queryKey: ['products', 'search', query],
        queryFn: async (): Promise<Product[]> => {
            if (!query.trim()) return []

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('pos_visible', true)
                .eq('available_for_sale', true)
                .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
                .limit(20)

            if (error) throw error
            return data || []
        },
        enabled: query.length >= 2,
    })
}
