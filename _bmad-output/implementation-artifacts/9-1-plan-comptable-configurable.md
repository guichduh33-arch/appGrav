# Story 9.1: Plan Comptable Configurable

Status: ready-for-dev

## Story

As a **Admin**,
I want **configurer le plan comptable (Chart of Accounts)**,
So that **les écritures automatiques utilisent les bons comptes selon les normes indonésiennes**.

## Acceptance Criteria

### AC1: Import du Plan Standard
**Given** l'initialisation du module comptable
**When** je clique sur "Setup Default Chart"
**Then** le système importe automatiquement les classes 1 à 7 conformément au plan comptable PME indonésien.

### AC2: Gestion des Comptes
**Given** la liste des comptes
**When** je souhaite ajouter un sous-compte
**Then** je peux définir son Code (Unique), son Libellé, et son Type (Actif, Passif, Charge, Produit).

### AC3: Hiérarchie Visuelle
**Given** le plan comptable
**When** je le consulte
**Then** les comptes sont affichés de manière hiérarchique (Parent/Enfant) pour faciliter la lecture.

## Tasks

- [ ] **Task 1: Schéma de Base**
  - [ ] 1.1: Créer la table `accounting_accounts` dans Supabase avec support hiérarchique (parent_id).

- [ ] **Task 2: UI de Gestion**
  - [ ] 2.1: Créer `src/pages/admin/accounting/ChartOfAccounts.tsx`
  - [ ] 2.2: Implémenter le formulaire de création/édition de compte.

- [ ] **Task 3: Seed Data**
  - [ ] 3.1: Préparer un fichier JSON contenant le plan comptable standard indonésien pour l'import initial.

## Dev Notes

### Structure
- Codes standard: 1xxx (Actif), 2xxx (Passif), 4xxx (Tiers), 7xxx (Produits).
- RLS strict pour empêcher la suppression de comptes ayant des écritures.
