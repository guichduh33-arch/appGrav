# AppGrav -- Security, Robustness & Code Quality Audit

**Date**: 2026-02-10
**Auditor**: Agent 5 (Claude Opus 4.6)
**Scope**: Full codebase security, error handling, test coverage, logging, and code quality
**Project**: AppGrav ERP/POS -- The Breakery

---

## Executive Summary

The AppGrav codebase demonstrates a generally well-architected application with good offline-first patterns, proper bcrypt PIN hashing, and functional error boundaries. However, **several critical and major security issues** were identified, most notably: **secrets committed to git**, **plaintext PIN storage in production**, **CORS wildcard on print server**, and **sensitive debug logging in the Supabase client**. Additionally, significant test coverage gaps exist for critical business logic (cart calculations, checkout flow, promotions), and many files far exceed the 300-line convention.

### Risk Summary

| Severity | Count |
|----------|-------|
| Critical | 5 |
| Major    | 14 |
| Minor    | 12 |

---

## 1. SECURITY

### SEC-01: .env.docker with Production Secrets Committed to Git

- **Criticality**: CRITICAL
- **Category**: Security
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\.env.docker`
- **Description**: The file `.env.docker` is tracked by git (confirmed via `git ls-files --error-unmatch .env.docker`). It contains:
  - `SUPABASE_SERVICE_KEY` (service_role JWT with full database access, bypasses RLS)
  - `VITE_SUPABASE_ANON_KEY` (public anon key)
  - `POSTGRES_PASSWORD=postgres`
  - The `.gitignore` lists `.env`, `.env.test`, `.env.local`, and `print-server/.env`, but **does NOT include `.env.docker`**
- **Risk**: Anyone with repository access (or if the repo were ever made public) obtains the `service_role` key, enabling full unrestricted access to the entire Supabase database (bypassing all RLS policies). This is the most severe finding.
- **Recommendation**:
  1. Immediately rotate the `SUPABASE_SERVICE_ROLE_KEY` in the Supabase dashboard
  2. Add `.env.docker` to `.gitignore`
  3. Remove `.env.docker` from git history using `git filter-branch` or BFG Repo-Cleaner
  4. Audit git history for any other committed secrets

---

### SEC-02: Plaintext PIN Stored in Database (pin_code column)

- **Criticality**: CRITICAL
- **Category**: Security
- **File(s)**:
  - `C:\Users\MamatCEO\App\AppGrav\supabase\functions\auth-user-management\index.ts` (line 135)
  - `C:\Users\MamatCEO\App\AppGrav\src\pages\auth\LoginPage.tsx` (line 56: selects `pin_code`)
  - `C:\Users\MamatCEO\App\AppGrav\src\types\database.generated.ts` (lines 5863-5864)
- **Description**: While the system correctly uses bcrypt for `pin_hash`, there is also a `pin_code` column storing the **plaintext PIN**. In `auth-user-management/index.ts` line 135:
  ```typescript
  .update({ pin_hash: hashedPin, pin_code: pin }) // Keep pin_code for legacy
  ```
  The LoginPage also selects `pin_code` from the database and transmits it to the frontend. This completely undermines the bcrypt hashing.
- **Risk**: Any database breach (or SQL injection, or service_role key leak -- see SEC-01) exposes all user PINs in plaintext. Combined with SEC-01, an attacker already has the service_role key and can read all plaintext PINs.
- **Recommendation**:
  1. Remove the `pin_code` column entirely from `user_profiles`
  2. Remove `pin_code: pin` from the edge function user creation
  3. Remove `pin_code` from the LoginPage SELECT query
  4. Migrate all legacy code that depends on plaintext PIN comparison
  5. Create a migration: `ALTER TABLE user_profiles DROP COLUMN pin_code;`

---

### SEC-03: Debug Logging Exposes Environment Variables in Production

- **Criticality**: CRITICAL
- **Category**: Security
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\src\lib\supabase.ts` (lines 6-10)
- **Description**: The Supabase client initialization contains:
  ```typescript
  console.log('ENV DEBUG:', {
    supabaseUrl,
    hasKey: !!supabaseAnonKey,
    allEnv: import.meta.env
  })
  ```
  While `import.meta.env` only exposes `VITE_`-prefixed variables in Vite builds, this still logs the Supabase URL and reveals the full environment structure. The `esbuild.drop` config in `vite.config.ts` removes `console.log` in production, but if the build mode is misconfigured or during SSR/test builds, this will leak.
