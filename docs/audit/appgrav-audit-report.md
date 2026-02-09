# AppGrav ERP/POS - Comprehensive Audit Report

**Date**: February 9, 2026
**Scope**: Full codebase, database schema, edge functions, services, and architecture review

---

## Executive Summary

AppGrav is a sophisticated offline-first React + TypeScript + Supabase ERP/POS system for "The Breakery" bakery in Lombok, Indonesia. The codebase demonstrates **strong architectural patterns** with well-implemented offline synchronization, modular state management, and extensive business logic.

**Overall Assessment**: 4/5 stars - Production-ready with targeted improvements needed.

### Key Metrics

| Metric | Count |
|--------|-------|
| Components | 74 primary, 109 total |
| Pages | 103 route-based |
| Custom Hooks | 94 across 14 modules |
| Services | 81+ across 14 modules |
| Zustand Stores | 12 |
| SQL Migrations | 114 |
| Edge Functions | 14 |
| Test Files | 80+ with ~1,371 tests |
| Total LoC | ~90,000 TypeScript/React |

---

## 1. Architecture Strengths

### 1.1 Offline-First Design (9/10)
- 20+ offline services with IndexedDB caching
- PIN-based offline auth with bcrypt and rate limiting
- Automatic sync engine with exponential backoff (5s -> 10s -> 20s -> 40s)
- User-visible sync indicators (NetworkIndicator, SyncIndicator, OfflineSessionIndicator)
- 24-hour credential TTL for extended offline operation

### 1.2 Security Model (8/10)
- PostgreSQL Row-Level Security on all tables (superior to ORM-only enforcement)
- `user_has_permission()` database function in RLS policies
- Role-based + granular permission codes (70+ permission codes)
- PIN hashing with bcrypt, account locking after 5 failed attempts
- Comprehensive audit logging for critical operations
- CORS origin validation on edge functions

### 1.3 Separation of Concerns (9/10)
- Services organized by domain: sync, payment, inventory, financial, offline
- Clear hook -> service -> store data flow
- Feature-based component organization (auth, inventory, pos, reports)
- Dedicated offline/sync modules

### 1.4 Business Logic Coverage (8/10)
- Complex promotion engine with time-based rules
- Split payment handling with IDR rounding
- Customer category pricing (retail, wholesale, discount, custom)
- B2B wholesale with credit management
- Recipe-based inventory with production tracking

---

## 2. Architecture Weaknesses

### 2.1 Critical Issues

#### File Size Violations
| File | Size | Max Allowed | Action |
|------|------|-------------|--------|
| `useProducts.ts` | 3,050 lines | 300 lines | Split into 5-6 focused hooks |
| `useSettings.ts` | 31.6 KB | 300 lines | Split into domain-specific hooks |
| `useShift.ts` | 16 KB | 300 lines | Extract helper functions |
| `settingsStore.ts` | 21.8 KB | 300 lines | Split into domain stores |

#### Sync Engine Duplication
- Both `syncEngine.ts` and `syncEngineV2.ts` exist
- Unclear which is active; potential for conflicting sync logic
- **Action**: Consolidate into single engine, remove dead code

#### Type Generation Out of Sync
- `database.generated.ts` does not include latest migration columns
- `user_sessions` table missing from generated types
- Manual type definitions risk drift from actual schema
- **Action**: Run `supabase gen types typescript` after each migration

### 2.2 High-Priority Issues

#### No Conflict Resolution UI
- Offline sync detects conflicts via `updated_at` comparison
- Users notified of "conflict" but have no way to resolve
- **Action**: Add conflict visualization + resolution wizard

#### Incomplete Error Handling
- No structured error types (all errors treated equally)
- Silent failures in some service code paths
- ErrorBoundary still contains French text
- No centralized error tracking (Sentry, etc.)

#### Missing Idempotency Keys
- Sync retries can create duplicate orders
- No client-generated idempotency keys on write operations
- **Action**: Add idempotency keys following Square's pattern

---

## 3. Edge Functions Analysis

### 3.1 Inventory (14 functions)

| Function | Status | Notes |
|----------|--------|-------|
| auth-verify-pin | Production | Bcrypt PIN verification, session creation |
| auth-change-pin | Production | Self-service + admin override |
| auth-get-session | Production | 4-hour session timeout |
| auth-logout | Production | Idempotent, audit logged |
| auth-user-management | Production | Full CRUD with role assignment |
| calculate-daily-report | Production | Daily sales aggregation |
| claude-proxy | Production | Anthropic API proxy (server-side key) |
| generate-invoice | Production | B2B HTML invoice generation |
| send-to-printer | Production | ESC/POS formatting, fallback mode |
| send-test-email | STUB | No actual email sending |
| intersection_stock_movements | Partial | No database transactions |
| purchase_order_module | Partial | Missing stock receipt integration |

