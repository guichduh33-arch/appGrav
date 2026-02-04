# Story 5.8: Purchase Reception & Stock Update

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Réceptionnaire**,
I want **enregistrer la réception d'une commande fournisseur avec les quantités reçues par ligne**,
So that **le stock est mis à jour automatiquement et je peux gérer les réceptions partielles ou complètes**.

## Acceptance Criteria

### AC1: Réception d'items depuis un PO confirmé
**Given** un PO avec statut "confirmed" ou "partially_received"
**When** je saisis la quantité reçue pour une ligne d'article
**Then** le système:
  - Met à jour `quantity_received` dans `purchase_order_items`
  - Crée un mouvement de stock (`stock_movements`) de type "stock_in"
  - Incrémente `current_stock` du produit correspondant
  - Enregistre l'historique dans `purchase_order_history` avec metadata

### AC2: Mise à jour automatique du statut PO
**Given** une réception d'items est enregistrée
**When** toutes les lignes ont `quantity_received >= quantity`
**Then** le statut PO passe à "received"
**And** `actual_delivery_date` est défini à la date du jour

**Given** une réception partielle est enregistrée
**When** certaines lignes n'ont pas `quantity_received >= quantity`
**Then** le statut PO passe à "partially_received"
**And** je peux faire des réceptions additionnelles

### AC3: Blocage Workflow Offline
**Given** je suis offline
**When** je tente de modifier une quantité reçue
**Then** le champ de saisie est désactivé
**And** la bannière offline warning est affichée

### AC4: Validation des réceptions (contraintes)
**Given** un PO avec statut autre que "confirmed" ou "partially_received"
**When** je tente de saisir une quantité reçue
**Then** l'action est bloquée ou non disponible

**Given** je saisis une quantité reçue > quantité commandée
**When** je valide
**Then** un avertissement s'affiche (optionnel: permettre avec confirmation)

### AC5: Historique des réceptions
**Given** chaque réception d'item
**When** elle est enregistrée
**Then** une entrée est créée dans `purchase_order_history` avec:
  - `action_type`: "partially_received"
  - `description`: "Réception de X unité(s) de [product_name]"
  - `metadata`: { product_name, quantity_received, previous_received, new_received, total_ordered }

## Tasks / Subtasks

- [x] **Task 1: Créer hook useReceivePOItem centralisé** (AC: 1, 2, 5)
  - [x] 1.1: Créer `src/hooks/purchasing/usePurchaseOrderReception.ts` (~200 lignes)
  - [x] 1.2: Implémenter `useReceivePOItem()` mutation avec:
    - Validation statut PO (confirmed ou partially_received)
    - Mise à jour `purchase_order_items.quantity_received`
    - Création mouvement stock si product_id existe
    - Mise à jour `products.current_stock`
    - Logging dans `purchase_order_history`
  - [x] 1.3: Implémenter `useUpdatePOReceptionStatus()` pour calcul automatique du statut
  - [x] 1.4: Ajouter helper `calculateReceptionStatus(items)` pour déterminer "partially_received" vs "received"
  - [x] 1.5: Exporter hooks dans `src/hooks/purchasing/index.ts`

- [x] **Task 2: Mettre à jour getValidTransitions pour réception** (AC: 1, 4)
  - [x] 2.1: Modifier `usePurchaseOrderWorkflow.ts` pour ajouter action "receive" aux transitions valides
  - [x] 2.2: `getValidTransitions('confirmed')` retourne ['receive']
  - [x] 2.3: `getValidTransitions('partially_received')` retourne ['receive']

- [x] **Task 3: Refactoriser PurchaseOrderDetailPage** (AC: 1, 2, 3, 4)
  - [x] 3.1: Remplacer `handleReceiveItem` inline par hook `useReceivePOItem`
  - [x] 3.2: Ajouter validation du statut PO avant d'afficher input réception
  - [x] 3.3: Désactiver inputs si statut n'est pas "confirmed" ou "partially_received"
  - [x] 3.4: Améliorer feedback utilisateur (toast success/error)

- [x] **Task 4: Traductions i18n** (AC: tous)
  - [x] 4.1: Ajouter clés `purchasing.reception.*` dans `fr.json`
  - [x] 4.2: Ajouter clés dans `en.json`
  - [x] 4.3: Ajouter clés dans `id.json`

