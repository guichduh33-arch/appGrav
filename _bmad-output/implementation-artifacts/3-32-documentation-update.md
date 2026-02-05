# Story 3.32: Documentation Update

Status: backlog

## Story

As a **Lead Developer**,
I want **mettre à jour la documentation technique (CLAUDE.md, docs/)**,
so that **les futurs développeurs comprennent le nouveau système de paiement et ses spécificités**.

## Acceptance Criteria

### AC1: CLAUDE.md Mis à Jour
**Given** modification majeure de l'architecture
**When** je consulte `CLAUDE.md`
**Then** je vois les sections sur le `paymentService`, `financialOperationService` et les patterns de sync

### AC2: Documentation Interne du Code
**Given** nouveaux services et composants
**When** je lis le code
**Then** chaque fonction critique est documentée avec des JSDoc expliquant les paramètres et retours

## Tasks / Subtasks

- [ ] **Task 1: Mettre à jour CLAUDE.md**
  - [ ] 1.1: Ajouter les nouveaux services à la liste des services critiques
- [ ] **Task 2: Rédiger la doc des services financiers**
  - [ ] 2.1: Expliquer le fonctionnement de la résolution de conflits pour les Voids

## Dev Notes

### reference
`tech_spec_pos_interface_revision.md#F3.5: Documentation Update`
