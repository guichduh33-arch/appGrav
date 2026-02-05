# Story 7.12: Receipt Printing Integration

Status: ready-for-dev

## Story

As a **Caissier**,
I want **imprimer automatiquement les tickets de caisse**,
So that **le client reçoit sa preuve d'achat instantanément après le paiement**.

## Acceptance Criteria

### AC1: Impression Auto sur Paiement
**Given** le succès d'une transaction de paiement
**When** l'option "Auto-print" est active
**Then** le système génère le template ESC/POS et l'envoie au Print-Server
**And** le ticket sort en moins de 2 secondes

### AC2: Formatage du Ticket 80mm
**Given** un ticket imprimé
**When** je le vérifie
**Then** il contient: Logo, Nom de l'échoppe, Détails des items, Total, TVA détaillée, et un message "Thank you" personalisable

### AC3: Réimpression Manuelle
**Given** une commande passée
**When** je clique sur "Print Receipt" dans l'historique
**Then** un duplicata exact est imprimé avec la mention "DUPLICATE"

## Tasks

- [ ] **Task 1: Template de Ticket**
  - [ ] 1.1: Créer `src/services/print/templates/receiptTemplate.ts`
  - [ ] 1.2: Gérer les caractères spéciaux indonésiens et le formatage colonnes

- [ ] **Task 2: Service d'Impression POS**
  - [ ] 2.1: Implémenter `printService.printReceipt(order)`
  - [ ] 2.2: Gérer les erreurs (imprimante hors-ligne, papier vide) avec alertes UI

- [ ] **Task 3: Optimisation**
  - [ ] 3.1: Réduire la taille des images (logo) pour une impression ultra-rapide

## Dev Notes

### Format
- Standard thermique 80mm.
- Utilisation de polices à largeur fixe pour l'alignement des prix.
