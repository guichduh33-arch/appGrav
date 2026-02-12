# Audit Cycle 2 — Verification, Gaps & Nouvelles Decouvertes

**Date** : 2026-02-12
**Sources** : 4 subagents paralleles (verification fixes, gaps, regressions, edge functions)
**Corrections** : 4 subagents paralleles (batch 1-4), commit `a5558f4`

---

## 1. Verification des Corrections Cycle 1

### Fixes VERIFIES (13/13) — TOUS CORRIGES

| # | Description | Statut |
|---|-------------|--------|
| B1 | PIN hash supprime du SELECT `MobileLoginPage.tsx` | **VERIFIE** — Utilise RPC `verify_user_pin` server-side |
| B2 | XSS Stored dans factures | **VERIFIE** — `escapeHtml()` applique a tous les champs dans `generate-invoice/index.ts` (commit `ac51f11`) |
| B3 | RLS trop permissives (~50 tables) | **VERIFIE** — Migration `20260212140000` reimplemente 48+ tables |
| B4 | Edge Functions CORS wildcard | **VERIFIE** — `requireSession()` + `supabase.auth.getUser()` sur les 2 Edge Functions (commit `ac51f11`) |
| B5 | `update_setting()` sans check permission | **VERIFIE** — Migration `20260212110004` ajoute checks |
| C3 | RouteGuard sur pages admin | **VERIFIE** — `App.tsx` wrappe toutes les routes admin |
| C5 | `auth-verify-pin` incrementation echecs | **VERIFIE** — Incremente + lockout apres 5 echecs |
| C8 | React.memo POS/KDS | **VERIFIE** — 13+ composants POS/KDS avec `React.memo` (ProductGrid, CartItemRow, Cart, KDSOrderCard, etc.) |
| C9 | N+1 queries comptabilite | **VERIFIE** — RPC batch `get_balance_sheet_data` |
| C10 | Textes francais restants | **VERIFIE** — ModifierModal.tsx entierement en anglais + test `recipesCacheService` corrige (commit `a5558f4`) |
| I1 | 55+ `as any` casts | **VERIFIE** — 0 en prod, 2 en tests |
| I4 | ErrorBoundary unique | **VERIFIE** — `ModuleErrorBoundary` sur POS, KDS, Reports, Settings |
| I7 | `pin_code` colonne plaintext | **VERIFIE** — Migration `20260212110000` DROP COLUMN |

---

## 2. Regression : Migration CSS Incomplete

**Severite** : MAJEUR
**Statut** : ~~Documentation incorrecte~~ **CORRIGE** (commit `a5558f4`)

Le tracker `05-plan-corrections-cycle1.md` (S5) et `CURRENT_STATE.md` ont ete mis a jour pour refleter l'etat reel :

- **18 fichiers CSS** restent dans `src/` (apres suppression de 6 fichiers supplementaires dans ce cycle)
- **19 imports CSS actifs** dans des composants TSX (18 locaux + 1 externe `react-day-picker`)
- ~675 lignes dans `FloorPlanEditor.css` seul

**Fichiers CSS supprimes dans ce cycle** : `Cart.css`, `CustomerSearchModal.css`, `ShiftStatsModal.css`, `PromotionFormPage.css`, `PromotionsPage.css`, `UsersPage.css`

**Fichiers CSS restants** : `FloorPlanEditor.css`, `POSMainPage.css`, `SettingsPage.css`, `PaymentModal.css`, `CashierAnalyticsModal.css`, `LanMonitoringPage.css`, `ProductsPage.css`, `CombosPage.css`, `ComboFormPage.css`, `ProductCategoryPricingPage.css`, `PurchaseOrderDetailPage.css`, `IncomingStockPage.css`, `WastedPage.css`, `StockMovementsPage.css`, `TransferDetailPage.css`, `StockProductionPage.css`, `ModifiersTab.css`, `index.css` (global)

---

## 3. Nouvelles Decouvertes — Zones Non Couvertes par le Cycle 1

### 3.1 Couverture de Tests (CRITIQUE) — NON CORRIGE (effort XL, hors scope)

L'audit Cycle 1 n'a pas analyse la qualite des tests. La situation est preoccupante :

| Categorie | Fichiers | Tests | Couverture |
|-----------|----------|-------|------------|
| Stores | 11 | 3 testes | **27%** |
| Hooks | 121 | 24 testes | **20%** |
| Components | 119 | 9 testes | **8%** |
| Pages | 131 | 2 testes | **1.5%** |
| Services | 69 | 52 testes | **75%** |

