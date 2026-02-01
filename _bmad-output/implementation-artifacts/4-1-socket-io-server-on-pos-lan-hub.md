# Story 4.1: Socket.IO Server on POS (LAN Hub)

Status: done

## Story

As a **Système**,
I want **que le POS serve de hub Socket.IO sur le LAN**,
so that **les autres appareils peuvent communiquer sans internet**.

## Acceptance Criteria

### AC1: Serveur Socket.IO au Démarrage POS
**Given** le POS démarre
**When** l'application s'initialise
**Then** un serveur Socket.IO écoute sur le port 3001
**And** les connexions LAN sont acceptées

### AC2: Enregistrement des Appareils Connectés
**Given** un appareil se connecte (KDS, Mobile, Display)
**When** la connexion Socket.IO est établie
**Then** l'appareil est enregistré avec son type et son ID
**And** les events peuvent être échangés bidirectionnellement

### AC3: Heartbeat et Détection de Déconnexion
**Given** un appareil est connecté
**When** le heartbeat n'est pas reçu pendant 120 secondes
**Then** l'appareil est marqué comme déconnecté
**And** le hub notifie les autres appareils

### AC4: Hub Discovery via Store
**Given** d'autres appareils cherchent le hub
**When** ils vérifient le lanStore
**Then** l'IP et le port du hub sont disponibles
**And** la connexion peut s'établir automatiquement

## Tasks / Subtasks

- [x] **Task 1: Analyser l'implémentation existante et déterminer l'approche** (AC: 1)
  - [x] 1.1: Lire et comprendre l'implémentation actuelle de `lanHub.ts` (BroadcastChannel + Supabase Realtime)
  - [x] 1.2: Évaluer si Socket.IO natif est nécessaire ou si l'approche actuelle suffit
  - [x] 1.3: Documenter la décision et les limitations dans les Dev Notes

### Task 1 Completion Notes

**1.1 Analyse de lanHub.ts (362 lignes):**
- Classe singleton `LanHub` exportée comme `lanHub`
- Utilise `BroadcastChannel` pour communication same-origin (onglets)
- Utilise `Supabase Realtime` canal 'lan-hub' pour communication cross-device
- Méthodes: `start()`, `stop()`, `broadcast()`, `sendTo()`, `isActive()`, `getStatus()`
- Gestion des devices: register, heartbeat, deregister, clearStaleDevices
- Timings: heartbeatInterval=30s, staleTimeout=120s, staleCheckInterval=60s

**1.2 Évaluation Socket.IO natif:**
**DÉCISION: Socket.IO natif N'EST PAS nécessaire**

Raisons techniques:
1. Les navigateurs NE PEUVENT PAS exécuter de serveurs WebSocket (limitation fondamentale)
2. L'approche BroadcastChannel + Supabase Realtime est la solution standard pour browser-to-browser
3. L'implémentation existante respecte l'ADR-006 de l'architecture
4. Supabase Realtime offre une fiabilité supérieure avec reconnexion automatique

**1.3 Limitations documentées:**
- Nécessite connexion Supabase pour communication cross-device
- En mode offline complet, seul BroadcastChannel fonctionne (même navigateur/onglets)
- Latence légèrement supérieure vs WebSocket direct (~50-100ms via Supabase)
- Acceptable pour le use case KDS (commandes cuisine, pas temps réel critique)

- [x] **Task 2: Valider/Améliorer le Hub existant** (AC: 1, 2)
  - [x] 2.1: S'assurer que `lanHub.start()` fonctionne correctement
  - [x] 2.2: Valider la registration des devices via `device:register`
  - [x] 2.3: Tester la communication bidirectionnelle (broadcast et sendTo)
  - [x] 2.4: Ajouter logging amélioré pour le debugging

- [x] **Task 3: Améliorer la gestion des Heartbeats** (AC: 3)
  - [x] 3.1: Valider que `heartbeatInterval` (30s) fonctionne correctement
  - [x] 3.2: Valider que `staleTimeout` (120s) nettoie les appareils déconnectés
  - [x] 3.3: Ajouter notification aux autres appareils lors d'une déconnexion

