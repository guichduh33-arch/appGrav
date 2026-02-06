# Story 6.5: Automatic Promotion Application

Status: done

## Story

As a **Caissier**,
I want **que les promotions s'appliquent automatiquement**,
So that **le client bénéficie des offres sans action manuelle**.

## Acceptance Criteria

### AC1: Application Automatique au Panier
**Given** une promotion active est chargée dans le cache local
**When** les conditions de la promotion sont remplies (produit, quantité, date)
**Then** la remise est calculée et appliquée automatiquement au total du panier
**And** le détail de la remise est visible sous le total

### AC2: Affichage de l'Économie
**Given** un produit bénéficie d'une promotion
**When** je regarde l'item dans le panier
**Then** le prix original est barré et le nouveau prix s'affiche
**And** le badge de la promotion est visible à côté de l'item

### AC3: Évaluation de la Meilleure Offre
**Given** plusieurs promotions sont potentiellement éligibles pour un même item
**When** le système évalue les remises
**Then** seule la promotion la plus avantageuse pour le client est appliquée (pas de cumul sauf exception paramétrée)

### AC4: Rétroaction en Temps Réel
**Given** je modifie les quantités dans le panier
**When** une quantité seuil est atteinte (ex: 3 pour le prix de 2)
**Then** la promotion s'active ou se désactive instantanément
**And** le son de confirmation "Promo activée" peut être joué (optionnel)

## Tasks

- [x] **Task 1: Moteur de calcul des promotions**
  - [x] 1.1: Créer `src/services/pos/promotionEngine.ts`
  - [x] 1.2: Implémenter la fonction `evaluatePromotions(cart, activePromos, promoProducts, freeProducts)`
  - [x] 1.3: Gérer les types: `percentage`, `fixed_amount`, `buy_x_get_y`, `free_product`

- [x] **Task 2: Intégration dans le cartStore**
  - [x] 2.1: Ajouter champs promotion (`promotionDiscounts`, `promotionTotalDiscount`, `appliedPromotions`)
  - [x] 2.2: Modifier `calculateTotals()` pour soustraire la remise promotion du total
  - [x] 2.3: Ajouter actions `setPromotionResult()` et `getItemPromotionDiscount()`
  - [x] 2.4: Reset des champs promotion dans `clearCart()`

- [x] **Task 3: Hook useCartPromotions**
  - [x] 3.1: Créer `src/hooks/pos/useCartPromotions.ts` avec reactive Dexie queries
  - [x] 3.2: Auto-évaluation quand le panier ou les promotions changent
  - [x] 3.3: Intégrer dans `POSMainPage.tsx`

- [x] **Task 4: Mise à jour de l'UI du Panier**
  - [x] 4.1: Prix barré + nouveau prix dans `CartItemRow.tsx`
  - [x] 4.2: Badge promotion avec description (ex: "10% off", "Buy 2 Get 1 Free")
  - [x] 4.3: Ligne "Promo" dans `CartTotals.tsx` avec total des remises

- [x] **Task 5: Tests Unitaires**
  - [x] 5.1: 26 tests dans `promotionEngine.test.ts`
  - [x] 5.2: Tests percentage, fixed_amount, buy_x_get_y
  - [x] 5.3: Tests best-offer selection (non-stacking)
  - [x] 5.4: Tests stackable promotions
  - [x] 5.5: Tests min_quantity et min_purchase_amount thresholds
  - [x] 5.6: Tests real-time reactivity (quantity changes)
  - [x] 5.7: Tests global vs targeted promotions
  - [x] 5.8: Tests combo items exclusion

## Dev Notes

### Architecture
- Utilise les promotions cachées par la Story 6.4.
- Le moteur est pur (pas d'effets de bord) pour faciliter les tests.
- Seuil de performance: < 50ms pour le recalcul total (28ms mesuré).
- Pattern: Hook `useCartPromotions` connecte le moteur au store via useEffect.
- Le hook utilise `useLiveQuery` pour les données Dexie et Zustand selector pour le panier.
- Stabilisation via `prevResultRef` pour éviter les boucles infinites.

### Security
- Les remises sont recalculées à chaque étape.
- Le prix final payé est revérifié lors de la synchronisation serveur.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Completion Notes List

- All 5 tasks completed successfully
- 26 tests passing (promotionEngine.test.ts)
- TypeScript compilation passes with no new errors
- No regressions in existing tests (1322/1332 pass, 10 pre-existing failures in PrintingSettingsPage)

### File List

**Created:**
- `src/services/pos/promotionEngine.ts` (~290 lines) - Pure promotion evaluation engine
- `src/services/pos/__tests__/promotionEngine.test.ts` (~330 lines) - 26 unit tests
- `src/hooks/pos/useCartPromotions.ts` (~80 lines) - Reactive hook connecting engine to cart

**Modified:**
- `src/stores/cartStore.ts` - Added promotion state fields, `setPromotionResult` action, updated `calculateTotals` signature
- `src/components/pos/cart-components/CartItemRow.tsx` - Struck-through price, promotion badges
- `src/components/pos/cart-components/CartTotals.tsx` - Promotion discount summary line
- `src/hooks/pos/index.ts` - Added useCartPromotions export
- `src/pages/pos/POSMainPage.tsx` - Mounted useCartPromotions hook

## Change Log

- 2026-02-05: Story 6-5 created - Automatic Promotion Application
- 2026-02-06: Story 6-5 completed - All tasks implemented, 26 tests passing
