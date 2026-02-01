# Story 3.8: Pending Sync Counter Display

Status: completed

## Story

As a **Manager**,
I want **voir combien de transactions attendent la sync**,
so that **je peux surveiller le système**.

## Acceptance Criteria

### AC1: Compteur Visible dans le Header/Dashboard
**Given** des transactions sont en attente de sync
**When** je regarde le header ou dashboard
**Then** je vois un compteur discret (ex: "5 pending")
**And** le compteur inclut les items `pending` + `failed`

### AC2: Panel de Détail au Clic
**Given** je clique sur le compteur de sync
**When** le panel s'ouvre
**Then** je vois la liste des transactions en attente
**And** leur statut (pending, syncing, failed)
**And** le timestamp de création

### AC3: Affichage par Type d'Entité
**Given** le panel de détail est ouvert
**When** je consulte la liste
**Then** les items sont groupés par type (Sessions, Orders, Payments)
**And** je vois le nombre par catégorie

### AC4: Actions sur les Items Failed
**Given** un item est en statut `failed`
**When** je le sélectionne dans le panel
**Then** je vois le message d'erreur (`lastError`)
**And** je peux le retry manuellement
**And** je peux le supprimer (avec confirmation)

### AC5: Refresh Automatique et Manuel
**Given** le compteur est visible
**When** des items sont ajoutés ou synced
**Then** le compteur se met à jour en < 5 secondes
**And** je peux forcer un refresh manuel

### AC6: Masquage si Aucun Item Pending
**Given** aucun item n'est en attente de sync
**When** je regarde le header
**Then** le compteur est masqué (pas de "0 pending")

## Tasks / Subtasks

- [x] **Task 1: Créer le composant PendingSyncCounter** (AC: 1, 6)
  - [x] 1.1: Créer `src/components/sync/PendingSyncCounter.tsx`
  - [x] 1.2: Utiliser `useSyncQueue` hook existant pour obtenir les counts
  - [x] 1.3: Afficher badge discret avec icône Cloud et nombre
  - [x] 1.4: Masquer si `pendingTotal === 0`
  - [x] 1.5: Animer l'icône si `isSyncing === true`

- [x] **Task 2: Créer le composant PendingSyncPanel (Sheet/Drawer)** (AC: 2, 3)
  - [x] 2.1: Créer `src/components/sync/PendingSyncPanel.tsx`
  - [x] 2.2: Utiliser shadcn/ui Sheet component
  - [x] 2.3: Afficher header avec total et bouton refresh
  - [x] 2.4: Grouper items par entity (pos_sessions, orders, payments)
  - [x] 2.5: Afficher status badge et timestamp pour chaque item

- [x] **Task 3: Créer le composant PendingSyncItem** (AC: 2, 4)
  - [x] 3.1: Créer `src/components/sync/PendingSyncItem.tsx`
  - [x] 3.2: Afficher entity type, entityId, status, created_at
  - [x] 3.3: Afficher lastError si status === 'failed'
  - [x] 3.4: Ajouter bouton Retry pour items failed
  - [x] 3.5: Ajouter bouton Delete avec confirmation dialog

- [x] **Task 4: Implémenter les actions retry/delete** (AC: 4)
  - [x] 4.1: Créer fonction `retryFailedItem(itemId)` dans syncQueueHelpers
  - [x] 4.2: Créer fonction `deleteQueueItem(itemId)` dans syncQueueHelpers
  - [x] 4.3: Connecter les boutons aux actions
  - [x] 4.4: Refresh la liste après action

- [x] **Task 5: Créer le hook usePendingSyncItems** (AC: 2, 5)
  - [x] 5.1: Créer `src/hooks/sync/usePendingSyncItems.ts`
  - [x] 5.2: Charger items depuis `db.offline_sync_queue`
  - [x] 5.3: Grouper par entity type
  - [x] 5.4: Refresh sur interval (5 seconds) et après mutations

- [x] **Task 6: Intégrer dans le Layout/Header** (AC: 1, 5)
  - [x] 6.1: Identifier le composant header principal (AppLayout ou MainLayout)
  - [x] 6.2: Ajouter PendingSyncCounter à côté du NetworkIndicator existant
  - [x] 6.3: Vérifier la responsivité (mobile et desktop)

