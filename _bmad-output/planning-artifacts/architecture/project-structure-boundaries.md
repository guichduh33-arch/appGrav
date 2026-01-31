# Project Structure & Boundaries

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
