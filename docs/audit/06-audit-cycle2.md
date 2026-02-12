# Audit Cycle 2 — Verification, Gaps & Nouvelles Decouvertes

**Date** : 2026-02-12
**Sources** : 4 subagents paralleles (verification fixes, gaps, regressions, edge functions)

---

## 1. Verification des Corrections Cycle 1

### Fixes VERIFIES (10/13)

| # | Description | Statut |
|---|-------------|--------|
| B1 | PIN hash supprime du SELECT `MobileLoginPage.tsx` | **VERIFIE** — Utilise RPC `verify_user_pin` server-side |
| B3 | RLS trop permissives (~50 tables) | **VERIFIE** — Migration `20260212140000` reimplemente 48+ tables |
| B4 | Edge Functions CORS wildcard | **PARTIELLEMENT VERIFIE** — Plus de wildcard `*`, mais `requireSession()` absent (JWT only) |
| B5 | `update_setting()` sans check permission | **VERIFIE** — Migration `20260212110004` ajoute checks |
| C3 | RouteGuard sur pages admin | **VERIFIE** — `App.tsx` wrappe toutes les routes admin |
| C5 | `auth-verify-pin` incrementation echecs | **VERIFIE** — Incremente + lockout apres 5 echecs |
| C9 | N+1 queries comptabilite | **VERIFIE** — RPC batch `get_balance_sheet_data` |
| I1 | 55+ `as any` casts | **VERIFIE** — 0 en prod, 2 en tests |
| I4 | ErrorBoundary unique | **VERIFIE** — `ModuleErrorBoundary` sur POS, KDS, Reports, Settings |
| I7 | `pin_code` colonne plaintext | **VERIFIE** — Migration `20260212110000` DROP COLUMN |

### Fixes NON APPLIQUES (3/13)

| # | Description | Statut | Impact |
|---|-------------|--------|--------|
| **B2** | **XSS Stored dans factures** | **NON FIXE** | `generate-invoice/index.ts` interpole toujours les donnees client sans `escapeHtml()`. DOMPurify est client-side seulement. |
| **C8** | **React.memo POS/KDS** | **NON FIXE** | 0 occurrences de `React.memo` dans `components/pos/` et `components/kds/`. Performance POS degradee. |
| **C10** | **Textes francais restants** | **PARTIELLEMENT FIXE** | B2B/Customers/Discount migres, mais `ModifierModal.tsx` contient encore du francais ("Temperature", "Chaud", "Glace", "Type de lait", etc.) |

---

## 2. Regression : Migration CSS Incomplete

**Severite** : MAJEUR
**Statut** : Documentation incorrecte

Le tracker `05-plan-corrections-cycle1.md` (S5) et `CURRENT_STATE.md` declarent la migration CSS→Tailwind **terminee** ("55 CSS files supprimes"). En realite :

- **24 fichiers CSS** existent encore dans `src/`
- **27 imports CSS actifs** dans des composants TSX
- ~675 lignes dans `FloorPlanEditor.css` seul

**Fichiers concernes** : `FloorPlanEditor.css`, `POSMainPage.css`, `SettingsPage.css`, `WastedPage.css`, `ProductsPage.css`, et 19 autres.

**Action** : Mettre a jour la documentation OU completer la migration.

---

## 3. Nouvelles Decouvertes — Zones Non Couvertes par le Cycle 1

### 3.1 Couverture de Tests (CRITIQUE)

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

### 3.2 Fuite Memoire (MAJEUR)

**`displayStore.ts:204-206`** : `setTimeout` cree pour chaque commande ready mais jamais stocke/annule. Sur un display client en fonctionnement continu, les timeouts s'accumulent indefiniment.

**`syncEngine.ts:51-52`** : `initializeSyncEngine()` appele dans `App.tsx` sans cleanup dans le return de `useEffect`. L'intervalle de sync continue apres navigation SPA.

### 3.3 Fichier `.env` avec Credentials (CRITIQUE)

- `.env` contient les vrais credentials Supabase (URL, ANON_KEY, SERVICE_KEY)
- **Pas de `.env.example`** pour guider les developpeurs
- Le `.gitignore` protege le fichier mais les credentials sont dans l'historique Git si commit accidentel

