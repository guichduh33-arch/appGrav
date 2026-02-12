-- Fix C1: purchase_orders.tax_rate default was 0.11 instead of 0.10
-- Tax in Indonesia is 10% (PPN), not 11%
ALTER TABLE public.purchase_orders ALTER COLUMN tax_rate SET DEFAULT 0.10;
