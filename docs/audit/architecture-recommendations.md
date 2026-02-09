# AppGrav Architecture Recommendations

**Date**: February 9, 2026
**Based on**: Codebase audit + ERP/POS market analysis

---

## 1. Offline Storage: Evaluate SQLite via OPFS

### Current: IndexedDB (Dexie)
- Good for structured key-value data
- Limited query capabilities vs SQL
- Browser storage quotas apply (~50% of free disk space)
- No built-in backup/export mechanism

### Recommended: Evaluate wa-sqlite or sql.js with OPFS
```
Browser → wa-sqlite (WebAssembly) → OPFS (Origin Private File System)
                                         ↓
                               Persistent SQLite file on disk
```

**Benefits**:
- Full SQL query support (complex joins, aggregations)
- Larger storage capacity via OPFS
- Data export is a single file copy
- Better performance for complex queries
- Matches industry pattern (Toast, Revel, Loyverse all use SQLite locally)

**Migration path**: Can run alongside existing Dexie, migrate table by table.

**Risk**: OPFS requires modern browsers (Chrome 86+, Safari 15.2+). Fine for controlled POS environments.

---

## 2. Sync Architecture Improvements

### 2.1 Priority Queue

Replace FIFO sync with priority-based processing:

```typescript
enum SyncPriority {
  CRITICAL = 0,  // Voids, refunds (financial operations)
  HIGH = 1,      // Orders, payments
  NORMAL = 2,    // Customer updates, stock movements
  LOW = 3        // Settings, preferences, analytics
}
```

Add `priority` column to `offlineSyncQueue` table in Dexie.

### 2.2 Idempotency Keys

Follow Square's pattern - every write operation includes a client-generated UUID:

```typescript
// In sync queue item
{
  idempotency_key: crypto.randomUUID(),
  type: 'order',
  data: { ... },
  created_at: Date.now()
}

// Server-side: check idempotency_key before processing
// If already processed, return cached result
```

**Database change**:
```sql
CREATE TABLE idempotency_keys (
  key VARCHAR PRIMARY KEY,
  entity_type VARCHAR NOT NULL,
  entity_id UUID,
  response JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '24 hours'
);
```

### 2.3 Delta Sync

Current: Full cache refresh on reconnect (all products, categories)
Recommended: Delta sync using `updated_at` timestamps

```typescript
// Request only changes since last sync
const lastSync = await getLastSyncTimestamp('products');
const { data } = await supabase
  .from('products')
  .select('*')
  .gt('updated_at', lastSync);
```

### 2.4 Backoff Reset

Current: Backoff stays at 40s even after successful syncs
Fix: Reset backoff to 5s after any successful sync operation

---

## 3. Order Model Enhancement

### Current Model
```
orders -> order_items (flat)
       -> payment fields on order
```

### Recommended: Add Checks Layer
```
orders -> order_checks -> order_items
                       -> check_payments
```

This enables:
- Per-guest split bills (each guest = 1 check)
- Partial payments per check
- Course-based ordering (fire courses per check)
- Tax calculation per check

**Implementation**: See `missing-modules-specs.md` Section 5.

---

## 4. Error Handling Architecture

### 4.1 Error Hierarchy

```typescript
// src/types/errors.ts
abstract class AppError extends Error {
  abstract code: string;
  abstract severity: 'info' | 'warning' | 'error' | 'critical';
  context?: Record<string, unknown>;
}

class ValidationError extends AppError { code = 'VALIDATION'; severity = 'warning'; }
class NetworkError extends AppError { code = 'NETWORK'; severity = 'error'; }
class AuthError extends AppError { code = 'AUTH'; severity = 'error'; }
class SyncConflictError extends AppError { code = 'SYNC_CONFLICT'; severity = 'warning'; }
class ServerError extends AppError { code = 'SERVER'; severity = 'critical'; }
```

### 4.2 Error Recovery Patterns

```
User Action -> Try Operation
                  |
            Success? -> Done
                  |
            Error Type?
              |         |          |
         Network    Validation   Server
              |         |          |
         Show retry  Show form   Log to Sentry
         button      errors      Show fallback
              |                        |
         Auto-retry              Queue for sync
         (3 attempts)            (if offline-safe)
```

### 4.3 Error Boundary Strategy

Replace single app-level ErrorBoundary with per-route boundaries:

```tsx
// Each route group gets its own error boundary
<Route path="/pos">
  <ErrorBoundary fallback={<POSErrorFallback />}>
    <POSPage />
  </ErrorBoundary>
</Route>

<Route path="/inventory/*">
  <ErrorBoundary fallback={<InventoryErrorFallback />}>
    <InventoryRoutes />
  </ErrorBoundary>
</Route>
```

---

## 5. Security Enhancements

### 5.1 Session Token Signing

Current: Plain UUID session tokens
Recommended: HMAC-signed tokens

```typescript
// Generate
const token = crypto.randomUUID();
const signature = hmacSHA256(token, SERVER_SECRET);
const signedToken = `${token}.${signature}`;

// Verify
const [token, sig] = signedToken.split('.');
const expected = hmacSHA256(token, SERVER_SECRET);
if (sig !== expected) throw new AuthError('Invalid token');
```

