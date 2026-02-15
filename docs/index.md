# AppGrav Documentation

> Last updated: 2026-02-15

## Root-Level Documentation

| File | Description |
|------|-------------|
| [CLAUDE.md](../CLAUDE.md) | Primary project instructions for AI agents and developers |
| [CURRENT_STATE.md](../CURRENT_STATE.md) | Sprint progress, epic status, known issues |
| [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) | Database tables, views, functions, RLS patterns |

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

## Architecture

- [architecture-main.md](architecture-main.md) - Main system architecture
- [architecture-print-server.md](architecture-print-server.md) - Print server architecture
- [integration-architecture.md](integration-architecture.md) - Integration architecture
- [adr/ADR-001-payment-system-refactor.md](adr/ADR-001-payment-system-refactor.md) - ADR: Payment system refactor

## API

- [api-contracts.md](api-contracts.md) - API contracts
- [api/sales.md](api/sales.md) - Sales API

## Other

- [user-guide.md](user-guide.md) - User guide
- [wireframes/pos-revision-wireframes.md](wireframes/pos-revision-wireframes.md) - POS revision wireframes
- [security/PHASE2_SECURITY_AUDIT.md](security/PHASE2_SECURITY_AUDIT.md) - Phase 2 security audit

## Assembly Tracking

- **[ASSEMBLY-TRACKING.md](ASSEMBLY-TRACKING.md)** - Suivi complet de l'assemblage frontend-driven (phases 0-5, gaps, chronologie, items restants)

## Phase 0: Stitch Gap Analysis

- [phase0/stitch-pages-inventory.md](phase0/stitch-pages-inventory.md) - Full inventory of 67 Stitch pages with RED/YELLOW/GREEN gap status
- [phase0/gap-analysis.md](phase0/gap-analysis.md) - Gap analysis summary and prioritization
- [phase0/backend-creation-plan.md](phase0/backend-creation-plan.md) - Backend migration plan for Phase 1

## Audit & Strategic Planning

### Pre-Production Plan (Feb 12, 2026)
- **[audit/project-status-summary.md](audit/project-status-summary.md)** - Synthese rapide du projet (START HERE)
- **[audit/production-readiness-plan.md](audit/production-readiness-plan.md)** - Plan final pre-production (4 phases, 24 semaines)

### Strategic Audit (`docs/audit/` - Feb 9, 2026)
- [audit/appgrav-audit-report.md](audit/appgrav-audit-report.md) - Full audit report (4/5 stars)
- [audit/improvement-roadmap.md](audit/improvement-roadmap.md) - Improvement roadmap (P1/P2/P3)
- [audit/missing-modules-specs.md](audit/missing-modules-specs.md) - Missing modules specifications
- [audit/architecture-recommendations.md](audit/architecture-recommendations.md) - Architecture recommendations
- [audit/comparative-matrix.md](audit/comparative-matrix.md) - ERP comparative matrix
- [audit/erp-market-analysis.md](audit/erp-market-analysis.md) - ERP market analysis

### Technical Audit (`_audit/` - Feb 10, 2026)
- [../_audit/00-PLAN-AMELIORATION.md](../_audit/00-PLAN-AMELIORATION.md) - Production readiness plan (143 findings)
- [../_audit/01-architecture.md](../_audit/01-architecture.md) - Architecture audit
- [../_audit/02-database-backend.md](../_audit/02-database-backend.md) - Database & backend audit
- [../_audit/03-frontend-business.md](../_audit/03-frontend-business.md) - Frontend & business logic audit
- [../_audit/04-ui-ux.md](../_audit/04-ui-ux.md) - UI/UX audit
- [../_audit/05-security-quality.md](../_audit/05-security-quality.md) - Security & quality audit

## Archive

Obsolete or superseded documentation is preserved in [`_archive/`](_archive/) for reference.
Contains 12 files archived on 2026-02-11 (outdated French docs, resolved migration guides, implemented dev prompts).
