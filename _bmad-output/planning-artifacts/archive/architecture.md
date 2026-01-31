---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-01-30'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-AppGrav-2026-01-30.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - src/.context/project_context.json
  - docs/index.md
  - docs/architecture-main.md
  - docs/data-models.md
workflowType: 'architecture'
projectType: 'brownfield'
project_name: 'AppGrav'
user_name: 'MamatCEO'
date: '2026-01-30'
status: 'in-progress'
---

# Architecture Decision Document - AppGrav

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context

**Project Type:** Brownfield (système ERP/POS existant avec améliorations)

**Existing Stack:**
- Frontend: React 18 + TypeScript + Vite
- State: Zustand + React Query
- Styling: Tailwind CSS
- Backend: Supabase (PostgreSQL + Edge Functions)
- Mobile: Capacitor (iOS/Android)
- i18n: i18next (FR, EN, ID)

**MVP Scope:**
1. Mode Offline POS (2h autonomie)
2. Customer Display (temps réel)
3. App Mobile Serveurs
4. Communication Réseau Local (LAN)

---

_Document initialisé le 2026-01-30 par le workflow BMAD Architecture_

---

## Project Context Analysis

_Analyse collaborative réalisée via Party Mode avec Winston (Architect), John (PM), Sally (UX), Amelia (Dev)_

### Requirements Overview

**Functional Requirements (56 FR across 7 domains):**

| Domaine | Count | Priorité MVP |
|---------|-------|--------------|
| Sales/POS | 14 | Critique |
| Inventory | 12 | Post-MVP |
| Customers & Loyalty | 8 | Partiel |
| Products | 6 | Post-MVP |
| Purchasing | 6 | Post-MVP |
| B2B | 5 | Post-MVP |
| Reporting | 5 | Post-MVP |

**Non-Functional Requirements (24 NFR - critiques):**

| NFR | Exigence | Impact Architectural |
|-----|----------|---------------------|
| Offline Autonomy | 2h sans connexion | IndexedDB + Sync Queue |
| Data Integrity | Zéro perte de données | CRDT ou Last-Write-Wins |
| LAN Latency | <500ms inter-device | WebSocket local |
| Response Time | <200ms interactions UI | Optimistic updates |
| Auth Speed | <2s changement utilisateur | PIN hash local |

### Scale & Complexity

- **Primary domain:** Full-stack (Frontend offline + Backend sync)
- **Complexity level:** Medium-High
- **Estimated architectural components:** 8-12 nouveaux modules
- **Existing codebase:** 67 tables, 21 enums, 20+ DB functions

**Complexity Indicators:**
- Real-time sync multi-device: HIGH
- Offline-first avec réconciliation: HIGH
- Multi-tenancy: LOW (single restaurant)
- Regulatory compliance: MEDIUM (fiscal receipts)
- Integration complexity: MEDIUM (imprimantes, displays)
- Data volume: MEDIUM (~200 transactions/jour)

### Technical Constraints & Dependencies

**Existants à préserver:**
- Supabase RLS policies (permission system)
- PIN-based auth via Edge Functions (pas Supabase Auth standard)
- React Query cache patterns
- Zustand stores (cart, auth, order, settings)
- i18next avec 3 locales bundled

**Nouvelles contraintes MVP:**
- Service Workers pour offline shell
- IndexedDB (Dexie.js) pour persistance locale
- WebSocket local pour LAN communication
- Capacitor plugins (Network, Background Sync)

### Cross-Cutting Concerns Identified

| Concern | Scope | Stratégie |
|---------|-------|-----------|
| Offline State Management | Toutes entités critiques (orders, cart, products, customers) | Dexie.js + React Query sync |
| LAN Communication | POS ↔ KDS ↔ Display ↔ Mobile | WebSocket avec POS comme hub |
| Sync Conflict Resolution | Orders, inventory movements | Last-write-wins + UI merge pour conflits |
| Authentication Offline | PIN verification sans serveur | PIN hash cached localement |
| Error Handling | Network failures, sync errors | Graceful degradation + retry queue |
| i18n Offline | 3 langues disponibles offline | Bundle complet des locales |
| RLS Permissions | Toutes opérations DB | Préserver pattern existant |

### Architecture Pattern Recommandé

