# Story 6.7: B2B Order Creation

Status: ready-for-dev

## Story

As a **Manager**,
I want **créer une commande B2B**,
So that **je peux gérer les clients wholesale avec des prix spécifiques et des paiements à crédit**.

## Acceptance Criteria

### AC1: Sélection Client B2B
**Given** je crée une nouvelle commande
**When** je sélectionne un client de catégorie "wholesale"
**Then** l'interface passe en mode "B2B"
**And** le bandeau de commande affiche les détails de l'entreprise cliente

### AC2: Application des Prix Wholesale
**Given** un client B2B est sélectionné
**When** j'ajoute des produits au panier
**Then** le système utilise automatiquement le `wholesale_price` défini pour chaque produit
**And** si aucun prix wholesale n'est défini, le prix retail par défaut est appliqué

### AC3: Options de Paiement Crédit
**Given** une commande B2B
**When** j'arrive à l'écran de paiement
**Then** l'option "Store Credit / On Account" est disponible
**And** je peux définir une date d'échéance (due date) pour le paiement

### AC4: Génération de Pro-forma
**Given** une commande B2B finalisée à crédit
**When** je demande l'impression
**Then** le document généré est une "Invoice" (Facture) au lieu d'un simple ticket
**And** il inclut les mentions légales B2B et NPWP de l'entreprise

## Tasks

- [ ] **Task 1: Logique de Prix B2B**
  - [ ] 1.1: Mettre à jour `priceService.ts` pour prioriser les prix wholesale pour les clients B2B
  - [ ] 1.2: Gérer les remises par volume si spécifié dans le contrat client

- [ ] **Task 2: Interface de Commande**
  - [ ] 2.1: Ajouter un indicateur visuel "B2B Mode" dans le header du POS
  - [ ] 2.2: Modifier le sélecteur de client pour filtrer/mettre en avant les clients business

- [ ] **Task 3: Workflow de Paiement**
  - [ ] 3.1: Ajouter `payment_term` et `due_date` dans l'interface de paiement
  - [ ] 3.2: Créer le service `b2bCreditService.ts` pour enregistrer la créance

- [ ] **Task 4: Template de Facture**
  - [ ] 4.1: Créer un template d'impression spécifique PDF/ESC-POS pour les factures B2B

## Dev Notes

### Business Rules
- Un client B2B peut avoir des limites de crédit (credit limit).
- La TVA est toujours incluse mais doit être détaillée sur la facture.

### Offline
- La création de commande B2B offline est autorisée.
- La vérification du crédit disponible peut être limitée en mode offline (basée sur le cache Story 6.1).