- [x] **Task 4: Améliorer le Hub Discovery** (AC: 4)
  - [x] 4.1: S'assurer que `hubAddress` est correctement stocké dans `lanStore`
  - [x] 4.2: Ajouter fonction `getHubConnectionInfo()` pour les clients
  - [x] 4.3: Documenter le flow de discovery pour les autres stories

- [x] **Task 5: Intégration avec le démarrage POS** (AC: 1, 2)
  - [x] 5.1: Créer hook `useLanHub()` pour gérer le lifecycle du hub
  - [x] 5.2: Intégrer le démarrage automatique du hub dans le composant POS principal
  - [x] 5.3: Gérer la fermeture propre du hub quand le POS se ferme

- [x] **Task 6: Tests unitaires et d'intégration** (AC: 1, 2, 3)
  - [x] 6.1: Créer `src/services/lan/lanHub.test.ts`
  - [x] 6.2: Tester le démarrage et arrêt du hub
  - [x] 6.3: Tester l'enregistrement et désenregistrement des devices
  - [x] 6.4: Tester le broadcast et sendTo
  - [x] 6.5: Tester la détection de stale devices

- [x] **Task 7: Traductions** (AC: 2, 3)
  - [x] 7.1: Ajouter clés `lan.hub.*` dans `fr.json`
  - [x] 7.2: Ajouter clés dans `en.json`
  - [x] 7.3: Ajouter clés dans `id.json`

## Dev Notes

### CRITICAL: Architecture Existante à Comprendre

**⚠️ ATTENTION - L'implémentation LAN existe déjà !** [Source: src/services/lan/lanHub.ts]

Le hub LAN a été implémenté dans Story 3.7 avec une approche DIFFÉRENTE de Socket.IO natif :

```typescript
// Implémentation ACTUELLE (à NE PAS remplacer)
- BroadcastChannel API → communication same-origin (onglets)
- Supabase Realtime → communication cross-device
- PAS de serveur Socket.IO sur port 3001
```

**Raison Technique:** Les navigateurs NE PEUVENT PAS exécuter de serveurs WebSocket.
L'approche actuelle est un contournement intelligent utilisant Supabase comme relais.

### ADR-006: Architecture LAN [Source: architecture.md#ADR-006]

```
┌─────────────────────────────────────────────────────────────┐
│                    POS Principal (HUB)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ React App   │  │ BroadcastCh │  │ Supabase    │          │
│  │ (frontend)  │  │ (same-tab)  │  │ Realtime    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
         ▲                ▲                ▲
    ┌────┴────┐     ┌────┴────┐     ┌────┴────┐
    │ Mobile  │     │   KDS   │     │ Display │
    │ Serveur │     │ Kitchen │     │ Client  │
    └─────────┘     └─────────┘     └─────────┘
```

### Services LAN Existants à RÉUTILISER (CRITICAL)

**lanHub.ts** - Hub principal [Source: src/services/lan/lanHub.ts]
```typescript
import { lanHub } from '@/services/lan/lanHub';

// Démarrer le hub
await lanHub.start({
  deviceId: 'pos-main',
  deviceName: 'Caisse Principale',
  heartbeatInterval: 30000, // 30s
  staleTimeout: 120000, // 2min
});

// Broadcast à tous les appareils
await lanHub.broadcast(LAN_MESSAGE_TYPES.KDS_NEW_ORDER, payload);

// Envoyer à un appareil spécifique
await lanHub.sendTo(deviceId, LAN_MESSAGE_TYPES.ORDER_STATUS, payload);

// Vérifier si actif
const isRunning = lanHub.isActive();

// Arrêter le hub
await lanHub.stop();
```

**lanProtocol.ts** - Types et constantes [Source: src/services/lan/lanProtocol.ts]
```typescript
import {
  LAN_MESSAGE_TYPES,
  ILanMessage,
  createMessage,
  registerLanNode,
  sendHeartbeat,
  deregisterLanNode,
  getOnlineNodes,
  getHubNode,
} from '@/services/lan/lanProtocol';

// Types de messages disponibles
LAN_MESSAGE_TYPES.HEARTBEAT
LAN_MESSAGE_TYPES.NODE_REGISTER
LAN_MESSAGE_TYPES.NODE_DEREGISTER
LAN_MESSAGE_TYPES.HUB_ANNOUNCE
LAN_MESSAGE_TYPES.KDS_NEW_ORDER
LAN_MESSAGE_TYPES.KDS_ORDER_ACK
// ... voir lanProtocol.ts pour la liste complète
```

