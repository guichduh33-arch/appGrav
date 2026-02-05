# Story 8.9: Audit Trail & Alerts

Status: ready-for-dev

## Story

As a **Manager**,
I want **voir l'audit trail et les alertes d'anomalies**,
So that **je détecte les fraudes ou les erreurs de manipulation**.

## Acceptance Criteria

### AC1: Journal des Actions Sensibles
**Given** le dashboard audit
**When** je filtre par "Critical"
**Then** je vois toutes les actions impactant les finances: Voids (annulations), Refunds, Price Overrides.

### AC2: Système d'Alerte "Smart"
**Given** une activité inhabituelle (ex: 3 "Voids" consécutifs d'un même caissier)
**When** l'anomalie se produit
**Then** une alerte de sévérité haute est générée dans le dashboard.

### AC3: Résolution d'Alertes
**Given** une alerte active
**When** j'ai vérifié la caméra ou le ticket
**Then** je peux la marquer comme "Resolved" avec un commentaire d'explication.

## Tasks

- [ ] **Task 1: Moteur d'Analyse Audit**
  - [ ] 1.1: Créer `src/services/admin/fraudDetection.ts`
  - [ ] 1.2: Définir les seuils d'alerte configurables.

- [ ] **Task 2: Dashboard Alertes**
  - [ ] 2.1: Créer `src/pages/admin/audit/AnomalyDashboard.tsx`

## Dev Notes

### Compliance
- L'audit trail est immuable (techniquement: RLS interdit DELETE/UPDATE sur cette table).
- Indispensable pour la transparence opérationnelle.
