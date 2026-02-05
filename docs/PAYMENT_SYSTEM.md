# Payment System Architecture

**Date:** 2026-02-05
**ADR:** See `docs/adr/ADR-001-payment-system-refactor.md`

---

## Overview

AppGrav's payment system supports multiple payment methods, split payments, and offline operation. This document describes the architecture and usage patterns.

---

## Payment Methods

```typescript
type TPaymentMethod = 'cash' | 'card' | 'qris' | 'edc' | 'transfer';
```

| Method | Description | Offline Support |
|--------|-------------|-----------------|
| cash | Physical cash with change calculation | Full |
| card | Credit/debit card via reader | Pending validation |
| qris | QR code payment (Indonesia) | Pending validation |
| edc | EDC terminal payment | Pending validation |
| transfer | Bank transfer | Pending validation |

---

## Services

### PaymentService

**File:** `src/services/payment/paymentService.ts`

```typescript
import { paymentService } from '@/services/payment/paymentService';

// Process single payment
const result = await paymentService.processPayment(orderId, {
  method: 'cash',
  amount: 150000,
  cashReceived: 200000,
});

// Process split payment
const result = await paymentService.processSplitPayment(orderId, [
  { method: 'cash', amount: 100000, cashReceived: 100000 },
  { method: 'card', amount: 50000, reference: 'TXN-123' },
]);
```

### PaymentStore (Zustand)

**File:** `src/stores/paymentStore.ts`

Split payment state machine:

```
idle → adding → validating → complete
  ↑         ↓
  └─ cancel ←┘
```

State transitions:
- `idle`: No payment in progress
- `adding`: User selecting payment method
- `validating`: Validating amount input
- `complete`: Total reached, ready to finalize

---

## Print Service Integration

**File:** `src/services/print/printService.ts`

The print service connects to the local print server running on `localhost:3001`.

### Functions

| Function | Description |
|----------|-------------|
| `checkPrintServer()` | Health check (2s timeout) |
| `printReceipt(orderData)` | Print customer receipt |
| `printKitchenTicket(data)` | Print kitchen ticket |
| `printBaristaTicket(data)` | Print barista ticket |
| `openCashDrawer()` | Open cash drawer |

### Usage

```typescript
import { printReceipt, checkPrintServer } from '@/services/print/printService';

// Check if server is available
const isAvailable = await checkPrintServer();

// Print receipt
const result = await printReceipt({
  orderNumber: 'ORD-001',
  orderType: 'dine_in',
  items: [...],
  total: 150000,
  payments: [...],
  cashierName: 'Jane',
  createdAt: new Date().toISOString(),
});

if (!result.success) {
  toast.error(result.error || 'Print failed');
}
```

---

## Customer Display Broadcast

**File:** `src/hooks/pos/useDisplayBroadcast.ts`

Uses BroadcastChannel for cross-tab communication with the customer display.

### POS Side (Sender)

```typescript
import { useDisplayBroadcast } from '@/hooks/pos';

function POSComponent() {
  const { broadcastCart, broadcastOrderComplete, broadcastClear } = useDisplayBroadcast();

  // Broadcast cart updates
  useEffect(() => {
    broadcastCart(items, subtotal, discount, total);
  }, [items, subtotal, discount, total]);

  // On payment complete
  broadcastOrderComplete(orderNumber, total, change);

  // Clear display for new order
  broadcastClear();
}
```

### Customer Display (Receiver)

```typescript
import { useDisplayBroadcastListener, TDisplayMessage } from '@/hooks/pos';

function CustomerDisplay() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  useDisplayBroadcastListener((message: TDisplayMessage) => {
    switch (message.type) {
      case 'cart:update':
        setItems(message.payload.items);
        setTotal(message.payload.total);
        break;
      case 'order:complete':
        showSuccessScreen(message.payload);
        break;
      case 'display:clear':
        resetDisplay();
        break;
    }
  });
}
```

### Message Types

| Type | Payload | Description |
|------|---------|-------------|
| `cart:update` | items, subtotal, discount, total | Cart changed |
| `order:complete` | orderNumber, total, change | Payment successful |
| `display:clear` | timestamp | Reset display |
| `display:welcome` | message | Show welcome message |

---

## Order-Level Notes

Cart store supports order-level notes for special instructions.

### Usage

```typescript
const { orderNotes, setOrderNotes } = useCartStore();

// Set notes
setOrderNotes('Please deliver to back entrance');

// Notes are cleared when cart is cleared
clearCart(); // orderNotes = ''
```

Notes are saved to `orders.notes` field on checkout.

---

## Offline Support

### Payment Processing

When offline:
1. Payment is saved to IndexedDB
2. Marked with `is_offline: true`
3. Added to sync queue
4. Synced when connection restored

### Sync Queue

Payment operations are queued with conflict resolution:
- Rule: `reject_if_server_newer`
- If server order modified after local operation, sync rejected
- User notified to resolve conflict

---

## Database Tables

### order_payments

```sql
CREATE TABLE order_payments (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
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

---

## Related Documentation

- [Financial Operations (Void/Refund)](./FINANCIAL_OPERATIONS.md)
- [ADR-001: Payment System Refactor](./adr/ADR-001-payment-system-refactor.md)
- [Offline Architecture](../CLAUDE.md#offline-first-architecture)
