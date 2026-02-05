---
title: 'POS Interface Complete Revision'
slug: 'pos-interface-revision'
created: '2026-02-05'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack:
  - React 18 + TypeScript
  - Zustand (cartStore, orderStore, networkStore)
  - Dexie (IndexedDB)
  - Supabase PostgreSQL
  - Tailwind CSS + shadcn/ui
files_to_modify:
  - src/components/pos/Cart.tsx
  - src/components/pos/modals/PaymentModal.tsx
  - src/pages/pos/POSMainPage.tsx
  - src/stores/cartStore.ts
  - src/hooks/offline/useOfflinePayment.ts
  - supabase/migrations/ (new migrations)
code_patterns:
  - Offline-first with sync queue
  - PIN verification for sensitive actions
  - BEM CSS naming convention
  - Zustand for client state only
  - BroadcastChannel for cross-tab communication
test_patterns:
  - Vitest + @testing-library/react
  - fake-indexeddb for Dexie tests
  - 100% coverage on financial operations
---

# Tech-Spec: POS Interface Complete Revision

**Created:** 2026-02-05
**Reviewed:** Party Mode with 6 agents (Architect, Dev, UX, Test, SM, PM)
**Approach:** 3 Phases with Validation Gates - Optimal Quality Focus

## Overview

### Problem Statement

L'interface POS d'AppGrav présente plusieurs problèmes critiques identifiés par une analyse multi-agents :

1. **Blockers techniques** : Table `order_payments` manquante causant des erreurs de sync, split payment bloqué par validation, EDC absent du PaymentModal
2. **Non-conformité FR** : Void/Refund non implémentés (FR-POS-17, FR-POS-18), delivery type non sélectionnable (FR-POS-05)
3. **UX incohérent** : 13+ strings françaises dans un système "English only", pas d'indicateur de shift visible, bouton Print placeholder

### Solution

Révision complète en **3 phases avec validation gates** :
- **Phase 1: Foundation** - Architecture solide, migrations, types consolidés
- **Phase 2: Core Features** - Split payment, Void/Refund, UX improvements
- **Phase 3: Polish** - Print, Display, nice-to-haves

**Priorité** : Résultat optimal sans deadline - chaque phase validée avant passage à la suivante.

### Scope

**In Scope:**
- Architecture Decision Record (ADR) pour Payment System
- Migrations `order_payments` + refund fields
- Consolidation types `TPaymentMethod`
- Services refactorisés (paymentService, financialOperationService)
- Split Payment avec state machine
- VoidModal et RefundModal avec PIN + reason
- EDC payment method
- Delivery type button
- Shift indicator banner
- French strings cleanup complet
- Print server integration
- Customer Display broadcast (BroadcastChannel)
- Order-level notes
- Test coverage 100% sur financial operations
- Security audit

**Out of Scope:**
- Mobile app (Epic 7)
- Refonte design complète
- Nouveaux rapports (Epic 8)
- i18n activation (reste suspendu)

## Pre-Implementation Deliverables

### D1: Architecture Decision Record (ADR)

**File:** `docs/adr/ADR-001-payment-system-refactor.md`

```markdown
# ADR-001: Payment System Refactor

## Status
Proposed

## Context
Le système de paiement actuel a des incohérences de types, une table manquante,
et ne supporte pas le split payment.

## Decision
1. Créer table `order_payments` pour stocker les paiements multiples
2. Consolider `TPaymentMethod` sur l'enum DB comme source unique
3. Créer `paymentService.ts` avec interface unifiée
4. Créer `financialOperationService.ts` pour void/refund
5. Utiliser state machine pour split payment flow

## Consequences
- Breaking change: useOfflinePayment hook signature change
- Migration required before deployment
- All payment-related code must use new types
```

### D2: UX Wireframes (Excalidraw)

**File:** `docs/wireframes/pos-revision-wireframes.excalidraw`