### 3.2 Missing Edge Functions
1. **Transactional Email Service** - Order confirmations, password resets
2. **Payment Webhook Handler** - QRIS/Midtrans notifications
3. **Receipt Reprinting** - Reprint past orders
4. **Data Export/Backup** - Compliance exports
5. **Multi-outlet Sync** - Branch-to-branch transfers

---

## 4. Database Schema Analysis

### 4.1 Schema Maturity: High (114 migrations)

**Well-Designed Areas**:
- Core POS entities (orders, order_items, products, categories)
- Customer loyalty system with tiers
- B2B module with credit management
- Comprehensive audit logging
- Permission system with roles and granular codes

### 4.2 Schema Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| No `checks` entity for split bills | Can't do per-guest billing | Medium |
| No `fulfillments` entity | Delivery workflow missing | Low |
| `user_sessions` not in generated types | Type safety gap | High |
| No temporal tables for audit history | Compliance risk | Medium |
| Missing indexes on common queries | Performance | Medium |
| No soft deletes pattern | Data recovery | Low |

---

## 5. Services Architecture

### 5.1 Service Quality Metrics

| Aspect | Score | Notes |
|--------|-------|-------|
| Separation of Concerns | 9/10 | Well-organized by domain |
| Type Safety | 8/10 | Good coverage, some `any` types |
| Test Coverage | 6/10 | 80 test files, but gaps in components/pages |
| Error Handling | 7/10 | Try-catch present, some silent failures |
| Offline-First | 9/10 | Comprehensive caching & queue |
| Performance | 7/10 | Good caching, some N+1 queries |

### 5.2 Service Module Sizes

| Module | Files | Purpose |
|--------|-------|---------|
| sync/ | 22 | Synchronization engine + processors |
| offline/ | 17 | IndexedDB caching + offline operations |
| financial/ | 5 | Void, refund, audit |
| b2b/ | 3 | Wholesale + credit |
| lan/ | 3 | Multi-terminal LAN communication |
| kds/ | 2 | Kitchen Display System |
| payment/ | 1 | Unified payment processing |
| print/ | 1 | Print server integration |

---

## 6. Test Coverage Analysis

### 6.1 Well-Tested Areas (>80% coverage)
- Offline services (cache, auth, persistence)
- Sync services (queue, order sync, product sync)
- Financial operations (void, refund, audit)
- Payment processing
- LAN protocol

### 6.2 Under-Tested Areas (<50% coverage)
- Component UI testing (only 10/74 components tested)
- Page tests (only 2/103 pages tested)
- Integration tests (no cross-module tests)
- E2E scenarios (no Playwright/Cypress tests)
- Error scenarios (network timeout, API failures)
- Accessibility (no a11y tests)

### 6.3 Known Flaky Test
- `StockAlerts.test.tsx > StaleDataWarning > renders nothing when data is fresh`
- Timing issue in full suite, passes when run alone

---

## 7. Performance Analysis

### 7.1 Current Optimizations
- Code splitting with React.lazy() for all 103 pages
- PWA service worker for asset caching
- IndexedDB caching for products/orders/settings
- esbuild minification with tree-shaking

### 7.2 Performance Issues
1. **N+1 queries in daily report** - Fetches orders then items then products
2. **Sync engine blocking** - Sequential processing with 100ms delay per item
3. **No cache coordination** - Products cache (1h) vs promotions cache (daily) mismatch
4. **No bundle analysis** - Large dependencies (recharts, jspdf) not profiled
5. **No render profiling** - No React DevTools profiler integration

---

## 8. Security Assessment

### 8.1 Strengths
- PostgreSQL RLS on all tables
- PIN hashing with bcrypt
- Account locking after 5 failed attempts
- CORS origin validation
- Audit logging for sensitive operations
- Manager PIN required for voids/refunds

### 8.2 Gaps
- No 2FA/MFA (PIN only, no OTP)
- Session tokens are plain UUIDs (not signed JWTs)
- No edge-level rate limiting
- No key rotation strategy
- IndexedDB data unencrypted at rest
- No CSRF token validation
- Print server auth relies on LAN isolation

---

## 9. Recommendations Summary

### Priority 1: Critical (Do Now)
1. Split `useProducts.ts` into 5-6 focused hooks
2. Consolidate sync engines (remove V1 or V2)
3. Regenerate `database.generated.ts` from schema
4. Add conflict resolution UI for offline sync
5. Fix ErrorBoundary French text

### Priority 2: Important (Next Sprint)
6. Split `settingsStore` into domain stores
7. Add idempotency keys to write operations
8. Implement structured error types
9. Add Sentry or similar error tracking
10. Complete `send-test-email` edge function

### Priority 3: Enhancement (Backlog)
11. Add QRIS payment integration
12. Enhance KDS with ticket aging and speed metrics
13. Add e2e tests with Playwright
14. Implement multi-location support
15. Add bundle analysis and performance monitoring
