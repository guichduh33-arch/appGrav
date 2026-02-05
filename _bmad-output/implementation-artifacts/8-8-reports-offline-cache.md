# Story 8.8: Reports Offline Cache (7 Days)

Status: ready-for-dev

## Story

As a **Manager**,
I want **consulter les rapports des 7 derniers jours offline**,
So that **je peux analyser les performances de la semaine même sans internet**.

## Acceptance Criteria

### AC1: Cache de Reporting Prioritaire
**Given** l'application synchronise
**When** les données de vente sont reçues
**Then** une version agrégée des 7 derniers jours est stockée dans Dexie `offline_reports_cache`.

### AC2: Disponibilité Hors-ligne
**Given** une coupure internet
**When** j'accède aux rapports "Recent"
**Then** les données s'affichent normalement avec un bandeau "Mode Offline - Données au {LastSync}".

### AC3: Invalidation Intelligente
**Given** le cache local
**When** internet revient
**Then** le cache est automatiquement mis à jour si les données serveur ont changé.

## Tasks

- [ ] **Task 1: Schéma IndexedDB pour Reports**
  - [ ] 1.1: Ajouter la table `offline_reports_cache` dans Dexie store.

- [ ] **Task 2: Service de Pré-agrégation**
  - [ ] 2.1: Implémenter une routine de fond qui calcule les totaux journaliers et les stocke localement après chaque sync de transaction réussie.

## Dev Notes

### ADR-003 Compliance
- Ce cache ne contient pas le détail de chaque transaction (trop lourd) mais des sommes agrégées par heure/catégorie/méthode de paiement.
- TTL de 7 jours glissants.
