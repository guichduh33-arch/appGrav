# Story 3.13: Payment Service Base

Status: backlog

## Story

As a **Developer**,
I want **un service unifié pour gérer tous les paiements (simple et split)**,
so that **la logique de paiement n'est pas dupliquée dans les composants UI**.

## Acceptance Criteria

### AC1: Interface IPaymentService implémentée
**Given** besoin de traiter un paiement
**When** j'utilise `paymentService`
**Then** je peux appeler `processPayment` (simple) ou `processSplitPayment` (multiple)
**And** l'interface fournit `calculateChange` et `validatePayment`

### AC2: Support Offline-First
**Given** mode offline actif
**When** je traite un paiement via le service
**Then** le résultat indique que le paiement est marqué `is_offline: true`
**And** il est prêt pour la queue de synchronisation

### AC3: Intégration Types Centralisés
**Given** nouveau `paymentService`
**When** j'examine les paramètres (ex: `method`)
**Then** ils utilisent le type consolidé `TPaymentMethod` de Story 3.12

## Tasks / Subtasks

- [ ] **Task 1: Définir les interfaces de service**
  - [ ] 1.1: Créer `src/services/payment/paymentService.ts`
  - [ ] 1.2: Définir `IPaymentInput`, `IPaymentResult`, `ISplitPaymentState`
- [ ] **Task 2: Implémenter la classe PaymentService**
  - [ ] 2.1: Implémenter `processPayment` avec logique de rendu de monnaie
  - [ ] 2.2: Implémenter `processSplitPayment`
  - [ ] 2.3: Implémenter `validatePayment` (vérification montants vs total commande)
- [ ] **Task 3: Export de l'instance singleton**
  - [ ] 3.1: Exporter `paymentService` constant pour usage global

## Dev Notes

### Implementation Preview

```typescript
import type { TPaymentMethod } from '@/types/payment';

export interface IPaymentInput {
    method: TPaymentMethod;
    amount: number;
    cashReceived?: number;
    reference?: string;
    isOffline?: boolean;
}

export interface IPaymentResult {
    success: boolean;
    paymentId: string;
    change?: number;
    error?: string;
}

export interface IPaymentService {
    processPayment(orderId: string, input: IPaymentInput): Promise<IPaymentResult>;
    processSplitPayment(orderId: string, inputs: IPaymentInput[]): Promise<IPaymentResult>;
    validatePayment(input: IPaymentInput, orderTotal: number): IValidationResult;
    calculateChange(cashReceived: number, amount: number): number;
}
```

### Reference
`tech_spec_pos_interface_revision.md#F1.5: Create PaymentService Base`