Wireframes requis avant Phase 2 :
1. Split Payment Modal - avec progress bar et "Add Payment" button
2. Void Order Modal - red theme, reason dropdown, double confirm
3. Refund Modal - full/partial toggle, method selection

### D3: Test Matrix Document

**File:** `docs/testing/pos-revision-test-matrix.md`

Scenarios critiques documentés avec expected results.

---

## Phase 1: Foundation

**Duration:** 2-3 semaines
**Gate:** Architecture validated + tests green + no French strings

### F1.1: ADR Payment System Architecture

**Action:** Create ADR document

**File:** `docs/adr/ADR-001-payment-system-refactor.md`

**AC:**
- Given team needs architectural guidance
- When developer reads ADR
- Then all payment design decisions are documented

---

### F1.2: Migration `order_payments`

**File:** `supabase/migrations/YYYYMMDDHHMMSS_create_order_payments.sql`

```sql
-- Order payments table for split payment support
CREATE TABLE IF NOT EXISTS public.order_payments (
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

-- Composite index for reconciliation queries (Winston recommendation)
CREATE INDEX idx_order_payments_order_status ON public.order_payments(order_id, status);
CREATE INDEX idx_order_payments_created ON public.order_payments(created_at);

-- RLS
ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON public.order_payments
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated insert" ON public.order_payments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated update" ON public.order_payments
    FOR UPDATE USING (auth.uid() IS NOT NULL);
```

**AC:**
- Given sync queue has pending payments
- When sync engine processes them
- Then no "table does not exist" error occurs
- And composite index improves reconciliation query performance

---

### F1.3: Migration Refund Fields

**File:** `supabase/migrations/YYYYMMDDHHMMSS_add_refund_fields.sql`

```sql
-- Add refund tracking fields to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(12,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_method payment_method;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refunded_by UUID REFERENCES auth.users(id);

-- Add 'voided' to order_status enum if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'voided' AND enumtypid = 'order_status'::regtype) THEN
        ALTER TYPE order_status ADD VALUE 'voided' AFTER 'cancelled';
    END IF;
END$$;

-- Index for refund queries
CREATE INDEX IF NOT EXISTS idx_orders_refunded ON public.orders(refunded_at) WHERE refund_amount IS NOT NULL;
```

**AC:**
- Given an order needs refund tracking
- When refund is processed
- Then all refund fields are available and indexed

---

### F1.4: Consolidate TPaymentMethod Types

**Files to modify:**
- `src/types/offline.ts`
- `src/types/settings.ts`
- `src/types/database.ts`

**Single Source of Truth:**
```typescript
// src/types/payment.ts (NEW)
/**
 * Payment method - aligned with database enum
 * Source: supabase/migrations/001_extensions_enums.sql
 */
export type TPaymentMethod = 'cash' | 'card' | 'qris' | 'edc' | 'transfer';

// Re-export from central location
export type { TPaymentMethod } from './payment';
```

**AC:**
- Given any file imports payment method type
- When checking type definition
- Then all point to single source in `types/payment.ts`

---

### F1.5: Create PaymentService Base

**File:** `src/services/payment/paymentService.ts` (NEW)

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

export interface ISplitPaymentState {
    payments: IPaymentInput[];
    totalPaid: number;
    remainingAmount: number;
    status: 'idle' | 'adding' | 'validating' | 'complete';
}

export interface IPaymentService {
    processPayment(orderId: string, input: IPaymentInput): Promise<IPaymentResult>;
    processSplitPayment(orderId: string, inputs: IPaymentInput[]): Promise<IPaymentResult>;
    validatePayment(input: IPaymentInput, orderTotal: number): IValidationResult;
    calculateChange(cashReceived: number, amount: number): number;
}

// Implementation with offline support
export class PaymentService implements IPaymentService {
    // ... implementation
}

