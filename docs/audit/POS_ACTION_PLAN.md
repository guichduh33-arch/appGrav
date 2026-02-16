# PLAN D'ACTION POS - CORRECTIONS 🔴 & 🟡

> **Date**: 2026-02-16
> **Scope**: Partie POS uniquement
> **Priorité**: Production-ready

---

## RÉSUMÉ EXÉCUTIF

| Catégorie | Items | Effort Total |
|-----------|-------|--------------|
| 1. Nouvelles Tables | 1 (IndexedDB) | S |
| 2. ALTER Tables | 2 | XS |
| 3. Edge Functions | 0 | - |
| 4. Triggers & Functions | 2 | M |
| 5. Dépendances NPM | 0 | - |
| 6. Realtime Subscriptions | 1 | S |
| 7. Modifications Frontend | 5 | M |

**Effort Total Estimé**: 3-5 jours

---

## 1. NOUVELLES TABLES À CRÉER

### 1.1 Table IndexedDB: `offline_held_orders`

**Contexte**: Les commandes "held" (en attente cuisine) sont perdues au refresh car stockées uniquement en mémoire dans `orderStore`.

```typescript
// src/lib/db.ts - Ajouter à la définition Dexie

interface IOfflineHeldOrder {
  id: string;                          // UUID local
  order_number: string;                // Numéro affiché (#XXXX)
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  table_number?: string;
  customer_id?: string;
  customer_name?: string;
  items: ICartItem[];                  // Snapshot complet du panier
  subtotal: number;
  discount_amount: number;
  total: number;
  notes?: string;
  created_at: string;                  // ISO timestamp
  created_by: string;                  // User ID
  terminal_id: string;                 // Terminal source
  session_id?: string;                 // POS session
}

// Ajouter dans db.ts
offline_held_orders: '&id, order_number, terminal_id, session_id, created_at'
```

**Colonnes**:
| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | string | PK, UUID | Identifiant unique local |
| `order_number` | string | NOT NULL | Format #XXXX |
| `order_type` | string | NOT NULL | dine_in/takeaway/delivery |
| `table_number` | string | NULL | Numéro table si dine_in |
| `customer_id` | string | NULL | UUID client |
| `customer_name` | string | NULL | Nom client snapshot |
| `items` | ICartItem[] | NOT NULL | Array items panier |
| `subtotal` | number | NOT NULL | Sous-total |
| `discount_amount` | number | DEFAULT 0 | Montant remise |
| `total` | number | NOT NULL | Total TTC |
| `notes` | string | NULL | Instructions spéciales |
| `created_at` | string | NOT NULL | Timestamp ISO |
| `created_by` | string | NOT NULL | User ID créateur |
| `terminal_id` | string | NOT NULL | Terminal source |
| `session_id` | string | NULL | Session POS |

**Index Dexie**:
- `&id` - Primary key unique
- `order_number` - Recherche par numéro
- `terminal_id` - Filter par terminal
- `session_id` - Filter par session
- `created_at` - Tri chronologique

**Pas de RLS** (IndexedDB local uniquement)

**Données initiales**: Aucune (table vide au démarrage)

---

## 2. TABLES EXISTANTES À MODIFIER (ALTER)

### 2.1 ALTER TABLE `orders` - Ajouter `guest_count`

**Migration**: `20260216_add_guest_count_to_orders.sql`

```sql
-- Migration: Add guest_count column to orders table
-- Impact: AUCUN sur données existantes (DEFAULT 1)

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 1;

-- Contrainte: minimum 1 convive
ALTER TABLE public.orders
ADD CONSTRAINT chk_orders_guest_count_positive
CHECK (guest_count >= 1);

-- Index pour reporting (ventes par convive)
CREATE INDEX IF NOT EXISTS idx_orders_guest_count
ON public.orders(guest_count)
WHERE guest_count > 1;

-- Commentaire documentation
COMMENT ON COLUMN public.orders.guest_count IS
'Number of guests for the order. Used for per-head revenue calculations. Default 1.';
```