- **Risk**: Exposes application configuration to anyone with browser console access during development/staging. The `allEnv: import.meta.env` dump could expose any `VITE_`-prefixed secrets (including `VITE_ANTHROPIC_API_KEY` if set).
- **Recommendation**:
  1. Remove this debug logging entirely from `supabase.ts`
  2. If needed for debugging, use the project's `logger.ts` utility which is environment-aware

---

### SEC-04: VITE_ANTHROPIC_API_KEY Declared as Frontend Environment Variable

- **Criticality**: CRITICAL
- **Category**: Security
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\src\vite-env.d.ts` (line 6)
- **Description**: The TypeScript environment declaration includes `VITE_ANTHROPIC_API_KEY`. Any variable prefixed with `VITE_` is bundled into the frontend JavaScript and visible to all users via browser dev tools. While the Claude proxy edge function correctly reads the API key server-side from `Deno.env.get('ANTHROPIC_API_KEY')`, the declaration suggests the key may also be passed as a frontend env var.
- **Risk**: If `VITE_ANTHROPIC_API_KEY` is set in `.env`, the Anthropic API key would be exposed in the browser bundle, allowing unauthorized API usage at the project owner's expense.
- **Recommendation**:
  1. Remove `VITE_ANTHROPIC_API_KEY` from `vite-env.d.ts`
  2. Ensure the Anthropic API key is ONLY set as `ANTHROPIC_API_KEY` (without `VITE_` prefix) in Edge Function environment variables
  3. Verify `.env` does not contain `VITE_ANTHROPIC_API_KEY=<actual key>`

---

### SEC-05: Print Server CORS Allows All Origins (`origin: '*'`)

- **Criticality**: CRITICAL
- **Category**: Security
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\print-server\src\index.js` (lines 23-28)
- **Description**: The print server CORS is configured as:
  ```javascript
  app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
  }));
  ```
  Despite the `.env` having `CORS_ORIGIN=http://localhost:3000`, this value is never used. The server has `HOST=0.0.0.0`, meaning it listens on all network interfaces.
- **Risk**: Any device on the local network can send print commands, open the cash drawer, or cause denial of service by flooding the print queue. A malicious website visited by a user on the same network could also trigger cross-origin requests to the print server.
- **Recommendation**:
  1. Use the `CORS_ORIGIN` environment variable: `app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }))`
  2. Consider adding authentication (API key or session token) to the print server
  3. Add rate limiting to print endpoints

---

### SEC-06: No Authentication on Print Server Endpoints

- **Criticality**: Major
- **Category**: Security
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\print-server\src\index.js`, `print-server\src\routes\print.js`
- **Description**: All print server endpoints (`/print/receipt`, `/print/kitchen`, `/drawer/open`, etc.) accept unauthenticated requests. Combined with CORS `*` and `0.0.0.0` binding, any device can trigger printing or cash drawer opening.
- **Risk**: Physical security compromise -- an attacker on the LAN can open the cash drawer remotely, print fake receipts, or overwhelm printers.
- **Recommendation**: Add a shared secret/API key authentication middleware, even a simple bearer token check.

---

### SEC-07: Edge Function User Management Uses Client-Spoofable x-user-id Header

- **Criticality**: Major
- **Category**: Security
- **File(s)**:
  - `C:\Users\MamatCEO\App\AppGrav\src\services\authService.ts` (lines 240, 289, 337, 375, 412)
  - `C:\Users\MamatCEO\App\AppGrav\supabase\functions\auth-user-management\index.ts` (line 64)
- **Description**: The `auth-user-management` edge function determines the requesting user from a custom `x-user-id` HTTP header. This header is set by the frontend:
  ```typescript
  'x-user-id': requestingUserId,
  ```
  This header is trivially spoofable by any client. The edge function then uses this user ID to check permissions and perform actions, meaning an attacker can impersonate any user.
- **Risk**: Privilege escalation -- any authenticated user (even with just the anon key) can impersonate an admin by setting `x-user-id` to an admin's UUID, then create, delete, or modify any user.
- **Recommendation**:
  1. Use the Supabase JWT from the `Authorization` header to identify the user
  2. Validate the JWT server-side and extract the user ID from the token claims
  3. Never trust client-provided user identification

---

### SEC-08: LoginPage Fetches pin_code from Database

- **Criticality**: Major
- **Category**: Security
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\src\pages\auth\LoginPage.tsx` (line 56)
- **Description**: The LoginPage queries:
  ```typescript
  .select('id, name, display_name, role, is_active, avatar_url, employee_code, pin_code')
  ```
  This fetches the plaintext `pin_code` for ALL active users and stores them in React state. While RLS should prevent unauthorized access, the anon key with RLS "Authenticated read" policies would expose PINs.