```
[Internet disponible]
  POS/Mobile → Supabase Cloud ← autres apps
                    ↓
              Source de vérité

[Internet indisponible]
  App Mobile → POS Principal (LAN hub) → KDS/Display
                    ↓
              IndexedDB local
              Sync queue pending
```

**Justification:** Le POS principal fait office de hub local. Pattern simple, déterministe, fonctionne même sans internet. Supabase cloud reste source de vérité quand disponible.

### Risk Assessment

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Sync conflicts après 2h offline | Medium | High | UI de résolution simple + logs audit |
| LAN discovery failure | Low | Medium | Fallback manuel (IP config) |
| IndexedDB quota exceeded | Low | High | Purge anciennes données + alertes |
| PIN hash compromise | Low | Medium | Rotation périodique + audit logs |

---

_Analyse de contexte complétée le 2026-01-30 - Prêt pour décisions architecturales_

---

## Starter Template Evaluation

### Primary Technology Domain

**Brownfield Full-Stack Offline-First PWA** - Extension du stack existant (pas de nouveau starter)

### Stack Additions Evaluated

Pour un projet brownfield, évaluation des **ajouts techniques** nécessaires:

| Catégorie | Options Évaluées | Sélection | Justification |
|-----------|------------------|-----------|---------------|
| IndexedDB Wrapper | Dexie.js, RxDB, natif | **Dexie.js 4.x** | API simple, hooks React (`useLiveQuery`), 100k+ sites, support Capacitor |
| Service Worker | vite-plugin-pwa, Workbox CLI, custom | **vite-plugin-pwa** | Intégration Vite native, Workbox intégré, zero-config possible |
| LAN Communication | Socket.IO, WebSocket natif, Supabase Realtime | **Socket.IO** | Reconnexion auto, rooms/namespaces, fallback HTTP |
| Network Detection | @capacitor/network | **@capacitor/network** | Plugin officiel Capacitor, API stable |
| Background Sync | @capawesome/capacitor-background-task | **@capawesome/capacitor-background-task** | Sync en background iOS/Android |

### Selected Approach: Stack Augmentation

**Rationale:** Le stack existant (React 18 + Vite + Zustand + Supabase + Capacitor) est moderne et cohérent. Ajout ciblé de capacités offline plutôt que refonte complète.

### Installation Commands

```bash
# Persistance Offline
npm install dexie dexie-react-hooks

# PWA / Service Worker
npm install -D vite-plugin-pwa workbox-precaching workbox-routing

# Communication LAN
npm install socket.io-client

# Capacitor Plugins
npm install @capacitor/network @capawesome/capacitor-background-task
npx cap sync
```

### Architectural Decisions Established

**Offline Data Layer:**
- Dexie.js pour entités critiques (orders, cart, products, customers)
- Pattern: Write-through cache (écriture locale + queue sync)
- Hook `useLiveQuery` pour réactivité UI avec IndexedDB

**Service Worker Strategy:**
- `injectManifest` pour contrôle total sur le caching
- Precache: App shell, assets statiques, locales i18n
- Runtime cache: API responses avec stale-while-revalidate

**LAN Communication Pattern:**
- POS Principal = serveur Socket.IO local (port 3001)
- Autres devices = clients Socket.IO
- Events: `order:created`, `order:updated`, `cart:sync`, `display:update`
- Rooms: `kitchen`, `display`, `mobile-servers`

**Network State Management:**
- Capacitor Network plugin pour détection online/offline
- Flag global `isOnline` dans settingsStore
- UI indicator discret (non-alarmiste)

### Development Experience Impact

| Aspect | Impact |
|--------|--------|
| Hot reload | Préservé (vite-plugin-pwa mode dev) |
| TypeScript | Types à créer pour Dexie schemas |
| Debugging | IndexedDB visible dans DevTools |
| Testing | Mock réseau pour scénarios offline |

---

_Évaluation starter/stack complétée le 2026-01-30 - Prêt pour décisions architecturales détaillées_

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Entités à synchroniser offline
- Stratégie de résolution de conflits
- Architecture LAN (POS = hub)
- Authentification PIN offline

**Important Decisions (Shape Architecture):**
- Politique de cache/refresh
- Events Socket.IO
- Discovery LAN

