# 02 - Audit Backend / Base de Donnees Supabase

**Projet**: AppGrav (The Breakery POS/ERP)
**Date**: 2026-02-11
**Auditeur**: Subagent 1B - Audit Base de Donnees & Backend Supabase
**Perimetre**: Schema PostgreSQL, RLS, Edge Functions, Fonctions SQL / Triggers / Vues

---

## Table des matieres

1. [Resume executif](#1-resume-executif)
2. [Schema de base de donnees](#2-schema-de-base-de-donnees)
3. [Row Level Security (RLS)](#3-row-level-security-rls)
4. [Edge Functions](#4-edge-functions)
5. [Fonctions SQL, Triggers et Vues](#5-fonctions-sql-triggers-et-vues)
6. [Synthese des constats](#6-synthese-des-constats)
7. [Plan de remediation prioritaire](#7-plan-de-remediation-prioritaire)

---

## 1. Resume executif

L'audit couvre **62 migrations SQL**, **15 Edge Functions** (12 fonctions + 3 utilitaires partages), **~30 fonctions SQL**, **~25 triggers** et **22+ vues**. Le systeme est fonctionnel mais presente des vulnerabilites de securite significatives, principalement liees aux politiques RLS trop permissives sur la majorite des tables et a deux Edge Functions sans controle d'acces adequat.

### Statistiques globales

| Severite | Nombre |
|----------|--------|
| CRITIQUE | 8 |
| MAJEUR   | 19 |
| MINEUR   | 16 |
| **Total** | **43** |

---

## 2. Schema de base de donnees

### 2.1 Relations et contraintes de cle etrangere

**[MAJEUR] `loyalty_transactions.order_id` - FK manquante**
- **Fichier**: `003_customers_loyalty.sql`
- **Description**: La colonne `order_id UUID` est definie sans contrainte REFERENCES vers `orders(id)`. Les points de fidelite peuvent etre lies a des commandes inexistantes.
- **Solution**: Ajouter `ALTER TABLE loyalty_transactions ADD CONSTRAINT fk_loyalty_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;`

**[MINEUR] `order_payments.created_by` - Reference inconsistante entre migrations**
- **Fichier**: `20260205150000_create_order_payments.sql` vs `20260210100005_recreate_order_payments_and_views.sql`
- **Description**: La premiere creation reference `auth.users(id)`, la recreation reference `user_profiles(id)`. Selon l'ordre d'execution, la FK pointe vers des tables differentes.
- **Solution**: Standardiser sur `user_profiles(id)` conformement au pattern du reste de l'application.

**[MINEUR] `orders.refunded_by` reference `auth.users(id)` au lieu de `user_profiles(id)`**
- **Fichier**: `20260205150001_add_refund_fields.sql`
- **Description**: La colonne `refunded_by` reference `auth.users` alors que toutes les autres FK utilisateur du systeme referencent `user_profiles`.
- **Solution**: Migrer vers `REFERENCES user_profiles(id)` pour la coherence.

### 2.2 Colonnes inutilisees ou obsoletes

**[MAJEUR] `user_profiles.pin_code` - Colonne de PIN en clair non supprimee**
- **Fichier**: `008_users_permissions.sql` (creation), `20260210100000_remove_plaintext_pin.sql` (nettoyage)
- **Description**: La migration de securite met les valeurs a NULL et modifie les fonctions pour ne plus ecrire dans cette colonne, mais la colonne `pin_code VARCHAR(10)` existe toujours dans le schema. Un developpeur pourrait accidentellement y ecrire a nouveau.
- **Solution**: `ALTER TABLE user_profiles DROP COLUMN pin_code;` dans une nouvelle migration.

**[MINEUR] `roles.name_fr`, `roles.name_en`, `roles.name_id` - Colonnes i18n suspendues**
- **Fichier**: `008_users_permissions.sql`
- **Description**: Le module i18n est suspendu (CLAUDE.md: "i18next infrastructure exists but is not actively used"). Ces colonnes ne sont pas utilisees.
- **Solution**: Conserver mais documenter comme deprecated. Pas d'action immediate necessaire.

**[MINEUR] `settings_categories` et `settings` contiennent `name_fr`, `name_en`, `name_id`, `description_fr`, `description_en`, `description_id`**
- **Fichier**: `009_system_settings.sql`, `20260212100000_epic10_settings_expansion.sql`
- **Description**: Meme probleme que ci-dessus. Les labels multilingues sont stockes mais le frontend utilise exclusivement l'anglais.
- **Solution**: Acceptable pour une reactivation future de l'i18n. Documenter comme intentionnel.

### 2.3 Types de donnees et contraintes

**[MAJEUR] `purchase_orders.tax_rate` DEFAULT 0.11 - Inconsistance fiscale residuelle**
- **Fichier**: `005_inventory_stock.sql`
- **Description**: Le default est `0.11` (11%) alors que la regle metier est 10% TTC. La migration `20260210120000_fe014_fix_b2b_tax_rate_default.sql` a corrige `b2b_orders.tax_rate` mais PAS `purchase_orders.tax_rate`.
- **Solution**: `ALTER TABLE purchase_orders ALTER COLUMN tax_rate SET DEFAULT 0.10;`

**[MINEUR] `stock_movements` - Colonnes dupliquees potentielles apres `20260204130000`**
- **Fichier**: `20260204130000_fix_all_rls_policies.sql`
- **Description**: Cette migration ajoute des colonnes (`product_id`, `movement_type`, `quantity`, `created_by`) avec `ADD COLUMN IF NOT EXISTS` a `stock_movements`, qui existaient deja dans `005_inventory_stock.sql`. L'utilisation de `IF NOT EXISTS` est correcte, mais le type `VARCHAR(50)` pour `movement_type` entre en conflit potentiel avec l'ENUM `movement_type` deja defini.
- **Solution**: Verifier la coherence des types en production. Si le type est VARCHAR au lieu de l'ENUM, migrer vers l'ENUM.

**[MINEUR] `product_uoms` - Table creee deux fois**
- **Fichier**: `002_core_products.sql` et `20260204130000_fix_all_rls_policies.sql`
- **Description**: La table est creee dans la migration consolidee puis recréee avec `CREATE TABLE IF NOT EXISTS` dans le fix. Pas de bug grace au IF NOT EXISTS mais contribue a la confusion du schema.
- **Solution**: Documentation uniquement.

### 2.4 Index manquants ou en double

**[MINEUR] Index potentiellement dupliques apres `20260210110004_db012_add_missing_indexes.sql`**
- **Fichier**: `20260210110004_db012_add_missing_indexes.sql`
- **Description**: Cette migration cree des index avec des noms `idx_*_id` alors que d'autres index existent deja avec des noms differents (ex: `idx_orders_customer` vs `idx_orders_customer_id`). PostgreSQL gere deux index identiques comme des entites separees, ce qui double l'espace disque et ralentit les ecritures.
- **Solution**: Auditer les index en production avec `SELECT * FROM pg_indexes WHERE schemaname = 'public'` et supprimer les doublons.

### 2.5 Cascade et integrite referentielle

**[MAJEUR] `orders` - Pas de ON DELETE protection coherente**
- **Fichier**: `004_sales_orders.sql`
- **Description**: `order_items` a `ON DELETE CASCADE` depuis `orders`, mais `order_payments`, `loyalty_transactions`, `stock_movements` (via reference_id) n'ont pas de cascade coherente. La suppression d'une commande orpheline les enregistrements de paiement et les mouvements de stock.
- **Solution**: Ajouter `ON DELETE RESTRICT` sur `orders` ou `ON DELETE CASCADE` sur toutes les tables dependantes. Recommandation: RESTRICT pour eviter la perte de donnees financieres.

**[MINEUR] `section_stock.quantity` - Contrainte CHECK >= 0 peut bloquer les ajustements**
- **Fichier**: `20260203110000_section_stock_model.sql`
- **Description**: `CHECK (quantity >= 0)` empeche les stocks negatifs, ce qui est correct metier mais peut causer des erreurs lors d'ajustements d'inventaire si la sequence d'operations n'est pas correcte.
- **Solution**: Acceptable. Documenter que les ajustements doivent passer par `finalize_inventory_count()`.

### 2.6 Tables non referencees par le code applicatif

**[MINEUR] Tables potentiellement orphelines**
- **Description**: Les tables suivantes existent dans les migrations mais leur utilisation dans le code applicatif devrait etre verifiee:
  - `app_settings` (remplacee par `settings`)
  - `sound_assets`
  - `email_templates` / `receipt_templates`
  - `terminal_settings` / `settings_profiles`
  - `display_promotions` / `display_content`
- **Solution**: Auditer l'utilisation cote frontend et marquer comme deprecated si non utilisees.

---

## 3. Row Level Security (RLS)

### 3.1 Etat global des politiques RLS

La migration `20260204130000_fix_all_rls_policies.sql` a **reinitialise TOUTES les politiques RLS a `USING (TRUE)` / `WITH CHECK (TRUE)`** pour debloquer le developpement. La migration `20260210100002_reimplement_critical_rls.sql` a restaure des politiques basees sur les permissions **uniquement pour 8 tables critiques**.

**Resultat: ~50+ tables restent avec des politiques `USING (TRUE)` pour toutes les operations CRUD.**

### 3.2 Tables avec RLS basee sur les permissions (securisees)

Les tables suivantes ont des politiques d'ecriture basees sur `user_has_permission()` (migration `20260210100002`):

| Table | Permission requise (ecriture) | Statut |
|-------|-------------------------------|--------|
| `user_profiles` | `users.create` + self-update | OK |
| `roles` | `users.roles` | OK |
| `permissions` | `is_admin()` | OK |
| `role_permissions` | `users.roles` | OK |
| `user_roles` | `users.roles` | OK |
| `user_permissions` | `users.roles` | OK |
| `settings` | `settings.update` | OK |
| `audit_logs` | INSERT only (immutable) | OK |

### 3.3 Tables avec RLS trop permissive (CRITIQUE)

**[CRITIQUE] ~50 tables avec politiques `USING (TRUE)` pour INSERT/UPDATE/DELETE**
- **Fichier**: `20260204130000_fix_all_rls_policies.sql` (source du probleme)
- **Description**: Tout utilisateur authentifie peut effectuer toutes les operations CRUD sur la majorite des tables, sans verification de permission. Cela inclut des tables sensibles:

| Table | Risque | Impact |
|-------|--------|--------|
| `orders` | N'importe quel employe peut modifier/supprimer des commandes | Fraude financiere |
| `order_items` | Modification des montants apres paiement | Fraude financiere |
| `order_payments` | Creation/modification de paiements fictifs | Fraude financiere |
| `products` | Modification des prix par n'importe qui | Perte financiere |
| `stock_movements` | Injection de mouvements de stock fictifs | Fraude inventaire |
| `customers` | Modification des donnees client | Donnees corrompues |
| `purchase_orders` | Creation de commandes fournisseur non autorisees | Fraude achats |
| `pos_sessions` | Modification des caisses | Fraude caisse |
| `promotions` | Creation de promotions non autorisees | Perte financiere |
| `b2b_orders` | Modification des commandes B2B | Fraude B2B |
| `production_records` | Falsification de production | Inventaire faux |

- **Solution**: Creer une migration qui reimplemente des politiques d'ecriture basees sur les permissions pour chaque module:
  - `orders`, `order_items`, `order_payments`: `sales.create` / `sales.void`
  - `products`, `categories`, `recipes`: `products.create` / `products.update`
  - `stock_movements`, `production_records`: `inventory.create` / `inventory.adjust`
  - `customers`, `loyalty_*`: `customers.create` / `customers.update`
  - `purchase_orders`, `po_items`: `inventory.create`
  - `pos_sessions`: `sales.create`
  - `promotions`, `promotion_*`: `products.create`
  - `b2b_*`: `sales.create`

**[CRITIQUE] `idempotency_keys` - Politique `FOR ALL` trop permissive**
- **Fichier**: `20260211100000_create_idempotency_keys.sql`
- **Description**: Une seule politique `FOR ALL USING (auth.uid() IS NOT NULL)` permet a tout utilisateur authentifie de lire, modifier et supprimer les cles d'idempotence de TOUS les utilisateurs.
- **Solution**: Ajouter un champ `user_id UUID` et restreindre: `USING (user_id = auth.uid())` ou au minimum separer SELECT et INSERT.

**[MAJEUR] `section_stock` - Double politique conflictuelle**
- **Fichier**: `20260203110000_section_stock_model.sql` puis `20260204130000_fix_all_rls_policies.sql`
- **Description**: La premiere migration cree une politique basee sur `inventory.update`, puis le fix la remplace par `USING (TRUE)`. L'etat final est `USING (TRUE)`.
- **Solution**: Restaurer la politique basee sur les permissions de la migration originale.

**[MAJEUR] `user_profiles` SELECT - Tous les champs accessibles y compris `pin_hash`**
- **Fichier**: `20260210100002_reimplement_critical_rls.sql`
- **Description**: La politique SELECT sur `user_profiles` est `USING (TRUE)` pour les utilisateurs authentifies. Cela expose `pin_hash`, `failed_login_attempts`, `locked_until` a tous les employes via l'API Supabase.
- **Solution**: Utiliser la vue `user_profiles_safe` (creee dans `016_integrity_fixes.sql`) comme interface standard et restreindre le SELECT direct aux admins.

### 3.4 Tables sans RLS ou avec RLS non activee

**[MAJEUR] `sequence_tracker` - Politiques permissives**
- **Fichier**: `016_integrity_fixes.sql`
- **Description**: La table `sequence_tracker` qui gere les numeros de sequence a des politiques `FOR ALL USING (TRUE)`. N'importe quel utilisateur peut manipuler les sequences.
- **Solution**: Les politiques doivent etre `FOR SELECT USING (auth.uid() IS NOT NULL)` et aucune politique INSERT/UPDATE directe (les mises a jour passent par `get_next_daily_sequence()` SECURITY DEFINER).

**[MAJEUR] `system_alerts` - Pas de politique DELETE**
- **Fichier**: `20260210100005_recreate_order_payments_and_views.sql`
- **Description**: La table a SELECT, INSERT et UPDATE mais pas de politique DELETE. Un utilisateur authentifie ne peut pas supprimer les alertes, ce qui peut etre intentionnel mais n'est pas documente.
- **Solution**: Ajouter explicitement une politique DELETE restrictive ou documenter l'immutabilite.

---

## 4. Edge Functions

### 4.1 Inventaire des fonctions

| Fonction | Auth | CORS | Session | Critique |
|----------|------|------|---------|----------|
| `auth-verify-pin` | JWT | Shared | N/A (cree) | Oui |
| `auth-change-pin` | JWT | Shared | Oui | Oui |
| `auth-user-management` | JWT | Shared | Oui | Oui |
| `auth-get-session` | JWT | Shared | N/A | Oui |
| `auth-logout` | JWT | Shared | Non | Oui |
| `claude-proxy` | JWT | Shared | Oui | Non |
| `generate-invoice` | JWT | Shared | Non | Non |
| `send-test-email` | JWT | Shared | Non | Non |
| `send-to-printer` | JWT | Shared | Non | Non |
| `calculate-daily-report` | JWT | Shared | Non | Non |
| `intersection_stock_movements` | JWT | **Wildcard** | **Non** | Oui |
| `purchase_order_module` | JWT | **Wildcard** | **Non** | Oui |

### 4.2 Problemes critiques

**[CRITIQUE] `intersection_stock_movements` - CORS wildcard + pas de validation session + tables inexistantes**
- **Fichier**: `supabase/functions/intersection_stock_movements/index.ts`
- **Description**:
  1. Utilise `Access-Control-Allow-Origin: '*'` au lieu du module CORS partage
  2. Aucune validation de session au-dela du JWT Supabase
  3. Reference des tables `storage_sections` et `section_items` qui n'existent PAS dans le schema (les tables sont `sections` et `section_stock`)
  4. Race condition sur le transfert de stock: lecture du stock puis mise a jour sans verrouillage (`FOR UPDATE`)
  5. Contourne le trail d'audit `stock_movements` en modifiant directement `section_items`
- **Solution**:
  - Remplacer CORS wildcard par le module `_shared/cors.ts`
  - Ajouter `requireSession()` du module `_shared/session-auth.ts`
  - Corriger les noms de tables vers `sections` et `section_stock`
  - Utiliser `SELECT ... FOR UPDATE` pour le verrouillage
  - Creer des `stock_movements` pour chaque transfert

**[CRITIQUE] `purchase_order_module` - CORS wildcard + pas de validation + injection potentielle**
- **Fichier**: `supabase/functions/purchase_order_module/index.ts`
- **Description**:
  1. Utilise `Access-Control-Allow-Origin: '*'`
  2. Aucune validation de session
  3. Genere le numero PO avec `Math.random()` au lieu du trigger `generate_po_number()`
  4. Aucune validation des entrees: les donnees du body sont passees directement a `.insert()` (injection de champs)
  5. Pas de verification de permissions (n'importe quel utilisateur authentifie peut creer des PO)
- **Solution**:
  - Remplacer CORS par module partage
  - Ajouter validation session + permission `inventory.create`
  - Supprimer la generation de numero PO et laisser le trigger DB le faire
  - Ajouter la validation des champs d'entree avec un schema

**[CRITIQUE] `auth-logout` - Pas de validation de session/proprietaire**
- **Fichier**: `supabase/functions/auth-logout/index.ts`
- **Description**: La fonction accepte `user_id` et `session_id` depuis le body de la requete sans verifier que l'appelant est bien le proprietaire de la session. Un utilisateur malveillant pourrait deconnecter n'importe quel autre utilisateur en connaissant son `session_id`.
- **Solution**: Valider le token de session de l'appelant avec `requireSession()`, puis verifier que `session.user_id` correspond au `user_id` demande.

### 4.3 Problemes majeurs

**[MAJEUR] `auth-verify-pin` - Tentatives echouees non incrementees**
- **Fichier**: `supabase/functions/auth-verify-pin/index.ts`
- **Description**: La fonction verifie `locked_until` et `failed_login_attempts` mais ne les incremente pas en cas d'echec. La fonction `verify_user_pin()` en base ne gere pas non plus l'incrementation. Le rate limiting est donc ineffectif cote serveur.
- **Solution**: Ajouter `UPDATE user_profiles SET failed_login_attempts = failed_login_attempts + 1, locked_until = CASE WHEN failed_login_attempts >= 2 THEN NOW() + INTERVAL '15 minutes' END WHERE id = user_id` en cas d'echec.

**[MAJEUR] `auth-get-session` - Token de session stocke/compare en clair**
- **Fichier**: `supabase/functions/auth-get-session/index.ts`
- **Description**: Le token de session est stocke et recherche en clair dans `pin_auth_sessions.session_token`. Si la base est compromise, tous les tokens actifs sont exposes.
- **Solution**: Stocker le hash du token (SHA-256) et comparer les hash.

**[MAJEUR] `generate-invoice` - Numero de facture non thread-safe**
- **Fichier**: `supabase/functions/generate-invoice/index.ts`
- **Description**: Le numero de facture est genere avec `COUNT(*) + 1` ce qui cree des doublons en cas de requetes concurrentes.
- **Solution**: Utiliser `get_next_daily_sequence('invoice')` ou un equivalent thread-safe.

**[MAJEUR] `send-to-printer` - Tax hardcodee a 11%**
- **Fichier**: `supabase/functions/send-to-printer/index.ts`
- **Description**: Le formatage du recu contient `Tax (11%)` en dur alors que la regle metier est 10% TTC (tax = total x 10/110).
- **Solution**: Lire le taux de taxe depuis les settings ou l'ordre, et corriger la formule.

**[MAJEUR] `generate-invoice` - Adresse de l'entreprise hardcodee**
- **Fichier**: `supabase/functions/generate-invoice/index.ts`
- **Description**: L'adresse "The Breakery" est hardcodee dans le template HTML au lieu d'etre lue depuis les settings de l'entreprise.
- **Solution**: Lire depuis `settings` (cle `company.*`).

### 4.4 Problemes mineurs

**[MINEUR] `send-test-email` - Stub non fonctionnel**
- **Fichier**: `supabase/functions/send-test-email/index.ts`
- **Description**: La fonction lit les parametres SMTP depuis la base mais ne fait aucun envoi reel. Elle retourne toujours `success: true`.
- **Solution**: Implementer l'envoi reel via un service SMTP ou marquer la fonction comme deprecated.

**[MINEUR] `claude-proxy` - Limite max_tokens a 4096**
- **Fichier**: `supabase/functions/claude-proxy/index.ts`
- **Description**: Le `max_tokens` est plafonne a 4096 meme si le client demande plus. Ce n'est pas un bug mais pourrait limiter certains cas d'usage.
- **Solution**: Rendre configurable via settings ou documenter la limite.

**[MINEUR] Code duplique entre `intersection_stock_movements` et `purchase_order_module`**
- **Description**: Les deux fonctions reimplementent la gestion CORS au lieu d'utiliser `_shared/cors.ts`, et implementent leur propre logique de routage HTTP.
- **Solution**: Refactoriser pour utiliser les modules partages.

---

## 5. Fonctions SQL, Triggers et Vues

### 5.1 Inventaire des fonctions principales

| Fonction | Type | SECURITY DEFINER | Justification |
|----------|------|-------------------|---------------|
| `user_has_permission()` | RLS helper | Oui | Necessaire pour les checks RLS |
| `is_admin()` | RLS helper | Oui | Necessaire pour les checks RLS |
| `get_current_user_profile_id()` | RLS helper | Oui | Necessaire pour les checks RLS |
| `verify_user_pin()` | Auth | Oui | Acces direct a pin_hash |
| `set_user_pin()` | Auth | Oui | Ecriture pin_hash |
| `open_shift()` | Business | Oui | Verification auth.uid() |
| `finalize_inventory_count()` | Business | Oui | Permission check interne |
| `deduct_stock_on_sale_items()` | Trigger | Oui | Operation systeme |
| `record_stock_before_after()` | Trigger | Non | Trigger interne |
| `sync_product_total_stock()` | Trigger | Non | Trigger interne |
| `get_settings_by_category()` | RPC | Oui | Lecture settings |
| `update_setting()` | RPC | Oui | Ecriture settings + history |
| `update_settings_bulk()` | RPC | Oui | Ecriture settings en lot |
| `reset_setting()` | RPC | Oui | Reset settings |
| `get_sales_comparison()` | Reporting | Oui | Lecture orders |
| `get_reporting_dashboard_summary()` | Reporting | Oui | Lecture multi-tables |
| `add_loyalty_points()` | Business | Non | Pas de SECURITY DEFINER |
| `redeem_loyalty_points()` | Business | Non | Pas de SECURITY DEFINER |
| `get_customer_product_price()` | Business | Non | Lecture seule |

### 5.2 Problemes critiques

**[CRITIQUE] `update_setting()` - Pas de verification de permission**
- **Fichier**: `20260205160000_add_settings_rpc_functions.sql`
- **Description**: La fonction est `SECURITY DEFINER` mais ne verifie pas `user_has_permission(uid, 'settings.update')` avant de modifier un setting. N'importe quel utilisateur authentifie peut appeler `SELECT update_setting('key', 'value')` et modifier les parametres systeme.
- **Solution**: Ajouter en debut de fonction:
  ```sql
  IF NOT user_has_permission(get_current_user_profile_id(), 'settings.update') THEN
      RAISE EXCEPTION 'Permission denied: settings.update required';
  END IF;
  ```
  Appliquer la meme correction a `update_settings_bulk()`, `reset_setting()` et `reset_category_settings()`.

### 5.3 Problemes majeurs

**[MAJEUR] `get_settings_by_category()` - SECURITY DEFINER non necessaire**
- **Fichier**: `20260205160000_add_settings_rpc_functions.sql`
- **Description**: Cette fonction de lecture est `SECURITY DEFINER` alors que le SELECT sur `settings` est deja autorise pour les authentifies. Le SECURITY DEFINER eleve les privileges inutilement.
- **Solution**: Supprimer `SECURITY DEFINER` ou ajouter une verification de permission lecture.

**[MAJEUR] `add_loyalty_points()` / `redeem_loyalty_points()` - Pas de SECURITY DEFINER**
- **Fichier**: `011_functions_triggers.sql`
- **Description**: Ces fonctions modifient `customers.loyalty_points` et `loyalty_transactions` mais ne sont pas `SECURITY DEFINER`. Elles dependent donc des politiques RLS de l'appelant, qui sont actuellement `USING (TRUE)`.
- **Solution**: Ajouter `SECURITY DEFINER` et une verification de permission `customers.loyalty` interne.

**[MAJEUR] `get_sales_comparison()` / `get_reporting_dashboard_summary()` - SECURITY DEFINER sans check de permission**
- **Fichier**: `20260210100005_recreate_order_payments_and_views.sql`
- **Description**: Ces fonctions de reporting sont SECURITY DEFINER mais ne verifient pas `reports.sales` ou `reports.financial`. N'importe quel utilisateur authentifie peut acceder aux donnees financieres.
- **Solution**: Ajouter un check de permission `reports.sales` ou `reports.financial`.

**[MAJEUR] `finalize_inventory_count()` - Generation de movement_id non thread-safe**
- **Fichier**: `20260210110001_db006_fix_finalize_inventory_count.sql`
- **Description**: Le `movement_id` est genere avec `EXTRACT(EPOCH FROM NOW()) || md5(random())`. En cas d'appels simultanees, deux operations pourraient generer le meme movement_id si elles tombent dans la meme seconde.
- **Solution**: Utiliser `get_next_daily_sequence('movement')` ou un UUID.

**[MAJEUR] Pas de nettoyage automatique des `idempotency_keys` expirees**
- **Fichier**: `20260211100000_create_idempotency_keys.sql`
- **Description**: La table a un champ `expires_at` mais aucun mecanisme de nettoyage (pas de pg_cron, pas de trigger, pas de fonction). Les cles expirees s'accumulent indefiniment.
- **Solution**: Creer une fonction `cleanup_expired_idempotency_keys()` et la planifier via pg_cron ou un appel periodique.

**[MAJEUR] Pas de nettoyage de la `sync_queue`**
- **Fichier**: `010_lan_sync_display.sql`
- **Description**: Les entrees de `sync_queue` traitees ne sont jamais nettoyees. Sur le long terme, cette table grossira indefiniment.
- **Solution**: Ajouter un cleanup periodique des entrees `status = 'completed'` de plus de 7 jours.

### 5.4 Triggers - Inventaire et analyse

| Trigger | Table | Event | Fonction | Statut |
|---------|-------|-------|----------|--------|
| `tr_update_updated_at_*` | ~20 tables | BEFORE UPDATE | `update_updated_at()` | OK |
| `tr_generate_order_number` | `orders` | BEFORE INSERT | `generate_order_number()` | OK (post-016) |
| `tr_generate_session_number` | `pos_sessions` | BEFORE INSERT | `generate_session_number()` | OK (post-016) |
| `tr_generate_movement_id` | `stock_movements` | BEFORE INSERT | `generate_movement_id()` | OK (post-016) |
| `tr_record_stock_before_after` | `stock_movements` | BEFORE INSERT | `record_stock_before_after()` | OK (post-DB007) |
| `tr_deduct_stock_on_sale` | `orders` | AFTER UPDATE | `deduct_stock_on_sale_items()` | OK |
| `tr_deduct_stock_on_sale_insert` | `orders` | AFTER INSERT | `deduct_stock_on_sale_items()` | OK (offline sync) |
| `trg_sync_product_stock` | `section_stock` | AFTER INS/UPD/DEL | `sync_product_total_stock()` | OK |
| `tr_update_product_stock` | `stock_movements` | AFTER INSERT | `update_product_stock()` | **DESACTIVE** (DB-005) |

**[MINEUR] `update_product_stock()` - Fonction obsolete conservee**
- **Fichier**: `20260210110000_db005_resolve_stock_trigger_conflict.sql`
- **Description**: Le trigger est desactive mais la fonction existe toujours. Le commentaire indique "kept for potential rollback" mais cela prête a confusion.
- **Solution**: Acceptable pour rollback. Ajouter un prefixe `_deprecated_` ou documenter clairement.

**[MINEUR] `deduct_stock_on_sale_items()` ne cree pas d'entrees `section_stock`**
- **Fichier**: `20260210110002_db007_standardize_stock_movement_quantities.sql`
- **Description**: La fonction insere dans `stock_movements` mais ne met pas a jour `section_stock`. Or, `section_stock` est la source de verite (DB-005). Les deductions de vente ne passent pas par `section_stock` et donc `products.current_stock` n'est mis a jour que par `record_stock_before_after()` (qui calcule stock_after mais ne fait pas de UPDATE).
- **Solution**: Soit la fonction doit aussi mettre a jour `section_stock`, soit le trigger `tr_update_product_stock` (actuellement desactive) doit etre restaure uniquement pour les mouvements de type `sale_*`.

### 5.5 Vues - Inventaire et analyse

| Vue | Source | Derniere version | Statut |
|-----|--------|-----------------|--------|
| `view_daily_kpis` | `orders` | `20260210100005` | OK |
| `view_inventory_valuation` | `products`, `categories` | `20260210100005` | OK |
| `view_payment_method_stats` | `orders` | `20260210100005` | OK |
| `view_product_sales` | `order_items`, `products` | `20260210110006` | OK |
| `view_staff_performance` | `user_profiles`, `orders` | `20260210100005` | OK |
| `view_hourly_sales` | `orders` | `20260210100005` | OK |
| `view_category_sales` | `categories`, `order_items` | `20260210110006` | OK |
| `view_customer_insights` | `customers`, `customer_categories` | `20260210100005` | OK |
| `view_stock_alerts` | `products`, `categories` | `20260210100005` | OK |
| `view_session_summary` | `pos_sessions`, `user_profiles` | `20260210100005` | OK |
| `view_b2b_performance` | `customers`, `b2b_orders` | `20260210100005` | OK |
| `view_production_summary` | `production_records`, `products` | `20260210100005` | OK |
| `view_kds_queue_status` | `kds_order_queue` | `20260210100005` | OK |
| `view_order_type_distribution` | `orders` | `20260210100005` | OK |
| `view_profit_loss` | `orders`, `order_items` | `20260210110006` | OK |
| `view_sales_by_customer` | `customers`, `orders` | `20260210100005` | OK |
| `view_sales_by_hour` | `orders` | `20260210100005` | OK |
| `view_session_cash_balance` | `pos_sessions`, `user_profiles` | `20260210100005` | OK |
| `view_b2b_receivables` | `customers`, `b2b_orders` | `20260210100005` | OK |
| `view_stock_warning` | `products`, `categories` | `20260210100005` | OK |
| `view_expired_stock` | `stock_movements`, `products` | `20260210100005` | OK |
| `view_unsold_products` | `products`, `order_items` | `20260210110006` | OK |
| `view_section_stock_details` | `section_stock`, `sections`, `products` | `20260203110000` | OK |
| `user_profiles_safe` | `user_profiles` | `016_integrity_fixes` | OK |

**[MINEUR] Vues de reporting - Pas de controle d'acces**
- **Description**: Les vues heritent des politiques RLS de leurs tables source. Puisque les tables ont `SELECT USING (TRUE)`, tous les employes peuvent voir toutes les donnees financieres.
- **Solution**: Les vues elles-memes ne peuvent pas avoir de RLS. Le controle doit etre fait cote application (hooks `useReportPermissions`) ou via des fonctions RPC avec check de permission.

**[MINEUR] `view_daily_kpis` et `view_payment_method_stats` utilisent `o.payment_method`**
- **Description**: Ces vues lisent `orders.payment_method` alors que le systeme supporte les paiements splits via `order_payments`. Les vues ne refletent pas la repartition reelle des methodes de paiement pour les commandes avec paiement split.
- **Solution**: Refactoriser pour joindre `order_payments` au lieu de lire `orders.payment_method`.

---

## 6. Synthese des constats

### Par severite

#### CRITIQUE (8)

| # | Zone | Constat | Fichier |
|---|------|---------|---------|
| C1 | RLS | ~50 tables avec USING(TRUE) pour toutes operations CRUD | `20260204130000` |
| C2 | RLS | `idempotency_keys` FOR ALL sans isolation par utilisateur | `20260211100000` |
| C3 | Edge | `intersection_stock_movements`: CORS wildcard + pas de session + tables inexistantes + race condition | `intersection_stock_movements/index.ts` |
| C4 | Edge | `purchase_order_module`: CORS wildcard + pas de validation + injection de champs | `purchase_order_module/index.ts` |
| C5 | Edge | `auth-logout`: pas de validation proprietaire de session | `auth-logout/index.ts` |
| C6 | SQL | `update_setting()` SECURITY DEFINER sans check de permission | `20260205160000` |
| C7 | SQL | `deduct_stock_on_sale_items()` ne met pas a jour `section_stock` (source de verite) | `20260210110002` |
| C8 | Schema | `purchase_orders.tax_rate` default 0.11 au lieu de 0.10 | `005_inventory_stock.sql` |

#### MAJEUR (19)

| # | Zone | Constat | Fichier |
|---|------|---------|---------|
| M1 | Schema | `loyalty_transactions.order_id` sans FK | `003_customers_loyalty.sql` |
| M2 | Schema | `user_profiles.pin_code` colonne en clair non supprimee | `008_users_permissions.sql` |
| M3 | Schema | `orders` CASCADE inconsistante (paiements/mouvements orphelins) | `004_sales_orders.sql` |
| M4 | RLS | `section_stock` politique permissive apres reset | `20260204130000` |
| M5 | RLS | `user_profiles` SELECT expose pin_hash a tous | `20260210100002` |
| M6 | RLS | `sequence_tracker` USING(TRUE) pour toutes operations | `016_integrity_fixes.sql` |
| M7 | RLS | `system_alerts` pas de politique DELETE | `20260210100005` |
| M8 | Edge | `auth-verify-pin` n'incremente pas les echecs | `auth-verify-pin/index.ts` |
| M9 | Edge | `auth-get-session` token en clair en base | `auth-get-session/index.ts` |
| M10 | Edge | `generate-invoice` numero non thread-safe (COUNT+1) | `generate-invoice/index.ts` |
| M11 | Edge | `send-to-printer` tax hardcodee 11% au lieu de 10% | `send-to-printer/index.ts` |
| M12 | Edge | `generate-invoice` adresse entreprise hardcodee | `generate-invoice/index.ts` |
| M13 | SQL | `get_settings_by_category()` SECURITY DEFINER inutile | `20260205160000` |
| M14 | SQL | `add/redeem_loyalty_points()` pas SECURITY DEFINER | `011_functions_triggers.sql` |
| M15 | SQL | `get_sales_comparison()` SECURITY DEFINER sans check permission | `20260210100005` |
| M16 | SQL | `finalize_inventory_count()` movement_id non thread-safe | `20260210110001` |
| M17 | SQL | Pas de nettoyage `idempotency_keys` expirees | `20260211100000` |
| M18 | SQL | Pas de nettoyage `sync_queue` traitee | `010_lan_sync_display.sql` |
| M19 | Schema | `purchase_orders.tax_rate` inconsistance residuelle | `005_inventory_stock.sql` |

#### MINEUR (16)

| # | Zone | Constat |
|---|------|---------|
| m1 | Schema | `order_payments.created_by` reference inconsistante |
| m2 | Schema | `orders.refunded_by` reference `auth.users` au lieu de `user_profiles` |
| m3 | Schema | Colonnes i18n (name_fr/en/id) non utilisees |
| m4 | Schema | `stock_movements.movement_type` potentiel conflit VARCHAR vs ENUM |
| m5 | Schema | `product_uoms` creee deux fois |
| m6 | Schema | Index potentiellement dupliques |
| m7 | Schema | `section_stock` CHECK >= 0 peut bloquer ajustements |
| m8 | Schema | Tables potentiellement orphelines |
| m9 | Edge | `send-test-email` stub non fonctionnel |
| m10 | Edge | `claude-proxy` max_tokens plafonne a 4096 |
| m11 | Edge | Code duplique CORS/routing dans 2 fonctions |
| m12 | SQL | `update_product_stock()` obsolete mais conservee |
| m13 | SQL | `deduct_stock_on_sale_items()` ne cree pas d'entrees section_stock |
| m14 | Vues | Pas de controle d'acces sur les vues de reporting |
| m15 | Vues | `view_daily_kpis`/`view_payment_method_stats` ignorent les paiements splits |
| m16 | Schema | settings_categories i18n columns unused |

---

## 7. Plan de remediation prioritaire

### Phase 1 - Securite critique (Immediat - Sprint courant)

1. **Reimplementer les politiques RLS d'ecriture** pour les tables financieres (`orders`, `order_items`, `order_payments`, `stock_movements`, `pos_sessions`) en s'appuyant sur le pattern de `20260210100002`.

2. **Corriger `intersection_stock_movements`** et `purchase_order_module`**: Remplacer CORS wildcard, ajouter session auth, corriger les noms de tables, ajouter validation d'entree.

3. **Ajouter les checks de permission** dans `update_setting()`, `update_settings_bulk()`, `reset_setting()`, `reset_category_settings()`.

4. **Securiser `auth-logout`** en validant que l'appelant possede la session.

5. **Corriger le tax rate default** de `purchase_orders` de 0.11 a 0.10.

### Phase 2 - Securite majeure (Sprint suivant)

6. **Reimplementer les politiques RLS** pour toutes les tables metier restantes (`products`, `customers`, `suppliers`, `promotions`, `b2b_*`, `production_records`, etc.).

7. **Ajouter l'incrementation des echecs PIN** dans `auth-verify-pin`.

8. **Hasher les tokens de session** dans `pin_auth_sessions`.

9. **Supprimer la colonne `user_profiles.pin_code`**.

10. **Corriger `deduct_stock_on_sale_items()`** pour mettre a jour `section_stock` ou reactiver partiellement `tr_update_product_stock`.

### Phase 3 - Qualite et maintenance (Backlog)

11. Ajouter la FK manquante sur `loyalty_transactions.order_id`.
12. Corriger le taux de taxe hardcode dans `send-to-printer`.
13. Implementer le nettoyage periodique de `idempotency_keys` et `sync_queue`.
14. Standardiser les references FK vers `user_profiles(id)`.
15. Auditer et dedupliquer les index.
16. Refactoriser les vues de reporting pour supporter les paiements splits.
17. Rendre les numero de facture thread-safe dans `generate-invoice`.

---

*Fin du rapport d'audit backend/base de donnees.*
