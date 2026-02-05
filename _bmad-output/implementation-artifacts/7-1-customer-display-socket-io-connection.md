# Story 7.1: Customer Display Socket.IO Connection

Status: ready-for-dev

## Story

As a **Customer Display**,
I want **me connecter au POS via Socket.IO**,
So that **je reçois les mises à jour du panier en temps réel sans dépendre d'internet**.

## Acceptance Criteria

### AC1: Connexion au LAN Hub
**Given** le Customer Display (iPad ou Tablette) démarre sur le réseau local
**When** il s'initialise
**Then** il tente une connexion WebSocket vers l'IP du POS sur le port 3001
**And** il envoie l'event `device:register` avec `type="display"`

### AC2: Reconnexion Automatique
**Given** la connexion réseau est interrompue
**When** le signal revient
**Then** le Display se reconnecte automatiquement en moins de 5 secondes
**And** il récupère l'état actuel du panier lors du handshake

### AC3: Statut de Connexion
**Given** l'application Display
**When** je regarde l'écran (bas-joint)
**Then** je vois un indicateur discret du statut de connexion au POS (vert=connecté, gris=déconnecté)

## Tasks

- [ ] **Task 1: Client Socket.IO Display**
  - [ ] 1.1: Configurer `socket.io-client` dans l'application Display
  - [ ] 1.2: Implémenter la logique de découverte d'IP (Story 7.8) ou paramétrage manuel

- [ ] **Task 2: Service de Communication**
  - [ ] 2.1: Créer `src/services/lan/displayClient.ts`
  - [ ] 2.2: Gérer les events heartbeat et reconnexion

- [ ] **Task 3: Tests de Latence**
  - [ ] 3.1: Vérifier que la latence de transmission est < 200ms sur un LAN standard

## Dev Notes

### Network
- Utilise l'architecture documentée dans ADR-006.
- Le POS agit comme hub central.

### Reliability
- Le Display doit rester en attente (splash screen) tant que la connexion n'est pas établie.