**Deferred Decisions (Post-MVP):**
- Chiffrement IndexedDB (Web Crypto API)
- Failover automatique vers autre device
- Sync inventory/B2B offline

### Data Architecture

#### ADR-001: Entités Synchronisées Offline

| Entité | Mode | Justification |
|--------|------|---------------|
| `products` + `categories` | Read-only cache | Catalogue pour ventes POS |
| `customers` | Read-only cache | Fidélité, prix custom |
| `orders` + `order_items` | Read-write sync | Coeur du POS |
| `pos_sessions` | Read-write sync | Session caisse |
| `user_profiles` (subset) | Read-only cache | PIN hash, permissions |
| `settings` | Read-only cache | Config app |
| `product_modifiers` | Read-only cache | Options produits |
| `product_combos` + groups | Read-only cache | Combos |
| `promotions` + rules | Read-only cache | Promos actives |

**Exclusions (Online Only):**
- `stock_movements`, `inventory_counts` → Post-MVP
- `purchase_orders`, `b2b_*` → Post-MVP
- `audit_logs` → Online only (write-only)

#### ADR-002: Stratégie de Synchronisation

**Conflict Resolution:** Last-Write-Wins + Audit Trail

| Entité | Stratégie | Rationale |
|--------|-----------|-----------|
| `orders` | Last-Write-Wins | Rarement éditées simultanément, audit complet |
| `cart` | Last-Write-Wins | Device le plus récent gagne |
| Conflits détectés | Notification simple | Pas de merge UI complexe pour MVP |

**Sync Queue:**
- Stockée dans Dexie table `sync_queue`
- Structure: `{ id, entity, action, payload, timestamp, retries }`
- Retry: 3 tentatives avec backoff exponentiel
- Purge: Après confirmation serveur

#### ADR-003: Politique de Cache

| Donnée | Refresh Strategy | TTL |
|--------|-----------------|-----|
| `products`, `categories` | Au démarrage + chaque heure si online | 24h max |
| `customers` | Au démarrage + recherche client | 24h max |
| `promotions` | Au démarrage | Validité = dates start/end |
| `settings` | Au démarrage uniquement | Illimité |

**Purge Policy:**
- Orders > 30 jours → Supprimés du cache local
- Sync queue réussie → Purge immédiate
- Alerte si IndexedDB > 80% quota

### Authentication & Security

#### ADR-004: PIN Verification Offline

**Flow:**
1. Login online initial → récupérer `pin_hash` de `user_profiles`
2. Stocker dans Dexie table `offline_users`
3. Offline: bcrypt compare côté client
4. Expiration: 24h sans reconnexion → forcer re-login online

**Security Measures:**
- PIN hash déjà hashé serveur (pas PIN en clair)
- IndexedDB accès limité au domaine
- Future: Web Crypto API pour chiffrement at-rest

#### ADR-005: Permissions Offline

**Implementation:**
1. Au login: charger `role_permissions` + `user_permissions` dans Dexie
2. Fonction `hasPermissionOffline(code)` miroir du hook existant
3. Sync permissions à chaque reconnexion

**Restrictions Offline:**
- Actions sensibles (void, refund): PIN manager requis
- Création utilisateur: Online only

### API & Communication Patterns

#### ADR-006: Architecture Socket.IO LAN

```
┌─────────────────────────────────────────────────────┐
│                  POS Principal                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ React App   │  │ Socket.IO   │  │ Dexie.js    │ │
│  │ (frontend)  │  │ Server:3001 │  │ (IndexedDB) │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────┘
         ▲                ▲                ▲
    ┌────┴────┐     ┌────┴────┐     ┌────┴────┐
    │ Mobile  │     │   KDS   │     │ Display │
    │ Serveur │     │ Kitchen │     │ Client  │
    └─────────┘     └─────────┘     └─────────┘
```

**Implementation:** Worker + lightweight Express server embarqué dans le build POS

#### ADR-007: Socket.IO Events Protocol

