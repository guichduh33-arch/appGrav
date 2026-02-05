# Story 7.15: Barista Ticket Printing

Status: ready-for-dev

## Story

As a **Barista**,
I want **mes tickets de boissons sur ma propre imprimante**,
So that **je ne me mélange pas avec les tickets de cuisine (foods)**.

## Acceptance Criteria

### AC1: Ségrégation des Boissons
**Given** une commande mixte (Café + Sandwich)
**When** envoyée en production
**Then** le café s'imprime sur l'imprimante comptoir/barista
**And** le sandwich s'imprime sur l'imprimante cuisine

### AC2: Format Étiquette (Sticky Label) - Future Ready
**Given** l'imprimante barista
**When** configurée pour le mode "Label"
**Then** le ticket contient le nom du client et le nom de la boisson en format compact pour être collé sur le gobelet

### AC3: Gestion du Stock Lait/Grains
**Given** l'impression d'un ticket barista
**When** le ticket sort
**Then** le système peut optionnellement déduire le stock théorique de lait si configuré (Post-MVP)

## Tasks

- [ ] **Task 1: Configuration Imprimante Barista**
  - [ ] 1.1: Ajouter le type `barista` dans `printer_configurations`
  - [ ] 1.2: Mapper les catégories "Drinks" vers cette imprimante dans les settings

- [ ] **Task 2: Template Barista**
  - [ ] 2.1: Créer `src/services/print/templates/baristaTemplate.ts` (format plus compact, focus nom client)

- [ ] **Task 3: Test Multi-Target**
  - [ ] 3.1: Simuler une commande complexe avec 3 imprimantes cibles et vérifier l'isolation des données

## Dev Notes

### Usage
- Indispensable pour les rushs matinaux.
- Le nom du client est le champ le plus important sur ce ticket.