**lanStore** - État Zustand [Source: src/stores/lanStore.ts]
```typescript
import { useLanStore } from '@/stores/lanStore';

const {
  connectionStatus,  // 'disconnected' | 'connecting' | 'connected' | 'error'
  isHub,             // true si ce device est le hub
  hubAddress,        // IP du hub
  deviceId,          // ID de ce device
  deviceType,        // 'pos' | 'kds' | 'display' | 'mobile'
  connectedDevices,  // Liste des devices connectés
  setConnectionStatus,
  setIsHub,
  addConnectedDevice,
  updateDeviceHeartbeat,
  clearStaleDevices,
} = useLanStore();
```

### Hook useLanHub à Créer

```typescript
// src/hooks/lan/useLanHub.ts

import { useEffect, useState, useCallback } from 'react';
import { lanHub } from '@/services/lan/lanHub';
import { useLanStore } from '@/stores/lanStore';

interface UseLanHubOptions {
  deviceName?: string;
  autoStart?: boolean;
  heartbeatInterval?: number;
  staleTimeout?: number;
}

interface UseLanHubResult {
  isRunning: boolean;
  status: {
    uptime: number;
    connectedDevices: number;
    deviceId: string | null;
  };
  start: () => Promise<boolean>;
  stop: () => Promise<void>;
  error: string | null;
}

export function useLanHub(options: UseLanHubOptions = {}): UseLanHubResult {
  const {
    deviceName = 'Caisse Principale',
    autoStart = false,
    heartbeatInterval = 30000,
    staleTimeout = 120000,
  } = options;

  const [isRunning, setIsRunning] = useState(lanHub.isActive());
  const [error, setError] = useState<string | null>(null);
  const { setConnectionStatus, lastError } = useLanStore();

  const start = useCallback(async () => {
    try {
      const deviceId = `pos-${crypto.randomUUID().slice(0, 8)}`;
      const success = await lanHub.start({
        deviceId,
        deviceName,
        heartbeatInterval,
        staleTimeout,
      });
      setIsRunning(success);
      if (!success) {
        setError('Failed to start LAN hub');
      }
      return success;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      return false;
    }
  }, [deviceName, heartbeatInterval, staleTimeout]);

  const stop = useCallback(async () => {
    await lanHub.stop();
    setIsRunning(false);
  }, []);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && !isRunning) {
      start();
    }
  }, [autoStart]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRunning) {
        lanHub.stop();
      }
    };
  }, [isRunning]);

  return {
    isRunning,
    status: lanHub.getStatus(),
    start,
    stop,
    error: error || lastError,
  };
}
```

### Intégration dans POS Principal

L'intégration doit se faire dans le composant POS principal :

```typescript
// src/pages/pos/POSPage.tsx ou composant équivalent

import { useLanHub } from '@/hooks/lan/useLanHub';

export function POSPage() {
  const { isRunning, status, start, error } = useLanHub({
    deviceName: 'Caisse Principale',
    autoStart: true, // Démarre automatiquement le hub
  });

  useEffect(() => {
    if (error) {
      console.error('[POS] LAN Hub error:', error);
      // Toast notification optionnel
    }
  }, [error]);

  // ... reste du composant
}
```

### Fichiers à Créer

```
src/
├── hooks/
│   └── lan/
│       ├── useLanHub.ts           # NEW: Hook pour gérer le hub
│       └── index.ts               # NEW: Export du hook
├── services/
│   └── lan/
│       └── __tests__/
│           └── lanHub.test.ts     # NEW: Tests du hub
```

### Fichiers à Modifier

- `src/pages/pos/POSPage.tsx` (ou équivalent) - Intégrer useLanHub
- `src/locales/fr.json` - Ajouter traductions hub
- `src/locales/en.json` - Ajouter traductions
- `src/locales/id.json` - Ajouter traductions

### Traductions à Ajouter

