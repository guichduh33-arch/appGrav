# AppGrav Documentation

> Last updated: 2026-02-16

## Root-Level Documentation

| File | Description |
|------|-------------|
| [CLAUDE.md](../CLAUDE.md) | Primary project instructions for AI agents and developers |
| [CURRENT_STATE.md](../CURRENT_STATE.md) | Sprint progress, epic status, known issues |
| [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) | Database tables, views, functions, RLS patterns |
| [DESIGN.md](../DESIGN.md) | Design system (Luxe Bakery theme) |

---

## Feature Specifications

### Combos & Promotions
- [COMBOS_AND_PROMOTIONS.md](COMBOS_AND_PROMOTIONS.md) - Overview of combos and promotions system
- [COMBOS_PROMOTIONS_IMPLEMENTATION.md](COMBOS_PROMOTIONS_IMPLEMENTATION.md) - Implementation guide
- [COMBOS_PROMOTIONS_QUICK_TEST.md](COMBOS_PROMOTIONS_QUICK_TEST.md) - Quick test guide
- [COMBO_CHOICE_GROUPS.md](COMBO_CHOICE_GROUPS.md) - Choice groups with price adjustments
- [COMBO_POS_INTEGRATION.md](COMBO_POS_INTEGRATION.md) - POS integration for combos

### Stock & Inventory
- [STOCK_MANAGEMENT.md](STOCK_MANAGEMENT.md) - Stock management overview
- [STOCK_MOVEMENTS_MODULE.md](STOCK_MOVEMENTS_MODULE.md) - Stock movements specification
- [STOCK_DEDUCTION_LOGIC.md](STOCK_DEDUCTION_LOGIC.md) - Stock deduction rules
- [DEDUCT_INGREDIENTS_ON_SALE.md](DEDUCT_INGREDIENTS_ON_SALE.md) - Ingredient deduction on sale

### Variants
- [VARIANTS_POS_INTEGRATION.md](VARIANTS_POS_INTEGRATION.md) - Variants in POS
- [VARIANTS_WITH_INGREDIENT_TRACKING.md](VARIANTS_WITH_INGREDIENT_TRACKING.md) - Variants with ingredient tracking

### Payments & Financial
- [PAYMENT_SYSTEM.md](PAYMENT_SYSTEM.md) - Payment system (split payments, validation)
- [FINANCIAL_OPERATIONS.md](FINANCIAL_OPERATIONS.md) - Void/refund operations with audit trail

---

## Architecture

- [architecture-main.md](architecture-main.md) - Main system architecture
- [architecture-print-server.md](architecture-print-server.md) - Print server architecture
- [integration-architecture.md](integration-architecture.md) - Integration architecture
- [adr/ADR-001-payment-system-refactor.md](adr/ADR-001-payment-system-refactor.md) - ADR: Payment system refactor

---

## API

- [api-contracts.md](api-contracts.md) - API contracts
- [api/sales.md](api/sales.md) - Sales API

---

## Phase 0: Stitch Gap Analysis

| Document | Description |
|----------|-------------|
| [phase0/ASSEMBLY-TRACKING.md](phase0/ASSEMBLY-TRACKING.md) | Full assembly tracking (phases 0-5, gaps, timeline) |
| [phase0/stitch-pages-inventory.md](phase0/stitch-pages-inventory.md) | Inventory of 67 Stitch pages (RED/YELLOW/GREEN status) |
| [phase0/gap-analysis.md](phase0/gap-analysis.md) | Gap analysis summary and prioritization |
| [phase0/backend-creation-plan.md](phase0/backend-creation-plan.md) | Backend migration plan for Phase 1 |
| [phase0/PROMPT-Assembly-Frontend-Driven-AppGrav-V2.md](phase0/PROMPT-Assembly-Frontend-Driven-AppGrav-V2.md) | Assembly prompt/methodology |

---

## Design System & UI

### Core Design
- [design/01-audit-report.md](design/01-audit-report.md) - UI audit report
- [design/02-benchmark-analysis.md](design/02-benchmark-analysis.md) - Benchmark analysis
- [design/03-design-system.md](design/03-design-system.md) - Design system spec
- [design/04-palette-options.md](design/04-palette-options.md) - Color palette options
- [design/05-component-specs.md](design/05-component-specs.md) - Component specifications

