# Story 9.3: Journal des Achats (Auto-génération)

Status: ready-for-dev

## Story

As a **Système**,
I want **générer automatiquement les écritures d'achat**,
So that **chaque réception de marchandise fournisseur est comptabilisée**.

## Acceptance Criteria

### AC1: Comptabilisation à la Réception
**Given** une réception de Purchase Order (Story 5.8)
**When** les stocks sont validés
**Then** une écriture est créée: Débit Stock/Charges (607) et TVA Déductible (44566), Crédit Fournisseur (401).

### AC2: Lettrage Fournisseur
**Given** le paiement d'une facture fournisseur
**When** le règlement est enregistré
**Then** une écriture de trésorerie est générée et liée (lettrée) à la facture d'origine.

## Tasks

- [ ] **Task 1: Intégration Flux d'Achat**
  - [ ] 1.1: Déclencher la génération d'écriture lors du passage au statut `received` d'un PO.

- [ ] **Task 2: UI Journal des Achats**
  - [ ] 2.1: Créer `src/pages/admin/accounting/PurchasesJournal.tsx` pour visualiser ces flux.

## Dev Notes

### Complexity
- Gérer les réceptions partielles (génération d'écriture au prorata de la réception).
