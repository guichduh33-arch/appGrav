# Story 6.6: Combos Selection Flow

Status: done

## Story

As a **Caissier**,
I want **pouvoir sélectionner un combo avec ses options**,
So that **je peux vendre des offres groupées (ex: Petit Déjeuner = Café + Croissant)**.

## Acceptance Criteria

### AC1: Modal de Sélection de Combo
**Given** je clique sur un produit de type "combo" dans le POS
**When** l'interface s'ouvre
**Then** je vois une fenêtre modale listant les groupes de choix (ex: "Boisson", "Pâtisserie")
**And** chaque groupe indique ses contraintes (min/max d'items à choisir)

### AC2: Validation des Choix
**Given** je sélectionne des options dans un combo
**When** je n'ai pas atteint le nombre minimum requis
**Then** le bouton "Ajouter au panier" est désactivé
**And** les groupes incomplets sont mis en évidence

### AC3: Ajustements de Prix
**Given** certaines options d'un combo ont un surplus (ex: lait d'avoine +Rp 5000)
**When** je les sélectionne
**Then** le prix total du combo se met à jour dynamiquement dans le modal
**And** le surplus est clairement indiqué à côté de l'option

### AC4: Affichage Panier et Ticket
**Given** un combo est ajouté au panier
**When** je le consulte
**Then** l'item principal s'affiche avec la liste indentée de ses composants sélectionnés
**And** le prix total (base + surplus) est consolidé

## Tasks

- [x] **Task 1: POS Modal Integration**
  - [x] 1.1: Add 'combo' to TPOSModalName in usePOSModals.ts
  - [x] 1.2: Integrate ComboSelectorModal into POSMainPage with combo state management
  - [x] 1.3: Wire onConfirm to cartStore.addCombo

- [x] **Task 2: Combo Display in POS**
  - [x] 2.1: Create `src/hooks/products/useCombos.ts` with usePOSCombos hook
  - [x] 2.2: Create `src/components/pos/ComboGrid.tsx` for combo cards display
  - [x] 2.3: Show combos in POS when "All Products" category is selected

- [x] **Task 3: Cart Display Enhancement**
  - [x] 3.1: Add combo selections indented list in CartItemRow
  - [x] 3.2: Show price adjustments next to selection items
  - [x] 3.3: Add CSS for combo selections display

- [x] **Task 4: French Strings Cleanup**
  - [x] 4.1: Replace all French strings in ComboSelectorModal.tsx with English

- [x] **Task 5: Tests**
  - [x] 5.1: ComboGrid.test.tsx (6 tests - rendering, clicks, loading)
  - [x] 5.2: cartStoreCombo.test.ts (10 tests - add, remove, quantity, price adjustments)
  - [x] 5.3: useCombos.test.ts (2 tests - module export validation)

## Dev Notes

### Architecture
- ComboSelectorModal.tsx already existed with full functionality (selection, validation, price calculation)
- cartStore.addCombo() already existed with combo support
- Integration work: connecting existing pieces into the POS flow
- Combos shown in "All Products" view (no category selected), not when filtering by category
- ComboGrid reuses ProductGrid.css with additional combo-specific styles

### Existing Infrastructure Leveraged
- `ComboSelectorModal.tsx` - Full combo selection UI with group validation
- `cartStore.addCombo()` - Adds combo with selections to cart
- `CartItemRow` - Already displayed combo name (line 35), enhanced with selections
- Database tables: `product_combos`, `product_combo_groups`, `product_combo_group_items`

### UX
- Combo cards appear at the top of product grid with "Combo" badge
- Clicking a combo opens ComboSelectorModal with group selection
- Cart shows combo name with indented list of selected items
- Price adjustments (e.g., +Rp 5,000 for oat milk) shown inline

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Completion Notes List

- All 5 tasks completed successfully
- 18 tests passing across 3 test files
- TypeScript compilation passes with no new errors
- No regressions in existing tests

### File List

**Created:**
- `src/hooks/products/useCombos.ts` (~30 lines) - Hook to fetch active POS combos
- `src/components/pos/ComboGrid.tsx` (~55 lines) - Combo cards display component
- `src/components/pos/__tests__/ComboGrid.test.tsx` (~75 lines) - 6 ComboGrid tests
- `src/stores/__tests__/cartStoreCombo.test.ts` (~165 lines) - 10 cart store combo tests
- `src/hooks/products/__tests__/useCombos.test.ts` (~55 lines) - 2 hook tests

**Modified:**
- `src/hooks/pos/usePOSModals.ts` - Added 'combo' to TPOSModalName and initialState
- `src/hooks/products/index.ts` - Added usePOSCombos export
- `src/pages/pos/POSMainPage.tsx` - Integrated ComboGrid + ComboSelectorModal
- `src/components/pos/cart-components/CartItemRow.tsx` - Added combo selections display
- `src/components/pos/modals/ComboSelectorModal.tsx` - French strings → English
- `src/components/pos/ProductGrid.css` - Added combo badge styles
- `src/components/pos/Cart.css` - Added combo selection styles

## Change Log

- 2026-02-05: Story 6-6 created - Combos Selection Flow
- 2026-02-06: Story 6-6 completed - POS integration, cart display, 18 tests passing