```typescript
// Namespaces
/pos     → POS principal
/kitchen → KDS stations
/display → Customer displays
/mobile  → Apps serveurs

// Core Events
order:created    { orderId, items, table, timestamp }
order:updated    { orderId, changes, timestamp }
order:sent       { orderId, station }
order:ready      { orderId, items }
order:completed  { orderId }

// Sync Events
cart:sync        { deviceId, cart }
display:update   { orderId, items, total }
sync:request     { since: timestamp }
sync:response    { entities: [...] }

// System Events
device:connect   { deviceId, type, name }
device:disconnect{ deviceId }
```

### Infrastructure & Deployment

#### ADR-008: LAN Discovery

**Primary:** IP fixe configurée dans Settings > LAN > Hub IP
**Fallback:** QR Code scan au setup initial

**Rationale:** Simple, fiable, pas de dépendance mDNS/Bonjour

#### ADR-009: Failover Strategy

**MVP Approach:**
1. Chaque device garde son propre cache Dexie (indépendant du hub)
2. Sync queue locale continue d'accumuler si hub down
3. Quand hub revient → sync automatique
4. Si hub ne revient pas → mode "solo" jusqu'à internet

**Not Implemented (Post-MVP):**
- Promotion automatique d'un device en hub
- Élection de leader distribuée

### Decision Impact Analysis

**Implementation Sequence:**
1. Dexie schemas + migration (fondation)
2. Service Worker + PWA config
3. Offline auth (PIN cache)
4. Sync queue service
5. Socket.IO server integration
6. LAN client connections
7. Customer Display integration
8. Mobile app offline mode

**Cross-Component Dependencies:**

```
Dexie Schemas ──┬──► Sync Queue Service
                │
                ├──► Offline Auth
                │
                └──► useLiveQuery Hooks
                          │
                          ▼
                    React Query Integration
                          │
                          ▼
Socket.IO Server ◄────── UI Components
       │
       ├──► KDS Client
       ├──► Display Client
       └──► Mobile Client
```

---

_Décisions architecturales complétées le 2026-01-30 - Prêt pour patterns d'implémentation_

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 7 areas where AI agents could make different choices

1. Dexie table naming vs Supabase tables
2. Offline hook organization
3. Socket.IO event naming
4. Sync queue structure
5. Error handling offline
6. Service file organization
7. Type naming conventions

### Existing Patterns (Preserved)

From project CLAUDE.md - **ALL agents MUST follow:**

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Functions/Variables | camelCase | `handleSubmit` |
| Interfaces | I prefix | `IProduct` |
| Types | T prefix | `TOrderStatus` |
| DB columns | snake_case | `created_at` |
| Primary keys | UUID named `id` | |
| Foreign keys | `{table}_id` | `category_id` |
| Max file length | 300 lines | |

### Naming Patterns (New for Offline)

#### Dexie Table Naming

**Convention:** `offline_{entity}` prefix for all Dexie tables

```typescript
// src/lib/db.ts
db.version(1).stores({
  // Sync control
  offline_sync_queue: '++id, entity, action, timestamp, status',
  offline_sync_meta: 'entity, lastSyncAt',

  // Cached entities (read-only)
  offline_products: 'id, category_id, sku, name',
  offline_categories: 'id, name',
  offline_customers: 'id, phone, email',
  offline_users: 'id, pin_hash',
  offline_settings: 'key',
  offline_promotions: 'id, start_date, end_date',
  offline_product_modifiers: 'id, product_id',
  offline_product_combos: 'id',

  // Writable entities (sync to server)
  offline_orders: 'id, order_number, status, created_at',
  offline_order_items: '++id, order_id, product_id',
  offline_pos_sessions: 'id, user_id, status',
});
```

#### Socket.IO Event Naming

**Convention:** `{entity}:{action}` in snake_case

```typescript
// Core Events
'order:created'     // New order
'order:updated'     // Order modified
'order:sent'        // Sent to kitchen
'order:ready'       // Ready to serve
'order:completed'   // Finished

// Sync Events
'cart:sync'         // Cart synchronization
'display:update'    // Customer display update
'sync:request'      // Sync request
'sync:response'     // Sync response
'sync:conflict'     // Conflict detected

// System Events
'device:connect'    // Device connected
'device:disconnect' // Device disconnected
```

### Structure Patterns

#### Service Organization

