# AppGrav Improvement Roadmap

**Date**: February 9, 2026
**Timeframe**: 6 months (3 phases)

---

## Phase 1: Stabilization & Code Quality (Weeks 1-4)

### Sprint 1 (Weeks 1-2): Code Organization

#### 1.1 Split useProducts.ts (3,050 lines -> 6 files)
- `useProductCatalog.ts` - Product listing and filtering
- `useProductSearch.ts` - Search with debounce
- `usePOSCategories.ts` - Category fetching for POS
- `usePOSCombos.ts` - Combo deals for POS
- `useProductMockData.ts` - Mock/demo data (dev only)
- `useProductOfflineSync.ts` - Offline product sync logic

#### 1.2 Split settingsStore.ts (21.8 KB -> 5 stores)
- `companyStore.ts` - Company info, logo, NPWP
- `taxStore.ts` - Tax rates, tax-inclusive settings
- `paymentMethodStore.ts` - Payment method configuration
- `printerStore.ts` - Printer configuration
- `businessHoursStore.ts` - Business hours

#### 1.3 Consolidate Sync Engines
- Audit `syncEngine.ts` vs `syncEngineV2.ts`
- Determine which is active (check imports)
- Remove unused version
- Document sync architecture

#### 1.4 Type Regeneration
- Run `supabase gen types typescript`
- Verify `user_sessions` table included
- Remove manual type overrides that match generated types
- Add CI step to check type freshness

### Sprint 2 (Weeks 3-4): Error Handling & Testing

#### 2.1 Structured Error System
```typescript
// src/types/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public severity: 'info' | 'warning' | 'error' | 'critical',
    public context?: Record<string, unknown>
  ) { super(message); }
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'SYNC_CONFLICT'
  | 'SERVER_ERROR'
  | 'OFFLINE_ERROR';
```

#### 2.2 Fix ErrorBoundary
- Replace French text with English
- Add error categorization
- Add retry button for recoverable errors
- Add "Report Issue" link

#### 2.3 Critical Path Tests
- POS checkout workflow (add -> modify -> pay)
- Offline order creation -> sync -> verify
- Split payment processing
- Void/refund with PIN verification

---

## Phase 2: Feature Gaps & Integrations (Weeks 5-12)

### Sprint 3 (Weeks 5-6): Offline Improvements

#### 3.1 Conflict Resolution UI
- Visual diff of local vs server versions
- "Keep mine" / "Keep server" / "Merge" options
- Conflict history log
- Notification when conflicts detected

#### 3.2 Idempotency Keys
- Add `idempotency_key` (UUID) to all create operations
- Server-side deduplication check
- Retry-safe sync queue processing

#### 3.3 Sync Priority Queue
- Priority levels: critical (voids/refunds) > high (orders) > normal (products)
- Critical operations synced first
- Progress indicator by priority

### Sprint 4 (Weeks 7-8): Payment Integration

#### 4.1 QRIS Integration (via Midtrans/Xendit)
- QR code generation for QRIS payments
- Webhook handler for payment notifications
- Automatic order status update on payment
- Reconciliation with daily settlement

#### 4.2 Payment Reconciliation
- `payment_reconciliation` table
- Match payments to orders
- Daily reconciliation report
- Discrepancy alerts

### Sprint 5 (Weeks 9-10): KDS Enhancement

#### 5.1 Ticket Aging
- Color transitions: green (0-5min) -> yellow (5-10min) -> red (10min+)
- Configurable thresholds per station
- Audio alerts for overdue tickets

#### 5.2 Speed Metrics
- Average preparation time per station
- Per-item prep time tracking
- Speed of service dashboard
- Historical trend charts

#### 5.3 All-Day Count View
- Aggregate pending items across all tickets
- Live counter per product
- Helps kitchen prep common items in advance

### Sprint 6 (Weeks 11-12): Email & Notifications

#### 6.1 Complete Email Service
- Implement `send-email` edge function with SMTP
- Order confirmation emails
- Daily sales summary to owner
- Low stock alerts

#### 6.2 Notification System
- In-app notifications (bell icon)
- Email notifications (configurable)
- Push notifications via Capacitor
- Notification preferences per user

---

## Phase 3: Scale & Compliance (Weeks 13-24)

### Sprint 7-8 (Weeks 13-16): Multi-Location Foundation

#### 7.1 Location-Scoped Data
- Add `location_id` to orders, stock, sessions
- Centralized product catalog (push to locations)
- Per-location pricing and tax settings
- Cross-location stock transfers

#### 7.2 Consolidated Reporting
- Multi-location dashboard
- Location comparison reports
- Centralized inventory overview
- Staff performance across locations

### Sprint 9-10 (Weeks 17-20): Compliance

#### 9.1 e-Faktur Integration
- Generate e-Faktur XML format
- NPWP validation
- Tax invoice numbering
- DJP (tax authority) submission readiness

#### 9.2 Data Retention
- Configurable retention policies
- Automated archival of old orders
- Audit log retention (minimum 5 years)
- Data export for tax compliance

### Sprint 11-12 (Weeks 21-24): Observability & Performance

#### 11.1 Error Tracking
- Sentry integration for error monitoring
- Source maps for production debugging
- User session replay for bug reports
- Performance monitoring (Web Vitals)

#### 11.2 Bundle Optimization
- Analyze bundle with `rollup-plugin-visualizer`
- Lazy load heavy dependencies (recharts, jspdf)
- Optimize image assets
- Target: <500KB initial bundle

#### 11.3 E2E Testing
- Playwright test suite
- Critical path coverage (POS, inventory, reports)
- Visual regression testing
- CI/CD pipeline integration

---

## Success Metrics

### Phase 1 Completion Criteria
- [ ] No file exceeds 300 lines
- [ ] Single sync engine (no duplication)
- [ ] Generated types match schema
- [ ] ErrorBoundary in English with retry
- [ ] 10+ new test files for critical paths

### Phase 2 Completion Criteria
- [ ] Conflict resolution UI functional
- [ ] QRIS payment flow working
- [ ] KDS shows ticket aging colors
- [ ] Email notifications sending
- [ ] Idempotency keys on all writes

### Phase 3 Completion Criteria
- [ ] Multi-location data model deployed
- [ ] e-Faktur XML generation working
- [ ] Sentry capturing production errors
- [ ] Initial bundle < 500KB
- [ ] E2E tests in CI pipeline

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Sync engine consolidation breaks existing sync | Medium | High | Feature flag, gradual rollout |
| QRIS integration delays (Midtrans API) | Medium | Medium | Start with manual QRIS entry |
| useProducts split breaks POS | Low | Critical | Comprehensive test coverage first |
| Multi-location scope creep | High | Medium | Strict MVP per sprint |
| Type regeneration breaks builds | Low | Medium | CI type-check gate |
