# Story 3.11: Migration Refund Fields

Status: backlog

## Story

As a **Financial Manager**,
I want **pouvoir tracker les remboursements sur les commandes**,
so that **les rapports financiers sont exacts et audités**.

## Acceptance Criteria

### AC1: Champs Refund Ajoutés à Table Orders
**Given** table `public.orders` existante
**When** migration appliquée
**Then** colonnes suivantes existent :
- `refund_amount` (DECIMAL)
- `refund_reason` (TEXT)
- `refund_method` (payment_method)
- `refunded_at` (TIMESTAMPTZ)
- `refunded_by` (UUID REFERENCES users)

### AC2: Statut 'voided' ajouté à l'Enum
**Given** enum `order_status`
**When** migration appliquée
**Then** la valeur `voided` est disponible après `cancelled`

### AC3: Index pour Performance Rapports
**Given** requêtes sur les remboursements
**When** filtrage par `refunded_at`
**Then** l'index `idx_orders_refunded` est utilisé

## Tasks / Subtasks

- [ ] **Task 1: Créer le fichier de migration SQL**
  - [ ] 1.1: Générer fichier `supabase/migrations/YYYYMMDDHHMMSS_add_refund_fields.sql`
- [ ] **Task 2: Modifier la table orders**
  - [ ] 2.1: Ajouter les 5 colonnes de tracking refund
- [ ] **Task 3: Mettre à jour l'enum order_status**
  - [ ] 3.1: Utiliser bloc `DO $$ BEGIN ... END$$;` pour ajouter `voided` si inexistant
- [ ] **Task 4: Créer l'index filtré**
  - [ ] 4.1: Créer index `idx_orders_refunded` sur `refunded_at` WHERE `refund_amount IS NOT NULL`

## Dev Notes

### SQL Implementation

```sql
-- Add refund tracking fields to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(12,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_method payment_method;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refunded_by UUID REFERENCES auth.users(id);

-- Add 'voided' to order_status enum if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'voided' AND enumtypid = 'order_status'::regtype) THEN
        ALTER TYPE order_status ADD VALUE 'voided' AFTER 'cancelled';
    END IF;
END$$;

-- Index for refund queries
CREATE INDEX IF NOT EXISTS idx_orders_refunded ON public.orders(refunded_at) WHERE refund_amount IS NOT NULL;
```
