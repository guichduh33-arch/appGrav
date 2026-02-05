# Story 7.4: Mobile App Authentication

Status: ready-for-dev

## Story

As a **Serveur**,
I want **me connecter à l'app mobile avec mon PIN**,
So that **je peux prendre des commandes en salle sur ma tablette**.

## Acceptance Criteria

### AC1: Écran de PIN Mobile
**Given** l'application mobile (Capacitor) lancée sur une tablette
**When** l'app s'affiche
**Then** je vois un pavé numérique plein écran pour saisir mon PIN de 4 ou 6 chiffres

### AC2: Authentification Hybride
**Given** une tentative de connexion
**When** l'appareil est en ligne
**Then** le PIN est vérifié via Supabase Auth
**And** si l'appareil est hors ligne, il utilise le cache `offline_users` (Story 1.1)

### AC3: Persistance de Session
**Given** un serveur connecté
**When** l'app est mise en arrière-plan puis restaurée
**Then** la session reste active pendant 12 heures, sauf si un logout manuel est effectué

## Tasks

- [ ] **Task 1: Adaptateur Auth pour Mobile**
  - [ ] 1.1: Adapter `useOfflineAuth` pour fonctionner dans l'environnement Capacitor
  - [ ] 1.2: Gérer le stockage sécurisé du token de session localement

- [ ] **Task 2: UI Pavé Numérique**
  - [ ] 2.1: Créer `src/pages/mobile/LoginPage.tsx` avec un design optimisé pour le tactile (grosses touches)

- [ ] **Task 3: Tests Sécurité**
  - [ ] 3.1: Vérifier le verrouillage après 3 tentatives erronées (rate limiting local)

## Dev Notes

### Mobile Specific
- Utilise Capacitor Plugins pour le stockage sécurisé si nécessaire.
- Désactiver le clavier natif iOS/Android au profit du pavé numérique UI.