**Stores critiques sans tests** :
- `authStore.ts` — Authentification, sessions, permissions
- `paymentStore.ts` — Paiements, split payments
- `orderStore.ts` — Cycle de vie commandes
- `syncStore.ts` — File d'attente sync, conflits
- `displayStore.ts` — Customer display
- `lanStore.ts` — Decouverte LAN
- `mobileStore.ts` — UI mobile
- `settingsStore.ts` (facade) — Re-exports

**syncEngine.ts** (coeur du systeme offline-first) n'a **aucun test**.

### 3.2 Fuite Memoire (MAJEUR) — CORRIGE

**`displayStore.ts`** : ~~setTimeout cree pour chaque commande ready mais jamais stocke/annule~~
**CORRIGE** (commit `a5558f4`) — `clearAllTimeouts()` ajoute au store + `clearCart()` nettoie tous les timeouts et reset les queues.

**`syncEngine.ts`** : ~~initializeSyncEngine() appele dans App.tsx sans cleanup~~
**DEJA CORRIGE** (commit `ac51f11`) — `stopBackgroundSync()` dans le return du useEffect de `App.tsx`.

### 3.3 Fichier `.env` avec Credentials (CRITIQUE) — CORRIGE

- `.env` contient les vrais credentials Supabase (URL, ANON_KEY, SERVICE_KEY)
- ~~Pas de `.env.example`~~ **CORRIGE** (commit `a5558f4`) — `.env.example` complete avec toutes les variables requises
- Le `.gitignore` protege le fichier — `.env` n'est PAS dans l'historique Git (verifie)

### 3.4 localStorage Sans Error Handling (CRITIQUE) — DEJA CORRIGE

~~Appels `localStorage.getItem()`/`setItem()` sans `try/catch`~~

**DEJA CORRIGE** (commit `ac51f11`) — Les 19 fichiers utilisant `localStorage` ont tous des `try/catch` :
- `customerSearchTypes.ts` (lignes 61-76)
- `useShift.ts` (lignes 68-103)
- `cartPersistenceService.ts` (lignes 99-182)
- Et 16 autres fichiers

### 3.5 Accessibilite POS (MAJEUR) — NON CORRIGE (effort M, hors scope)

- 127 elements `<button>` et `<input>` dans le POS
- Seulement 15 avec `aria-label` (12% de couverture)
- Aucun support clavier dans les modals (pas de focus trap)
- Aucun `autoFocus` sur les premiers inputs des modals

### 3.6 Dependencies Inutilisees (MAJEUR) — CORRIGE

~~16 packages inutilises dans `package.json`~~

**CORRIGE** (commit `a5558f4`) — 10 packages supprimes :

**Production (6 supprimes)** :
- `@capacitor-mlkit/barcode-scanning`, `@capacitor/barcode-scanner`
- `@capacitor/filesystem`, `@capacitor/haptics`, `@capacitor/network`, `@capacitor/preferences`

**Dev (4 supprimes)** :
- `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`
- `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`

**Conserves (utilises)** : `@capacitor/android`, `@capacitor/ios` (native builds), `autoprefixer` (postcss.config.js), `postcss` (requis par Tailwind)

### 3.7 Service Worker PWA (MINEUR) — NON CORRIGE

- `usePWAInstall.ts` contient `useServiceWorkerUpdate()` mais **jamais importe** dans `main.tsx`
- Les utilisateurs ne sont jamais notifies des mises a jour de l'app
- Cache Supabase REST: 24h pour TOUTES les tables (meme orders, inventory) — donnees potentiellement perimees

### 3.8 Routage (MINEUR) — NON CORRIGE

- Pas de page 404 : toutes les routes inconnues redirigent silencieusement vers `/pos`
- Route doublon : `/products/:id` et `/inventory/product/:id` pointent vers le meme composant

---

## 4. Audit Supabase Approfondi

### 4.1 Edge Functions — Nouvelles Decouvertes

