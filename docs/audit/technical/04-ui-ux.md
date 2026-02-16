# Audit 04 - UI/UX & Design System

**Project**: AppGrav (The Breakery ERP/POS)
**Date**: 2026-02-10
**Auditor**: Agent 4 - UI/UX & Design System
**Scope**: All UI components, pages, styles, navigation, responsiveness, accessibility, performance, and i18n compliance

---

## Executive Summary

AppGrav has a well-structured design system with an artisan-themed color palette (bakery gold, cream, parchment tones). The application uses a dual architecture: a dark-themed fullscreen POS and a light-themed back-office with sidebar navigation. While the design foundation is solid, several critical issues were found:

1. **Massive French text remnants** across 50+ files despite i18n suspension
2. **Dual button/card systems** (custom CSS `.btn` classes vs shadcn/ui `<Button>`) causing inconsistency
3. **No React.memo usage anywhere** despite many list/grid components
4. **No list virtualization** for long tables (orders, products, reports)
5. **Over 80 custom CSS files** duplicating what Tailwind already provides
6. **202+ inline style occurrences** bypassing the design system

**Critical issues**: 8
**Major issues**: 19
**Minor issues**: 15

---

## 1. Design System & Components

### 1.1 Available shadcn/ui Components

The following shadcn/ui components exist in `src/components/ui/`:

| Component | File | Status |
|-----------|------|--------|
| Button | `button.tsx` | Available but rarely used |
| Card | `Card.tsx` | Available but rarely used |
| Input | `Input.tsx` | Custom (NOT shadcn standard) |
| Dialog | `dialog.tsx` | Available |
| Select | `select.tsx` | Available |
| Tabs | `tabs.tsx` | Available but unused |
| Toast | `toast.tsx` | Available (Radix-based) |
| Toaster | `toaster.tsx` | Available |
| Sonner | `sonner.tsx` | Primary toast (used app-wide) |
| Badge | `badge.tsx` | Available |
| Sheet | `sheet.tsx` | Available |
| ScrollArea | `scroll-area.tsx` | Available |
| Separator | `separator.tsx` | Available |
| Tooltip | `tooltip.tsx` | Available |
| AlertDialog | `alert-dialog.tsx` | Available |

**Application also has custom non-shadcn components in `/ui/`:**
- `NetworkIndicator.tsx`
- `OfflineSessionIndicator.tsx`
- `SyncIndicator.tsx`
- `ErrorBoundary.tsx`

### 1.2 Dual Component Systems (CRITICAL)

