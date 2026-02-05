# Story 3.12: Consolidate Payment Types

Status: backlog

## Story

As a **Developer**,
I want **une source unique de vérité pour les types de paiement**,
so that **le code TypeScript est synchronisé avec l'enum de la base de données**.

## Acceptance Criteria

### AC1: Fichier Central de Types Paiement
**Given** plusieurs définitions de `TPaymentMethod` éparpillées
**When** je cherche le type de référence
**Then** je le trouve dans `src/types/payment.ts`
**And** il inclut : `cash`, `card`, `qris`, `edc`, `transfer`

### AC2: Nettoyage des Définitions Dupliquées
**Given** `src/types/offline.ts`, `src/types/settings.ts`, `src/types/database.ts`
**When** ces fichiers importent le type de paiement
**Then** ils utilisent l'import depuis `@/types/payment` (ou ré-exportent la version centrale)

### AC3: Pas de Régression de Typage
**Given** refactorisation des imports
**When** je compile le projet
**Then** aucune erreur TypeScript liée au type `TPaymentMethod` n'apparaît

## Tasks / Subtasks

- [ ] **Task 1: Créer le fichier central de types**
  - [ ] 1.1: Créer `src/types/payment.ts`
  - [ ] 1.2: Définir `TPaymentMethod` aligné sur l'enum DB
- [ ] **Task 2: Refactoriser les définitions existantes**
  - [ ] 2.1: Modifier `src/types/offline.ts` pour utiliser le nouveau type
  - [ ] 2.2: Modifier `src/types/settings.ts`
  - [ ] 2.3: Modifier `src/types/database.ts`
- [ ] **Task 3: Rechercher et Remplacer les imports ad-hoc**
  - [ ] 3.1: Grep sur la codebase pour trouver les définitions inline de `TPaymentMethod`
  - [ ] 3.2: Remplacer par l'import centralisé

## Dev Notes

### Implementation Detail

```typescript
/**
 * Payment method - aligned with database enum
 * Source: supabase/migrations/001_extensions_enums.sql
 */
export type TPaymentMethod = 'cash' | 'card' | 'qris' | 'edc' | 'transfer';
```

**Files to audit:**
- `src/types/offline.ts`
- `src/types/settings.ts`
- `src/types/database.ts`
- `src/hooks/offline/useOfflinePayment.ts`
