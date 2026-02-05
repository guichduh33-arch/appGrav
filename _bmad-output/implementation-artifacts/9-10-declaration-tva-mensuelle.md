# Story 9.10: Déclaration TVA Mensuelle

Status: ready-for-dev

## Story

As a **Comptable**,
I want **générer et clôturer les déclarations TVA**,
So that **je suis en conformité fiscale et les écritures du mois passé sont verrouillées**.

## Acceptance Criteria

### AC1: Clôture de Période
**Given** un mois terminé
**When** je clique sur "Lock Period & File VAT"
**Then** toutes les écritures comptables de ce mois deviennent immuables (lecture seule).
**And** un PDF de récapitulatif fiscal est généré.

### AC2: Suivi des Versements
**Given** une déclaration soumise
**When** je saisis l'OTP ou la référence de paiement du fisc
**Then** le système solde la dette fiscale pour ce mois et enregistre le paiement bancaire.

## Tasks

- [ ] **Task 1: Mécanisme de Verrouillage**
  - [ ] 1.1: Mettre en place un système de `period_locks` dans la base de données.
  - [ ] 1.2: Ajouter des contraintes de check (DB level) pour empêcher les modifications sur périodes closes.

- [ ] **Task 2: Flux de Déclaration**
  - [ ] 2.1: Concevoir l'interface de clôture fiscale étape par étape.

## Dev Notes

### Critical
- Une fois fermée, une période ne peut être réouverte que par un Utilisateur avec le rôle "Super Admin" pour des raisons de conformité et de sécurité.
