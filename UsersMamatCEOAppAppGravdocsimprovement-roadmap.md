# Plan d'Amelioration AppGrav ERP/POS

**Projet** : AppGrav ERP/POS pour The Breakery (boulangerie francaise, Lombok, Indonesie)
**Date** : Fevrier 2026
**Stack** : React 18 + TypeScript + Vite + Supabase + Capacitor
**Equipe** : 1 developpeur solo assiste par agents IA
**Scale actuel** : ~200 tx/jour | **Cible** : 1 000 tx/jour
**Base de donnees** : 78 tables PostgreSQL, 113 migrations
**Frontend** : 103 pages React, 94 hooks, 81 services, 12 stores Zustand

---

## Sommaire

| Phase | Periode | Focus | Effort |
|-------|---------|-------|--------|
| **P1 -- Corrections Critiques** | Semaines 1-4 | Bugs, securite, dette technique | ~20 jours |
| **P2 -- Ameliorations Importantes** | Semaines 5-12 | Fonctionnalites metier, qualite | ~60 jours |
| **P3 -- Nice-to-Have** | Semaines 13-24 | Innovation, expansion | ~50 jours |

---

## Phase 1 -- Corrections Critiques (P1) -- Semaines 1-4

> Objectif : Stabiliser le systeme, corriger les risques de securite et les incoherences de donnees.

---

### 1.1 order_items.quantity INTEGER --> DECIMAL(10,3)

**Probleme**
La colonne `order_items.quantity` est definie comme `INTEGER` (migration `004_sales_orders.sql`, ligne 176). Il est impossible de commander des quantites fractionnelles comme 0,5 kg de farine, 1,5 parts de gateau, ou des produits au poids.

**Impact Business**
- Blocage de la vente au poids (patisserie, boulangerie artisanale)
- Impossible de gerer les commandes B2B en vrac (0,75 carton)
- Arrondi silencieux a l'entier --> ecarts de stock cumules

**Solution Technique**
Migration SQL + mise a jour des types TypeScript.

**Effort** : 0,5 jour

```sql
-- Migration: alter_order_items_quantity_to_decimal
BEGIN;

-- 1. Modifier le type de la colonne
ALTER TABLE public.order_items
  ALTER COLUMN quantity TYPE DECIMAL(10,3)
  USING quantity::DECIMAL(10,3);

-- 2. Mettre a jour la valeur par defaut
ALTER TABLE public.order_items
  ALTER COLUMN quantity SET DEFAULT 1.000;

-- 3. Meme traitement pour les tables associees
ALTER TABLE public.product_combo_group_items
  ALTER COLUMN quantity TYPE DECIMAL(10,3)
  USING quantity::DECIMAL(10,3);

ALTER TABLE public.promotion_products
  ALTER COLUMN quantity TYPE DECIMAL(10,3)
  USING quantity::DECIMAL(10,3);

COMMIT;
```

```typescript
// src/types/database.ts -- Mise a jour de l'interface
export interface OrderItem {
  // ...
  quantity: number;  // Deja number en TS, pas de changement cote type
  // Mais les validations frontend doivent accepter les decimales
}

// src/components/pos/CartItem.tsx -- Validation quantite
const validateQuantity = (value: number): boolean => {
  return value > 0 && value <= 9999.999;
  // Avant : Number.isInteger(value) && value > 0
};
```

---

### 1.2 Refactoring useProducts.ts (3 050 lignes)

**Probleme**
Le fichier `src/hooks/useProducts.ts` contient **3 050 lignes** dont :
- ~2 700 lignes de donnees mock (`MOCK_CATEGORIES` ligne 15, `MOCK_PRODUCTS` ligne 170)
- 4 hooks reels (`useCategories`, `useProducts`, `useProductWithModifiers`, `useProductSearch`)
- Melange de donnees statiques et logique metier

**Impact Business**
- Impossible de faire du tree-shaking (le bundle inclut toujours les mocks)
- Temps de build augmente, DX degradee
- Tests difficiles a isoler
- Risque de regression a chaque modification

**Solution Technique**
Decouper en 5 fichiers specialises.

**Effort** : 3 jours

