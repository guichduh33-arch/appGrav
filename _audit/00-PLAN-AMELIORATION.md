# AppGrav -- Plan d'Amelioration pour Mise en Production

**Date**: 2026-02-10
**Version**: 1.0
**Base**: Audit exhaustif par 5 agents specialises

---

## RESUME EXECUTIF

### Statistiques Globales

| Categorie | Critique | Majeur | Mineur | Total |
|-----------|----------|--------|--------|-------|
| Securite | 12 | 10 | 4 | 26 |
| Base de Donnees | 3 | 8 | 10 | 21 |
| Architecture | 0 | 8 | 10 | 18 |
| Frontend / Logique | 3 | 12 | 18 | 33 |
| UI/UX | 3 | 14 | 12 | 29 |
| Tests / Qualite | 0 | 8 | 8 | 16 |
| **TOTAL (deduplique)** | **~21** | **~60** | **~62** | **~143** |

### Top 10 Problemes les Plus Critiques

| # | ID | Description | Impact |
|---|-----|-------------|--------|
| 1 | SEC-001 | `.env.docker` commite avec `SUPABASE_SERVICE_KEY` | Acces complet DB pour quiconque a le repo |
| 2 | SEC-002 | PINs stockes en clair (`pin_code`) + exposes au frontend | Compromission de tous les comptes utilisateurs |
| 3 | SEC-003 | `console.log(import.meta.env)` dans supabase.ts | Fuite de variables d'environnement |
| 4 | DB-001 | Regression RLS massive -- TOUTES les tables en `USING(TRUE)` | Aucune securite au niveau donnees |
| 5 | DB-002 | Policies `anon` INSERT sur products/categories/user_profiles | Insertion sans authentification |
| 6 | SEC-004 | Edge Functions sans authentification (5 fonctions) | Acces non autorise aux fonctions critiques |
| 7 | SEC-005 | Header `x-user-id` spoofable pour escalade de privileges | Usurpation d'identite admin |
| 8 | SEC-006 | Print server CORS `*` + pas d'authentification | Ouverture de caisse a distance |
| 9 | DB-003 | Tables `order_payments` et 8 vues reporting supprimees | Split payment et rapports casses |
| 10 | FE-001 | Devise EUR au lieu de IDR dans StockByLocationPage | Donnees financieres fausses |

### Estimation Globale

- **Temps estime avant production** : 8-10 semaines (5 sprints)
- **Risque principal** : La securite est gravement compromise (RLS annule, PIN en clair, secrets exposes)
- **Point positif** : Architecture offline-first solide, bonne structure modulaire, 80+ fichiers de tests

---

## PLAN D'ACTION STRUCTURE

### Convention des IDs

- `SEC-xxx` : Securite
- `DB-xxx` : Base de donnees / Backend
- `FE-xxx` : Frontend / Logique metier
- `UI-xxx` : Interface utilisateur / UX
- `ARCH-xxx` : Architecture / Structure
- `TEST-xxx` : Tests / Qualite

### Convention de Priorite

- **P0** : Bloquant production -- a corriger IMMEDIATEMENT
- **P1** : Critique -- a corriger avant tout deploiement
- **P2** : Important -- a corriger dans les 2 premieres semaines
- **P3** : Nice-to-have -- amelioration continue

### Convention d'Effort

- **XS** : < 1 heure
- **S** : 1-4 heures
- **M** : 4-8 heures (1 jour)
- **L** : 1-3 jours
- **XL** : > 3 jours

---

## SPRINT 0 -- URGENCE SECURITE (Semaine 1-2)

> Objectif : Eliminer toutes les failles de securite critiques. RIEN ne doit etre deploye avant la completion de ce sprint.

### Securite Critique