### 3.4 localStorage Sans Error Handling (CRITIQUE)

**Fichiers vulnerables** :
- `src/components/pos/modals/customerSearchTypes.ts:33`
- `src/hooks/useShift.ts`
- `src/services/offline/cartPersistenceService.ts`

Appels `localStorage.getItem()`/`setItem()` sans `try/catch`. **Crash garanti** en mode prive Safari ou quota depasse.

### 3.5 Accessibilite POS (MAJEUR)

- 127 elements `<button>` et `<input>` dans le POS
- Seulement 15 avec `aria-label` (12% de couverture)
- Aucun support clavier dans les modals (pas de focus trap)
- Aucun `autoFocus` sur les premiers inputs des modals

### 3.6 Dependencies Inutilisees (MAJEUR)

~16 packages inutilises dans `package.json` :

**Production** :
- `@capacitor-mlkit/barcode-scanning`, `@capacitor/barcode-scanner` (doublon)
- `@capacitor/android`, `@capacitor/ios` (build-only, pas imports)
- `@capacitor/filesystem`, `@capacitor/haptics`, `@capacitor/network`, `@capacitor/preferences`

**Dev** :
- `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser` (flat config utilise `typescript-eslint`)
- `autoprefixer`, `postcss` (inutilises apres migration Tailwind)
- `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`

### 3.7 Service Worker PWA (MINEUR)

- `usePWAInstall.ts` contient `useServiceWorkerUpdate()` mais **jamais importe** dans `main.tsx`
- Les utilisateurs ne sont jamais notifies des mises a jour de l'app
- Cache Supabase REST: 24h pour TOUTES les tables (meme orders, inventory) — donnees potentiellement perimees

### 3.8 Routage (MINEUR)

- Pas de page 404 : toutes les routes inconnues redirigent silencieusement vers `/pos`
- Route doublon : `/products/:id` et `/inventory/product/:id` pointent vers le meme composant

---

## 4. Audit Supabase Approfondi

### 4.1 Edge Functions — Nouvelles Decouvertes

| # | Severite | Description | Fichier |
|---|----------|-------------|---------|
| EF-005 | **MAJEUR** | `intersection_stock_movements` : transfert stock sans transaction atomique (TOCTOU). Deux transferts concurrents peuvent causer un stock negatif. | `intersection_stock_movements/index.ts:78-139` |
| EF-001 | **MAJEUR** | 2 Edge Functions utilisent JWT-only au lieu de session tokens (`intersection_stock_movements`, `purchase_order_module`) | Les deux fichiers |
| EF-004 | **MINEUR** | `purchase_order_module` genere le PO number avec `Math.random()` au lieu du trigger DB | `purchase_order_module/index.ts:76` |
| ST-001 | **MINEUR** | Storage bucket `company-assets` : tout utilisateur authentifie peut uploader (pas de check `settings.update`) | Migration `20260205120000` |

### 4.2 Realtime & Triggers

- **5 subscriptions Realtime** trouvees — **toutes correctement nettoyees** (unsubscribe dans useEffect cleanup)
- **Aucune boucle infinie** detectee dans les triggers
- **70+ fonctions SECURITY DEFINER** — toutes utilisent des requetes paramétrisées (0 injection SQL)

### 4.3 Points Positifs Backend

- Thread-safe invoice generation via `pg_advisory_xact_lock`
- Audit logging complet
- Storage avec limite 2MB et whitelist MIME
- 69 migrations valides, chaine d'integrite OK

---

## 5. Synthese Consolidee Cycle 2

### Par Severite

#### CRITIQUE (4 nouvelles)

| # | Zone | Description |
|---|------|-------------|
| **N-C1** | Tests | 8/11 stores Zustand sans aucun test (auth, payment, order, sync) |
| **N-C2** | Tests | `syncEngine.ts` (coeur offline) sans test |
| **N-C3** | Config | `.env` avec credentials, pas de `.env.example` |
| **N-C4** | Code | `localStorage` sans try/catch (crash Safari private) |

