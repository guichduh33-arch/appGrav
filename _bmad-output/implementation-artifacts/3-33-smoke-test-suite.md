# Story 3.33: Smoke Test Suite

Status: backlog

## Story

As a **DevOps Engineer**,
I want **une suite de tests "Smoke" (chemins critiques)**,
so that **je peux rapidement valider qu'une release est prête pour la production**.

## Acceptance Criteria

### AC1: Script de Smoke Test Automatisé
**Given** suite de tests
**When** exécution de `npm run test:smoke`
**Then** les flux suivants sont vérifiés :
- Ouvrir shift
- Ajouter item au panier
- Payer (Split Pay)
- Annuler (Void)
- Rembourser (Refund)
- Fermer shift

### AC2: Rapport de Validation
**Given** fin de la suite Smoke
**When** les tests sont terminés
**Then** un rapport synthétique affiche SUCCESS/FAILURE pour chaque flux critique

## Tasks / Subtasks

- [ ] **Task 1: Identifier les cas de test critiques**
- [ ] **Task 2: Implémenter le script de Smoke Test (Vitest)**
- [ ] **Task 3: Ajouter le script au package.json**

## Dev Notes

### reference
`tech_spec_pos_interface_revision.md#F3.6: Smoke-test suite`