- **Risk**: All user PINs visible in browser dev tools React state, network tab, and potentially cached in IndexedDB/localStorage.
- **Recommendation**: Remove `pin_code` from the SELECT query. PIN verification should ONLY happen server-side via `verify_user_pin` RPC.

---

### SEC-09: Edge Functions Default CORS Header Has Wildcard

- **Criticality**: Major
- **Category**: Security
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\supabase\functions\_shared\cors.ts` (line 41)
- **Description**: The default `corsHeaders` object has `'Access-Control-Allow-Origin': '*'`. While `getCorsHeaders()` overrides this with a validated origin, the `errorResponse()` and `jsonResponse()` functions fall back to the wildcard `corsHeaders` if no `req` parameter is provided:
  ```typescript
  const headers = req ? getCorsHeaders(req) : corsHeaders;
  ```
  Some edge functions (e.g., `auth-verify-pin`) call `errorResponse('Method not allowed', 405)` without passing `req`, using the wildcard.
- **Risk**: Cross-origin attacks against edge function endpoints where `req` is not passed to response helpers.
- **Recommendation**: Always pass `req` to `errorResponse()` and `jsonResponse()`. Remove the wildcard fallback.

---

### SEC-10: Auth Store Persists Sensitive Data to localStorage

- **Criticality**: Major
- **Category**: Security
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\src\stores\authStore.ts` (lines 297-308)
- **Description**: The auth store uses Zustand `persist` middleware with `partialize` that includes `user`, `roles`, `permissions`, and `isAuthenticated`. This data is written to localStorage (`breakery-auth` key) and survives browser restarts.
- **Risk**: On shared computers (common in POS environments), the next user can access the previous user's cached session data, roles, and permissions from localStorage without authentication.
- **Recommendation**:
  1. Use `sessionStorage` instead of `localStorage` for auth persistence
  2. Or clear auth storage on browser/tab close
  3. Add an inactivity timeout that clears the session

---

### SEC-11: localhost CORS Bypass in Edge Functions

- **Criticality**: Minor
- **Category**: Security
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\supabase\functions\_shared\cors.ts` (line 26)
- **Description**: The CORS validation allows any `localhost` or `127.0.0.1` origin:
  ```typescript
  if (requestOrigin.startsWith('http://localhost:') || requestOrigin.startsWith('http://127.0.0.1:')) {
      return requestOrigin;
  }
  ```
  This is acceptable for development but should be disabled in production.
- **Risk**: In production, if any application runs on localhost (e.g., malware, browser extensions), it can access the edge functions.
- **Recommendation**: Make the localhost bypass conditional on a `NODE_ENV` or `ENVIRONMENT` env variable.

---

## 2. ERROR HANDLING

### ERR-01: ErrorBoundary Exposes Component Stack in Production

- **Criticality**: Major
- **Category**: Errors
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\src\components\ui\ErrorBoundary.tsx` (lines 60-73)
- **Description**: The ErrorBoundary renders `error.message` and `errorInfo.componentStack` in the UI, visible to all users:
  ```tsx
  <pre className="mt-2 text-xs text-red-600 overflow-auto">
    {this.state.error.message}
  </pre>
  <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40">
    {this.state.errorInfo.componentStack}
  </pre>
  ```
- **Risk**: Information disclosure -- stack traces and component hierarchy revealed to end users, potentially exposing internal architecture.
- **Recommendation**: Only show error details in development mode (`import.meta.env.DEV`). In production, show only a generic error message.

---

### ERR-02: No Error Monitoring Service Integration

