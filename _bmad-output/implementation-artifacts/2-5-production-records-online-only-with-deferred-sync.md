# Story 2.5: Production Records (Online-Only with Deferred Sync)

Status: done

## Story

As a **Producteur**,
I want **enregistrer une production même si internet est lent**,
so that **mon travail n'est pas bloqué par des problèmes réseau**.

## Acceptance Criteria

### AC1: Production Online avec Stock Update Temps Réel
**Given** j'enregistre une production online
**When** l'API répond avec succès
**Then** le stock est mis à jour en temps réel
**And** le `batch_number` est généré par le serveur (production_id)

### AC2: Message Offline Clair
**Given** l'application est offline
**When** je tente d'enregistrer une production
**Then** un message indique "La production nécessite une connexion internet"
**And** le bouton "Enregistrer" est désactivé
**And** l'UI n'est pas bloquée (je peux toujours naviguer)

### AC3: Note/Rappel pour Plus Tard
**Given** je suis offline et je veux noter une production
**When** je tape mes items de production
**Then** je peux ajouter une note/rappel pour plus tard
**And** la note est sauvegardée localement (localStorage)
**And** un indicateur montre les rappels en attente

### AC4: Restauration des Rappels Online
**Given** j'ai des rappels de production sauvegardés
**When** l'application revient online
**Then** je vois une notification "X rappels de production en attente"
**And** je peux accéder à la liste des rappels
**And** je peux convertir chaque rappel en production réelle

## Tasks / Subtasks

- [x] **Task 1: Détecter le statut réseau dans ProductionPage** (AC: 1, 2)
  - [x] 1.1: Importer `useNetworkStatus` dans `src/pages/production/ProductionPage.tsx`
  - [x] 1.2: Ajouter `isOnline` au destructuring du hook
  - [x] 1.3: Passer `isOnline` au composant `ProductionEntry`

- [x] **Task 2: Afficher le message offline et désactiver le bouton** (AC: 2)
  - [x] 2.1: Ajouter une bannière d'avertissement offline dans `ProductionEntry`
  - [x] 2.2: Désactiver le bouton "Enregistrer" quand `!isOnline` (replaced by reminder button)
  - [x] 2.3: Afficher un tooltip sur le bouton désactivé expliquant pourquoi
  - [x] 2.4: Utiliser les traductions existantes ou ajouter si nécessaire

- [x] **Task 3: Implémenter le système de rappels** (AC: 3, 4)
  - [x] 3.1: Créer interface `IProductionReminder` dans `src/types/offline.ts`
  - [x] 3.2: Créer service `src/services/offline/productionReminderService.ts` avec:
    - `saveProductionReminder(items: ProductionItem[], sectionId: string, date: Date): Promise<string>`
    - `getProductionReminders(): IProductionReminder[]`
    - `deleteProductionReminder(id: string): void`
    - `getRemindersCount(): number`
  - [x] 3.3: Utiliser `localStorage` avec clé `offline_production_reminders`

- [x] **Task 4: Ajouter bouton "Sauvegarder comme rappel"** (AC: 3)
  - [x] 4.1: Ajouter bouton "📝 Sauvegarder comme rappel" dans `ProductionEntry` quand offline
  - [x] 4.2: Implémenter `handleSaveReminder()` qui appelle le service
  - [x] 4.3: Afficher toast de confirmation "Rappel sauvegardé"
  - [x] 4.4: Vider les items après sauvegarde du rappel

- [x] **Task 5: Afficher indicateur des rappels en attente** (AC: 4)
  - [x] 5.1: Ajouter compteur de rappels dans le header de ProductionPage
  - [x] 5.2: Créer composant `ProductionRemindersPanel` (dialog/sheet)
  - [x] 5.3: Lister les rappels avec date, section, items
  - [x] 5.4: Boutons: "Restaurer" (pré-remplit le formulaire), "Supprimer"

- [x] **Task 6: Notification au retour online** (AC: 4)
  - [x] 6.1: Dans `ProductionPage`, vérifier les rappels au changement `isOnline`
  - [x] 6.2: Si online + rappels > 0, afficher toast "X rappels de production en attente"
  - [x] 6.3: Le toast inclut un lien pour ouvrir le panel des rappels

- [x] **Task 7: Ajouter les traductions** (AC: 2, 3, 4)
  - [x] 7.1: Ajouter clés dans `fr.json`: `production.offline.*`
  - [x] 7.2: Ajouter clés dans `en.json`
  - [x] 7.3: Ajouter clés dans `id.json`