```
src/hooks/products/
  index.ts                 # Re-exports publics
  useProductCatalog.ts     # useProducts + useProductWithModifiers
  useProductSearch.ts      # useProductSearch
  useCategories.ts         # useCategories
  useMockData.ts           # MOCK_CATEGORIES + MOCK_PRODUCTS (dev only)
```

```typescript
// src/hooks/products/useCategories.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useNetworkStore } from '@/stores/networkStore';
import {
  syncCategoriesToOffline,
  getCategoriesFromOffline,
} from '@/services/sync/productSync';
import type { Category } from '@/types/database';

export function useCategories() {
  const isOnline = useNetworkStore((s) => s.isOnline);

  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      if (!isOnline) {
        const offline = await getCategoriesFromOffline();
        return offline as unknown as Category[];
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      if (data) {
        syncCategoriesToOffline(data).catch(console.error);
      }

      return data || [];
    },
  });
}
```

```typescript
// src/hooks/products/useProductCatalog.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useNetworkStore } from '@/stores/networkStore';
import type { Product, ProductWithCategory } from '@/types/database';

export function useProducts(categoryId: string | null = null) {
  const isOnline = useNetworkStore((s) => s.isOnline);

  return useQuery<ProductWithCategory[]>({
    queryKey: ['products', categoryId],
    queryFn: async () => {
      // ... logique existante sans les mocks
    },
  });
}

export function useProductWithModifiers(productId: string) {
  return useQuery({
    queryKey: ['product', productId, 'modifiers'],
    queryFn: async () => {
      const { data: product, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', productId)
        .single();

      if (error || !product) throw error || new Error('Product not found');

      const { data: modifiers } = await supabase
        .from('product_modifiers')
        .select('*')
        .eq('is_active', true)
        .or(
          'product_id.eq.' + productId +
          ',category_id.eq.' + product.category_id
        )
        .order('group_sort_order')
        .order('option_sort_order');

      return { product, modifiers: modifiers || [] };
    },
    enabled: !!productId,
  });
}
```

```typescript
// src/hooks/products/index.ts
export { useCategories } from './useCategories';
export { useProducts, useProductWithModifiers } from './useProductCatalog';
export { useProductSearch } from './useProductSearch';
```

---

### 1.3 Consolidation syncEngine.ts / syncEngineV2.ts

**Probleme**
Deux moteurs de synchronisation coexistent :
- `src/services/sync/syncEngine.ts` (465 lignes) -- V1 legacy, utilise `syncQueue.ts`
- `src/services/sync/syncEngineV2.ts` (434 lignes) -- V2, utilise `syncQueueHelpers.ts` + processeurs dedies

Les deux ont la meme structure (`ISyncEngineState`, `SYNC_START_DELAY`, `ITEM_PROCESS_DELAY`) mais des imports et des strategies de traitement differents.

**Impact Business**
- Risque d'activation accidentelle des deux engines simultanement
- Confusion pour les futurs developpeurs
- Double maintenance (bug corrige dans V2 mais pas V1)
- Logique de resolution des ID mappings uniquement dans V2

**Solution Technique**
Migrer completement vers V2 et supprimer V1.

**Effort** : 2 jours

```typescript
// Etape 1: Trouver tous les imports de syncEngine.ts (V1)
// Rechercher: import.*from.*syncEngine[^V]
// Remplacer par les imports de syncEngineV2

// Etape 2: Renommer syncEngineV2.ts -> syncEngine.ts
// git mv src/services/sync/syncEngineV2.ts src/services/sync/syncEngine.ts

// Etape 3: Mettre a jour les tests
// git mv src/services/sync/__tests__/syncEngineV2.test.ts
//        src/services/sync/__tests__/syncEngine.test.ts

// Etape 4: Supprimer l'ancien fichier V1

// Etape 5: Verifier que les exports sont identiques
export {
  startSyncEngine,
  stopSyncEngine,
  triggerSync,
  getSyncEngineState,
  isAutoSyncEnabled,
  setAutoSync,
} from './syncEngine'; // Maintenant pointe vers ex-V2
```

---

### 1.4 Regeneration database.generated.ts