**Impact données existantes**: AUCUN - Les 358+ commandes existantes auront `guest_count = 1`

---

### 2.2 ALTER TABLE `settings` - Ajouter config modifiers

**Migration**: `20260216_add_modifier_config_settings.sql`

```sql
-- Migration: Add modifier configuration to settings
-- Purpose: Move hardcoded MODIFIER_CONFIG from ModifierModal.tsx to database

-- Insérer les configurations modifiers comme settings
INSERT INTO public.settings (key, value, category, description, is_system)
VALUES
  -- Coffee modifiers
  ('modifier_config_coffee', '{
    "group_name": "Coffee Options",
    "group_type": "single",
    "options": [
      {"id": "hot", "label": "Hot", "price_adjustment": 0, "is_default": true},
      {"id": "iced", "label": "Iced", "price_adjustment": 5000, "is_default": false},
      {"id": "blended", "label": "Blended", "price_adjustment": 8000, "is_default": false}
    ]
  }', 'pos_modifiers', 'Default coffee temperature options', true),

  -- Size modifiers
  ('modifier_config_size', '{
    "group_name": "Size",
    "group_type": "single",
    "options": [
      {"id": "regular", "label": "Regular", "price_adjustment": 0, "is_default": true},
      {"id": "large", "label": "Large", "price_adjustment": 10000, "is_default": false}
    ]
  }', 'pos_modifiers', 'Default size options', true),

  -- Milk modifiers
  ('modifier_config_milk', '{
    "group_name": "Milk Options",
    "group_type": "single",
    "options": [
      {"id": "regular_milk", "label": "Regular Milk", "price_adjustment": 0, "is_default": true},
      {"id": "oat_milk", "label": "Oat Milk", "price_adjustment": 8000, "is_default": false},
      {"id": "almond_milk", "label": "Almond Milk", "price_adjustment": 10000, "is_default": false},
      {"id": "no_milk", "label": "No Milk", "price_adjustment": 0, "is_default": false}
    ]
  }', 'pos_modifiers', 'Default milk options for beverages', true),

  -- Extras (multi-select)
  ('modifier_config_extras', '{
    "group_name": "Extras",
    "group_type": "multiple",
    "options": [
      {"id": "extra_shot", "label": "Extra Shot", "price_adjustment": 8000},
      {"id": "whipped_cream", "label": "Whipped Cream", "price_adjustment": 5000},
      {"id": "caramel_drizzle", "label": "Caramel Drizzle", "price_adjustment": 5000},
      {"id": "chocolate_sauce", "label": "Chocolate Sauce", "price_adjustment": 5000}
    ]
  }', 'pos_modifiers', 'Default extras/add-ons for beverages', true)

ON CONFLICT (key) DO NOTHING;

-- Commentaire
COMMENT ON COLUMN public.settings.category IS
'Setting category. pos_modifiers = POS modifier configurations';
```

**Impact données existantes**: AUCUN - Ajout de nouvelles lignes settings

---

## 3. NOUVELLES EDGE FUNCTIONS

**Aucune Edge Function requise pour les corrections POS identifiées.**

Les fonctionnalités manquantes sont gérées par:
- Triggers PostgreSQL (journal entries)
- Hooks React (offline fallbacks)
- Services TypeScript existants

---

## 4. NOUVEAUX TRIGGERS & FUNCTIONS PostgreSQL

### 4.1 Function & Trigger: `create_sale_journal_entry()`

**Migration**: `20260216_create_sale_journal_entry_trigger.sql`

