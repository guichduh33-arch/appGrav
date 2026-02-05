# Story 6.3: Loyalty Points Display (Read-Only)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Caissier**,
I want **voir le solde de points fidélité et la remise fidélité offline**,
So that **je peux informer le client de ses avantages même sans internet**.

## Acceptance Criteria

### AC1: Affichage du Tier Fidélité
**Given** un client fidèle est associé à la commande
**When** je vois ses informations dans le panier
**Then** son tier (Bronze/Silver/Gold/Platinum) s'affiche avec un badge coloré
**And** la couleur correspond au tier: Bronze (#cd7f32), Silver (#c0c0c0), Gold (#ffd700), Platinum (#e5e4e2)

### AC2: Affichage du Solde de Points
**Given** un client fidèle est associé à la commande
**When** je vois ses informations dans le panier
**Then** son solde de points s'affiche formaté avec séparateur de milliers
**And** le format est: "{points} pts"
**And** les données viennent du cache offline si hors-ligne

### AC3: Affichage de la Remise Fidélité Applicable
**Given** un client avec un tier Silver, Gold, ou Platinum est associé
**When** je vois ses informations dans le panier
**Then** la remise fidélité applicable s'affiche distinctement: Silver 5%, Gold 8%, Platinum 10%
**And** cette remise est séparée visuellement de la remise catégorie (si applicable)
**And** un libellé "Loyalty discount" ou icône étoile identifie clairement cette remise

### AC4: Bronze n'Affiche Pas de Remise
**Given** un client avec tier Bronze est associé
**When** je vois ses informations
**Then** aucune remise fidélité n'est affichée (Bronze = 0%)
**And** seuls le tier et les points sont visibles

### AC5: Message Utilisation Points Offline
**Given** je suis offline et un client fidèle est associé
**When** l'affichage loyalty montre les points
**Then** un tooltip ou indication discrète précise "Points balance may be outdated"
**And** si le client demande à utiliser ses points, un message s'affiche: "Points redemption requires online connection"

### AC6: Distinction Remise Catégorie vs Remise Fidélité
**Given** un client a à la fois une catégorie (wholesale, discount_percentage) ET un tier fidélité
**When** j'affiche ses avantages
**Then** les deux remises sont affichées séparément si applicables
**And** la remise catégorie montre le type (Wholesale, -X%)
**And** la remise fidélité montre le tier (Silver 5%, Gold 8%, Platinum 10%)

## Tasks / Subtasks

- [x] **Task 1: Créer le composant LoyaltyBadge** (AC: 1, 2, 3, 4)
  - [x] 1.1: Créer `src/components/pos/LoyaltyBadge.tsx` (~80 lignes)
  - [x] 1.2: Props: `tier: string`, `points: number`, `isOffline?: boolean`
  - [x] 1.3: Afficher le badge tier avec couleur appropriée (TIER_COLORS)
  - [x] 1.4: Afficher les points formatés avec `toLocaleString()`
  - [x] 1.5: Afficher la remise fidélité si tier > Bronze (TIER_DISCOUNTS)
  - [x] 1.6: Ajouter tooltip "Points balance may be outdated" si offline

- [x] **Task 2: Exporter les constantes TIER_COLORS et TIER_DISCOUNTS** (AC: 1, 3)
  - [x] 2.1: Déplacer `TIER_COLORS` et `TIER_DISCOUNTS` vers `src/constants/loyalty.ts`
  - [x] 2.2: Exporter les deux constantes
  - [x] 2.3: Mettre à jour `CustomerSearchModal.tsx` pour importer depuis `@/constants/loyalty`

- [x] **Task 3: Intégrer LoyaltyBadge dans Cart.tsx** (AC: 1, 2, 3, 4, 5)
  - [x] 3.1: Importer `LoyaltyBadge` dans `src/components/pos/Cart.tsx`
  - [x] 3.2: Utiliser `useNetworkStatus()` pour détecter offline
  - [x] 3.3: Remplacer l'affichage inline loyalty par `<LoyaltyBadge />` dans customer-badge
  - [x] 3.4: Passer `isOffline` prop pour l'indication de données potentiellement obsolètes

- [x] **Task 4: Séparer visuellement remise catégorie et remise fidélité** (AC: 6)
  - [x] 4.1: Dans Cart.tsx, afficher `customer.category.discount_percentage` comme "Category -X%"
  - [x] 4.2: Afficher la remise fidélité séparément avec icône Star
  - [x] 4.3: Utiliser des couleurs distinctes: catégorie = bleu, fidélité = doré

- [x] **Task 5: Ajouter message "Points redemption requires online"** (AC: 5)
  - [x] 5.1: Créer un handler `handleRedeemPointsClick()` dans Cart.tsx
  - [x] 5.2: Si offline, afficher toast: "Points redemption requires online connection"
  - [x] 5.3: Si online, ne rien faire (future story implémentera la redemption)
  - [x] 5.4: Optionnel: Ajouter petit bouton/lien "Use points" désactivé si offline

- [x] **Task 6: Tests unitaires** (AC: 1, 2, 3, 4, 5, 6)
  - [x] 6.1: Créer `src/components/pos/__tests__/LoyaltyBadge.test.tsx`
  - [x] 6.2: Test: Affiche correctement chaque tier avec couleur
  - [x] 6.3: Test: Affiche les points formatés
  - [x] 6.4: Test: Affiche remise pour Silver/Gold/Platinum, pas pour Bronze
  - [x] 6.5: Test: Affiche indication offline quand `isOffline=true`

## Dev Notes

### Architecture Context

Les données loyalty sont déjà cachées (Story 6.1):
- `IOfflineCustomer.loyalty_tier` - Tier actuel du client
- `IOfflineCustomer.points_balance` - Solde de points

[Source: _bmad-output/planning-artifacts/architecture.md#ADR-001]

### Business Rules - Loyalty System

| Tier | Points Requis | Réduction |
|------|---------------|-----------|
| Bronze | 0 | 0% |
| Silver | 500 | 5% |
| Gold | 2,000 | 8% |
| Platinum | 5,000 | 10% |

**Calcul des points:** 1 point = 1,000 IDR dépensés

[Source: CLAUDE.md#Business-Rules]

### Code Existant à Réutiliser

**CustomerSearchModal.tsx** (lignes 67-79) - Constantes à extraire:
```typescript
const TIER_COLORS: Record<string, string> = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2'
}

const TIER_DISCOUNTS: Record<string, number> = {
    bronze: 0,
    silver: 5,
    gold: 8,
    platinum: 10
}
```

**Cart.tsx** (lignes 248-260) - Affichage loyalty existant à améliorer:
```jsx
<span className="customer-badge__points">
    <Star size={10} />
    {selectedCustomer?.loyalty_points?.toLocaleString() || 0} pts
    {selectedCustomer?.loyalty_tier && selectedCustomer.loyalty_tier !== 'bronze' && (
        <Crown size={10} style={{ color: getTierColor(selectedCustomer.loyalty_tier) }} />
    )}
</span>
```

### Interface SelectedCustomer (Cart.tsx)

L'interface existe déjà avec les champs requis (lignes 15-27):
```typescript
interface SelectedCustomer {
    id: string
    name: string
    company_name: string | null
    loyalty_points: number      // ✅ Points balance
    loyalty_tier: string        // ✅ Tier name
    category?: {
        name: string
        slug: string
        color: string
        discount_percentage: number | null  // Remise CATÉGORIE (différent de fidélité!)
    }
}
```

### Hooks Existants

- `useNetworkStatus()` - Pour détecter offline [Source: src/hooks/offline/useNetworkStatus.ts]
- `useCustomerByIdOffline()` - Pour récupérer client du cache [Source: src/hooks/customers/useCustomersOffline.ts]

### Learnings from Stories 6.1 & 6.2

1. **Les données loyalty sont DÉJÀ CACHÉES** - `offline_customers` a `loyalty_tier` et `points_balance`
2. **Pas de calcul complexe** - Les tiers et remises sont statiques, mappés dans TIER_DISCOUNTS
3. **Distinction catégorie vs fidélité** - Deux concepts différents, ne pas confondre
4. **useLiveQuery pattern** - Pour réactivité avec Dexie
5. **i18n SUSPENDU** - Utiliser strings anglaises directes

### Project Structure Notes

**Nouveau fichier à créer:**
```
src/
├── components/pos/
│   ├── LoyaltyBadge.tsx           (~80 lignes)
│   └── __tests__/
│       └── LoyaltyBadge.test.tsx  (~100 lignes)
└── constants/
    └── loyalty.ts                  (~20 lignes)
```

**Fichiers à modifier:**
```
src/components/pos/Cart.tsx                    (intégration LoyaltyBadge)
src/components/pos/modals/CustomerSearchModal.tsx  (import constantes)
```

### Critical Guard Rails for Dev Agent

🚨 **IMPORTANT - NE PAS:**
- ❌ Modifier les données loyalty (read-only cache)
- ❌ Implémenter la redemption de points (future story)
- ❌ Utiliser `t()` ou i18next - strings anglaises directes
- ❌ Confondre `category.discount_percentage` avec `TIER_DISCOUNTS[tier]`
- ❌ Appeler Supabase pour récupérer loyalty data - utiliser cache

✅ **IMPORTANT - DOIT:**
- ✅ Extraire TIER_COLORS et TIER_DISCOUNTS vers constants/loyalty.ts
- ✅ Utiliser `useNetworkStatus()` pour détecter offline
- ✅ Afficher SÉPARÉMENT remise catégorie et remise fidélité
- ✅ Formater les points avec `toLocaleString()`
- ✅ Tester les 4 tiers (Bronze, Silver, Gold, Platinum)

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-6.3]
- [Source: CLAUDE.md#Business-Rules] - Loyalty System
- [Source: src/components/pos/Cart.tsx] - Affichage customer badge existant
- [Source: src/components/pos/modals/CustomerSearchModal.tsx] - TIER_COLORS, TIER_DISCOUNTS
- [Source: src/hooks/customers/useCustomersOffline.ts] - Hooks customer offline
- [Source: src/hooks/offline/useNetworkStatus.ts] - Hook network status
- [Source: src/types/offline.ts] - IOfflineCustomer avec loyalty_tier, points_balance

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Tests LoyaltyBadge: 19 tests passing

### Completion Notes List

- Created `src/constants/loyalty.ts` with TIER_COLORS, TIER_DISCOUNTS and helper functions
- Created `src/components/pos/LoyaltyBadge.tsx` component with tier badge, points, discount display
- Updated `CustomerSearchModal.tsx` to import constants from `@/constants/loyalty`
- Integrated LoyaltyBadge into Cart.tsx with offline support via `useNetworkStatus()`
- Separated category discount (blue) from loyalty discount (tier color) in Cart
- AC5 offline indicator implemented via tooltip on points display
- All 6 acceptance criteria satisfied
- 19 unit tests passing covering all tiers, points formatting, discounts, and offline mode

### File List

**Created:**
- src/constants/loyalty.ts
- src/components/pos/LoyaltyBadge.tsx
- src/components/pos/LoyaltyBadge.css
- src/components/pos/__tests__/LoyaltyBadge.test.tsx

**Modified:**
- src/components/pos/Cart.tsx
- src/components/pos/modals/CustomerSearchModal.tsx

## Senior Developer Review (AI)

**Review Date:** 2026-02-05
**Review Outcome:** ✅ Approved (with fixes applied)
**Reviewer Model:** Claude Opus 4.5

### Action Items

- [x] [HIGH] File List incomplet: LoyaltyBadge.css manquant → **FIXED**: Ajouté au File List
- [x] [MEDIUM] Bug compact mode: prop `compact` ne génère pas classe CSS → **FIXED**: Ajout `loyalty-badge--compact` class
- [x] [MEDIUM] Contraste texte Platinum: texte blanc sur fond clair → **FIXED**: Texte sombre pour silver ET platinum
- [ ] [LOW] Styling inline excessif pour bouton "Use pts" dans Cart.tsx
- [ ] [LOW] Edge case non testé: points=undefined
- [ ] [LOW] Types loose: TIER_COLORS pourrait utiliser un type literal

### Summary

La story 6-3 était globalement bien implémentée avec tous les ACs satisfaits et 19 tests passants. Trois issues techniques ont été identifiés et corrigés automatiquement:

1. **Documentation**: Le fichier CSS était créé mais non documenté dans le File List
2. **Bug fonctionnel**: Le mode compact CSS n'était jamais appliqué (classe CSS manquante)
3. **Accessibilité**: Problème de contraste texte pour le tier Platinum

Tous les tests passent après les corrections (19/19).

## Change Log

- 2026-02-05: Story 6-3 created - Loyalty Points Display (Read-Only) feature ready for development
- 2026-02-05: Story 6-3 implemented - All tasks completed, 19 tests passing, ready for review
- 2026-02-05: Code review completed - 3 issues fixed (1 HIGH, 2 MEDIUM), story approved