- [x] **Task 7: Ajouter les traductions** (AC: 1, 2, 3, 4)
  - [x] 7.1: Ajouter clés `sync.counter.*` dans `fr.json`
  - [x] 7.2: Ajouter clés dans `en.json`
  - [x] 7.3: Ajouter clés dans `id.json`

- [x] **Task 8: Créer les tests unitaires** (AC: 1, 2, 3, 4, 5, 6)
  - [x] 8.1: Tests pour PendingSyncCounter (affichage, masquage, animation)
  - [x] 8.2: Tests pour usePendingSyncItems hook
  - [x] 8.3: Tests pour retryFailedItem et deleteQueueItem

## Dev Notes

### Architecture Compliance (MANDATORY)

**Existing Infrastructure to REUSE:**

1. **useSyncQueue hook** [Source: src/hooks/useSyncQueue.ts]
   - Déjà implémenté dans Story 2.6
   - Fournit `pendingTotal`, `counts`, `isSyncing`, `syncStatus`
   - Refresh automatique toutes les 5 secondes
   ```typescript
   const { pendingTotal, counts, isSyncing, refreshCounts } = useSyncQueue();
   ```

2. **syncQueueHelpers** [Source: src/services/sync/syncQueueHelpers.ts]
   - `getPendingSyncCount()` - Count pending items
   - `getQueueCounts()` - Full breakdown by status
   - `getItemsToSync()` - All items needing sync
   - `resetToPending(itemId)` - Reset failed item for retry
   - À ajouter: `deleteQueueItem(itemId)`
   ```typescript
   import {
     getPendingSyncCount,
     getQueueCounts,
     resetToPending
   } from '@/services/sync/syncQueueHelpers';
   ```

3. **syncStore** [Source: src/stores/syncStore.ts]
   - `pendingCount`, `failedCount`, `isSyncing`, `syncStatus`
   - Actions: `setPendingCount`, `setFailedCount`
   ```typescript
   const { pendingCount, failedCount, isSyncing } = useSyncStore();
   ```

4. **SyncStatusBadge** [Source: src/components/sync/SyncStatusBadge.tsx]
   - Badge avec icônes pour statuts: local, pending_sync, synced, conflict
   - Peut être réutilisé/adapté pour le panel de détail

### Component Structure

```
src/components/sync/
├── PendingSyncCounter.tsx     # NEW: Badge compteur dans header
├── PendingSyncPanel.tsx       # NEW: Sheet avec liste détaillée
├── PendingSyncItem.tsx        # NEW: Ligne item dans le panel
├── SyncStatusBadge.tsx        # EXISTING: Badge status individual
└── PostOfflineSyncReport.tsx  # EXISTING: Rapport post-sync
```

### UI Pattern (shadcn/ui)

```typescript
// PendingSyncCounter - Badge cliquable
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Cloud, RefreshCw } from 'lucide-react';

// PendingSyncPanel - Liste dans Sheet
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// PendingSyncItem - Actions
import { Button } from '@/components/ui/button';
import { AlertDialog } from '@/components/ui/alert-dialog';
```

### Types from Story 3.6

```typescript
// src/types/offline.ts
export interface ISyncQueueItem {
  id?: number;
  entity: TSyncEntity;  // 'orders' | 'payments' | 'pos_sessions' | ...
  action: TSyncAction;  // 'create' | 'update' | 'delete'
  entityId: string;     // LOCAL-uuid
  payload: Record<string, unknown>;
  created_at: string;
  status: TSyncStatus;  // 'pending' | 'syncing' | 'failed' | 'completed'
  retries: number;
  lastError?: string;
}
```

### Visual Design Guidelines

```
┌────────────────────────────────────────────────────────┐
│ Header:                                                │
│   [Logo]  [Nav Items...]           [🌐] [☁️ 5] [👤]   │
│                                    ↑    ↑             │
│                           Network  Sync               │
│                           Indicator Counter           │
└────────────────────────────────────────────────────────┘

Counter states:
- Hidden: pendingTotal === 0
- Normal: ☁️ 5 (blue badge)
- Syncing: ☁️ ⟳ 5 (animated cloud)
- Has Failed: ☁️ 5 (orange badge if any failed)

Panel Layout:
┌──────────────────────────────────────┐
│ Pending Sync          [⟳ Refresh]   │
│ 5 items pending                      │
├──────────────────────────────────────┤
│ Sessions (1)                         │
│ ├─ LOCAL-SESSION-123  ⏳ pending     │
├──────────────────────────────────────┤
│ Orders (3)                           │
│ ├─ LOCAL-ORDER-001    ⏳ pending     │
│ ├─ LOCAL-ORDER-002    ⟳ syncing     │
│ ├─ LOCAL-ORDER-003    ❌ failed     │
│ │   └─ Error: Connection timeout    │
│ │       [Retry] [Delete]            │
├──────────────────────────────────────┤
│ Payments (1)                         │
│ ├─ LOCAL-PAYMENT-001  ⏳ pending     │
└──────────────────────────────────────┘
```