### Screen Redesigns
- [design/06-navigation-redesign.md](design/06-navigation-redesign.md) - Navigation redesign
- [design/07-pos-redesign.md](design/07-pos-redesign.md) - POS redesign
- [design/08-kds-redesign.md](design/08-kds-redesign.md) - KDS redesign
- [design/09-customer-display.md](design/09-customer-display.md) - Customer display
- [design/10-implementation-roadmap.md](design/10-implementation-roadmap.md) - Implementation roadmap

### Stitch Integration
- [design/STITCH_DESIGN_BRIEF.md](design/STITCH_DESIGN_BRIEF.md) - Design brief for Stitch
- [design/STITCH_MASTER_PROMPT.md](design/STITCH_MASTER_PROMPT.md) - Master prompt for Stitch generation
- [design/STITCH_PROMPT.md](design/STITCH_PROMPT.md) - Screen prompts for Stitch
- [design/site-roadmap.md](design/site-roadmap.md) - UI integration roadmap
- [design/checkout-payment-spec.md](design/checkout-payment-spec.md) - Checkout/payment spec

### Stitch Exports & Queue
- [stitch/all_screens.json](stitch/all_screens.json) - All Stitch screens metadata
- [stitch/queue/](stitch/queue/) - Stitch exports pending integration

---

## Audit & Strategic Planning

### Production Readiness Plan (Feb 12, 2026)
- [audit/production-readiness-plan/index.md](audit/production-readiness-plan/index.md) - Plan final pre-production (4 phases, 24 semaines)
- [audit/production-readiness-plan/project-status-summary.md](audit/production-readiness-plan/project-status-summary.md) - Synthese rapide du projet

### Strategic Audit (Feb 9, 2026)
- [audit/appgrav-audit-report.md](audit/appgrav-audit-report.md) - Full audit report (4/5 stars)
- [audit/improvement-roadmap.md](audit/improvement-roadmap.md) - Improvement roadmap (P1/P2/P3)
- [audit/missing-modules-specs.md](audit/missing-modules-specs.md) - Missing modules specifications
- [audit/architecture-recommendations.md](audit/architecture-recommendations.md) - Architecture recommendations
- [audit/comparative-matrix.md](audit/comparative-matrix.md) - ERP comparative matrix
- [audit/erp-market-analysis.md](audit/erp-market-analysis.md) - ERP market analysis

### Technical Audit (Feb 10, 2026)
- [audit/technical/00-PLAN-AMELIORATION.md](audit/technical/00-PLAN-AMELIORATION.md) - Production readiness plan (143 findings)
- [audit/technical/01-architecture.md](audit/technical/01-architecture.md) - Architecture audit
- [audit/technical/02-database-backend.md](audit/technical/02-database-backend.md) - Database & backend audit
- [audit/technical/03-frontend-business.md](audit/technical/03-frontend-business.md) - Frontend & business logic audit
- [audit/technical/04-ui-ux.md](audit/technical/04-ui-ux.md) - UI/UX audit
- [audit/technical/05-security-quality.md](audit/technical/05-security-quality.md) - Security & quality audit

### Audit Cycles
- [audit/05-plan-corrections-cycle1.md](audit/05-plan-corrections-cycle1.md) - Cycle 1 corrections plan
- [audit/06-audit-cycle2.md](audit/06-audit-cycle2.md) - Cycle 2 audit

---

## Other

- [user-guide.md](user-guide.md) - User guide
- [wireframes/pos-revision-wireframes.md](wireframes/pos-revision-wireframes.md) - POS revision wireframes
- [security/PHASE2_SECURITY_AUDIT.md](security/PHASE2_SECURITY_AUDIT.md) - Phase 2 security audit

---

## Archive

Obsolete or superseded documentation is preserved in [`_archive/`](_archive/) for reference:
- `_archive/` - 12 archived docs from Feb 11 (outdated French docs, resolved migration guides)
- `_archive/legacy-html/` - Old HTML prototypes (costing, kds, stock)
- `_archive/artifacts/` - Old development artifacts from Jan 2026 (erp_design, fixes, repairs, reports)