```
src/
├── services/
│   ├── offline/                    # NEW: Offline services
│   │   ├── db.ts                   # Dexie instance & schemas
│   │   ├── syncService.ts          # Sync queue management
│   │   ├── offlineAuthService.ts   # PIN verification offline
│   │   └── cacheService.ts         # Cache refresh management
│   ├── lan/                        # NEW: LAN services
│   │   ├── socketService.ts        # Socket.IO client
│   │   ├── lanServerService.ts     # Socket.IO server (POS only)
│   │   └── discoveryService.ts     # LAN hub discovery
│   └── ... (existing services)
├── hooks/
│   ├── offline/                    # NEW: Offline hooks
│   │   ├── useNetworkStatus.ts     # Online/offline detection
│   │   ├── useSyncQueue.ts         # Sync queue state
│   │   ├── useOfflineAuth.ts       # Offline authentication
│   │   └── useOfflineData.ts       # Generic offline data hook
│   └── ... (existing hooks)
├── types/
│   ├── offline.ts                  # NEW: Offline-specific types
│   └── ... (existing types)
```

### Format Patterns

#### Sync Queue Item Structure

```typescript
// src/types/offline.ts

interface ISyncQueueItem {
  id?: number;           // Auto-increment (Dexie)
  entity: TSyncEntity;   // Target entity type
  action: TSyncAction;   // CRUD action
  entityId: string;      // UUID of entity
  payload: Record<string, any>;
  timestamp: string;     // ISO 8601
  status: TSyncStatus;   // Queue status
  retries: number;       // Retry count
  lastError?: string;    // Last error message
}

type TSyncEntity = 'orders' | 'order_items' | 'pos_sessions';
type TSyncAction = 'create' | 'update' | 'delete';
type TSyncStatus = 'pending' | 'syncing' | 'failed' | 'completed';
```

#### Socket Event Payload Structure

```typescript
// Standard event wrapper
interface ISocketEvent<T> {
  eventId: string;      // UUID unique per event
  timestamp: string;    // ISO 8601
  deviceId: string;     // Source device identifier
  payload: T;           // Event-specific data
}

// Example usage
interface IOrderCreatedPayload {
  orderId: string;
  items: IOrderItem[];
  table?: string;
  customerId?: string;
}
```

### Communication Patterns

#### Offline Hook Pattern

```typescript
// Pattern: Unified hook with automatic source detection
// src/hooks/offline/useOfflineData.ts

export function useOfflineData<T>(
  entity: string,
  onlineQuery: () => Promise<T[]>,
  offlineQuery: () => Promise<T[]>
) {
  const { isOnline } = useNetworkStatus();

  // React Query for online
  const onlineResult = useQuery({
    queryKey: [entity],
    queryFn: onlineQuery,
    enabled: isOnline,
  });

  // Dexie for offline
  const offlineResult = useLiveQuery(
    () => !isOnline ? offlineQuery() : null,
    [isOnline]
  );

  return {
    data: isOnline ? onlineResult.data : offlineResult,
    isLoading: isOnline ? onlineResult.isLoading : false,
    isOffline: !isOnline,
  };
}
```

### Process Patterns

#### Error Handling Offline

```typescript
// src/lib/errors.ts

class OfflineError extends Error {
  constructor(
    message: string,
    public code: TOfflineErrorCode,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'OfflineError';
  }
}

type TOfflineErrorCode =
  | 'SYNC_FAILED'       // Server sync failed
  | 'QUEUE_FULL'        // Sync queue saturated
  | 'STORAGE_FULL'      // IndexedDB quota exceeded
  | 'CONFLICT'          // Data conflict detected
  | 'AUTH_EXPIRED'      // Offline session expired
  | 'LAN_UNREACHABLE';  // LAN hub unreachable

// Usage pattern
async function handleOfflineOperation() {
  try {
    await performOperation();
  } catch (error) {
    if (error instanceof OfflineError && error.recoverable) {
      await addToSyncQueue(operation);
      toast.info(t('sync.queued'));
    } else {
      toast.error(t('errors.operation_failed'));
      logError(error);
    }
  }
}
```

### Enforcement Guidelines

**All AI Agents MUST:**

