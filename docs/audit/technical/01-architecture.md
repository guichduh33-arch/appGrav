# Audit Architecture & Structure du Code - AppGrav

**Date**: 2026-02-10
**Auditeur**: Agent 1 - Architecte Logiciel Senior
**Scope**: Organisation fichiers, patterns d'architecture, gestion types TypeScript, configuration & build

---

## Table des Matieres

1. [Resume Executif](#1-resume-executif)
2. [Organisation des Fichiers et Dossiers](#2-organisation-des-fichiers-et-dossiers)
3. [Patterns d'Architecture](#3-patterns-darchitecture)
4. [Gestion des Types TypeScript](#4-gestion-des-types-typescript)
5. [Configuration et Build](#5-configuration-et-build)
6. [Tableau Recapitulatif](#6-tableau-recapitulatif)

---

## 1. Resume Executif

L'application AppGrav est un ERP/POS bien structure dans l'ensemble, avec une architecture offline-first solide et une bonne separation en modules. Cependant, l'audit revele **1 probleme de securite critique**, plusieurs problemes architecturaux majeurs, et de nombreuses ameliorations mineures possibles.

### Metriques Cles

| Metrique | Valeur |
|----------|--------|
| Total lignes TypeScript/React | ~141,700 |
| Fichiers source (hors tests) | ~350+ |
| Fichiers depassant 300 lignes (hors tests/types gen.) | **45+** |
| Occurrences `as any` | 94 (31 fichiers) |
| Occurrences `: any` | 60 (25 fichiers) |
| `eslint-disable` | 45 (13 fichiers) |
| `@ts-ignore/@ts-expect-error` | 6 (3 fichiers) |
| Appels Supabase directs dans pages | **25 fichiers** |
| Appels Supabase directs dans composants | 1 fichier |
| Console.log/debug/info en code source | **167** (40 fichiers) |
| Fichiers CSS non-Tailwind | 83 fichiers |
| Chaines en francais residuelles | 27 (16 fichiers) |

### Severites

| Severite | Nombre |
|----------|--------|
| Critique | 2 |
| Majeur | 14 |
| Mineur | 16 |

---

## 2. Organisation des Fichiers et Dossiers

### 2.1 Structure Generale

La structure `src/` est bien organisee avec une separation claire :
- `components/` - 13 sous-dossiers par feature
- `pages/` - 16 sous-dossiers par module
- `hooks/` - 16 sous-dossiers + hooks individuels
- `services/` - 15 sous-dossiers + services racine
- `stores/` - 12 stores Zustand
- `types/` - 9 fichiers de types
- `utils/` - 3 fichiers utilitaires
- `lib/` - 4 fichiers bibliotheque
- `constants/` - 5 fichiers constantes
- `data/` - 3 fichiers mock data
- `layouts/` - 1 layout

**Points Positifs**: Bonne modularisation par feature, barrel exports (`index.ts`) dans les modules principaux, lazy loading des routes dans `App.tsx`.

---

### 2.2 Fichiers Orphelins et Code Mort

#### SEC-01 : Fichier `.env.docker` commite dans Git avec cles sensibles

- **Gravite** : CRITIQUE
- **Fichier(s)** : `C:\Users\MamatCEO\App\AppGrav\.env.docker`
- **Description** : Le fichier `.env.docker` contient le `SUPABASE_SERVICE_KEY` (cle de role service avec acces admin complet a la base) et a ete commite dans Git (commit `27539f5`). Le `.gitignore` ne contient PAS `.env.docker`. Ce fichier est donc visible dans l'historique Git et potentiellement sur tout remote.
- **Contenu sensible expose** :
  - `SUPABASE_SERVICE_KEY` (JWT service_role)
  - `POSTGRES_PASSWORD`
  - `VITE_SUPABASE_ANON_KEY`
- **Recommandation** :
  1. Ajouter `.env.docker` au `.gitignore` immediatement
  2. Revoquer et regenerer TOUTES les cles exposees (service key, anon key)
  3. Utiliser `git filter-branch` ou BFG Repo-Cleaner pour supprimer de l'historique
  4. Si le repo est public ou partage, considerer que les cles sont compromises

#### SEC-02 : Debug logging avec cles d'environnement dans le code source

- **Gravite** : CRITIQUE
- **Fichier(s)** : `C:\Users\MamatCEO\App\AppGrav\src\lib\supabase.ts`
- **Description** : Le fichier contient un `console.log('ENV DEBUG:', { supabaseUrl, hasKey: !!supabaseAnonKey, allEnv: import.meta.env })` qui expose TOUTES les variables d'environnement dans la console navigateur. Meme en production (ou `console.log` est strip par esbuild), l'intention est dangereuse et la presence de `allEnv: import.meta.env` pourrait leaker des informations.
- **Recommandation** : Supprimer completement ce `console.log` de debug. Utiliser le logger de `src/utils/logger.ts` qui est deja disponible et respecte les modes dev/prod.

---

#### ORPHAN-01 : Services Claude/Anthropic non utilises

- **Gravite** : Mineur
- **Fichier(s)** :
  - `C:\Users\MamatCEO\App\AppGrav\src\services\ClaudeService.ts` (52 lignes)
  - `C:\Users\MamatCEO\App\AppGrav\src\services\anthropicService.ts` (80 lignes)
- **Description** : Ces deux services sont exportes dans `services/index.ts` mais ne sont importes par AUCUN composant, page, ou hook dans tout le codebase `src/`. De plus, `anthropicService.ts` contient encore des commentaires en francais ("Appelle l'Edge Function...").
- **Recommandation** : Supprimer ces fichiers et leur export dans `services/index.ts`, ou les deplacer dans `_legacy/`.

#### ORPHAN-02 : Mock data volumineux (2,700+ lignes)

- **Gravite** : Mineur
- **Fichier(s)** :
  - `C:\Users\MamatCEO\App\AppGrav\src\data\mockProducts.ts` (2,693 lignes)
  - `C:\Users\MamatCEO\App\AppGrav\src\data\mockCategories.ts` (24 lignes)
- **Description** : `mockProducts.ts` est le 2e plus grand fichier du codebase. Ces donnees ne sont utilisees que dans 4 fichiers (hooks products/categories et ProductDetailPage). Le fichier `mockProducts.ts` a 2,693 lignes pour des donnees statiques.
- **Recommandation** : Deplacer dans un dossier `__fixtures__` ou `__mocks__` et ne charger qu'en mode dev/test via lazy import.

#### ORPHAN-03 : Fichier `database.backup.ts` dans types

- **Gravite** : Mineur
- **Fichier(s)** : `C:\Users\MamatCEO\App\AppGrav\src\types\database.backup.ts` (1,700 lignes)
- **Description** : Fichier backup non reference nulle part. Ajoute du bruit dans le dossier `types/`.
- **Recommandation** : Supprimer ou deplacer dans `_legacy/`.

#### ORPHAN-04 : Fichiers racine parasites

- **Gravite** : Mineur
- **Fichier(s)** :
  - `C:\Users\MamatCEO\App\AppGrav\nul` (0 octets) - fichier vide cree accidentellement (commande Windows)
  - `C:\Users\MamatCEO\App\AppGrav\UsersMamatCEOAppAppGravdocsimprovement-roadmap.md` (549 lignes) - fichier mal nomme (le chemin est concatene dans le nom)
  - `C:\Users\MamatCEO\App\AppGrav\vite.config.js` / `vite.config.d.ts` - generes par tsc, deja dans `.gitignore`
  - `C:\Users\MamatCEO\App\AppGrav\eslint-report.json` - rapport ESLint non gitignore
- **Description** : Fichiers parasites a la racine qui polluent le repo.
- **Recommandation** : Supprimer `nul`, renommer le fichier roadmap correctement dans `docs/`, nettoyer les fichiers generes.

---

### 2.3 Fichiers Depassant 300 Lignes (Convention du Projet)

Le projet definit une convention de 300 lignes max par fichier. Voici les violations les plus graves (hors tests, types generes, et mock data) :

| Fichier | Lignes | Categorie |
|---------|--------|-----------|
| `src/types/offline.ts` | 1,791 | Types |
| `src/components/pos/modals/CustomerSearchModal.tsx` | 1,069 | Composant |
| `src/pages/b2b/B2BOrderDetailPage.tsx` | 1,027 | Page |
| `src/pages/users/UsersPage.tsx` | 898 | Page |
| `src/pages/products/PromotionFormPage.tsx` | 862 | Page |
| `src/pages/settings/SettingsPage.tsx` | 835 | Page |
| `src/pages/orders/OrdersPage.tsx` | 819 | Page |
| `src/pages/inventory/StockProductionPage.tsx` | 819 | Page |
| `src/pages/b2b/B2BPaymentsPage.tsx` | 803 | Page |
| `src/services/authService.ts` | 788 | Service |
| `src/pages/products/ComboFormPage.tsx` | 788 | Page |
| `src/pages/inventory/tabs/VariantsTab.tsx` | 759 | Page (tab) |
| `src/pages/settings/NotificationSettingsPage.tsx` | 725 | Page |
| `src/pages/b2b/B2BOrderFormPage.tsx` | 721 | Page |
| `src/components/settings/FloorPlanEditor.tsx` | 703 | Composant |
| `src/pages/production/ProductionPage.tsx` | 697 | Page |
| `src/components/pos/modals/PaymentModal.tsx` | 697 | Composant |
| `src/stores/settingsStore.ts` | 690 | Store |
| `src/lib/db.ts` | 646 | Lib |
| `src/pages/settings/SyncStatusPage.tsx` | 633 | Page |
| `src/pages/profile/ProfilePage.tsx` | 623 | Page |
| `src/pages/customers/CustomerDetailPage.tsx` | 615 | Page |
| `src/hooks/purchasing/usePurchaseOrders.ts` | 607 | Hook |
| `src/pages/kds/KDSMainPage.tsx` | 591 | Page |
| `src/pages/purchasing/PurchaseOrderFormPage.tsx` | 586 | Page |
| `src/pages/customers/CustomerFormPage.tsx` | 566 | Page |
| `src/pages/products/ProductsPage.tsx` | 564 | Page |
| `src/pages/inventory/StockMovementsPage.tsx` | 561 | Page |
| `src/pages/settings/AuditPage.tsx` | 560 | Page |
| `src/services/ReportingService.ts` | 540 | Service |
| `src/stores/cartStore.ts` | 539 | Store |
| `src/pages/inventory/tabs/ModifiersTab.tsx` | 534 | Page (tab) |
| `src/pages/products/ProductFormPage.tsx` | 527 | Page |
| `src/services/reports/csvExport.ts` | 514 | Service |
| `src/pages/inventory/WastedPage.tsx` | 512 | Page |
| `src/services/inventory/inventoryAlerts.ts` | 507 | Service |
| `src/pages/settings/CompanySettingsPage.tsx` | 502 | Page |
| `src/pages/purchasing/SuppliersPage.tsx` | 493 | Page |
| `src/services/products/productImportExport.ts` | 476 | Service |
| `src/services/sync/syncQueueHelpers.ts` | 478 | Service |
| `src/pages/settings/LanMonitoringPage.tsx` | 471 | Page |

**Total : 45+ fichiers non-test depassant 300 lignes.**

- **Gravite** : Majeur
- **Recommandation** :
  - `CustomerSearchModal.tsx` (1,069 lignes) : Extraire la logique de recherche dans un hook, decomposer en sous-composants (SearchForm, ResultsList, CustomerCard).
  - `types/offline.ts` (1,791 lignes) : Scinder en sous-fichiers par domaine (auth, sync, settings, products, orders, payments, sessions, dispatch).
  - Pages > 700 lignes : Extraire les sections formulaire en composants, la logique metier en hooks custom.
  - `settingsStore.ts` (690 lignes) : Contient de la logique de mutation Supabase directe - devrait etre dans un service.
  - `authService.ts` (788 lignes) : Decomposer en sous-modules (session, device, permissions).

---

### 2.4 Duplication de Hooks

#### DUP-01 : useNetworkStatus existe en double

- **Gravite** : Majeur
- **Fichier(s)** :
  - `C:\Users\MamatCEO\App\AppGrav\src\hooks\useNetworkStatus.ts` (version complete avec LAN, utilise networkStore)
  - `C:\Users\MamatCEO\App\AppGrav\src\hooks\offline\useNetworkStatus.ts` (version simplifiee, standalone)
- **Description** : Deux hooks avec le meme nom mais des implementations differentes. La version racine est plus complete et utilise le store Zustand. La version `offline/` est standalone. Les deux sont documentes et semblent intentionnels, mais cela cree de la confusion. Le barrel export `hooks/index.ts` exporte la version racine.
- **Recommandation** : Fusionner en un seul hook avec un parametre `{ simplified: boolean }` ou renommer clairement (ex: `useNetworkMode` vs `useOnlineStatus`).

#### DUP-02 : usePermissions et usePermissionsUnified

- **Gravite** : Mineur
- **Fichier(s)** :
  - `C:\Users\MamatCEO\App\AppGrav\src\hooks\usePermissions.ts`
  - `C:\Users\MamatCEO\App\AppGrav\src\hooks\usePermissionsUnified.ts`
- **Description** : Deux hooks de permissions, `usePermissionsUnified` etend `usePermissions` avec le support offline. Les deux sont exportes dans le barrel. Le code client doit savoir lequel utiliser.
- **Recommandation** : Faire de `usePermissionsUnified` le hook par defaut et deprecier `usePermissions`, ou fusionner.

---

## 3. Patterns d'Architecture

### 3.1 Violations de la Separation des Couches

#### LAYER-01 : Appels Supabase directs dans 25 pages

- **Gravite** : Majeur
- **Fichier(s)** : 25 fichiers dans `src/pages/` (voir liste complete en section 2)
- **Description** : Le pattern du projet est `Component -> Hook (useQuery) -> Service -> Supabase`. Or, 25 pages font des appels `supabase.from()`, `supabase.rpc()`, ou `supabase.storage` directement, sans passer par un hook ou service. Exemples majeurs :
  - `PermissionsPage.tsx` : 3 appels directs (roles, permissions, role_permissions)
  - `PromotionFormPage.tsx` : 4 appels directs (insert/delete promotions)
  - `PurchaseOrderDetailPage.tsx` : 3 appels directs (history, returns)
  - `ProductDetailPage.tsx` : 2 appels directs (categories, product_uoms)
  - `ProductFormPage.tsx` : 2 appels directs (storage upload)
  - `CustomerDetailPage.tsx` : 2 appels directs (rpc add/redeem loyalty)
  - Tous les report tabs : appels directs pour les donnees de detail/drill-down
- **Impact** : Pas de centralisation du cache, pas de support offline, logique de requete melangee a la presentation.
- **Recommandation** : Creer des hooks dedies (ex: `usePermissionsAdmin`, `usePromotionMutations`, `usePurchaseOrderHistory`) et y encapsuler les appels Supabase.

#### LAYER-02 : Appel Supabase direct dans un composant UI

- **Gravite** : Majeur
- **Fichier(s)** : `C:\Users\MamatCEO\App\AppGrav\src\components\pos\modals\PinVerificationModal.tsx`
- **Description** : Ce composant modal fait un `supabase.rpc('verify_user_pin', ...)` directement. Un composant UI de modal ne devrait jamais faire d'appel reseau directement.
- **Recommandation** : Deplacer la verification PIN dans `authService.ts` ou creer un hook `usePinVerification`.

#### LAYER-03 : settingsStore contient de la logique d'acces donnees

- **Gravite** : Majeur
- **Fichier(s)** : `C:\Users\MamatCEO\App\AppGrav\src\stores\settingsStore.ts` (lignes 329-416)
- **Description** : Le store Zustand fait des appels `supabase.rpc()` directs pour `update_setting`, `update_settings_bulk`, `reset_setting`, `reset_category_settings`. Selon le pattern du projet, les stores devraient gerer l'etat et les services devraient gerer l'acces aux donnees.
- **Recommandation** : Extraire les mutations dans un `settingsService.ts` et appeler le service depuis le store.

---

### 3.2 Couplage Services <-> Stores

#### COUPLING-01 : Services importent des Stores (bi-directionnel)

- **Gravite** : Majeur
- **Fichier(s)** : 14 fichiers service importent depuis `@/stores/`
  - `services/sync/orderSync.ts` -> `cartStore`, `orderStore`
  - `services/pos/promotionEngine.ts` -> `cartStore`
  - `services/offline/cartPersistenceService.ts` -> `cartStore`
  - `services/offline/offlineOrderService.ts` -> `cartStore`
  - `services/offline/kitchenDispatchService.ts` -> `settingsStore`
  - `services/display/displayBroadcast.ts` -> `cartStore`, `lanStore`
  - `services/b2b/b2bPosOrderService.ts` -> `cartStore`
  - `services/lan/lanHub.ts` -> `lanStore`
  - `services/lan/lanClient.ts` -> `lanStore`
- **Description** : Le pattern correct est : `Component -> Hook -> Service` (unidirectionnel). Quand les services importent depuis les stores, on cree un couplage bidirectionnel. En particulier, `cartStore` importe `cartPersistenceService`, qui importe `cartStore` (types) -- dependency circulaire (meme si elle ne concerne que les types, c'est un signal de mauvaise architecture).
- **Recommandation** :
  1. Extraire les types partages (`CartItem`, `CartModifier`, `ComboSelectedItem`, etc.) dans `types/cart.ts` au lieu de les exporter depuis le store.
  2. Les services qui ont besoin de lire l'etat du store devraient recevoir les donnees en parametre plutot que d'acceder au store directement.
  3. Seuls les hooks devraient acceder aux stores.

---

### 3.3 Inconsistance dans les Patterns de Styling

#### STYLE-01 : Mix CSS personnalise et Tailwind CSS

- **Gravite** : Mineur
- **Fichier(s)** : 83 fichiers `.css` dans `src/`
- **Description** : Le projet utilise Tailwind CSS + shadcn/ui mais contient aussi 83 fichiers CSS personnalises co-localises avec les composants. Cela cree une inconsistance : certains composants utilisent Tailwind, d'autres du CSS module-like, parfois les deux dans le meme composant.
- **Recommandation** : Migrer progressivement les fichiers CSS vers du Tailwind inline. Garder le CSS custom uniquement pour les animations complexes ou les overrides impossibles en Tailwind.

---

### 3.4 Pattern de Routing et App.tsx

#### ROUTE-01 : App.tsx trop volumineux (390 lignes)

- **Gravite** : Mineur
- **Fichier(s)** : `C:\Users\MamatCEO\App\AppGrav\src\App.tsx`
- **Description** : Le fichier contient 117 imports lazy, la logique d'initialisation (sync engine, products cache, cart persistence), et toutes les routes. Bien que le lazy loading soit correctement implemente, le fichier depasse la convention de 300 lignes.
- **Recommandation** : Extraire les routes dans un fichier `router.tsx` ou `routes/index.tsx`, et la logique d'initialisation dans un hook `useAppInitialization`.

#### ROUTE-02 : Chaine francaise residuelle dans App.tsx

- **Gravite** : Mineur
- **Fichier(s)** : `C:\Users\MamatCEO\App\AppGrav\src\App.tsx` (ligne 131)
- **Description** : `toast.success('Session mise a jour pour compatibilite base de donnees. Veuillez vous reconnecter.')` - Message en francais alors que le projet est passe en English-only.
- **Recommandation** : Traduire en anglais.

---

### 3.5 Absence de Protection par Garde d'Authentification

#### AUTH-01 : Pas de PermissionGuard sur toutes les routes admin

- **Gravite** : Majeur
- **Fichier(s)** : `C:\Users\MamatCEO\App\AppGrav\src\App.tsx`
- **Description** : Les routes admin `/users`, `/settings/roles`, `/settings/audit` n'ont qu'une verification `isAuthenticated` mais pas de verification de permissions. Le composant `PermissionGuard` existe dans `components/auth/` mais n'est pas utilise dans le routeur.
- **Recommandation** : Ajouter des gardes de permission sur les routes sensibles :
  ```tsx
  <Route path="/users" element={<PermissionGuard permission="users.view"><UsersPage /></PermissionGuard>} />
  ```

---

## 4. Gestion des Types TypeScript

### 4.1 Utilisation de `any`

#### TYPE-01 : 154 occurrences de `any` dans le codebase

- **Gravite** : Majeur
- **Fichier(s)** : 56 fichiers au total
- **Description** : Le codebase contient :
  - **94 `as any`** dans 31 fichiers (cast forcement non-type-safe)
  - **60 `: any`** dans 25 fichiers (parametres/variables non types)
  - Les pires offenders :
    - `src/pages/inventory/tabs/GeneralTab.tsx` : 11 `as any`
    - `src/services/sync/syncDeviceService.ts` : 9 `as any` + 9 `eslint-disable`
    - `src/services/lan/lanProtocol.ts` : 9 `as any` + 9 `eslint-disable`
    - `src/hooks/useTerminal.ts` : 7 `as any` + 6 `eslint-disable`
    - `src/services/b2b/__tests__/arService.test.ts` : 7 `: any`
- **Recommandation** :
  1. Les `as any` de `GeneralTab.tsx` doivent etre corriges avec des types corrects pour les handlers de formulaire.
  2. `syncDeviceService.ts` et `lanProtocol.ts` ont besoin d'interfaces pour les messages LAN.
  3. Fixer l'objectif ESLint a `--max-warnings 100` puis reduire progressivement.

### 4.2 Types Volumineux et Mal Organises

#### TYPE-02 : `offline.ts` est un monolithe de 1,791 lignes

- **Gravite** : Majeur
- **Fichier(s)** : `C:\Users\MamatCEO\App\AppGrav\src\types\offline.ts`
- **Description** : Ce fichier contient TOUS les types offline : auth, sync queue, settings cache, products, categories, modifiers, recipes, orders, payments, sessions, dispatch, stock levels, customers, promotions, reports, plus les types legacy. 1,791 lignes dans un seul fichier type est excessif.
- **Recommandation** : Scinder en :
  - `types/offline/auth.ts` - IOfflineUser, IOfflineRateLimit
  - `types/offline/sync.ts` - ISyncQueueItem, ISyncMeta, legacy
  - `types/offline/cache.ts` - IOfflineProduct, IOfflineCategory, IOfflineModifier, etc.
  - `types/offline/orders.ts` - IOfflineOrder, IOfflinePayment, IOfflineSession
  - `types/offline/index.ts` - Re-exports

#### TYPE-03 : Types dupliques entre `auth.ts` et `database.ts`

- **Gravite** : Mineur
- **Fichier(s)** :
  - `C:\Users\MamatCEO\App\AppGrav\src\types\auth.ts`
  - `C:\Users\MamatCEO\App\AppGrav\src\types\database.ts`
- **Description** : `auth.ts` definit manuellement `Role`, `Permission`, `RolePermission` avec des champs `name_fr`, `name_en`, `name_id`, alors que `database.ts` re-exporte les types generes automatiquement depuis `database.generated.ts`. Les types manuels de `auth.ts` pourraient diverger des types generes.
- **Recommandation** : Verifier si les types dans `auth.ts` correspondent toujours au schema DB et les aligner avec les types generes. Idealement, re-utiliser `Tables<'roles'>` au lieu de definir manuellement.

#### TYPE-04 : Convention de nommage inconsistante

- **Gravite** : Mineur
- **Fichier(s)** : Plusieurs fichiers dans `src/types/`
- **Description** : Le projet definit des conventions I-prefix pour interfaces et T-prefix pour types. C'est bien respecte dans `offline.ts` et `payment.ts`, mais `auth.ts` et `reporting.ts` n'utilisent pas ces prefixes (`Role` au lieu de `IRole`, `SalesComparison` au lieu de `ISalesComparison`). `database.ts` utilise des types simples sans prefixe (`Product`, `Order`).
- **Recommandation** : Les types re-exportes depuis Supabase (database.ts) peuvent rester sans prefixe car ils refletent le schema DB. Mais les types custom dans `auth.ts` et `reporting.ts` devraient suivre la convention I/T.

---

### 4.3 Fichier `db.ts` (Dexie) Volumineux

#### TYPE-05 : db.ts a 646 lignes avec schema et migration Dexie

- **Gravite** : Mineur
- **Fichier(s)** : `C:\Users\MamatCEO\App\AppGrav\src\lib\db.ts`
- **Description** : Le fichier Dexie contient la definition de la classe, toutes les tables (30+), et 8 versions de schema migration dans un seul fichier.
- **Recommandation** : Extraire les migrations Dexie dans un fichier separe `lib/dbMigrations.ts`.

---

## 5. Configuration et Build

### 5.1 Dependances package.json

#### DEP-01 : Dependances potentiellement inutilisees

- **Gravite** : Mineur
- **Fichier(s)** : `C:\Users\MamatCEO\App\AppGrav\package.json`
- **Description** : Plusieurs dependances ne sont pas importees (ou tres peu) dans le codebase :

  | Dependance | Utilisation trouvee |
  |------------|-------------------|
  | `@anthropic-ai/sdk` | **0 imports** dans `src/` - completement inutilise |
  | `@capacitor/barcode-scanner` | **0 imports** dans `src/` |
  | `@capacitor/preferences` | **0 imports** dans `src/` |
  | `csv-parse` | **0 imports** dans `src/` |
  | `dotenv` | **0 imports** dans `src/` (cote serveur uniquement?) |
  | `next-themes` | 1 import dans `sonner.tsx` (composant UI shadcn) |
  | `workbox-window` | **0 imports** dans `src/` (utilise par vite-plugin-pwa en interne) |
  | `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` | 1 fichier (`CategoriesPage.tsx`) |

- **Recommandation** :
  - Supprimer `@anthropic-ai/sdk` (le projet utilise l'Edge Function `claude-proxy` a la place)
  - Supprimer `@capacitor/barcode-scanner` (le projet utilise `@capacitor-mlkit/barcode-scanning`)
  - Supprimer `csv-parse` si non utilise
  - Deplacer `dotenv` en devDependencies si utilise uniquement dans les scripts
  - Verifier `@capacitor/preferences` et `workbox-window`

#### DEP-02 : Dependances ESLint heterogenes

- **Gravite** : Mineur
- **Fichier(s)** : `C:\Users\MamatCEO\App\AppGrav\package.json`
- **Description** : Le projet a DEUX versions de typescript-eslint :
  - `@typescript-eslint/eslint-plugin`: `^6.14.0` (legacy)
  - `@typescript-eslint/parser`: `^6.14.0` (legacy)
  - `typescript-eslint`: `^8.54.0` (nouveau, utilise dans `eslint.config.js`)

  La config flat (`eslint.config.js`) utilise `typescript-eslint` v8, rendant les packages v6 inutiles. De meme, `eslint-plugin-react-hooks` v4 et `eslint-plugin-react-refresh` ne semblent pas utilises dans la config flat.
- **Recommandation** : Supprimer `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-plugin-react-hooks`, et `eslint-plugin-react-refresh` du `devDependencies`.

---

### 5.2 Configuration Vite

#### VITE-01 : Conflit `drop` et `pure` pour console dans esbuild

- **Gravite** : Mineur
- **Fichier(s)** : `C:\Users\MamatCEO\App\AppGrav\vite.config.ts` (lignes 143-144)
- **Description** : La config utilise a la fois `drop: ['console', 'debugger']` ET `pure: ['console.log', 'console.debug', 'console.info']` en production. `drop: ['console']` supprime deja TOUS les appels console (y compris `console.warn` et `console.error`), rendant `pure` redondant. De plus, supprimer `console.error` et `console.warn` en production rend le debugging impossible.
- **Recommandation** : Retirer `drop: ['console']` et garder uniquement `pure: ['console.log', 'console.debug', 'console.info']` pour preserver `console.warn` et `console.error`.

#### VITE-02 : Fallback offline non existant

- **Gravite** : Mineur
- **Fichier(s)** : `C:\Users\MamatCEO\App\AppGrav\vite.config.ts` (ligne 122)
- **Description** : `navigateFallback: '/offline.html'` est configure mais le fichier `public/offline.html` n'existe probablement pas (non verifie mais la convention PWA le necessite).
- **Recommandation** : Verifier l'existence de `public/offline.html` et le creer si absent.

---

### 5.3 Configuration TypeScript

#### TS-01 : `noUnusedLocals` et `noUnusedParameters` avec max-warnings 150

- **Gravite** : Mineur
- **Fichier(s)** : `C:\Users\MamatCEO\App\AppGrav\tsconfig.json`
- **Description** : TypeScript est configure avec `noUnusedLocals: true` et `noUnusedParameters: true` (strict), mais ESLint `max-warnings` est a 150, indiquant que de nombreux warnings ne sont pas resolus. Le MEMORY.md mentionne "145 pre-existing warnings".
- **Recommandation** : Planifier un sprint de nettoyage pour reduire les warnings a < 50, puis abaisser `--max-warnings`.

---

### 5.4 Configuration Capacitor

#### CAP-01 : Reference a keystore dans capacitor.config.ts

- **Gravite** : Mineur
- **Fichier(s)** : `C:\Users\MamatCEO\App\AppGrav\capacitor.config.ts` (lignes 21-24)
- **Description** : La config reference `release-key.keystore` avec l'alias `breakery`. Ce fichier keystore ne devrait JAMAIS etre dans le repo. Verifier que le `.gitignore` l'exclut.
- **Recommandation** : Ajouter `*.keystore` au `.gitignore` si ce n'est pas deja fait.

---

### 5.5 Console.log en Production

#### LOG-01 : 167 console.log/debug/info dans le code source

- **Gravite** : Majeur
- **Fichier(s)** : 40 fichiers (les pires : `syncEngine.ts` 24, `productsCacheInit.ts` 19, `lanClient.ts` 9)
- **Description** : Malgre l'existence d'un logger utilitaire (`utils/logger.ts`), le codebase utilise `console.log` direct dans 40 fichiers. Bien que Vite les supprime en prod build (via esbuild `drop`), cela indique que le logger n'est pas adopte uniformement.
- **Recommandation** : Remplacer tous les `console.log/debug/info` par les fonctions du logger (`logDebug`, `logInfo`). Ajouter une regle ESLint `no-console` avec exceptions pour `warn` et `error`.

---

### 5.6 Chaines en Francais Residuelles

#### I18N-01 : 27 chaines en francais dans 16 fichiers source

- **Gravite** : Mineur
- **Fichier(s)** : Principalement dans :
  - `src/services/anthropicService.ts` ("Authentification requise")
  - `src/pages/b2b/` (messages d'erreur)
  - `src/pages/customers/` (labels)
  - `src/App.tsx` (toast message)
- **Description** : Bien que i18n soit suspendu et le projet en English-only, 27 chaines francaises subsistent dans le code.
- **Recommandation** : Migrer toutes les chaines vers l'anglais dans un sprint de nettoyage.

---

## 6. Tableau Recapitulatif

| # | ID | Gravite | Categorie | Description Courte |
|---|----|---------|-----------|--------------------|
| 1 | SEC-01 | **CRITIQUE** | Securite | `.env.docker` commite avec `SUPABASE_SERVICE_KEY` |
| 2 | SEC-02 | **CRITIQUE** | Securite | `console.log(import.meta.env)` dans `supabase.ts` |
| 3 | LAYER-01 | Majeur | Architecture | 25 pages avec appels Supabase directs |
| 4 | LAYER-02 | Majeur | Architecture | Appel Supabase dans PinVerificationModal |
| 5 | LAYER-03 | Majeur | Architecture | settingsStore contient logique d'acces donnees |
| 6 | COUPLING-01 | Majeur | Architecture | 14 services importent depuis stores (couplage bi-directionnel) |
| 7 | AUTH-01 | Majeur | Securite | Routes admin sans PermissionGuard |
| 8 | TYPE-01 | Majeur | Types | 154 occurrences de `any` (56 fichiers) |
| 9 | TYPE-02 | Majeur | Types | `offline.ts` monolithe de 1,791 lignes |
| 10 | FILES-01 | Majeur | Structure | 45+ fichiers > 300 lignes (convention violee) |
| 11 | LOG-01 | Majeur | Qualite | 167 console.log dans 40 fichiers |
| 12 | DUP-01 | Majeur | Structure | useNetworkStatus duplique (2 versions) |
| 13 | DEP-01 | Majeur | Config | 6+ dependances npm inutilisees |
| 14 | DEP-02 | Mineur | Config | Packages ESLint v6 obsoletes (utilise v8) |
| 15 | ORPHAN-01 | Mineur | Code mort | ClaudeService + anthropicService non utilises |
| 16 | ORPHAN-02 | Mineur | Code mort | mockProducts.ts 2,693 lignes rarement utilise |
| 17 | ORPHAN-03 | Mineur | Code mort | database.backup.ts non reference |
| 18 | ORPHAN-04 | Mineur | Structure | Fichiers parasites a la racine (nul, roadmap mal nomme) |
| 19 | STYLE-01 | Mineur | Architecture | 83 fichiers CSS custom + Tailwind (inconsistant) |
| 20 | ROUTE-01 | Mineur | Architecture | App.tsx 390 lignes (routes + init) |
| 21 | ROUTE-02 | Mineur | I18N | Chaine francaise dans App.tsx |
| 22 | I18N-01 | Mineur | I18N | 27 chaines francaises dans 16 fichiers |
| 23 | DUP-02 | Mineur | Structure | usePermissions et usePermissionsUnified |
| 24 | TYPE-03 | Mineur | Types | Types auth.ts dupliques vs database generated |
| 25 | TYPE-04 | Mineur | Types | Convention I/T-prefix inconsistante |
| 26 | TYPE-05 | Mineur | Types | db.ts 646 lignes (schema + migrations Dexie) |
| 27 | VITE-01 | Mineur | Config | drop + pure console redondant/conflictuel |
| 28 | VITE-02 | Mineur | Config | offline.html possiblement manquant |
| 29 | TS-01 | Mineur | Config | 145+ warnings ESLint non resolus |
| 30 | CAP-01 | Mineur | Config | Keystore reference dans capacitor.config |

---

## Priorites de Remediation Recommandees

### Sprint 1 - Urgence Securite (Immediat)
1. **SEC-01** : Revoquer les cles, ajouter `.env.docker` au `.gitignore`, nettoyer l'historique Git
2. **SEC-02** : Supprimer le `console.log` de debug dans `supabase.ts`
3. **AUTH-01** : Ajouter PermissionGuard sur les routes admin

### Sprint 2 - Architecture (1-2 semaines)
4. **COUPLING-01** : Extraire `CartItem` et types associes dans `types/cart.ts`
5. **LAYER-03** : Extraire les mutations de `settingsStore` dans un service
6. **TYPE-02** : Scinder `offline.ts` en sous-modules
7. **DEP-01** : Nettoyer les dependances inutilisees

### Sprint 3 - Qualite Code (2-4 semaines)
8. **LAYER-01** : Migrer les appels Supabase des pages vers des hooks (25 fichiers)
9. **TYPE-01** : Reduire les `any` (viser < 30 occurrences)
10. **LOG-01** : Remplacer `console.log` par le logger
11. **FILES-01** : Refactorer les 10 plus gros fichiers (> 700 lignes)

### Sprint 4 - Nettoyage (Ongoing)
12. **I18N-01** + **ROUTE-02** : Nettoyer les chaines francaises
13. **ORPHAN-***: Supprimer le code mort
14. **STYLE-01** : Migration progressive CSS -> Tailwind
