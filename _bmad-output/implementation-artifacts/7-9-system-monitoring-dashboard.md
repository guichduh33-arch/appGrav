# Story 7.9: System Monitoring Dashboard

Status: ready-for-dev

## Story

As a **Manager**,
I want **voir le statut de tous les appareils connectés**,
So that **je peux surveiller la santé du système et identifier les problèmes de réseau**.

## Acceptance Criteria

### AC1: Vue d'Ensemble des Devices
**Given** je suis sur le POS principal
**When** je navigue vers `Admin > Monitoring`
**Then** je vois une grille affichant chaque appareil enregistré (Nom, Type, Statut)

### AC2: Indicateurs Temps Réel
**Given** la liste des devices
**When** un appareil perd sa connexion
**Then** son icône devient rouge/grise en moins de 30 secondes
**And** la durée depuis la dernière activité est affichée

### AC3: Action de Redémarrage/Sync
**Given** un appareil dont l'état semble incohérent
**When** je clique sur "Force Refresh" depuis le dashboard monitoring
**Then** une instruction est envoyée via Socket.IO à l'appareil pour forcer un re-fetch complet des données

## Tasks

- [ ] **Task 1: Store de Monitoring**
  - [ ] 1.1: Créer un état Zustand ou une table Dexie pour suivre les heartbeats des devices

- [ ] **Task 2: UI Monitoring**
  - [ ] 2.1: Créer `src/pages/admin/monitoring/DeviceMonitoring.tsx`
  - [ ] 2.2: Utiliser des badges Lucide (Laptop, Tablet, Monitor, Printer)

- [ ] **Task 3: Alerting**
  - [ ] 3.1: Envoyer une notification système si le Hub perd la connexion avec l'imprimante cuisine

## Dev Notes

### Logic
- Heartbeat toutes les 10 secondes.
- Timeout après 3 heartbeats manqués.
