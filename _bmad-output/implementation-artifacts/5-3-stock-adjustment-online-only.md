# Story 5.3: Stock Adjustment (Online-Only)

Status: done

## Story

As a **Manager**,
I want **créer un ajustement de stock**,
So that **je peux corriger les écarts**.

## Acceptance Criteria

### AC1: Ajustement de Stock Online
**Given** je suis online
**When** je crée un ajustement (in/out) avec raison
**Then** le mouvement est enregistré avec traçabilité
**And** le stock est mis à jour en temps réel

### AC2: Blocage Ajustement Offline avec Message Explicatif
**Given** je suis offline
**When** je tente un ajustement (clic sur bouton Adjust)
**Then** un message indique "Ajustements nécessitent une connexion" (modal ou tooltip)
**And** le message est traduit dans les 3 langues (FR/EN/ID)

### AC3: Note d'Ajustement pour Plus Tard (Offline Reminder)
**Given** je suis offline
**When** je tente un ajustement
**Then** je peux noter l'ajustement pour plus tard (format texte libre)
**And** la note est persistée localement (Dexie ou localStorage)
**And** je peux retrouver mes notes quand je reviens online

### AC4: Liste des Notes d'Ajustement Différées
**Given** je suis online
**When** je consulte la page d'inventaire avec des notes d'ajustement en attente
**Then** je vois un indicateur/badge des notes à traiter
**And** je peux ouvrir la liste des notes pour les traiter manuellement

## Tasks / Subtasks

- [x] **Task 1: Créer modal OfflineAdjustmentBlockedModal** (AC: 2, 3)
  - [x] 1.1: Créer `src/components/inventory/OfflineAdjustmentBlockedModal.tsx`
  - [x] 1.2: Afficher message "Ajustements nécessitent une connexion"
  - [x] 1.3: Ajouter champ texte pour "Noter pour plus tard"
  - [x] 1.4: Bouton "Enregistrer note" + "Fermer"
  - [x] 1.5: Style cohérent avec StockAdjustmentModal existant

- [x] **Task 2: Créer service/storage pour notes différées** (AC: 3)
  - [x] 2.1: Ajouter interface `IDeferredAdjustmentNote` dans `src/types/offline.ts`
  - [x] 2.2: Ajouter table Dexie `offline_adjustment_notes` dans `src/lib/db.ts` (version 12)
  - [x] 2.3: Créer `src/services/inventory/deferredAdjustmentService.ts`
  - [x] 2.4: Implémenter `addDeferredNote(note)`, `getDeferredNotes()`, `deleteDeferredNote(id)`
  - [x] 2.5: Tests unitaires service

- [x] **Task 3: Créer composant DeferredNotesBadge** (AC: 4)
  - [x] 3.1: Créer `src/components/inventory/DeferredNotesBadge.tsx`
  - [x] 3.2: Afficher compteur des notes en attente
  - [x] 3.3: onClick ouvre un panel/modal avec la liste des notes

- [x] **Task 4: Créer composant DeferredNotesPanel** (AC: 4)
  - [x] 4.1: Créer `src/components/inventory/DeferredNotesPanel.tsx`
  - [x] 4.2: Lister les notes avec date de création, texte, produit (optionnel)
  - [x] 4.3: Bouton "Marquer comme traité" (supprime la note)
  - [x] 4.4: Bouton "Créer ajustement" (ouvre StockAdjustmentModal si online)

- [x] **Task 5: Intégrer dans StockPage** (AC: 2, 3, 4)
  - [x] 5.1: Modifier `StockPage.tsx` pour ouvrir `OfflineAdjustmentBlockedModal` quand offline
  - [x] 5.2: Ajouter `DeferredNotesBadge` dans la page si des notes existent
  - [x] 5.3: Conserver logique existante `canAdjustStock = isOnline` mais améliorer UX

- [x] **Task 6: Traductions** (AC: 2, 3, 4)
  - [x] 6.1: Ajouter clés `inventory.adjustment.offline.*` dans `fr.json`
  - [x] 6.2: Ajouter clés dans `en.json`
  - [x] 6.3: Ajouter clés dans `id.json`

## Dev Notes

### Architecture Context (ADR-001)

Les ajustements de stock (`stock_movements`) sont **ONLINE-ONLY** car:
- Traçabilité complète requise (audit trail)
- Conflits de sync sur stock complexes à résoudre
- Les commandes offline modifient déjà le stock virtuellement

[Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-001]

### Code Existant - RÉUTILISER!

**Le blocage offline EST DÉJÀ en place** (Story 5-1):

```typescript
// src/pages/inventory/StockPage.tsx - Ligne 51
const canAdjustStock = isOnline

// Ligne 197 - Bouton désactivé si offline
onAdjustStock={canAdjustStock ? (product) => setSelectedProduct(...) : undefined}
```

**PROBLÈME ACTUEL:** Quand offline, le bouton "Adjust" est simplement masqué/désactivé sans explication. L'utilisateur ne comprend pas pourquoi.

**SOLUTION Cette Story:** Afficher un modal explicatif avec option de noter pour plus tard.

### Hook existant `useStockAdjustment.ts`

```typescript
// src/hooks/inventory/useStockAdjustment.ts
export function useStockAdjustment() {
  return useMutation({
    mutationFn: async ({ productId, type, quantity, reason, notes, supplierId }) => {
      // Insert dans stock_movements via Supabase
      // Invalide les caches inventory, products, stock-movements
    }
  })
}
```

Ce hook fonctionne uniquement online (appel Supabase direct). Pas de modification nécessaire.

### Type pour Notes Différées

```typescript
// src/types/offline.ts - À AJOUTER
export interface IDeferredAdjustmentNote {
  id?: number;              // Auto-increment Dexie
  product_id?: string;      // FK optionnel si lié à un produit
  product_name?: string;    // Nom produit pour affichage (dénormalisé)
  note: string;             // Texte libre
  adjustment_type?: TStockAdjustmentType; // Type suggéré (optionnel)
  suggested_quantity?: number;            // Quantité suggérée (optionnel)
  created_at: string;       // ISO 8601
  created_by?: string;      // User ID si disponible
}
```

### Dexie Schema Extension (Version 12)

```typescript
// src/lib/db.ts - Version 12
this.version(12).stores({
  // ... préserver tables existantes (v11) ...

  // NEW: Deferred adjustment notes (Story 5.3)
  offline_adjustment_notes: '++id, product_id, created_at',
});
```

### Pattern Modal Suggéré

