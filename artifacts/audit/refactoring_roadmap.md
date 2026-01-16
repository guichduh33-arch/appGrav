# 🔧 BreakeryERP Refactoring Roadmap

## Overview

This document outlines the recommended refactoring plan for the BreakeryERP project, organized into phases with clear priorities and effort estimates.

---

## Phase 1: Critical Fixes (Week 1)

### 1.1 Fix TypeScript Build Errors ⚡
**Priority**: P0 - Blocking  
**Effort**: 2-4 hours  
**Owner**: TBD

**Tasks**:
- [ ] Update `src/types/database.ts` to include:
  - `product_uoms` table type
  - `inventory_counts` table type
  - `inventory_count_items` table type
  - RPC function types for `get_sales_comparison`, `get_reporting_dashboard_summary`, `finalize_inventory_count`

**Files to Modify**:
```
src/types/database.ts
```

**Example Fix**:
```typescript
// Add to Database['public']['Functions']
finalize_inventory_count: {
    Args: {
        count_uuid: string
        user_uuid: string
    }
    Returns: void
}
```

---

### 1.2 Remove Duplicate Route
**Priority**: P0  
**Effort**: 5 minutes

**File**: `src/App.tsx`

**Action**: Delete line 73

---

### 1.3 Extract Mock Data
**Priority**: P1  
**Effort**: 2 hours

**Current File**: `src/hooks/useProducts.ts` (84KB)

**Actions**:
- [ ] Create `src/data/mockProducts.ts`
- [ ] Move `MOCK_PRODUCTS` array
- [ ] Move `MOCK_CATEGORIES` array
- [ ] Update imports in `useProducts.ts`
- [ ] Add environment check

```typescript
// src/hooks/useProducts.ts
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../data/mockProducts'

// Only use mock data in development
const useMockData = import.meta.env.DEV && !supabaseAvailable
```

---

## Phase 2: Security Fixes (Week 2)

### 2.1 Hash PIN Codes
**Priority**: P0 - Security  
**Effort**: 4-8 hours

**Tasks**:
- [ ] Install bcrypt: `npm install bcryptjs @types/bcryptjs`
- [ ] Create `src/utils/crypto.ts` with hash/compare functions
- [ ] Update login flow to compare hashed PINs
- [ ] Create migration to hash existing PINs

**New File**: `src/utils/crypto.ts`
```typescript
import bcrypt from 'bcryptjs'

export async function hashPin(pin: string): Promise<string> {
    return bcrypt.hash(pin, 10)
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
    return bcrypt.compare(pin, hash)
}
```

**Migration SQL**:
```sql
-- Note: This needs to be done carefully with existing users
-- 1. Add new column
ALTER TABLE user_profiles ADD COLUMN pin_hash VARCHAR(60);

-- 2. Migrate with application code (can't hash in SQL easily)
-- 3. Drop old column after verification
```

---

### 2.2 Input Validation
**Priority**: P1  
**Effort**: 8-16 hours

**Tasks**:
- [ ] Install Zod: `npm install zod`
- [ ] Create validation schemas in `src/schemas/`
- [ ] Validate all Supabase inserts/updates
- [ ] Sanitize text inputs

**New Files**:
```
src/schemas/
├── product.ts
├── order.ts
├── stockMovement.ts
├── customer.ts
└── index.ts
```

**Example Schema**:
```typescript
// src/schemas/stockMovement.ts
import { z } from 'zod'

export const stockAdjustmentSchema = z.object({
    productId: z.string().uuid(),
    type: z.enum(['purchase', 'waste', 'adjustment_in', 'adjustment_out']),
    quantity: z.number().positive(),
    reason: z.string().min(1).max(500),
    notes: z.string().max(1000).optional()
})
```

---

### 2.3 Environment File Security
**Priority**: P1  
**Effort**: 30 minutes

**Tasks**:
- [ ] Verify `.env` is in `.gitignore`
- [ ] Create `.env.example` with placeholders
- [ ] Update README with setup instructions

---

## Phase 3: i18n Completion (Week 2-3)

### 3.1 Internationalize Login Page
**Priority**: P1  
**Effort**: 1-2 hours

**File**: `src/pages/auth/LoginPage.tsx`

**New Translation Keys** (add to en.json and fr.json):
```json
{
  "login": {
    "select_user_error": "Please select a user",
    "pin_too_short": "PIN too short",
    "user_not_found": "User not found",
    "pin_incorrect": "Incorrect PIN",
    "demo_mode_activated": "Demo mode activated (database inaccessible)",
    "welcome": "Welcome, {{name}}!",
    "select_profile": "Select your profile",
    "choose": "-- Choose --",
    "pin_code": "PIN Code",
    "connecting": "Connecting...",
    "sign_in": "Sign in",
    "demo_hint": "💡 Demo: PIN for all users = their displayed code"
  }
}
```

---

### 3.2 Add Missing Error Message Translations
**Priority**: P2  
**Effort**: 2 hours

**Files to Check**:
- `useOrders.ts` - "Utilisateur non connecté"
- `useInventory.ts` - Error messages
- Various toast messages

---

## Phase 4: Quality Improvements (Week 3-4)

### 4.1 Add Error Boundaries
**Priority**: P1  
**Effort**: 4-8 hours

**New Files**:
```
src/components/common/ErrorBoundary.tsx
src/components/common/GenericError.tsx
```

**Implementation**:
```typescript
// src/components/common/ErrorBoundary.tsx
import { Component, ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error Boundary caught:', error, errorInfo)
        // Could log to external service
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || <GenericError error={this.state.error} />
        }
        return this.props.children
    }
}
```

---

### 4.2 Implement Loading States
**Priority**: P2  
**Effort**: 4-8 hours

