/**
 * Catalog Sync Service
 * Handles offline-first management of products and categories.
 * Ensures data is saved locally immediately and synced to Supabase when online.
 */

import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import { addToSyncQueue } from '@/services/sync/syncQueue';
import type { IOfflineProduct, IOfflineCategory, IOfflineProductCategoryPrice } from '@/types/offline';
import { logError, logWarn } from '@/utils/logger'

/**
 * Save a product with offline-first logic
 */
export async function saveProduct(product: Partial<IOfflineProduct> & { id: string }): Promise<{ success: boolean; synced: boolean; error?: string }> {
    try {
        // 1. Get existing or merge
        const existing = await db.offline_products.get(product.id);
        const updatedProduct = {
            ...existing,
            ...product,
            updated_at: new Date().toISOString()
        } as IOfflineProduct;

        // 2. Update local DB immediately
        await db.offline_products.put(updatedProduct);

        // 3. Attempt to sync to Supabase
        try {
            const { error: supabaseError } = await supabase
                .from('products')
                .upsert(updatedProduct as never);

            if (supabaseError) throw supabaseError;

            return { success: true, synced: true };
        } catch (err: unknown) {
            logWarn('[CatalogSync] Supabase sync failed, queuing for background sync:', err instanceof Error ? err.message : err);

            // 4. Queue for background sync if offline/failed
            await addToSyncQueue('product', updatedProduct);

            return { success: true, synced: false };
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logError('[CatalogSync] Critical error saving product:', message);
        return { success: false, synced: false, error: message };
    }
}

/**
 * Save a category with offline-first logic
 */
export async function saveCategory(category: Partial<IOfflineCategory> & { id: string }): Promise<{ success: boolean; synced: boolean; error?: string }> {
    try {
        // 1. Get existing or merge
        const existing = await db.offline_categories.get(category.id);
        const updatedCategory = {
            ...existing,
            ...category,
            updated_at: new Date().toISOString()
        } as IOfflineCategory;

        // 2. Update local DB immediately
        await db.offline_categories.put(updatedCategory);

        // 3. Attempt to sync to Supabase
        try {
            const { error: supabaseError } = await supabase
                .from('categories')
                .upsert(updatedCategory as never);

            if (supabaseError) throw supabaseError;

            return { success: true, synced: true };
        } catch (err: unknown) {
            logWarn('[CatalogSync] Supabase sync failed, queuing for background sync:', err instanceof Error ? err.message : err);

            // 4. Queue for background sync if offline/failed
            await addToSyncQueue('category', updatedCategory);

            return { success: true, synced: false };
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logError('[CatalogSync] Critical error saving category:', message);
        return { success: false, synced: false, error: message };
    }
}

/**
 * Save a product category price with offline-first logic (supports partial)
 */
export async function saveProductCategoryPrice(price: Partial<IOfflineProductCategoryPrice> & { id: string }): Promise<{ success: boolean; synced: boolean; error?: string }> {
    try {
        // 1. Get existing or merge
        const existing = await db.offline_product_category_prices.get(price.id);
        const updatedPrice = {
            ...existing,
            ...price,
            updated_at: new Date().toISOString()
        } as IOfflineProductCategoryPrice;

        // 2. Update local DB immediately
        await db.offline_product_category_prices.put(updatedPrice);

        // 3. Attempt to sync to Supabase
        try {
            const { error: supabaseError } = await supabase
                .from('product_category_prices')
                .upsert(updatedPrice as never);

            if (supabaseError) throw supabaseError;

            return { success: true, synced: true };
        } catch (err: unknown) {
            logWarn('[CatalogSync] Supabase sync failed, queuing for background sync:', err instanceof Error ? err.message : err);

            // 4. Queue for background sync if offline/failed
            await addToSyncQueue('product_category_price', updatedPrice);

            return { success: true, synced: false };
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logError('[CatalogSync] Critical error saving product category price:', message);
        return { success: false, synced: false, error: message };
    }
}
