# Story 5.2: Stock Alerts Offline Display

Status: done

## Story

As a **Manager**,
I want **voir les alertes de stock bas même offline**,
So that **je suis informé des ruptures potentielles**.

## Acceptance Criteria

### AC1: Alertes Stock Bas sur Dashboard Offline
**Given** le cache stock contient des produits avec niveaux < 10
**When** je consulte le dashboard ou la page inventaire offline
**Then** je vois les alertes warning (quantité < 10) et critical (quantité < 5)
**And** les couleurs correspondent: jaune (warning), rouge (critical)
**And** les produits sont triés par criticité (critical en premier)

### AC2: Avertissement Données Obsolètes
**Given** je suis offline depuis plus d'une heure (configurable)
**When** les alertes de stock sont affichées
**Then** un avertissement indique "Données potentiellement obsolètes - dernière sync: {time}"
**And** l'avertissement est visuellement distinct (bandeau orange)

### AC3: Compteur d'Alertes dans le Header
**Given** des produits sont en alerte stock (warning ou critical)
**When** je navigue dans l'application
**Then** je vois un badge compteur dans le header/navigation
**And** le badge est rouge si au moins un produit est critical

### AC4: Accès Rapide aux Alertes
**Given** je suis sur n'importe quelle page
**When** je clique sur le badge d'alertes stock
**Then** je suis redirigé vers la liste des produits en alerte
**And** la liste est filtrable par niveau d'alerte (warning/critical)

## Tasks / Subtasks

- [x] **Task 1: Créer composant StockAlertsBadge** (AC: 3, 4)
  - [x] 1.1: Créer `src/components/inventory/StockAlertsBadge.tsx`
  - [x] 1.2: Utiliser `useStockLevelsOffline` pour récupérer les données
  - [x] 1.3: Calculer le nombre d'alertes warning et critical
  - [x] 1.4: Afficher badge avec compteur (style selon criticité)
  - [x] 1.5: Implémenter onClick pour navigation vers `/inventory?filter=alerts`

- [x] **Task 2: Créer composant StockAlertsPanel** (AC: 1)
  - [x] 2.1: Créer `src/components/inventory/StockAlertsPanel.tsx`
  - [x] 2.2: Afficher liste des produits en alerte avec couleurs
  - [x] 2.3: Trier par criticité: out_of_stock > critical > warning
  - [x] 2.4: Afficher: nom produit, quantité actuelle, seuil minimum, status
  - [x] 2.5: Ajouter filtres tabs: "Tous", "Critical", "Warning"

- [x] **Task 3: Créer composant StaleDataWarning** (AC: 2)
  - [x] 3.1: Créer `src/components/inventory/StaleDataWarning.tsx`
  - [x] 3.2: Calculer temps écoulé depuis `lastSyncAt`
  - [x] 3.3: Afficher bandeau orange si > STALE_THRESHOLD_MS (1 heure)
  - [x] 3.4: Afficher message avec formatDistanceToNow

- [x] **Task 4: Intégrer dans StockPage** (AC: 1, 2)
  - [x] 4.1: Ajouter StockAlertsPanel en haut de StockPage
  - [x] 4.2: Ajouter StaleDataWarning si offline + données obsolètes
  - [x] 4.3: Supporter query param `?filter=alerts` pour pré-filtrer
  - [x] 4.4: Masquer panel si aucune alerte

- [x] **Task 5: Intégrer badge dans Header/Sidebar** (AC: 3)
  - [x] 5.1: Identifier composant navigation principal
  - [x] 5.2: Ajouter StockAlertsBadge à côté du lien Inventory
  - [x] 5.3: Tester visibilité sur toutes les pages

- [x] **Task 6: Ajouter constantes et types** (AC: 1, 2)
  - [x] 6.1: Ajouter `STALE_DATA_THRESHOLD_MS` dans `src/types/offline.ts`
  - [x] 6.2: Ajouter type `TStockAlertLevel = 'ok' | 'warning' | 'critical' | 'out_of_stock'`
  - [x] 6.3: Exporter helper `isDataStale(lastSyncAt: string): boolean`