```json
// fr.json
{
  "lan": {
    "hub": {
      "starting": "Démarrage du hub LAN...",
      "started": "Hub LAN actif",
      "stopped": "Hub LAN arrêté",
      "error": "Erreur du hub LAN",
      "deviceConnected": "Appareil connecté: {{name}}",
      "deviceDisconnected": "Appareil déconnecté: {{name}}",
      "connectedDevices": "{{count}} appareil(s) connecté(s)"
    }
  }
}
```

```json
// en.json
{
  "lan": {
    "hub": {
      "starting": "Starting LAN hub...",
      "started": "LAN hub active",
      "stopped": "LAN hub stopped",
      "error": "LAN hub error",
      "deviceConnected": "Device connected: {{name}}",
      "deviceDisconnected": "Device disconnected: {{name}}",
      "connectedDevices": "{{count}} device(s) connected"
    }
  }
}
```

```json
// id.json
{
  "lan": {
    "hub": {
      "starting": "Memulai hub LAN...",
      "started": "Hub LAN aktif",
      "stopped": "Hub LAN berhenti",
      "error": "Kesalahan hub LAN",
      "deviceConnected": "Perangkat terhubung: {{name}}",
      "deviceDisconnected": "Perangkat terputus: {{name}}",
      "connectedDevices": "{{count}} perangkat terhubung"
    }
  }
}
```

### Business Rules (CRITICAL)