1. ✅ Prefix all Dexie tables with `offline_`
2. ✅ Use `I{Name}` for interfaces, `T{Name}` for types
3. ✅ Place offline services in `src/services/offline/`
4. ✅ Place LAN services in `src/services/lan/`
5. ✅ Follow event naming `{entity}:{action}`
6. ✅ Use `OfflineError` class for recoverable errors
7. ✅ Add translations to ALL 3 locales (FR/EN/ID)
8. ✅ Keep files under 300 lines
9. ✅ Use standard `ISocketEvent<T>` wrapper for Socket events
10. ✅ Use standard `ISyncQueueItem` structure for sync queue

### Anti-Patterns (AVOID)

| ❌ Anti-Pattern | ✅ Correct Pattern |
|----------------|-------------------|
| `orders` (Dexie table) | `offline_orders` |
| `orderCreated` (event) | `order:created` |
| `services/syncService.ts` | `services/offline/syncService.ts` |
| `type OrderStatus` | `type TOrderStatus` |
| `interface Product` | `interface IProduct` |
| Custom event structures | Use `ISocketEvent<T>` wrapper |

---

_Patterns d'implémentation complétés le 2026-01-30 - Prêt pour structure projet_

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
AppGrav/
├── 📄 Configuration Root
│   ├── package.json
│   ├── vite.config.ts
│   ├── capacitor.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── components.json              # shadcn/ui config
│   └── .env.local
│
├── 📁 src/
│   ├── 📁 components/
│   │   ├── auth/                    # Login, PIN entry
│   │   ├── inventory/               # Stock management
│   │   ├── kds/                     # Kitchen Display
│   │   ├── mobile/                  # Server mobile components
│   │   ├── pos/                     # POS components
│   │   │   ├── modals/
│   │   │   └── shift/
│   │   ├── products/                # Product management
│   │   ├── reports/                 # Reporting components
│   │   ├── settings/                # Settings UI
│   │   ├── sync/                    # Sync status indicators
│   │   └── ui/                      # shadcn/ui components
│   │
│   ├── 📁 pages/
│   │   ├── auth/                    # Login page
│   │   ├── b2b/                     # B2B module
│   │   ├── customers/               # Customer management
│   │   ├── display/                 # 🎯 Customer Display (MVP)
│   │   ├── inventory/               # Inventory pages
│   │   ├── kds/                     # 🎯 Kitchen Display (MVP)
│   │   ├── mobile/                  # 🎯 Server Mobile (MVP)
│   │   ├── orders/                  # Order management
│   │   ├── pos/                     # 🎯 POS (MVP core)
│   │   ├── production/              # Production records
│   │   ├── products/                # Product pages
│   │   ├── purchasing/              # Purchase orders
│   │   ├── reports/                 # Reports pages
│   │   └── settings/                # Settings pages
│   │
│   ├── 📁 services/
│   │   ├── 📁 sync/                 # 🎯 OFFLINE SYNC (MVP)
│   │   │   ├── offlineDb.ts         # Dexie database setup
│   │   │   ├── syncQueue.ts         # Sync queue management
│   │   │   ├── syncEngine.ts        # Sync orchestration
│   │   │   ├── orderSync.ts         # Order sync logic
│   │   │   ├── productSync.ts       # Product cache sync
│   │   │   ├── customerSync.ts      # Customer cache sync
│   │   │   └── offlinePeriod.ts     # Offline period tracking
│   │   ├── 📁 lan/                  # 🎯 LAN COMMUNICATION (MVP)
│   │   │   ├── lanHub.ts            # Socket.IO server (POS)
│   │   │   ├── lanClient.ts         # Socket.IO client
│   │   │   ├── lanProtocol.ts       # Event definitions
│   │   │   └── index.ts
│   │   ├── 📁 display/              # 🎯 CUSTOMER DISPLAY (MVP)
│   │   │   ├── displayBroadcast.ts  # Display updates
│   │   │   └── index.ts
│   │   ├── authService.ts           # Authentication
│   │   ├── promotionService.ts      # Promotions
│   │   └── ReportingService.ts      # Reports
│   │
│   ├── 📁 stores/                   # Zustand stores
│   │   ├── authStore.ts             # Auth state
│   │   ├── cartStore.ts             # Cart state
│   │   ├── displayStore.ts          # 🎯 Display state (MVP)
│   │   ├── lanStore.ts              # 🎯 LAN state (MVP)
│   │   ├── mobileStore.ts           # 🎯 Mobile state (MVP)
│   │   ├── orderStore.ts            # Order state
│   │   └── settingsStore.ts         # Settings state
│   │
│   ├── 📁 hooks/
│   │   ├── inventory/               # Inventory hooks
│   │   ├── products/                # Product hooks
│   │   ├── reports/                 # Report hooks
│   │   ├── settings/                # Settings hooks
│   │   ├── shift/                   # Shift hooks
│   │   ├── 📁 offline/              # 🎯 MVP: Offline hooks
│   │   │   ├── useNetworkStatus.ts
│   │   │   ├── useSyncQueue.ts
│   │   │   └── useOfflineAuth.ts
│   │   └── usePermissions.ts        # Permission hook
│   │
│   ├── 📁 types/
│   │   ├── database.ts              # Full DB types
│   │   ├── auth.ts                  # Auth types
│   │   ├── settings.ts              # Settings types
│   │   ├── reporting.ts             # Report types
│   │   └── offline.ts               # 🎯 MVP: Offline types
│   │
│   ├── 📁 lib/
│   │   ├── supabase.ts              # Supabase client
│   │   ├── utils.ts                 # Utilities
│   │   └── db.ts                    # 🎯 MVP: Dexie instance
│   │
│   ├── 📁 locales/
│   │   ├── fr.json                  # French
│   │   ├── en.json                  # English
│   │   └── id.json                  # Indonesian
│   │
│   └── 📁 constants/                # App constants
│
├── 📁 supabase/
│   ├── migrations/                  # SQL migrations
│   └── functions/                   # Edge Functions
│
├── 📁 docs/                         # Documentation
├── 📁 android/                      # Capacitor Android
├── 📁 ios/                          # Capacitor iOS
└── 📁 public/                       # Static assets
```

### Architectural Boundaries

#### API Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL BOUNDARY                         │
│              Supabase Cloud API (source of truth)           │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                     SYNC BOUNDARY                            │
│              services/sync/* (orchestration)                │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL DATA BOUNDARY                       │
│              lib/db.ts (Dexie/IndexedDB)                    │
└─────────────────────────────────────────────────────────────┘
```

