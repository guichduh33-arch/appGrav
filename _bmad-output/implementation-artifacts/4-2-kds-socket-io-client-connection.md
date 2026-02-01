# Story 4.2: KDS Socket.IO Client Connection

Status: ready-for-dev

## Story

As a **KDS**,
I want **me connecter au POS via Socket.IO LAN**,
so that **je reçois les commandes même sans internet**.

## Acceptance Criteria

### AC1: Connexion au Démarrage KDS
**Given** le KDS démarre
**When** il détecte le réseau local
**Then** il se connecte au POS via BroadcastChannel + Supabase Realtime
**And** l'IP du hub est configurée ou découverte automatiquement

### AC2: Enregistrement avec Station
**Given** la connexion est établie
**When** le KDS s'identifie
**Then** il envoie `device:register` avec type="kds" et station="kitchen|barista"
**And** le hub l'ajoute à la liste des devices connectés

### AC3: Reconnexion Automatique
**Given** la connexion au hub est perdue
**When** le réseau redevient disponible
**Then** le client se reconnecte automatiquement avec exponential backoff
**And** max 10 tentatives avant erreur

### AC4: Indicateur de Connexion Visuel
**Given** le KDS est sur la page principale
**When** l'état de connexion change
**Then** un indicateur visuel montre le statut (connecté/déconnecté/erreur)

## Tasks / Subtasks

- [ ] **Task 1: Créer le hook useLanClient pour KDS** (AC: 1, 2, 3)
  - [ ] 1.1: Créer `src/hooks/lan/useLanClient.ts`
  - [ ] 1.2: Implémenter `connect(deviceType, deviceName, station?)` avec options
  - [ ] 1.3: Implémenter `disconnect()` pour cleanup propre
  - [ ] 1.4: Exposer `isConnected`, `connectionStatus`, `error`
  - [ ] 1.5: Gérer auto-reconnexion via lanClient existant

- [ ] **Task 2: Intégrer useLanClient dans KDSMainPage** (AC: 1, 2, 4)
  - [ ] 2.1: Importer et utiliser useLanClient dans KDSMainPage.tsx
  - [ ] 2.2: Configurer la connexion au démarrage avec station courante
  - [ ] 2.3: Ajouter indicateur de connexion LAN dans le header
  - [ ] 2.4: Gérer cleanup à la fermeture de la page

- [ ] **Task 3: Améliorer KDSStationSelector avec pré-connexion** (AC: 1, 2)
  - [ ] 3.1: Optionnel: Initier la connexion dès le sélecteur de station
  - [ ] 3.2: Passer la station sélectionnée au KDSMainPage

- [ ] **Task 4: Créer le composant LanConnectionIndicator** (AC: 4)
  - [ ] 4.1: Créer `src/components/lan/LanConnectionIndicator.tsx`
  - [ ] 4.2: Afficher icône (wifi/wifi-off) avec couleur selon statut
  - [ ] 4.3: Afficher tooltip avec détails (tentatives reconnexion, etc.)

- [ ] **Task 5: Tests unitaires** (AC: 1, 2, 3)
  - [ ] 5.1: Créer `src/hooks/lan/__tests__/useLanClient.test.ts`
  - [ ] 5.2: Tester connexion avec différents device types
  - [ ] 5.3: Tester reconnexion automatique
  - [ ] 5.4: Tester cleanup on unmount

- [ ] **Task 6: Traductions** (AC: 4)
  - [ ] 6.1: Ajouter clés `lan.client.*` dans `fr.json`
  - [ ] 6.2: Ajouter clés dans `en.json`
  - [ ] 6.3: Ajouter clés dans `id.json`

## Dev Notes

### CRITICAL: Code Existant à Comprendre

**⚠️ L'implémentation lanClient existe déjà !** [Source: src/services/lan/lanClient.ts]

Le service lanClient est **COMPLET** (422 lignes). Il gère :
- Connexion via BroadcastChannel + Supabase Realtime
- Enregistrement du device dans `lan_nodes`
- Heartbeat automatique (30s)
- Reconnexion avec exponential backoff (max 10 tentatives)
- Queue de messages pending si déconnecté

