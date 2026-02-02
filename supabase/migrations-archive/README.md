# Archived Migrations

## DO NOT USE THESE FILES

These 112 migration files have been **archived** and replaced by the consolidated migrations in `../migrations/`.

## Reason for Archive

The original migration structure had accumulated technical debt:
- **31% fix/debug migrations** (naming pattern: `fix_*`, `debug_*`, `repair_*`)
- **Inconsistent numbering** (0035_, 0135_, 0245_, etc.)
- **Fix chains** for the same issues (e.g., 5+ migrations fixing customers RLS)
- **Difficult to understand** the complete schema from scattered changes

## Consolidated Replacement

The new structure in `../migrations/` consolidates all functionality into 14 domain-organized files:

| Old Files | New File |
|-----------|----------|
| 001, 030, 031 + enums | `001_extensions_enums.sql` |
| 001, 006-008, 012, 020-022, 087-094 | `002_core_products.sql` |
| 028, 029, 030-037, 042 | `003_customers_loyalty.sql` |
| 001, 019, 023-024, 048-057 | `004_sales_orders.sql` |
| 0035, 0135, 0195, 015, 038-039, 062, 081-086 | `005_inventory_stock.sql` |
| 030, 031 | `006_combos_promotions.sql` |
| 027, 043-045, 063 | `007_b2b_wholesale.sql` |
| 040, 046-047, 067-076 | `008_users_permissions.sql` |
| 041 | `009_system_settings.sql` |
| 057-061, 095+ | `010_lan_sync_display.sql` |
| 003, various triggers | `011_functions_triggers.sql` |
| 004, 009, 014, 016, 018, 050-052, 056, 068, 072-073, 077 | `012_rls_policies.sql` |
| 005, 011, 013 | `013_views_reporting.sql` |
| 002, 036, 067, 069-070 | `014_seed_data.sql` |

## Reference Only

These files are kept for:
- Historical reference
- Understanding specific bug fixes if needed
- Audit purposes

**Never execute these files on a new database.**

---

*Archived on 2026-02-03*
