### Additional Requirements

#### From Architecture (9 ADRs)

* **ARCH-ADR-001**: Entités synchronisées offline définies (products, categories, customers, orders, etc.)
* **ARCH-ADR-002**: Stratégie de synchronisation Last-Write-Wins + Audit Trail
* **ARCH-ADR-003**: Politique de cache (refresh at startup + hourly, 30-day purge)
* **ARCH-ADR-004**: PIN verification offline (bcrypt compare, 24h expiration)
* **ARCH-ADR-005**: Permissions offline (cached role\_permissions)
* **ARCH-ADR-006**: Socket.IO LAN architecture (POS = hub on port 3001)
* **ARCH-ADR-007**: Socket.IO events protocol (`{entity}:{action}` naming)
* **ARCH-ADR-008**: LAN discovery (fixed IP + QR fallback)
* **ARCH-ADR-009**: Failover strategy (each device independent, no auto-promotion)

#### Stack Additions (MVP)

* **STACK-01**: Dexie.js + dexie-react-hooks pour IndexedDB
* **STACK-02**: vite-plugin-pwa + workbox pour Service Worker
* **STACK-03**: Socket.IO pour communication LAN temps réel
* **STACK-04**: @capacitor/network pour détection réseau
* **STACK-05**: @capawesome/capacitor-background-task pour sync background

#### Pattern Requirements (Architecture)

* **PATTERN-01**: Tables Dexie préfixées `offline_`
* **PATTERN-02**: Events Socket.IO nommés `{entity}:{action}`
* **PATTERN-03**: Services offline dans `src/services/offline/`
* **PATTERN-04**: Services LAN dans `src/services/lan/`
* **PATTERN-05**: Hooks offline dans `src/hooks/offline/`
* **PATTERN-06**: Types: `I{Name}` pour interfaces, `T{Name}` pour types
* **PATTERN-07**: Fichiers max 300 lignes
* **PATTERN-08**: Wrapper standard `ISocketEvent<T>` pour events
* **PATTERN-09**: Structure standard `ISyncQueueItem` pour sync queue

#### From UX Design

* **UX-01**: Design System Tailwind CSS + shadcn/ui
* **UX-02**: Touch targets 48x48px POS/Mobile, 44x44px back-office
* **UX-03**: Feedback toasts discrets, jamais accusateurs
* **UX-04**: Indicateur offline: icône wifi grise (pas rouge)
* **UX-05**: Layout POS: 60% produits, 40% panier
* **UX-06**: Layout Mobile: 2 colonnes, bottom bar fixe
* **UX-07**: Layout Customer Display: logo, items animés, total géant
* **UX-08**: Layout KDS: colonnes par commande, timer, bouton "Prêt"
* **UX-09**: Breakpoints: Mobile < 640px, Tablet 640-1024px, Desktop > 1024px
* **UX-10**: Principes: POS sacré, information proactive, offline = normal

***