#### LAN Communication Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                    POS PRINCIPAL (HUB)                       │
│           services/lan/lanHub.ts - Socket.IO :3001          │
└─────────────────────────────────────────────────────────────┘
         ↕ WebSocket            ↕ WebSocket          ↕ WebSocket
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   KDS Client    │   │  Display Client │   │  Mobile Client  │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

### Requirements to Structure Mapping

#### MVP Feature Mapping

| Feature | Primary Files |
|---------|---------------|
| **Offline POS** | `lib/db.ts`, `services/sync/*`, `hooks/offline/*` |
| **Customer Display** | `pages/display/*`, `stores/displayStore.ts`, `services/display/*` |
| **LAN Communication** | `services/lan/*`, `stores/lanStore.ts` |
| **Mobile Serveurs** | `pages/mobile/*`, `stores/mobileStore.ts` |

#### Cross-Cutting Concerns

| Concern | Location |
|---------|----------|
| Authentication | `stores/authStore.ts`, `services/authService.ts` |
| Permissions | `hooks/usePermissions.ts` |
| i18n | `locales/*.json` |
| Network State | `hooks/offline/useNetworkStatus.ts` |

### Data Flow Architecture

```
User Action → Zustand Store → Online? → Supabase Direct
                                    → Offline? → Dexie + Sync Queue
                           ↓
                    Socket.IO Broadcast
                           ↓
              ┌────────────┼────────────┐
              ▼            ▼            ▼
            KDS        Display       Mobile
```

### Files to Create/Modify for MVP

| Action | File | Description |
|--------|------|-------------|
| Create | `src/lib/db.ts` | Dexie database instance |
| Create | `src/types/offline.ts` | Offline-specific types |
| Create | `src/hooks/offline/useNetworkStatus.ts` | Network detection |
| Create | `src/hooks/offline/useOfflineAuth.ts` | Offline auth |
| Enhance | `src/services/sync/offlineDb.ts` | Dexie schema |
| Enhance | `src/services/lan/lanHub.ts` | Socket.IO server |
| Enhance | `vite.config.ts` | Add vite-plugin-pwa |

---

