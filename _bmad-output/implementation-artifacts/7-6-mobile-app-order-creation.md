# Story 7.6: Mobile App Order Creation

Status: ready-for-dev

## Story

As a **Serveur**,
I want **créer une commande depuis ma tablette**,
So that **je peux prendre les commandes directement à table**.

## Acceptance Criteria

### AC1: Gestion du Panier Mobile
**Given** je sélectionne des produits
**When** je clique sur une carte produit
**Then** elle s'ajoute à un panier flottant ou une barre latérale
**And** je peux modifier les quantités avec des boutons +/- larges

### AC2: Sélection de Table/Client
**Given** une nouvelle commande mobile
**When** je clique sur "Proceed"
**Then** je dois sélectionner une table (si Dine-in) ou saisir un nom de client

### AC3: Envoi vers LAN Hub
**Given** une commande complète sur tablette
**When** je clique sur "Send to Kitchen"
**Then** la commande est transmise au POS via Socket.IO
**And** un message de confirmation "Order #123 Sent" s'affiche

## Tasks

- [ ] **Task 1: Workflow de Commande Mobile**
  - [ ] 1.1: Créer `src/pages/mobile/CartPage.tsx`
  - [ ] 1.2: Implémenter la sélection de table via `src/components/mobile/TableSelector.tsx`

- [ ] **Task 2: Sync LAN des Commandes**
  - [ ] 2.1: Émettre l'event `order:create` vers le Hub Socket.IO
  - [ ] 2.2: Gérer la réception de l'ID de commande final généré par le POS

- [ ] **Task 3: Conflits**
  - [ ] 3.1: Gérer le cas où deux serveurs modifient la même table simultanément (optimistic locking)

## Dev Notes

### Network
- En cas de perte WiFi, la commande est stockée dans la `sync_queue` locale de la tablette et envoyée dès reconnexion.
