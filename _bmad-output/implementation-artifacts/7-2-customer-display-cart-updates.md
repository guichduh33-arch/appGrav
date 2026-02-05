# Story 7.2: Customer Display Cart Updates

Status: ready-for-dev

## Story

As a **Client**,
I want **voir ma commande sur l'écran client**,
So that **je sais ce que le caissier ajoute et je peux confirmer le prix**.

## Acceptance Criteria

### AC1: Réception des Items
**Given** le Display est connecté au POS
**When** le caissier ajoute un produit au panier
**Then** l'item s'affiche instantanément sur l'écran client avec son nom et son prix
**And** les modifiers (ex: "Extra Shot") sont listés sous le produit principal

### AC2: Mise à jour Dynamique
**Given** un panier d'achat
**When** le caissier modifie une quantité ou supprime un item
**Then** l'écran client se met à jour en moins de 500ms
**And** un indicateur visuel (pulse ou changement de couleur) souligne la modification

### AC3: Animation de Slid-in
**Given** l'ajout d'un nouvel item
**When** il apparaît à l'écran
**Then** il utilise une animation de "slide-in" fluide pour attirer l'attention du client sur le dernier ajout

## Tasks

- [ ] **Task 1: Handler d'Événements Panier**
  - [ ] 1.1: Écouter `cart:update` émis par le LAN Hub
  - [ ] 1.2: Mapper les données reçues vers l'état local du Display

- [ ] **Task 2: Composants UI Display**
  - [ ] 2.1: Créer `src/components/display/LiveCartList.tsx`
  - [ ] 2.2: Implémenter les animations avec `framer-motion` ou `tailwindcss-animate`

- [ ] **Task 3: Optimisation**
  - [ ] 3.1: Éviter les re-renders inutiles de toute la liste lors d'un simple ajout

## Dev Notes

### UX
- Le texte doit être lisible à 1.5 mètres.
- Priorité à la fluidité visuelle.
