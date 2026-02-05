---
project_name: 'AppGrav'
user_name: 'MamatCEO'
date: '2026-02-05'
sections_completed: ['technology_stack', 'framework_rules', 'performance_rules', 'code_organization', 'business_rules', 'critical_rules']
status: 'complete'
---

# Project Context for AI Agents

_Ce fichier contient les règles critiques et patterns que les agents IA doivent suivre lors de l'implémentation du code dans ce projet. Focus sur les détails non-évidents que les agents pourraient manquer._

---

## Technology Stack & Versions

**Framework Web:**
- React 18.2.0 + TypeScript 5.2.2 + Vite 5.0.8
- Path alias: `@/` → `src/` (SEUL alias valide)

**State Management:**
- Zustand 4.4.7 → État CLIENT UNIQUEMENT (cart, auth, network, ui)
- @tanstack/react-query 5.17.0 → Données SERVEUR uniquement
- ⚠️ NE JAMAIS mélanger: Zustand pour server state = anti-pattern

**Styling:**
- Tailwind CSS 3.4.19 + tailwindcss-animate
- shadcn/ui components (Radix primitives)
- Lucide React icons 0.303.0

**Backend:**
- Supabase 2.93.3 (PostgreSQL + Auth + Realtime + Edge Functions)
- 113 migrations, 67 tables, 21 enums, 20+ DB functions
- ⚠️ TOUTE nouvelle table DOIT avoir RLS activé + policies

**Offline-First:**
- Dexie 4.2.1 - `useLiveQuery` requiert composant monté
- vite-plugin-pwa 1.2.0 + Workbox
- Types: `src/types/offline.ts` (ISyncQueueItem, IOfflineUser, etc.)

**i18n:** ⚠️ SUSPENDU
- i18next 25.7.4 installé mais **non utilisé**
- English hardcodé - NE PAS utiliser `t()` ou `useTranslation()`

**Mobile:**
- Capacitor 8.0.1 (iOS/Android)
- ⚠️ TOUS les plugins Capacitor doivent être 8.x (incompatibilité 7.x)

**Testing:**
- Vitest 4.0.17 + @testing-library/react 16.3.1
- `fake-indexeddb` OBLIGATOIRE pour tests Dexie

**Version Compatibility Notes:**
- Capacitor core + plugins: MUST match major version (8.x)
- Dexie 4.x: Required for useLiveQuery hooks
- React 18: Required for concurrent features
- TypeScript: strict mode enabled

---

## Framework-Specific Rules

### React & TypeScript Patterns

**Lifecycle & Hooks:**
- Toujours utiliser optional chaining pour async data: `data?.map(...)`
- `useLiveQuery` (Dexie) ne fonctionne QUE si composant monté
- Ne jamais appeler hooks conditionnellement

**Hooks existants à réutiliser (NE PAS recréer):**
| Hook | Usage |
|------|-------|
| `useNetworkStatus` | Détection online/offline |
| `useOfflineAuth` | Auth PIN offline |
| `usePermissions` | Vérification permissions |
| `useSyncQueue` | État queue sync |
| `useOfflineData` | Données avec fallback offline |

**Anti-patterns React:**
- ❌ `useState` pour server data → ✅ `useQuery`
- ❌ `useEffect` pour fetch → ✅ `useQuery` avec `enabled`
- ❌ Import Supabase dans composants → ✅ Via hooks/services

### Architecture des Services

**Séparation des responsabilités:**
```
services/  → Logique métier pure (pas de React)
hooks/     → Bridge services ↔ composants
stores/    → État UI transient uniquement
```

**Pattern d'erreur offline:**
```typescript
import { OfflineError } from '@/types/offline';
throw new OfflineError('message', 'SYNC_FAILED', true); // recoverable
```

### Zustand Store Rules

**Stores existants (NE PAS dupliquer):**
- `cartStore` - Panier + lockedItems (PIN requis si envoyé cuisine)
- `authStore` - Session + offline auth state
- `networkStore` - État online/offline
- `syncStore` - Queue sync status

**Règle critique:** NE JAMAIS stocker server state dans Zustand

### Supabase & RLS (OBLIGATOIRE)

```sql
-- TOUTE nouvelle table DOIT avoir:
ALTER TABLE public.{table} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read" ON public.{table}
    FOR SELECT USING (auth.uid() IS NOT NULL);
```

### Dexie/IndexedDB Patterns

