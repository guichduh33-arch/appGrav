# AppGrav Security Audit Report

**Date**: 2026-02-11
**Auditor**: Subagent 1C -- Security & Authentication Audit
**Scope**: Authentication, Authorization, Data Protection, XSS/Injection, Service Worker, Edge Functions, Print Server

---

## Executive Summary

The AppGrav ERP/POS application demonstrates a generally solid security posture with several well-implemented patterns: bcrypt PIN hashing, server-side session management, rate limiting, session timeout, comprehensive audit logging, and an origin-checked CORS policy for most Edge Functions. However, this audit uncovered **4 critical**, **7 major**, and **10 minor** issues that require attention. The most serious findings involve PIN hash exposure to the client, wildcard CORS on two Edge Functions, missing permission guards on sensitive pages, and a legacy login fallback that bypasses session-based authentication.

---

## 1. Authentication

### SEC-AUTH-01 [CRITIQUE] PIN Hash Exposed to Client in MobileLoginPage

**File**: `src/pages/mobile/MobileLoginPage.tsx:106`

```typescript
.select('id, name, display_name, role, pin_hash, is_active')
.eq('is_active', true)
.not('pin_hash', 'is', null);
```

**Description**: The MobileLoginPage fetches `pin_hash` (bcrypt hash) from the `user_profiles` table directly to the client browser. Even though the hash is bcrypt, exposing it allows offline brute-force attacks against 4-6 digit PINs. A 6-digit PIN has only 1,000,000 combinations -- trivially crackable offline against a bcrypt hash even at high cost factors.

**Impact**: An attacker who intercepts this response or accesses the browser DevTools can extract all active users' PIN hashes and crack them offline in minutes using GPU-accelerated tools.

**Recommendation**: Remove `pin_hash` from the `.select()` clause. The MobileLoginPage already uses `supabase.rpc('verify_user_pin')` for actual verification -- the `pin_hash` column fetch is unnecessary:
```typescript
.select('id, name, display_name, role, is_active')
.eq('is_active', true)
.not('pin_hash', 'is', null) // This filter can use an RPC or view instead
```

---

### SEC-AUTH-02 [MAJEUR] Legacy Login Fallback Bypasses Session Management

**File**: `src/pages/auth/LoginPage.tsx:157-254`

**Description**: When the Edge Function `auth-verify-pin` fails for any reason (network error, 500 error, unexpected response), `handleLogin()` falls back to `handleLegacyLogin()`, which:
1. Calls `supabase.rpc('verify_user_pin')` directly from the client
2. Creates an auth state without a server-side session (`sessionId: null`)
3. Uses the deprecated `login()` method that only sets user + isAuthenticated

This means the user is authenticated with **no server session**, no session timeout tracking, no session token for Edge Function calls, and no audit trail of the login.

**Impact**: Users authenticated via fallback bypass all session-based security controls. Any Edge Function requiring `x-session-token` will reject their requests, but local UI features (including the POS) work fully.

**Recommendation**: Either remove the legacy fallback entirely (forcing re-login when Edge Functions are unavailable), or ensure the fallback creates a server session via a retry mechanism. At minimum, log a warning and limit capabilities:
```typescript
// If edge function fails, try once more before giving up
// Do NOT fall back to sessionless authentication
```

---

### SEC-AUTH-03 [MAJEUR] Session Token Stored in Zustand Persist (sessionStorage)

**File**: `src/stores/authStore.ts:297-308`

```typescript
{
  name: 'breakery-auth',
  storage: createJSONStorage(() => sessionStorage),
  partialize: (state) => ({
    user: state.user,
    roles: state.roles,
    permissions: state.permissions,
    isAuthenticated: state.isAuthenticated,
    sessionId: state.sessionId,
    isOfflineSession: state.isOfflineSession,
  }),
}
```

**Description**: While `sessionToken` is intentionally excluded from the persist partialize function (good), the `isAuthenticated` and full `permissions` array are persisted in `sessionStorage`. This means:
1. After a tab restoration, `isAuthenticated = true` but the session may have been ended server-side
2. The `sessionToken` is separately stored in `sessionStorage` at line 83, so both the token and auth state survive tab refresh

