# AppGrav UI Redesign — The Breakery Luxe Dark

## 1. Vision

Redesign the AppGrav ERP/POS application UI with the "Luxe Bakery" aesthetic — a premium, minimalist, dark-themed design with artisan gold accents. Each page is generated in Stitch, then converted to React/TypeScript components integrated into the existing Vite + Tailwind + shadcn/ui codebase.

**Stitch Project ID:** `6226570993221239944`

## 2. Design System Reference

See `DESIGN.md` for the full design system:
- Deep Onyx background (#0D0D0F)
- Artisan Gold accents (#C9A55C)
- Playfair Display headings / Inter body
- Rounded components with gold gradient buttons

## 3. Integration Workflow

1. Generate/retrieve screen from Stitch
2. Download HTML to `queue/{page}.html` and screenshot to `queue/{page}.png`
3. Convert HTML to React component(s) using existing patterns
4. Replace/update page in `src/pages/` or component in `src/components/`
5. Verify with dev server (`npm run dev`)

## 4. Sitemap — Completed Screens

### Downloaded (Stitch → HTML in `queue/`, not yet integrated as React)
- [x] POS Terminal (`queue/pos-terminal.html` + `.png`)

### Not yet downloaded from Stitch
- [ ] Kitchen Display System (KDS)
- [ ] Customer Facing Display
- [ ] Back-Office Dashboard
- [ ] Checkout & Payment
- [ ] Production Entry
- [ ] Stock & Inventory Management
- [ ] Stock Movements Analytics
- [ ] Physical Inventory Log
- [ ] Inventory Wastage Log
- [ ] Receiving & Delivery Log
- [ ] Stock Order Request Form (2 variants)
- [ ] Product Detail Editor
- [ ] Recipe & Costing Editor
- [ ] Recipe & Costing Analysis
- [ ] Pâtisserie & Modifiers
- [ ] Supplier Management & Contact
- [ ] Staff Clock-In/Out
- [ ] Luxe Loading States

### Integrated (React components in codebase)
- [ ] (none yet)

## 5. Roadmap — Next Screens to Generate & Integrate

### Priority 1: Core POS Flow
1. [ ] POS Terminal → React integration
2. [ ] Checkout & Payment → React integration
3. [ ] Open Shift Register → download + React
4. [ ] Shift Summary & Closing → download + React

### Priority 2: Kitchen & Display
5. [ ] KDS → React integration
6. [ ] Customer Display (Active Order) → download + React
7. [ ] Customer Display (Idle State) → download + React

### Priority 3: Back-Office
8. [ ] Dashboard → React integration
9. [ ] Order History & Logs → download + React
10. [ ] Products & Stock Status → download + React
11. [ ] Global Reports Hub → download + React

### Priority 4: Inventory
12. [ ] Stock & Inventory → React integration
13. [ ] Stock Movements Analytics → React integration
14. [ ] Production Entry → React integration

### Priority 5: Finance & Settings
15. [ ] Balance Sheet → download + React
16. [ ] Income Statement → download + React
17. [ ] B2B Wholesale Dashboard → download + React
18. [ ] Purchase Order Management → download + React
19. [ ] User Profile & PIN Security → download + React
20. [ ] POS & System Settings → download + React
21. [ ] Tax & PPN Settings → download + React

## 6. Creative Freedom — Additional Screens

- Customer Loyalty Dashboard (tier progress, points history)
- Combo Builder Visual Editor
- Promotion Calendar View
- Staff Shift Schedule Grid
- Audit Trail Inspector
- Mobile POS Compact View
- Supplier Price Comparison
- Daily Production Planner
