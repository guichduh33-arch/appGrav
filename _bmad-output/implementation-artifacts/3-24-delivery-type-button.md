# Story 3.24: Delivery Type Button

Status: backlog

## Story

As a **User**,
I want **pouvoir sélectionner 'Delivery' comme type de commande**,
so that **je peux différencier les commandes à livrer des commandes sur place ou à emporter**.

## Acceptance Criteria

### AC1: Ajout du Bouton 'Delivery'
**Given** composant `Cart` affichant les types de commande
**When** je regarde les options disponibles
**Then** je vois 3 boutons : "Dine In", "Takeaway" et "Delivery"

### AC2: Persistance du Type de Commande
**Given** sélection de 'Delivery'
**When** la commande est créée
**Then** la colonne `order_type` dans la base de données contient la valeur `delivery`

## Tasks / Subtasks

- [ ] **Task 1: Modifier Cart.tsx**
  - [ ] 1.1: Mettre à jour la liste des types de commande mappés pour inclure `delivery`
  - [ ] 1.2: Assurer que le style visuel `is-active` s'applique correctement

## Dev Notes

### reference
`tech_spec_pos_interface_revision.md#F2.8: Delivery Type Button`
