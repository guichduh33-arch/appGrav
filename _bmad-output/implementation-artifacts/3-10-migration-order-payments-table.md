# Story 3.10: Migration Order Payments Table

Status: backlog

## Story

As a **Database Admin**,
I want **créer la table order_payments**,
so that **le système peut supporter les paiements multiples (Split Payment)**.

## Acceptance Criteria

### AC1: Table Créée avec RLS
**Given** schéma Supabase
**When** migration appliquée
**Then** table `public.order_payments` existe
**And** RLS activé avec politiques Authenticated (Read/Insert/Update)

### AC2: Index de Performance
**Given** table `order_payments`
**When** requête de réconciliation (order_id, status)
**Then** l'index `idx_order_payments_order_status` est utilisé

### AC3: Pas d'erreur de Sync
**Given** transactions offline avec plusieurs paiements
**When** sync engine s'exécute
**Then** les paiements sont insérés sans erreur "table does not exist"

## Tasks / Subtasks

- [ ] **Task 1: Créer le fichier de migration SQL**
  - [ ] 1.1: Générer fichier `supabase/migrations/YYYYMMDDHHMMSS_create_order_payments.sql`
- [ ] **Task 2: Implémenter le schéma et index**
  - [ ] 2.1: Définir colonnes (id, order_id, method, amount, cash_received, etc.)
  - [ ] 2.2: Ajouter index composite `idx_order_payments_order_status`
  - [ ] 2.3: Ajouter index `idx_order_payments_created`
- [ ] **Task 3: Configurer RLS**
  - [ ] 3.1: Activer RLS sur la table
  - [ ] 3.2: Créer politiques `Authenticated read`, `insert`, `update`
- [ ] **Task 4: Vérification**
  - [ ] 4.1: Appliquer migration localement (`npx supabase db push`)
  - [ ] 4.2: Vérifier structure dans studio Supabase

## Dev Notes

### SQL Implementation

```sql
-- Order payments table for split payment support
CREATE TABLE IF NOT EXISTS public.order_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method payment_method NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    cash_received DECIMAL(12, 2),
    change_given DECIMAL(12, 2),
    reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed',
    is_offline BOOLEAN DEFAULT false,
    synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Composite index for reconciliation queries
CREATE INDEX idx_order_payments_order_status ON public.order_payments(order_id, status);
CREATE INDEX idx_order_payments_created ON public.order_payments(created_at);

-- RLS
ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON public.order_payments
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated insert" ON public.order_payments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated update" ON public.order_payments
    FOR UPDATE USING (auth.uid() IS NOT NULL);
```