| ID | Priorite | Effort | Description | Fichiers Impactes | Dependances |
|----|----------|--------|-------------|-------------------|-------------|
| SEC-001 | P0 | S | Revoquer TOUTES les cles Supabase (service_role, anon), ajouter `.env.docker` au `.gitignore`, nettoyer l'historique Git avec BFG Repo-Cleaner | `.gitignore`, `.env.docker` | Aucune |
| SEC-002 | P0 | M | Supprimer le stockage PIN en clair : (1) supprimer `pin_code = p_pin` dans `set_user_pin()`, (2) supprimer le fallback plaintext dans `verify_user_pin()`, (3) migration DROP COLUMN `pin_code`, (4) retirer `pin_code` du SELECT dans LoginPage | `supabase/functions/auth-user-management/index.ts`, `src/pages/auth/LoginPage.tsx`, nouvelle migration SQL | SEC-001 (rotation des cles) |
| SEC-003 | P0 | XS | Supprimer le `console.log('ENV DEBUG:...')` dans supabase.ts | `src/lib/supabase.ts` | Aucune |
| SEC-004 | P0 | XS | Supprimer la declaration `VITE_ANTHROPIC_API_KEY` de vite-env.d.ts. Verifier que `.env` ne contient pas cette variable | `src/vite-env.d.ts`, `.env` | Aucune |
| SEC-005 | P0 | M | Remplacer l'authentification par header `x-user-id` par verification JWT dans TOUTES les Edge Functions : `auth-user-management`, `auth-change-pin`, `auth-logout`, `auth-verify-pin` | `supabase/functions/auth-*/index.ts` | Aucune |
| SEC-006 | P0 | S | Ajouter authentification JWT a `claude-proxy`, `generate-invoice`, `send-to-printer`, `calculate-daily-report`, `send-test-email` | `supabase/functions/*/index.ts` | Aucune |
| SEC-007 | P0 | S | Corriger le CORS du print server : utiliser `process.env.CORS_ORIGIN` au lieu de `*`. Ajouter authentification par API key | `print-server/src/index.js` | Aucune |
| SEC-008 | P0 | S | Supprimer les policies `anon` INSERT sur `categories`, `products`, `product_sections`. Restreindre la policy SELECT `public` sur `user_profiles` | Nouvelle migration SQL | Aucune |

### RLS et Securite DB

| ID | Priorite | Effort | Description | Fichiers Impactes | Dependances |
|----|----------|--------|-------------|-------------------|-------------|
| DB-001 | P0 | XL | Reimplementer les policies RLS permission-based pour les tables critiques : `user_profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`, `user_permissions`, `settings`, `audit_logs`, `orders`, `pos_sessions` | Nouvelle migration SQL | SEC-001 |
| DB-002 | P0 | S | Corriger les policies `purchase_order_items` de `TO public` a `TO authenticated` | Nouvelle migration SQL | Aucune |
| SEC-009 | P1 | S | Corriger les fallbacks CORS wildcard dans les Edge Functions -- toujours passer `req` a `errorResponse()`/`jsonResponse()` | `supabase/functions/_shared/cors.ts`, toutes les Edge Functions | Aucune |
| SEC-010 | P1 | S | Basculer la persistance auth de `localStorage` a `sessionStorage` pour eviter la persistence sur PC partages | `src/stores/authStore.ts` | Aucune |
| SEC-011 | P1 | S | Masquer les stack traces en production dans ErrorBoundary (afficher uniquement en `import.meta.env.DEV`) | `src/components/ui/ErrorBoundary.tsx` | Aucune |
| SEC-012 | P1 | S | Ajouter validation d'input (Zod/Joi) sur les endpoints du print server | `print-server/src/routes/print.js` | Aucune |

### Bugs Bloquants