**Probleme**
Le fichier `src/types/database.generated.ts` est desynchronise avec le schema reel de la base de donnees. Les modifications de schema recentes (migrations 100+) n'ont pas ete refletees dans les types generes.

**Impact Business**
- Faux positifs/negatifs du type-checker TypeScript
- Bugs silencieux a l'execution (proprietes manquantes)
- Temps perdu a debugger des erreurs de types

**Solution Technique**
Regenerer les types via la CLI Supabase.

**Effort** : 0,5 jour

```bash
# Regenerer les types depuis le projet Supabase distant
npx supabase gen types typescript \
  --project-id "VOTRE_PROJECT_ID" \
  --schema public \
  > src/types/database.generated.ts

# Verifier la coherence
npm run build
```

```typescript
// Apres regeneration, verifier que les interfaces principales sont a jour :
// - Database["public"]["Tables"]["order_items"]["Row"] doit avoir quantity: number
// - Database["public"]["Enums"]["movement_type"] doit inclure tous les types
// - Toutes les nouvelles tables (section_stocks, etc.) doivent etre presentes
```

---

### 1.5 UI de Resolution de Conflits Offline

**Probleme**
Le systeme offline-first detecte les conflits (via `order.updated_at < operation.created_at` dans `financialOperationService.ts`) mais il n'existe pas d'interface utilisateur pour resoudre ces conflits. L'utilisateur est simplement notifie du rejet.

**Impact Business**
- Utilisateurs bloques sur des commandes en conflit
- Perte de donnees potentielle si les conflits sont ignores
- Frustration operationnelle en cas de connectivite instable

**Solution Technique**
Creer un composant de resolution de conflits avec 3 strategies : garder local, garder serveur, fusion manuelle.

**Effort** : 5 jours

```typescript
// src/types/offline.ts -- Nouveaux types
export type TConflictResolution = 'keep_local' | 'keep_server' | 'merge';

export interface ISyncConflict {
  id: string;
  entity: TSyncEntity;
  entityId: string;
  localVersion: Record<string, unknown>;
  serverVersion: Record<string, unknown>;
  conflictFields: string[];
  detectedAt: Date;
  resolvedAt: Date | null;
  resolution: TConflictResolution | null;
}
```

```typescript
// src/components/sync/ConflictResolver.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import type { ISyncConflict, TConflictResolution } from '@/types/offline';

interface ConflictResolverProps {
  conflict: ISyncConflict;
  onResolve: (id: string, resolution: TConflictResolution) => Promise<void>;
}

export function ConflictResolver({ conflict, onResolve }: ConflictResolverProps) {
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async (resolution: TConflictResolution) => {
    setIsResolving(true);
    try {
      await onResolve(conflict.id, resolution);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="h-5 w-5" />
          Sync Conflict: {conflict.entity}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Badge variant="outline">Local</Badge>
            <pre className="mt-2 rounded bg-white p-2 text-xs">
              {JSON.stringify(conflict.localVersion, null, 2)}
            </pre>
          </div>
          <div>
            <Badge variant="outline">Server</Badge>
            <pre className="mt-2 rounded bg-white p-2 text-xs">
              {JSON.stringify(conflict.serverVersion, null, 2)}
            </pre>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleResolve('keep_local')} disabled={isResolving}>
            Keep Local
          </Button>
          <Button variant="outline" onClick={() => handleResolve('keep_server')} disabled={isResolving}>
            Keep Server
          </Button>
          <Button variant="default" onClick={() => handleResolve('merge')} disabled={isResolving}>
            Merge
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 1.6 Consolidation Types Mouvement Stock ('ingredient' vs 'production_out')

**Probleme**
L'enum `movement_type` (defini dans `001_extensions_enums.sql`) contient a la fois :
- `'production_out'` -- "Production output (raw materials)"
- `'ingredient'` -- "Ingredient deduction"

Ces deux types representent la meme operation metier : la deduction de matieres premieres lors de la production. Le trigger dans `016_integrity_fixes.sql` les traite identiquement (les deux font `-ABS(NEW.quantity)`).

**Impact Business**
- Double comptage potentiel dans les rapports d'inventaire
- Confusion dans les filtres de mouvement de stock
- Incoherence dans les exports comptables

**Solution Technique**
Deprecier `'ingredient'` au profit de `'production_out'` avec migration de donnees.

**Effort** : 1 jour

```sql
-- Migration: consolidate_movement_types
BEGIN;