- [x] **Task 7: Traductions** (AC: 1, 2, 3)
  - [x] 7.1: Ajouter clés dans `fr.json`: `inventory.alerts.*`
  - [x] 7.2: Ajouter clés dans `en.json`
  - [x] 7.3: Ajouter clés dans `id.json`

## Dev Notes

### Architecture Context (ADR-001)

L'Epic 5 utilise un **cache read-only** pour le stock. La story 5-1 a établi toute l'infrastructure:
- Table Dexie `offline_stock_levels` avec `quantity` et `min_stock_level`
- Hook `useStockLevelsOffline` avec fonction `getStockStatus()`
- Service `stockSync.ts` pour synchronisation

Cette story 5-2 ajoute l'**affichage des alertes** basé sur cette infrastructure existante.

[Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-001]

### Patterns Établis par Story 5-1 (RÉUTILISER!)

**Hook existant `useStockLevelsOffline`:**
```typescript
// src/hooks/offline/useStockLevelsOffline.ts
export function useStockLevelsOffline() {
  return {
    data: IOfflineStockLevel[],      // Tous les niveaux de stock cachés
    isOffline: boolean,              // État offline
    lastSyncAt: string | null,       // Timestamp dernière sync
    cacheCount: number,              // Nombre de produits en cache
    getStockStatus: (quantity, minLevel) => TStockStatus  // Helper!
  };
}
```

**Fonction `getStockStatus` déjà implémentée:**
```typescript
// Logique existante dans le hook
function getStockStatus(quantity: number, minStockLevel: number): TStockStatus {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity < 5) return 'critical';       // Rouge
  if (quantity < 10) return 'warning';       // Jaune (ou < minStockLevel)
  return 'ok';
}
```

**Composant `OfflineStockBanner` existant:**
```typescript
// src/components/inventory/OfflineStockBanner.tsx
// Réutilisable pour afficher le bandeau "Données au {time}"
```

### Pattern Recommandé pour StockAlertsPanel

```tsx
// src/components/inventory/StockAlertsPanel.tsx
import { useStockLevelsOffline } from '@/hooks/offline/useStockLevelsOffline';
import { useTranslation } from 'react-i18next';

export function StockAlertsPanel() {
  const { t } = useTranslation();
  const { data: stockLevels, getStockStatus, isOffline, lastSyncAt } = useStockLevelsOffline();

  // Filtrer les produits en alerte
  const alerts = useMemo(() => {
    return stockLevels
      .map(item => ({
        ...item,
        status: getStockStatus(item.quantity, item.min_stock_level)
      }))
      .filter(item => item.status !== 'ok')
      .sort((a, b) => {
        const priority = { out_of_stock: 0, critical: 1, warning: 2 };
        return priority[a.status] - priority[b.status];
      });
  }, [stockLevels, getStockStatus]);

  if (alerts.length === 0) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          {t('inventory.alerts.title')}
          <Badge variant="destructive">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Liste des alertes avec couleurs */}
      </CardContent>
    </Card>
  );
}
```

### Pattern pour StaleDataWarning

```tsx
// src/components/inventory/StaleDataWarning.tsx
import { formatDistanceToNow } from 'date-fns';
import { STALE_DATA_THRESHOLD_MS } from '@/types/offline';

interface StaleDataWarningProps {
  lastSyncAt: string | null;
}

export function StaleDataWarning({ lastSyncAt }: StaleDataWarningProps) {
  const { t } = useTranslation();

  const isStale = useMemo(() => {
    if (!lastSyncAt) return true;
    const elapsed = Date.now() - new Date(lastSyncAt).getTime();
    return elapsed > STALE_DATA_THRESHOLD_MS;
  }, [lastSyncAt]);

  if (!isStale) return null;

  const timeAgo = lastSyncAt
    ? formatDistanceToNow(new Date(lastSyncAt), { addSuffix: true })
    : t('common.unknown');

  return (
    <Alert variant="warning" className="mb-4 border-amber-500 bg-amber-50">
      <Clock className="h-4 w-4" />
      <AlertDescription>
        {t('inventory.alerts.staleWarning', { time: timeAgo })}
      </AlertDescription>
    </Alert>
  );
}
```