| ID | Priorite | Effort | Description | Fichiers Impactes | Dependances |
|----|----------|--------|-------------|-------------------|-------------|
| FE-001 | P0 | XS | Corriger la devise EUR -> IDR dans StockByLocationPage + arrondi correct (pas de decimales) | `src/pages/inventory/StockByLocationPage.tsx` | Aucune |
| DB-003 | P0 | L | Recreer la table `order_payments` pour le split payment. Recreer les 8 vues reporting supprimees (`view_profit_loss`, `view_sales_by_customer`, `view_sales_by_hour`, `view_session_cash_balance`, `view_b2b_receivables`, `view_stock_warning`, `view_expired_stock`, `view_unsold_products`) | Nouvelle migration SQL | Aucune |
| DB-004 | P1 | M | Corriger `close_shift()` : remplacer `WHERE status = 'completed'` par `WHERE payment_status = 'paid'`. Corriger aussi `view_daily_kpis` | Nouvelle migration SQL | Aucune |
| DB-005 | P1 | S | Resoudre le conflit des 2 triggers de stock : choisir UN systeme maitre entre `update_product_stock()` (stock_movements) et `sync_product_total_stock()` (section_stock) | Nouvelle migration SQL | Aucune |
| FE-002 | P1 | XS | Corriger `clearCart()` pour verifier les locked items et exiger le PIN manager avant de vider | `src/stores/cartStore.ts` | Aucune |

**Total Sprint 0 : ~20 items, ~2 semaines**

---

## SPRINT 1 -- INTEGRITE DES DONNEES (Semaine 3)

> Objectif : Assurer l'integrite de la base de donnees, corriger les triggers, aligner les types.

| ID | Priorite | Effort | Description | Fichiers Impactes | Dependances |
|----|----------|--------|-------------|-------------------|-------------|
| DB-006 | P1 | M | Corriger `finalize_inventory_count()` : supprimer l'UPDATE direct de `products.current_stock` et laisser le trigger `update_product_stock()` gerer | Nouvelle migration SQL | DB-005 |
| DB-007 | P1 | S | Standardiser les quantites dans `stock_movements` : toujours positives, direction par `movement_type`. Corriger `deduct_stock_on_sale_items()` | Nouvelle migration SQL | Aucune |
| DB-008 | P1 | S | Corriger `open_shift()` : utiliser `auth.uid()` au lieu du `p_user_id` client. Supprimer la generation `RANDOM()` du session_number et laisser le trigger `generate_session_number()` | Nouvelle migration SQL | Aucune |
| DB-009 | P1 | S | Creer la RPC `hash_pin()` ou corriger `auth-change-pin` pour utiliser `set_user_pin()` | Nouvelle migration SQL ou Edge Function | SEC-002 |
| DB-010 | P2 | S | Ajouter `voided` a l'enum `order_status` ou creer un champ booleen `is_voided` | Nouvelle migration SQL | DB-003 |
| DB-011 | P2 | S | Changer `order_items.quantity` de INTEGER a `DECIMAL(10,3)` pour supporter les ventes fractionnaires | Nouvelle migration SQL | Aucune |
| DB-012 | P2 | S | Ajouter les index manquants : `orders.customer_id`, `orders.staff_id`, `loyalty_transactions.customer_id`, `b2b_order_items.order_id`, `inventory_count_items.count_id` | Nouvelle migration SQL | Aucune |
| DB-013 | P2 | S | Consolider `session_id` / `pos_session_id` dans `orders` en une seule colonne FK | Nouvelle migration SQL | Aucune |
| DB-014 | P2 | S | Corriger les Edge Functions `intersection_stock_movements` (references `section_items` inexistant -> `section_stock`) et `purchase_order_module` (insere dans `po_items` supprime -> `purchase_order_items`) | `supabase/functions/intersection_stock_movements/index.ts`, `supabase/functions/purchase_order_module/index.ts` | Aucune |
| ARCH-001 | P2 | M | Regenerer les types TypeScript Supabase et aligner `src/types/database.ts` avec le schema reel. Corriger `PromotionType` (frontend != enum DB) | `src/types/database.ts`, `src/types/database.generated.ts` | Toutes les migrations DB |
| DB-015 | P3 | S | Migrer `app_settings` vers `settings` et supprimer la table legacy | Nouvelle migration SQL | Aucune |
| DB-016 | P3 | S | Supprimer la table legacy `product_combo_items` si non utilisee par le frontend | Nouvelle migration SQL | Aucune |

