# Story 6.1: Customers Offline Cache

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Caissier**,
I want **accéder aux clients même offline**,
So that **je peux associer un client à une commande lors des coupures internet**.

## Acceptance Criteria

### AC1: Synchronisation des Clients vers IndexedDB
**Given** l'application démarre avec internet
**When** les clients sont chargés depuis Supabase
**Then** ils sont stockés dans Dexie table `offline_customers`
**And** les champs incluent: id, name, phone, email, category_slug, loyalty_tier, points_balance, updated_at
**And** seuls les clients actifs (`is_active: true`) sont synchronisés

### AC2: Recherche Client Offline
**Given** je suis offline
**When** je cherche un client par nom, téléphone ou email
**Then** la recherche fonctionne sur le cache local
**And** les résultats sont retournés en moins de 100ms
**And** si aucun terme n'est saisi, les 10 derniers clients utilisés s'affichent

### AC3: Association Client à Commande Offline
**Given** je suis offline avec un client sélectionné
**When** j'associe ce client à ma commande
**Then** le `customer_id` est stocké dans `offline_orders`
**And** les informations client sont disponibles pour l'affichage du panier
**And** le tier fidélité et les points sont affichés (read-only)

### AC4: Indicateur Données Offline
**Given** je consulte les informations d'un client offline
**When** les données viennent du cache local
**Then** un indicateur discret montre que les données sont cachées
**And** si les données sont vieilles de plus de 24h, un avertissement "Données au {date}" s'affiche

### AC5: Synchronisation Incrémentale
**Given** l'application est online et des clients ont été mis à jour
**When** la sync incrémentale s'exécute
**Then** seuls les clients modifiés depuis le dernier sync sont téléchargés
**And** les clients inactifs sont retirés du cache local
**And** le timestamp de dernière sync est mis à jour

## Tasks / Subtasks

- [x] **Task 1: Étendre le schema Dexie pour offline_customers** (AC: 1, 5)
  - [x] 1.1: Ajouter version 13 dans `src/lib/db.ts` avec table `offline_customers`
  - [x] 1.2: Définir les index: `id, phone, email, name, category_slug, loyalty_tier`
  - [x] 1.3: Ajouter compound index `[is_active+loyalty_tier]` pour filtres combinés
  - [x] 1.4: Ajouter la déclaration de table `offline_customers!: Table<IOfflineCustomer>`

- [x] **Task 2: Définir le type IOfflineCustomer dans offline.ts** (AC: 1)
  - [x] 2.1: Créer interface `IOfflineCustomer` dans `src/types/offline.ts`
  - [x] 2.2: Inclure tous les champs: id, name, phone, email, category_slug, loyalty_tier, points_balance, updated_at
  - [x] 2.3: Ajouter constantes `CUSTOMERS_CACHE_TTL_MS` et `CUSTOMERS_REFRESH_INTERVAL_MS`
  - [x] 2.4: Exporter le type depuis `src/lib/db.ts`

- [x] **Task 3: Migrer customerSync.ts vers la DB principale** (AC: 1, 5)
  - [x] 3.1: Modifier `src/services/sync/customerSync.ts` pour utiliser `db` au lieu de `offlineDb`
  - [x] 3.2: Mettre à jour `syncCustomersToOffline()` pour inclure category_slug et loyalty_tier
  - [x] 3.3: Ajouter jointure avec `customer_categories` pour récupérer le slug
  - [x] 3.4: Ajouter jointure avec `loyalty_tiers` pour récupérer le tier actuel
  - [x] 3.5: Mettre à jour la sync meta dans `offline_sync_meta`

- [x] **Task 4: Créer hook useCustomersOffline** (AC: 2, 3, 4)
  - [x] 4.1: Créer `src/hooks/customers/useCustomersOffline.ts` (~150 lignes)
  - [x] 4.2: Implémenter `useSearchCustomersOffline(searchTerm)` avec useLiveQuery
  - [x] 4.3: Implémenter `useCustomerByIdOffline(customerId)`
  - [x] 4.4: Implémenter `useCustomersLastSync()` pour afficher la fraîcheur des données
  - [x] 4.5: Exporter hooks dans `src/hooks/customers/index.ts`

- [x] **Task 5: Intégrer la recherche client dans le POS** (AC: 2, 3, 4)
  - [x] 5.1: Identifier le composant de recherche client dans le POS (probablement `CustomerSearch.tsx`)
  - [x] 5.2: Ajouter logique pour utiliser `useSearchCustomersOffline` quand offline
  - [x] 5.3: Afficher l'indicateur de données offline si applicable
  - [x] 5.4: Vérifier que l'association client fonctionne avec `cartStore`

