# Story 9.9: Gestion TVA (Collectée/Déductible)

Status: ready-for-dev

## Story

As a **Comptable**,
I want **suivre la TVA collectée et déductible**,
So that **je sais quel montant payer au fisc indonésien chaque mois**.

## Acceptance Criteria

### AC1: Dashboard de TVA
**Given** le module fiscal
**When** je sélectionne un mois
**Then** je vois le Total TVA sur Ventes (Collectée) et le Total TVA sur Achats (Déductible).

### AC2: Calcul de la Taxe à Payer
**Given** les données de TVA
**When** le mois est clos
**Then** le système affiche `Paiement = Collectée - Déductible` (ou un crédit de TVA si le résultat est négatif).

## Tasks

- [ ] **Task 1: Service Fiscal**
  - [ ] 1.1: Créer `src/services/accounting/taxService.ts`
  - [ ] 1.2: Isoler les écritures sur les comptes 44571 et 44566.

- [ ] **Task 2: Vue de Reporting TVA**
  - [ ] 2.1: Créer `src/pages/admin/accounting/TaxDashboard.tsx`.

## Dev Notes

### Regulation
- Basé sur la taxe PPN indonésienne (10% standard, passant potentiellement à 11% ou 12%). La valeur doit être configurable.