The `initializeAuth()` function on line 321 does revalidate the session on app start, which mitigates this partially. However, there is a window between `sessionStorage` restoration and `refreshSession()` completion where the user is treated as authenticated with potentially revoked permissions.

**Impact**: Brief window of stale permission enforcement after page refresh; mitigated by `refreshSession()` but the UI renders authenticated state before validation completes.

**Recommendation**: Set `isAuthenticated = false` during the validation period, or add a `validating` state that shows a loading screen until `refreshSession()` completes:
```typescript
// In initializeAuth():
useAuthStore.setState({ isLoading: true });
// ... validate
// Only set isAuthenticated = true after validation succeeds
```

---

### SEC-AUTH-04 [MINEUR] Session Token is UUID (Not Cryptographically Signed)

**File**: `supabase/functions/auth-verify-pin/index.ts:136`

```typescript
const sessionToken = crypto.randomUUID();
```

**Description**: Session tokens are random UUIDs (128 bits of entropy). While UUIDs are not guessable (122 random bits), they are not signed/encrypted. This means session validation requires a database lookup on every request. This is acceptable for the current scale (~200 transactions/day) but does not protect against token replay if intercepted.

**Impact**: Low risk at current scale. Session tokens in transit over HTTPS are protected. Risk only increases if HTTP is used (development) or if the token is logged somewhere.

**Recommendation**: Acceptable for current scale. Consider HMAC-signed tokens for future if scaling or if session validation becomes a bottleneck.

---

### SEC-AUTH-05 [MINEUR] Auth-Verify-PIN Does Not Pass `req` to `errorResponse()`

**File**: `supabase/functions/auth-verify-pin/index.ts:38,49`

```typescript
return errorResponse('Method not allowed', 405);
// ...
return errorResponse('user_id and pin are required', 400);
```

**Description**: Several error responses in `auth-verify-pin` do not pass the `req` parameter, causing them to use the default `corsHeaders` (hardcoded to `https://thebreakery.app`). In development, this means CORS errors will mask the actual error response, making debugging harder. This also applies to success responses (line 198 uses `jsonResponse()` without `req`).

**Impact**: CORS responses may fail in development environments; in production, responses default to `https://thebreakery.app` which is correct but not dynamic.

**Recommendation**: Pass `req` to all `errorResponse()` and `jsonResponse()` calls for consistent CORS behavior:
```typescript
return errorResponse('Method not allowed', 405, req);
```

---

### SEC-AUTH-06 [MINEUR] Offline PIN Cache Not Invalidated on Remote PIN Change

**File**: `src/services/offline/offlineAuthService.ts:52-81`

**Description**: When a user's PIN is changed (by admin or self), the offline cache in IndexedDB (`offlineUsers` table) retains the old PIN hash until it expires (24h TTL) or the user logs out. If User A changes User B's PIN while User B is offline, User B can still authenticate with the old PIN offline.

**Impact**: Low. 24-hour TTL limits exposure. Only affects offline-mode authentication.

**Recommendation**: When a PIN change is made via `auth-change-pin`, broadcast an event (e.g., via Supabase Realtime) that clears the affected user's offline cache on all connected clients. Also consider reducing the TTL for high-security environments.

---

## 2. Authorization

### SEC-AUTHZ-01 [CRITIQUE] Most Back-Office Pages Lack Permission Guards

**Files**:
- `src/pages/accounting/*.tsx` -- No `PermissionGuard` or `RouteGuard` on any accounting page
- `src/pages/reports/ReportsPage.tsx` -- No `PermissionGuard`
- `src/pages/inventory/*.tsx` -- No `PermissionGuard`
- `src/pages/customers/*.tsx` -- No `PermissionGuard`
- `src/pages/b2b/*.tsx` -- No `PermissionGuard`
- `src/pages/purchasing/*.tsx` -- No `PermissionGuard`
- `src/pages/products/*.tsx` -- No `PermissionGuard`

**Description**: Out of ~111 pages, only 2 pages (`UsersPage.tsx` and `RolesPage.tsx`) use `PermissionGuard` or `RouteGuard` for page-level access control. All other back-office pages (accounting, reports, inventory, customers, B2B, purchasing, products, and most settings pages) are accessible to **any authenticated user** regardless of their role or permissions.

