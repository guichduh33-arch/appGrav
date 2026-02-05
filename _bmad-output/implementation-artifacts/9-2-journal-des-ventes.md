# Story 9.2: Journal des Ventes (Auto-génération)

Status: ready-for-dev

## Story

As a **Système**,
I want **générer automatiquement les écritures de vente**,
So that **chaque transaction POS est comptabilisée sans intervention manuelle**.

## Acceptance Criteria

### AC1: Écriture Temps Réel
**Given** une commande finalisée et payée au POS
**When** la transaction est synchronisée sur le serveur
**Then** une écriture comptable est générée automatiquement dans le journal des ventes (Sales Journal).

### AC2: Ventilation Comptable
**Given** une vente de Rp 110.000 (incluant 10% TVA)
**When** l'écriture est générée
**Then** elle doit créditer le Produit (707) pour Rp 100.000, créditer la TVA Collectée (44571) pour Rp 10.000 et débiter la Caisse ou le client (411).

### AC3: Gestion des Annulations (Voids)
**Given** une commande annulée
**When** l'annulation est validée
**Then** le système génère une écriture d'extourne (Reverse Entry) pour annuler l'impact sur le CA et la TVA.

## Tasks

- [ ] **Task 1: Accounting Middleware**
  - [ ] 1.1: Créer un trigger Postgres ou une Edge Function qui écoute les insertions dans `orders`.

- [ ] **Task 2: Logique de Ventilation**
  - [ ] 2.1: Implémenter `src/services/accounting/entryGenerator.ts`
  - [ ] 2.2: Gérer les différents modes de paiement vers les bons comptes de trésorerie.

## Dev Notes

### Precision
- Arrondi au 1 IDR le plus proche pour l'équilibre parfait débit/crédit.
- Référence croisée: Chaque écriture doit pointer vers l'ID de la commande source.