- [x] **Task 8: Écrire les tests** (AC: 1, 2, 3, 4)
  - [x] 8.1: Créer `src/services/offline/__tests__/productionReminderService.test.ts`
  - [x] 8.2: Tester sauvegarde/lecture/suppression des rappels
  - [x] 8.3: Tester le compteur de rappels
  - [x] 8.4: Mock localStorage pour tests isolés

## Dev Notes

### Architecture Compliance (MANDATORY)

**ADR-001: Entités Synchronisées Offline** [Source: architecture/core-architectural-decisions.md#ADR-001]
- `production_records` → **Online-only** (pas de sync offline)
- Raison: Stock movements complexes (déduction recette, batch_number serveur)
- Mode dégradé: Rappels locaux pour noter les productions à enregistrer plus tard

**Story 2.5 Approach** [Source: epics/epic-list.md#Story-2.5]
- Production reste online-only pour garantir intégrité stock
- UX offline gracieuse avec messages clairs
- Rappels locaux comme solution de contournement

### Existing Code to Reuse

**Hook existant** [Source: src/hooks/useProduction.ts]
```typescript
// Le hook actuel gère déjà:
// - Sélection section/date
// - Ajout/modification/suppression items
// - handleSave() vers Supabase
// - handleDeleteRecord() pour admins

// À ÉTENDRE avec:
// - Détection isOnline via useNetworkStatus
// - handleSaveReminder() pour mode offline
```

**useNetworkStatus** [Source: src/hooks/offline/useNetworkStatus.ts]
```typescript
export function useNetworkStatus() {
  // Retourne { isOnline, isChecking }
  // Utiliser pour conditionner l'UI production
}
```

**Patterns UI offline** [Source: src/components/sync/NetworkIndicator.tsx]
- Pattern de bannière d'avertissement à suivre
- Couleurs: `bg-amber-50 border-amber-200 text-amber-800`

### Previous Story Intelligence

**Stories 2.1-2.4 Patterns** [Source: 2-1 through 2-4 story files]
1. `useNetworkStatus` hook est fiable et testé
2. Pattern service + localStorage fonctionne bien
3. Traductions: TOUJOURS 3 fichiers (fr, en, id)
4. Tests: vitest + mocks pour services

**Pas de Dexie nécessaire:**
- Les rappels sont simples (< 10 items attendus)
- localStorage suffit vs IndexedDB
- Pas de queries complexes requises

### Schema IProductionReminder

```typescript
// src/types/offline.ts - Ajouter:

export interface IProductionReminder {
  /** UUID du rappel */
  id: string;

  /** Section de production */
  sectionId: string;
  sectionName: string;

  /** Date de production prévue */
  productionDate: string; // ISO 8601

  /** Items à produire */
  items: {
    productId: string;
    name: string;
    category: string;
    icon: string;
    unit: string;
    quantity: number;
    wasted: number;
    wasteReason: string;
  }[];

  /** Timestamp de création du rappel */
  createdAt: string; // ISO 8601

  /** Note optionnelle */
  note?: string;
}
```

### productionReminderService Pattern

```typescript
// src/services/offline/productionReminderService.ts

const STORAGE_KEY = 'offline_production_reminders';

export function saveProductionReminder(
  items: ProductionItem[],
  sectionId: string,
  sectionName: string,
  productionDate: Date,
  note?: string
): string {
  const reminders = getProductionReminders();
  const id = crypto.randomUUID();

  reminders.push({
    id,
    sectionId,
    sectionName,
    productionDate: productionDate.toISOString(),
    items: items.map(item => ({ ...item })),
    createdAt: new Date().toISOString(),
    note,
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  return id;
}

export function getProductionReminders(): IProductionReminder[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function deleteProductionReminder(id: string): void {
  const reminders = getProductionReminders().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

export function getRemindersCount(): number {
  return getProductionReminders().length;
}
```

### UI Components Pattern

**Bannière offline dans ProductionEntry:**
```tsx
{!isOnline && (
  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
    <WifiOff size={18} className="text-amber-600" />
    <span className="text-sm text-amber-800 font-medium">
      {t('production.offline.requiresConnection')}
    </span>
  </div>
)}
```

**Bouton conditionnel:**
```tsx
<button
  onClick={isOnline ? onSave : onSaveReminder}
  disabled={isSaving || (!isOnline && productionItems.length === 0)}
  className="..."
>
  {isOnline ? (
    <><Save size={18} /> {t('common.save')}</>
  ) : (
    <><Bookmark size={18} /> {t('production.offline.saveReminder')}</>
  )}
</button>
```

### Traductions à Ajouter

```json
// fr.json
{
  "production": {
    "offline": {
      "requiresConnection": "La production nécessite une connexion internet",
      "saveReminder": "Sauvegarder comme rappel",
      "reminderSaved": "Rappel sauvegardé",
      "pendingReminders": "{count} rappel(s) de production en attente",
      "viewReminders": "Voir les rappels",
      "restoreReminder": "Restaurer",
      "deleteReminder": "Supprimer",
      "noReminders": "Aucun rappel en attente"
    }
  }
}
```

```json
// en.json
{
  "production": {
    "offline": {
      "requiresConnection": "Production requires an internet connection",
      "saveReminder": "Save as reminder",
      "reminderSaved": "Reminder saved",
      "pendingReminders": "{count} production reminder(s) pending",
      "viewReminders": "View reminders",
      "restoreReminder": "Restore",
      "deleteReminder": "Delete",
      "noReminders": "No pending reminders"
    }
  }
}
```

```json
// id.json
{
  "production": {
    "offline": {
      "requiresConnection": "Produksi memerlukan koneksi internet",
      "saveReminder": "Simpan sebagai pengingat",
      "reminderSaved": "Pengingat disimpan",
      "pendingReminders": "{count} pengingat produksi tertunda",
      "viewReminders": "Lihat pengingat",
      "restoreReminder": "Pulihkan",
      "deleteReminder": "Hapus",
      "noReminders": "Tidak ada pengingat tertunda"
    }
  }
}
```

### Testing Strategy

**Mock localStorage:**
```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

**Test Cases:**
1. `saveProductionReminder()` - ajoute un rappel avec ID unique
2. `getProductionReminders()` - retourne liste vide si pas de données
3. `getProductionReminders()` - retourne les rappels sauvegardés
4. `deleteProductionReminder()` - supprime le bon rappel
5. `getRemindersCount()` - compte correct des rappels

### Project Structure Notes

**Fichiers à créer:**
```
src/
├── services/
│   └── offline/
│       ├── productionReminderService.ts      # NEW: Rappels production
│       └── __tests__/
│           └── productionReminderService.test.ts  # NEW: Tests
├── types/
│   └── offline.ts                             # MODIFY: Add IProductionReminder
└── components/
    └── production/
        └── ProductionRemindersPanel.tsx       # NEW: Panel rappels (optionnel)
```

**Fichiers à modifier:**
- `src/types/offline.ts` - Ajouter IProductionReminder
- `src/pages/production/ProductionPage.tsx` - Ajouter détection offline + UI
- `src/hooks/useProduction.ts` - Ajouter handleSaveReminder + notification
- `src/services/offline/index.ts` - Exporter productionReminderService
- `src/locales/fr.json`, `en.json`, `id.json` - Ajouter traductions

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-2.5]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-001]
- [Source: src/hooks/useProduction.ts] - Hook production existant
- [Source: src/pages/production/ProductionPage.tsx] - Page production existante
- [Source: src/hooks/offline/useNetworkStatus.ts] - Hook statut réseau
- [Source: src/components/sync/NetworkIndicator.tsx] - Pattern UI offline
- [Source: CLAUDE.md#Architecture] - Conventions projet

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

None

### Completion Notes List

- Implemented production reminders system using localStorage (not IndexedDB) as per ADR-001 - simple key-value storage sufficient for <10 expected reminders
- Created `productionReminderService.ts` with full CRUD operations for reminders
- Added types `IProductionReminder` and `IProductionReminderItem` in `offline.ts`
- Modified `ProductionPage.tsx` to detect network status and display offline UI:
  - Amber warning banner when offline
  - "Save as reminder" button replaces "Save" button when offline
  - Optional note field for reminders
  - Reminders counter in header with access to panel
  - Modal panel to view/restore/delete reminders
  - Toast notification when coming back online with pending reminders
- Added `restoreFromReminder()` function to `useProduction` hook
- All translations added for fr/en/id locales with 13 new keys
- 19 tests passing for `productionReminderService` covering all functions

### File List

**Created:**
- `src/services/offline/productionReminderService.ts` - Production reminder service
- `src/services/offline/__tests__/productionReminderService.test.ts` - Unit tests (19 tests)

**Modified:**
- `src/types/offline.ts` - Added IProductionReminder, IProductionReminderItem, PRODUCTION_REMINDERS_STORAGE_KEY
- `src/services/offline/index.ts` - Added exports for productionReminderService
- `src/pages/production/ProductionPage.tsx` - Offline UI, reminders panel, network detection
- `src/hooks/useProduction.ts` - Added restoreFromReminder function
- `src/locales/fr.json` - Added production.offline.* translations
- `src/locales/en.json` - Added production.offline.* translations
- `src/locales/id.json` - Added production.offline.* translations