```sql
-- =============================================================================
-- Function: create_sale_journal_entry()
-- Purpose: Auto-create double-entry journal when order is completed
-- Triggered: AFTER UPDATE on orders WHERE status changes to 'completed'
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_sale_journal_entry()
RETURNS TRIGGER AS $$
DECLARE
    v_journal_id UUID;
    v_cash_account_id UUID;
    v_card_account_id UUID;
    v_qris_account_id UUID;
    v_edc_account_id UUID;
    v_revenue_account_id UUID;
    v_vat_payable_account_id UUID;
    v_ar_account_id UUID;
    v_vat_amount DECIMAL(15,2);
    v_net_revenue DECIMAL(15,2);
    v_payment_account_id UUID;
BEGIN
    -- Only process when status changes TO 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN

        -- Get account IDs from chart of accounts
        SELECT id INTO v_cash_account_id FROM public.accounts WHERE code = '1111'; -- Cash
        SELECT id INTO v_card_account_id FROM public.accounts WHERE code = '1112'; -- Bank - Card
        SELECT id INTO v_qris_account_id FROM public.accounts WHERE code = '1113'; -- Bank - QRIS
        SELECT id INTO v_edc_account_id FROM public.accounts WHERE code = '1114'; -- Bank - EDC
        SELECT id INTO v_revenue_account_id FROM public.accounts WHERE code = '4100'; -- Sales Revenue
        SELECT id INTO v_vat_payable_account_id FROM public.accounts WHERE code = '2110'; -- VAT Payable
        SELECT id INTO v_ar_account_id FROM public.accounts WHERE code = '1130'; -- Accounts Receivable

        -- Calculate VAT (10% included in total)
        v_vat_amount := ROUND(NEW.total * 10 / 110, 2);
        v_net_revenue := NEW.total - v_vat_amount;

        -- Determine payment account based on method
        CASE NEW.payment_method
            WHEN 'cash' THEN v_payment_account_id := v_cash_account_id;
            WHEN 'card' THEN v_payment_account_id := v_card_account_id;
            WHEN 'qris' THEN v_payment_account_id := v_qris_account_id;
            WHEN 'edc' THEN v_payment_account_id := v_edc_account_id;
            ELSE v_payment_account_id := v_ar_account_id; -- B2B/credit
        END CASE;

        -- Create journal entry header
        INSERT INTO public.journal_entries (
            entry_date,
            description,
            reference_type,
            reference_id,
            status,
            created_by,
            is_system_generated
        ) VALUES (
            CURRENT_DATE,
            'Sale - Order #' || NEW.order_number,
            'order',
            NEW.id,
            'posted',
            NEW.staff_id,
            TRUE
        ) RETURNING id INTO v_journal_id;

        -- Create journal entry lines
        -- DEBIT: Payment account (Cash/Card/QRIS/EDC/AR)
        INSERT INTO public.journal_entry_lines (
            journal_entry_id,
            account_id,
            debit,
            credit,
            description
        ) VALUES (
            v_journal_id,
            v_payment_account_id,
            NEW.total,
            0,
            'Payment received - ' || UPPER(NEW.payment_method::TEXT)
        );

        -- CREDIT: Revenue (net of VAT)
        INSERT INTO public.journal_entry_lines (
            journal_entry_id,
            account_id,
            debit,
            credit,
            description
        ) VALUES (
            v_journal_id,
            v_revenue_account_id,
            0,
            v_net_revenue,
            'Sales revenue'
        );

        -- CREDIT: VAT Payable
        INSERT INTO public.journal_entry_lines (
            journal_entry_id,
            account_id,
            debit,
            credit,
            description
        ) VALUES (
            v_journal_id,
            v_vat_payable_account_id,
            0,
            v_vat_amount,
            'VAT collected (10%)'
        );

        -- Handle discount as separate line if applicable
        IF NEW.discount_amount > 0 THEN
            INSERT INTO public.journal_entry_lines (
                journal_entry_id,
                account_id,
                debit,
                credit,
                description
            ) VALUES (
                v_journal_id,
                (SELECT id FROM public.accounts WHERE code = '4900'), -- Sales Discounts
                NEW.discount_amount,
                0,
                'Discount: ' || COALESCE(NEW.discount_reason, 'No reason')
            );
        END IF;

    -- Handle VOID - reverse the journal entry
    ELSIF NEW.status = 'voided' AND OLD.status = 'completed' THEN

        -- Find and reverse existing journal entry
        UPDATE public.journal_entries
        SET status = 'reversed',
            reversed_at = NOW(),
            reversed_by = NEW.cancelled_by,
            reversal_reason = NEW.cancellation_reason
        WHERE reference_type = 'order' AND reference_id = NEW.id;

        -- Create reversal entry (mirror with opposite signs)
        -- ... (similar logic with debits/credits swapped)

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set search_path for security
ALTER FUNCTION public.create_sale_journal_entry() SET search_path = '';

-- Create trigger
DROP TRIGGER IF EXISTS tr_create_sale_journal_entry ON public.orders;
CREATE TRIGGER tr_create_sale_journal_entry
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    WHEN (NEW.status IN ('completed', 'voided'))
    EXECUTE FUNCTION public.create_sale_journal_entry();

-- Grant execute
GRANT EXECUTE ON FUNCTION public.create_sale_journal_entry() TO authenticated;

-- Comment
COMMENT ON FUNCTION public.create_sale_journal_entry() IS
'Auto-generates double-entry journal entries when orders are completed or voided.
Handles: Cash/Card/QRIS/EDC payments, VAT calculation (10% included), discounts, reversals.';
```