| # | Severite | Description | Fichier | Statut |
|---|----------|-------------|---------|--------|
| EF-005 | **MAJEUR** | Transfert stock sans transaction atomique (TOCTOU) | `intersection_stock_movements/index.ts` | **CORRIGE** — `transfer_stock()` SQL avec `SELECT ... FOR UPDATE` deploye + `search_path=''` |
| EF-001 | **MAJEUR** | 2 Edge Functions JWT-only | Les deux fichiers | **DEJA CORRIGE** — `requireSession()` + `auth.getUser()` (commit `ac51f11`) |
| EF-004 | **MINEUR** | PO number avec `Math.random()` | `purchase_order_module/index.ts:76` | NON CORRIGE |
| ST-001 | **MINEUR** | Storage upload sans check permission | Migration `20260205120000` | NON CORRIGE |

### 4.2 Realtime & Triggers

- **5 subscriptions Realtime** trouvees — **toutes correctement nettoyees** (unsubscribe dans useEffect cleanup)
- **Aucune boucle infinie** detectee dans les triggers
- **70+ fonctions SECURITY DEFINER** — toutes utilisent des requetes parametrisees (0 injection SQL)

### 4.3 Points Positifs Backend

- Thread-safe invoice generation via `pg_advisory_xact_lock`
- Audit logging complet
- Storage avec limite 2MB et whitelist MIME
- 69 migrations valides, chaine d'integrite OK

---

## 5. Synthese Consolidee Cycle 2

### Par Severite — Statut Final

#### CRITIQUE (4 decouvertes)

| # | Zone | Description | Statut |
|---|------|-------------|--------|
| **N-C1** | Tests | 8/11 stores Zustand sans aucun test | **NON CORRIGE** (effort XL) |
| **N-C2** | Tests | `syncEngine.ts` (coeur offline) sans test | **NON CORRIGE** (effort XL) |
| **N-C3** | Config | `.env` avec credentials, pas de `.env.example` | ~~CORRIGE~~ `.env.example` complete |
| **N-C4** | Code | `localStorage` sans try/catch | ~~DEJA CORRIGE~~ (commit `ac51f11`) |

#### MAJEUR (7 nouvelles + 3 non-fixees Cycle 1)

| # | Zone | Description | Statut |
|---|------|-------------|--------|
| **B2** | Security | XSS dans `generate-invoice` | ~~DEJA CORRIGE~~ (commit `ac51f11`) |
| **C8** | Perf | React.memo POS/KDS | ~~DEJA CORRIGE~~ (commit `ac51f11`) |
| **N-M1** | Tests | Couverture composants 8%, pages 1.5% | **NON CORRIGE** (effort XL) |
| **N-M2** | Memoire | Fuite setTimeout dans `displayStore.ts` | ~~CORRIGE~~ `clearAllTimeouts()` ajoute |
| **N-M3** | Memoire | Intervalle syncEngine non nettoyee | ~~DEJA CORRIGE~~ (commit `ac51f11`) |
| **N-M4** | A11y | POS : 88% des boutons sans `aria-label` | **NON CORRIGE** (effort M) |
| **N-M5** | Deps | ~16 packages npm inutilises | ~~CORRIGE~~ 10 supprimes |
| **N-M6** | Backend | Stock transfer sans atomicite | ~~CORRIGE~~ Migration deployee + search_path |
| **N-M7** | Backend | 2 Edge Functions JWT-only | ~~DEJA CORRIGE~~ (commit `ac51f11`) |
| **N-M8** | Docs | Migration CSS declaree complete | ~~CORRIGE~~ Docs mis a jour (18 CSS restants) |

#### MINEUR (5 nouvelles + 1 Cycle 1)

| # | Zone | Description | Statut |
|---|------|-------------|--------|
| **C10** | i18n | Textes francais restants | ~~CORRIGE~~ ModifierModal EN + tests FR fixes |
| **N-m1** | PWA | Hook SW update jamais utilise | **NON CORRIGE** |
| **N-m2** | PWA | Cache Supabase 24h pour donnees operationnelles | **NON CORRIGE** |
| **N-m3** | Route | Pas de page 404, redirection silencieuse | **NON CORRIGE** |
| **N-m4** | Backend | PO number generation `Math.random()` | **NON CORRIGE** |
| **N-m5** | Backend | Storage upload sans check permission | **NON CORRIGE** |

---

## 6. Plan de Corrections Recommande — Cycle 2

### Batch 1 — Fixes Non Appliques du Cycle 1 (URGENT) — ~~TERMINE~~

| # | Action | Effort | Statut |
|---|--------|--------|--------|
| B2 | Ajouter `escapeHtml()` dans `generate-invoice/index.ts` | S | ~~DEJA FAIT~~ (ac51f11) |
| C8 | Ajouter `React.memo` aux composants POS/KDS | S | ~~DEJA FAIT~~ (ac51f11) |
| C10 | Traduire `ModifierModal.tsx` en anglais | XS | ~~DEJA FAIT~~ + tests corriges (a5558f4) |