### Couleurs et Styles (shadcn/ui + Tailwind)

| Status | Couleur Badge | Couleur Texte | Icône |
|--------|---------------|---------------|-------|
| `out_of_stock` | `bg-red-600` | `text-red-600` | `XCircle` |
| `critical` | `bg-red-500` | `text-red-500` | `AlertTriangle` |
| `warning` | `bg-amber-500` | `text-amber-500` | `AlertCircle` |
| `ok` | `bg-green-500` | `text-green-500` | `CheckCircle` |

### Traductions Requises

```json
// fr.json
{
  "inventory": {
    "alerts": {
      "title": "Alertes Stock",
      "badge": "{{count}} alerte(s)",
      "critical": "Critique",
      "warning": "Attention",
      "outOfStock": "Rupture",
      "noAlerts": "Aucune alerte stock",
      "staleWarning": "Données potentiellement obsolètes - dernière sync: {{time}}",
      "currentStock": "Stock actuel",
      "minStock": "Seuil minimum",
      "viewAll": "Voir toutes les alertes",
      "filterAll": "Toutes",
      "filterCritical": "Critiques",
      "filterWarning": "Attention"
    }
  }
}
```

### Fichiers Impactés

**À créer:**
- `src/components/inventory/StockAlertsBadge.tsx` (~50 lignes)
- `src/components/inventory/StockAlertsPanel.tsx` (~120 lignes)
- `src/components/inventory/StaleDataWarning.tsx` (~40 lignes)

**À modifier:**
- `src/types/offline.ts` (+10 lignes - constantes STALE_DATA_THRESHOLD_MS)
- `src/pages/inventory/StockPage.tsx` (+15 lignes - intégration composants)
- `src/components/layout/Sidebar.tsx` ou `Header.tsx` (+5 lignes - badge)
- `src/locales/fr.json`, `en.json`, `id.json` (+15 lignes chacun)

### Dépendances Story 5-1

- ✅ `src/hooks/offline/useStockLevelsOffline.ts` - Hook principal
- ✅ `src/services/sync/stockSync.ts` - Service de sync
- ✅ `src/lib/db.ts` v11 - Table `offline_stock_levels`
- ✅ `src/components/inventory/OfflineStockBanner.tsx` - Pattern réutilisable

### Learnings from Story 5-1 Review

1. **Utiliser useMemo** pour les calculs de filtrage/tri (éviter recalculs)
2. **Consolider les useLiveQuery** si plusieurs appels IndexedDB
3. **Vérifier accessibilité** des couleurs (contrast ratio)
4. **Fallback translations** inclus dans les composants

### Testing Strategy

1. **Unit tests** (optionnel mais recommandé):
   - `StockAlertsPanel` affiche correct nombre d'alertes
   - Tri par criticité fonctionne
   - `isDataStale()` calcule correctement

2. **Integration test** (manuel):
   - Ajouter produits avec stock < 5 → voir alertes rouges
   - Ajouter produits avec stock < 10 → voir alertes jaunes
   - Passer offline > 1h → voir bandeau "données obsolètes"
   - Cliquer badge → navigation vers `/inventory?filter=alerts`

### Project Structure Notes

- Composants dans `src/components/inventory/` (convention existante)
- Hook existant dans `src/hooks/offline/` (ne pas dupliquer!)
- Types dans `src/types/offline.ts` (extension)
- Pattern Badge existe dans shadcn/ui

### Git Intelligence (Recent Commits)

Commits récents (Epic 4 KDS):
- `8a6c438`: KDS avec order queue, status updates, LAN, auto-completion
- `5a43023`: KDS Socket.IO client connection

