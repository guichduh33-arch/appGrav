# Story 9.4: Journal de Banque/Caisse

Status: ready-for-dev

## Story

As a **Comptable**,
I want **enregistrer les mouvements de trésorerie manuels (Petty Cash, Frais)**,
So that **la comptabilité reflète fidèlement tous les flux financiers de la boulangerie**.

## Acceptance Criteria

### AC1: Saisie d'Écriture Manuelle
**Given** le journal de banque
**When** je clique sur "New Entry"
**Then** je peux saisir une date, un libellé, et plusieurs lignes Débit/Crédit.
**And** le système bloque la sauvegarde si le total n'est pas équilibré (Débit != Crédit).

### AC2: Contrôle du Solde Progressif
**Given** la liste des mouvements
**When** je consulte le journal
**Then** une colonne affiche le solde progressif calculé pour le compte de trésorerie sélectionné.

## Tasks

- [ ] **Task 1: Formulaire de Saisie**
  - [ ] 1.1: Créer `src/components/admin/accounting/JournalEntryForm.tsx` dynamique (multi-lignes).

- [ ] **Task 2: Validation d'Équilibre**
  - [ ] 2.1: Implémenter une règle de validation côté client et serveur pour l'équilibre des montants.

## Dev Notes

### UX
- Raccourcis clavier (Alt+N pour nouvelle ligne) pour une saisie rapide par un comptable.