**Total Sprint 1 : ~12 items, ~1 semaine**

---

## SPRINT 2 -- FONCTIONNALITES INCOMPLETES (Semaine 4-5)

> Objectif : Completer les fonctionnalites manquantes et corriger les flux casses.

### Fonctionnalites Manquantes / Cassees

| ID | Priorite | Effort | Description | Fichiers Impactes | Dependances |
|----|----------|--------|-------------|-------------------|-------------|
| FE-003 | P1 | S | Implementer le handler `onClick` pour les boutons "Save" et "Cancel" dans l'onglet General de SettingsPage (les changements ne sont actuellement pas persistes) | `src/pages/settings/SettingsPage.tsx` | Aucune |
| FE-004 | P1 | M | Implementer `free_product` dans le promotionEngine (actuellement retourne `null`) | `src/services/pos/promotionEngine.ts` | Aucune |
| FE-005 | P1 | S | Corriger le backoff de la sync queue : utiliser `lastAttemptAt` au lieu de `createdAt` pour le calcul du delai | `src/services/sync/syncQueue.ts` | Aucune |
| FE-006 | P1 | S | Implementer la synchronisation des paiements (actuellement stub vide dans syncEngine) | `src/services/sync/syncEngine.ts` | Aucune |
| FE-007 | P1 | S | Corriger la generation des numeros B2B (`B2B-${Date.now()}` a risque de collision) -- utiliser `get_next_daily_sequence()` | `src/pages/b2b/B2BOrderFormPage.tsx` | Aucune |
| FE-008 | P2 | S | Corriger le ComboSelectorModal pour supporter le mode offline (actuellement appels Supabase directs) | `src/components/pos/modals/ComboSelectorModal.tsx` | Aucune |
| FE-009 | P2 | M | Completer les TODOs des transferts de stock : query actual stock levels au lieu de hardcoded 0 | `src/hooks/inventory/useInternalTransfers.ts` | Aucune |
| FE-010 | P2 | S | Ajouter un warning unsaved-changes dans StockOpnameForm | `src/pages/inventory/StockOpnameForm.tsx` | Aucune |
| FE-011 | P2 | S | Corriger le hard delete des sections -- ajouter verification de produits lies et soft delete | `src/pages/settings/SettingsPage.tsx` | Aucune |
| FE-012 | P2 | S | Supprimer le fallback demo login de LoginPage (ou isoler dans `/dev-login`) | `src/pages/auth/LoginPage.tsx` | SEC-002 |
| FE-013 | P2 | S | Ajouter PermissionGuard sur les routes admin (`/users`, `/settings/roles`, `/settings/audit`) | `src/App.tsx` | Aucune |

### Corrections B2B

| ID | Priorite | Effort | Description | Fichiers Impactes | Dependances |
|----|----------|--------|-------------|-------------------|-------------|
| FE-014 | P1 | S | Clarifier et documenter la logique taxe B2B (11% HT) vs POS (10% TTC). Si incorrect, corriger le calcul | `src/pages/b2b/B2BOrderFormPage.tsx`, `supabase/functions/` | Confirmation metier requise |
| DB-017 | P2 | XS | Corriger le taux de taxe affiche dans `send-to-printer` (11% -> 10%) | `supabase/functions/send-to-printer/index.ts` | FE-014 |

**Total Sprint 2 : ~13 items, ~2 semaines**

---

## SPRINT 3 -- NETTOYAGE LANGUE + UI/UX (Semaine 6-7)

> Objectif : Unifier l'interface, corriger la langue, ameliorer l'ergonomie POS.

### Nettoyage Langue (Batch)