Pattern commit message pour cette story:
```
feat(inventory): add offline stock alerts display (Story 5.2)
```

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-5.2]
- [Source: _bmad-output/implementation-artifacts/5-1-stock-levels-read-only-cache.md]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-001]
- [Source: _bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md]
- [Source: src/hooks/offline/useStockLevelsOffline.ts - Hook existant]
- [Source: src/components/inventory/OfflineStockBanner.tsx - Pattern réutilisable]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

1. **StockAlertsBadge (131 lines)**: Badge affichant le compteur d'alertes avec navigation vers /inventory?filter=alerts. Calcule critical/warning/outOfStock et affiche badge rouge (critical) ou amber (warning). Utilise useStockLevelsOffline pour les données.

2. **StockAlertsPanel (298 lines)**: Panel complet avec liste des alertes triées par criticité. Inclut filtres tabs (All/Critical/Warning), affichage du nom produit via jointure avec offline_products (useLiveQuery), badge de status coloré, et quantité actuelle vs seuil minimum.

3. **StaleDataWarning (95 lines)**: Bandeau orange d'avertissement affiché quand les données sont obsolètes (> 1 heure depuis dernière sync). Utilise isDataStale() helper et formatDistanceToNow pour temps relatif.

4. **Types & Constants**: Ajout de STALE_DATA_THRESHOLD_MS (1 heure), TStockAlertLevel type, et fonction helper isDataStale() dans src/types/offline.ts.

5. **Traductions**: Ajout de 12 clés inventory.alerts.* dans les 3 fichiers de locale (fr.json, en.json, id.json).

6. **Intégration StockPage**: Ajout de StaleDataWarning + StockAlertsPanel avec support du query param ?filter=alerts pour pré-afficher le panel d'alertes.

7. **Intégration Sidebar**: StockAlertsBadge ajouté à côté du lien Inventory dans BackOfficeLayout.tsx. Le badge s'adapte au mode collapsed/expanded du sidebar.

### File List

**Créés:**
- `src/components/inventory/StockAlertsBadge.tsx` (123 lines)
- `src/components/inventory/StockAlertsPanel.tsx` (291 lines)
- `src/components/inventory/StaleDataWarning.tsx` (95 lines)
- `src/components/inventory/__tests__/StockAlerts.test.tsx` (218 lines) [Code Review]

**Modifiés:**
- `src/types/offline.ts` (+15 lines - STALE_DATA_THRESHOLD_MS, TStockAlertLevel, isDataStale)
- `src/pages/inventory/StockPage.tsx` (+25 lines - intégration composants alertes)
- `src/layouts/BackOfficeLayout.tsx` (+3 lines - import et badge)
- `src/locales/fr.json` (+12 lignes - inventory.alerts.*)
- `src/locales/en.json` (+12 lignes - inventory.alerts.*)
- `src/locales/id.json` (+12 lignes - inventory.alerts.*)
- `src/hooks/offline/useStockLevelsOffline.ts` (export calculateStockStatus) [Code Review]
- `src/hooks/offline/index.ts` (re-export calculateStockStatus) [Code Review]

## Senior Developer Review (AI)

### Review Date: 2026-02-02

### Reviewer: Claude Opus 4.5

### Issues Found & Fixed:

1. **MEDIUM - Code Dupliqué (FIXED)**: La fonction `calculateStatus` était définie 3 fois. Refactorisé pour exporter `calculateStockStatus` depuis `useStockLevelsOffline.ts` et l'importer dans les composants.

2. **MEDIUM - Absence de Tests (FIXED)**: Créé `src/components/inventory/__tests__/StockAlerts.test.tsx` avec tests pour:
   - `calculateStockStatus()` function
   - `isDataStale()` helper
   - `StockAlertsBadge` component (renders nothing when no alerts, shows count)
   - `StaleDataWarning` component (renders when stale, hidden when fresh)

3. **LOW - Accessibilité (FIXED)**: Ajouté `role="region"` et `aria-label` sur `StockAlertsPanel`.

### Verdict: APPROVED

Tous les critères d'acceptation sont correctement implémentés. Issues MEDIUM corrigées.

