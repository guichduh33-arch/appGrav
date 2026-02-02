-- =====================================================
-- THE BREAKERY POS & MINI-ERP - CONSOLIDATED SCHEMA
-- Migration 001: Extensions & Enum Types
-- Consolidated from 113 migrations on 2026-02-03
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Set timezone for Indonesia (WITA - UTC+8)
ALTER DATABASE postgres SET timezone TO 'Asia/Makassar';

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- Product types
CREATE TYPE product_type AS ENUM (
    'finished',        -- Finished product for sale
    'semi_finished',   -- Semi-finished product
    'raw_material'     -- Raw material
);

-- Dispatch stations for KDS
CREATE TYPE dispatch_station AS ENUM (
    'barista',         -- Coffee and beverages
    'kitchen',         -- Kitchen (bagels, sandwiches)
    'display',         -- Display case (pastries)
    'none'             -- No dispatch
);

-- Order status
CREATE TYPE order_status AS ENUM (
    'new',             -- New order
    'preparing',       -- Being prepared
    'ready',           -- Ready
    'served',          -- Served
    'completed',       -- Completed (paid)
    'cancelled'        -- Cancelled
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
    'unpaid',          -- Not paid
    'partial',         -- Partially paid
    'paid'             -- Paid
);

-- Payment methods
CREATE TYPE payment_method AS ENUM (
    'cash',            -- Cash
    'card',            -- Credit/Debit card
    'qris',            -- QRIS (Indonesia QR)
    'edc',             -- EDC terminal
    'split',           -- Split payment
    'transfer'         -- Bank transfer (B2B)
);

-- Order types
CREATE TYPE order_type AS ENUM (
    'dine_in',         -- Dine in
    'takeaway',        -- Takeaway
    'delivery',        -- Delivery
    'b2b'              -- B2B order
);

-- Item status for KDS
CREATE TYPE item_status AS ENUM (
    'new',             -- New
    'preparing',       -- Being prepared
    'ready',           -- Ready
    'served'           -- Served
);

-- Stock movement types
CREATE TYPE movement_type AS ENUM (
    'purchase',        -- Supplier purchase
    'production_in',   -- Production input (finished product)
    'production_out',  -- Production output (raw materials)
    'sale_pos',        -- POS sale
    'sale_b2b',        -- B2B sale
    'adjustment_in',   -- Positive adjustment
    'adjustment_out',  -- Negative adjustment
    'waste',           -- Waste/loss
    'transfer_in',     -- Transfer received
    'transfer_out',    -- Transfer sent
    'transfer',        -- Legacy transfer
    'ingredient'       -- Ingredient deduction
);

-- Discount types
CREATE TYPE discount_type AS ENUM (
    'percentage',      -- Percentage discount
    'fixed',           -- Fixed amount
    'free'             -- Free item
);

-- Purchase order status
CREATE TYPE po_status AS ENUM (
    'draft',           -- Draft
    'sent',            -- Sent to supplier
    'partial',         -- Partially received
    'received',        -- Fully received
    'cancelled'        -- Cancelled
);

-- B2B order status
CREATE TYPE b2b_status AS ENUM (
    'draft',
    'confirmed',
    'processing',
    'ready',
    'delivered',
    'completed',
    'cancelled'
);

-- Expense types
CREATE TYPE expense_type AS ENUM (
    'cogs',            -- Cost of Goods Sold
    'general'          -- General expenses
);

-- Payment terms for B2B
CREATE TYPE payment_terms AS ENUM (
    'cod',             -- Cash on Delivery
    'net15',           -- 15 days
    'net30',           -- 30 days
    'net60'            -- 60 days
);

-- Customer types
CREATE TYPE customer_type AS ENUM (
    'retail',          -- Individual customer
    'wholesale'        -- Business customer
);

-- User roles (legacy - use roles table for new system)
CREATE TYPE user_role AS ENUM (
    'admin',           -- Administrator
    'manager',         -- Manager
    'cashier',         -- Cashier
    'server',          -- Server
    'barista',         -- Barista
    'kitchen',         -- Kitchen staff
    'backoffice'       -- Back-office
);

-- Audit severity
CREATE TYPE audit_severity AS ENUM (
    'info',            -- Information
    'warning',         -- Warning
    'critical'         -- Critical
);

-- Session status
CREATE TYPE session_status AS ENUM (
    'open',            -- Open
    'closed'           -- Closed
);

-- Modifier group type
CREATE TYPE modifier_group_type AS ENUM (
    'single',          -- Single selection (radio)
    'multiple'         -- Multiple selection (checkbox)
);

-- Transfer status
CREATE TYPE transfer_status AS ENUM (
    'draft',           -- Draft
    'pending',         -- Pending approval
    'in_transit',      -- In transit
    'received',        -- Received
    'cancelled'        -- Cancelled
);

-- Location type
CREATE TYPE location_type AS ENUM (
    'main_warehouse',  -- Main warehouse
    'section',         -- Section/department
    'kitchen',         -- Kitchen
    'storage'          -- Storage area
);

-- LAN node status
CREATE TYPE lan_node_status AS ENUM (
    'online',
    'offline',
    'connecting'
);

-- Sync device type
CREATE TYPE sync_device_type AS ENUM (
    'pos',
    'kds',
    'display',
    'mobile'
);
