# Implementation Patterns & Consistency Rules

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
