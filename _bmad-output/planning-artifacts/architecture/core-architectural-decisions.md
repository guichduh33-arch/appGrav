# Core Architectural Decisions

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