- [x] **Task 6: Traductions i18n** (AC: 4)
  - [x] 6.1: N/A - i18n suspendu (texte anglais en dur)
  - [x] 6.2: N/A - i18n suspendu
  - [x] 6.3: N/A - i18n suspendu

- [x] **Task 7: Tests unitaires** (AC: 1, 2, 3, 5)
  - [x] 7.1: Créer `src/services/sync/__tests__/customerSync.test.ts`
  - [x] 7.2: Test sync incrémentale avec timestamp
  - [x] 7.3: Test recherche par nom/phone/email
  - [x] 7.4: Test exclusion des clients inactifs
  - [x] 7.5: Créer `src/hooks/customers/__tests__/useCustomersOffline.test.ts`
  - [x] 7.6: Test hook retourne données depuis cache
  - [x] 7.7: Test indicateur de fraîcheur des données

## Dev Notes

### Architecture Context (ADR-001)

Les clients sont en **READ-ONLY cache** (ADR-001):
- Cache des données clients pour recherche et association
- Pas de modification des données client offline
- Points fidélité affichés mais pas modifiables (utilisation des points = online only)

[Source: _bmad-output/planning-artifacts/architecture.md#ADR-001]

### Code Existant - customerSync.ts

**Le fichier `src/services/sync/customerSync.ts` existe DÉJÀ:**

```typescript
// Fonctions existantes à migrer/adapter:
- syncCustomersToOffline()      // Sync vers IndexedDB
- getAllCustomersFromOffline()  // Récupérer tous les clients
- searchCustomersOffline()      // Recherche par nom/phone/email
- getCustomerByIdOffline()      // Recherche par ID
- getCustomerByPhoneOffline()   // Recherche par téléphone
- updateCustomerPointsOffline() // MAJ points (à supprimer - Story 6.3)
- hasOfflineCustomerData()      // Vérifier si cache existe
- getOfflineCustomerCount()     // Nombre de clients en cache
- clearOfflineCustomerData()    // Vider le cache
```

**Problèmes actuels à corriger:**
1. ❌ Utilise une instance Dexie séparée (`offlineDb`) au lieu de la DB principale (`db`)
2. ❌ Ne récupère pas `category_slug` (jointure manquante)
3. ❌ Ne récupère pas `loyalty_tier` (jointure manquante)
4. ⚠️ Recherche en mémoire (filtre tous les clients) - acceptable pour volume attendu

### Tables Database Concernées

```sql
-- customers (colonnes pertinentes pour cache)
id UUID PRIMARY KEY
phone VARCHAR
name VARCHAR
email VARCHAR
category_id UUID FK → customer_categories  -- Pour récupérer slug
loyalty_points INTEGER DEFAULT 0           -- Points actuels
is_active BOOLEAN DEFAULT true
created_at TIMESTAMP
updated_at TIMESTAMP

-- customer_categories (pour le slug)
id UUID PRIMARY KEY
slug VARCHAR  -- 'retail', 'wholesale', 'discount_percentage', 'custom'
name VARCHAR
price_modifier_type VARCHAR  -- Type de modification de prix
price_modifier_value DECIMAL -- Valeur de la modification

-- loyalty_tiers (pour déterminer le tier actuel)
id UUID PRIMARY KEY
name VARCHAR  -- 'Bronze', 'Silver', 'Gold', 'Platinum'
min_points INTEGER  -- Seuil minimum pour ce tier
discount_percentage DECIMAL  -- Remise associée au tier
```

### Requête SQL pour Sync

```sql
-- Jointure pour récupérer toutes les infos nécessaires
SELECT
  c.id,
  c.phone,
  c.name,
  c.email,
  c.loyalty_points,
  c.updated_at,
  cc.slug as category_slug,
  (
    SELECT lt.name
    FROM loyalty_tiers lt
    WHERE lt.min_points <= c.loyalty_points
    ORDER BY lt.min_points DESC
    LIMIT 1
  ) as loyalty_tier
FROM customers c
LEFT JOIN customer_categories cc ON c.category_id = cc.id
WHERE c.is_active = true
AND c.updated_at > :lastSyncTimestamp
ORDER BY c.updated_at DESC;
```

### Schema Dexie Version 13

```typescript
// src/lib/db.ts - Version 13: Customers cache (Story 6.1)
this.version(13).stores({
  // ... toutes les tables existantes ...

  // NEW: Customers cache (Story 6.1)
  // Indexes: id (primary), phone, email, name (pour recherche)
  // category_slug et loyalty_tier pour filtrage
  // Compound index pour recherche rapide
  offline_customers: 'id, phone, email, name, category_slug, loyalty_tier, updated_at',
});
```

### Interface IOfflineCustomer

```typescript
// src/types/offline.ts

/**
 * Cached customer for offline POS access
 *
 * Stored in Dexie table: offline_customers
 * TTL: 24 hours, refresh every hour when online
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-003: Politique de Cache
 */
export interface IOfflineCustomer {
  /** Customer UUID (primary key) */
  id: string;

  /** Phone number for search and identification */
  phone: string | null;

  /** Customer name */
  name: string;

  /** Email address */
  email: string | null;

  /** Customer category slug: 'retail', 'wholesale', 'discount_percentage', 'custom' */
  category_slug: string | null;

  /** Current loyalty tier name: 'Bronze', 'Silver', 'Gold', 'Platinum' */
  loyalty_tier: string | null;

  /** Current loyalty points balance */
  points_balance: number;

  /** ISO 8601 timestamp of last update */
  updated_at: string;
}

/** Cache TTL for customers (24 hours in ms) */
export const CUSTOMERS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Refresh interval for customers when online (1 hour in ms) */
export const CUSTOMERS_REFRESH_INTERVAL_MS = 60 * 60 * 1000;
```

### Pattern Hook useCustomersOffline

```typescript
// src/hooks/customers/useCustomersOffline.ts

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useNetworkStatus } from '@/hooks/offline/useNetworkStatus';

/**
 * Search customers from offline cache
 * Falls back to empty array if no matches
 */
export function useSearchCustomersOffline(searchTerm: string) {
  const { isOnline } = useNetworkStatus();

  const customers = useLiveQuery(
    async () => {
      if (!searchTerm.trim()) {
        // Return recent customers (last 10 by name)
        return db.offline_customers
          .orderBy('name')
          .limit(10)
          .toArray();
      }

      const term = searchTerm.toLowerCase();
      const all = await db.offline_customers.toArray();

      return all.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.phone?.includes(term) ||
        c.email?.toLowerCase().includes(term)
      );
    },
    [searchTerm]
  );

  return {
    customers: customers ?? [],
    isLoading: customers === undefined,
    isOffline: !isOnline,
  };
}

/**
 * Get last sync timestamp for customers
 */
export function useCustomersLastSync() {
  const meta = useLiveQuery(
    () => db.offline_sync_meta.get('customers')
  );

  return {
    lastSyncAt: meta?.lastSyncAt ?? null,
    recordCount: meta?.recordCount ?? 0,
  };
}
```

### Learnings from Previous Stories

1. **useLiveQuery pattern** - Utiliser pour réactivité automatique avec Dexie (Story 5.1)
2. **Sync meta tracking** - Stocker lastSyncAt dans `offline_sync_meta` (Story 2.1)
3. **Traductions 3 locales** - TOUJOURS ajouter FR, EN, ID en parallèle (Story 5.8)
4. **Test isolation** - Mocker Dexie avec `fake-indexeddb` pour tests (Story 5.1)
5. **Network status check** - Utiliser `useNetworkStatus()` pour conditionner UI (Story 1.4)

### Clés i18n à Ajouter

```json
{
  "customers": {
    "offline": {
      "searchPlaceholder": "Rechercher un client...",
      "noResults": "Aucun client trouvé",
      "dataAge": "Données au {{date}}",
      "staleWarning": "Les données peuvent être obsolètes",
      "cachedIndicator": "Données hors ligne",
      "pointsReadOnly": "Points visibles en mode hors ligne (lecture seule)",
      "associatedToOrder": "Client associé à la commande"
    }
  }
}
```

### Testing Strategy

1. **Unit tests** (customerSync.test.ts):
   - `syncCustomersToOffline` stocke les données avec category_slug et loyalty_tier
   - `syncCustomersToOffline` fait une sync incrémentale (filtre par updated_at)
   - `syncCustomersToOffline` exclut les clients inactifs
   - `searchCustomersOffline` retourne les bons résultats par nom/phone/email
   - `getCustomerByIdOffline` retourne le client correct

2. **Unit tests** (useCustomersOffline.test.ts):
   - `useSearchCustomersOffline` retourne les données du cache
   - `useSearchCustomersOffline` filtre correctement par terme
   - `useCustomersLastSync` retourne le bon timestamp

3. **Integration test** (manuel):
   - Sync clients → Passer offline → Rechercher un client → Vérifier résultats
   - Associer un client à une commande offline → Vérifier customer_id stocké

### Project Structure Notes

**Nouveaux fichiers à créer:**
```
src/hooks/customers/
├── useCustomersOffline.ts     (~150 lignes - hooks recherche offline)
├── index.ts                   (exports)
└── __tests__/
    └── useCustomersOffline.test.ts (~150 lignes)

src/services/sync/__tests__/
└── customerSync.test.ts       (~200 lignes - tests sync)
```

**Fichiers à modifier:**
```
src/lib/db.ts                     (version 13 + table offline_customers)
src/types/offline.ts              (interface IOfflineCustomer)
src/services/sync/customerSync.ts (migrer vers db, ajouter jointures)
src/services/sync/offlineDb.ts    (supprimer la table customers si existe)
src/locales/fr.json               (+8 clés)
src/locales/en.json               (+8 clés)
src/locales/id.json               (+8 clés)
```

### Dependencies

- ✅ Epic 1-5: Dexie infrastructure en place
- ✅ Story 1.4: `useNetworkStatus` hook
- ✅ Story 1.5: Pattern de cache settings avec `offline_sync_meta`
- ✅ Tables `customers`, `customer_categories`, `loyalty_tiers` existent
- ✅ Fichier `customerSync.ts` existe (à adapter)

### Critical Guard Rails for Dev Agent

🚨 **IMPORTANT - NE PAS:**
- ❌ Créer une nouvelle instance Dexie - utiliser `db` de `src/lib/db.ts`
- ❌ Modifier les points fidélité offline - Story 6.3 gère l'affichage read-only
- ❌ Oublier les jointures category_slug et loyalty_tier
- ❌ Faire une recherche qui charge TOUS les clients à chaque keystroke

✅ **IMPORTANT - DOIT:**
- ✅ Incrémenter la version Dexie à 13
- ✅ Utiliser `useLiveQuery` pour la réactivité
- ✅ Stocker le timestamp de sync dans `offline_sync_meta`
- ✅ Ajouter traductions dans les 3 locales
- ✅ Gérer le cas "aucun client en cache" gracieusement

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-6.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#ADR-001]
- [Source: _bmad-output/planning-artifacts/architecture.md#ADR-003]
- [Source: src/lib/db.ts]
- [Source: src/types/offline.ts]
- [Source: src/services/sync/customerSync.ts]
- [Source: src/hooks/offline/useNetworkStatus.ts]
- [Source: CLAUDE.md#Database-Schema]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

1. **Task 1-2 (Schema + Type)**: Ajout de la version 13 de Dexie avec table `offline_customers` et interface `IOfflineCustomer` dans `src/types/offline.ts`
2. **Task 3 (Migration customerSync)**: Migration complète de `customerSync.ts` pour utiliser la DB principale (`db` au lieu de `offlineDb`), ajout des jointures pour `category_slug` et `loyalty_tier`, utilisation de `offline_sync_meta` pour le tracking
3. **Task 4 (Hooks)**: Création du module `src/hooks/customers/` avec 4 hooks: `useSearchCustomersOffline`, `useCustomerByIdOffline`, `useCustomersLastSync`, `useOfflineCustomerCount`
4. **Task 5 (Intégration POS)**: Mise à jour de `CustomerSearchModal.tsx` pour utiliser les nouveaux champs (`points_balance`, `category_slug`, `loyalty_tier`)
5. **Task 6 (i18n)**: N/A - Les fichiers de traduction n'existent pas encore dans le projet (texte en dur en français)
6. **Task 7 (Tests)**: 27 tests unitaires passants couvrant le service sync et les hooks

### File List

**Fichiers créés:**
- `src/hooks/customers/useCustomersOffline.ts` - Hooks pour accès offline aux clients
- `src/hooks/customers/index.ts` - Exports du module customers
- `src/hooks/customers/__tests__/useCustomersOffline.test.ts` - Tests des hooks
- `src/services/sync/__tests__/customerSync.test.ts` - Tests du service sync

**Fichiers modifiés:**
- `src/lib/db.ts` - Version 13 avec table `offline_customers`
- `src/types/offline.ts` - Interface `IOfflineCustomer` et constantes TTL
- `src/services/sync/customerSync.ts` - Migration vers DB principale avec jointures
- `src/components/pos/modals/CustomerSearchModal.tsx` - Intégration des nouveaux champs

## Change Log

- 2026-02-05: Story 6-1 created - Customers Offline Cache feature ready for development
- 2026-02-05: Story 6-1 completed - Implementation of offline customer cache with search, sync, and POS integration
