# Story 3.28: Print Service Integration

Status: backlog

## Story

As a **Cashier**,
I want **imprimer automatiquement les tickets de caisse via un serveur local**,
so that **je peux donner un reçu physique au client instantanément**.

## Acceptance Criteria

### AC1: Connexion au Serveur Local
**Given** serveur d'impression lancé sur `localhost:3001`
**When** l'application démarre
**Then** elle vérifie la santé (health check) du serveur d'impression

### AC2: Impression Réussie
**Given** commande complétée
**When** je clique sur "Print Receipt"
**Then** une requête POST est envoyée au serveur local avec les données de la commande
**And** le serveur renvoie un statut de succès

### AC3: Gestion des Erreurs de Print
**Given** serveur d'impression hors-ligne
**When** tentative d'impression
**Then** l'utilisateur est averti que l'imprimante n'est pas disponible

## Tasks / Subtasks

- [ ] **Task 1: Créer le service d'impression**
  - [ ] 1.1: Créer `src/services/print/printService.ts`
  - [ ] 1.2: Implémenter `checkPrintServer` et `printReceipt`
- [ ] **Task 2: Intégrer le bouton d'impression**
  - [ ] 2.1: Remplacer le placeholder "Print" par l'appel au service dans `Cart.tsx` ou composant de succès

## Dev Notes

### reference
`tech_spec_pos_interface_revision.md#F3.1: Print Service Integration`
