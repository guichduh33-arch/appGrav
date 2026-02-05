# Story 7.13: Kitchen Ticket Printing

Status: ready-for-dev

## Story

As a **Cuisinier**,
I want **recevoir un ticket papier en cuisine**,
So that **j'ai un support physique pour préparer les commandes même sans regarder l'écran KDS**.

## Acceptance Criteria

### AC1: Impression au Dispatch
**Given** une nouvelle commande validée au POS
**When** elle contient des items assignés à la station "Kitchen"
**Then** un ticket de préparation s'imprime automatiquement sur l'imprimante cuisine
**And** il ne liste QUE les items de cette station

### AC2: Lisibilité Maximum
**Given** un ticket cuisine
**When** je le lis à distance
**Then** le numéro de commande et les quantités sont imprimés en double hauteur/largeur (double height)
**And** les notes spéciales (modifiers) sont en gras ou soulignées

### AC3: Support Multi-Stations
**Given** une commande de café et croissant
**When** les deux stations ont des imprimantes distinctes
**Then** deux tickets séparés sont émis simultanément vers les bonnes destinations

## Tasks

- [ ] **Task 1: Logique de Dispatch d'Impression**
  - [ ] 1.1: Adapter `printService` pour filtrer les items par `printer_path` ou `station_id`

- [ ] **Task 2: Template Production**
  - [ ] 2.1: Créer `src/services/print/templates/kitchenTemplate.ts` focus sur la lisibilité opérationnelle

- [ ] **Task 3: Gestion des Doublons**
  - [ ] 3.1: S'assurer qu'une modification de commande n'imprime qu'un "Add-on ticket" et pas toute la commande à nouveau

## Dev Notes

### Hardware
- Souvent des imprimantes matricielles (impact) ou thermiques robustes.
- Gérer les bips sonores de l'imprimante lors de l'arrivée d'un ticket.