-- 1. Migrer les donnees existantes
UPDATE public.stock_movement_items
SET movement_type = 'production_out'
WHERE movement_type = 'ingredient';

-- 2. Documenter la depreciation
COMMENT ON TYPE movement_type IS
  'Types de mouvements de stock. Note: ingredient est deprecie, utiliser production_out pour les deductions de matieres premieres.';

COMMIT;
```

```typescript
// src/services/inventory/stockMovementService.ts
const DEPRECATED_MOVEMENT_TYPES = ['ingredient'] as const;

export function normalizeMovementType(type: string): string {
  const mapping: Record<string, string> = {
    ingredient: 'production_out',
  };
  return mapping[type] || type;
}
```

---

### 1.7 Table de Suivi Paiements PO (purchase_order_payments)

**Probleme**
Le module d'achats (`purchase_orders`, `po_items`) n'a pas de table de suivi des paiements fournisseurs. L'etat du paiement (`payment_status`) est un simple champ sur la commande d'achat sans historique ni tracabilite.

**Impact Business**
- Pas de tracabilite des paiements partiels aux fournisseurs
- Impossible de reconcilier les echeances
- Pas de rapport d'echeancier fournisseur fiable
- Le composant `OutstandingPurchasePaymentTab.tsx` existe deja mais manque de donnees structurees

**Solution Technique**
Creer la table `purchase_order_payments` avec RLS.

**Effort** : 2 jours

```sql
-- Migration: create_purchase_order_payments
BEGIN;

CREATE TABLE IF NOT EXISTS public.purchase_order_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'completed'
      CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
    notes TEXT,
    receipt_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_po_payments_order ON public.purchase_order_payments(purchase_order_id);
CREATE INDEX idx_po_payments_date ON public.purchase_order_payments(payment_date);
CREATE INDEX idx_po_payments_status ON public.purchase_order_payments(status);

CREATE OR REPLACE VIEW public.view_po_payment_summary AS
SELECT
    po.id AS purchase_order_id,
    po.order_number,
    po.supplier_id,
    s.name AS supplier_name,
    po.total_amount,
    COALESCE(SUM(pop.amount) FILTER (WHERE pop.status = 'completed'), 0) AS total_paid,
    po.total_amount - COALESCE(SUM(pop.amount) FILTER (WHERE pop.status = 'completed'), 0) AS balance_due,
    po.payment_status,
    MAX(pop.payment_date) AS last_payment_date
FROM public.purchase_orders po
LEFT JOIN public.purchase_order_payments pop ON po.id = pop.purchase_order_id
LEFT JOIN public.suppliers s ON po.supplier_id = s.id
GROUP BY po.id, po.order_number, po.supplier_id, s.name, po.total_amount, po.payment_status;

ALTER TABLE public.purchase_order_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read po_payments"
    ON public.purchase_order_payments
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permission-based insert po_payments"
    ON public.purchase_order_payments
    FOR INSERT WITH CHECK (public.user_has_permission(auth.uid(), 'inventory.create'));

CREATE POLICY "Permission-based update po_payments"
    ON public.purchase_order_payments
    FOR UPDATE USING (public.user_has_permission(auth.uid(), 'inventory.update'));

CREATE TRIGGER set_updated_at_purchase_order_payments
    BEFORE UPDATE ON public.purchase_order_payments
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

COMMIT;
```

```typescript
// src/types/database.ts
export interface PurchaseOrderPayment {
  id: string;
  purchase_order_id: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  payment_date: string;
  due_date: string | null;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes: string | null;
  receipt_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface POPaymentSummary {
  purchase_order_id: string;
  order_number: string;
  supplier_id: string;
  supplier_name: string;
  total_amount: number;
  total_paid: number;
  balance_due: number;
  payment_status: string;
  last_payment_date: string | null;
}
```
