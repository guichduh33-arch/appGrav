# Architecture d'Intégration - AppGrav

*Généré le 2026-01-26 - Scan Exhaustif*

## Vue d'Ensemble

AppGrav est un système **multi-part** composé de :

1. **Main App** (React/TypeScript) - Application web/mobile POS
2. **Print-Server** (Node.js/Express) - Service d'impression local
3. **Supabase** (Cloud) - Backend as a Service

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
├───────────────┬───────────────┬──────────────┬──────────────┤
│   POS Web     │   POS Mobile  │     KDS      │  Back-Office │
│  (Browser)    │  (Capacitor)  │  (Browser)   │  (Browser)   │
└───────┬───────┴───────┬───────┴──────┬───────┴──────┬───────┘
        │               │              │              │
        └───────────────┴──────────────┴──────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │              MAIN APP (React)                 │
        │  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
        │  │ Zustand │  │  React  │  │Services │      │
        │  │ Stores  │  │  Query  │  │   API   │      │
        │  └────┬────┘  └────┬────┘  └────┬────┘      │
        └───────┼────────────┼────────────┼───────────┘
                │            │            │
                │   ┌────────┴────────────┘
                │   │
        ┌───────┼───┼──────────────────────────────────┐
        │       │   │         SUPABASE (Cloud)          │
        │   ┌───┴───┴───┐   ┌────────────────┐         │
        │   │ PostgreSQL │   │ Edge Functions │         │
        │   │   + RLS    │   │    (Deno)      │         │
        │   └────────────┘   └────────────────┘         │
        │         │                   │                 │
        │   ┌─────┴─────┐      ┌──────┴──────┐         │
        │   │ Realtime  │      │    Auth     │         │
        │   └───────────┘      └─────────────┘         │
        └──────────────────────────────────────────────┘
                │
                │ HTTP (local network)
                ▼
        ┌──────────────────────────────────────────────┐
        │           PRINT-SERVER (Node.js)             │
        │   ┌─────────────┐    ┌─────────────┐         │
        │   │   Express   │    │  PrinterSvc │         │
        │   │   Routes    │───▶│   + USB     │         │
        │   └─────────────┘    └──────┬──────┘         │
        └─────────────────────────────┼────────────────┘
                                      │
                          ┌───────────┴───────────┐
                          ▼                       ▼
                    ┌──────────┐            ┌──────────┐
                    │ Printer  │            │ Printer  │
                    │ Receipt  │            │ Kitchen  │
                    └──────────┘            └──────────┘
```

## Points d'Intégration

### 1. Main App ↔ Supabase

| Type | Mécanisme | Usage |
|------|-----------|-------|
| **Direct Query** | Supabase JS Client | CRUD tables, views |
| **RPC** | PostgreSQL Functions | Logique métier complexe |
| **Edge Functions** | HTTP REST | Auth, rapports, facturation |
| **Realtime** | WebSocket | Mises à jour live (potentiel) |
| **Auth** | Supabase Auth | Gestion sessions (via PIN custom) |

### 2. Main App ↔ Print-Server

| Endpoint | Méthode | Usage |
|----------|---------|-------|
| `/health` | GET | Vérification santé |
| `/status` | GET | Statut imprimantes |
| `/print/receipt` | POST | Impression ticket |
| `/print/kitchen` | POST | Impression cuisine |
| `/print/barista` | POST | Impression barista |
| `/drawer/open` | POST | Ouverture tiroir-caisse |

**Configuration réseau :**
```
Print-Server: http://localhost:3001 (ou IP réseau local)
CORS: Tous les origins autorisés pour accès réseau local
```

### 3. Supabase ↔ Print-Server

Aucune communication directe. Le flux passe par Main App :

```
Order Created (Main App)
    │
    ▼
Save to Supabase (orders, order_items)
    │
    ▼
Send Print Job to Print-Server
    │
    ▼
Print-Server → Thermal Printers
```

## Flux de Données Principaux

### Flux Authentification

```
1. User entre PIN sur LoginPage
2. authService.loginWithPin() appelé
3. Edge Function auth-verify-pin exécutée
   - RPC verify_user_pin (bcrypt)
   - Création user_sessions
   - Récupération roles + permissions
4. Réponse stockée dans authStore (Zustand)
5. Session token utilisé pour requêtes suivantes
```

### Flux Commande POS

```
1. Ajout produits dans cartStore
2. Sélection modifiers/combos via modals
3. Checkout → useOrders.createOrder()
4. INSERT orders + order_items (Supabase)
5. Si dine-in/takeaway:
   - POST /print/receipt (Print-Server)
   - POST /print/kitchen (Print-Server)
6. KDS affiche commande (query orders avec status)
7. Kitchen marque "ready" → UPDATE status
8. Ticket "ready" imprimé
```

### Flux Stock

```
1. Réception marchandise → StockAdjustmentModal
2. useStock.createMovement() appelé
3. INSERT stock_movements (Supabase)
4. Trigger DB met à jour products.current_stock
5. React Query invalide cache 'stock-products'
6. UI rafraîchi automatiquement
```

### Flux Rapport Journalier

```
1. Manager ouvre ReportsPage
2. ReportingService.getDashboardSummary()
3. Edge Function calculate-daily-report
4. Query orders, order_items, products
5. Agrégation par période/catégorie/produit
6. Retour JSON structuré
7. Affichage avec Recharts
```

## Sécurité Inter-Composants

### Supabase RLS

Toutes les tables protégées par Row Level Security :
- Lecture : `auth.uid() IS NOT NULL`
- Écriture : `user_has_permission(auth.uid(), 'module.action')`

### Edge Functions

- Validation permissions côté serveur
- Admin client Supabase (contourne RLS si nécessaire)
- Audit logging automatique

### Print-Server

- Réseau local uniquement (0.0.0.0 par défaut)
- Pas d'authentification (confiance réseau)
- Validation payload basique

## Configuration Multi-Terminal

```
Terminal 1 (POS)          Terminal 2 (POS)         Terminal 3 (KDS)
     │                         │                        │
     └─────────────────────────┴────────────────────────┘
                               │
                     ┌─────────┴─────────┐
                     │   Print-Server    │
                     │  (Single Server)  │
                     └─────────┬─────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
         [Printer 1]     [Printer 2]     [Cash Drawer]
          Receipt         Kitchen
```

**Multi-user Sessions :**
- Chaque terminal peut avoir plusieurs shifts ouverts
- `pos_sessions.terminal_id` identifie le terminal
- Réconciliation par session, pas par terminal

## Dépendances Externes

| Service | Usage | Fallback |
|---------|-------|----------|
| Supabase Cloud | Backend principal | Aucun (critique) |
| Anthropic Claude | Assistance IA | Fonctionnalité désactivée |
| Print-Server Local | Impression | Messages d'erreur |

## Monitoring

### Supabase Dashboard
- Logs SQL queries
- Logs Edge Functions
- Métriques Auth

### Print-Server Logs
- Winston avec rotation quotidienne
- Fichiers dans `logs/`
- Format : timestamp, level, message, metadata
