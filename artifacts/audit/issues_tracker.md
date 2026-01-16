# 🐛 BreakeryERP Issues Tracker

## Issue Summary

| Priority | Count | Status |
|----------|-------|--------|
| 🔴 CRITICAL | 3 | Open |
| 🟠 HIGH | 4 | Open |
| 🟡 MEDIUM | 5 | Open |
| 🟢 LOW | 3 | Open |
| **TOTAL** | **15** | - |

---

## 🔴 CRITICAL Issues

### C1: TypeScript Build Fails
**ID**: BUG-001  
**Status**: 🔓 Open  
**Effort**: 2-4 hours

**Description**: The project cannot be built due to 12 TypeScript errors related to Supabase type definitions.

**Affected Files**:
- `src/pages/inventory/ProductDetailPage.tsx` (Lines 847, 873)
- `src/pages/inventory/StockOpnameForm.tsx` (Lines 87, 139, 161)
- `src/pages/inventory/StockOpnameList.tsx` (Lines 4, 36, 45)
- `src/pages/reports/SalesReportsPage.tsx` (Line 29)
- `src/services/ReportingService.ts` (Lines 22, 40)

**Error Examples**:
```
Argument of type '{ product_id: string; unit_name: string; ... }' is not assignable to parameter of type 'never'.
```

**Root Cause**: 
- `product_uoms` table not typed in database types
- `inventory_counts` table not typed
- `inventory_count_items` table not typed
- RPC functions not properly typed

**Solution**:
1. Regenerate types: `npx supabase gen types typescript --project-id dzlkcuekwybgvrzutzbb > src/types/supabase.ts`
2. Or manually add missing types to `src/types/database.ts`

---

### C2: Massive Mock Data File
**ID**: BUG-002  
**Status**: 🔓 Open  
**Effort**: 1-2 hours

**Description**: `useProducts.ts` is 84KB (~2,975 lines) containing hardcoded product data.

**File**: `src/hooks/useProducts.ts`

**Problems**:
- Increases bundle size unnecessarily
- Mock data mixed with production code
- Hard to maintain
- Could expose test/demo data in production

**Solution**:
1. Extract `MOCK_PRODUCTS` to `src/data/mockProducts.json`
2. Only import in development: `import.meta.env.DEV`
3. Or create a separate `useMockProducts.ts` hook

---

### C3: Duplicate Route Definition
**ID**: BUG-003  
**Status**: 🔓 Open  
**Effort**: 5 minutes

**Description**: `/purchases` route is defined twice.

**File**: `src/App.tsx`

**Lines**:
```tsx
72: <Route path="/purchases" element={<PurchasesPage />} />
73: <Route path="/purchases" element={<PurchasesPage />} />
```

**Solution**: Delete line 73.

---

## 🟠 HIGH Priority Issues

### H1: Hardcoded French Strings in Login
**ID**: BUG-004  
**Status**: 🔓 Open  
**Effort**: 1 hour

**File**: `src/pages/auth/LoginPage.tsx`

**Strings to translate**:
- Line 69: `"Veuillez sélectionner un utilisateur"`
- Line 73: `"Code PIN trop court"`
- Line 85: `"Utilisateur non trouvé"`
- Line 91: `"Code PIN incorrect"`
- Line 48: `"Mode démo activé (base de données inaccessible)"`
- Line 95: Template string with `Bienvenue, ${user.name}!`
- Line 121: `"Sélectionnez votre profil"`
- Line 129: `"-- Choisir --"`
- Line 140: `"Code PIN"`
- Line 172: `"Connexion..."`
- Line 172: `"Se connecter"`
- Line 177: Demo hint in French

**Solution**:
1. Add keys to `en.json` and `fr.json`
2. Use `useTranslation` hook

---

### H2: Plain Text PIN Storage
**ID**: SEC-001  
**Status**: 🔓 Open  
**Effort**: 4-8 hours

**Table**: `user_profiles.pin_code`