The only route-level protection is the `isAuthenticated` check in `App.tsx`, which prevents unauthenticated access but does not enforce role-based or permission-based restrictions.

**Impact**: A cashier with `sales.create` permission can navigate to `/accounting/journal-entries`, `/reports`, `/settings/roles`, `/users/permissions`, `/inventory`, etc. and view/modify sensitive business data. While Supabase RLS may prevent some database operations, the UI does not reflect these restrictions.

**Recommendation**: Wrap all sensitive routes with `RouteGuard`:
```tsx
// In App.tsx or individual pages:
<Route path="/accounting" element={
  <RouteGuard permission="accounting.view">
    <AccountingLayout />
  </RouteGuard>
} />
<Route path="/reports" element={
  <RouteGuard permission="reports.sales">
    <ReportsPage />
  </RouteGuard>
} />
// etc. for all back-office routes
```

---

### SEC-AUTHZ-02 [MAJEUR] `Direct` Methods Bypass Edge Function Permission Checks

**Files**:
- `src/services/authService.ts:445-520` (`createUserDirect`)
- `src/services/authService.ts:525-592` (`updateUserDirect`)
- `src/services/authService.ts:597-613` (`deleteUserDirect`)
- `src/services/authService.ts:618-637` (`toggleUserActiveDirect`)
- `src/pages/users/UsersPage.tsx:161,182,609,636` (usage)

**Description**: The `*Direct` methods perform user management operations by directly calling Supabase from the client, bypassing the Edge Functions that enforce permission checks (`user_has_permission` RPC). While the `UsersPage.tsx` wraps buttons in `<PermissionGuard>`, this is a **client-side only check** that can be bypassed by calling `authService.createUserDirect()` from the browser console.

The Edge Function `auth-user-management` properly validates sessions and permissions server-side. The `Direct` methods exist as a "fallback when Edge Functions unavailable" but have **no server-side permission enforcement**.

**Impact**: Any authenticated user who can execute JavaScript in the browser can create, update, or delete users by calling `authService.createUserDirect()` directly, bypassing all permission checks. Supabase RLS policies may provide some protection depending on their configuration.

**Recommendation**: Either remove the `*Direct` methods entirely, or add server-side permission checks via RLS policies that enforce `user_has_permission()`:
```sql
CREATE POLICY "Permission-based insert" ON public.user_profiles
  FOR INSERT WITH CHECK (
    public.user_has_permission(auth.uid(), 'users.create')
  );
```

---

### SEC-AUTHZ-03 [MAJEUR] PinVerificationModal Iterates ALL Manager PINs

**File**: `src/components/pos/modals/PinVerificationModal.tsx:159-179`

```typescript
for (const user of users) {
  const { data: isValid, error: verifyError } = await supabase.rpc('verify_user_pin', {
    p_user_id: user.id,
    p_pin: pin
  })
  if (isValid) {
    onVerify(true, { id: user.id, name: user.display_name || user.name, role: user.role })
    return
  }
}
```

**Description**: When a manager PIN is required (e.g., for void/refund), the modal fetches ALL users with manager/admin roles and tries the entered PIN against each one sequentially. This has two issues:
1. **Information leakage**: The number of RPC calls reveals how many managers exist
2. **Timing attack**: A PIN matching the first manager returns faster than one matching the last
3. **Server load**: Each attempt generates N database calls (N = number of managers)

**Impact**: Minor security concern for the POS environment (trusted LAN), but the approach is architecturally wrong. A single RPC call that checks "is this PIN valid for any user with these roles" would be more secure and efficient.

**Recommendation**: Create a dedicated server-side RPC:
```sql
CREATE FUNCTION verify_manager_pin(p_pin TEXT, p_role_codes TEXT[])
RETURNS TABLE(user_id UUID, user_name TEXT, role_code TEXT) AS $$
-- Single query that checks PIN against all matching users
$$ LANGUAGE plpgsql;
```

---

### SEC-AUTHZ-04 [MINEUR] PermissionGuard Legacy Fallback Grants Broad Access

**File**: `src/components/auth/PermissionGuard.tsx:88-97`

