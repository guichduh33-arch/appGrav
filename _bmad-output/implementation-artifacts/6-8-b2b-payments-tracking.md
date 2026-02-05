# Story 6.8: B2B Payments Tracking

Status: ready-for-dev

## Story

As a **Manager**,
I want **enregistrer les paiements B2B**,
So that **je suis les créances clients et sais quelles factures sont soldées**.

## Acceptance Criteria

### AC1: Tableau de Bord des Créances
**Given** j'ouvre l'onglet "Accounts Receivable"
**When** la liste s'affiche
**Then** je vois tous les clients business ayant un solde débiteur
**And** je peux filtrer par client ou par retard de paiement (overdue)

### AC2: Enregistrement de Paiement Partiel/Total
**Given** une facture B2B non soldée
**When** je clique sur "Record Payment"
**Then** je peux saisir le montant reçu et le mode de paiement (virement, chèque, cash)
**And** le système met à jour le solde restant de la facture instantanément

### AC3: Historique des Paiements
**Given** un client B2B
**When** j'ouvre son profil
**Then** je vois l'historique complet des factures et des paiements associés
**And** je peux imprimer un relevé de compte (Statement of Account)

### AC4: Réconciliation Automatique
**Given** un virement bancaire couvrant plusieurs factures
**When** je l'enregistre
**Then** le système propose de solder les factures les plus anciennes en priorité (FIFO) jusqu'à épuisement du montant

## Tasks

- [ ] **Task 1: Interface de Suivi des Dette**
  - [ ] 1.1: Créer `src/pages/admin/receivables/ReceivablesPage.tsx`
  - [ ] 1.2: Ajouter des filtres par date et statut de paiement

- [ ] **Task 2: Service de Gestion des Paiements**
  - [ ] 2.1: Créer `src/services/b2b/arService.ts` (Accounts Receivable)
  - [ ] 2.2: Implémenter la logique de lettrage des factures

- [ ] **Task 3: Rapports**
  - [ ] 3.1: Générer le rapport d'échéancier (Aging Report: 0-30, 31-60, 60+ jours)
  - [ ] 3.2: Exporter la liste des impayés en CSV

- [ ] **Task 4: Tests**
  - [ ] 4.1: Vérifier le calcul des soldes après paiements multiples sur une même facture

## Dev Notes

### Data Model
- Utilise la table `order_payments` liée à `orders`.
- Le statut final de la commande passe à `paid` uniquement quand le solde est à zéro.

### Notification
- Alerte visuelle pour les factures dépassant la date d'échéance.