- [x] **Task 5: Tests unitaires** (AC: 1, 2, 4, 5)
  - [x] 5.1: Créer `src/hooks/purchasing/__tests__/usePurchaseOrderReception.test.ts`
  - [x] 5.2: Test `useReceivePOItem` crée mouvement stock correct
  - [x] 5.3: Test `useReceivePOItem` met à jour statut PO automatiquement
  - [x] 5.4: Test `useReceivePOItem` rejette si statut PO invalide
  - [x] 5.5: Test `calculateReceptionStatus` retourne le bon statut

## Dev Notes

### Architecture Context (ADR-001)

Les bons de commande sont **ONLINE ONLY** (ADR-001):
- Pas de cache offline pour les PO
- Toutes les actions de réception nécessitent une connexion
- L'historique des modifications est loggé dans `purchase_order_history`

[Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-001]

### Code Existant - Logique de Réception

**La fonction `handleReceiveItem` existe DÉJÀ dans PurchaseOrderDetailPage.tsx (lignes 319-417):**

```typescript
// src/pages/purchasing/PurchaseOrderDetailPage.tsx - LOGIQUE EXISTANTE
const handleReceiveItem = async (itemId: string, quantityReceived: number) => {
  // 1. Calcule le delta entre nouvelle et ancienne quantité reçue
  const delta = newReceived - previousReceived;

  // 2. Si delta != 0 et product_id existe:
  //    - Crée mouvement stock (stock_in)
  //    - Met à jour products.current_stock

  // 3. Met à jour purchase_order_items.quantity_received

  // 4. Log dans purchase_order_history

  // 5. Vérifie si toutes les lignes sont complètes:
  //    - Si oui: statut → "received"
  //    - Sinon: statut → "partially_received"
}
```

**Problèmes actuels à corriger:**
1. ❌ Logique inline dans la page au lieu d'un hook réutilisable
2. ❌ Appels Supabase directs au lieu de React Query mutations
3. ❌ Pas de validation explicite du statut PO avant réception
4. ⚠️ Pas de gestion d'erreur avec toast (ajouté partiellement dans 5-7)

### Tables Database Concernées

```sql
-- purchase_order_items (colonnes pertinentes)
id UUID PRIMARY KEY
purchase_order_id UUID FK → purchase_orders
product_id UUID FK → products (nullable)
product_name VARCHAR
quantity DECIMAL
quantity_received DECIMAL DEFAULT 0
quantity_returned DECIMAL DEFAULT 0
unit_price DECIMAL
line_total DECIMAL

-- stock_movements (pour enregistrer réception)
movement_id VARCHAR PRIMARY KEY
product_id UUID FK → products
movement_type VARCHAR ('stock_in', 'stock_out', 'adjustment', etc.)
quantity DECIMAL
stock_before DECIMAL
stock_after DECIMAL
unit_cost DECIMAL
reference_type VARCHAR ('purchase_order', 'production', 'sale', etc.)
reference_id UUID
reason TEXT
notes TEXT
created_at TIMESTAMP

-- products (mise à jour stock)
id UUID PRIMARY KEY
current_stock DECIMAL DEFAULT 0
```

### Workflow State Machine (Mise à jour)

```
┌─────────┐    send     ┌─────────┐   confirm   ┌───────────┐
│  draft  │───────────▶│  sent   │────────────▶│ confirmed │
└─────────┘            └─────────┘             └───────────┘
     │                      │                        │
     │ cancel              │ cancel                 │ receive (partial)
     ▼                      ▼                        ▼
┌───────────┐          ┌───────────┐           ┌──────────────────┐
│ cancelled │◀─────────│ cancelled │           │ partially_received│
└───────────┘          └───────────┘           └──────────────────┘
                                                       │
                                                       │ receive (complete)
                                                       ▼
                                               ┌───────────┐
                                               │  received │
                                               └───────────┘
```

**Transitions valides (mise à jour pour Story 5-8):**
| From Status | Valid Actions |
|-------------|--------------|
| draft | send, cancel, edit |
| sent | confirm, cancel |
| confirmed | **receive** |
| partially_received | **receive** (additional) |
| received | - |
| cancelled | - |

### Pattern de Réception Item (Hook à créer)