### Entity Display Names

```typescript
const ENTITY_LABELS: Record<TSyncEntity, { fr: string; en: string; id: string }> = {
  pos_sessions: { fr: 'Sessions', en: 'Sessions', id: 'Sesi' },
  orders: { fr: 'Commandes', en: 'Orders', id: 'Pesanan' },
  order_items: { fr: 'Articles', en: 'Items', id: 'Item' },
  payments: { fr: 'Paiements', en: 'Payments', id: 'Pembayaran' },
  customers: { fr: 'Clients', en: 'Customers', id: 'Pelanggan' },
  products: { fr: 'Produits', en: 'Products', id: 'Produk' },
  categories: { fr: 'Catégories', en: 'Categories', id: 'Kategori' },
};
```

### Previous Story Intelligence (Story 3.6)

**Key Functions Created:**
- `getPendingSyncCount()` - Returns count of pending items
- `getQueueCounts()` - Returns `{ pending, syncing, failed, completed, total }`
- `getItemsToSync()` - Returns array of pending + retryable failed items
- `resetToPending(itemId)` - Resets failed item to pending for retry
- `cleanupCompletedItems()` - Removes synced items from queue

**Testing Pattern:**
```typescript
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';

beforeEach(async () => {
  await db.offline_sync_queue.clear();
});
```

### Traductions à Ajouter

```json
// fr.json
{
  "sync": {
    "counter": {
      "pending": "{count} en attente",
      "syncing": "Synchronisation...",
      "allSynced": "Tout est synchronisé"
    },
    "panel": {
      "title": "Sync en Attente",
      "subtitle": "{count} éléments en attente",
      "noItems": "Aucun élément en attente",
      "refresh": "Actualiser",
      "retry": "Réessayer",
      "delete": "Supprimer",
      "deleteConfirm": "Êtes-vous sûr de vouloir supprimer cet élément ?",
      "deleteWarning": "Cette action est irréversible. L'élément ne sera pas synchronisé.",
      "error": "Erreur"
    },
    "entity": {
      "pos_sessions": "Sessions",
      "orders": "Commandes",
      "order_items": "Articles",
      "payments": "Paiements"
    },
    "status": {
      "pending": "En attente",
      "syncing": "En cours",
      "failed": "Échec"
    }
  }
}
```

```json
// en.json
{
  "sync": {
    "counter": {
      "pending": "{count} pending",
      "syncing": "Syncing...",
      "allSynced": "All synced"
    },
    "panel": {
      "title": "Pending Sync",
      "subtitle": "{count} items pending",
      "noItems": "No items pending",
      "refresh": "Refresh",
      "retry": "Retry",
      "delete": "Delete",
      "deleteConfirm": "Are you sure you want to delete this item?",
      "deleteWarning": "This action cannot be undone. The item will not be synced.",
      "error": "Error"
    },
    "entity": {
      "pos_sessions": "Sessions",
      "orders": "Orders",
      "order_items": "Items",
      "payments": "Payments"
    },
    "status": {
      "pending": "Pending",
      "syncing": "Syncing",
      "failed": "Failed"
    }
  }
}
```

```json
// id.json
{
  "sync": {
    "counter": {
      "pending": "{count} tertunda",
      "syncing": "Menyinkronkan...",
      "allSynced": "Semua tersinkron"
    },
    "panel": {
      "title": "Sync Tertunda",
      "subtitle": "{count} item tertunda",
      "noItems": "Tidak ada item tertunda",
      "refresh": "Segarkan",
      "retry": "Coba lagi",
      "delete": "Hapus",
      "deleteConfirm": "Apakah Anda yakin ingin menghapus item ini?",
      "deleteWarning": "Tindakan ini tidak dapat dibatalkan. Item tidak akan disinkronkan.",
      "error": "Error"
    },
    "entity": {
      "pos_sessions": "Sesi",
      "orders": "Pesanan",
      "order_items": "Item",
      "payments": "Pembayaran"
    },
    "status": {
      "pending": "Tertunda",
      "syncing": "Menyinkronkan",
      "failed": "Gagal"
    }
  }
}
```

