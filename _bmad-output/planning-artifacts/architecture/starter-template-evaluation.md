# Starter Template Evaluation

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
