# ADR-001: Payment System Refactor

## Status

Accepted

## Date

2026-02-05

## Context

The current payment system in AppGrav has several issues identified through multi-agent analysis:

1. **Missing Infrastructure**: The `order_payments` table does not exist, causing sync queue failures when processing payments
2. **Type Inconsistencies**: `TPaymentMethod` is defined in 3 different locations with inconsistent values
3. **No Split Payment Support**: UI blocks split payments despite service layer support
4. **Missing Financial Operations**: No void/refund functionality implemented (FR-POS-17, FR-POS-18)
5. **No Audit Trail**: Critical financial operations lack proper audit logging

### Current State

- Payment processing: Single payment only via `useOfflinePayment` hook
- Payment types: Duplicated across `offline.ts`, `settings.ts`, `database.ts`
- EDC method: Exists in DB enum but missing from UI
- Void/Refund: Not implemented
- Sync: Fails on `order_payments` table (does not exist)

## Decision

### 1. Create `order_payments` Table

Store individual payments to support split payment and reconciliation:

```sql
CREATE TABLE public.order_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method payment_method NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    cash_received DECIMAL(12, 2),
    change_given DECIMAL(12, 2),
    reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed',
    is_offline BOOLEAN DEFAULT false,
    synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);
```

### 2. Consolidate `TPaymentMethod`

Create single source of truth in `src/types/payment.ts`:

```typescript
export type TPaymentMethod = 'cash' | 'card' | 'qris' | 'edc' | 'transfer';
```

All other files will re-export from this location.

### 3. Create `paymentService.ts`

Unified payment processing interface:

```typescript
interface IPaymentService {
    processPayment(orderId: string, input: IPaymentInput): Promise<IPaymentResult>;
    processSplitPayment(orderId: string, inputs: IPaymentInput[]): Promise<IPaymentResult>;
    validatePayment(input: IPaymentInput, orderTotal: number): IValidationResult;
    calculateChange(cashReceived: number, amount: number): number;
}
```

### 4. Create `financialOperationService.ts`

Handle void and refund operations with:

- Mandatory reason codes
- PIN verification requirement
- Audit logging with severity='critical'
- Offline conflict resolution

### 5. Use State Machine for Split Payment

Payment flow states:
- `idle` → `adding` (user selects method)
- `adding` → `validating` (user enters amount)
- `validating` → `adding` (can add more) or `complete` (total reached)
- any → `idle` (cancel/reset)

## Consequences

### Positive

- Split payments enabled for customer flexibility
- Proper audit trail for compliance
- Single source of truth for payment types
- Sync queue no longer fails
- Void/Refund operations properly tracked

### Negative

- Breaking change: `useOfflinePayment` hook signature changes
- Migration required before deployment
- All payment-related code must update imports

### Neutral

- EDC method added to UI (was already in DB enum)
- Existing single payments continue to work

## Alternatives Considered

### A. Embed payments in orders table (JSONB)

**Rejected**: Loses referential integrity, harder to query, no individual payment status tracking.

### B. Keep multiple TPaymentMethod definitions

**Rejected**: Leads to drift and bugs (already missing 'edc' in offline.ts).

### C. Add void/refund as order status only

**Rejected**: Need to track amounts, reasons, methods for partial refunds.

## Related Decisions

- ADR-002 (future): Customer Display architecture
- ADR-003 (future): Print server integration

## References

- Tech-Spec: `_bmad-output/implementation-artifacts/tech-spec-pos-interface-revision.md`
- Project Context: `_bmad-output/project-context.md`
- CLAUDE.md: Business rules section
