# Story 6.8: B2B Payments Tracking

Status: done

## Story

As a **Manager**,
I want **to track and record B2B payments**,
So that **I can monitor customer receivables and know which invoices are settled**.

## Acceptance Criteria

### AC1: Accounts Receivable Dashboard
**Given** I open the "Aging Report" tab
**When** the report loads
**Then** I see all outstanding B2B orders grouped by aging buckets (0-30, 31-60, 60+ days)
**And** I can see per-customer totals and click to view order details

### AC2: Record Partial/Full Payment
**Given** an unpaid B2B invoice
**When** I click "Pay" on a customer in the FIFO section
**Then** I can enter the amount received and payment method
**And** the system allocates to oldest invoices first (FIFO)

### AC3: Payment History
**Given** the "Received" tab is active
**When** payments are displayed
**Then** I see complete payment history with filters by method and date
**And** I can click to view the associated order

### AC4: FIFO Reconciliation
**Given** a payment covering multiple invoices
**When** I record it via FIFO payment
**Then** the system allocates to oldest invoices first until amount is exhausted
**And** remaining amount is reported back

## Tasks

- [x] **Task 1: AR Service**
  - [x] 1.1: Create `src/services/b2b/arService.ts` with getOutstandingOrders()
  - [x] 1.2: Implement generateAgingReport() with 0-30, 31-60, 60+ day buckets
  - [x] 1.3: Implement allocatePaymentFIFO() pure function
  - [x] 1.4: Implement applyFIFOPayment() database integration
  - [x] 1.5: Implement exportOutstandingCSV() and downloadCSV()

- [x] **Task 2: Aging Report UI**
  - [x] 2.1: Add "Aging Report" tab to B2BPaymentsPage
  - [x] 2.2: Display aging buckets with order tables
  - [x] 2.3: Add per-customer FIFO payment section
  - [x] 2.4: Add FIFO payment modal with amount/method/reference
  - [x] 2.5: Add CSV export button
  - [x] 2.6: Fix French strings → English in B2BPaymentsPage

- [x] **Task 3: Tests**
  - [x] 3.1: 8 tests for allocatePaymentFIFO (oldest first, multi-order, exact match, etc.)
  - [x] 3.2: 4 tests for exportOutstandingCSV (headers, rows, null fields, multiple)
  - [x] 3.3: 1 test for module exports

## Dev Notes

### Architecture
- `arService.ts` provides all AR business logic (pure functions + DB integration)
- `getOutstandingOrders()` fetches from b2b_orders with customer join
- `generateAgingReport()` classifies into 3 buckets based on days_overdue
- `allocatePaymentFIFO()` is a pure function - sorts by order_date ascending, allocates to oldest first
- `applyFIFOPayment()` wraps FIFO allocation + DB writes (order update + payment record + credit balance)
- B2BPaymentsPage enhanced with 3 tabs: Received, Outstanding, Aging Report

### Data Model
- Uses `b2b_orders` table (payment_status: unpaid/partial/paid)
- Uses `b2b_payments` table for payment records
- Uses `customers` table for credit_balance tracking
- days_overdue calculated from delivery_date (due date)

### Business Rules
- FIFO: oldest order_date gets paid first
- Payment status transitions: unpaid → partial → paid
- Credit balance reduced when FIFO payment applied
- CSV export includes all outstanding orders across all buckets

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Completion Notes List

- All 3 tasks completed successfully
- 13 tests passing (arService.test.ts)
- TypeScript compilation passes with no new errors
- French strings in B2BPaymentsPage replaced with English
- No regressions in existing tests

### File List

**Created:**
- `src/services/b2b/arService.ts` (~298 lines) - Accounts Receivable service
- `src/services/b2b/__tests__/arService.test.ts` (~250 lines) - 13 unit tests

**Modified:**
- `src/pages/b2b/B2BPaymentsPage.tsx` - Added aging tab, FIFO modal, CSV export, English strings
- `src/pages/b2b/B2BPaymentsPage.css` - Added aging report + FIFO section styles

## Change Log

- 2026-02-05: Story 6-8 created - B2B Payments Tracking
- 2026-02-06: Story 6-8 completed - AR service, aging report UI, FIFO payment, 13 tests passing