```typescript
if (!hasAccess && userPermissions.length === 0 && user?.role) {
  const legacyRole = (user.role as string).toLowerCase();
  if (['admin', 'manager', 'super_admin'].includes(legacyRole)) {
    const userManagementPerms = ['users.create', 'users.update', 'users.delete', 'users.view', 'users.roles', 'users.permissions'];
    if (allPerms.some(p => userManagementPerms.includes(p))) {
      hasAccess = true;
    }
  }
}
```

**Description**: When `permissions` array is empty (e.g., failed to load from server), and the user has a legacy `role` field of admin/manager, the PermissionGuard grants access to all user management permissions. This fallback was intended for backwards compatibility but creates a privilege escalation risk: if permissions fail to load for any reason, legacy admin users get full access to user management.

**Impact**: Users with legacy admin/manager role field get implicit access to user management even if their actual permissions have been restricted through the new RBAC system.

**Recommendation**: Remove this legacy fallback or add a time-limited migration period after which it is automatically disabled. Log when this fallback is triggered:
```typescript
console.warn('[PermissionGuard] Legacy role fallback used -- this should not happen in production');
```

---

## 3. Sensitive Data

### SEC-DATA-01 [CRITIQUE] SMTP Password Stored in Plaintext in `settings` Table

**File**: `src/pages/settings/NotificationSettingsPage.tsx:56,250,297`

```typescript
smtpPassword: 'notifications.smtp_password',
// ...
{ key: NOTIFICATION_SETTINGS_KEYS.smtpPassword, value: formData.smtp_password },
```

**Description**: The SMTP password is stored as a plaintext value in the `settings` table (key: `notifications.smtp_password`) and is readable by any authenticated user via Supabase RLS (assuming standard "authenticated read" policy). The password is fetched to the client and displayed in the settings UI.

The Edge Function `send-test-email` also reads this password from the `settings` table (line 26-38 in `send-test-email/index.ts`).

**Impact**: Any authenticated user who can query the `settings` table can extract the SMTP password. In the current architecture, the `settings` table likely has an "authenticated read" RLS policy, meaning any logged-in user (cashier, kitchen staff, etc.) can read it.

**Recommendation**:
1. Store SMTP credentials in Supabase Vault (encrypted secrets) or as Edge Function environment variables
2. Never return the password to the client -- show a masked placeholder
3. Add RLS policy to restrict sensitive settings to admin-only:
```sql
CREATE POLICY "Admin-only settings" ON public.settings
  FOR SELECT USING (
    key NOT LIKE 'notifications.smtp_password' OR
    public.user_has_permission(auth.uid(), 'settings.update')
  );
```

---

### SEC-DATA-02 [MINEUR] .env File Exists in Project Root

**File**: `.env` (root directory)

**Description**: A `.env` file exists at `C:\Users\guich\Lastapp\appGrav\.env`. While `.env` is correctly listed in `.gitignore` (line 77), its presence in the working directory means it could be accidentally committed if `.gitignore` rules are modified, or exposed via file-serving misconfigurations.