**Naming:** `offline_{entity}` prefix obligatoire

**Boolean gotcha:** IndexedDB stocke 0/1, pas true/false
```typescript
.where('is_active').equals(1)  // PAS .equals(true)
```

### Socket.IO Events (LAN)

**Format:** `{entity}:{action}`
```typescript
'order:created', 'order:updated', 'cart:sync', 'display:update'
```

### Print Server Integration (Optionnel)

**Serveur local:** Node.js/Express sur port 3001 (PC caisse)

**Endpoints:**
| Route | Usage |
|-------|-------|
| `GET /health` | Status serveur |
| `POST /print/receipt` | Ticket caisse (ESC/POS 80mm) |
| `POST /print/kitchen` | Ticket cuisine |
| `POST /print/barista` | Ticket barista |
| `POST /drawer/open` | Ouverture tiroir-caisse |

**Configuration:** Table `printer_configurations` + UI `/settings/printing`

**Note:** Système fonctionne sans print server (impression désactivée)

### Testing Patterns

**Setup obligatoire:**
```typescript
import 'fake-indexeddb/auto'; // Dans setupTests.ts

beforeEach(async () => {
  await offlineDb.delete();
  await offlineDb.open();
});
```

**Tests modèles à suivre:**
- `src/services/sync/syncQueue.test.ts`
- `src/services/offline/__tests__/offlineAuthService.test.ts`

---

## Performance Rules

### Response Time Requirements

| Interaction | Cible | Contexte |
|-------------|-------|----------|
| UI Response | <200ms | Toutes interactions |
| Auth Switch | <2s | Changement PIN |
| LAN Latency | <500ms | Inter-devices |
| Sync Start | 5s delay | Après reconnexion |

### Offline-First Performance

**Sync Queue:**
- Polling: 30s quand online avec pending items
- Backoff: 5s → 10s → 30s → 1min → 5min (max 4 retries)
- Max: 500 items, cleanup auto si > 80%

**Cache TTL:**
| Entité | TTL | Refresh |
|--------|-----|---------|
| Products/Categories | 24h | Hourly if online |
| Orders | 7 jours | - |
| User credentials | 24h | Expiration → re-login |

### Database Performance

**Supabase - Éviter N+1:**
```typescript
// ✅ Join dans la query
const { data } = await supabase
  .from('orders')
  .select('*, order_items(*)');
```

**Dexie - Bulk Operations:**
```typescript
// ✅ Toujours bulk pour >10 items
await offlineDb.offline_products.bulkPut(items);
```

### React Performance

**React Query Stale Time:**
```typescript
// Données stables = staleTime élevé
useQuery({
  queryKey: ['products'],
  staleTime: 1000 * 60 * 5, // 5 min
});
```

**Optimistic Updates OBLIGATOIRES:**
- UI update immédiat → rollback si échec
- Le cashier doit sentir réponse IMMÉDIATE

**Lazy Loading:**
- Routes via `React.lazy()`
- Images: `loading="lazy"`

### Memory & Build

**IndexedDB:**
- Alerte si > 80% quota
- Purge orders > 30 jours

**Production:**
- `console.*` supprimés (sauf warn/error)
- Source maps OFF

### Rate Limiting

**PIN Auth:** 3 tentatives / 15 minutes
- `src/services/offline/rateLimitService.ts`

---

## Code Organization Rules

### First Principles (Pourquoi ces règles?)

| Règle | Principe Fondamental |
|-------|---------------------|
| Conventions `I`/`T` | **Intention**: `I` = extensible, `T` = final |
| Max 300 lignes | **Cognition**: Limite de compréhension en une lecture |
| Prefix `offline_` | **Confiance**: Marque données potentiellement stales |
| Vérifier avant créer | **Intégrité**: Source unique de vérité |
| Co-location tests | **Proximité**: Réduire friction = plus de tests |

### Naming Conventions

| Élément | Convention | Exemple |
|---------|------------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase + `use` | `useNetworkStatus.ts` |
| Services | camelCase | `syncQueue.ts` |
| Stores | camelCase + `Store` | `cartStore.ts` |
| Types | `I{Name}` / `T{Name}` | `IProduct`, `TOrderStatus` |
| DB columns | snake_case | `created_at` |
| Dexie tables | `offline_{entity}` | `offline_products` |
| Migrations | `YYYYMMDDHHMMSS_desc.sql` | `20260204120000_add_index.sql` |
| Constants | UPPER_SNAKE_CASE | `MAX_QUEUE_SIZE` |