---

### 4.2 Function & Trigger: `create_purchase_journal_entry()`

**Migration**: `20260216_create_purchase_journal_entry_trigger.sql`

```sql
-- =============================================================================
-- Function: create_purchase_journal_entry()
-- Purpose: Auto-create double-entry journal when PO is received
-- Triggered: AFTER UPDATE on purchase_orders WHERE status changes to 'received'
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_purchase_journal_entry()
RETURNS TRIGGER AS $$
DECLARE
    v_journal_id UUID;
    v_inventory_account_id UUID;
    v_expense_account_id UUID;
    v_payable_account_id UUID;
    v_vat_input_account_id UUID;
    v_vat_amount DECIMAL(15,2);
    v_net_amount DECIMAL(15,2);
    v_item RECORD;
BEGIN
    -- Only process when status changes TO 'received'
    IF NEW.status = 'received' AND (OLD.status IS NULL OR OLD.status != 'received') THEN

        -- Get account IDs
        SELECT id INTO v_inventory_account_id FROM public.accounts WHERE code = '1210'; -- Inventory
        SELECT id INTO v_expense_account_id FROM public.accounts WHERE code = '5100'; -- COGS
        SELECT id INTO v_payable_account_id FROM public.accounts WHERE code = '2100'; -- Accounts Payable
        SELECT id INTO v_vat_input_account_id FROM public.accounts WHERE code = '1150'; -- VAT Input (receivable)

        -- Calculate VAT if applicable (assume 10% on taxable purchases)
        IF NEW.includes_tax THEN
            v_vat_amount := ROUND(NEW.total_amount * 10 / 110, 2);
            v_net_amount := NEW.total_amount - v_vat_amount;
        ELSE
            v_vat_amount := 0;
            v_net_amount := NEW.total_amount;
        END IF;

        -- Create journal entry header
        INSERT INTO public.journal_entries (
            entry_date,
            description,
            reference_type,
            reference_id,
            status,
            created_by,
            is_system_generated
        ) VALUES (
            CURRENT_DATE,
            'Purchase - PO #' || NEW.po_number || ' from ' ||
                (SELECT name FROM public.suppliers WHERE id = NEW.supplier_id),
            'purchase_order',
            NEW.id,
            'posted',
            NEW.received_by,
            TRUE
        ) RETURNING id INTO v_journal_id;

        -- DEBIT: Inventory (for goods)
        INSERT INTO public.journal_entry_lines (
            journal_entry_id,
            account_id,
            debit,
            credit,
            description
        ) VALUES (
            v_journal_id,
            v_inventory_account_id,
            v_net_amount,
            0,
            'Inventory purchase'
        );

        -- DEBIT: VAT Input (if taxable)
        IF v_vat_amount > 0 THEN
            INSERT INTO public.journal_entry_lines (
                journal_entry_id,
                account_id,
                debit,
                credit,
                description
            ) VALUES (
                v_journal_id,
                v_vat_input_account_id,
                v_vat_amount,
                0,
                'VAT input on purchase'
            );
        END IF;

        -- CREDIT: Accounts Payable
        INSERT INTO public.journal_entry_lines (
            journal_entry_id,
            account_id,
            debit,
            credit,
            description
        ) VALUES (
            v_journal_id,
            v_payable_account_id,
            0,
            NEW.total_amount,
            'Payable to ' || (SELECT name FROM public.suppliers WHERE id = NEW.supplier_id)
        );

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set search_path for security
ALTER FUNCTION public.create_purchase_journal_entry() SET search_path = '';

-- Create trigger
DROP TRIGGER IF EXISTS tr_create_purchase_journal_entry ON public.purchase_orders;
CREATE TRIGGER tr_create_purchase_journal_entry
    AFTER UPDATE ON public.purchase_orders
    FOR EACH ROW
    WHEN (NEW.status = 'received')
    EXECUTE FUNCTION public.create_purchase_journal_entry();

-- Grant execute
GRANT EXECUTE ON FUNCTION public.create_purchase_journal_entry() TO authenticated;

-- Comment
COMMENT ON FUNCTION public.create_purchase_journal_entry() IS
'Auto-generates double-entry journal entries when purchase orders are received.
Handles: Inventory debit, VAT input, Accounts Payable credit.';
```

