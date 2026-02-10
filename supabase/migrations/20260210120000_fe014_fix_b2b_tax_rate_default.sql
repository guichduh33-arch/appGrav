-- FE-014: Fix B2B tax rate default from 11% to 10%
-- The B2B module was using 11% exclusive tax (0.11 default) while the rest
-- of the system uses 10% inclusive tax. All prices in the system are tax-inclusive (TTC).
-- Tax is extracted as: tax = total * 10/110
-- Changing the default to 0.10 to be consistent with POS.
ALTER TABLE b2b_orders ALTER COLUMN tax_rate SET DEFAULT 0.10;

COMMENT ON COLUMN b2b_orders.tax_rate IS 'Tax rate as decimal (0.10 = 10%). Tax is INCLUSIVE in all prices. Tax extracted as: total * rate / (1 + rate). Consistent with POS.';