### Testing Strategy

1. **PendingSyncCounter Tests:**
   - Renders badge when pendingTotal > 0
   - Hidden when pendingTotal === 0
   - Shows syncing animation when isSyncing
   - Opens panel on click

2. **usePendingSyncItems Tests:**
   - Groups items by entity correctly
   - Refreshes on interval
   - Returns empty groups when no items

3. **Action Tests:**
   - retryFailedItem resets status to pending
   - deleteQueueItem removes item from queue

### Anti-Patterns to AVOID

| ❌ Éviter | ✅ Faire |
|-----------|----------|
| Afficher "0 pending" | Masquer le compteur si 0 |
| Polling trop fréquent (< 1s) | Refresh toutes les 5s |
| Pas de confirmation pour delete | AlertDialog avant suppression |
| Ignorer les items syncing | Les montrer avec animation |
| Hardcoder les libellés | Utiliser i18next |

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-3.8]
- [Source: src/hooks/useSyncQueue.ts]
- [Source: src/services/sync/syncQueueHelpers.ts]
- [Source: src/stores/syncStore.ts]
- [Source: src/components/sync/SyncStatusBadge.tsx]
- [Source: _bmad-output/implementation-artifacts/3-6-sync-queue-processing.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

None

### Completion Notes List

1. **Task 1 (PendingSyncCounter)**: Created badge component that shows pending sync count, hidden when 0, animated when syncing, orange badge for failed items
2. **Task 2 (PendingSyncPanel)**: Created Sheet-based panel showing grouped items by entity type with refresh button
3. **Task 3 (PendingSyncItem)**: Created item row component with status icons, error display, retry and delete buttons with confirmation dialogs
4. **Task 4 (Helper functions)**: Added `getAllQueueItems`, `getQueueItemsGroupedByEntity`, `retryFailedItem`, `deleteQueueItem` to syncQueueHelpers.ts
5. **Task 5 (usePendingSyncItems hook)**: Created hook providing grouped items, status counts, and retry/remove actions with 5s auto-refresh
6. **Task 6 (Layout integration)**: Added PendingSyncCounter to BackOfficeLayout sidebar header next to existing sync indicators
7. **Task 7 (Translations)**: Added `sync.counter.*`, `sync.panel.*`, `sync.entity.*`, `sync.status.*` keys to fr.json, en.json, id.json
8. **Task 8 (Unit tests)**: Added 50 tests across syncQueueHelpers (34), usePendingSyncItems (6), PendingSyncCounter (10)
9. **UI Components added**: Installed shadcn/ui Sheet, ScrollArea, AlertDialog, Separator components

### File List

**New Files:**
- `src/components/sync/PendingSyncCounter.tsx` - Badge counter component (Task 1)
- `src/components/sync/PendingSyncPanel.tsx` - Sheet panel component (Task 2)
- `src/components/sync/PendingSyncItem.tsx` - Item row component (Task 3)
- `src/hooks/sync/usePendingSyncItems.ts` - Hook for panel data (Task 5)
- `src/hooks/sync/__tests__/usePendingSyncItems.test.ts` - Hook tests (Task 8)
- `src/components/sync/__tests__/PendingSyncCounter.test.tsx` - Component tests (Task 8)
- `src/components/ui/sheet.tsx` - shadcn/ui Sheet component
- `src/components/ui/alert-dialog.tsx` - shadcn/ui AlertDialog component
- `src/components/ui/separator.tsx` - shadcn/ui Separator component

**Modified Files:**
- `src/services/sync/syncQueueHelpers.ts` - Added new helper functions (Task 4)
- `src/services/sync/__tests__/syncQueueHelpers.test.ts` - Added tests for new functions (Task 8)
- `src/layouts/BackOfficeLayout.tsx` - Added PendingSyncCounter import and JSX (Task 6)
- `src/locales/fr.json` - Added sync translations (Task 7)
- `src/locales/en.json` - Added sync translations (Task 7)
- `src/locales/id.json` - Added sync translations (Task 7)