export const paymentService = new PaymentService();
```

**AC:**
- Given a payment needs processing
- When calling paymentService methods
- Then unified interface handles single and split payments

---

### F1.6: Create FinancialOperationService Base

**File:** `src/services/financial/financialOperationService.ts` (NEW)

```typescript
export interface IVoidInput {
    orderId: string;
    reason: string;
    reasonCode: TVoidReasonCode;
    voidedBy: string;
}

export interface IRefundInput {
    orderId: string;
    amount: number;
    reason: string;
    reasonCode: TRefundReasonCode;
    method: TPaymentMethod;
    refundedBy: string;
}

export interface IFinancialOperationResult {
    success: boolean;
    operationId: string;
    auditLogId: string;
    error?: string;
}

export type TVoidReasonCode =
    | 'customer_changed_mind'
    | 'duplicate_order'
    | 'wrong_items'
    | 'system_error'
    | 'other';

export type TRefundReasonCode =
    | 'product_quality'
    | 'wrong_item_delivered'
    | 'customer_dissatisfied'
    | 'overcharge'
    | 'other';

// Conflict resolution rule (Amelia's specification)
export interface IConflictResolution {
    serverUpdatedAt: Date;
    localOperationAt: Date;
    rule: 'reject_if_server_newer' | 'force_apply';
}
```

**File:** `src/services/financial/voidService.ts` (NEW)
**File:** `src/services/financial/refundService.ts` (NEW)
**File:** `src/services/financial/auditService.ts` (NEW)

**AC:**
- Given a void or refund operation
- When calling financial services
- Then operation logged to audit trail with severity='critical'

---

### F1.7: French Strings Cleanup

**Files to modify (complete list from UX audit):**

| File | Line | French | English |
|------|------|--------|---------|
| `POSMainPage.tsx` | 48 | `'Caisse Principale'` | `'Main Terminal'` |
| `POSMainPage.tsx` | 295 | `'Sélectionner une caisse'` | `'Select a terminal'` |
| `POSMainPage.tsx` | 304 | `'Caissier'` | `'Cashier'` |
| `POSMainPage.tsx` | 312 | `'Ouvrir un nouveau shift'` | `'Open a new shift'` |
| `Cart.tsx` | 132 | `'Changer'` | `'Change'` |
| `CustomerSearchModal.tsx` | 689 | `'Sélectionner'` | `'Select'` |
| `CustomerSearchModal.tsx` | 720 | `'remise'` | `'discount'` |
| `CustomerSearchModal.tsx` | 729 | `'Chargement de l'historique...'` | `'Loading history...'` |
| `CustomerSearchModal.tsx` | 808 | `'Sélectionner un Client'` | `'Select a Customer'` |
| `CustomerSearchModal.tsx` | 965 | `'Enregistrement...'` | `'Saving...'` |
| `CustomerSearchModal.tsx` | 965 | `'Enregistrer et Sélectionner'` | `'Save and Select'` |
| `TableSelectionModal.tsx` | 76 | `'Sélectionner une Table'` | `'Select a Table'` |
| `TableSelectionModal.tsx` | 78 | `'Choisissez une table...'` | `'Select an available table...'` |
| `TableSelectionModal.tsx` | 92 | `'Toutes'` | `'All'` |

**Additional audit required:** Run grep for common French words in all components.

**AC:**
- Given user opens any POS component
- When viewing UI text
- Then all strings are in English

---

### F1.8: Unit Tests for New Services

**Files:**
- `src/services/payment/__tests__/paymentService.test.ts`
- `src/services/financial/__tests__/voidService.test.ts`
- `src/services/financial/__tests__/refundService.test.ts`
- `src/services/financial/__tests__/auditService.test.ts`

**Coverage Target:** 95% for payment, 100% for financial operations

**AC:**
- Given new services implemented
- When running `npx vitest run src/services/payment src/services/financial`
- Then all tests pass with required coverage

---

### Phase 1 Validation Gate

- [ ] ADR document created and reviewed
- [ ] All migrations applied successfully (`npx supabase db push`)
- [ ] Type consolidation complete (no duplicate TPaymentMethod definitions)
- [ ] Base services tested (95%+ coverage)
- [ ] No French strings remaining (grep audit clean)
- [ ] All existing tests still pass