**Heartbeat Timing** [Source: architecture.md#ADR-006]
- Intervalle heartbeat: 30 secondes
- Timeout stale: 120 secondes (2 minutes)
- Cleanup automatique des devices stale toutes les 60 secondes

**Device Types Supportés** [Source: src/services/lan/lanProtocol.ts]
- `pos`: Point de vente (hub uniquement)
- `kds`: Kitchen Display System
- `display`: Affichage client
- `mobile`: App mobile serveur

**Message Flow**
```
POS Hub ──broadcast──► All Devices
POS Hub ──sendTo(id)─► Specific Device
Device ──register───► POS Hub (via Supabase Realtime)
Device ──heartbeat──► POS Hub (via Supabase Realtime)
```

### Previous Story Intelligence [Source: 3-7-kitchen-dispatch-via-lan-offline.md]

**Patterns établis dans Story 3.7:**
- `lanHub.broadcast()` pour envoi à tous les KDS
- `lanHub.isActive()` pour vérifier si hub actif
- Integration avec `kitchenDispatchService` pour dispatch orders
- Utilisation de `useLanStore.connectionStatus` pour état LAN

**Code Pattern pour broadcast:**
```typescript
if (lanHub.isActive()) {
  await lanHub.broadcast(LAN_MESSAGE_TYPES.KDS_NEW_ORDER, payload);
}
```

### Testing Strategy

**Test Cases pour lanHub:**
1. `start()` - démarre correctement et enregistre le hub
2. `start()` - retourne true si déjà en cours d'exécution
3. `stop()` - arrête proprement et désenregistre
4. `broadcast()` - envoie via BroadcastChannel et Realtime
5. `sendTo()` - envoie à un device spécifique
6. `handleDeviceRegister()` - ajoute device au store
7. `handleDeviceHeartbeat()` - met à jour lastHeartbeat
8. `handleDeviceDeregister()` - supprime device du store
9. `clearStaleDevices()` - supprime devices avec heartbeat > timeout
10. `getStatus()` - retourne uptime et device count corrects

### Anti-Patterns to AVOID

| ❌ Éviter | ✅ Faire |
|-----------|----------|
| Créer un serveur Socket.IO natif | Utiliser l'approche BroadcastChannel + Supabase |
| Remplacer lanHub.ts | Améliorer l'implémentation existante |
| Ignorer le cleanup des stale devices | Toujours utiliser clearStaleDevices() |
| Hardcoder les timeouts | Utiliser les options configurables |
| Oublier de stop() le hub | Cleanup dans useEffect return |

### Dependencies on Previous Work

- ✅ `src/services/lan/lanHub.ts` - Hub service existant (Story 3.7)
- ✅ `src/services/lan/lanProtocol.ts` - Protocol et types (Story 1.5)
- ✅ `src/services/lan/lanClient.ts` - Client service (Story 3.7)
- ✅ `src/stores/lanStore.ts` - État Zustand LAN (existant)
- ✅ Table `lan_nodes` - Registry dans Supabase (Story 1.5)
- ✅ Functions `register_lan_node`, `update_lan_node_heartbeat` (Story 1.5)

### Epic 4 Context

Cette story est la **1ère** de l'Epic 4 (Cuisine & Dispatch - Kitchen Display System).

**Stories qui dépendent de celle-ci:**
- Story 4.2: KDS Socket.IO Client Connection → utilise le hub
- Story 4.3: Order Dispatch to KDS via LAN → utilise broadcast
- Story 4.4: KDS Order Queue Display → reçoit via hub
- Story 4.5: KDS Item Status Update → envoie ACK au hub
- Story 4.6: Order Completion & Auto-Remove → notifie via hub

### Critical Implementation Notes

1. **NE PAS créer de serveur Socket.IO natif** - Les navigateurs ne peuvent pas exécuter de serveurs WebSocket
2. **L'implémentation existe déjà** - lanHub.ts fonctionne via BroadcastChannel + Supabase Realtime
3. **Créer uniquement le hook useLanHub** - Pour simplifier l'intégration dans le POS
4. **Valider le comportement existant** - Écrire des tests pour confirmer que tout fonctionne
5. **Ajouter les traductions** - Section `lan.hub.*` dans les 3 locales

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-4.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#ADR-006]
- [Source: _bmad-output/planning-artifacts/architecture.md#ADR-007]
- [Source: _bmad-output/implementation-artifacts/3-7-kitchen-dispatch-via-lan-offline.md]
- [Source: src/services/lan/lanHub.ts]
- [Source: src/services/lan/lanProtocol.ts]
- [Source: src/stores/lanStore.ts]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- lanHub.test.ts: 25 tests passing (start, stop, broadcast, sendTo, isActive, getStatus, heartbeat, stale cleanup, device registration/deregistration/heartbeat)

### Completion Notes List

1. **Task 1 (Analyse)**: L'implémentation existante de lanHub.ts utilise BroadcastChannel + Supabase Realtime. Socket.IO natif n'est PAS possible car les navigateurs ne peuvent pas exécuter de serveurs WebSocket.

2. **Task 2-4 (Validation)**: Le hub existant fonctionne correctement. Les méthodes start(), stop(), broadcast(), sendTo() sont validées par les tests.

3. **Task 5 (Hook useLanHub)**: Créé le hook `useLanHub()` avec:
   - Auto-start optionnel
   - Cleanup automatique on unmount
   - Polling du status toutes les 5s
   - Gestion des erreurs

4. **Task 6 (Tests)**: 25 tests unitaires créés couvrant tous les cas d'usage.

5. **Task 7 (Traductions)**: Ajouté les clés `lan.hub.*` et `lan.client.*` dans les 3 locales.

### File List

**Créés:**
- `src/hooks/lan/useLanHub.ts` - Hook React pour gérer le lifecycle du hub
- `src/hooks/lan/index.ts` - Export du hook
- `src/services/lan/lanHub.test.ts` - 25 tests unitaires

**Modifiés:**
- `src/pages/pos/POSMainPage.tsx` - Intégration useLanHub avec autoStart
- `src/services/lan/lanProtocol.ts` - Ajout getHubConnectionInfo()
- `src/services/lan/lanHub.ts` - Ajout notification broadcast lors de deregistration
- `src/locales/fr.json` - Ajout section `lan.hub.*` et `lan.client.*`
- `src/locales/en.json` - Ajout section `lan.hub.*` et `lan.client.*`
- `src/locales/id.json` - Ajout section `lan.hub.*` et `lan.client.*`

### Code Review Fixes Applied

**H1**: Task 5.2 - useLanHub intégré dans POSMainPage.tsx avec autoStart=true
**H2**: Task 4.2 - getHubConnectionInfo() ajouté à lanProtocol.ts
**H3**: Task 3.3 - handleDeviceDeregister() broadcast maintenant NODE_DEREGISTER aux autres devices
**M1**: useLanHub.ts - Intervals combinés (1 seul à 5s au lieu de 2 à 1s et 5s)
**M2**: lanHub.test.ts - Tests améliorés pour vérifier mockChannel.send
