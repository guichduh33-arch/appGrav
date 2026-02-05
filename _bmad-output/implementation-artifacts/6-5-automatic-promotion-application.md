# Story 6.5: Automatic Promotion Application

Status: ready-for-dev

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

- [ ] **Task 1: Moteur de calcul des promotions**
  - [ ] 1.1: Créer `src/services/pos/promotionEngine.ts`
  - [ ] 1.2: Implémenter la fonction `evaluatePromotions(cart, activePromos)`
  - [ ] 1.3: Gérer les types: `percentage_discount`, `fixed_amount_off`, `buy_x_get_y`

- [ ] **Task 2: Intégration dans le cartStore**
  - [ ] 2.1: Mettre à jour `calculateTotals()` dans `cartStore.ts` pour inclure l'appel au `promotionEngine`
  - [ ] 2.2: Stocker les remises appliquées dans l'état du store

- [ ] **Task 3: Mise à jour de l'UI du Panier**
  - [ ] 3.1: Afficher les remises appliquées dans `CartItem.tsx`
  - [ ] 3.2: Ajouter le récapitulatif des remises dans `CartTotals.tsx`

- [ ] **Task 4: Tests Unitaires**
  - [ ] 4.1: Tester l'application automatique sur une viennoiserie
  - [ ] 4.2: Tester le cas de non-cumul (meilleure offre)

## Dev Notes

### Architecture
- Utilise les promotions cachées par la Story 6.4.
- Le moteur doit être pur (pas d'effets de bord) pour faciliter les tests.
- Seuil de performance: < 50ms pour le recalcul total.

### Security
- Les remises sont recalculées à chaque étape.
- Le prix final payé est revérifié lors de la synchronisation serveur.