**Problem**: PINs are stored as plain VARCHAR, visible to anyone with database access.

**Solution**:
1. Hash PINs with bcrypt on create/update
2. Compare with `bcrypt.compare()` on login
3. Create migration to update existing PINs
4. Update `handleLogin()` function

---

### H3: Exposed Supabase Key in Repo
**ID**: SEC-002  
**Status**: 🔓 Open  
**Effort**: 30 minutes

**File**: `.env`

**Note**: The anon key is designed to be public, but `.env` should be gitignored and documented.

**Solution**:
1. Ensure `.env` is in `.gitignore`
2. Create `.env.example` with placeholder values
3. Document in README

---

### H4: No Input Validation
**ID**: SEC-003  
**Status**: 🔓 Open  
**Effort**: 8-16 hours

**Affected Areas**:
- Stock adjustment quantities (can be negative/zero)
- Production quantities
- Notes fields (XSS potential)
- Customer/Supplier data

**Solution**:
1. Install Zod: `npm install zod`
2. Create validation schemas
3. Validate before Supabase operations

---

## 🟡 MEDIUM Priority Issues

### M1: Inconsistent Error Handling
**ID**: QA-001  
**Status**: 🔓 Open  
**Effort**: 4-8 hours

**Pattern Found**:
```tsx
catch (err) {
    console.error('Error:', err)
    // User sees nothing!
}
```

**Files Affected**: Multiple hooks and pages

**Solution**:
1. Create error toast helper
2. Use consistent `toast.error()` pattern
3. Add error boundaries

---

### M2: Missing Loading States
**ID**: UX-001  
**Status**: 🔓 Open  
**Effort**: 4-8 hours

**Problem**: Data loads without visual feedback.

**Affected Pages**:
- Inventory list
- Order history
- Reports

**Solution**:
1. Add skeleton loaders
2. Use Suspense for lazy components
3. Show loading spinners

---

### M3: Unused Imports
**ID**: QA-002  
**Status**: 🔓 Open  
**Effort**: 30 minutes

**Files**:
- `StockOpnameList.tsx`: `FileText` unused
- `SalesReportsPage.tsx`: `setDateRange` unused

**Solution**: Remove unused imports or use them.

---

### M4: No Pagination
**ID**: PERF-001  
**Status**: 🔓 Open  
**Effort**: 8-16 hours

**Problem**: All data loaded at once.

**Affected**:
- Inventory table
- Order history
- Audit logs

**Solution**:
1. Implement cursor-based pagination
2. Or use React Query's `useInfiniteQuery`

---

### M5: Legacy HTML Files
**ID**: TECH-001  
**Status**: 🔓 Open  
**Effort**: 2-4 hours

**Files**:
- `costing.html`
- `stock.html`
- `kds.html`
- `js/app.js`, `js/stock.js`, `js/product-data.js`

**Question**: Are these still in use?

**Solution**:
1. Review if used
2. If yes, migrate to React
3. If no, delete or archive

---

## 🟢 LOW Priority Issues

### L1: Console Logs in Code
**ID**: QA-003  
**Status**: 🔓 Open  
**Effort**: 1-2 hours

**Problem**: `console.log`, `console.warn`, `console.error` throughout code.

**Solution**:
1. Remove unnecessary logs
2. Or use a logging library with levels
3. Consider ESLint rule `no-console`

---

### L2: Inline Styles
**ID**: STYLE-001  
**Status**: 🔓 Open  
**Effort**: 1-2 hours

**Problem**: Some components use inline `style={{}}` props.

**Solution**: Move to CSS classes.

---

### L3: Magic Numbers
**ID**: QA-004  
**Status**: 🔓 Open  
**Effort**: 1 hour

**Examples**:
- Tax rate: `0.11` hardcoded
- PIN length: `4` and `6` hardcoded
- Timeout values

**Solution**: Create constants file or use app settings.

---

## Closed Issues

*None yet*

---

*Last Updated: January 16, 2026*