- **Severity**: Critical
- **Zone**: Application-wide
- **Files**: `src/styles/index.css` (lines 358-460), `src/components/ui/button.tsx`
- **Description**: The application maintains TWO parallel button systems:
  1. **CSS classes** (`.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.btn-lg`, `.btn-icon`) defined in `index.css` - used in ~90% of the application
  2. **shadcn/ui `<Button>`** component with variants (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`) - used in only ~6 files

  Similarly for cards:
  1. CSS `.card`, `.card-header`, `.card-body`, `.card-footer` in `index.css`
  2. shadcn `<Card>`, `<CardHeader>`, `<CardContent>`, `<CardFooter>` in `Card.tsx`

  And for inputs:
  1. Global CSS `input`, `.input` styles in `index.css`
  2. Custom `<Input>` component in `Input.tsx` (not standard shadcn, uses `className="input"`)

- **Recommendation**: Standardize on ONE system. Since shadcn is already installed, migrate all `.btn-*` CSS classes to `<Button variant="..." size="...">` usage. Remove duplicate CSS definitions. Update `Input.tsx` to match shadcn/ui conventions.

### 1.3 File Naming Inconsistency

- **Severity**: Major
- **Zone**: `src/components/ui/`
- **Files**: `Card.tsx`, `Input.tsx` (PascalCase) vs `button.tsx`, `badge.tsx`, `dialog.tsx` (lowercase)
- **Description**: shadcn/ui files should be lowercase. Two files (`Card.tsx`, `Input.tsx`) use PascalCase which can cause TypeScript casing errors on case-sensitive builds (TS1261, documented in MEMORY.md).
- **Recommendation**: Rename `Card.tsx` to `card.tsx` and `Input.tsx` to `input.tsx`. Update all imports.

### 1.4 Excessive Inline Styles

- **Severity**: Major
- **Zone**: Application-wide, especially POS modals and inventory pages
- **Files**: 30+ files with inline `style={}`, total 202+ occurrences
- **Top offenders**:
  - `src/pages/inventory/tabs/VariantsTab.tsx` (51 occurrences)
  - `src/pages/inventory/tabs/UnitsTab.tsx` (53 occurrences)
  - `src/components/pos/modals/CashierAnalyticsModal.tsx` (10 occurrences)
  - `src/components/pos/modals/CustomerSearchModal.tsx` (9 occurrences)
  - `src/components/pos/Cart.tsx` (6 occurrences, notably inline `fontSize: '10px'`, `color: '#3b82f6'`)
- **Description**: Inline styles bypass the design system, are not responsive, cannot be themed, and are harder to maintain. The `Cart.tsx` component has particularly egregious inline styling for the loyalty points button.
- **Recommendation**: Extract all inline styles to Tailwind utility classes or CSS custom properties. Use the design system's color tokens instead of hardcoded hex values.

### 1.5 Color System Inconsistency

- **Severity**: Major
- **Zone**: Application-wide
- **Files**: Multiple report tabs, skeletons, overview components
- **Description**: The tailwind config defines a rich artisan color palette (`flour`, `cream`, `kraft`, `parchment`, `gold`, etc.) plus semantic colors (`success`, `warning`, `danger`, `info`). However, many components bypass this and use raw Tailwind colors:
  - 151+ occurrences of `bg-gray-*`, `bg-blue-*`, `bg-green-*`, `bg-red-*` etc.
  - 169+ occurrences of `text-gray-*`, `text-blue-*`, `text-green-*` etc.
  - Example: `ReportSkeleton.tsx` uses `bg-gray-200`, `border-gray-200`, `bg-gray-50/50` instead of design tokens
  - Example: `OverviewTab.tsx` uses `bg-white`, `border-gray-200`, `text-green-600`, `text-red-600`
  - Example: `ErrorBoundary.tsx` uses `bg-gray-50`, `bg-red-100`, `text-red-600`, `bg-blue-600`
- **Recommendation**: Replace all raw Tailwind color classes with design system tokens: `bg-card` instead of `bg-white`, `border-border` instead of `border-gray-200`, `text-success` instead of `text-green-600`.

---

## 2. Navigation & Information Architecture

### 2.1 Sidebar Navigation

- **Severity**: Minor (Good)
- **Zone**: `src/layouts/BackOfficeLayout.tsx`
- **Description**: The sidebar is well-organized with 3 sections (Operations, Management, Admin) containing 14 nav items. It supports collapsible mode with icon-only view and tooltips. Active state uses gold accent with left border indicator. Network/sync indicators are always visible. The `NavLink` component provides automatic active state highlighting.
- **Positive**: Clean section grouping, visible network status, user profile in footer, collapsible for tablet use.
- **Issue**: No mobile hamburger menu toggle button visible in the layout. The CSS has `.backoffice-sidebar.open` for mobile but there's no trigger button in the JSX to open/close the sidebar on mobile. The sidebar transforms off-screen on `max-width: 768px` but users have no way to re-open it.
- **Recommendation**: Add a hamburger menu button in `backoffice-content` for mobile viewports, and implement the overlay toggle.

### 2.2 No Breadcrumbs in Most Pages

- **Severity**: Major
- **Zone**: All back-office pages
- **Files**: `src/components/reports/ReportBreadcrumb.tsx` exists but is only used in 3 report tabs
- **Description**: A `ReportBreadcrumb` component exists but is only used in `DailySalesTab`, `ProductPerformanceTab`, and `SalesByCategoryTab`. No other pages (inventory, customers, purchasing, B2B, settings, etc.) have breadcrumbs. For a deep navigation structure (e.g., `/inventory/transfers/123/edit`), users have no way to navigate back except the browser button.
- **Recommendation**: Implement breadcrumbs for all back-office pages, especially those with nested routes (inventory detail, transfer detail, purchase order detail, customer detail, product edit, combo edit).

### 2.3 POS Navigation

- **Severity**: Minor (Good)
- **Description**: POS has a clean horizontal category nav with fullscreen layout, hamburger menu (`POSMenu`) for shift management and history access. The category nav provides easy one-tap access to product categories.
- **Positive**: Menu button provides access to shift management, analytics, history.

### 2.4 Settings Navigation Depth

- **Severity**: Minor
- **Zone**: `src/pages/settings/SettingsLayout.tsx`
- **Files**: `SettingsLayout.tsx` (lines 55-63)
- **Description**: Settings uses 20+ tabs in a horizontal scrolling tab bar, which is overwhelming. Tab names still reference `fr`, `en`, `id` locale keys despite i18n being suspended.
- **Recommendation**: Group settings into collapsible sections or use a sidebar sub-navigation for settings. Remove multi-language name objects.

---

## 3. Responsive Design

### 3.1 Minimal Responsive Classes in Pages

- **Severity**: Critical
- **Zone**: Back-office pages
- **Description**: Responsive Tailwind classes (`sm:`, `md:`, `lg:`, `xl:`) are used in only 43 total occurrences across ALL page files. Most pages have 0-2 responsive classes. The report tabs are the primary users (1-3 each). Core pages like `OrdersPage`, `CustomersPage`, `SuppliersPage`, `UsersPage`, `B2BOrdersPage`, etc. have NO responsive classes.
- **Key pages missing responsiveness**:
  - `src/pages/orders/OrdersPage.tsx` - Complex table, no responsive adaptation
  - `src/pages/customers/CustomersPage.tsx` - Grid cards, no responsive breakpoints
  - `src/pages/purchasing/SuppliersPage.tsx` - Table layout, no responsive
  - `src/pages/users/UsersPage.tsx` - 1 responsive class
  - `src/pages/b2b/B2BOrdersPage.tsx` - No responsive
  - All inventory pages - Rely on CSS files for responsive
- **Recommendation**: Since tablets (Android) are the primary target, audit every page for tablet portrait (768px) and landscape (1024px) breakpoints. Add responsive grid/table adaptations.

### 3.2 POS Not Tablet-Responsive

- **Severity**: Critical
- **Zone**: POS interface
- **Files**: `src/pages/pos/POSMainPage.css`
- **Description**: The POS layout uses fixed widths:
  - Categories sidebar: `width: 200px` (fixed)
  - Cart panel: `width: 460px` (fixed)
  - No `@media` queries exist in `POSMainPage.css`
  - No responsive breakpoints in `Cart.css`
  - No responsive breakpoints in `ProductGrid.css`

  On a 10" Android tablet in portrait (800px width), the sidebar (200px) + cart (460px) = 660px, leaving only 140px for products. In landscape (1280px), it works but is tight.
- **Recommendation**: Make cart and category sidebar responsive:
  - Portrait: Collapse categories to icon-only or horizontal scroll, reduce cart width
  - Add swipe/toggle between products and cart on small tablets
  - Use `clamp()` or percentage-based widths

### 3.3 CSS-Based Responsive vs Tailwind

- **Severity**: Major
- **Zone**: Application-wide
- **Files**: 80+ custom CSS files
- **Description**: Most responsive behavior is in custom CSS files (e.g., `BackOfficeLayout.css` has `@media (max-width: 768px)`), while Tailwind responsive classes are rarely used. This creates a split responsive system that's hard to maintain.
- **Recommendation**: Migrate CSS media queries to Tailwind responsive classes where possible.

---

## 4. Accessibility & POS Ergonomics

### 4.1 Touch Target Sizes

- **Severity**: Minor (Good in CSS, issues in practice)
- **Zone**: `src/styles/index.css` (lines 1428-1450)
- **Description**: The global CSS includes a `@media (pointer: coarse)` rule that sets `min-height: 44px; min-width: 44px` for buttons, inputs, and selects. This is good practice. However:
  - The shadcn `<Button>` default size is `h-9` (36px) which is below 44px
  - The shadcn `<Button>` icon size is `h-9 w-9` (36px) which is below 44px
  - Many custom modal buttons and inline buttons don't inherit the `.btn` class
  - The `.modal-close` button is only `32px x 32px` (line 992-993 of index.css)
  - `.toggle-btn` in sidebar is only `32px x 32px`
  - Loyalty "Use pts" button in `Cart.tsx` has `fontSize: '10px'` and `padding: '2px 4px'` - far too small for touch
- **Recommendation**: Audit all interactive elements for minimum 44x44px touch targets. Increase `.modal-close`, `.toggle-btn`, and small inline buttons.

### 4.2 ARIA Labels & Roles

- **Severity**: Major
- **Zone**: Application-wide
- **Description**: 150 `aria-label` / `aria-describedby` / `role=` attributes found across 54 files. This is moderate coverage but many interactive elements lack ARIA:
  - POS product grid buttons have no `aria-label` - screen reader would read the entire card content
  - Cart item quantity +/- buttons have no labels
  - Order type selector buttons have no `role="radio"` or `aria-pressed`
  - Tab navigation in InventoryLayout and ProductsLayout uses `<button>` without `role="tab"` / `role="tablist"`
  - No skip-link implementation in rendered HTML (`.skip-link` class exists in CSS but no element uses it)
- **Recommendation**: Add ARIA labels to all icon-only buttons, implement proper tab roles, add skip-link to main layout.

### 4.3 Loading States & Feedback

- **Severity**: Minor (Good)
- **Zone**: Application-wide
- **Description**:
  - **Toasts**: Consistent use of `sonner` toast library (100+ usages) for success, error, warning, info
  - **Loading states**: 243 occurrences of disabled buttons during loading
  - **Skeleton screens**: Good `ReportSkeleton` system used across all 20+ report tabs
  - **POS skeletons**: Product grid and combo grid have skeleton loading states
  - **Spinner**: Global `.spinner` class in `index.css`
  - **Error Boundary**: Global `ErrorBoundary` with retry/home buttons
- **Positive**: Good coverage of loading/error states across the application.

### 4.4 Empty States

- **Severity**: Minor
- **Zone**: Application-wide
- **Description**: 67 occurrences of empty state handling found across 41 files. Most pages handle the "no data" case. Examples:
  - Cart: "Your cart is empty. Select products." with shopping cart icon
  - Product grid: "No items found" with search icon
  - However, some empty states use emojis in production code (shopping cart emoji in Cart, search emoji in ProductGrid)
- **Recommendation**: Replace emoji-based empty states with proper Lucide icons for consistency with the rest of the design system.

---

## 5. Rendering Performance

### 5.1 Zero React.memo Usage

- **Severity**: Critical
- **Zone**: All components
- **Description**: **Not a single `React.memo` call** found anywhere in the codebase. Key components that would benefit:
  - `ProductGrid` - Re-renders all product cards when any product is clicked
  - `CartItemRow` - Re-renders all cart items when any item changes
  - `CategoryNav` - Re-renders all category buttons on any state change
  - `KDSOrderCard` - Re-renders all order cards in the kitchen display
  - All report KPI cards, chart components
  - `NavLink` items in sidebar
- **Recommendation**: Add `React.memo` to:
  1. List item components (CartItemRow, product cards, order cards)
  2. Expensive sub-components (charts, KPI cards)
  3. Stable components that receive primitive props

### 5.2 useCallback/useMemo Usage

- **Severity**: Minor (Partially good)
- **Zone**: Application-wide
- **Description**: 130 total occurrences of `useCallback`/`useMemo` across 30 files. The POS page (`POSMainPage.tsx`) has good memoization for handlers. However, many pages with complex lists (Orders, Customers, Inventory) lack memoization for filter/sort callbacks.
- **Recommendation**: Add memoization to filter/sort functions in list pages.

### 5.3 No List Virtualization

- **Severity**: Critical
- **Zone**: All list/table pages
- **Description**: **No virtualization library** is installed or used anywhere in the project. Zero references to `react-window`, `react-virtualized`, or `@tanstack/react-virtual`. Pages rendering potentially large lists:
  - `OrdersPage` - Can have hundreds/thousands of orders
  - `StockMovementsPage` - High-volume stock movement logs
  - `ProductGrid` - 200+ products rendered as buttons
  - `Reports` tables - Can have thousands of rows
  - `AuditPage` - Audit logs can be massive
  - `CustomersPage` - Growing customer list

  All tables use client-side pagination (e.g., `ITEMS_PER_PAGE = 20` in OrdersPage), but the data is still fully rendered in DOM.
- **Recommendation**: Install `@tanstack/react-virtual` and implement windowed rendering for:
  1. Product grid in POS (most impactful)
  2. Order history table
  3. Stock movements table
  4. All report data tables

### 5.4 Lazy Loading

- **Severity**: Minor (Good)
- **Zone**: `src/App.tsx`
- **Description**: Good use of `React.lazy()` for route-based code splitting. All non-critical pages are lazy loaded. Only `LoginPage` and `POSMainPage` are loaded immediately. A `PageLoader` fallback is provided with a spinner.
- **Positive**: Proper code splitting strategy.

---

## 6. i18n / Localization Issues

### 6.1 French Text in UI (CRITICAL)

- **Severity**: Critical
- **Zone**: 50+ files
- **Description**: Despite i18n being suspended and all UI required to be English, extensive French text remains in:

**POS Components:**
| File | French Text |
|------|------------|
| `src/App.tsx:130` | `'Session mise a jour pour compatibilite...'` |
| `src/components/pos/modals/CustomerSearchModal.tsx` | `'Erreur lors de la recherche'`, `'Retirer des favoris'`, `'Ajouter aux favoris'`, `'Rechercher'`, `'Nouveau'`, `'Valider'`, `'Rechercher par nom, telephone...'` |
| `src/components/pos/modals/VariantModal.tsx:311` | `'Ajouter au panier'` |
| `src/components/pos/modals/TransactionHistoryModal.tsx` | `'fr-FR'` locale for time formatting |
| `src/components/pos/modals/TableSelectionModal.tsx:141` | `'Confirmer Table'` |
| `src/components/inventory/RecipeViewerModal.tsx` | `'Fermer'`, `'Erreur lors du chargement de la recette'` |

**Pages:**
| File | French Text |
|------|------------|
| `src/pages/purchasing/SuppliersPage.tsx` | `'Nouveau fournisseur'`, `'Nouveau Fournisseur'`, `'Rechercher un fournisseur...'`, `'Annuler'`, `'Enregistrer'`, `'Supprimer'`, `'Erreur lors de...'` |
| `src/pages/customers/CustomerCategoriesPage.tsx` | `'Erreur lors du chargement'`, `'Supprimer la categorie'`, `'Fermer'`, `'Annuler'`, `'Enregistrement...'`, `'Enregistrer'` |
| `src/pages/customers/CustomerDetailPage.tsx` | `'Erreur lors de la mise a jour'`, `'Ajouter points'`, `'Annuler'` |
| `src/pages/customers/CustomersPage.tsx` | `'Nouveau Client'`, `'Rechercher par nom...'`, `'Ajouter un client'` |
| `src/pages/customers/CustomerFormPage.tsx` | Multiple `'Erreur lors de...'`, `'Modifier le Client'`, `'Nouveau Client'`, `'Supprimer'`, `'Enregistrement...'` |
| `src/pages/b2b/B2BOrderFormPage.tsx` | `'Selectionner un client...'`, `'Selectionner...'`, `'Ajouter'`, `'Rechercher...'`, `'Enregistrer Brouillon'`, `'Confirmer Commande'` |
| `src/pages/b2b/B2BOrderDetailPage.tsx` | `'Erreur lors de...'`, `'Confirmer'`, `'Enregistrer un paiement'`, `'Fermer'`, `'Annuler'` |
| `src/pages/b2b/B2BOrdersPage.tsx` | `'Rechercher par n commande...'` |
| `src/pages/mobile/MobileLoginPage.tsx` | `'Erreur de connexion'`, `'Connexion'` |
| `src/pages/mobile/MobileCatalogPage.tsx` | `'Rechercher un produit...'`, `'Ajouter - Rp...'` |
| `src/pages/mobile/MobileCartPage.tsx` | `'Erreur lors de l envoi...'` |
| `src/pages/display/CustomerDisplayPage.tsx` | `'Connexion en cours...'` |
| `src/pages/users/UsersPage.tsx:238` | `'Erreur'` |
| `src/pages/inventory/StockByLocationPage.tsx` | `'Erreur lors du chargement'` |
| `src/pages/settings/SettingsLayout.tsx` | Multi-language name objects (`fr`, `en`, `id`) |

**Report Components:**
| File | French Text |
|------|------------|
| `src/pages/reports/components/ExpiredStockTab.tsx` | `"Date d'expiration"` |
| `src/pages/reports/components/UnsoldProductsTab.tsx` | `"Derniere vente"`, `"Jamais"` |
| `src/pages/reports/components/SalesByCustomerTab.tsx` | `"Derniere Commande"` |
| `src/pages/reports/components/PriceChangesTab.tsx` | `"Nouveau prix"` |
| `src/pages/reports/components/DiscountsVoidsTab.tsx` | `"Rechercher commande, staff..."` |
| `src/pages/reports/components/PurchaseDetailsTab.tsx` | `"Rechercher produit, SKU..."` |
| `src/pages/reports/components/SessionCashBalanceTab.tsx` | `"Ouverture"`, `"Fermeture"`, `"En cours"` |
| `src/components/reports/ReportFilters/FilterDropdown.tsx` | `"Selectionner..."`, `"Rechercher..."` |
| `src/components/reports/DateRangePicker/DateRangePicker.tsx` | `"Selectionner une periode"` |

- **Recommendation**: Systematically replace all French strings with English equivalents. Priority: POS-facing text first (customer-visible), then back-office.

### 6.2 French Locale for Date/Number Formatting

- **Severity**: Critical
- **Zone**: 50+ files
- **Files**: See full list in analysis section
- **Description**: **60+ occurrences** of `toLocaleDateString('fr-FR')`, `toLocaleTimeString('fr-FR')`, `toLocaleString('fr-FR')` found across:
  - All purchasing components (`POInfoCard`, `POSummarySidebar`, `POReturnsSection`, `POHistoryTimeline`)
  - All customer pages
  - All B2B pages
  - All report tabs (12+ tabs)
  - Report export services (`csvExport.ts`, `pdfExport.ts`)
  - POS modals (`TransactionHistoryModal`, `CustomerSearchModal`, `CashierAnalyticsModal`)
  - Report chart components (`DualSeriesLineChart`, `ComparisonKpiCard`)

  This means dates display as `10/02/2026` (DD/MM/YYYY) instead of the Indonesian standard. Number formatting uses French dot/comma conventions (`.` for thousands, `,` for decimals).

  Meanwhile, `src/utils/helpers.ts` correctly uses `'id-ID'` locale for `formatCurrency`, `formatPrice`, and `formatTime`.
- **Recommendation**: Replace ALL `'fr-FR'` locale strings with `'id-ID'` or `'en-US'` throughout the codebase. Create a shared `formatDate()` utility function that all components use.

### 6.3 Currency Formatting

- **Severity**: Minor (Mostly Good)
- **Zone**: `src/utils/helpers.ts`
- **Description**: `formatCurrency()` and `formatPrice()` correctly use `'id-ID'` locale and `IDR` currency. Rounding to 0 decimals matches the "nearest 100 IDR" business rule. These functions are used consistently in most pages.
- **Issue**: Some pages bypass the helper and format directly: `Rp{stats.totalValue.toLocaleString('id-ID')}` in `InternalTransfersPage.tsx`.
- **Recommendation**: Always use `formatCurrency()` or `formatPrice()` helpers, never inline formatting.

---

## 7. CSS & Styles

### 7.1 Excessive Custom CSS Files

- **Severity**: Critical
- **Zone**: Application-wide
- **Files**: 80+ `.css` files (see complete list below)
- **Description**: The project contains **80+ custom CSS files** alongside Tailwind CSS. This creates a maintenance burden and style inconsistency. Major CSS files include:

  **Layout & Global** (3):
  - `src/styles/index.css` (1710 lines - global design system)
  - `src/layouts/BackOfficeLayout.css` (449 lines)
  - `src/components/mobile/MobileLayout.css`

  **POS** (14):
  - `src/pages/pos/POSMainPage.css`
  - `src/components/pos/Cart.css`, `ProductGrid.css`, `CategoryNav.css`, `POSMenu.css`, `LoyaltyBadge.css`
  - `src/components/pos/modals/` - 10 CSS files (PaymentModal, ModifierModal, VariantModal, etc.)
  - `src/components/pos/shift/` - 3 CSS files

  **Inventory** (11):
  - `InventoryLayout.css`, `StockPage.css`, `StockMovementsPage.css`, `IncomingStockPage.css`, etc.

  **Pages** (40+):
  - Every page directory has its own CSS files

  The global `index.css` alone defines custom utility classes that duplicate Tailwind (`.flex`, `.items-center`, `.gap-2`, `.p-4`, `.text-center`, etc. at lines 705-840). This creates conflicts with Tailwind's utility classes.

- **Recommendation**:
  1. Remove all duplicate utility classes from `index.css` (lines 705-840 conflict with Tailwind)
  2. Gradually migrate component-specific CSS to Tailwind classes
  3. Keep only truly custom CSS (animations, complex layouts, themed components)
  4. Target: reduce from 80 CSS files to ~10-15

### 7.2 Conflicting Theme Systems

- **Severity**: Major
- **Zone**: `src/styles/index.css`
- **Files**: Lines 1645-1710 of `index.css`
- **Description**: The file defines TWO theme systems:
  1. **Custom artisan theme** (`:root` lines 21-215) with variables like `--color-flour`, `--color-cream`, `--color-gold`
  2. **shadcn/ui theme** (`@layer base :root` lines 1646-1699) with variables like `--background`, `--foreground`, `--primary`

  These two systems use DIFFERENT color values. The shadcn theme uses neutral grays (`0 0% 100%` for background) while the artisan theme maps to `#f8fafc`. Both are applied simultaneously, creating potential conflicts.

  Additionally, dark mode is defined THREE times:
  1. `[data-theme="dark"]` at line 1155
  2. `@media (prefers-color-scheme: dark)` at line 1213
  3. `.dark` class at line 1673 (shadcn standard)
- **Recommendation**: Unify into one theme system. Map artisan colors as the single source of truth and have shadcn variables reference them.

### 7.3 POS Dark Theme Isolation

- **Severity**: Minor (Good architecture)
- **Zone**: `src/pages/pos/POSMainPage.css`
- **Description**: POS uses its own dark theme tokens (`--pos-bg`, `--pos-surface`, `--pos-border`, etc.) scoped to `.pos-app`. This properly isolates the POS dark theme from the back-office light theme. Good pattern.

---

## 8. Additional Issues

### 8.1 Missing Mobile Menu Toggle

- **Severity**: Critical
- **Zone**: Back-office on mobile/tablet
- **Files**: `src/layouts/BackOfficeLayout.tsx`, `BackOfficeLayout.css`
- **Description**: The CSS defines responsive behavior for the sidebar (hides on mobile, shows with `.open` class) and an overlay (`.mobile-overlay`), but the React component never renders a hamburger button or overlay div. On viewports < 768px, the sidebar disappears completely with no way to access navigation.
- **Recommendation**: Add a hamburger menu button in the main content area and implement the mobile overlay toggle.

### 8.2 No Error Monitoring Integration

- **Severity**: Minor
- **Zone**: `src/components/ui/ErrorBoundary.tsx`
- **Description**: Line 28 has `// TODO: Send to monitoring service (Sentry)`. Error boundary catches errors but doesn't report them.
- **Recommendation**: Integrate error reporting (Sentry, LogRocket, or similar).

### 8.3 Console.log in Production Code

- **Severity**: Minor
- **Zone**: POS
- **Files**: `src/pages/pos/POSMainPage.tsx` lines 58, 62
- **Description**: `console.error('[POS] LAN Hub error:', ...)` and `console.log('[POS] LAN Hub running:', ...)` are in production code.
- **Recommendation**: Remove or guard with `import.meta.env.DEV`.

### 8.4 Duplicate Toast Libraries

- **Severity**: Major
- **Zone**: Application-wide
- **Files**: `src/components/ui/toast.tsx` (Radix Toast), `src/components/ui/sonner.tsx` (Sonner), `src/components/ui/toaster.tsx` (Radix Toaster)
- **Description**: Two toast systems are installed: `@radix-ui/react-toast` (with Toaster wrapper) AND `sonner`. The application primarily uses `sonner` (`toast.success()`, `toast.error()`, etc.) but the Radix Toast components exist unused.
- **Recommendation**: Remove the Radix toast components (`toast.tsx`, `toaster.tsx`) and standardize on Sonner.

### 8.5 shadcn Tabs Component Unused

- **Severity**: Major
- **Zone**: All tabbed interfaces
- **Files**: `src/components/ui/tabs.tsx` exists but is never imported
- **Description**: The shadcn `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` components are available but NEVER used. Instead, every tabbed interface (Inventory, Products, Settings, Reports) implements custom tab components with CSS:
  - `InventoryLayout` - custom `.inventory-tab` buttons
  - `ProductsLayout` - custom tab buttons
  - `SettingsLayout` - custom tab NavLinks
  - `ReportsPage` - custom category/report selection
- **Recommendation**: Migrate to shadcn `<Tabs>` for consistent behavior, accessibility (proper `role="tab"`), and keyboard navigation.

---

## Summary of All Issues

### Critical (8)
| # | Issue | Zone | Impact |
|---|-------|------|--------|
| 1 | Dual button/card/input component systems | App-wide | Inconsistent UI, maintenance burden |
| 2 | Minimal responsive classes in pages | Back-office | Broken on tablets |
| 3 | POS fixed-width layout not responsive | POS | Unusable on portrait tablets |
| 4 | No React.memo anywhere | All components | Performance degradation |
| 5 | No list virtualization | Lists/tables | Slow rendering for large datasets |
| 6 | French text in 50+ UI files | App-wide | Wrong language for users |
| 7 | fr-FR locale in 60+ date/number calls | App-wide | Wrong date/number format |
| 8 | No mobile menu toggle for back-office | Mobile/tablet | Navigation impossible on small screens |

### Major (19)
| # | Issue | Zone |
|---|-------|------|
| 9 | UI file naming inconsistency (Card.tsx, Input.tsx) | UI components |
| 10 | 202+ inline styles | App-wide |
| 11 | Raw Tailwind colors bypass design tokens | App-wide |
| 12 | No breadcrumbs in most pages | Back-office |
| 13 | CSS responsive vs Tailwind responsive split | App-wide |
| 14 | Missing ARIA labels on key interactive elements | POS, inventory |
| 15 | No proper tab roles in tabbed interfaces | Inventory, Products, Settings |
| 16 | 80+ custom CSS files | App-wide |
| 17 | Conflicting dual theme systems | index.css |
| 18 | Triple dark mode definitions | index.css |
| 19 | Duplicate toast libraries | UI layer |
| 20 | shadcn Tabs available but unused | All tabbed UIs |
| 21 | POS cart inline styles (loyalty button) | POS Cart |
| 22 | Settings tab overflow (20+ tabs) | Settings |
| 23 | Custom Input.tsx not shadcn standard | UI Input |
| 24 | index.css duplicates Tailwind utility classes | Global CSS |
| 25 | select/badge/section-title duplicate definitions | index.css |
| 26 | Missing formatDate utility (inconsistent formatting) | All pages |
| 27 | Reports filter/date picker text in French | Reports |

### Minor (15)
| # | Issue | Zone |
|---|-------|------|
| 28 | Emoji in empty states instead of icons | Cart, ProductGrid |
| 29 | Modal close button too small (32px) | All modals |
| 30 | Sidebar toggle button too small (32px) | BackOfficeLayout |
| 31 | Skip-link CSS exists but no HTML element | Global |
| 32 | No error monitoring (Sentry TODO) | ErrorBoundary |
| 33 | Console.log in production POS code | POSMainPage |
| 34 | Some pages bypass formatCurrency helper | InternalTransfers |
| 35 | useMemo/useCallback missing in some list pages | Various |
| 36 | Dark mode detection complexity (3 methods) | index.css |
| 37 | Product skeleton uses light colors on dark POS bg | ProductGrid.css |
| 38 | Sidebar collapsed tooltip uses `data-tooltip` but HTML uses `title` | BackOfficeLayout |
| 39 | Settings stores multi-language name objects | SettingsLayout |
| 40 | Good lazy loading strategy | App.tsx |
| 41 | Good toast usage consistency (sonner) | App-wide |
| 42 | Good accessibility CSS foundations (focus, reduced motion, high contrast) | index.css |

---

## Priority Recommendations

### Phase 1: Quick Wins (1-2 days)
1. Replace all `'fr-FR'` locale strings with `'en-US'` or `'id-ID'`
2. Replace all French UI text with English
3. Remove console.log from production
4. Add mobile hamburger menu button to BackOfficeLayout
5. Remove unused Radix toast components

### Phase 2: Design System Cleanup (1 week)
1. Standardize on shadcn `<Button>` - remove `.btn-*` CSS classes
2. Migrate custom tab implementations to shadcn `<Tabs>`
3. Replace raw Tailwind colors with design tokens
4. Unify theme systems in index.css
5. Rename `Card.tsx` and `Input.tsx` to lowercase
6. Create shared `formatDate()` utility

### Phase 3: Performance (1 week)
1. Add `React.memo` to list item components
2. Install `@tanstack/react-virtual` for large lists
3. Add `useMemo`/`useCallback` to filter/sort in list pages

### Phase 4: Responsive & Accessibility (2 weeks)
1. Make POS responsive for tablet portrait mode
2. Add responsive breakpoints to all back-office pages
3. Implement breadcrumbs for nested routes
4. Add ARIA labels and proper roles to all interactive elements
5. Migrate critical CSS files to Tailwind classes

### Phase 5: CSS Consolidation (ongoing)
1. Remove duplicate utility classes from index.css
2. Migrate page-specific CSS to Tailwind
3. Target: reduce from 80 CSS files to ~15