#### MAJEUR (7 nouvelles + 3 non-fixees)

| # | Zone | Description |
|---|------|-------------|
| **B2** | Security | XSS dans `generate-invoice` — **NON FIXE depuis Cycle 1** |
| **C8** | Perf | 0 `React.memo` dans POS/KDS — **NON FIXE depuis Cycle 1** |
| **N-M1** | Tests | Couverture composants 8%, pages 1.5% |
| **N-M2** | Memoire | Fuite setTimeout dans `displayStore.ts` |
| **N-M3** | Memoire | Intervalle syncEngine non nettoyee dans `App.tsx` useEffect |
| **N-M4** | A11y | POS : 88% des boutons sans `aria-label` |
| **N-M5** | Deps | ~16 packages npm inutilises |
| **N-M6** | Backend | Stock transfer sans atomicite (EF-005) |
| **N-M7** | Backend | 2 Edge Functions JWT-only au lieu de session tokens |
| **N-M8** | Docs | Migration CSS declaree complete mais 24 fichiers restent |

#### MINEUR (5 nouvelles + 1 non-fixee)

| # | Zone | Description |
|---|------|-------------|
| **C10** | i18n | `ModifierModal.tsx` encore en francais — **PARTIELLEMENT FIXE** |
| **N-m1** | PWA | Hook SW update jamais utilise, notifications absentes |
| **N-m2** | PWA | Cache Supabase 24h pour donnees operationnelles |
| **N-m3** | Route | Pas de page 404, redirection silencieuse |
| **N-m4** | Backend | PO number generation `Math.random()` |
| **N-m5** | Backend | Storage upload sans check permission |

---

## 6. Plan de Corrections Recommande — Cycle 2

### Batch 1 — Fixes Non Appliques du Cycle 1 (URGENT)

| # | Action | Effort |
|---|--------|--------|
| B2 | Ajouter `escapeHtml()` dans `generate-invoice/index.ts` et `B2BOrderDetailPage.tsx` | S |
| C8 | Ajouter `React.memo` aux composants POS critiques (ProductGrid, CartItemRow, KDSOrderCard) | S |
| C10 | Traduire `ModifierModal.tsx` en anglais | XS |

### Batch 2 — Nouvelles Critiques (N-C1 a N-C4)

| # | Action | Effort |
|---|--------|--------|
| N-C3 | Creer `.env.example`, verifier `.env` pas dans l'historique git | XS |
| N-C4 | Wrapper tous les `localStorage` appels dans try/catch | S |
| N-M2 | Stocker et nettoyer les setTimeout dans `displayStore.ts` | XS |
| N-M3 | Ajouter cleanup `stopBackgroundSync()` dans le return useEffect de `App.tsx` | XS |

### Batch 3 — Backend & Security

| # | Action | Effort |
|---|--------|--------|
| N-M6 | Creer une fonction SQL atomique pour le transfert stock avec `SELECT ... FOR UPDATE` | M |
| N-M7 | Migrer `intersection_stock_movements` et `purchase_order_module` vers `requireSession()` | S |
| N-M8 | Mettre a jour `CURRENT_STATE.md` et `05-plan-corrections-cycle1.md` (CSS migration partielle) | XS |

### Batch 4 — Qualite & Maintenance

| # | Action | Effort |
|---|--------|--------|
| N-C1/N-C2 | Ecrire tests pour authStore, paymentStore, orderStore, syncEngine | XL |
| N-M5 | Supprimer les 16 packages npm inutilises | S |
| N-M4 | Ajouter aria-labels aux boutons POS (minimum les 30 plus critiques) | M |

---

## 7. Bilan ESLint & Build

- **Build** : PASSE (0 erreurs TypeScript)
- **ESLint** : 56 warnings (seuil 150) — amelioration de 61% vs pre-audit (145 → 56)
- **Migrations** : 69 fichiers, chaine d'integrite valide
- **Subscriptions Realtime** : 5, toutes nettoyees
- **Injection SQL** : 0 vulnerabilite detectee

---

*Fin du rapport d'audit Cycle 2.*