```typescript
// src/hooks/purchasing/usePurchaseOrderReception.ts

export interface IReceivePOItemParams {
  purchaseOrderId: string
  itemId: string
  quantityReceived: number
}

export function useReceivePOItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: IReceivePOItemParams) => {
      const { purchaseOrderId, itemId, quantityReceived } = params

      // 1. Validate PO status
      const { data: po } = await supabase
        .from('purchase_orders')
        .select('status')
        .eq('id', purchaseOrderId)
        .single()

      if (!['confirmed', 'partially_received'].includes(po?.status)) {
        throw new Error('INVALID_PO_STATUS')
      }

      // 2. Get current item data
      const { data: item } = await supabase
        .from('purchase_order_items')
        .select('product_id, quantity, quantity_received, unit_price, product_name')
        .eq('id', itemId)
        .single()

      if (!item) throw new Error('ITEM_NOT_FOUND')

      const previousReceived = item.quantity_received || 0
      const delta = quantityReceived - previousReceived

      // 3. Update stock if delta != 0 and product_id exists
      if (delta !== 0 && item.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('current_stock')
          .eq('id', item.product_id)
          .single()

        const currentStock = product?.current_stock || 0
        const newStock = currentStock + delta

        // Create stock movement
        await supabase.from('stock_movements').insert({
          movement_id: `MV-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          product_id: item.product_id,
          movement_type: 'stock_in',
          quantity: delta,
          stock_before: currentStock,
          stock_after: newStock,
          unit_cost: item.unit_price,
          reference_type: 'purchase_order',
          reference_id: purchaseOrderId,
          reason: `Réception PO`,
          notes: `${item.product_name} - ${delta > 0 ? '+' : ''}${delta}`,
        })

        // Update product stock
        await supabase
          .from('products')
          .update({ current_stock: newStock })
          .eq('id', item.product_id)
      }

      // 4. Update item quantity_received
      await supabase
        .from('purchase_order_items')
        .update({ quantity_received: quantityReceived })
        .eq('id', itemId)

      // 5. Log history
      if (delta !== 0) {
        await logPOHistory({
          purchaseOrderId,
          actionType: 'partially_received',
          previousStatus: po.status,
          newStatus: null, // Sera mis à jour séparément
          description: `Réception de ${delta} unité(s) de ${item.product_name}`,
          metadata: {
            product_name: item.product_name,
            quantity_received: delta,
            previous_received: previousReceived,
            new_received: quantityReceived,
            total_ordered: item.quantity,
          },
        })
      }

      // 6. Update PO status based on all items
      await updatePOReceptionStatus(purchaseOrderId)

      return { itemId, quantityReceived, delta }
    },
    onSuccess: (_, { purchaseOrderId, itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-order', purchaseOrderId] })
    },
  })
}
```

### Learnings from Story 5-7

1. **React Query invalidation** - Invalider les deux queries (liste + single) après mutation
2. **Traductions 3 locales** - TOUJOURS ajouter FR, EN, ID en parallèle
3. **Bannière offline pattern** - Utiliser `useNetworkStatus()` + désactiver inputs
4. **Toast feedback** - Ajouter toast.error dans catch pour feedback utilisateur
5. **Technical debt 5-7** - La page fait 1131 lignes (max 300) - refactoring futur nécessaire

### Clés i18n à Ajouter

```json
{
  "purchasing": {
    "reception": {
      "success": "Réception enregistrée avec succès",
      "error": "Erreur lors de l'enregistrement de la réception",
      "invalidStatus": "La réception n'est possible que pour les commandes confirmées",
      "quantityExceedsOrdered": "Attention: la quantité reçue dépasse la quantité commandée",
      "allReceived": "Réception complète - Bon de commande clôturé",
      "partialReceived": "Réception partielle enregistrée"
    },
    "detail": {
      "history": {
        "partiallyReceived": "Réception partielle"
      }
    }
  }
}
```

### Testing Strategy

1. **Unit tests** (usePurchaseOrderReception.test.ts):
   - `useReceivePOItem` crée mouvement stock avec bon delta
   - `useReceivePOItem` met à jour `products.current_stock`
   - `useReceivePOItem` rejette si PO status n'est pas confirmed/partially_received
   - `useReceivePOItem` passe statut à "received" quand tout est reçu
   - `useReceivePOItem` passe statut à "partially_received" sinon
   - `useReceivePOItem` log correctement dans history

2. **Integration test** (manuel):
   - Créer PO → Confirmer → Réceptionner partiellement → Vérifier statut "partially_received"
   - Compléter réception → Vérifier statut "received"
   - Vérifier stock_movements créés
   - Vérifier products.current_stock mis à jour
   - Vérifier historique complet

### Project Structure Notes

**Nouveaux fichiers à créer:**
```
src/hooks/purchasing/
├── usePurchaseOrderReception.ts     (~200 lignes - hooks réception)
└── __tests__/
    └── usePurchaseOrderReception.test.ts (~150 lignes)