| ID | Priorite | Effort | Description | Fichiers Impactes | Dependances |
|----|----------|--------|-------------|-------------------|-------------|
| UI-001 | P1 | L | Remplacer TOUS les textes francais par l'anglais dans les 50+ fichiers identifies. Inclut : labels, messages d'erreur, toasts, placeholders, titres d'export | 50+ fichiers (voir rapport 03 et 04) | Aucune |
| UI-002 | P1 | M | Remplacer TOUTES les occurrences de `'fr-FR'` par `'en-US'` ou `'id-ID'` dans les 31+ fichiers utilisant `toLocaleDateString('fr-FR')`. Creer une fonction utilitaire `formatDate()` partagee | 31+ fichiers, nouveau `src/utils/formatDate.ts` | Aucune |
| UI-003 | P2 | S | Remplacer les 37+ occurrences de `alert()` par `toast.success/error/warning()` (sonner) dans 15 fichiers | 15 fichiers (voir rapport 03) | Aucune |
| UI-004 | P2 | S | Remplacer les `confirm()` natifs par un composant AlertDialog shadcn/ui pour les actions destructives | Multiples fichiers | Aucune |

### Design System

| ID | Priorite | Effort | Description | Fichiers Impactes | Dependances |
|----|----------|--------|-------------|-------------------|-------------|
| UI-005 | P2 | XL | Unifier le systeme de boutons : migrer de `.btn-*` CSS vers `<Button variant="...">` shadcn/ui. Supprimer les definitions CSS dupliquees | `src/styles/index.css`, 90+ fichiers composants | Aucune |
| UI-006 | P2 | L | Migrer les tabs custom vers le composant shadcn `<Tabs>` pour InventoryLayout, ProductsLayout, SettingsLayout | Layouts + tous les onglets | Aucune |
| UI-007 | P2 | S | Renommer `Card.tsx` -> `card.tsx` et `Input.tsx` -> `input.tsx` pour la convention shadcn/ui lowercase | `src/components/ui/Card.tsx`, `Input.tsx`, tous les imports | Aucune |
| UI-008 | P2 | S | Supprimer les composants toast Radix inutilises, garder uniquement Sonner | `src/components/ui/toast.tsx`, `toaster.tsx` | Aucune |
| UI-009 | P2 | M | Unifier les systemes de theme : fusionner le theme artisan et le theme shadcn. Supprimer les 3 definitions dark mode (garder une seule) | `src/styles/index.css` | Aucune |
| UI-010 | P3 | L | Remplacer les couleurs Tailwind brutes (`bg-gray-*`, `text-blue-*`) par les tokens du design system (`bg-card`, `text-success`, etc.) | 100+ fichiers | UI-009 |

### Ergonomie POS

| ID | Priorite | Effort | Description | Fichiers Impactes | Dependances |
|----|----------|--------|-------------|-------------------|-------------|
| UI-011 | P2 | L | Rendre le POS responsive pour tablettes portrait : remplacer les largeurs fixes (200px + 460px) par des pourcentages ou `clamp()`. Ajouter media queries | `src/pages/pos/POSMainPage.css`, `Cart.css`, `ProductGrid.css`, `CategoryNav.css` | Aucune |
| UI-012 | P2 | M | Ajouter un bouton hamburger menu pour le back-office mobile/tablette + overlay toggle | `src/layouts/BackOfficeLayout.tsx`, `BackOfficeLayout.css` | Aucune |
| UI-013 | P2 | M | Ajouter des breadcrumbs aux pages avec navigation profonde (inventory detail, PO detail, customer detail, product edit) | Nouveau composant `Breadcrumb.tsx`, pages concernees | Aucune |
| UI-014 | P3 | M | Augmenter la taille des boutons tactiles < 44px (modal-close 32px, toggle-btn 32px, loyalty button avec fontSize 10px) | Multiples fichiers | Aucune |

**Total Sprint 3 : ~14 items, ~2 semaines**

---