### Batch 2 — Nouvelles Critiques (N-C1 a N-C4) — ~~TERMINE~~

| # | Action | Effort | Statut |
|---|--------|--------|--------|
| N-C3 | Creer `.env.example`, verifier `.env` pas dans l'historique git | XS | ~~FAIT~~ (a5558f4) |
| N-C4 | Wrapper tous les `localStorage` appels dans try/catch | S | ~~DEJA FAIT~~ (ac51f11) |
| N-M2 | Stocker et nettoyer les setTimeout dans `displayStore.ts` | XS | ~~FAIT~~ (a5558f4) |
| N-M3 | Ajouter cleanup `stopBackgroundSync()` dans le return useEffect de `App.tsx` | XS | ~~DEJA FAIT~~ (ac51f11) |

### Batch 3 — Backend & Security — ~~TERMINE~~

| # | Action | Effort | Statut |
|---|--------|--------|--------|
| N-M6 | Fonction SQL atomique pour le transfert stock avec `SELECT ... FOR UPDATE` | M | ~~FAIT~~ Migration deployee + search_path (a5558f4) |
| N-M7 | Migrer Edge Functions vers `requireSession()` | S | ~~DEJA FAIT~~ (ac51f11) |
| N-M8 | Mettre a jour `CURRENT_STATE.md` et `05-plan-corrections-cycle1.md` | XS | ~~FAIT~~ (a5558f4) |

### Batch 4 — Qualite & Maintenance — PARTIELLEMENT TERMINE

| # | Action | Effort | Statut |
|---|--------|--------|--------|
| N-C1/N-C2 | Ecrire tests pour authStore, paymentStore, orderStore, syncEngine | XL | **A FAIRE** — Cycle 3 |
| N-M5 | Supprimer les packages npm inutilises | S | ~~FAIT~~ 10 supprimes (a5558f4) |
| N-M4 | Ajouter aria-labels aux boutons POS (minimum les 30 plus critiques) | M | **A FAIRE** — Cycle 3 |

---

## 7. Bilan ESLint, Build & Tests

- **Build** : PASSE (0 erreurs TypeScript)
- **Tests** : **1650/1650 passent** (93 fichiers, 0 regressions)
- **ESLint** : 56 warnings (seuil 150) — amelioration de 61% vs pre-audit (145 → 56)
- **Migrations** : 69 fichiers, chaine d'integrite valide
- **Subscriptions Realtime** : 5, toutes nettoyees
- **Injection SQL** : 0 vulnerabilite detectee
- **Packages npm** : 921 (27 supprimes dans ce cycle)

---

## 8. Reste a Faire — Cycle 3

| # | Zone | Description | Effort | Priorite |
|---|------|-------------|--------|----------|
| N-C1 | Tests | Tests stores Zustand (authStore, paymentStore, orderStore, syncStore) | XL | CRITIQUE |
| N-C2 | Tests | Tests syncEngine.ts | L | CRITIQUE |
| N-M1 | Tests | Augmenter couverture composants (8%) et pages (1.5%) | XL | MAJEUR |
| N-M4 | A11y | aria-labels boutons POS (30+ elements critiques) | M | MAJEUR |
| N-m1 | PWA | Integrer `useServiceWorkerUpdate()` dans `main.tsx` | S | MINEUR |
| N-m2 | PWA | Reduire TTL cache Supabase pour tables operationnelles | S | MINEUR |
| N-m3 | Route | Ajouter page 404 + deduplication routes produits | S | MINEUR |
| N-m4 | Backend | Remplacer `Math.random()` PO number par sequence DB | XS | MINEUR |
| N-m5 | Backend | Ajouter check permission storage upload | XS | MINEUR |
| S5 | CSS | Migrer les 18 fichiers CSS restants vers Tailwind | L | SOUHAITABLE |
| S6 | CSS | Eliminer les 413 inline styles | L | SOUHAITABLE |
| S8 | Security | Rate limiting IP sur auth online | M | SOUHAITABLE |

---

*Fin du rapport d'audit Cycle 2 — mis a jour apres corrections.*
*Commits : `ac51f11` (Cycle 2 initial), `a5558f4` (Cycle 2 corrections finales)*
