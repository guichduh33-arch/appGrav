# Financial Operations - Void & Refund Guide

**Date:** 2026-02-05
**Security Audit:** Passed (see `docs/security/PHASE2_SECURITY_AUDIT.md`)

---

## Overview

Void and refund operations are critical financial actions that require:
- PIN verification (manager/admin role)
- Reason code and description
- Audit trail with `severity='critical'`
- Offline sync with conflict resolution

---

## Services

### Void Service

**File:** `src/services/financial/voidService.ts`

```typescript
import { voidOrder, canVoidOrder, canOrderBeVoided } from '@/services/financial/voidService';

// Check permission
const hasPermission = await canVoidOrder(userId);

// Check if order can be voided
const { canVoid, reason, order } = await canOrderBeVoided(orderId);

// Process void
const result = await voidOrder({
  orderId: 'order-123',
  reason: 'Customer changed mind after seeing product',
  reasonCode: 'customer_changed_mind',
  voidedBy: userId,
}, isOffline);
```

### Refund Service

**File:** `src/services/financial/refundService.ts`

```typescript
import { refundOrder, canRefundOrder, getMaxRefundableAmount } from '@/services/financial/refundService';

// Check permission
const hasPermission = await canRefundOrder(userId);

// Get max refundable amount (after partial refunds)
const maxAmount = await getMaxRefundableAmount(orderId);

// Process refund
const result = await refundOrder({
  orderId: 'order-123',
  amount: 50000,
  reason: 'Product quality issue - stale bread',
  reasonCode: 'product_quality',
  method: 'cash',
  refundedBy: userId,
}, isOffline);
```

---

## Reason Codes

### Void Reason Codes

```typescript
type TVoidReasonCode =
  | 'customer_changed_mind'   // Customer Changed Mind
  | 'duplicate_order'         // Duplicate Order
  | 'wrong_items'             // Wrong Items Entered
  | 'system_error'            // System Error
  | 'other';                  // Other
```

### Refund Reason Codes

```typescript
type TRefundReasonCode =
  | 'product_quality'         // Product Quality Issue
  | 'wrong_item_delivered'    // Wrong Item Delivered
  | 'customer_dissatisfied'   // Customer Dissatisfied
  | 'overcharge'              // Overcharge
  | 'other';                  // Other
```

---

## UI Components

### VoidModal

**File:** `src/components/pos/modals/VoidModal.tsx`

Props:
```typescript
interface VoidModalProps {
  orderId: string;
  orderNumber: string;
  orderTotal: number;
  paymentMethod: TPaymentMethod;
  onVoid: () => void;
  onClose: () => void;
}
```

Usage:
```tsx
<VoidModal
  orderId={order.id}
  orderNumber={order.order_number}
  orderTotal={order.total}
  paymentMethod={order.payment_method}
  onVoid={() => handleVoidSuccess()}
  onClose={() => setShowVoidModal(false)}
/>
```

### RefundModal

**File:** `src/components/pos/modals/RefundModal.tsx`

Props:
```typescript
interface RefundModalProps {
  orderId: string;
  orderNumber: string;
  orderTotal: number;
  originalPaymentMethod: TPaymentMethod;
  maxRefundable: number;
  onRefund: () => void;
  onClose: () => void;
}
```

Usage:
```tsx
<RefundModal
  orderId={order.id}
  orderNumber={order.order_number}
  orderTotal={order.total}
  originalPaymentMethod={order.payment_method}
  maxRefundable={order.total - (order.refund_amount || 0)}
  onRefund={() => handleRefundSuccess()}
  onClose={() => setShowRefundModal(false)}
/>
```

---

## PIN Verification

Both void and refund require PIN verification through `PinVerificationModal`.

```tsx
<PinVerificationModal
  title="Manager Verification"
  message="Enter manager PIN to void this order"
  allowedRoles={['manager', 'admin']}
  onVerify={(verified, user) => {
    if (verified) {
      // Proceed with operation
      processVoid(user.id);
    }
  }}
  onClose={() => setShowPinModal(false)}
/>
```

---

## Audit Trail

All financial operations are logged with `severity='critical'`.

**File:** `src/services/financial/auditService.ts`

```typescript
// Automatically called by void/refund services
await logVoidOperation(orderId, userId, reason, reasonCode, isOffline);
await logRefundOperation(orderId, userId, amount, reason, reasonCode, method, isOffline);
```

### Audit Log Structure

```typescript
interface IAuditLogEntry {
  id: string;
  action: 'order_voided' | 'order_refunded';
  entity_type: 'order';
  entity_id: string;
  user_id: string;
  severity: 'critical';
  details: {
    reason: string;
    reasonCode: string;
    voidedAt?: string;
    amount?: number;
    method?: string;
    refundedAt?: string;
  };
  created_at: string;
}
```

---

## Permissions

| Operation | Permission Code |
|-----------|-----------------|
| Void | `sales.void` |
| Refund | `sales.refund` |

```typescript
// Check permission via RPC
const { data: hasPermission } = await supabase.rpc('user_has_permission', {
  p_user_id: userId,
  p_permission_code: 'sales.void',
});
```

---

## Offline Sync

### Conflict Resolution

Rule: `reject_if_server_newer`

If the order was modified on the server after the local void/refund operation was created, the sync is rejected to prevent data inconsistency.

```typescript
// Sync conflict detection
if (serverOrder.updated_at > localOperation.createdAt) {
  return { success: false, error: 'Conflict: Order modified on server' };
}
```

### Queue Structure

```typescript
interface IOfflineVoidOperation {
  id: string;              // LOCAL-VOID-{uuid}
  orderId: string;
  reason: string;
  reasonCode: TVoidReasonCode;
  voidedBy: string;
  createdAt: string;
  synced: boolean;
}

interface IOfflineRefundOperation {
  id: string;              // LOCAL-REFUND-{uuid}
  orderId: string;
  amount: number;
  reason: string;
  reasonCode: TRefundReasonCode;
  method: TPaymentMethod;
  refundedBy: string;
  createdAt: string;
  synced: boolean;
}
```

---

## Database Fields

### Orders Table - Void

| Field | Type | Description |
|-------|------|-------------|
| status | order_status | Set to 'voided' |
| cancellation_reason | TEXT | Void reason text |
| voided_at | TIMESTAMPTZ | Void timestamp |
| voided_by | UUID | User who voided |

### Orders Table - Refund

| Field | Type | Description |
|-------|------|-------------|
| refund_amount | DECIMAL(12,2) | Total refunded |
| refund_reason | TEXT | Refund reason text |
| refund_method | payment_method | Refund payment method |
| refunded_at | TIMESTAMPTZ | Refund timestamp |
| refunded_by | UUID | User who refunded |

---

## Testing

```bash
# Run void/refund tests
npx vitest run src/services/financial

# Expected: 49+ tests passing
# - voidService: 14 tests
# - refundService: 14 tests
# - financialOperationService: 21 tests
```

---

## Security Considerations

1. **PIN Brute Force Protection**: 3 attempts per 15 minutes
2. **Audit Immutability**: RLS prevents modification of audit_logs
3. **Role Validation**: Server-side permission check before operation
4. **Offline Tampering**: Conflict detection prevents stale writes
5. **Sensitive Data**: PIN values never logged

---

## Related Documentation

- [Payment System](./PAYMENT_SYSTEM.md)
- [Security Audit](./security/PHASE2_SECURITY_AUDIT.md)
- [ADR-001: Payment System Refactor](./adr/ADR-001-payment-system-refactor.md)