### File Size & Structure

- **Max 300 lignes par fichier**
- **Tests co-localisés:** `__tests__/` adjacent au code
- **Configs:** À la racine uniquement

```
src/
├── constants/        # Constantes globales
├── lib/              # Utils génériques (utils.ts, supabase.ts, db.ts)
├── types/
│   ├── database.ts   # Types Supabase (tables, enums)
│   └── offline.ts    # Types Dexie (IOffline*, TSyncStatus)
└── components/feature/
    ├── FeaturePage.tsx
    ├── utils.ts      # Utils spécifiques
    ├── index.ts      # Barrel exports
    └── __tests__/
```

### Feature Discovery (AVANT de créer)

**Checklist obligatoire:**
1. ☐ `hooks/` - Hook similaire existe?
2. ☐ `components/ui/` - Composant UI réutilisable?
3. ☐ `services/` - Service métier existant?
4. ☐ `lib/utils.ts` - Utilitaire générique?
5. ☐ `constants/` - Constante déjà définie?

**Pattern co-location par feature:**
| Feature | Pages | Components | Hooks | Services |
|---------|-------|------------|-------|----------|
| inventory | `pages/inventory/` | `components/inventory/` | `hooks/inventory/` | `services/inventory/` |
| pos | `pages/pos/` | `components/pos/` | `hooks/pos/` | - |
| offline | - | `components/sync/` | `hooks/offline/` | `services/sync/` |

### Barrel Exports (index.ts)

```typescript
// components/pos/index.ts
export { Cart } from './Cart';
export { ProductGrid } from './ProductGrid';

// Usage:
import { Cart, ProductGrid } from '@/components/pos';
```

### Import Order

```typescript
// 1. React/external
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal (@/)
import { Button } from '@/components/ui/button';
import { OFFLINE_CONSTANTS } from '@/constants/offline';

// 3. Relative
import { ProductCard } from './ProductCard';

// 4. Types (type-only)
import type { IProduct } from '@/types/database';
```

### Types File Distinction

| Fichier | Contenu |
|---------|---------|
| `types/database.ts` | Types Supabase manuels |
| `types/database.generated.ts` | Types Supabase auto-générés |
| `types/offline.ts` | Types Dexie/IndexedDB |
| `types/auth.ts` | Types authentification |

### Architecture Decision Records

| ADR | Décision | Rationale |
|-----|----------|-----------|
| ORG-001 | Max 300 lignes/fichier | Maintenabilité |
| ORG-002 | Préfixe `I`/`T` | Cohérence 1244+ usages |
| ORG-003 | Tables Dexie `offline_*` | Distinction serveur/local |
| ORG-004 | Tests `__tests__/` adjacent | Co-location |
| ORG-005 | Checklist avant création | Éviter doublons |

---

## Business Rules

### Context

- **The Breakery:** Boulangerie française à Lombok, Indonésie
- **Volume:** ~200 transactions/jour
- **Connectivité:** Instable → Offline-first obligatoire

### Currency & Tax

**Devise:** IDR (Rupiah Indonésienne)
```typescript
// Formatage IDR
new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0
}).format(amount); // "Rp 150.000"
```

**Taxe:** 10% INCLUSE dans les prix
```typescript
const tax = total * 10 / 110;  // PAS total * 0.10
```

**Arrondi:** Toujours au 100 IDR le plus proche

### Cart & Kitchen Workflow

**Locked Items (CRITIQUE):**
- Items envoyés en cuisine = VERROUILLÉS dans `cartStore.lockedItems`
- Modification/suppression requiert PIN manager
- Pattern: `cartStore.ts` → `lockedItems: Map<string, ILockedItem>`

**Dispatch Stations:**
| Station | Usage |
|---------|-------|
| `barista` | Boissons, café |
| `kitchen` | Plats chauds |
| `display` | Pâtisseries vitrine |
| `none` | Pas d'envoi KDS |

### Permission Codes

```typescript
// Sales
'sales.view', 'sales.create', 'sales.void',
'sales.discount', 'sales.refund'

// Inventory
'inventory.view', 'inventory.create',
'inventory.update', 'inventory.adjust'

// Admin
'users.view', 'users.roles',
'settings.view', 'settings.update'
```

**Usage:**
```typescript
const { hasPermission } = usePermissions();
if (!hasPermission('sales.void')) return null;
```

### Offline Orders

