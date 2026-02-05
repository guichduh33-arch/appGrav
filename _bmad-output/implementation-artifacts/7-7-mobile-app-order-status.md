# Story 7.7: Mobile App Order Status

Status: ready-for-dev

## Story

As a **Serveur**,
I want **voir le statut de mes commandes envoyées**,
So that **je peux servir les clients dès que leurs plats sont prêts**.

## Acceptance Criteria

### AC1: Liste des Commandes Actives
**Given** je suis sur l'écran "My Orders" de l'app mobile
**When** j'ouvre la liste
**Then** je vois toutes les commandes que j'ai créées avec leur numéro et statut (Pending, Preparing, Ready)

### AC2: Alertes "Ready"
**Given** une commande est marquée comme "Ready" par le cuisinier au KDS
**When** le statut change
**Then** ma tablette émet une notification sonore discrète ou une vibration
**And** la ligne de commande correspondante clignote en vert

### AC3: Archivage après Service
**Given** une commande servie
**When** je clique sur "Mark as Delivered"
**Then** la commande disparaît de ma liste active et son statut final est mis à jour sur le Hub

## Tasks

- [ ] **Task 1: Vue Statut Mobile**
  - [ ] 1.1: Créer `src/pages/mobile/MyOrdersPage.tsx`
  - [ ] 1.2: Écouter les notifications `order:status_change` du Hub

- [ ] **Task 2: Notifications Push/Local**
  - [ ] 2.1: Utiliser Capacitor LocalNotifications pour les alertes en arrière-plan

- [ ] **Task 3: UX Service**
  - [ ] 3.1: Ajouter le bouton "Servi" avec confirmation par geste (swipe) pour éviter les erreurs

## Dev Notes

### Sync
- Les serveurs ne voient par défaut que LEURS commandes pour éviter de surcharger l'écran.
- Option "Show All" pour les managers.