```

**Fichiers à modifier:**
```
src/hooks/purchasing/usePurchaseOrderWorkflow.ts  (ajouter transitions receive)
src/hooks/purchasing/index.ts                     (ajouter exports)
src/pages/purchasing/PurchaseOrderDetailPage.tsx  (utiliser nouveau hook)
src/locales/fr.json                               (+10 clés)
src/locales/en.json                               (+10 clés)
src/locales/id.json                               (+10 clés)
```

### Dependencies

- ✅ Story 5-6: Hooks purchasing créés (`usePurchaseOrders.ts`)
- ✅ Story 5-7: Workflow hooks créés (`usePurchaseOrderWorkflow.ts`)
- ✅ Story 5-1: `useNetworkStatus` hook
- ✅ Table `purchase_order_items` avec `quantity_received`
- ✅ Table `stock_movements` existe
- ✅ Table `products` avec `current_stock`

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-5.8]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-001]
- [Source: _bmad-output/implementation-artifacts/5-7-purchase-order-workflow.md]
- [Source: src/hooks/purchasing/usePurchaseOrders.ts]
- [Source: src/hooks/purchasing/usePurchaseOrderWorkflow.ts]
- [Source: src/pages/purchasing/PurchaseOrderDetailPage.tsx#L319-L417]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

### Completion Notes List

- ✅ Created `usePurchaseOrderReception.ts` hook with `useReceivePOItem`, `useUpdatePOReceptionStatus`, `calculateReceptionStatus`, `canReceiveItems`, and `logPOHistory` exports
- ✅ Updated `getValidTransitions` to return `['receive']` for 'confirmed' and 'partially_received' statuses
- ✅ Added 'receive' to `TPOWorkflowAction` type
- ✅ Refactored `PurchaseOrderDetailPage.tsx` to use new hook instead of inline Supabase calls
- ✅ Added status validation and improved input disable logic based on PO status
- ✅ Added toast feedback for success/error cases with i18n support
- ✅ Added `purchasing.reception.*` translation keys to all 3 locales (fr, en, id)
- ✅ Created comprehensive test suite with 20 new tests (64 total purchasing tests pass)
- ✅ Updated existing workflow tests to reflect new transitions

### File List

**New files:**
- `src/hooks/purchasing/usePurchaseOrderReception.ts` - Reception hooks (~220 lines)
- `src/hooks/purchasing/__tests__/usePurchaseOrderReception.test.ts` - Reception tests (~300 lines)
- `src/hooks/purchasing/usePurchaseOrderWorkflow.ts` - Workflow hooks with 'receive' action type and transitions (~320 lines)
- `src/hooks/purchasing/__tests__/usePurchaseOrderWorkflow.test.ts` - Workflow tests (~480 lines)

**Modified files:**
- `src/hooks/purchasing/index.ts` - Added exports for new reception and workflow hooks
- `src/hooks/purchasing/usePurchaseOrders.ts` - Added history logging helpers (getActionTypeFromStatus, getDefaultDescription)
- `src/pages/purchasing/PurchaseOrderDetailPage.tsx` - Refactored to use reception hook, improved input handling (onBlur)
- `src/pages/purchasing/PurchaseOrderDetailPage.css` - Added offline banner, danger button styles
- `src/locales/fr.json` - Added `purchasing.reception.*` keys
- `src/locales/en.json` - Added `purchasing.reception.*` keys
- `src/locales/id.json` - Added `purchasing.reception.*` keys

## Change Log

- 2026-02-04: Story 5-8 completed - Purchase reception & stock update feature implemented
- 2026-02-04: Code Review fixes applied:
  - Fixed code duplication: centralized `logPOHistory` in `usePurchaseOrderWorkflow.ts`
  - Fixed inefficient input: changed from `onChange` to `onBlur` for reception input
  - Fixed File List: corrected new vs modified file classification