- **ID:** Préfixé `LOCAL-{uuid}`
- **Order number:** `OFFLINE-YYYYMMDD-XXX`
- **Flag:** `is_offline: true`
- **Sync:** Via `offline_sync_queue` quand online

### Loyalty System

| Tier | Points | Réduction |
|------|--------|-----------|
| Bronze | 0 | 0% |
| Silver | 500 | 5% |
| Gold | 2,000 | 8% |
| Platinum | 5,000 | 10% |

**Calcul:** 1 point = 1,000 IDR dépensés

### i18n Rules - ⚠️ MODULE SUSPENDU

**Langue:** English uniquement (hardcodé)

**Ce qui est INTERDIT:**
```typescript
// ❌ NE PAS FAIRE - i18n suspendu
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<Button>{t('common.save')}</Button>
```

**Pattern correct:**
```typescript
// ✅ CORRECT - Strings anglaises directes
<Button>Save</Button>
<h1>Products</h1>
```

**Note:** Les fichiers `fr.json`, `en.json`, `id.json` existent mais sont obsolètes et non maintenus.

---

## Critical Don't-Miss Rules

### Anti-Patterns (NEVER DO)

| ❌ Anti-Pattern | ✅ Correct Approach |
|----------------|---------------------|
| Table sans RLS | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + policies |
| Utiliser `t()` ou i18next | Strings anglaises hardcodées (i18n suspendu) |
| Zustand pour server data | `useQuery` pour données serveur |
| `useEffect` pour fetch | `useQuery` avec `enabled` |
| `.equals(true)` Dexie | `.equals(1)` (IndexedDB = 0/1) |
| Import Supabase direct | Via hooks/services uniquement |
| Recréer hook existant | Vérifier `hooks/` d'abord |
| `console.log` en prod | Supprimé automatiquement (sauf warn/error) |

### Gotchas Critiques

**🔒 Locked Cart Items:**
```typescript
// Items envoyés cuisine = VERROUILLÉS
// Modification requiert PIN manager
cartStore.lockedItems.has(itemId) // Vérifier AVANT modification
```

**🆔 Offline Order IDs:**
```typescript
// Format: LOCAL-{uuid}
// Order number: OFFLINE-YYYYMMDD-XXX
// Flag: is_offline: true
// ATTENTION: ID change après sync serveur!
```

**📡 Network Status Check:**
```typescript
// TOUJOURS vérifier avant opération online-only
const { isOnline } = useNetworkStatus();
if (!isOnline) {
  // Fallback offline ou message utilisateur
}
```

**🔐 Permission Check:**
```typescript
// Pattern standard
const { hasPermission } = usePermissions();
if (!hasPermission('module.action')) return null;
```

### Security Checklist (Nouvelle Feature)

| # | Check | Fichier/Outil |
|---|-------|---------------|
| 1 | RLS activé + policies | Migration SQL |
| 2 | Permission codes définis | `role_permissions` |
| 3 | Validation input serveur | Edge Function |
| 4 | Rate limiting si auth | `rateLimitService.ts` |
| 5 | PIN hash (bcrypt) | `offlineAuthService.ts` |

### Common Mistakes by Module

| Module | Erreur Fréquente | Solution |
|--------|------------------|----------|
| **POS** | Ignorer lockedItems | Check `cartStore.lockedItems` avant modif |
| **Offline** | Boolean true/false Dexie | Utiliser 0/1 |
| **Sync** | Sync immédiat | Attendre 5s après reconnexion |
| **i18n** | Utiliser `t()` | ⚠️ SUSPENDU - Strings anglaises directes |
| **Auth** | PIN non-hashé | bcrypt OBLIGATOIRE |
| **Types** | `any` type | `I{Name}` ou `T{Name}` |

---

## Usage Guidelines

**Pour les Agents IA:**
- Lire ce fichier AVANT toute implémentation
- Suivre TOUTES les règles exactement comme documentées
- En cas de doute, choisir l'option la plus restrictive
- Mettre à jour ce fichier si nouveaux patterns émergent

**Pour les Humains:**
- Garder ce fichier lean et focalisé sur les besoins agents
- Mettre à jour lors de changements de stack
- Review trimestrielle pour règles obsolètes
- Supprimer les règles devenues évidentes

---

_Dernière mise à jour: 2026-02-05 (Print Server + Settings UI stories ajoutées)_
_Généré par BMAD Generate Project Context Workflow_

