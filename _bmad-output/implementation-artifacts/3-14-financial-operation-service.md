# Story 3.14: Financial Operation Service

Status: backlog

## Story

As a **Security Officer**,
I want **un service central pour les opérations critiques (Void/Refund)**,
so that **chaque annulation ou remboursement est audité et résolu en cas de conflit**.

## Acceptance Criteria

### AC1: Services de Base Créés
**Given** besoin d'annuler ou rembourser une commande
**When** j'utilise les services financiers
**Then** je trouve `voidService.ts` et `refundService.ts`
**And** ils implémentent les types `IVoidInput` et `IRefundInput`

### AC2: Audit Trail Log Automatique
**Given** une opération financière (Void ou Refund) exécutée
**When** l'opération est terminée (succès ou échec)
**Then** un log est créé dans `auditService`
**And** la sévérité est marquée comme `critical`

### AC3: Gestion des Conflits Documentée
**Given** une opération effectuée offline
**When** la sync s'exécute
**Then** le service applique la règle `reject_if_server_newer` si la commande a été modifiée sur le serveur entre-temps

## Tasks / Subtasks

- [ ] **Task 1: Créer l'interface des opérations financières**
  - [ ] 1.1: Créer `src/services/financial/financialOperationService.ts`
  - [ ] 1.2: Définir `IVoidInput`, `IRefundInput`, `IFinancialOperationResult`
  - [ ] 1.3: Définir les Reason Codes (`TVoidReasonCode`, `TRefundReasonCode`)
- [ ] **Task 2: Implémenter le service de Void**
  - [ ] 2.1: Créer `src/services/financial/voidService.ts`
  - [ ] 2.2: Implémenter logique de changement de statut à `voided`
- [ ] **Task 3: Implémenter le service de Refund**
  - [ ] 2.3: Créer `src/services/financial/refundService.ts`
  - [ ] 2.4: Implémenter logique de remboursement partiel/total et mise à jour des montants
- [ ] **Task 4: Créer le squelette de l'Audit Service**
  - [ ] 4.1: Créer `src/services/financial/auditService.ts`
  - [ ] 4.2: Implémenter méthode `log()` pour enregistrer les actions critiques

## Dev Notes

### Implementation Preview

```typescript
export interface IVoidInput {
    orderId: string;
    reason: string;
    reasonCode: TVoidReasonCode;
    voidedBy: string;
}

export type TVoidReasonCode =
    | 'customer_changed_mind'
    | 'duplicate_order'
    | 'wrong_items'
    | 'system_error'
    | 'other';

// Conflict resolution rule
export interface IConflictResolution {
    serverUpdatedAt: Date;
    localOperationAt: Date;
    rule: 'reject_if_server_newer' | 'force_apply';
}
```

### Reference
`tech_spec_pos_interface_revision.md#F1.6: Create FinancialOperationService Base`
