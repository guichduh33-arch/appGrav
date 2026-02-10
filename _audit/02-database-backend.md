# Audit Base de Donnees & Backend Supabase -- AppGrav

**Date**: 2026-02-10
**Auditeur**: Agent 2 -- Senior DBA & Backend Architect
**Perimetre**: Schema PostgreSQL, RLS, fonctions/triggers, migrations, Edge Functions, vues, coherence types frontend

---

## Table des Matieres

1. [Resume Executif](#1-resume-executif)
2. [Schema de la Base de Donnees](#2-schema-de-la-base-de-donnees)
3. [Row Level Security (RLS)](#3-row-level-security-rls)
4. [Fonctions & Triggers PostgreSQL](#4-fonctions--triggers-postgresql)
5. [Coherence des Migrations](#5-coherence-des-migrations)
6. [Edge Functions (Securite Backend)](#6-edge-functions-securite-backend)
7. [Vues (Views)](#7-vues-views)
8. [Coherence Types Frontend vs Schema DB](#8-coherence-types-frontend-vs-schema-db)
9. [Synthese des Problemes](#9-synthese-des-problemes)
10. [Recommandations Prioritaires](#10-recommandations-prioritaires)

---

## 1. Resume Executif

L'audit couvre 44 fichiers de migration SQL, 12 Edge Functions (Deno), et les types TypeScript frontend. Le systeme presente une architecture globalement correcte mais souffre de **problemes de securite critiques** dans les Edge Functions, d'un **retour massif aux politiques RLS permissives** qui annule les correctifs de securite anterieurs, et de **conflits potentiels dans la gestion du stock** entre deux systemes concurrents.

### Statistiques

| Categorie | Critique | Majeur | Mineur | Total |
|-----------|----------|--------|--------|-------|
| Schema | 1 | 4 | 6 | 11 |
| RLS | 2 | 3 | 2 | 7 |
| Fonctions/Triggers | 1 | 4 | 3 | 8 |
| Migrations | 1 | 3 | 4 | 8 |
| Edge Functions | 4 | 3 | 2 | 9 |
| Vues | 0 | 2 | 2 | 4 |
| Types | 0 | 2 | 3 | 5 |
| **TOTAL** | **9** | **21** | **22** | **52** |

---

## 2. Schema de la Base de Donnees

### 2.1 Inventaire des Tables

L'application utilise environ 60 tables dans le schema `public`. Les tables principales par module:

**Core**: `products`, `categories`, `sections`, `product_sections`, `product_modifiers`, `product_uoms`, `recipes`, `product_variant_materials`, `suppliers`

**Ventes**: `orders`, `order_items`, `pos_terminals`, `pos_sessions`, `floor_plan_items`

**Clients**: `customers`, `customer_categories`, `loyalty_tiers`, `loyalty_transactions`, `loyalty_rewards`, `loyalty_redemptions`, `product_category_prices`

**Inventaire**: `stock_movements`, `stock_locations`, `section_stock`, `production_records`, `inventory_counts`, `inventory_count_items`, `internal_transfers`, `transfer_items`

**Combos/Promotions**: `product_combos`, `product_combo_groups`, `product_combo_group_items`, `product_combo_items` (legacy), `promotions`, `promotion_products`, `promotion_free_products`, `promotion_usage`

**B2B**: `b2b_orders`, `b2b_order_items`, `b2b_payments`, `b2b_deliveries`, `b2b_price_lists`, `b2b_price_list_items`, `b2b_customer_price_lists`, `b2b_order_history`

**Achats**: `purchase_orders`, `purchase_order_items` (table reelle, a remplace le VIEW + `po_items`)

**Utilisateurs**: `user_profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`, `user_permissions`, `user_sessions`

**Systeme**: `audit_logs`, `settings`, `settings_categories`, `settings_history`, `app_settings` (legacy), `printer_configurations`, `tax_rates`, `payment_methods`, `business_hours`, `email_templates`, `receipt_templates`, `terminal_settings`, `settings_profiles`, `sound_assets`, `sequence_tracker`

**LAN/Sync/Display**: `lan_nodes`, `lan_messages`, `sync_devices`, `sync_queue`, `sync_conflicts`, `display_promotions`, `display_content`, `kds_stations`, `kds_order_queue`

### 2.2 Problemes Identifies

#### P-SCH-01: Stockage PIN en clair dans `set_user_pin()`
- **Severite**: CRITIQUE
- **Element**: Fonction `set_user_pin()` + colonne `user_profiles.pin_code`
- **Description**: La fonction `set_user_pin()` (migration 20260207043009) stocke le PIN en clair: `pin_code = p_pin` tout en creant aussi le hash bcrypt dans `pin_hash`. La colonne `pin_code` n'a jamais ete supprimee malgre un commentaire dans la migration 016 qui le prevoyait. De plus, `verify_user_pin()` fait un fallback en comparaison plaintext si `pin_hash` est NULL.
- **Recommandation**: (1) Supprimer la ligne `pin_code = p_pin` dans `set_user_pin()`. (2) Migrer tous les PIN existants vers bcrypt. (3) Supprimer le fallback plaintext dans `verify_user_pin()`. (4) A terme, supprimer la colonne `pin_code`.

#### P-SCH-02: Double systeme de gestion de stock -- conflit potentiel
- **Severite**: MAJEUR
- **Element**: `update_product_stock()` trigger vs `sync_product_total_stock()` trigger
- **Description**: Deux systemes concurrents mettent a jour `products.current_stock`:
  1. `update_product_stock()` (trigger AFTER INSERT sur `stock_movements`) -- met directement `current_stock = NEW.stock_after`
  2. `sync_product_total_stock()` (trigger sur `section_stock`) -- calcule `current_stock = SUM(section_stock.quantity)`

  Si une vente deduisait du stock via `stock_movements` SANS mettre a jour `section_stock`, le trigger `sync_product_total_stock` pourrait ecraser la valeur correcte lors de la prochaine modification de `section_stock`.
- **Recommandation**: Choisir UN systeme maitre de stock et desactiver l'autre, ou implementer un pont qui maintient les deux en coherence.

#### P-SCH-03: Systeme dual de parametres (`settings` vs `app_settings`)
- **Severite**: MAJEUR
- **Element**: Tables `settings` et `app_settings`
- **Description**: Deux tables de parametres coexistent. `settings` est le systeme avec categories, historique, et types de valeurs. `app_settings` est un systeme legacy (clef/valeur simple). L'application utilise les deux, creant de la confusion sur la source de verite.
- **Recommandation**: Migrer toutes les donnees de `app_settings` vers `settings` et supprimer la table legacy.

#### P-SCH-04: `order_items.quantity` est INTEGER mais les recettes/stock utilisent DECIMAL
- **Severite**: MAJEUR
- **Element**: `order_items.quantity` (INTEGER) vs `recipes.quantity` / `stock_movements.quantity` (DECIMAL)
- **Description**: Quand `deduct_stock_on_sale_items()` multiplie `oi.quantity` (INTEGER) par `recipe.quantity_needed` (DECIMAL), ca fonctionne grace au cast implicite. Mais si un article est vendu par fraction (ex: 0.5 kg), la precision est perdue a la source.
- **Recommandation**: Changer `order_items.quantity` en `DECIMAL(10,3)` pour supporter les ventes fractionnaires.

#### P-SCH-05: Table legacy `product_combo_items` non nettoyee
- **Severite**: MAJEUR
- **Element**: `product_combo_items` (migration 006)
- **Description**: Cette table coexiste avec le systeme plus recent `product_combo_groups` + `product_combo_group_items`. Le commentaire dans la migration dit "Legacy table for backwards compatibility", mais elle continue d'occuper le schema sans etre utilisee par le frontend.
- **Recommandation**: Verifier les references frontend. Si aucune, supprimer la table.

#### P-SCH-06: `audit_logs.severity` est VARCHAR(20) malgre l'enum `audit_severity`
- **Severite**: MINEUR
- **Element**: `audit_logs.severity` (VARCHAR) vs enum `audit_severity`
- **Description**: L'enum `audit_severity` (info, warning, critical) a ete creee dans la migration 001 mais n'est pas utilisee pour la colonne `severity` qui est VARCHAR(20). Aucune contrainte CHECK n'est appliquee non plus.
- **Recommandation**: Migrer la colonne vers `audit_severity` ou ajouter un CHECK constraint.

#### P-SCH-07: Colonnes multilangues dans `roles` et `settings_categories`
- **Severite**: MINEUR
- **Element**: `roles.name_fr`, `roles.name_en`, `roles.name_id`, `settings_categories.name_fr/en/id`
- **Description**: Ces tables ont des colonnes de traduction (fr, en, id) alors que le module i18n est suspendu et l'application est entierement en anglais.
- **Recommandation**: Ajouter une colonne `name` unique et deprecier les colonnes multilangues a terme.

#### P-SCH-08: Colonne `orders.pos_session_id` duplique `orders.session_id`
- **Severite**: MINEUR
- **Element**: `orders.session_id` et `orders.pos_session_id`
- **Description**: Deux colonnes pointent vers la meme relation `pos_sessions(id)`. La fonction `close_shift()` utilise les deux: `WHERE session_id = p_session_id OR pos_session_id = p_session_id`.
- **Recommandation**: Consolider en une seule colonne FK et migrer les donnees existantes.

#### P-SCH-09: `transfer_items.quantity` est ambigue (requested vs received)
- **Severite**: MINEUR
- **Element**: `transfer_items` a `quantity` (original) et `quantity_requested` (ajoutee par migrations ulterieures)
- **Description**: La table a potentiellement les deux colonnes selon les migrations appliquees, mais le trigger `update_transfer_totals()` reference `ti.quantity_requested` tandis que la creation originale utilise `quantity`.
- **Recommandation**: Standardiser sur `quantity_requested` et `quantity_received`, supprimer `quantity` si elle existe.

#### P-SCH-10: Index manquants sur colonnes frequemment filtrees
- **Severite**: MINEUR
- **Element**: Multiples tables
- **Description**: Quelques index manquants notables:
  - `orders.customer_id` (filtre frequent dans rapports)
  - `orders.staff_id` (utilise dans `view_staff_performance`)
  - `loyalty_transactions.customer_id` (filtre frequent)
  - `b2b_order_items.order_id` (join frequent)
  - `inventory_count_items.count_id` (join dans `finalize_inventory_count`)
- **Recommandation**: Ajouter les index manquants sur les colonnes FK utilisees dans les JOIN et WHERE.

#### P-SCH-11: Pas de contrainte d'unicite sur `section_stock(section_id, product_id)`
- **Severite**: MINEUR
- **Element**: `section_stock`
- **Description**: La table `section_stock` est creee dans 20260203110000 avec un UNIQUE(section_id, product_id), mais d'autres operations comme l'edge function `intersection_stock_movements` utilisent `section_items` (une table qui n'existe pas -- probable confusion de noms). Le schema reel semble correct mais l'Edge Function reference une table inexistante.
- **Recommandation**: Verifier que `section_stock` est bien la table utilisee et corriger les references dans l'Edge Function.

---

## 3. Row Level Security (RLS)

### 3.1 Etat Actuel

L'historique RLS est complexe et problematique:

1. **Migration 012**: RLS initial -- politiques permissives (USING TRUE) sur toutes les tables
2. **Migration 015**: Correctifs de securite -- remplacement par des politiques basees sur `user_has_permission()`
3. **Migration 20260204100000**: Retour aux politiques permissives pour `internal_transfers`, `transfer_items`
4. **Migration 20260204110000**: Retour aux politiques permissives pour `recipes`
5. **Migration 20260204120000**: Retour aux politiques permissives pour TOUTES les tables principales
6. **Migration 20260204130000**: Retour aux politiques permissives pour toutes les tables restantes
7. **Migration 20260207043009**: Ajout de politiques `anon` INSERT sur `categories`, `products`, `product_sections` et SELECT public sur `user_profiles`

**RESULTAT FINAL**: Pratiquement TOUTES les tables ont des politiques RLS "USING (TRUE)" -- ce qui est equivalent a ne pas avoir de RLS du tout.

### 3.2 Problemes Identifies

#### P-RLS-01: Regression massive de securite -- toutes les tables en USING(TRUE)
- **Severite**: CRITIQUE
- **Element**: Toutes les tables principales (~50 tables)
- **Description**: Les migrations 20260204120000 et 20260204130000 ont systematiquement remplace les politiques permission-based de la migration 015 par des politiques permissives `USING (TRUE)` / `WITH CHECK (TRUE)` pour tous les roles `authenticated`. Cela signifie que n'importe quel utilisateur authentifie peut lire, modifier et supprimer TOUTES les donnees, y compris:
  - Les profils de tous les autres utilisateurs
  - Les roles et permissions (pourrait s'auto-promouvoir admin)
  - Les parametres systeme
  - Les logs d'audit
  - Les donnees financieres
- **Recommandation**: Reimplementer progressivement les politiques basees sur `user_has_permission()` pour les operations d'ecriture au minimum. Priorite sur: `user_profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`, `user_permissions`, `settings`, `audit_logs`.

#### P-RLS-02: Politiques `anon` permettent l'insertion non authentifiee
- **Severite**: CRITIQUE
- **Element**: `categories`, `products`, `product_sections`, `user_profiles`
- **Description**: La migration 20260207043009 ajoute:
  - `categories_insert_anon` -- INSERT pour anon avec `WITH CHECK (true)`
  - `products_insert_anon` -- INSERT pour anon avec `WITH CHECK (true)`
  - `Allow anon insert product_sections` -- INSERT pour anon
  - `user_profiles_select_for_login` -- SELECT pour `public` (inclut anon) USING(true)

  N'importe qui sans authentification peut inserer des produits et categories dans la base, et lire tous les profils utilisateurs (incluant potentiellement les PIN hashes).
- **Recommandation**: Supprimer immediatement les politiques `anon` INSERT. Si elles etaient necessaires pour un import initial, elles auraient du etre temporaires. La politique SELECT sur user_profiles pour `public` doit etre restreinte aux colonnes non sensibles via une vue.

#### P-RLS-03: `purchase_order_items` -- RLS pour `public` au lieu de `authenticated`
- **Severite**: MAJEUR
- **Element**: `purchase_order_items` politiques RLS
- **Description**: Les politiques RLS sur `purchase_order_items` utilisent `TO public` au lieu de `TO authenticated`:
  ```sql
  FOR INSERT TO public WITH CHECK (auth.uid() IS NOT NULL)
  ```
  Bien que le CHECK exige `auth.uid() IS NOT NULL`, l'attribution a `public` (qui inclut `anon`) est incorrecte et inutile.
- **Recommandation**: Changer toutes les politiques `TO public` en `TO authenticated`.

#### P-RLS-04: `b2b_order_history` -- pas de politiques UPDATE/DELETE
- **Severite**: MAJEUR
- **Element**: `b2b_order_history`
- **Description**: La table n'a que des politiques SELECT et INSERT. Les operations UPDATE et DELETE ne sont pas couvertes. Avec RLS active, cela signifie que les mises a jour et suppressions seront silencieusement bloquees.
- **Recommandation**: Ajouter des politiques UPDATE/DELETE appropriees ou confirmer que c'est intentionnel (table en append-only).

#### P-RLS-05: `sequence_tracker` -- tout utilisateur authentifie peut modifier
- **Severite**: MAJEUR
- **Element**: `sequence_tracker` (migration 016)
- **Description**: La table `sequence_tracker` est critique pour la generation des numeros de sequence (commandes, sessions, etc.). Les politiques permissives permettent a tout utilisateur authentifie de modifier directement les sequences, ce qui pourrait provoquer des doublons ou des sauts.
- **Recommandation**: Restreindre les ecritures sur `sequence_tracker` aux fonctions SECURITY DEFINER uniquement. Retirer la politique INSERT/UPDATE pour `authenticated` et laisser les fonctions `get_next_daily_sequence()` operer via SECURITY DEFINER.

#### P-RLS-06: Pas de publication Realtime securisee
- **Severite**: MINEUR
- **Element**: Publication `supabase_realtime`
- **Description**: La migration 016 avait configure une publication filtree pour Realtime, mais la migration 20260207043009 ne semble pas la preserver. Les tables publiees en Realtime (orders, products, stock_movements, etc.) pourraient diffuser toutes les lignes a tous les abonnes.
- **Recommandation**: Verifier la configuration de publication Realtime et appliquer des filtres RLS cote Realtime.

#### P-RLS-07: Storage policies -- `company-assets` non restreint par permission
- **Severite**: MINEUR
- **Element**: Storage bucket `company-assets`
- **Description**: Tout utilisateur authentifie peut upload/modifier/supprimer des fichiers dans le bucket `company-assets`. Seuls les admins devraient pouvoir modifier le logo de l'entreprise.
- **Recommandation**: Ajouter une verification `user_has_permission(auth.uid(), 'settings.update')` dans les politiques INSERT/UPDATE/DELETE du bucket.

---

## 4. Fonctions & Triggers PostgreSQL

### 4.1 Inventaire des Fonctions Principales

| Fonction | Type | Securite |
|----------|------|----------|
| `user_has_permission()` | STABLE SECURITY DEFINER | OK |
| `is_admin()` | STABLE SECURITY DEFINER | OK |
| `get_current_user_profile_id()` | STABLE SECURITY DEFINER | OK |
| `get_next_daily_sequence()` | volatile | Pas SECURITY DEFINER |
| `deduct_stock_on_sale_items()` | TRIGGER SECURITY DEFINER | OK |
| `record_stock_before_after()` | TRIGGER | Pas SECURITY DEFINER |
| `update_product_stock()` | TRIGGER | Pas SECURITY DEFINER |
| `finalize_inventory_count()` | SECURITY DEFINER | OK (securise) |
| `open_shift()` / `close_shift()` | SECURITY DEFINER | Probleme P-FN-03 |
| `verify_user_pin()` | SECURITY DEFINER | Probleme P-SCH-01 |
| `set_user_pin()` | SECURITY DEFINER | Probleme P-SCH-01 |
| `update_b2b_order_totals()` | TRIGGER | Pas SECURITY DEFINER |
| `add_loyalty_points()` | Non-privileged | OK |
| `generate_*_number()` | TRIGGER | OK |
| `update_setting()` | SECURITY DEFINER | OK |
| `get_settings_by_category()` | SECURITY DEFINER | OK |
| `get_user_permissions()` | STABLE SECURITY DEFINER | OK |

### 4.2 Problemes Identifies

#### P-FN-01: `finalize_inventory_count()` -- bypass du trigger `record_stock_before_after()`
- **Severite**: CRITIQUE
- **Element**: `finalize_inventory_count()` (migration 20260208120000)
- **Description**: Cette fonction insere dans `stock_movements` en fournissant directement `stock_before` et `stock_after`. Or, le trigger `record_stock_before_after()` est un BEFORE INSERT trigger qui recalcule ces valeurs. Deux scenarios problematiques:
  1. Le trigger ecrase les valeurs fournies -- dans ce cas, la quantite fournie par la fonction est ignoree et le trigger recalcule `stock_after` en utilisant ABS() et la logique de direction. Mais la fonction fournit `ABS(v_variance)` comme quantite, et le trigger appliquera encore ABS() pour `adjustment_in` et -ABS() pour `adjustment_out`, ce qui est CORRECT.
  2. La fonction met a jour `products.current_stock` directement apres l'INSERT, mais le trigger `update_product_stock()` (AFTER INSERT) fait aussi `SET current_stock = NEW.stock_after`. Il y a une course entre les deux updates qui peuvent s'ecraser mutuellement.

  **Impact reel**: Le `update_product_stock()` trigger s'execute APRES l'INSERT. Mais `finalize_inventory_count()` fait son UPDATE produit dans la meme transaction. L'ordre est: INSERT stock_movements -> BEFORE trigger (record_stock) -> INSERT complete -> AFTER trigger (update_product_stock) -> suite de la boucle -> UPDATE products par finalize. Le dernier UPDATE de `finalize_inventory_count()` risque d'ecraser la valeur correcte du trigger.
- **Recommandation**: Supprimer l'UPDATE direct de `products.current_stock` dans `finalize_inventory_count()` et laisser le trigger `update_product_stock()` faire son travail. Ou utiliser `movement_id` pre-genere et verifier que les triggers ne causent pas de double-update.

#### P-FN-02: `deduct_stock_on_sale_items()` -- insere des quantites negatives
- **Severite**: MAJEUR
- **Element**: `deduct_stock_on_sale_items()` + `record_stock_before_after()`
- **Description**: La fonction insere `quantity = -v_item.quantity` (negatif) dans stock_movements. Le trigger `record_stock_before_after()` fait ensuite:
  - Pour `sale_pos`: `movement_qty := -ABS(NEW.quantity)`
  - Avec `NEW.quantity = -5`, `ABS(-5) = 5`, puis `-5`
  - `stock_after = stock_before + (-5)` -- CORRECT

  Le resultat est correct, mais la double negation est confuse et fragile. Si quelqu'un insere accidentellement une quantite positive pour une vente, le trigger corrigera via ABS, mais la quantite stockee dans `stock_movements.quantity` sera negative tandis que la valeur "reelle" est positive.
- **Recommandation**: Standardiser: les quantites dans `stock_movements` doivent TOUJOURS etre positives, et la direction est determinee par `movement_type`. Modifier `deduct_stock_on_sale_items()` pour inserer des valeurs positives.

#### P-FN-03: `open_shift()` -- accepte un `user_id` client au lieu de `auth.uid()`
- **Severite**: MAJEUR
- **Element**: `open_shift(p_user_id UUID, ...)`
- **Description**: La fonction accepte un `p_user_id` fourni par le client au lieu d'utiliser `auth.uid()` pour identifier l'appelant. Un utilisateur pourrait ouvrir un shift au nom d'un autre. Meme probleme pour `close_shift()`.
- **Recommandation**: Utiliser `auth.uid()` en interne et resoudre l'ID profil via `get_current_user_profile_id()`, comme le fait `finalize_inventory_count()`.

#### P-FN-04: `open_shift()` -- generation non-sequentielle du session_number
- **Severite**: MAJEUR
- **Element**: `open_shift()` (migration 20260205070000)
- **Description**: La fonction genere le session_number avec `RANDOM()`:
  ```sql
  v_session_number := 'SH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  ```
  Alors que le trigger `generate_session_number()` utilise `get_next_daily_sequence()` pour generer des numeros sequentiels thread-safe. La fonction `open_shift()` bypass le trigger en fournissant deja un `session_number`, ce qui cause des numeros incoherents (mix de "SH-" aleatoire et "SESSION-" sequentiel).
- **Recommandation**: Laisser le trigger `generate_session_number()` gerer la generation en n'inserant pas de `session_number` dans `open_shift()`.

#### P-FN-05: `close_shift()` compte seulement les commandes `status = 'completed'`
- **Severite**: MAJEUR
- **Element**: `close_shift()`
- **Description**: La fonction calcule les ventes avec `WHERE status = 'completed'`, mais le flux d'application est `new -> preparing -> ready -> served`. Les commandes n'atteignent jamais `completed` dans le flux normal (la migration 20260209120001 confirme ce probleme). Le total des ventes a la fermeture de caisse sera ZERO.
- **Recommandation**: Utiliser `WHERE payment_status = 'paid'` au lieu de `WHERE status = 'completed'` pour le calcul des totaux.

#### P-FN-06: `get_next_daily_sequence()` n'est pas SECURITY DEFINER
- **Severite**: MINEUR
- **Element**: `get_next_daily_sequence()`
- **Description**: Cette fonction met a jour `sequence_tracker` mais n'est pas SECURITY DEFINER. Elle depend des politiques RLS permissives pour fonctionner. Si les RLS sont durcies (recommande par P-RLS-01), cette fonction cessera de fonctionner pour les utilisateurs sans permission d'ecriture sur `sequence_tracker`.
- **Recommandation**: Ajouter SECURITY DEFINER a la fonction.

#### P-FN-07: `update_b2b_order_totals()` utilise tax_rate=0.11 par defaut
- **Severite**: MINEUR
- **Element**: `update_b2b_order_totals()` + `b2b_orders.tax_rate DEFAULT 0.11`
- **Description**: La taxe B2B par defaut est 11% (0.11) alors que la regle metier stipule 10% (inclus dans le prix). Pour les ventes B2B, la taxe est apparemment **ajoutee** (non incluse), ce qui explique 0.11, mais il y a incoherence avec la regle metier documentee de 10%.
- **Recommandation**: Clarifier avec l'equipe metier: est-ce que le B2B utilise une taxe de 11% ajoutee, ou 10% incluse? Documenter la decision.

#### P-FN-08: `hash_pin()` RPC appelee mais non definie dans les migrations
- **Severite**: MINEUR
- **Element**: Edge Function `auth-change-pin`
- **Description**: L'Edge Function `auth-change-pin` appelle `supabase.rpc('hash_pin', { p_pin: new_pin })`, mais aucune fonction `hash_pin()` n'est definie dans les migrations. Seule `set_user_pin()` existe et elle fait le hash internement.
- **Recommandation**: Soit creer la fonction `hash_pin()`, soit utiliser `set_user_pin()` directement dans l'Edge Function.

---

## 5. Coherence des Migrations

### 5.1 Structure

Les migrations suivent deux conventions:
- **001-017**: Migrations numerotees de consolidation (schema initial)
- **20260203+**: Migrations par date/heure (evolutions)

### 5.2 Problemes Identifies

#### P-MIG-01: Perte de `po_items` et recration comme `purchase_order_items`
- **Severite**: CRITIQUE (integrite des donnees)
- **Element**: Migration 20260207043009
- **Description**: Cette migration remote_schema fait un `DROP TABLE "po_items"` et cree `purchase_order_items` comme table reelle. Mais auparavant, `purchase_order_items` etait un VIEW sur `po_items` avec des triggers INSTEAD OF. La migration suppose que:
  1. La table `po_items` existait encore au moment de l'execution
  2. Aucune donnee dans `po_items` n'avait besoin d'etre preservee

  Si des donnees existaient dans `po_items`, elles ont ete PERDUES lors du DROP.

  De plus, la migration 20260209100000 renomme des colonnes de `purchase_order_items` (`total` -> `line_total`, etc.) et drop les anciennes fonctions de mapping (bridge PO), confirmant que la structure finale est completement differente.
- **Recommandation**: Documenter cette migration destructive. Si des donnees ont ete perdues, verifier les backups. Pour l'avenir, toujours inclure un `INSERT INTO ... SELECT FROM` avant un `DROP TABLE`.

#### P-MIG-02: `order_payments` et `system_alerts` supprimes par remote_schema
- **Severite**: MAJEUR
- **Element**: Migration 20260207043009
- **Description**: La migration remote_schema supprime les tables `order_payments` et `system_alerts` qui etaient creees par les migrations 20260205150000 et 20260206120000 respectivement. Les champs de refund sur orders (`refund_amount`, `refund_reason`, etc.) sont aussi supprimes.

  Cela signifie que:
  - Le support de split payment est CASSE (pas de table `order_payments`)
  - Les alertes systeme ne sont plus disponibles
  - Les remboursements ne sont plus traces dans la table orders

  L'enum `order_status` perd aussi la valeur `voided` qui avait ete ajoutee par 20260205150001.
- **Recommandation**: Recreer `order_payments` et `system_alerts` si ces fonctionnalites sont necessaires. Restaurer les champs de refund ou creer une table `refunds` dediee.

#### P-MIG-03: Migrations redondantes et conflictuelles
- **Severite**: MAJEUR
- **Element**: Multiples migrations
- **Description**: Plusieurs operations sont repetees inutilement:
  - `pos_sessions.user_id` est ajoute par 20260204100000, 20260204120000, 20260204130000, et 20260205070000
  - `stock_movements.created_by_name`, `unit_cost` sont ajoutees par 20260204120000 et 20260204130000
  - `internal_transfers.from_section_id` est ajoute par 20260203120000, 20260204120000, et 20260204130000
  - Les politiques RLS pour `internal_transfers` sont recreees dans au moins 4 migrations differentes

  Le `ADD COLUMN IF NOT EXISTS` protege contre les erreurs, mais c'est symptomatique d'un manque de suivi de l'etat du schema.
- **Recommandation**: Consolider les migrations en un ensemble coherent. Utiliser un outil de diff schema pour identifier l'etat reel vs l'etat attendu.

#### P-MIG-04: Migration `20260207043009_remote_schema.sql` est un diff auto-genere
- **Severite**: MAJEUR
- **Element**: 20260207043009_remote_schema.sql (1941 lignes)
- **Description**: Cette migration est un diff auto-genere par `supabase db diff` ou similaire. Elle contient un melange de:
  - DROP de tables, vues, fonctions, contraintes
  - Recreations de fonctions avec tout le code inline
  - Ajout de politiques RLS contradictoires (ex: `anon` INSERT)
  - Recreations de vues
  - Grants permissifs

  Ce type de migration monolithique est dangereux car:
  1. Il est impossible de comprendre l'intention derriere chaque changement
  2. Les rollbacks partiels sont impossibles
  3. Il peut contenir des changements non voulus (comme les politiques `anon`)
- **Recommandation**: A l'avenir, ne jamais appliquer un diff auto-genere sans review. Decomposer les changements en migrations atomiques avec des commentaires explicatifs.

#### P-MIG-05: Pas de migration DOWN / rollback
- **Severite**: MINEUR
- **Element**: Toutes les migrations
- **Description**: Aucune migration ne fournit de script de rollback. Les migrations Supabase sont par nature forward-only, mais des commentaires documentant les operations inverses seraient utiles.
- **Recommandation**: Documenter les operations de rollback en commentaires pour les migrations critiques (schema changes, data modifications).

#### P-MIG-06: Sequences PostgreSQL supprimees dans remote_schema
- **Severite**: MINEUR
- **Element**: Migration 20260207043009
- **Description**: La migration supprime 9 sequences (`b2b_delivery_seq`, `order_number_seq`, etc.) qui avaient ete remplacees par `sequence_tracker` dans la migration 016. Le DROP est tardif mais inoffensif car ces sequences n'etaient plus utilisees.
- **Recommandation**: Aucune action requise, mais noter que la suppression aurait du etre faite dans la migration 016.

#### P-MIG-07: `20260203100000_import_recipes.sql` -- fichier trop volumineux
- **Severite**: MINEUR
- **Element**: Migration d'import recettes
- **Description**: Ce fichier fait plus de 50,000 tokens (potentiellement des dizaines de milliers de lignes de donnees INSERT). C'est un fichier de seed data deguise en migration.
- **Recommandation**: Separer les migrations schema des imports de donnees. Utiliser un seed file ou un script d'import dedie.

#### P-MIG-08: Vues supprimees mais pas recrees dans la meme migration
- **Severite**: MINEUR
- **Element**: Migration 20260207043009
- **Description**: Plusieurs vues sont supprimees au debut (`view_profit_loss`, `view_sales_by_customer`, `view_sales_by_hour`, `view_session_cash_balance`, `view_b2b_receivables`, `view_stock_warning`, `view_expired_stock`, `view_unsold_products`, `view_section_transfers`) mais ne sont PAS recrees dans cette migration. Elles sont potentiellement perdues.
- **Recommandation**: Verifier si ces vues existent encore en base. Si non, recreer celles qui sont necessaires.

---

## 6. Edge Functions (Securite Backend)

### 6.1 Inventaire

| Fonction | Auth | Service Role | Issues |
|----------|------|-------------|--------|
| `auth-verify-pin` | Aucune JWT | Oui | P-EF-01 |
| `auth-user-management` | x-user-id header | Oui | P-EF-02, P-EF-03 |
| `auth-get-session` | session_token | Oui | OK (mais plaintext token) |
| `auth-logout` | Aucune | Oui | P-EF-04 |
| `auth-change-pin` | x-user-id header | Oui | P-EF-05 |
| `claude-proxy` | Aucune | Non | P-EF-06 |
| `generate-invoice` | Aucune | Oui | P-EF-07 |
| `send-to-printer` | Aucune | Oui | P-EF-07 |
| `calculate-daily-report` | Aucune | Oui | P-EF-07 |
| `send-test-email` | Aucune | Oui | P-EF-07 |
| `intersection_stock_movements` | JWT (anon key) | Non | P-EF-08 |
| `purchase_order_module` | JWT (anon key) | Non | P-EF-09 |

### 6.2 Problemes Identifies

#### P-EF-01: `auth-verify-pin` -- pas de verification JWT, appelle un RPC inexistant
- **Severite**: CRITIQUE
- **Element**: `supabase/functions/auth-verify-pin/index.ts`
- **Description**:
  1. La fonction n'exige aucun JWT dans l'en-tete Authorization. Elle est deployee avec `verify_jwt: true` dans la config Edge Function, mais le code utilise le service role key directement, ce qui bypass le JWT check.
  2. La fonction appelle `supabase.rpc('verify_user_pin', { p_user_id, p_pin })`. Cette RPC existe maintenant (creee dans 20260207043009) mais stocke aussi le PIN en clair via `set_user_pin`.
  3. Le rate limiting est implemente en memoire (variable `rateLimitMap`) -- il ne persiste pas entre les cold starts de l'Edge Function.
- **Recommandation**: (1) Implementer un rate limiting persistant en base. (2) Verifier que `verify_jwt` est correctement configure. (3) Ne jamais stocker les PIN en clair.

#### P-EF-02: `auth-user-management` -- authentification par header spoofable
- **Severite**: CRITIQUE
- **Element**: `supabase/functions/auth-user-management/index.ts`
- **Description**: L'authentification repose sur `req.headers.get('x-user-id')` qui est un header HTTP defini par le CLIENT. N'importe qui peut envoyer ce header avec l'ID d'un administrateur pour obtenir des privileges eleves. La verification de permissions utilise ensuite ce `x-user-id` spoofable pour `user_has_permission()`.
- **Recommandation**: Utiliser le JWT Supabase pour authentifier l'appelant: extraire le token Authorization, le verifier via `supabase.auth.getUser()`, puis utiliser l'ID retourne.

#### P-EF-03: `auth-user-management` -- stockage PIN en clair
- **Severite**: CRITIQUE
- **Element**: `auth-user-management/index.ts` ligne ~135
- **Description**: Lors de la creation d'un utilisateur, la fonction stocke: `pin_code: pin` (plaintext) en plus du hash. C'est le meme probleme que P-SCH-01 mais cote Edge Function.
- **Recommandation**: Ne stocker que `pin_hash`. Utiliser `set_user_pin()` RPC qui fait le hash cote serveur (apres correction de cette fonction pour supprimer le stockage plaintext).

#### P-EF-04: `auth-logout` -- pas de verification d'identite de l'appelant
- **Severite**: CRITIQUE
- **Element**: `supabase/functions/auth-logout/index.ts`
- **Description**: La fonction accepte `session_id` et `user_id` dans le body sans verifier l'identite de l'appelant. N'importe qui peut terminer la session de n'importe quel utilisateur en envoyant son `user_id` et `session_id`.
- **Recommandation**: Verifier le JWT ou le session_token pour confirmer que l'appelant est bien le proprietaire de la session.

#### P-EF-05: `auth-change-pin` -- appelle `hash_pin` RPC inexistante
- **Severite**: MAJEUR
- **Element**: `supabase/functions/auth-change-pin/index.ts`
- **Description**: La fonction appelle `supabase.rpc('hash_pin', { p_pin: new_pin })`, mais cette RPC n'existe dans aucune migration. L'appel echouera systematiquement avec une erreur 404.
- **Recommandation**: Utiliser `set_user_pin()` RPC a la place, ou creer la fonction `hash_pin()`.

#### P-EF-06: `claude-proxy` -- aucune authentification, expose la clef API Anthropic
- **Severite**: MAJEUR
- **Element**: `supabase/functions/claude-proxy/index.ts`
- **Description**: Cette Edge Function proxy les requetes vers l'API Anthropic. Elle n'a AUCUNE verification d'identite. N'importe qui connaissant l'URL de la fonction peut l'utiliser pour consommer le credit API Anthropic du projet.
- **Recommandation**: Ajouter une verification JWT obligatoire. Limiter les requetes par utilisateur.

#### P-EF-07: Fonctions utilitaires sans authentification
- **Severite**: MAJEUR
- **Element**: `generate-invoice`, `send-to-printer`, `calculate-daily-report`, `send-test-email`
- **Description**: Ces 4 Edge Functions utilisent `supabaseAdmin` (service role) et n'effectuent aucune verification d'identite. Toute personne connaissant les URLs peut:
  - Generer des factures pour n'importe quelle commande B2B
  - Envoyer des commandes d'impression a l'imprimante locale
  - Declencher des calculs de rapport
  - Envoyer des emails de test (information disclosure des parametres SMTP)
- **Recommandation**: Ajouter une verification JWT a toutes ces fonctions. Verifier les permissions appropriees (ex: `reports.financial` pour calculate-daily-report).

#### P-EF-08: `intersection_stock_movements` -- reference des tables inexistantes
- **Severite**: MINEUR
- **Element**: `supabase/functions/intersection_stock_movements/index.ts`
- **Description**: La fonction reference `storage_sections` et `section_items` qui n'existent pas dans le schema. Les tables reelles sont `sections` et `section_stock`. De plus, le transfer est non-atomique (lecture-ecriture separee sans transaction), ce qui peut causer des inconsistences de stock sous charge.
- **Recommandation**: Corriger les noms de tables. Utiliser une RPC PostgreSQL pour les transferts atomiques au lieu de manipulations client-side.

#### P-EF-09: `purchase_order_module` -- insert dans `po_items` qui a ete supprime
- **Severite**: MINEUR
- **Element**: `supabase/functions/purchase_order_module/index.ts`
- **Description**: La fonction insere dans `po_items` (ligne 80), mais cette table a ete supprimee par la migration 20260207043009 et remplacee par `purchase_order_items`. Les insertions echoueront.
- **Recommandation**: Mettre a jour pour utiliser `purchase_order_items` avec les bons noms de colonnes.

#### P-EF-10: CORS wildcard dans certaines fonctions
- **Severite**: MINEUR
- **Element**: `intersection_stock_movements`, `purchase_order_module`
- **Description**: Ces fonctions definissent leurs propres headers CORS avec `'Access-Control-Allow-Origin': '*'` au lieu d'utiliser la fonction partagee `getCorsHeaders()` qui restreint aux origines autorisees.
- **Recommandation**: Utiliser le module partage `_shared/cors.ts` dans toutes les Edge Functions.

#### P-EF-11: `send-to-printer` affiche "11%" pour la taxe
- **Severite**: MINEUR (donnees)
- **Element**: `send-to-printer/index.ts`
- **Description**: La generation du ticket de caisse inclut un calcul/affichage de taxe a 11%, mais la regle metier est 10% inclus dans le prix.
- **Recommandation**: Corriger le taux affiche pour correspondre a la regle metier.

---

## 7. Vues (Views)

### 7.1 Vues Existantes (apres toutes les migrations)

Les vues suivantes existent dans le schema final:

| Vue | Creee | Etat |
|-----|-------|------|
| `view_daily_kpis` | 013, recreee 20260207 | Active |
| `view_inventory_valuation` | 013 | Active |
| `view_payment_method_stats` | 013, recreee 20260207 | Active |
| `view_product_sales` | 013, recreee 20260207 | Active |
| `view_staff_performance` | 013, recreee 20260207 | Active |
| `view_hourly_sales` | 013, recreee 20260207 | Active |
| `view_category_sales` | 013, recreee 20260207 | Active |
| `view_customer_insights` | 013 | Active |
| `view_stock_alerts` | 013 | Active |
| `view_session_summary` | 013 | Active |
| `view_b2b_performance` | 013 | Active |
| `view_production_summary` | 013, recreee 20260208 | Active |
| `view_kds_queue_status` | 013, recreee 20260207 | Active |
| `view_order_type_distribution` | 013, recreee 20260207 | Active |
| `view_section_stock_details` | 20260203, recreee 20260208 | Active |
| `view_section_transfers` | 20260203 | SUPPRIMEE par 20260207 |
| `view_profit_loss` | 20260206 | SUPPRIMEE par 20260207 |
| `view_sales_by_customer` | 20260206 | SUPPRIMEE par 20260207 |
| `view_sales_by_hour` | 20260206 | SUPPRIMEE par 20260207 |
| `view_session_cash_balance` | 20260206 | SUPPRIMEE par 20260207 |
| `view_b2b_receivables` | 20260206 | SUPPRIMEE par 20260207 |
| `view_stock_warning` | 20260206 | SUPPRIMEE par 20260207 |
| `view_expired_stock` | 20260206 | SUPPRIMEE par 20260207 |
| `view_unsold_products` | 20260206 | SUPPRIMEE par 20260207 |
| `user_profiles_safe` | Generated types mention it | Probablement active |

### 7.2 Problemes Identifies

#### P-VW-01: 8 vues de reporting supprimees et non recreees
- **Severite**: MAJEUR
- **Element**: `view_profit_loss`, `view_sales_by_customer`, `view_sales_by_hour`, `view_session_cash_balance`, `view_b2b_receivables`, `view_stock_warning`, `view_expired_stock`, `view_unsold_products`
- **Description**: Ces 8 vues ont ete creees par la migration 20260206120000 puis supprimees par 20260207043009 (remote_schema diff) sans etre recreees. Si le frontend les utilise (les tabs de reporting correspondants existent dans le code modifie), les requetes echoueront.
- **Recommandation**: Verifier si ces vues sont utilisees par le frontend. Si oui, les recreer. Les fichiers modifies listes dans le git status (`src/pages/reports/components/`) suggerent que le frontend attend ces vues.

#### P-VW-02: `view_session_cash_balance` referencait `terminal_id_str` non standard
- **Severite**: MAJEUR
- **Element**: `view_session_cash_balance` (avant suppression)
- **Description**: Cette vue utilisait `ps.terminal_id_str` qui est une colonne ajoutee tardivement (migration 20260205070000). La vue est maintenant supprimee, mais si elle est recreee, ce probleme doit etre corrige.
- **Recommandation**: Utiliser `COALESCE(ps.terminal_id_str, ps.terminal_id::VARCHAR)` lors de la recreation.

#### P-VW-03: `view_daily_kpis` filtre sur `status = 'completed'`
- **Severite**: MINEUR
- **Element**: `view_daily_kpis`
- **Description**: La vue compte les commandes completees avec `status = 'completed'`. Comme explique dans P-FN-05, les commandes n'atteignent jamais ce statut dans le flux normal. Cependant, la vue utilise aussi `payment_status = 'paid'` pour le revenu, ce qui est correct.
- **Recommandation**: Remplacer `status = 'completed'` par `status NOT IN ('cancelled')` ou une condition basee sur `payment_status`.

#### P-VW-04: `view_stock_alerts` -- seuils codes en dur
- **Severite**: MINEUR
- **Element**: `view_stock_alerts` (migration 013)
- **Description**: Les seuils d'alerte sont potentiellement codes en dur dans la vue au lieu d'utiliser `products.min_stock_level` ou un parametre configurable.
- **Recommandation**: Verifier la definition et utiliser les seuils configurables par produit.

---

## 8. Coherence Types Frontend vs Schema DB

### 8.1 Fichiers Analyses

- `src/types/database.generated.ts` -- Types auto-generes depuis le schema Supabase
- `src/types/database.ts` -- Types manuels et re-exports

### 8.2 Problemes Identifies

#### P-TY-01: `order_status` enum ne contient pas `voided`
- **Severite**: MAJEUR
- **Element**: `database.generated.ts` enum `order_status`
- **Description**: L'enum genere contient: `new | preparing | ready | served | completed | cancelled`. La valeur `voided` a ete ajoutee par la migration 20260205150001 mais supprimee par 20260207043009 qui recree l'enum sans `voided`. Le frontend `voidService.ts` utilise probablement `voided` comme statut, ce qui causera des erreurs de type.
- **Recommandation**: Soit re-ajouter `voided` a l'enum, soit utiliser un champ booleen `is_voided` sur la table orders.

#### P-TY-02: `order_payments` referencee dans les types mais table supprimee
- **Severite**: MAJEUR
- **Element**: `database.ts` et code frontend
- **Description**: La table `order_payments` a ete supprimee par la migration 20260207043009. Si le frontend tente d'utiliser le service de split payment qui depend de cette table, toutes les operations echoueront.
- **Recommandation**: Recreer la table `order_payments` ou supprimer les references frontend.

#### P-TY-03: Types manuels pour `ISection` vs types generes
- **Severite**: MINEUR
- **Element**: `database.ts` interface `ISection`
- **Description**: Le fichier definit manuellement `ISection` avec des champs comme `section_type`, `manager_id`, `icon` qui sont dans les types generes via `Tables<'sections'>`. La duplication cree un risque de divergence.
- **Recommandation**: Utiliser `Tables<'sections'>` et etendre avec les champs supplementaires si necessaire.

#### P-TY-04: `PromotionType` frontend ne correspond pas a l'enum DB
- **Severite**: MINEUR
- **Element**: `database.ts` ligne 129
- **Description**: Le type frontend:
  ```typescript
  type PromotionType = 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_product' | 'fixed' | 'free'
  ```
  L'enum DB `discount_type`: `'percentage' | 'fixed' | 'free'`

  Les valeurs `fixed_amount`, `buy_x_get_y`, `free_product` n'existent pas dans l'enum DB.
- **Recommandation**: Aligner les types frontend avec la DB. Si des types supplementaires sont necessaires, les ajouter a l'enum DB.

#### P-TY-05: `movement_type` enum vs usage dans `record_stock_before_after()`
- **Severite**: MINEUR
- **Element**: `record_stock_before_after()` vs `movement_type` enum
- **Description**: La fonction gere des types comme `sale`, `production`, `adjustment`, `return` qui ne sont PAS dans l'enum `movement_type` (`purchase`, `production_in`, `production_out`, `sale_pos`, `sale_b2b`, `adjustment_in`, `adjustment_out`, `waste`, `transfer_in`, `transfer_out`, `transfer`, `ingredient`). La fonction utilise `NEW.movement_type::text` pour faire un CASE, ce qui permet les valeurs non-enum, mais le cast depuis l'enum original echouera si la valeur inseree n'est pas dans l'enum.
- **Recommandation**: Nettoyer le CASE pour ne contenir que les valeurs de l'enum `movement_type` actuel. Les types `sale`, `production`, `adjustment`, `return` sont probablement legacy.

---

## 9. Synthese des Problemes

### Problemes CRITIQUES (9) -- A corriger immediatement

| ID | Element | Description |
|----|---------|-------------|
| P-SCH-01 | `set_user_pin()` / `pin_code` | PIN stocke en clair cote DB et Edge Function |
| P-RLS-01 | Toutes les tables | Regression RLS -- toutes les politiques sont USING(TRUE) |
| P-RLS-02 | categories, products, user_profiles | Politiques `anon` INSERT -- insertion sans authentification |
| P-EF-01 | auth-verify-pin | Rate limiting non persistant, RPC manquante |
| P-EF-02 | auth-user-management | Authentification par header spoofable |
| P-EF-03 | auth-user-management | Stockage PIN plaintext |
| P-EF-04 | auth-logout | Pas de verification d'identite |
| P-MIG-01 | 20260207043009 | Perte de donnees potentielle (DROP po_items) |
| P-FN-01 | finalize_inventory_count | Race condition avec update_product_stock trigger |

### Problemes MAJEURS (21) -- A planifier dans le prochain sprint

| ID | Element | Description |
|----|---------|-------------|
| P-SCH-02 | stock triggers | Double systeme de gestion de stock |
| P-SCH-03 | settings/app_settings | Systeme dual de parametres |
| P-SCH-04 | order_items.quantity | INTEGER au lieu de DECIMAL |
| P-SCH-05 | product_combo_items | Table legacy non nettoyee |
| P-RLS-03 | purchase_order_items | Politiques pour `public` au lieu de `authenticated` |
| P-RLS-04 | b2b_order_history | Pas de politiques UPDATE/DELETE |
| P-RLS-05 | sequence_tracker | Toute modification permise par authenticated |
| P-FN-02 | deduct_stock_on_sale_items | Quantites negatives confuses |
| P-FN-03 | open_shift/close_shift | User ID client au lieu de auth.uid() |
| P-FN-04 | open_shift | Session number genere avec RANDOM |
| P-FN-05 | close_shift | Filtre sur status='completed' inutile |
| P-MIG-02 | 20260207043009 | order_payments et system_alerts supprimes |
| P-MIG-03 | Multiples migrations | Migrations redondantes et conflictuelles |
| P-MIG-04 | 20260207043009 | Migration monolithique auto-generee |
| P-EF-05 | auth-change-pin | Appelle hash_pin RPC inexistante |
| P-EF-06 | claude-proxy | Aucune authentification, expose API key |
| P-EF-07 | 4 fonctions utilitaires | Aucune authentification |
| P-VW-01 | 8 vues reporting | Supprimees et non recreees |
| P-VW-02 | view_session_cash_balance | Reference colonne non standard |
| P-TY-01 | order_status | Manque 'voided' |
| P-TY-02 | order_payments types | Table supprimee mais types references |

### Problemes MINEURS (22) -- Corrections a planifier

| ID | Element | Description |
|----|---------|-------------|
| P-SCH-06 | audit_logs.severity | VARCHAR au lieu de l'enum |
| P-SCH-07 | roles/settings multilangues | Colonnes inutilisees |
| P-SCH-08 | session_id/pos_session_id | Double FK |
| P-SCH-09 | transfer_items.quantity | Ambiguite naming |
| P-SCH-10 | Index manquants | orders.customer_id, staff_id, etc. |
| P-SCH-11 | section_stock/section_items | Confusion de noms dans Edge Function |
| P-RLS-06 | Realtime publication | Filtrage non securise |
| P-RLS-07 | Storage company-assets | Pas de verification de permission |
| P-FN-06 | get_next_daily_sequence | Manque SECURITY DEFINER |
| P-FN-07 | update_b2b_order_totals | Tax rate 11% vs 10% |
| P-FN-08 | hash_pin RPC | Fonction non definie |
| P-MIG-05 | Toutes | Pas de scripts rollback |
| P-MIG-06 | Sequences supprimees | Suppression tardive |
| P-MIG-07 | import_recipes | Fichier trop volumineux |
| P-MIG-08 | Vues supprimees | Pas recrees dans meme migration |
| P-EF-08 | intersection_stock_movements | Tables inexistantes |
| P-EF-09 | purchase_order_module | Insert dans po_items supprime |
| P-EF-10 | CORS wildcard | 2 fonctions bypass CORS partage |
| P-EF-11 | send-to-printer | Taxe 11% au lieu de 10% |
| P-VW-03 | view_daily_kpis | Filtre completed |
| P-VW-04 | view_stock_alerts | Seuils codes en dur |
| P-TY-03 | ISection | Types manuels vs generes |
| P-TY-04 | PromotionType | Enum frontend != DB |
| P-TY-05 | movement_type | Values legacy dans la fonction |

---

## 10. Recommandations Prioritaires

### Sprint Immediat (Securite Critique)

1. **Supprimer le stockage PIN en clair** dans `set_user_pin()`, `auth-user-management`, et `verify_user_pin()` fallback
2. **Securiser les Edge Functions** : remplacer `x-user-id` header par JWT verification dans `auth-user-management`, `auth-change-pin`, `auth-logout`
3. **Ajouter JWT check** a `claude-proxy`, `generate-invoice`, `send-to-printer`, `calculate-daily-report`, `send-test-email`
4. **Supprimer les politiques `anon` INSERT** sur `categories`, `products`, `product_sections`
5. **Restreindre la politique SELECT `public`** sur `user_profiles` a une vue sans colonnes sensibles

### Sprint Suivant (Integrite Fonctionnelle)

6. **Recreer `order_payments`** et `system_alerts` si ces fonctionnalites sont necessaires
7. **Recreer les 8 vues de reporting** supprimees (view_profit_loss, etc.)
8. **Resoudre le conflit stock** entre `update_product_stock()` et `sync_product_total_stock()`
9. **Corriger `close_shift()`** pour filtrer sur `payment_status = 'paid'`
10. **Creer la RPC `hash_pin()`** ou corriger `auth-change-pin` pour utiliser `set_user_pin()`

### Sprint Moyen Terme (Qualite)

11. **Reimplementer les RLS permission-based** progressivement (commencer par user_profiles, roles, permissions, settings)
12. **Consolider les migrations** en nettoyant les redondances
13. **Standardiser les quantites** dans stock_movements (toujours positives)
14. **Migrer `app_settings`** vers `settings` et supprimer la table legacy
15. **Corriger les Edge Functions** `intersection_stock_movements` et `purchase_order_module` (tables inexistantes)

---

*Fin du rapport d'audit -- 52 problemes identifies (9 critiques, 21 majeurs, 22 mineurs)*