- **Criticality**: Major
- **Category**: Errors
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\src\components\ui\ErrorBoundary.tsx` (line 27)
- **Description**: There is a `// TODO: Send to monitoring service (Sentry)` comment but no actual integration with any error monitoring service.
- **Risk**: Production errors go unnoticed. For a POS system handling ~200 transactions/day, undetected errors could cause silent data loss or incorrect charges.
- **Recommendation**: Integrate Sentry, LogRocket, or similar error monitoring service. At minimum, implement error reporting to a Supabase `error_logs` table.

---

### ERR-03: Single Global ErrorBoundary -- No Component-Level Boundaries

- **Criticality**: Major
- **Category**: Errors
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\src\App.tsx` (lines 219, 386)
- **Description**: Only one ErrorBoundary wraps the entire application. If any component crashes (e.g., a report tab), the entire POS becomes unusable. Critical pages like POS, KDS, and Order processing have no individual error boundaries.
- **Risk**: A crash in a non-critical feature (e.g., reporting, settings) takes down the entire POS terminal, blocking sales.
- **Recommendation**: Add ErrorBoundary wrappers around:
  - Each major route/page (POS, KDS, Orders, Reports, Settings)
  - Modals (payment, refund, void)
  - The customer display page

---

### ERR-04: Print Service Fails Silently on Connection Issues

- **Criticality**: Minor
- **Category**: Errors
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\src\services\print\printService.ts`
- **Description**: The print service has a 5-second timeout but there is no user notification mechanism if printing fails. Print failures are caught and logged but the user may not know a receipt or kitchen ticket was not printed.
- **Risk**: Orders could be placed without kitchen tickets being printed, causing missed orders.
- **Recommendation**: Add user-visible toast notifications for print failures. Consider a print status indicator in the POS UI.

---

## 3. TESTS

### TEST-01: Test Suite Results

- **Category**: Tests
- **Description**: Test run results (2026-02-10):
  - **Test files**: 81 (1 failed, 80 passed)
  - **Tests**: 1389 (2 failed, 1387 passed)
  - **Duration**: 65.28s
  - **Failed tests**: `useOfflinePayment.test.ts` -- 2 tests failing (processPayment cash and card)
  - **No coverage report configured** (`--coverage` flag would require `@vitest/coverage-v8` or similar)

---

### TEST-02: No Tests for Core Cart Store (addItem, updateItem, calculateTotals)

- **Criticality**: Major
- **Category**: Tests
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\src\stores\cartStore.ts` (539 lines)
- **Description**: The only cart store test is `cartStoreCombo.test.ts` (10 tests for combo functionality). There are NO tests for:
  - `addItem` / `removeItem` / `updateItem` / `updateItemQuantity`
  - `calculateTotals` (discount percentage, discount amount, promotions)
  - Locked item behavior (PIN-required removal)
  - `addItemWithPricing` / `updateItemPricing` / `recalculateAllPrices`
  - Cart persistence (`initCartPersistence`)
  - Edge cases: negative quantities, maximum discount caps, zero-price items
- **Risk**: The cart is the heart of the POS system. Untested calculation logic could result in incorrect pricing, tax calculation errors, or discount bypass.
- **Recommendation**: Create comprehensive cart store tests covering all actions and edge cases, especially `calculateTotals` with various discount scenarios.

---

### TEST-03: No Checkout/Order Creation Integration Tests

- **Criticality**: Major
- **Category**: Tests
- **File(s)**: No checkout test files found (glob: `src/**/*checkout*`)
- **Description**: There are no integration tests for the end-to-end order creation flow: cart -> payment -> order creation -> stock deduction -> receipt printing.
- **Risk**: Integration bugs between cart, payment, order, and stock systems may go undetected.
- **Recommendation**: Create integration tests that simulate the full checkout flow.

---

### TEST-04: No Tests for promotionService.ts

- **Criticality**: Major
- **Category**: Tests
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\src\services\promotionService.ts` (378 lines)
- **Description**: While `promotionEngine.test.ts` exists for the POS-side engine, there are no tests for the core `promotionService.ts` which handles:
  - `isPromotionValid()` (time range, day-of-week, usage limit validation)
  - `evaluatePromotions()` (applying promotions to cart)
  - `calculatePromotionDiscount()` (discount calculation)
  - `fetchActivePromotions()` (database queries)