**PROBLÈME ACTUEL:** KDSMainPage utilise `lanClient.on()` mais **NE SE CONNECTE JAMAIS !**

```typescript
// KDSMainPage.tsx - Ligne 259-271 (EXISTANT)
useEffect(() => {
    const unsubscribe = lanClient.on(LAN_MESSAGE_TYPES.KDS_NEW_ORDER, () => {
        if (soundEnabled) playNotificationSound()
        fetchOrders()
    })
    return () => unsubscribe()
}, [fetchOrders, soundEnabled])

// MANQUANT: Appel à lanClient.connect() !
```

### lanClient API Existante [Source: src/services/lan/lanClient.ts]

```typescript
import { lanClient } from '@/services/lan/lanClient';

// Connecter au hub
const success = await lanClient.connect({
  deviceId: 'kds-kitchen-001',
  deviceType: 'kds',
  deviceName: 'Kitchen Display',
  heartbeatInterval: 30000,      // Optionnel, défaut 30s
  maxReconnectAttempts: 10,     // Optionnel, défaut 10
  reconnectBackoffMs: 1000,     // Optionnel, défaut 1s
});

// Déconnecter
await lanClient.disconnect();

// Envoyer un message
await lanClient.send(LAN_MESSAGE_TYPES.KDS_ORDER_ACK, { order_id: '...' });

// Écouter les messages
const unsubscribe = lanClient.on(LAN_MESSAGE_TYPES.KDS_NEW_ORDER, (message) => {
  console.log('New order:', message.payload);
});

// Vérifier si connecté
const connected = lanClient.isActive();

// Obtenir le statut
const status = lanClient.getStatus();
// { isConnected, uptime, deviceId, reconnectAttempts }
```

### Hook useLanClient à Créer

```typescript
// src/hooks/lan/useLanClient.ts

import { useEffect, useState, useCallback, useRef } from 'react';
import { lanClient } from '@/services/lan/lanClient';
import { useLanStore, TLanConnectionStatus } from '@/stores/lanStore';
import type { TDeviceType } from '@/services/lan/lanProtocol';

interface UseLanClientOptions {
  deviceType: TDeviceType;
  deviceName?: string;
  station?: string; // Pour KDS: 'kitchen' | 'barista'
  autoConnect?: boolean;
}

interface UseLanClientResult {
  isConnected: boolean;
  connectionStatus: TLanConnectionStatus;
  reconnectAttempts: number;
  error: string | null;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
}

export function useLanClient(options: UseLanClientOptions): UseLanClientResult {
  const {
    deviceType,
    deviceName,
    station,
    autoConnect = true,
  } = options;

  const [isConnected, setIsConnected] = useState(lanClient.isActive());
  const connectAttemptedRef = useRef(false);

  const {
    connectionStatus,
    reconnectAttempts,
    lastError,
  } = useLanStore();

  const connect = useCallback(async () => {
    if (lanClient.isActive()) {
      setIsConnected(true);
      return true;
    }

    // Generate unique device ID
    const storedId = localStorage.getItem('lan-device-id');
    const deviceId = storedId || `${deviceType}-${crypto.randomUUID().slice(0, 8)}`;
    if (!storedId) {
      localStorage.setItem('lan-device-id', deviceId);
    }

    // Build device name with station if KDS
    const fullName = station
      ? `${deviceName || 'KDS'} - ${station.charAt(0).toUpperCase() + station.slice(1)}`
      : deviceName || `${deviceType.toUpperCase()} Device`;

    const success = await lanClient.connect({
      deviceId,
      deviceType,
      deviceName: fullName,
    });

    setIsConnected(success);
    return success;
  }, [deviceType, deviceName, station]);

  const disconnect = useCallback(async () => {
    await lanClient.disconnect();
    setIsConnected(false);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && !connectAttemptedRef.current) {
      connectAttemptedRef.current = true;
      connect();
    }
  }, [autoConnect, connect]);

  // Sync with lanClient state
  useEffect(() => {
    const checkStatus = () => {
      setIsConnected(lanClient.isActive());
    };

    // Check periodically in case store doesn't update
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't disconnect on unmount - keep connection alive
      // Only disconnect explicitly when user leaves KDS
    };
  }, []);

  return {
    isConnected,
    connectionStatus,
    reconnectAttempts,
    error: lastError,
    connect,
    disconnect,
  };
}
```