**Impact**: Low risk since `.gitignore` covers it. However, the file likely contains `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and potentially `ANTHROPIC_API_KEY`.

**Recommendation**: Verify the `.env` file is not tracked by git. The `VITE_*` variables are public by design (anon key), but ensure no `SERVICE_ROLE_KEY` or other privileged secrets are present. The audit confirmed no `service_role` references exist in `src/`.

---

### SEC-DATA-03 [MINEUR] Supabase Error Thrown with URL and Key Presence

**File**: `src/lib/supabase.ts:7`

```typescript
throw new Error(`Supabase config missing. URL: ${supabaseUrl}, Key: ${supabaseAnonKey ? 'present' : 'missing'}`)
```

**Description**: The error message includes the full `VITE_SUPABASE_URL`. While this is not secret (it is an anon/public URL), including it in error messages that may appear in client-side error monitoring or logs is unnecessary.

**Impact**: Very low. The URL is already public in the built JavaScript bundle.

**Recommendation**: Simplify the error message:
```typescript
throw new Error('Supabase configuration missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
```

---

### SEC-DATA-04 [MINEUR] Console Debug Logs May Expose User IDs in Development

**Files**:
- `src/stores/authStore.ts:87-91` -- Logs userId, role codes, permission counts
- `src/services/offline/offlineAuthService.ts:59,76,228,246,251` -- Logs userId on PIN operations

**Description**: Multiple `console.debug` statements log user IDs and role information. While `vite.config.js` (line 148) strips `console.log`, `console.debug`, and `console.info` in production builds, this relies on the build configuration being correctly applied.

**Impact**: Very low in production (stripped by build). In development, user IDs are visible in DevTools.

**Recommendation**: Current production stripping is adequate. No action needed.

---

## 4. XSS, Injection, CORS

### SEC-XSS-01 [CRITIQUE] Unescaped Customer Data in Invoice HTML (Stored XSS)

**File**: `supabase/functions/generate-invoice/index.ts:118-122,172`

```typescript
<p><strong>${data.customer.company_name || data.customer.name}</strong></p>
${data.customer.address ? `<p>${data.customer.address}</p>` : ''}
${data.customer.phone ? `<p>Tel: ${data.customer.phone}</p>` : ''}
${data.customer.email ? `<p>Email: ${data.customer.email}</p>` : ''}
${data.customer.tax_id ? `<p>NPWP: ${data.customer.tax_id}</p>` : ''}
// ...
<p>${data.order.notes}</p>
```

**Description**: Customer data (name, address, phone, email, tax_id) and order notes are interpolated directly into HTML without any escaping. If a customer name or address contains `<script>alert('xss')</script>`, it will execute when the invoice HTML is rendered.

The invoice HTML is returned directly as `text/html` (line 289) and is opened in a print window by `B2BOrderDetailPage.tsx:408`.

Similarly, `B2BOrderDetailPage.tsx:414-454` constructs HTML for printing using unescaped order and customer data in template literals.

**Impact**: Stored XSS -- a malicious customer name/address stored in the database would execute JavaScript when any user views/prints the invoice. This could steal session tokens, perform actions as the victim, or exfiltrate data.

**Recommendation**: Add HTML escaping helper:
```typescript
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Usage:
`<p><strong>${escapeHtml(data.customer.company_name || data.customer.name)}</strong></p>`
```

Apply the same fix to `B2BOrderDetailPage.tsx` client-side HTML generation.

---

### SEC-XSS-02 [MINEUR] No dangerouslySetInnerHTML Usage Found

**Description**: The audit found zero instances of `dangerouslySetInnerHTML` in the codebase. This is positive. React's default JSX escaping protects against most reflected XSS.

**Impact**: None -- this is a positive finding.

---

### SEC-CORS-01 [MAJEUR] Wildcard CORS Origin on Two Edge Functions

**Files**:
- `supabase/functions/intersection_stock_movements/index.ts:6`
- `supabase/functions/purchase_order_module/index.ts:6`

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

**Description**: Two Edge Functions use `Access-Control-Allow-Origin: '*'` instead of the shared CORS utility from `_shared/cors.ts`. This allows any website to make authenticated requests to these endpoints if the user's JWT is available. Since these functions use `SUPABASE_ANON_KEY` with the user's `Authorization` header (not `SUPABASE_SERVICE_ROLE_KEY`), the risk is mitigated by Supabase's JWT validation and RLS. However, a malicious website could trick a logged-in user into making stock transfer or purchase order operations.

Additionally, these functions do NOT use session token validation (`requireSession`), relying solely on JWT authentication.

**Impact**: Cross-site request forgery (CSRF) via cross-origin requests from malicious websites. An attacker could craft a page that transfers stock between sections or creates purchase orders if a bakery employee visits it while logged in.

**Recommendation**: Replace the wildcard CORS with the shared CORS utility and add session validation:
```typescript
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { requireSession } from '../_shared/session-auth.ts';

// And add:
const session = await requireSession(req);
if (session instanceof Response) return session;
```

---

### SEC-CORS-02 [MINEUR] Development Localhost Wildcard in Shared CORS

**File**: `supabase/functions/_shared/cors.ts:26`

```typescript
if (requestOrigin.startsWith('http://localhost:') || requestOrigin.startsWith('http://127.0.0.1:')) {
  return requestOrigin;
}
```

**Description**: Any `localhost` or `127.0.0.1` origin on any port is allowed. This is acceptable for development but should be disabled or configurable for production deployments.

**Impact**: Low. In production, an attacker would need local access to the user's machine to exploit this.

**Recommendation**: Add an environment variable check:
```typescript
const isDevelopment = Deno.env.get('ENVIRONMENT') !== 'production';
if (isDevelopment && (requestOrigin.startsWith('http://localhost:') || ...)) {
  return requestOrigin;
}
```

---

### SEC-INJ-01 [MINEUR] No SQL Injection Vectors Found

**Description**: The audit found no string concatenation in SQL queries. All database operations use the Supabase client library's parameterized query builder (`.eq()`, `.in()`, `.rpc()`, etc.) which prevents SQL injection. Edge Functions also use the Supabase client rather than raw SQL.

The stock transfer function (`intersection_stock_movements/index.ts`) performs a read-then-write pattern (TOCTOU) that could cause race conditions under concurrent access, but this is a data integrity issue, not a security vulnerability.

**Impact**: None -- this is a positive finding.

---

## 5. Service Worker & PWA

### SEC-SW-01 [MAJEUR] Auth-Related Supabase REST Endpoints Excluded, But Edge Functions Not Excluded

**File**: `vite.config.js:93-96`

```javascript
// SECURITY: Never cache auth-related endpoints (QUAL-08)
{
  urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/(user_profiles|roles|permissions|...).*/i,
  handler: 'NetworkOnly',
},
```

**Description**: The `NetworkOnly` exclusion correctly covers REST API calls to auth-related tables. However, Supabase Edge Functions are accessed at `/functions/v1/*`, not `/rest/v1/*`. The Edge Functions for authentication (`auth-verify-pin`, `auth-get-session`, `auth-logout`, `auth-change-pin`) are not explicitly excluded from caching.

The general Supabase API cache rule (line 98-113) matches `/rest/v1/` only, so Edge Functions at `/functions/v1/` are not cached by that rule either. They will fall through to the default Workbox behavior (no caching for non-matched URLs), which should be NetworkOnly/passthrough.

**Impact**: Low. Edge Function responses are likely not cached because they do not match any `runtimeCaching` pattern. However, the security intent would be clearer with an explicit exclusion.

**Recommendation**: Add an explicit `NetworkOnly` rule for Edge Functions:
```javascript
{
  urlPattern: /^https:\/\/.*\.supabase\.co\/functions\/v1\/auth-.*/i,
  handler: 'NetworkOnly',
},
```

---

### SEC-SW-02 [MINEUR] Supabase API Cache May Cache Sensitive Business Data

**File**: `vite.config.js:98-113`

```javascript
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