- **Risk**: Promotions could apply incorrectly, giving unauthorized discounts or missing valid promotions.
- **Recommendation**: Add unit tests for all promotion validation and calculation logic.

---

### TEST-05: 2 Failing Tests in Test Suite

- **Criticality**: Minor
- **Category**: Tests
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\src\hooks\offline\__tests__\useOfflinePayment.test.ts` (lines 238, 264)
- **Description**: Two tests fail with `expected null not to be null`:
  - `should process cash payment successfully`
  - `should process card payment successfully (no cashReceived needed)`
- **Risk**: Indicates potential regression in offline payment processing.
- **Recommendation**: Fix the failing tests -- the mock setup may be out of date with the implementation.

---

### TEST-06: No Coverage Reporting Configured

- **Criticality**: Minor
- **Category**: Tests
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\vite.config.ts`
- **Description**: No coverage provider is configured in the Vitest test configuration. Running `npx vitest run --coverage` would fail without `@vitest/coverage-v8` or `@vitest/coverage-istanbul`.
- **Risk**: No visibility into which code paths are untested.
- **Recommendation**: Add `@vitest/coverage-v8` and configure coverage thresholds for critical modules (minimum 80% for services, stores).

---

### TEST-07: No Tests for authService.ts (788 lines)

- **Criticality**: Major
- **Category**: Tests
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\src\services\authService.ts`
- **Description**: The auth service contains 788 lines of critical authentication logic with zero dedicated tests. Functions without tests include: `loginWithPin`, `logout`, `validateSession`, `changePin`, `createUser`, `updateUser`, `deleteUser`, `createUserDirect`, `updateUserDirect`.
- **Risk**: Authentication and user management bugs could allow unauthorized access or data corruption.
- **Recommendation**: Create comprehensive tests mocking Supabase and edge function responses.

---

## 4. LOGGING AND MONITORING

### LOG-01: Print Server Has Proper Logging

- **Criticality**: N/A (positive finding)
- **Category**: Logging
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\print-server\src\utils\logger.js`
- **Description**: The print server uses Winston with daily rotating log files, separate error logs, and 14-day retention. This is well-implemented.

---

### LOG-02: Edge Functions Use console.error Only

- **Criticality**: Minor
- **Category**: Logging
- **File(s)**: All files in `C:\Users\MamatCEO\App\AppGrav\supabase\functions\`
- **Description**: Edge functions only use `console.error` for logging. There is no structured logging, request ID tracking, or log aggregation. Supabase does capture edge function logs, but there is no correlation between frontend errors and edge function logs.
- **Risk**: Debugging production issues across the frontend-edge function boundary is difficult without request IDs.
- **Recommendation**: Add a request ID (UUID) to each edge function request and include it in all log messages and error responses.

---

### LOG-03: Audit Logging Comprehensive but Missing Some Critical Actions

- **Criticality**: Minor
- **Category**: Logging
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\src\services\financial\auditService.ts`
- **Description**: Financial operations (void, refund) are properly audit-logged with severity='critical'. However, the following critical actions are NOT audit-logged:
  - Stock adjustments (manual stock corrections)
  - Price changes
  - Discount application (especially manual discounts above threshold)
  - Settings changes
  - Cash drawer opens (no POS-side logging)
- **Risk**: Compliance and fraud detection gaps for non-financial operations.
- **Recommendation**: Extend audit logging to all sensitive operations listed above.

---

### LOG-04: 676 console.log/warn/error/debug Calls in Frontend Code

- **Criticality**: Minor
- **Category**: Logging
- **File(s)**: 172 files across `src/`
- **Description**: While the Vite config removes `console.log` and `console.debug` in production builds, there are 676 console calls across the codebase. The `utils/logger.ts` utility exists but is not widely adopted -- most code uses `console.*` directly.
- **Risk**: Inconsistent logging behavior, potential for sensitive data in console output during development.
- **Recommendation**: Migrate all `console.*` calls to use the `logger` utility. Run a linting rule to enforce this.

---

## 5. CODE QUALITY

### QUAL-01: 14+ Files Exceed 300-Line Convention (Some > 1000 Lines)