## SPRINT 4 -- QUALITE & TESTS (Semaine 8)

> Objectif : Ajouter les tests critiques, ameliorer la gestion des erreurs, optimiser les performances.

### Tests Critiques

| ID | Priorite | Effort | Description | Fichiers Impactes | Dependances |
|----|----------|--------|-------------|-------------------|-------------|
| TEST-001 | P1 | L | Ecrire les tests du cartStore : addItem, removeItem, updateItem, calculateTotals, locked items, pricing, discounts, edge cases | Nouveau `src/stores/__tests__/cartStore.test.ts` | Aucune |
| TEST-002 | P1 | L | Ecrire les tests d'integration checkout : cart -> payment -> order creation -> stock deduction | Nouveau fichier de test integration | Aucune |
| TEST-003 | P1 | M | Ecrire les tests de promotionService : isPromotionValid, evaluatePromotions, calculatePromotionDiscount | Nouveau `src/services/__tests__/promotionService.test.ts` | Aucune |
| TEST-004 | P1 | L | Ecrire les tests d'authService : loginWithPin, logout, validateSession, changePin, CRUD utilisateurs | Nouveau `src/services/__tests__/authService.test.ts` | Aucune |
| TEST-005 | P2 | S | Corriger les 2 tests en echec dans `useOfflinePayment.test.ts` | `src/hooks/offline/__tests__/useOfflinePayment.test.ts` | Aucune |
| TEST-006 | P2 | S | Configurer le coverage reporting (installer `@vitest/coverage-v8`, definir seuils minimum 80% pour services/stores) | `package.json`, `vite.config.ts` | Aucune |

### Gestion d'Erreurs

| ID | Priorite | Effort | Description | Fichiers Impactes | Dependances |
|----|----------|--------|-------------|-------------------|-------------|
| ARCH-002 | P1 | M | Ajouter des ErrorBoundary autour de chaque route majeure (POS, KDS, Orders, Reports, Settings) et des modals critiques (payment, refund, void) | `src/App.tsx`, nouveaux wrappers | SEC-011 |
| ARCH-003 | P2 | S | Ajouter des notifications toast pour les echecs d'impression (actuellement silencieux) | `src/services/print/printService.ts` | Aucune |
| ARCH-004 | P2 | S | Exclure les endpoints auth du cache service worker PWA | `vite.config.ts` | Aucune |

### Performance

| ID | Priorite | Effort | Description | Fichiers Impactes | Dependances |
|----|----------|--------|-------------|-------------------|-------------|
| UI-015 | P2 | M | Ajouter `React.memo` aux composants de liste : CartItemRow, product cards, KDSOrderCard, KPI cards, NavLink | Multiples composants | Aucune |
| UI-016 | P2 | M | Installer `@tanstack/react-virtual` et implementer la virtualisation pour ProductGrid POS, OrdersPage, StockMovementsPage, AuditPage | `package.json`, pages concernees | Aucune |

**Total Sprint 4 : ~12 items, ~1 semaine**

---

## SPRINT 5 -- PRE-PRODUCTION (Semaine 9-10)

> Objectif : Finaliser pour la mise en production.

### Architecture & Nettoyage