**Description**: All Supabase REST API responses not matching the auth exclusion are cached with a `NetworkFirst` strategy. This includes potentially sensitive data: `orders`, `b2b_orders` (with customer details), `customers` (PII), `audit_logs`, `settings` (including SMTP password), etc. Cached data persists for 24 hours and survives browser closures.

**Impact**: If a shared POS terminal is used, cached API data from a previous user's session could be accessible through the Service Worker cache. The `sessionStorage`-based auth state is cleared on tab close, but the SW cache persists.

**Recommendation**: Add more tables to the `NetworkOnly` exclusion list:
```javascript
// SECURITY: Sensitive tables - never cache
urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/(user_profiles|roles|permissions|...|settings|audit_logs|customers|b2b_orders).*/i,
handler: 'NetworkOnly',
```

---

## 6. Edge Functions Security

### SEC-EF-01 [MAJEUR] Two Legacy Edge Functions Lack Session Authentication

**Files**:
- `supabase/functions/intersection_stock_movements/index.ts` -- No `requireSession()` or `validateSessionToken()`
- `supabase/functions/purchase_order_module/index.ts` -- No `requireSession()` or `validateSessionToken()`

**Description**: These two Edge Functions rely solely on the Supabase JWT (`Authorization` header) for authentication. They do not validate the application-level session token (`x-session-token`). All other Edge Functions (auth-change-pin, auth-user-management, claude-proxy, send-to-printer, calculate-daily-report, generate-invoice, send-test-email) properly use `requireSession()`.

Combined with the wildcard CORS (SEC-CORS-01), these functions are the most exposed endpoints in the system.

