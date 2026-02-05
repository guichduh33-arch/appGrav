# Story 6.6: Combos Selection Flow

Status: ready-for-dev

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

- [ ] **Task 1: Composantes UI Combo**
  - [ ] 1.1: Créer `src/components/pos/modals/ComboSelectionModal.tsx`
  - [ ] 1.2: Implémenter la gestion de l'état local des sélections avec validation min/max

- [ ] **Task 2: Types et Modèles**
  - [ ] 2.1: Étendre `IProduct` ou créer `ICombo` pour supporter la structure des choix
  - [ ] 2.2: Définir `IComboSelection` pour stocker les choix dans le panier

- [ ] **Task 3: Intégration CartStore**
  - [ ] 3.1: Mettre à jour `addItem()` pour supporter les métadonnées de combo
  - [ ] 3.2: Gérer le calcul du prix incluant les ajustements d'options

- [ ] **Task 4: Tests UI**
  - [ ] 4.1: Tester le parcours complet: sélection → options → validation → panier

## Dev Notes

### Database Relation
- Jointure entre `products` et `product_combos` / `combo_items`.
- Les options peuvent elles-mêmes avoir des variations (variants).

### UX
- Rapidité d'exécution cruciale.
- Utiliser des icônes pour les groupes de choix (café, croissant, etc.).