- **Criticality**: Major
- **Category**: Quality
- **File(s)**: Files exceeding the 300-line convention:

| File | Lines | Severity |
|------|-------|----------|
| `src/components/pos/modals/CustomerSearchModal.tsx` | 1069 | 3.6x over |
| `src/pages/b2b/B2BOrderDetailPage.tsx` | 1027 | 3.4x over |
| `src/pages/orders/OrdersPage.tsx` | 819 | 2.7x over |
| `src/pages/inventory/StockProductionPage.tsx` | 819 | 2.7x over |
| `src/services/authService.ts` | 788 | 2.6x over |
| `src/pages/inventory/tabs/VariantsTab.tsx` | 759 | 2.5x over |
| `src/pages/b2b/B2BOrderFormPage.tsx` | 721 | 2.4x over |
| `src/components/settings/FloorPlanEditor.tsx` | 703 | 2.3x over |
| `src/components/pos/modals/PaymentModal.tsx` | 697 | 2.3x over |
| `src/pages/profile/ProfilePage.tsx` | 623 | 2.1x over |
| `src/pages/kds/KDSMainPage.tsx` | 591 | 2.0x over |
| `src/pages/purchasing/PurchaseOrderFormPage.tsx` | 586 | 1.9x over |
| `src/stores/cartStore.ts` | 539 | 1.8x over |
| `src/services/sync/syncEngine.ts` | 470 | 1.6x over |

- **Risk**: Difficult to maintain, review, and test. Higher probability of bugs in large, monolithic files.
- **Recommendation**: Split these files using patterns like:
  - Extract hooks from page components
  - Split large modals into sub-components
  - Extract service logic into focused modules
  - Use composition patterns for complex forms

---

### QUAL-02: 148 ESLint Warnings (0 Errors)

- **Criticality**: Minor
- **Category**: Quality
- **Description**: `npm run lint` reports 148 warnings, all of which are:
  - `@typescript-eslint/no-explicit-any` (majority)
  - `@typescript-eslint/no-unused-vars` (few)
- **Risk**: `any` types bypass TypeScript's type safety, potentially allowing runtime errors.
- **Recommendation**: Gradually replace `any` with proper types, starting with service and store files. Consider enabling `no-explicit-any` as an error for new code.

---

### QUAL-03: Magic Numbers in Business Logic

- **Criticality**: Minor
- **Category**: Quality
- **File(s)**: Multiple files
- **Description**: Several magic numbers are used without named constants:
  - `5` (max login attempts) in `auth-verify-pin/index.ts` line 104
  - `300` (cart persistence debounce ms) in `cartStore.ts` line 534
  - `100` (IDR rounding) in `paymentService.ts` line 33 (properly named as constant)
  - `24` (cache TTL hours) referenced but defined in `types/offline.ts` (good)
  - `10_000_000_000` (max payment) in `paymentService.ts` line 30 (properly named)
  - `4096` (max Claude tokens) in `claude-proxy/index.ts` line 82
- **Risk**: Hard to understand business rules and prone to inconsistency if the same value is used in multiple places.
- **Recommendation**: Extract all magic numbers to named constants in a central `constants/` directory.

---

### QUAL-04: LoginPage Has Complex Legacy Fallback Chain

- **Criticality**: Major
- **Category**: Quality
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\src\pages\auth\LoginPage.tsx` (438 lines)
- **Description**: The LoginPage has a complex authentication fallback chain:
  1. Try `loginWithPin` (edge function)
  2. On failure, fall back to `handleLegacyLogin`
  3. `handleLegacyLogin` tries `verify_user_pin` RPC
  4. On RPC failure, fall back to `handleDemoLogin`
  5. `handleDemoLogin` compares plaintext PINs from `DEMO_USERS`

  This creates confusing security boundaries and makes it hard to reason about which authentication path is active.
- **Risk**: Security bypass through fallback chains. A failure in the primary auth system could silently fall back to the insecure demo mode.
- **Recommendation**:
  1. Remove demo login entirely from the LoginPage (use a separate `/dev-login` route)
  2. Simplify to: online -> edge function; offline -> cached bcrypt; failure -> error
  3. Never allow plaintext PIN comparison in production code

---

### QUAL-05: No Input Sanitization on Print Server

- **Criticality**: Major
- **Category**: Quality / Security
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\print-server\src\routes\print.js`
- **Description**: The print routes accept arbitrary JSON bodies and pass them to template functions without sanitization:
  ```javascript
  const { order } = req.body;
  const escPosData = receiptTemplate(order);
  ```
  No validation of the order structure, item counts, string lengths, or character encoding.