---

## Phase 2: Core Features

**Duration:** 3-4 semaines
**Gate:** UX approved + financial tests 100% + security audit passed
**Depends on:** Phase 1 Validation Gate passed

### F2.1: UX Wireframes (Excalidraw)

**Deliverable:** `docs/wireframes/pos-revision-wireframes.excalidraw`

**Content (per Sally's designs):**

**1. Split Payment Modal:**
```
┌─────────────────────────────────────────┐
│  CHECKOUT - Total: Rp 150.000           │
├─────────────────────────────────────────┤
│  PAYMENTS ADDED:                        │
│  ┌─────────────────────────────────┐   │
│  │ 💵 Cash      Rp 100.000    [✕]  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  REMAINING: Rp 50.000                   │
│  ━━━━━━━━━━━━━━━━━━━━ 66% ━━━━━━━━━━   │
│                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │Cash │ │Card │ │QRIS │ │ EDC │      │
│  └─────┘ └─────┘ └─────┘ └─────┘      │
│                                         │
│  [ + Add Payment Method ]               │
├─────────────────────────────────────────┤
│  [Cancel]              [Complete ✓]     │
└─────────────────────────────────────────┘
```

**2. Void Order Modal:** Red theme, reason dropdown, double confirm
**3. Refund Modal:** Full/partial toggle, method selection

**AC:**
- Given development needs UX guidance
- When developer reviews wireframes
- Then all interaction flows are clear

---

### F2.2: Split Payment UI + State Machine

**Files:**
- `src/components/pos/modals/PaymentModal.tsx` (major refactor)
- `src/stores/paymentStore.ts` (NEW)

**State Machine (Winston's recommendation):**
```typescript
// src/stores/paymentStore.ts
interface IPaymentStore {
    state: ISplitPaymentState;
    addPayment: (payment: IPaymentInput) => void;
    removePayment: (index: number) => void;
    validateTotal: (orderTotal: number) => boolean;
    reset: () => void;
}

// State transitions:
// idle → adding (user clicks payment method)
// adding → validating (user enters amount)
// validating → adding (amount valid, can add more)
// validating → complete (total reached)
// any → idle (cancel/reset)
```

**AC:**
- Given cart total is 150,000 IDR
- When user pays 100,000 cash + 50,000 card
- Then both payments recorded and order completes
- And progress bar shows 100%

---

### F2.3: EDC Payment Method

**File:** `src/components/pos/modals/PaymentModal.tsx`

```typescript
// Add EDC to payment methods
<div className="payment-method">
    <input
        type="radio"
        name="paymentMethod"
        id="payEdc"
        checked={paymentMethod === 'edc'}
        onChange={() => setPaymentMethod('edc')}
    />
    <label htmlFor="payEdc" className="payment-method__label">
        <CreditCard size={24} className="payment-method__icon" />
        <span className="payment-method__name">EDC</span>
        {!isOnline && (
            <span className="payment-method__offline">
                <Clock size={12} />Pending validation
            </span>
        )}
    </label>
</div>
```

**AC:**
- Given PaymentModal is open
- When user views payment methods
- Then EDC option visible alongside Cash, Card, QRIS
- And EDC aligns with CloseShiftModal reconciliation fields

---

### F2.4: VoidModal Component

**File:** `src/components/pos/modals/VoidModal.tsx` (NEW)

```typescript
interface VoidModalProps {
    orderId: string;
    orderNumber: string;
    orderTotal: number;
    paymentMethod: TPaymentMethod;
    onVoid: () => void;
    onClose: () => void;
}

// Flow:
// 1. Display order summary (red warning theme)
// 2. Reason selection (dropdown with TVoidReasonCode options)
// 3. Optional notes textarea
// 4. "Void Order" button → triggers PinVerificationModal
// 5. On PIN success → call voidService.voidOrder()
// 6. Success feedback → close modal
```

**AC:**
- Given manager wants to void an order
- When they select reason and enter PIN
- Then order status = 'voided', audit log created
- And reason stored in cancellation_reason field

---

### F2.5: RefundModal Component

**File:** `src/components/pos/modals/RefundModal.tsx` (NEW)

```typescript
interface RefundModalProps {
    orderId: string;
    orderNumber: string;
    orderTotal: number;
    originalPaymentMethod: TPaymentMethod;
    onRefund: () => void;
    onClose: () => void;
}

// Flow:
// 1. Display order summary
// 2. Full/Partial refund toggle
// 3. If partial: amount input (validated <= orderTotal)
// 4. Refund method selection (same or different)
// 5. Reason selection
// 6. PIN verification
// 7. Process refund
```

**AC:**
- Given a paid order needs refund
- When manager processes partial refund of 50,000 IDR
- Then refund_amount = 50000, refund fields populated
- And audit log created with severity='critical'

---

### F2.6: Void Service + Offline Sync

**File:** `src/services/financial/voidService.ts`

**Conflict Resolution Rule (Amelia's spec):**
```typescript
async function voidOrder(input: IVoidInput): Promise<IFinancialOperationResult> {
    // Check for conflicts
    const order = await getOrder(input.orderId);

    if (isOffline) {
        // Queue for sync with conflict check
        await addToSyncQueue({
            entity: 'void_operation',
            action: 'create',
            payload: input,
            conflictRule: {
                check: 'order.updated_at < void.created_at',
                onConflict: 'reject_and_notify'
            }
        });
    } else {
        // Online: apply immediately
        await applyVoid(input);
    }

    // Always create audit log
    await auditService.log({
        action: 'order_voided',
        severity: 'critical',
        entityId: input.orderId,
        details: { reason: input.reason, reasonCode: input.reasonCode }
    });
}
```

**AC:**
- Given void operation created offline
- When sync runs and server order was modified after void creation
- Then void rejected and user notified of conflict

---

### F2.7: Refund Service + Offline Sync

**File:** `src/services/financial/refundService.ts`

Similar pattern to void with:
- Partial refund validation (amount <= original)
- Different method support
- pos_sessions.total_refunds update

**AC:**
- Given refund processed offline
- When sync completes
- Then refund data synced and pos_sessions updated

---

### F2.8: Delivery Type Button

**File:** `src/components/pos/Cart.tsx`

```typescript
// Line 114: Add delivery
{(['dine_in', 'takeaway', 'delivery'] as const).map((type) => (
    <button key={type} type="button"
        className={`order-type-btn ${orderType === type ? 'is-active' : ''}`}
        onClick={() => handleOrderTypeChange(type)}>
        {type === 'dine_in' ? 'Dine In' : type === 'takeaway' ? 'Takeaway' : 'Delivery'}
    </button>
))}
```

**AC:**
- Given Cart renders
- When user views order type buttons
- Then 3 options visible: Dine In, Takeaway, Delivery

---

### F2.9: Shift Indicator Banner

**File:** `src/pages/pos/POSMainPage.tsx`

```typescript
// After CategoryNav, render shift banner
{hasOpenShift && currentSession && (
    <div className="pos-shift-banner">
        <div className="pos-shift-banner__info">
            <Clock size={16} />
            <span>Shift #{currentSession.session_number}</span>
            <span className="pos-shift-banner__user">
                {currentSession.user_name || 'Cashier'}
            </span>
        </div>
        <span className="pos-shift-banner__time">
            Since {formatTime(currentSession.opened_at)}
        </span>
    </div>
)}
```

CSS already exists in `POSMainPage.css` lines 286-327 (verify import).

**AC:**
- Given cashier has open shift
- When viewing POS main screen
- Then shift number, user name, and start time visible in banner

---

### F2.10: Integration Tests

**Files:**
- `src/components/pos/modals/__tests__/PaymentModal.integration.test.tsx`
- `src/components/pos/modals/__tests__/VoidModal.test.tsx`
- `src/components/pos/modals/__tests__/RefundModal.test.tsx`

**Test Scenarios (from Murat's matrix):**

| Scenario | Type | File |
|----------|------|------|
| Split payment - exact amount | Integration | PaymentModal.integration.test.tsx |
| Split payment - overpayment blocked | Unit | PaymentModal.test.tsx |
| Split payment - offline then sync | Integration | paymentSync.integration.test.ts |
| Void - PIN required | Unit | VoidModal.test.tsx |
| Void - reason mandatory | Unit | VoidModal.test.tsx |
| Void - offline conflict | Integration | voidSync.integration.test.ts |
| Refund - partial amount | Unit | RefundModal.test.tsx |
| Refund - exceeds original blocked | Unit | RefundModal.test.tsx |

**AC:**
- Given all integration tests written
- When running test suite
- Then 100% pass rate on financial operations

---

### F2.11: Security Audit

**Checklist:**
- [ ] PIN brute force protection (3 attempts, 30s lockout)
- [ ] Audit trail completeness (all void/refund logged)
- [ ] Permission bypass attempts tested
- [ ] Offline tampering detection
- [ ] Sensitive data not logged (PIN values)

**AC:**
- Given security audit completed
- When reviewing findings
- Then no critical or high vulnerabilities

---

### Phase 2 Validation Gate

- [ ] UX wireframes approved by MamatCEO
- [ ] Split payment E2E working (manual test)
- [ ] Void/Refund 100% test coverage
- [ ] Security audit passed (no critical/high issues)
- [ ] Offline sync tested for all financial operations
- [ ] All existing tests still pass

---

## Phase 3: Polish & Integration

**Duration:** 2 semaines
**Gate:** Production ready
**Depends on:** Phase 2 Validation Gate passed

### F3.1: Print Service Integration

**File:** `src/services/print/printService.ts` (NEW)

```typescript
const PRINT_SERVER_URL = 'http://localhost:3001';

export async function checkPrintServer(): Promise<boolean> {
    try {
        const response = await fetch(`${PRINT_SERVER_URL}/health`, {
            signal: AbortSignal.timeout(2000)
        });
        return response.ok;
    } catch {
        return false;
    }
}

export async function printReceipt(orderData: IOrderPrintData): Promise<boolean> {
    const isAvailable = await checkPrintServer();
    if (!isAvailable) {
        console.warn('Print server not available');
        return false;
    }

    const response = await fetch(`${PRINT_SERVER_URL}/print/receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
    });
    return response.ok;
}
```

**File:** `src/components/pos/modals/PaymentModal.tsx`
- Replace toast placeholder with actual print call
- Show informative toast if print server unavailable

**AC:**
- Given print server running on localhost:3001
- When user clicks Print
- Then receipt sent to printer
- And if server down, user sees "Print server not available" toast

---

### F3.2: Customer Display Broadcast

**File:** `src/hooks/pos/useDisplayBroadcast.ts` (NEW)

```typescript
// Use BroadcastChannel for consistency with KDS (Winston's recommendation)
const DISPLAY_CHANNEL = 'customer-display';

export function useDisplayBroadcast() {
    const channelRef = useRef<BroadcastChannel | null>(null);

    useEffect(() => {
        channelRef.current = new BroadcastChannel(DISPLAY_CHANNEL);
        return () => channelRef.current?.close();
    }, []);

    const broadcastCart = useCallback((items: CartItem[], total: number) => {
        channelRef.current?.postMessage({
            type: 'cart:update',
            payload: { items, total, timestamp: Date.now() }
        });
    }, []);

    return { broadcastCart };
}
```

**File:** `src/components/pos/Cart.tsx`
- Add useDisplayBroadcast hook
- Broadcast on items/total change

**AC:**
- Given Customer Display page open in another tab/device
- When cashier adds item to cart
- Then item appears on display within 500ms

---

### F3.3: Order-Level Notes

**File:** `src/stores/cartStore.ts`

```typescript
// Add to CartState
orderNotes: string;
setOrderNotes: (notes: string) => void;
```

**File:** `src/components/pos/Cart.tsx`
- Add textarea in cart header area (collapsible)
- Save to orders.notes on checkout

**AC:**
- Given cashier building an order
- When they add order-level notes
- Then notes saved to orders.notes field on checkout

---

### F3.4: Performance Testing

**Targets (from Murat):**
- Split payment UI response: < 100ms
- Void/Refund completion: < 500ms
- Sync queue processing: < 30s for 50 transactions
- Customer Display latency: < 500ms

**AC:**
- Given performance tests run
- When measuring response times
- Then all targets met

---

### F3.5: Documentation Update

**Files to update:**
- `CLAUDE.md` - Add new services, hooks, components
- `docs/PAYMENT_SYSTEM.md` (NEW) - Payment architecture guide
- `docs/FINANCIAL_OPERATIONS.md` (NEW) - Void/Refund guide

**AC:**
- Given new developer joins project
- When reading documentation
- Then payment system fully documented

---

### F3.6: Smoke Test Suite

**File:** `src/__tests__/smoke/pos-smoke.test.ts` (NEW)

Critical paths tested:
1. Login → Open Shift → Add Product → Checkout (Cash)
2. Login → Open Shift → Add Product → Checkout (Split)
3. Login → Void Order → Verify Audit
4. Login → Refund Order → Verify Audit
5. Offline → Create Order → Go Online → Verify Sync

**AC:**
- Given smoke tests exist
- When running after deployment
- Then all critical paths verified working

---

### Phase 3 Validation Gate

- [ ] All features working E2E (manual verification)
- [ ] Performance targets met
- [ ] Documentation complete
- [ ] Smoke tests passing
- [ ] No regressions in existing functionality

---

## Summary

### Timeline Estimate

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1 | 2-3 weeks | Migrations, Types, Base Services |
| Phase 2 | 3-4 weeks | Split Pay, Void, Refund, UX |
| Phase 3 | 2 weeks | Print, Display, Polish |
| **Total** | **7-9 weeks** | Production-ready POS revision |

### Files Summary

**New Files (14):**
- `docs/adr/ADR-001-payment-system-refactor.md`
- `docs/wireframes/pos-revision-wireframes.excalidraw`
- `supabase/migrations/*_create_order_payments.sql`
- `supabase/migrations/*_add_refund_fields.sql`
- `src/types/payment.ts`
- `src/stores/paymentStore.ts`
- `src/services/payment/paymentService.ts`
- `src/services/financial/financialOperationService.ts`
- `src/services/financial/voidService.ts`
- `src/services/financial/refundService.ts`
- `src/services/financial/auditService.ts`
- `src/services/print/printService.ts`
- `src/components/pos/modals/VoidModal.tsx`
- `src/components/pos/modals/RefundModal.tsx`

**Modified Files (10):**
- `src/types/offline.ts`
- `src/types/settings.ts`
- `src/components/pos/Cart.tsx`
- `src/components/pos/modals/PaymentModal.tsx`
- `src/pages/pos/POSMainPage.tsx`
- `src/stores/cartStore.ts`
- `src/hooks/offline/useOfflinePayment.ts`
- `src/components/pos/modals/CustomerSearchModal.tsx`
- `src/components/pos/modals/TableSelectionModal.tsx`
- `CLAUDE.md`

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Migration breaks sync | Test in branch before merge |
| Split payment edge cases | Comprehensive test coverage |
| Void/Refund security | Security audit in Phase 2 |
| Performance regression | Performance tests before release |
| Offline conflicts | Conflict resolution rules documented |

---

*Generated by Quick-Spec workflow with Party Mode review on 2026-02-05*
*Reviewed by: Winston (Architect), Amelia (Dev), Sally (UX), Murat (Test), Bob (SM), John (PM)*