```tsx
// src/components/inventory/OfflineAdjustmentBlockedModal.tsx
interface OfflineAdjustmentBlockedModalProps {
  product?: { id: string; name: string };  // Optionnel - produit sélectionné
  onClose: () => void;
  onNoteSaved?: () => void;  // Callback après sauvegarde note
}

export function OfflineAdjustmentBlockedModal({ product, onClose, onNoteSaved }) {
  const { t } = useTranslation();
  const [note, setNote] = useState('');

  const handleSaveNote = async () => {
    await addDeferredNote({
      product_id: product?.id,
      product_name: product?.name,
      note,
      created_at: new Date().toISOString()
    });
    onNoteSaved?.();
    onClose();
  };

  return (
    <div className="modal-backdrop is-active">
      <div className="modal modal-md">
        <div className="modal__header">
          <WifiOff className="h-5 w-5 text-amber-500" />
          <h3>{t('inventory.adjustment.offline.title')}</h3>
        </div>
        <div className="modal__body">
          <p className="text-muted-foreground mb-4">
            {t('inventory.adjustment.offline.message')}
          </p>
          {product && (
            <p className="font-medium mb-4">
              {t('inventory.adjustment.offline.product')}: {product.name}
            </p>
          )}
          <div className="form-group">
            <label>{t('inventory.adjustment.offline.noteLabel')}</label>
            <textarea
              className="form-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('inventory.adjustment.offline.notePlaceholder')}
              rows={3}
            />
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn-ghost" onClick={onClose}>
            {t('common.close')}
          </button>
          {note.trim() && (
            <button className="btn btn-primary" onClick={handleSaveNote}>
              {t('inventory.adjustment.offline.saveNote')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Traductions Requises

```json
// fr.json
{
  "inventory": {
    "adjustment": {
      "offline": {
        "title": "Mode Hors-Ligne",
        "message": "Les ajustements de stock nécessitent une connexion internet pour garantir la traçabilité.",
        "product": "Produit",
        "noteLabel": "Noter pour plus tard (optionnel)",
        "notePlaceholder": "Ex: Ajuster +5 pcs (erreur de comptage)...",
        "saveNote": "Enregistrer la note",
        "deferredNotes": "Notes en attente",
        "deferredNotesCount": "{{count}} note(s) d'ajustement en attente",
        "noNotes": "Aucune note en attente",
        "markAsProcessed": "Marquer comme traité",
        "createAdjustment": "Créer l'ajustement"
      }
    }
  }
}
```

```json
// en.json
{
  "inventory": {
    "adjustment": {
      "offline": {
        "title": "Offline Mode",
        "message": "Stock adjustments require an internet connection to ensure traceability.",
        "product": "Product",
        "noteLabel": "Note for later (optional)",
        "notePlaceholder": "E.g.: Adjust +5 pcs (counting error)...",
        "saveNote": "Save note",
        "deferredNotes": "Pending notes",
        "deferredNotesCount": "{{count}} pending adjustment note(s)",
        "noNotes": "No pending notes",
        "markAsProcessed": "Mark as processed",
        "createAdjustment": "Create adjustment"
      }
    }
  }
}
```

```json
// id.json
{
  "inventory": {
    "adjustment": {
      "offline": {
        "title": "Mode Offline",
        "message": "Penyesuaian stok memerlukan koneksi internet untuk memastikan keterlacakan.",
        "product": "Produk",
        "noteLabel": "Catatan untuk nanti (opsional)",
        "notePlaceholder": "Contoh: Sesuaikan +5 pcs (kesalahan hitung)...",
        "saveNote": "Simpan catatan",
        "deferredNotes": "Catatan tertunda",
        "deferredNotesCount": "{{count}} catatan penyesuaian tertunda",
        "noNotes": "Tidak ada catatan tertunda",
        "markAsProcessed": "Tandai sebagai diproses",
        "createAdjustment": "Buat penyesuaian"
      }
    }
  }
}
```

### Fichiers Impactés

**À créer:**
- `src/components/inventory/OfflineAdjustmentBlockedModal.tsx` (~80 lignes)
- `src/components/inventory/DeferredNotesBadge.tsx` (~40 lignes)
- `src/components/inventory/DeferredNotesPanel.tsx` (~100 lignes)
- `src/services/inventory/deferredAdjustmentService.ts` (~60 lignes)
- `src/services/inventory/deferredAdjustmentService.test.ts` (~80 lignes)

**À modifier:**
- `src/types/offline.ts` (+15 lignes - IDeferredAdjustmentNote)
- `src/lib/db.ts` (+5 lignes - v12 schema, offline_adjustment_notes)
- `src/pages/inventory/StockPage.tsx` (+20 lignes - intégration modals et badge)
- `src/locales/fr.json` (+15 lignes - inventory.adjustment.offline.*)
- `src/locales/en.json` (+15 lignes)
- `src/locales/id.json` (+15 lignes)

### Dépendances

- ✅ Story 5-1: `useNetworkStatus`, `useStockLevelsOffline` (terminée)
- ✅ Story 5-2: Patterns d'alertes stock, StaleDataWarning (en review)
- ✅ Dexie db.ts v11 (offline_stock_levels)
- ✅ StockAdjustmentModal existant (pattern réutilisable)

### Learnings from Stories 5-1 & 5-2

1. **useLiveQuery consolidé** - Ne pas créer plusieurs subscriptions IndexedDB
2. **useMemo pour calculs** - Éviter recalculs inutiles
3. **Traductions 3 locales** - TOUJOURS ajouter FR, EN, ID
4. **Tests fake-indexeddb** - Ajouter `import 'fake-indexeddb/auto';` en haut des tests
5. **Hook placement** - Hooks offline dans `src/hooks/offline/`, pas `src/hooks/inventory/`
6. **Optional props** - Utiliser `?` pour props qui peuvent être undefined en offline

### Testing Strategy

1. **Unit tests** (deferredAdjustmentService.test.ts):
   - `addDeferredNote()` persiste correctement
   - `getDeferredNotes()` retourne liste triée par date
   - `deleteDeferredNote(id)` supprime correctement

2. **Integration test** (manuel):
   - Online: Bouton Adjust ouvre StockAdjustmentModal → ajustement créé
   - Offline: Bouton Adjust ouvre OfflineAdjustmentBlockedModal → peut noter
   - Retour online: Badge notes affiché → peut traiter les notes

### Git Intelligence (Recent Commits)

```
8a6c438 feat: Implement Kitchen Display System (KDS) ...
5a43023 feat(lan): implement KDS Socket.IO client connection (Story 4.2)
7491d59 feat(lan): implement LAN hub lifecycle management (Story 4.1)
```

Pattern commit message pour cette story:
```
feat(inventory): add offline stock adjustment blocking with deferred notes (Story 5.3)
```

### Project Structure Notes

- Composants dans `src/components/inventory/` (convention existante)
- Service dans `src/services/inventory/` (nouveau service)
- Types dans `src/types/offline.ts` (extension)
- Alignement avec patterns Epic 5 (read-only cache, online-only mutations)

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-5.3]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-001]
- [Source: _bmad-output/implementation-artifacts/5-1-stock-levels-read-only-cache.md]
- [Source: _bmad-output/implementation-artifacts/5-2-stock-alerts-offline-display.md]
- [Source: src/hooks/inventory/useStockAdjustment.ts - Hook existant]
- [Source: src/components/inventory/StockAdjustmentModal.tsx - Pattern modal]
- [Source: src/pages/inventory/StockPage.tsx - Page existante avec canAdjustStock]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Service tests: 14/14 passing

### Completion Notes List

- ✅ Created `IDeferredAdjustmentNote` type with full TypeScript support
- ✅ Added Dexie v12 schema with `offline_adjustment_notes` table
- ✅ Implemented `deferredAdjustmentService` with CRUD operations
- ✅ Created `OfflineAdjustmentBlockedModal` with note saving functionality
- ✅ Created `DeferredNotesBadge` with live count using useLiveQuery
- ✅ Created `DeferredNotesPanel` with note list and delete/create actions
- ✅ Integrated into `StockPage` with improved UX (button always visible, different modal per state)
- ✅ Added translations in FR/EN/ID for all new strings

### File List

**Created:**
- src/components/inventory/OfflineAdjustmentBlockedModal.tsx
- src/components/inventory/DeferredNotesBadge.tsx
- src/components/inventory/DeferredNotesPanel.tsx
- src/services/inventory/deferredAdjustmentService.ts
- src/services/inventory/deferredAdjustmentService.test.ts

**Modified:**
- src/types/offline.ts (added IDeferredAdjustmentNote, TStockAdjustmentType)
- src/lib/db.ts (added Dexie v12 with offline_adjustment_notes table)
- src/pages/inventory/StockPage.tsx (integrated modals and badge)
- src/locales/fr.json (added inventory.adjustment.offline.* keys)
- src/locales/en.json (added inventory.adjustment.offline.* keys)
- src/locales/id.json (added inventory.adjustment.offline.* keys)

## Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.5
**Date:** 2026-02-02
**Outcome:** ✅ APPROVED (after fixes)

### Review Summary

| Category | Result |
|----------|--------|
| ACs Implemented | 4/4 ✅ |
| Tasks Completed | 6/6 ✅ |
| Tests | 14/14 passing ✅ |
| Translations | FR/EN/ID ✅ |

### Issues Found & Fixed

**M1 (MEDIUM) - Fixed:** Error handling in `OfflineAdjustmentBlockedModal`
- Problem: Note was lost silently on save failure
- Fix: Added error state display, modal stays open on failure
- Files: `OfflineAdjustmentBlockedModal.tsx`, locale files

**L1 (LOW) - Fixed:** Non-null assertion on `note.id`
- Problem: Used `!` operator on optional field
- Fix: Added guard `note.id !== undefined`
- File: `DeferredNotesPanel.tsx:142`

**L2 (LOW) - Fixed:** `deleteDeferredNote` always returned `true`
- Problem: Function didn't check if item existed before delete
- Fix: Added existence check, returns `false` if not found
- Files: `deferredAdjustmentService.ts`, test updated

### Additional Files Modified (Review Fixes)

- src/components/inventory/OfflineAdjustmentBlockedModal.tsx (error handling)
- src/components/inventory/DeferredNotesPanel.tsx (guard fix)
- src/services/inventory/deferredAdjustmentService.ts (logic fix)
- src/services/inventory/deferredAdjustmentService.test.ts (test update)
- src/locales/fr.json (saveError key)
- src/locales/en.json (saveError key)
- src/locales/id.json (saveError key)