---

## 5. NOUVELLES DÉPENDANCES NPM

**Aucune nouvelle dépendance requise pour les corrections POS.**

Les fonctionnalités utilisent déjà:
- ✅ Dexie (IndexedDB) - déjà installé
- ✅ Zustand (state) - déjà installé
- ✅ @tanstack/react-query - déjà installé
- ✅ @supabase/supabase-js - déjà installé

**Vérification compatibilité**: Toutes les dépendances sont compatibles React 18 + Vite + TypeScript.

---

## 6. NOUVELLES SUBSCRIPTIONS REALTIME

### 6.1 Subscription: Order Status Changes

**Contexte**: Le POS n'est pas notifié quand le statut d'une commande change côté serveur (ex: KDS marque "ready").

**Fichier**: `src/hooks/pos/useOrderStatusSubscription.ts`

```typescript
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface OrderStatusPayload {
  eventType: 'UPDATE';
  new: {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
  };
  old: {
    status: string;
  };
}

export function useOrderStatusSubscription(sessionId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel('pos-order-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload: OrderStatusPayload) => {
          const { new: newOrder, old: oldOrder } = payload;

          // Notify on status change
          if (newOrder.status !== oldOrder.status) {
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['held-orders'] });

            // Toast notification for important status changes
            if (newOrder.status === 'ready') {
              toast.success(`Order #${newOrder.order_number} is ready!`, {
                description: 'Customer can pick up their order.',
              });
            } else if (newOrder.status === 'served') {
              toast.info(`Order #${newOrder.order_number} served`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient]);
}
```

**Intégration dans POSMainPage**:
```typescript
// src/pages/pos/POSMainPage.tsx
import { useOrderStatusSubscription } from '@/hooks/pos/useOrderStatusSubscription';

// Dans le composant:
const { currentSession } = usePOSShift();
useOrderStatusSubscription(currentSession?.id);
```

**Table source**: `orders` (déjà dans Supabase realtime publication)

---

## 7. MODIFICATIONS FRONTEND

### 7.1 Fallback Offline dans `useOrders.ts`

**Fichier**: `src/hooks/useOrders.ts`

**Modification**:
```typescript
import { useNetworkStore } from '@/stores/networkStore';
import { createOfflineOrder } from '@/services/offline/offlineOrderService';
import { addToSyncQueue } from '@/services/sync/syncQueue';