| ID | Priorite | Effort | Description | Fichiers Impactes | Dependances |
|----|----------|--------|-------------|-------------------|-------------|
| ARCH-005 | P2 | L | Migrer les 25 pages avec appels Supabase directs vers des hooks dedies (top 10 en priorite) | 25 fichiers pages + nouveaux hooks | Aucune |
| ARCH-006 | P2 | M | Extraire les types cart (`CartItem`, `CartModifier`, `ComboSelectedItem`) de cartStore vers `types/cart.ts` pour casser la dependance circulaire services -> stores | `src/stores/cartStore.ts`, `src/types/cart.ts`, 14 services | Aucune |
| ARCH-007 | P2 | M | Extraire les mutations Supabase de settingsStore vers un settingsService | `src/stores/settingsStore.ts`, nouveau `src/services/settingsService.ts` | Aucune |
| ARCH-008 | P3 | M | Scinder `types/offline.ts` (1,791 lignes) en sous-modules | `src/types/offline.ts` -> `src/types/offline/*.ts` | Aucune |
| ARCH-009 | P3 | M | Refactorer les 5 plus gros fichiers (> 800 lignes) : CustomerSearchModal, B2BOrderDetailPage, UsersPage, PromotionFormPage, SettingsPage | Fichiers concernes | Aucune |
| ARCH-010 | P3 | S | Supprimer le code mort : ClaudeService, anthropicService, database.backup.ts, fichiers racine parasites (`nul`, roadmap mal nomme) | Fichiers concernes | Aucune |
| ARCH-011 | P3 | S | Supprimer les dependances npm inutilisees : `@anthropic-ai/sdk`, `@capacitor/barcode-scanner`, `csv-parse`, packages ESLint v6 legacy | `package.json` | Aucune |

### Optimisation Build

| ID | Priorite | Effort | Description | Fichiers Impactes | Dependances |
|----|----------|--------|-------------|-------------------|-------------|
| ARCH-012 | P2 | XS | Corriger vite.config.ts : retirer `drop: ['console']` et garder uniquement `pure: [...]` pour preserver console.warn/error en prod | `vite.config.ts` | Aucune |
| ARCH-013 | P2 | S | Remplacer les 167 `console.log` par le logger utilitaire (`src/utils/logger.ts`). Ajouter regle ESLint `no-console` | 40 fichiers | Aucune |
| ARCH-014 | P3 | S | Verifier/creer `public/offline.html` pour le fallback PWA offline | `public/offline.html`, `vite.config.ts` | Aucune |

### Tests E2E & Documentation

| ID | Priorite | Effort | Description | Fichiers Impactes | Dependances |
|----|----------|--------|-------------|-------------------|-------------|
| TEST-007 | P2 | L | Tests E2E du flux POS complet : login -> open shift -> select product -> checkout -> print -> close shift | Nouveaux fichiers de test | Tous les sprints |
| TEST-008 | P2 | M | Reduire les warnings ESLint de 148 a < 50 (focus `any` dans services et stores) | ~56 fichiers | Aucune |
| ARCH-015 | P3 | M | Mettre a jour la documentation : CLAUDE.md, CURRENT_STATE.md, DATABASE_SCHEMA.md | Fichiers .md | Tous les sprints |

**Total Sprint 5 : ~14 items, ~1-2 semaines**

---

## ITEMS NON INCLUS DANS LES SPRINTS (Backlog)

Ces items sont de priorite P3 et peuvent etre adresses en amelioration continue :

| ID | Description | Effort |
|----|-------------|--------|
| DB-018 | Migrer `audit_logs.severity` de VARCHAR vers l'enum `audit_severity` | XS |
| DB-019 | Deprecier les colonnes multilangues (`name_fr/en/id`) dans `roles` et `settings_categories` | S |
| DB-020 | Standardiser `transfer_items` : renommer `quantity` en `quantity_requested` | S |
| DB-021 | Ajouter SECURITY DEFINER a `get_next_daily_sequence()` | XS |
| DB-022 | Documenter les operations de rollback en commentaires dans les migrations critiques | M |
| UI-017 | Migrer progressivement les 80 fichiers CSS custom vers Tailwind | XL |
| UI-018 | Remplacer les emojis dans les empty states par des icones Lucide | S |
| UI-019 | Ajouter les ARIA labels et roles manquants (product grid, cart +/-, tabs) | M |
| UI-020 | Ajouter le skip-link pour l'accessibilite | XS |
| ARCH-016 | Fusionner les 2 hooks `useNetworkStatus` en un seul | S |
| ARCH-017 | Fusionner `usePermissions` et `usePermissionsUnified` | S |
| ARCH-018 | Ajouter Sentry ou equivalent pour le monitoring d'erreurs | M |
| ARCH-019 | Ajouter des request IDs aux Edge Functions pour la correlation frontend-backend | M |
| ARCH-020 | Etendre l'audit logging aux operations non-financieres (stock, prix, settings) | L |
| ARCH-021 | Desactiver le bypass localhost dans le CORS des Edge Functions en production | XS |
| FE-015 | Implementer le rachat de points fidelite dans le POS | L |
| FE-016 | Ajouter le module Expenses (table DB + UI) | XL |
| FE-017 | Rendre le seuil d'urgence KDS configurable via settings | S |