- **Risk**: Malformed input could crash the print server, cause printer errors, or inject ESC/POS commands via crafted data.
- **Recommendation**: Add input validation (using Joi, Zod, or similar) for all print endpoints. Validate and sanitize all string fields.

---

### QUAL-06: Error Responses Leak Internal Details

- **Criticality**: Minor
- **Category**: Quality / Security
- **File(s)**:
  - `C:\Users\MamatCEO\App\AppGrav\print-server\src\index.js` (line 97)
  - `C:\Users\MamatCEO\App\AppGrav\print-server\src\routes\print.js` (lines 69, 117)
- **Description**: Error handlers return `error.message` directly to clients:
  ```javascript
  res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
  });
  ```
- **Risk**: Internal error messages (e.g., file paths, database errors) could be exposed.
- **Recommendation**: Return generic error messages to clients. Log the full error server-side.

---

### QUAL-07: Inconsistent Error Return Patterns in Services

- **Criticality**: Minor
- **Category**: Quality
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\src\services\authService.ts`
- **Description**: Some service methods return `{ success: false, error: message }` while others swallow errors and return empty arrays (`return []`). For example:
  - `getUsers()` returns `[]` on error (line 658)
  - `getRoles()` returns `[]` on error (line 682)
  - `getPermissions()` returns `{}` on error (line 716)

  Callers cannot distinguish "no data" from "error fetching data".
- **Risk**: Silent failures where the UI shows "no items" instead of an error message.
- **Recommendation**: Adopt a consistent result pattern (e.g., `{ data, error }` or throw errors and let callers handle).

---

### QUAL-08: Supabase API Response Caching in Service Worker May Serve Stale Auth Data

- **Criticality**: Major
- **Category**: Quality / Security
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\vite.config.ts` (lines 93-107)
- **Description**: The PWA service worker caches Supabase REST API responses with `NetworkFirst` strategy and 24-hour expiration:
  ```typescript
  {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
      handler: 'NetworkFirst',
      options: {
          cacheName: 'supabase-api-cache',
          expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24, // 1 day
          },
      },
  },
  ```
  This caches ALL Supabase REST requests, including those that return user permissions, roles, product prices, and stock levels.
- **Risk**: Stale permission data could allow a deactivated user to continue accessing the system from cache. Stale price data could result in incorrect charges.
- **Recommendation**:
  1. Exclude auth-related endpoints from service worker caching
  2. Reduce cache TTL for price and stock data
  3. Or limit caching to only product catalog and category endpoints

---

### QUAL-09: No Unsubscribe in Some useEffect Hooks

- **Criticality**: Minor
- **Category**: Quality
- **File(s)**: Multiple hooks using `subscribe`, `addEventListener`, `setInterval`
- **Description**: Found 76 occurrences of subscription/timer patterns across 42 files. Most properly return cleanup functions. However, a full audit of each is needed to verify all subscriptions, intervals, and event listeners are properly cleaned up.
- **Risk**: Memory leaks in long-running POS sessions.
- **Recommendation**: Audit all 42 files with subscription patterns. Consider using a linting rule for exhaustive cleanup.

---

### QUAL-10: Zustand sessionToken Persisted Despite partialize

- **Criticality**: Minor
- **Category**: Quality
- **File(s)**: `C:\Users\MamatCEO\App\AppGrav\src\stores\authStore.ts` (line 100)
- **Description**: While `partialize` excludes `sessionToken` from persistence (good), the token is still set in the store state:
  ```typescript
  sessionToken: response.session?.token || null,
  ```
  And it is also stored in `sessionStorage` (line 83). This creates two sources of truth for the session token.
- **Risk**: Inconsistent session state if one storage is cleared but not the other.
- **Recommendation**: Use a single storage mechanism for the session token and ensure consistent cleanup.

---

## 6. POSITIVE FINDINGS

The audit also identified several well-implemented security and quality patterns:

