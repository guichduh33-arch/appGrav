# Story 3.30: Order Level Notes

Status: backlog

## Story

As a **Cashier**,
I want **pouvoir ajouter une note générale à une commande**,
so that **je peux transmettre des instructions spéciales (ex: 'Allergies', 'Urgent') à la cuisine ou au serveur**.

## Acceptance Criteria

### AC1: Champ Note dans le Panier
**Given** interface du panier (Cart)
**When** je veux ajouter une note globale
**Then** je vois un champ texte ou une zone de texte dédiée

### AC2: Persistance de la Note
**Given** note saisie
**When** la commande est enregistrée
**Then** la note est stockée dans le champ `notes` de la table `orders`
**And** elle est visible dans les détails de la commande sur les autres interfaces (KDS, Mobile)

## Tasks / Subtasks

- [ ] **Task 1: Modifier le cartStore**
  - [ ] 1.1: Ajouter le champ `notes` dans l'état du panier
- [ ] **Task 2: Modifier l'UI du Panier**
  - [ ] 2.1: Ajouter un bouton "Add Note" ou un champ direct dans `Cart.tsx`

## Dev Notes

### reference
`tech_spec_pos_interface_revision.md#F3.3: Order-level notes`