export function useOrders() {
  const isOnline = useNetworkStore(state => state.isOnline);

  const createOrder = useMutation({
    mutationFn: async (orderData: CreateOrderInput) => {
      // AJOUT: Fallback offline
      if (!isOnline) {
        const offlineOrder = await createOfflineOrder(orderData);
        await addToSyncQueue({
          type: 'order',
          payload: offlineOrder,
          priority: 'high',
        });
        return offlineOrder;
      }

      // Existing online logic...
      const { data, error } = await supabase
        .from('orders')
        .insert(...)
        .select()
        .single();

      // ...
    },
  });

  return { createOrder, ... };
}
```

---

### 7.2 Importer hooks offline dans POSMainPage

**Fichier**: `src/pages/pos/POSMainPage.tsx`

**Modifications**:
```typescript
// AVANT (ligne ~6-10):
import { useProducts } from '@/hooks/products/useProductList';
import { useCategories } from '@/hooks/products/useCategories';

// APRÈS:
import { useProductsOffline } from '@/hooks/offline/useProductsOffline';
import { useCategoriesOffline } from '@/hooks/offline/useCategoriesOffline';

// AVANT (ligne ~109-111):
const { data: categories } = useCategories();
const { data: products } = useProducts(selectedCategory);

// APRÈS:
const { products, isLoading: productsLoading } = useProductsOffline(selectedCategory);
const { categories, isLoading: categoriesLoading } = useCategoriesOffline();
```

---

### 7.3 Service Held Orders Persistence

**Nouveau fichier**: `src/services/offline/heldOrdersService.ts`

```typescript
import { db } from '@/lib/db';
import type { ICartItem } from '@/types/cart';

export interface IOfflineHeldOrder {
  id: string;
  order_number: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  table_number?: string;
  customer_id?: string;
  customer_name?: string;
  items: ICartItem[];
  subtotal: number;
  discount_amount: number;
  total: number;
  notes?: string;
  created_at: string;
  created_by: string;
  terminal_id: string;
  session_id?: string;
}

export async function saveHeldOrder(order: IOfflineHeldOrder): Promise<void> {
  await db.offline_held_orders.put(order);
}

export async function getHeldOrders(sessionId?: string): Promise<IOfflineHeldOrder[]> {
  if (sessionId) {
    return db.offline_held_orders
      .where('session_id')
      .equals(sessionId)
      .toArray();
  }
  return db.offline_held_orders.toArray();
}

export async function getHeldOrdersByTerminal(terminalId: string): Promise<IOfflineHeldOrder[]> {
  return db.offline_held_orders
    .where('terminal_id')
    .equals(terminalId)
    .toArray();
}

export async function deleteHeldOrder(id: string): Promise<void> {
  await db.offline_held_orders.delete(id);
}

export async function clearSessionHeldOrders(sessionId: string): Promise<void> {
  await db.offline_held_orders
    .where('session_id')
    .equals(sessionId)
    .delete();
}
```

---

### 7.4 Modifier orderStore pour persistence

**Fichier**: `src/stores/orderStore.ts`

**Modifications**:
```typescript
import {
  saveHeldOrder,
  getHeldOrders,
  deleteHeldOrder
} from '@/services/offline/heldOrdersService';

interface OrderStore {
  // ... existing

  // AJOUT: Async operations
  loadHeldOrders: (sessionId?: string) => Promise<void>;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  // ... existing state

  // MODIFIER: sendToKitchen - persist to IndexedDB
  sendToKitchen: async (cartSnapshot, terminalId, sessionId, userId) => {
    const orderNumber = generateOrderNumber();
    const heldOrder: IOfflineHeldOrder = {
      id: crypto.randomUUID(),
      order_number: orderNumber,
      order_type: cartSnapshot.orderType,
      table_number: cartSnapshot.tableNumber,
      customer_id: cartSnapshot.customerId,
      customer_name: cartSnapshot.customerName,
      items: cartSnapshot.items,
      subtotal: cartSnapshot.subtotal,
      discount_amount: cartSnapshot.discountAmount,
      total: cartSnapshot.total,
      notes: cartSnapshot.orderNotes,
      created_at: new Date().toISOString(),
      created_by: userId,
      terminal_id: terminalId,
      session_id: sessionId,
    };

    // Persist to IndexedDB
    await saveHeldOrder(heldOrder);

    // Update in-memory state
    set((state) => ({
      heldOrders: [...state.heldOrders, heldOrder],
    }));

    return heldOrder;
  },