1. **bcrypt PIN hashing**: The offline auth service correctly uses `bcryptjs.compare()` for PIN verification (line 244 of `offlineAuthService.ts`)
2. **Rate limiting**: Offline PIN attempts are limited to 3 per 15 minutes with persistent state in IndexedDB
3. **No dangerouslySetInnerHTML**: Zero occurrences found -- XSS via React is well-mitigated
4. **No eval() or new Function()**: No dynamic code execution patterns found
5. **Claude proxy pattern**: Anthropic API key is correctly kept server-side in edge functions
6. **Financial audit trail**: Critical operations (void, refund) are properly audit-logged
7. **Security headers**: Edge functions include `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`
8. **Console stripping in production**: `vite.config.ts` removes `console.log`, `console.debug`, `console.info` and `debugger` statements from production builds
9. **Supabase parameterized queries**: All database queries use the Supabase client library which parameterizes inputs, preventing SQL injection
10. **Proper .gitignore for .env**: `.env`, `.env.test`, `.env.local`, and `print-server/.env` are all in `.gitignore`
11. **Production logger utility**: `src/utils/logger.ts` provides environment-aware logging (though under-adopted)
12. **Graceful shutdown**: Print server handles SIGTERM/SIGINT for clean shutdown

---

## 7. PRIORITIZED REMEDIATION PLAN

### Immediate (Critical -- do today)

1. **SEC-01**: Rotate Supabase service_role key, add `.env.docker` to `.gitignore`, scrub git history
2. **SEC-02**: Drop `pin_code` column, remove plaintext PIN storage
3. **SEC-03**: Remove ENV DEBUG logging from `supabase.ts`
4. **SEC-04**: Remove `VITE_ANTHROPIC_API_KEY` from env declarations
5. **SEC-05**: Fix print server CORS to use environment variable

### This Week (Major)

6. **SEC-07**: Fix edge function auth to use JWT instead of `x-user-id` header
7. **SEC-08**: Remove `pin_code` from LoginPage SELECT query
8. **SEC-06**: Add authentication to print server
9. **ERR-01**: Hide error details in production ErrorBoundary
10. **ERR-03**: Add component-level ErrorBoundaries to critical routes
11. **QUAL-04**: Remove demo login fallback chain from production LoginPage
12. **QUAL-08**: Exclude auth endpoints from service worker cache

### This Sprint (Major)

13. **TEST-02**: Add cart store tests
14. **TEST-03**: Add checkout integration tests
15. **TEST-04**: Add promotionService tests
16. **TEST-07**: Add authService tests
17. **QUAL-01**: Begin splitting files exceeding 600 lines
18. **SEC-10**: Switch auth persistence to sessionStorage
19. **QUAL-05**: Add input validation to print server

### Backlog (Minor)

20. **ERR-02**: Integrate error monitoring (Sentry)
21. **LOG-02**: Add structured logging to edge functions
22. **LOG-03**: Extend audit logging to non-financial operations
23. **TEST-06**: Configure coverage reporting
24. **QUAL-02**: Reduce ESLint warnings
25. **QUAL-03**: Extract magic numbers to constants
26. **LOG-04**: Migrate console.* to logger utility
27. All remaining minor items

---

## Appendix A: Test File Inventory

81 test files found covering:
- Offline authentication and rate limiting
- Sync engine components (queue, order, product, customer, promotion, stock, session, payment)
- Network status hooks
- KDS (order receiver, queue, status, auto-remove)
- LAN protocol and client
- Financial operations (void, refund, security audit)
- Payment service
- B2B services
- Cart store (combo only)
- Print service
- Settings and company page
- Various UI components

**Critical modules WITHOUT tests**:
- `cartStore.ts` (core calculations, locked items, pricing)
- `authService.ts` (all authentication flows)
- `promotionService.ts` (validation and calculation)
- `LoginPage.tsx` (authentication flow with fallbacks)
- Checkout/order creation flow (no integration tests)
- Most page components (95+ pages, ~3 page tests)

## Appendix B: ESLint Summary

```
148 problems (0 errors, 148 warnings)
- @typescript-eslint/no-explicit-any: ~140 warnings
- @typescript-eslint/no-unused-vars: ~8 warnings
```