### Intégration dans KDSMainPage

```typescript
// Ajouter dans KDSMainPage.tsx

import { useLanClient } from '@/hooks/lan/useLanClient';
import { LanConnectionIndicator } from '@/components/lan/LanConnectionIndicator';

export default function KDSMainPage() {
    const { station } = useParams<{ station: string }>();

    // NOUVEAU: Connexion LAN automatique
    const {
      isConnected: isLanConnected,
      connectionStatus,
      error: lanError,
    } = useLanClient({
      deviceType: 'kds',
      deviceName: 'Kitchen Display',
      station: stationConfig?.dbStation, // 'kitchen' | 'barista'
      autoConnect: true,
    });

    // Dans le header, ajouter l'indicateur:
    // <LanConnectionIndicator status={connectionStatus} />

    // ... reste du composant
}
```

### Composant LanConnectionIndicator

```typescript
// src/components/lan/LanConnectionIndicator.tsx

import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TLanConnectionStatus } from '@/stores/lanStore';

interface LanConnectionIndicatorProps {
  status: TLanConnectionStatus;
  className?: string;
  showLabel?: boolean;
}

export function LanConnectionIndicator({
  status,
  className = '',
  showLabel = false,
}: LanConnectionIndicatorProps) {
  const { t } = useTranslation();

  const getIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="text-green-500" size={20} />;
      case 'connecting':
        return <Loader2 className="text-yellow-500 animate-spin" size={20} />;
      case 'error':
        return <WifiOff className="text-red-500" size={20} />;
      default:
        return <WifiOff className="text-gray-400" size={20} />;
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'connected':
        return t('lan.client.connected');
      case 'connecting':
        return t('lan.client.connecting');
      case 'error':
        return t('lan.client.error');
      default:
        return t('lan.client.disconnected');
    }
  };

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      title={getLabel()}
    >
      {getIcon()}
      {showLabel && <span className="text-sm">{getLabel()}</span>}
    </div>
  );
}
```

### Fichiers à Créer

```
src/
├── hooks/
│   └── lan/
│       ├── useLanClient.ts              # NEW: Hook connexion client
│       ├── index.ts                     # NEW: Export
│       └── __tests__/
│           └── useLanClient.test.ts     # NEW: Tests
├── components/
│   └── lan/
│       ├── LanConnectionIndicator.tsx   # NEW: Indicateur visuel
│       └── index.ts                     # NEW: Export
```

### Fichiers à Modifier

- `src/pages/kds/KDSMainPage.tsx` - Intégrer useLanClient et indicateur
- `src/locales/fr.json` - Ajouter traductions client
- `src/locales/en.json` - Ajouter traductions
- `src/locales/id.json` - Ajouter traductions

### Traductions à Ajouter

```json
// fr.json
{
  "lan": {
    "client": {
      "connecting": "Connexion LAN...",
      "connected": "LAN connecté",
      "disconnected": "LAN déconnecté",
      "error": "Erreur de connexion",
      "reconnecting": "Reconnexion...",
      "reconnectAttempt": "Tentative {{count}}/{{max}}"
    }
  }
}
```

```json
// en.json
{
  "lan": {
    "client": {
      "connecting": "Connecting to LAN...",
      "connected": "LAN connected",
      "disconnected": "LAN disconnected",
      "error": "Connection error",
      "reconnecting": "Reconnecting...",
      "reconnectAttempt": "Attempt {{count}}/{{max}}"
    }
  }
}
```

```json
// id.json
{
  "lan": {
    "client": {
      "connecting": "Menghubungkan ke LAN...",
      "connected": "LAN terhubung",
      "disconnected": "LAN terputus",
      "error": "Kesalahan koneksi",
      "reconnecting": "Menghubungkan kembali...",
      "reconnectAttempt": "Percobaan {{count}}/{{max}}"
    }
  }
}
```

### Business Rules (CRITICAL)