---

## MATRICE DE RISQUES

| Risque | Probabilite | Impact | Mitigation |
|--------|-------------|--------|------------|
| Compromission des cles Supabase (SEC-001) | **ELEVE** (deja expose) | **CRITIQUE** | Sprint 0 : rotation immediate |
| Acces non autorise via RLS annule (DB-001) | **ELEVE** | **CRITIQUE** | Sprint 0 : reimplementation RLS |
| Donnees financieres incorrectes (FE-001, DB-004) | **MOYEN** | **ELEVE** | Sprint 0 : correction devise et calculs |
| Perte de donnees stock (DB-005, DB-006) | **MOYEN** | **ELEVE** | Sprint 1 : unification triggers stock |
| Crash POS sans recovery (ARCH-002) | **MOYEN** | **ELEVE** | Sprint 4 : ErrorBoundaries multiples |
| Split payment casse (DB-003) | **ELEVE** | **MOYEN** | Sprint 0 : recreation table |
| Performances degradees sur tablette (UI-015, UI-016) | **MOYEN** | **MOYEN** | Sprint 4 : memo + virtualisation |

---

## RECOMMANDATIONS ARCHITECTURALES LONG TERME

1. **Adopter un schema de migration strict** : utiliser des migrations atomiques nommees, jamais de diff auto-genere monolithique. Chaque migration doit avoir un objectif clair.

2. **Unifier le systeme de stock** : choisir section_stock comme source de verite unique et supprimer le trigger `update_product_stock()` base sur `stock_movements.stock_after`.

3. **Migrer les Edge Functions vers des RPC PostgreSQL** quand possible : `intersection_stock_movements` et `purchase_order_module` seraient plus fiables comme fonctions DB transactionnelles.

4. **Implementer un systeme de permissions granulaire dans les RLS** : au lieu de `USING(TRUE)`, utiliser `user_has_permission()` pour toutes les operations d'ecriture et restreindre les lectures aux donnees pertinentes.

5. **Standardiser la gestion d'erreurs** : adopter un pattern Result (`{ data, error }`) dans tous les services et hooks pour distinguer "pas de donnees" de "erreur".

6. **Consolider le design system** : finir la migration vers shadcn/ui, supprimer les CSS custom, et documenter les patterns UI dans un Storybook.

7. **Ajouter un monitoring de production** : Sentry pour les erreurs, un dashboard pour les metriques de vente, et des alertes pour les anomalies (stock negatif, paiements echoues).

---

## CALENDRIER RESUME

```
Semaine 1-2  : Sprint 0 - URGENCE SECURITE         (20 items)
Semaine 3    : Sprint 1 - Integrite Donnees         (12 items)
Semaine 4-5  : Sprint 2 - Fonctionnalites           (13 items)
Semaine 6-7  : Sprint 3 - Langue + UI/UX            (14 items)
Semaine 8    : Sprint 4 - Tests + Qualite            (12 items)
Semaine 9-10 : Sprint 5 - Pre-production             (14 items)
              ─────────────────────────────────────────
              Total : ~85 items structurees, ~10 semaines
              + ~18 items backlog amelioration continue
```

---

*Fin du plan d'amelioration -- 143 problemes identifies, 103 items planifies en 5 sprints, 18 items en backlog*