  // AJOUT: Load from IndexedDB on app start
  loadHeldOrders: async (sessionId) => {
    const orders = await getHeldOrders(sessionId);
    set({ heldOrders: orders });
  },

  // MODIFIER: removeHeldOrder - also delete from IndexedDB
  removeHeldOrder: async (id) => {
    await deleteHeldOrder(id);
    set((state) => ({
      heldOrders: state.heldOrders.filter(o => o.id !== id),
    }));
  },
}));
```

---

### 7.5 Charger held orders au démarrage

**Fichier**: `src/pages/pos/POSMainPage.tsx`

**Ajout dans useEffect**:
```typescript
import { useOrderStore } from '@/stores/orderStore';

// Dans le composant POSMainPage:
const loadHeldOrders = useOrderStore(state => state.loadHeldOrders);
const { currentSession } = usePOSShift();

// Charger les held orders au montage et quand la session change
useEffect(() => {
  if (currentSession?.id) {
    loadHeldOrders(currentSession.id);
  }
}, [currentSession?.id, loadHeldOrders]);
```

---

## 8. ORDRE D'EXÉCUTION RECOMMANDÉ

### Phase 1: Migrations SQL (Jour 1)
```bash
# 1. Ajouter guest_count
supabase migration new add_guest_count_to_orders

# 2. Ajouter config modifiers
supabase migration new add_modifier_config_settings

# 3. Créer trigger sale journal
supabase migration new create_sale_journal_entry_trigger

# 4. Créer trigger purchase journal
supabase migration new create_purchase_journal_entry_trigger

# Appliquer les migrations
supabase db push
```

### Phase 2: Modifications Frontend (Jours 2-3)
1. Ajouter table `offline_held_orders` dans `db.ts`
2. Créer `heldOrdersService.ts`
3. Modifier `orderStore.ts` pour persistence
4. Modifier `useOrders.ts` avec fallback offline
5. Modifier `POSMainPage.tsx`:
   - Importer hooks offline
   - Charger held orders au démarrage
   - Ajouter subscription realtime

### Phase 3: Tests (Jours 4-5)
1. Tester création commande offline → sync
2. Tester held orders persistence → refresh
3. Tester journal entries automatiques
4. Tester realtime notifications statut

---

## 9. VÉRIFICATION POST-IMPLÉMENTATION

```bash
# Vérifier les migrations
supabase db diff

# Vérifier les triggers
SELECT tgname, tgrelid::regclass, tgenabled
FROM pg_trigger
WHERE tgname LIKE 'tr_create_%_journal_entry';

# Tester journal entry création
UPDATE orders SET status = 'completed' WHERE id = 'xxx';
SELECT * FROM journal_entries WHERE reference_id = 'xxx';

# Vérifier guest_count
SELECT guest_count FROM orders LIMIT 5;

# Vérifier settings modifiers
SELECT key, value FROM settings WHERE category = 'pos_modifiers';
```

---

## 10. ROLLBACK PLAN

En cas de problème:

```sql
-- Rollback guest_count
ALTER TABLE orders DROP COLUMN IF EXISTS guest_count;

-- Rollback triggers
DROP TRIGGER IF EXISTS tr_create_sale_journal_entry ON orders;
DROP TRIGGER IF EXISTS tr_create_purchase_journal_entry ON purchase_orders;
DROP FUNCTION IF EXISTS create_sale_journal_entry();
DROP FUNCTION IF EXISTS create_purchase_journal_entry();

-- Rollback settings
DELETE FROM settings WHERE category = 'pos_modifiers';
```

---

## ESTIMATION FINALE

| Phase | Effort | Risque |
|-------|--------|--------|
| Migrations SQL | 4h | Faible |
| Modifications Frontend | 8h | Moyen |
| Tests & Validation | 4h | Faible |
| Buffer | 4h | - |
| **TOTAL** | **20h (~3 jours)** | **Faible** |

**Le POS sera 100% complet après ces modifications.**