**Device ID Persistence** [Source: architecture.md#ADR-008]
- L'ID du device doit être persisté dans localStorage
- Format: `{deviceType}-{uuid-8chars}` ex: `kds-a1b2c3d4`
- Permet de maintenir l'identité entre sessions

**Station Types pour KDS** [Source: database schema]
- `kitchen`: Hot kitchen (plats chauds)
- `barista`: Boissons et café
- `display`: Vitrine self-service
- `waiter`: Vue globale (toutes stations)

**Reconnexion** [Source: src/services/lan/lanClient.ts]
- Max 10 tentatives
- Exponential backoff: 1s → 2s → 4s → 8s → 16s → 32s → 60s max
- Après 10 échecs: status = 'error'

### Previous Story Intelligence [Source: 4-1-socket-io-server-on-pos-lan-hub.md]

**Le hub utilise:**
- BroadcastChannel 'appgrav-lan' pour same-origin
- Supabase Realtime channel 'lan-hub' pour cross-device
- Port 3001 virtuel (pas un vrai serveur WebSocket)

**Le client doit:**
- Se connecter aux MÊMES channels que le hub
- Envoyer `NODE_REGISTER` après connexion
- Maintenir heartbeat toutes les 30 secondes

### Dependency on Previous Work

- ✅ `src/services/lan/lanClient.ts` - Client complet (422 lignes)
- ✅ `src/services/lan/lanProtocol.ts` - Types et constantes
- ✅ `src/stores/lanStore.ts` - État Zustand
- ✅ `src/pages/kds/KDSMainPage.tsx` - Déjà écoute les messages
- ✅ Story 4.1 - Hub doit être implémenté d'abord (ready-for-dev)

### Testing Strategy

**Test Cases pour useLanClient:**
1. `connect()` - connecte avec le bon deviceType
2. `connect()` - génère un deviceId unique si pas en localStorage
3. `connect()` - réutilise deviceId depuis localStorage
4. `disconnect()` - déconnecte proprement
5. `autoConnect: true` - connecte automatiquement au mount
6. `autoConnect: false` - ne connecte pas au mount
7. Station incluse dans deviceName pour KDS
8. Reconnexion après perte de connexion (mock)

### Anti-Patterns to AVOID

| ❌ Éviter | ✅ Faire |
|-----------|----------|
| Créer un nouveau client | Utiliser lanClient singleton existant |
| Déconnecter au unmount du composant | Garder la connexion active |
| Hardcoder les timeouts | Utiliser les defaults de lanClient |
| Ignorer les erreurs de connexion | Afficher l'indicateur d'erreur |
| Générer un nouveau deviceId à chaque mount | Persister dans localStorage |

### Epic 4 Context

Cette story est la **2ème** de l'Epic 4 (Cuisine & Dispatch - Kitchen Display System).

**Dépend de:**
- Story 4.1: Socket.IO Server on POS (LAN Hub) - ready-for-dev

**Stories qui dépendent de celle-ci:**
- Story 4.3: Order Dispatch to KDS via LAN → reçoit via ce client
- Story 4.4: KDS Order Queue Display → utilise la connexion
- Story 4.5: KDS Item Status Update → envoie via ce client
- Story 4.6: Order Completion & Auto-Remove → notifie via ce client

### Critical Implementation Notes

1. **lanClient existe déjà** - Ne pas créer de nouveau service, créer seulement le hook
2. **KDSMainPage utilise déjà lanClient.on()** - Ajouter lanClient.connect() au démarrage
3. **deviceId persisté** - Utiliser localStorage pour garder le même ID
4. **Station dans le nom** - Pour que le hub sache quelle station est le KDS
5. **Ne pas déconnecter au unmount** - La connexion doit rester active entre les pages

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-4.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#ADR-006]
- [Source: _bmad-output/planning-artifacts/architecture.md#ADR-008]
- [Source: _bmad-output/implementation-artifacts/4-1-socket-io-server-on-pos-lan-hub.md]
- [Source: src/services/lan/lanClient.ts]
- [Source: src/pages/kds/KDSMainPage.tsx]
- [Source: src/stores/lanStore.ts]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