_Structure projet complétée le 2026-01-30 - Prêt pour validation architecturale_

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- React 18 + TypeScript + Vite ✅ Stack standard moderne
- Zustand + React Query ✅ Patterns complémentaires
- Dexie.js + React ✅ useLiveQuery intégration native
- Socket.IO + React ✅ Event-driven bien supporté
- vite-plugin-pwa + Vite ✅ Plugin natif
- Capacitor + PWA ✅ Cohabitation documentée

**Pattern Consistency:**
- Naming conventions cohérentes (existantes préservées + offline_* pour Dexie)
- Event naming `{entity}:{action}` appliqué partout
- Type conventions `I{Name}`, `T{Name}` respectées

**Structure Alignment:**
- Project structure supporte toutes les décisions
- services/sync/, services/lan/ pour nouvelles features
- Boundaries clairement définis

### Requirements Coverage Validation ✅

**MVP Feature Coverage:**

| Feature | Coverage |
|---------|----------|
| Offline POS 2h | ✅ Dexie + Sync Queue + Service Worker |
| Customer Display | ✅ Socket.IO + displayStore |
| Mobile Serveurs | ✅ Capacitor + LAN client |
| LAN Communication | ✅ Socket.IO hub/client |

**NFR Coverage:**

| NFR | Solution |
|-----|----------|
| 2h offline | ✅ IndexedDB persistence |
| Zero data loss | ✅ Sync queue + retry 3x |
| <500ms LAN | ✅ WebSocket local |
| <200ms UI | ✅ Optimistic updates |
| <2s auth | ✅ PIN hash local |

### Implementation Readiness Validation ✅

**Decision Completeness:**
- ✅ 9 ADRs documentés avec versions
- ✅ Sequence d'implémentation définie (8 étapes)
- ✅ Rationale pour chaque décision

**Structure Completeness:**
- ✅ Directory tree complet
- ✅ Fichiers à créer/modifier listés
- ✅ Boundaries définis

**Pattern Completeness:**
- ✅ Naming conventions spécifiées
- ✅ Event structures définies
- ✅ Error handling patterns documentés
- ✅ Anti-patterns listés

### Gap Analysis Results

**Critical Gaps:** AUCUN ✅

**Minor Gaps (Post-MVP):**
- Tests offline E2E détaillés
- Performance benchmarks
- Chiffrement IndexedDB

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context analysé
- [x] Scale et complexité évalués
- [x] Contraintes techniques identifiées
- [x] Cross-cutting concerns mappés

**✅ Architectural Decisions**
- [x] Décisions critiques documentées (9 ADRs)
- [x] Stack technique spécifié avec versions
- [x] Patterns d'intégration définis
- [x] Considérations performance adressées

**✅ Implementation Patterns**
- [x] Conventions de nommage établies
- [x] Patterns de structure définis
- [x] Patterns de communication spécifiés
- [x] Patterns de process documentés

**✅ Project Structure**
- [x] Structure répertoires complète
- [x] Boundaries composants établis
- [x] Points d'intégration mappés
- [x] Mapping requirements → structure complet

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
- Stack brownfield cohérent et moderne
- Services offline/LAN déjà partiellement en place
- Patterns clairs pour les agents IA
- Decisions bien documentées avec rationale

**Areas for Future Enhancement (Post-MVP):**
- Chiffrement IndexedDB (Web Crypto API)
- Failover automatique entre devices
- Sync inventory/B2B offline

### Implementation Handoff

**AI Agent Guidelines:**
1. Suivre TOUS les ADRs exactement comme documentés
2. Utiliser les patterns d'implémentation de façon cohérente
3. Respecter la structure projet et les boundaries
4. Consulter ce document pour toute question architecturale

**First Implementation Priority:**
```bash
# 1. Installer les dépendances MVP
npm install dexie dexie-react-hooks
npm install -D vite-plugin-pwa workbox-precaching workbox-routing
npm install socket.io-client
npm install @capacitor/network @capawesome/capacitor-background-task
npx cap sync

# 2. Créer les fichiers fondation
# - src/lib/db.ts (Dexie instance)
# - src/types/offline.ts (Types offline)
# - Enhance src/services/sync/offlineDb.ts
```

---

_Validation architecturale complétée le 2026-01-30_