### 5.2 IndexedDB Encryption

For sensitive offline data (PINs, customer info):

```typescript
// Use Web Crypto API
const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
);

// Encrypt before storing in IndexedDB
const encrypted = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  key,
  data
);
```

### 5.3 Rate Limiting at Edge

Add rate limiting to edge functions (not just PIN auth):

```typescript
// In _shared/rateLimit.ts
const RATE_LIMITS = {
  'auth-verify-pin': { window: 900, max: 10 },  // 10/15min
  'create-order': { window: 60, max: 100 },       // 100/min
  'claude-proxy': { window: 3600, max: 50 },      // 50/hour
};
```

---

## 6. Performance Architecture

### 6.1 Bundle Optimization

Target: <500KB initial bundle (currently unmeasured)

```
Priority loading:
1. App shell (React, router, auth)     ~150KB
2. POS page (critical path)            ~200KB
3. Everything else (lazy loaded)       On demand
```

Add to `vite.config.ts`:
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom'],
        'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-tabs'],
        'vendor-charts': ['recharts'],
        'vendor-pdf': ['jspdf'],
      }
    }
  }
}
```

### 6.2 React Query Optimization

Per-resource stale times:

```typescript
const STALE_TIMES = {
  products: 5 * 60 * 1000,    // 5 min (rarely changes during shift)
  orders: 30 * 1000,           // 30 sec (changes frequently)
  settings: 60 * 60 * 1000,   // 1 hour (rarely changes)
  kdsQueue: 5 * 1000,          // 5 sec (real-time critical)
};
```

### 6.3 Sync Engine Parallelization

Current: Sequential processing (100ms delay per item)
At 200 items: 20 seconds sync time

Recommended: Parallel batches

```typescript
// Process in batches of 10
const BATCH_SIZE = 10;
const batches = chunk(pendingItems, BATCH_SIZE);
for (const batch of batches) {
  await Promise.allSettled(
    batch.map(item => processItem(item))
  );
}
```

---

## 7. Testing Architecture

### 7.1 Test Pyramid

```
        /\
       /E2E\        5 critical workflows (Playwright)
      /------\
     /Integration\   20 cross-module tests
    /------------\
   / Component    \  40+ component tests (Testing Library)
  /----------------\
 / Unit (Services)  \ 80+ existing + expand
/--------------------\
```

### 7.2 E2E Critical Paths

1. **POS Checkout**: Login -> Add items -> Apply discount -> Pay cash -> Print receipt
2. **Offline Order**: Go offline -> Add items -> Pay -> Go online -> Verify synced
3. **Void Order**: Create order -> Manager PIN -> Void -> Verify audit log
4. **Stock Adjustment**: Adjust stock -> Verify movement created -> Check alerts
5. **Shift Management**: Open shift -> Process orders -> Close shift -> Verify totals

### 7.3 Test Utilities

Create shared test setup:

```typescript
// src/test/setup.ts
export function createMockSupabase() { ... }
export function createMockDexie() { ... }
export function createTestOrder() { ... }
export function createTestProduct() { ... }
export function renderWithProviders(ui, options) { ... }
```

---

## 8. Monitoring & Observability

### 8.1 Error Tracking (Sentry)
```typescript
// src/lib/sentry.ts
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.01,
});
```

### 8.2 Performance Monitoring
- Web Vitals (LCP, FID, CLS) via `web-vitals` library
- Custom metrics: sync duration, offline period length, query times
- Dashboard: Grafana or Sentry Performance

### 8.3 Business Metrics
- Orders per hour (real-time)
- Sync failure rate
- Offline duration per shift
- Average checkout time

---

## 9. API Design (Future Public API)

If/when exposing a public API:

```
GET    /api/v1/products                    # List products
GET    /api/v1/products/:id                # Get product
POST   /api/v1/orders                      # Create order
GET    /api/v1/orders/:id                  # Get order
GET    /api/v1/inventory/:product_id       # Stock level
POST   /api/v1/inventory/adjustments       # Adjust stock
GET    /api/v1/reports/daily-summary       # Daily summary

Headers:
  Authorization: Bearer <api_key>
  X-Idempotency-Key: <uuid>
  X-Location-Id: <uuid>  (for multi-location)
```

Supabase already provides auto-generated REST/GraphQL APIs, but a purpose-built API adds:
- Stable contracts (not tied to schema changes)
- Rate limiting per key
- Webhook subscriptions
- API versioning

---

## 10. Deployment Architecture (Future)

### Current: Single Supabase project
### Recommended for scale:

```
Production:
  Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
  Vercel/Cloudflare Pages (Frontend hosting)
  Sentry (Error tracking)
  Cloudflare (CDN + DDoS protection)

Staging:
  Supabase Branch (for testing migrations)
  Preview deployments per PR

CI/CD:
  GitHub Actions:
    - Type check (tsc)
    - Lint (eslint)
    - Unit tests (vitest)
    - E2E tests (playwright)
    - Bundle size check
    - Deploy to staging (on PR)
    - Deploy to production (on merge to main)
```