**Impact**: These functions can be called by any client with a valid Supabase JWT, without requiring an active application session. If a user's JWT is compromised (e.g., from browser storage), the attacker can perform stock transfers and purchase order operations even after the user has logged out from the application.

**Recommendation**: Add session validation:
```typescript
import { requireSession } from '../_shared/session-auth.ts';

// At the start of the handler:
const session = await requireSession(req);
if (session instanceof Response) return session;
```

---

### SEC-EF-02 [MINEUR] Stock Transfer Race Condition (TOCTOU)

**File**: `supabase/functions/intersection_stock_movements/index.ts:64-93`

```typescript
// Check stock first
const { data: prod } = await supabase.from('products').select('current_stock')...
if (!prod || prod.current_stock < quantity) throw new Error("Insufficient warehouse stock")
// Then update
const { error: upError } = await supabase.from('products')
  .update({ current_stock: prod.current_stock - quantity })...
```

**Description**: The stock check and update are separate operations, creating a Time-Of-Check-Time-Of-Use (TOCTOU) race condition. Two concurrent transfer requests could both pass the stock check, resulting in negative stock.

**Impact**: Data integrity issue -- stock could go negative. Not a direct security vulnerability but could enable fraud (ordering more stock than available).

**Recommendation**: Use a database-level atomic operation:
```sql
UPDATE products SET current_stock = current_stock - $qty
WHERE id = $id AND current_stock >= $qty
RETURNING current_stock;
```

---

## 7. Print Server

### SEC-PRINT-01 [MINEUR] Print Server API Key Auth Disabled Without PRINT_API_KEY

**File**: `print-server/src/index.js:34-46`

```javascript
const apiKeyAuth = (req, res, next) => {
    if (req.path === '/health' || req.path === '/') return next();
    const apiKey = req.headers['x-api-key'];
    if (!process.env.PRINT_API_KEY) {
        // If no API key configured, allow all (development mode)
        return next();
    }
    if (apiKey !== process.env.PRINT_API_KEY) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    next();
};
```

**Description**: When `PRINT_API_KEY` environment variable is not set, all requests to the print server are allowed without authentication. This is a secure-by-default violation.

**Impact**: In development or if the env var is forgotten in production, anyone on the LAN can send print jobs, open the cash drawer, and enumerate printer configurations. The print server binds to `0.0.0.0` (line 122-123), making it accessible to the entire network.

**Recommendation**: Fail closed when no API key is configured:
```javascript
if (!process.env.PRINT_API_KEY) {
    console.warn('WARNING: PRINT_API_KEY not set! Print server refusing all requests.');
    return res.status(500).json({ error: 'Server misconfigured: API key required' });
}
```

---

### SEC-PRINT-02 [MINEUR] Print Server Edge Function Does Not Send API Key

**File**: `supabase/functions/send-to-printer/index.ts:234`

```typescript
const printResponse = await fetch(`${printServerUrl}/print`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ... }),
});
```

**Description**: The Edge Function `send-to-printer` sends print jobs to the local print server without including the `x-api-key` header. This means the print server's API key authentication (if configured) would reject requests from the Edge Function.

**Impact**: If `PRINT_API_KEY` is set on the print server, the Edge Function's print requests will fail with 401. This suggests the feature may only work in development mode (no API key).

**Recommendation**: Add the API key:
```typescript
headers: {
    'Content-Type': 'application/json',
    'x-api-key': Deno.env.get('PRINT_API_KEY') || '',
},
```

---

## 8. Additional Findings

### SEC-ADD-01 [MINEUR] No Content-Security-Policy (CSP) Header

**Description**: The application does not set a `Content-Security-Policy` header. The Edge Functions set `X-Content-Type-Options`, `X-Frame-Options`, and `X-XSS-Protection` in `_shared/cors.ts`, but CSP is not configured. The Vite build does not add CSP meta tags.

**Impact**: Without CSP, any XSS vulnerability (like SEC-XSS-01) has unrestricted capabilities -- it can load external scripts, make arbitrary network requests, and exfiltrate data.