**Create Skeleton Components**:
```
src/components/ui/Skeleton.tsx
src/components/ui/TableSkeleton.tsx
src/components/ui/CardSkeleton.tsx
```

**Update Pages**:
- Inventory list
- Order history
- Reports

---

### 4.3 Remove Unused Imports
**Priority**: P3  
**Effort**: 30 minutes

**Files**:
- `StockOpnameList.tsx` - Remove `FileText`
- `SalesReportsPage.tsx` - Remove or use `setDateRange`

---

### 4.4 Standardize Error Handling
**Priority**: P2  
**Effort**: 4-8 hours

**Create Error Helper**:
```typescript
// src/utils/toast.ts
import toast from 'react-hot-toast'

export function showError(message: string, error?: Error) {
    console.error(message, error)
    toast.error(message)
}

export function showSuccess(message: string) {
    toast.success(message)
}
```

---

## Phase 5: Feature Connection (Week 4-6)

### 5.1 Connect Orders Page to Database
**Priority**: P1  
**Effort**: 8-16 hours

**Tasks**:
- [ ] Create `useOrderHistory` hook
- [ ] Query `orders` and `order_items` tables
- [ ] Implement real filtering
- [ ] Add pagination

---

### 5.2 Connect B2B Page to Database
**Priority**: P2  
**Effort**: 8-16 hours

**Tasks**:
- [ ] Create `useB2BCustomers` hook
- [ ] Create `useB2BOrders` hook
- [ ] Connect client list
- [ ] Connect order list
- [ ] Add create/edit forms

---

### 5.3 Connect Purchases Page to Database
**Priority**: P2  
**Effort**: 8-16 hours

**Tasks**:
- [ ] Create `useSuppliers` hook
- [ ] Create `usePurchaseOrders` hook
- [ ] Connect supplier list
- [ ] Connect PO list
- [ ] Add create/receive workflow

---

### 5.4 Connect Settings to Database
**Priority**: P3  
**Effort**: 4-8 hours

**Tasks**:
- [ ] Create `useAppSettings` hook
- [ ] Load settings on mount
- [ ] Save settings on submit
- [ ] Handle printer configuration

---

## Phase 6: KDS Implementation (Week 6-8)

### 6.1 Real-time Order Display
**Priority**: P1  
**Effort**: 16-24 hours

**Tasks**:
- [ ] Set up Supabase Realtime subscription
- [ ] Create `useKDSOrders` hook
- [ ] Display orders by station
- [ ] Implement color-coding by time

---

### 6.2 Bump Functionality
**Priority**: P1  
**Effort**: 8-16 hours

**Tasks**:
- [ ] Add "Start" button (new → preparing)
- [ ] Add "Ready" button (preparing → ready)
- [ ] Add "Served" button (ready → served)
- [ ] Update `order_items` status

---

### 6.3 Timer Tracking
**Priority**: P2  
**Effort**: 4-8 hours

**Tasks**:
- [ ] Calculate time since order placed
- [ ] Color code: Green (< 5min), Yellow (5-10min), Red (> 10min)
- [ ] Show elapsed time on each order

---

## Phase 7: Testing (Ongoing)

### 7.1 Unit Tests Setup
**Priority**: P1  
**Effort**: 8-16 hours

**Tasks**:
- [ ] Install Vitest: `npm install -D vitest @testing-library/react @testing-library/jest-dom`
- [ ] Configure `vitest.config.ts`
- [ ] Create test utilities
- [ ] Add example tests

---

### 7.2 Component Tests
**Priority**: P2  
**Effort**: 24-40 hours

**Priority Components**:
- [ ] Cart.tsx
- [ ] ProductGrid.tsx
- [ ] PaymentModal.tsx
- [ ] InventoryTable.tsx

---

### 7.3 Integration Tests
**Priority**: P3  
**Effort**: 16-24 hours

**Priority Flows**:
- [ ] Login flow
- [ ] Order creation flow
- [ ] Payment flow
- [ ] Stock adjustment flow

---

## Phase 8: Performance & Polish (Week 8+)

### 8.1 Code Splitting
**Priority**: P2  
**Effort**: 4-8 hours

**Tasks**:
- [ ] Lazy load route components
- [ ] Add Suspense boundaries
- [ ] Measure bundle size improvement

```typescript
// src/App.tsx
const POSMainPage = lazy(() => import('./pages/pos/POSMainPage'))
const KDSMainPage = lazy(() => import('./pages/kds/KDSMainPage'))
```

---

### 8.2 Pagination
**Priority**: P2  
**Effort**: 8-16 hours

**Affected Components**:
- Inventory table
- Order history
- Audit logs

---

### 8.3 Remove Legacy Code
**Priority**: P3  
**Effort**: 2-4 hours

**Candidates for Removal**:
- `costing.html` (if migrated to React)
- `stock.html` (if migrated to React)
- `kds.html` (if migrated to React)
- Legacy JS files

---

### 8.4 Documentation
**Priority**: P3  
**Effort**: 16-24 hours

**Tasks**:
- [ ] Update README with full setup guide
- [ ] Document API endpoints
- [ ] Document component props
- [ ] Add JSDoc comments to hooks

---

## Summary Timeline

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1 | Week 1 | Build working, mock data extracted |
| Phase 2 | Week 2 | Security improvements |
| Phase 3 | Week 2-3 | Full i18n coverage |
| Phase 4 | Week 3-4 | Error handling, loading states |
| Phase 5 | Week 4-6 | All pages connected to DB |
| Phase 6 | Week 6-8 | Full KDS implementation |
| Phase 7 | Ongoing | Test coverage building |
| Phase 8 | Week 8+ | Performance optimization |

---

*Last Updated: January 16, 2026*
