/**
 * Cart Promotions Hook
 * Story 6.5 - Automatic Promotion Application
 *
 * Connects the promotion engine to the cart store.
 * Automatically evaluates promotions whenever the cart or promotions change.
 *
 * @see Story 6.5: AC1 - Application automatique
 * @see Story 6.5: AC4 - Rétroaction en temps réel
 */

import { useEffect, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { useCartStore } from '@/stores/cartStore'
import { evaluatePromotions } from '@/services/pos/promotionEngine'
import { getValidPromotionsSorted } from '@/services/sync/promotionValidationService'
import type { IOfflinePromotion, IOfflinePromotionProduct, IOfflinePromotionFreeProduct } from '@/types/offline'

/**
 * Hook that automatically evaluates and applies promotions to the cart
 *
 * Uses Dexie live queries for reactive promotion data and
 * Zustand subscriptions for cart state changes.
 *
 * Must be mounted in a component that wraps the POS cart (e.g., POSPage).
 *
 * @example
 * ```tsx
 * function POSPage() {
 *   useCartPromotions(); // Auto-evaluates promotions
 *   return <Cart ... />;
 * }
 * ```
 */
export function useCartPromotions() {
  const items = useCartStore(state => state.items)
  const setPromotionResult = useCartStore(state => state.setPromotionResult)

  // Get all cached promotions reactively
  const allPromotions = useLiveQuery(
    () => db.offline_promotions.toArray(),
    [],
    [] as IOfflinePromotion[]
  )

  // Get all promotion-product associations reactively
  const allPromotionProducts = useLiveQuery(
    () => db.offline_promotion_products.toArray(),
    [],
    [] as IOfflinePromotionProduct[]
  )

  // Get all free products reactively
  const allFreeProducts = useLiveQuery(
    () => db.offline_promotion_free_products.toArray(),
    [],
    [] as IOfflinePromotionFreeProduct[]
  )

  // Track previous result to avoid unnecessary store updates
  const prevResultRef = useRef<string>('')

  useEffect(() => {
    // Filter to valid promotions (date/time/day checks)
    const validPromotions = getValidPromotionsSorted(allPromotions)

    // Evaluate promotions against cart
    const result = evaluatePromotions(
      items,
      validPromotions,
      allPromotionProducts,
      allFreeProducts
    )

    // Only update store if result changed (avoid infinite loops)
    const resultKey = JSON.stringify({
      td: result.totalDiscount,
      ids: result.itemDiscounts.map(d => `${d.itemId}:${d.promotionId}:${d.discountAmount}`),
    })

    if (resultKey !== prevResultRef.current) {
      prevResultRef.current = resultKey
      setPromotionResult(result)
    }
  }, [items, allPromotions, allPromotionProducts, allFreeProducts, setPromotionResult])
}