**Recommendation**: Add a CSP header via Edge Functions and/or as a meta tag in `index.html`:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co; img-src 'self' data: https:;
```

---

### SEC-ADD-02 [MINEUR] No Rate Limiting on Online Login Endpoint

**File**: `supabase/functions/auth-verify-pin/index.ts`

**Description**: While the database-level `verify_user_pin` RPC implements account lockout after 5 failed attempts (line 104), there is no IP-based rate limiting on the Edge Function itself. An attacker could enumerate user IDs and try PINs against multiple users without being limited per-IP.

The offline rate limiting (`rateLimitService.ts`) is well-implemented with configurable max attempts and cooldown, but this only applies to offline authentication.

**Impact**: Moderate. Account lockout per-user exists, but an attacker could attempt PINs against many users in parallel. With 4-digit PINs and 5 attempts before lockout, there is a 0.05% chance of guessing each user's PIN per lockout cycle.

**Recommendation**: Add IP-based rate limiting at the Edge Function level using a sliding window counter in the database or an external rate limiting service.

---

## Summary

| Severity | Count | Issues |
|----------|-------|--------|
| CRITIQUE | 4 | SEC-AUTH-01 (PIN hash exposed), SEC-AUTHZ-01 (missing page guards), SEC-DATA-01 (SMTP plaintext), SEC-XSS-01 (invoice XSS) |
| MAJEUR | 7 | SEC-AUTH-02 (legacy fallback), SEC-AUTH-03 (session persistence), SEC-AUTHZ-02 (Direct bypass), SEC-AUTHZ-03 (PIN iteration), SEC-CORS-01 (wildcard CORS), SEC-SW-01 (Edge Function cache), SEC-EF-01 (legacy no session) |
| MINEUR | 10 | SEC-AUTH-04, SEC-AUTH-05, SEC-AUTH-06, SEC-AUTHZ-04, SEC-DATA-02, SEC-DATA-03, SEC-DATA-04, SEC-XSS-02 (positive), SEC-INJ-01 (positive), SEC-CORS-02, SEC-EF-02, SEC-PRINT-01, SEC-PRINT-02, SEC-SW-02, SEC-ADD-01, SEC-ADD-02 |

### Priority Fix Order

1. **Immediate** (before next deployment):
   - SEC-AUTH-01: Remove `pin_hash` from MobileLoginPage select
   - SEC-XSS-01: Add HTML escaping in invoice generation
   - SEC-CORS-01 + SEC-EF-01: Fix wildcard CORS and add session auth to legacy Edge Functions

2. **Short-term** (within 1-2 sprints):
   - SEC-AUTHZ-01: Add RouteGuard/PermissionGuard to all back-office pages
   - SEC-DATA-01: Move SMTP password to Supabase Vault or env vars
   - SEC-AUTHZ-02: Remove `*Direct` methods or add RLS enforcement
   - SEC-AUTH-02: Remove or secure legacy login fallback

3. **Medium-term** (within 2-4 sprints):
   - SEC-ADD-01: Implement Content-Security-Policy
   - SEC-ADD-02: Add IP-based rate limiting on auth endpoints
   - SEC-AUTHZ-03: Create dedicated manager PIN verification RPC
   - SEC-SW-02: Refine Service Worker caching for sensitive data
   - Remaining minor issues

---

## Positive Security Findings

The audit also identified several well-implemented security patterns:

1. **PIN hashing**: Server-side bcrypt via `hash_pin` and `verify_user_pin` RPCs -- PINs never stored in plaintext
2. **Session management**: Token-based sessions with 4-hour timeout, automatic invalidation on deactivation
3. **Audit logging**: Comprehensive audit trail for login, logout, user CRUD, PIN changes with IP/UA tracking
4. **CORS**: Shared CORS utility with origin whitelist and security headers (X-Frame-Options: DENY, X-Content-Type-Options: nosniff)
5. **Offline rate limiting**: Persistent rate limits (IndexedDB) surviving page refresh, configurable via settings
6. **No secrets in client code**: ANTHROPIC_API_KEY properly kept server-side; only anon key exposed via VITE_*
7. **No dangerouslySetInnerHTML**: Zero usage across 112+ components
8. **No SQL injection**: All queries use parameterized Supabase client
9. **Production build hardening**: Console stripping, minification, no source maps in production
10. **Session token exclusion from persist**: `sessionToken` is not included in Zustand persist state
