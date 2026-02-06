# Epic 10: Settings Expansion — Paramètres Configurables pour Tous les Modules

Status: backlog

## Overview

Actuellement, plus de 155 paramètres opérationnels sont hardcodés dans le codebase AppGrav. Cette epic transforme ces constantes en paramètres configurables via l'interface Settings, permettant aux administrateurs d'ajuster le comportement de l'application sans intervention développeur.

**Architecture:** L'infrastructure settings existante (table `settings` JSONB + `settings_categories` + audit trail + RPC functions + Zustand store + React Query hooks) est mature et extensible. Cette epic ajoute de nouvelles catégories et settings rows, crée les pages UI correspondantes, puis migre progressivement les valeurs hardcodées vers le settings store.

**Impact:** ~155+ paramètres répartis sur 8 modules (POS, Inventaire, Loyalty, B2B, KDS, Display, Sync, Sécurité).

**Offline Integration:** Les settings sont chargés au démarrage via `settingsStore.initialize()` et cachés en mémoire. Les nouvelles valeurs suivent le même pattern — lecture depuis le store, pas de requête DB à chaud.

---

## Stories

---

### Story 10.1: Migration DB — Nouvelles catégories et settings rows

**As a** développeur,
**I want** les nouvelles catégories et settings rows insérées en base,
**So that** l'infrastructure est prête pour les pages UI et la migration des constantes.

**Acceptance Criteria:**

#### AC1: Nouvelles catégories créées

**Given** la table `settings_categories` existante
**When** la migration s'exécute
**Then** les catégories suivantes sont ajoutées (si absentes) :
- `financial` (icon: Banknote, sort_order après tax)
- `pos_config` (icon: ShoppingCart, sort_order après pos)
- `inventory_config` (icon: PackageSearch, sort_order après inventory)
- `loyalty` (icon: Heart, sort_order après customers)
- `b2b` (icon: Building, sort_order après loyalty)
- `kds_config` (icon: ChefHat, sort_order après kds)
- `display` (icon: Monitor, sort_order après kds_config)
- `sync_advanced` (icon: RefreshCw, sort_order avant advanced)
**And** chaque catégorie a un `required_permission` approprié (settings.update ou module-specific)

#### AC2: Settings POS insérées

**Given** la catégorie `pos_config`
**When** la migration s'exécute
**Then** les settings suivantes sont créées avec leurs default_value :
- `pos_config.quick_payment_amounts` → `[50000, 100000, 150000, 200000, 500000]` (type: array)
- `pos_config.shift_opening_cash_presets` → `[100000, 200000, 300000, 500000, 1000000]` (type: array)
- `pos_config.quick_discount_percentages` → `[5, 10, 15, 20, 25, 50]` (type: array)
- `pos_config.max_discount_percentage` → `100` (type: number)
- `pos_config.shift_reconciliation_tolerance` → `5000` (type: number)
- `pos_config.refund_methods` → `["same", "cash", "card", "transfer"]` (type: array)
- `pos_config.void_required_roles` → `["manager", "admin"]` (type: array)
- `pos_config.refund_required_roles` → `["manager", "admin"]` (type: array)
- `pos_config.shift_required_roles` → `["cashier", "manager", "admin", "barista"]` (type: array)

#### AC3: Settings Financial insérées

**Given** la catégorie `financial`
**When** la migration s'exécute
**Then** les settings suivantes sont créées :
- `financial.max_payment_amount` → `10000000000` (type: number)
- `financial.currency_rounding_unit` → `100` (type: number)
- `financial.rounding_tolerance` → `1` (type: number)
- `financial.reference_required_methods` → `["card", "qris", "edc", "transfer"]` (type: array)

#### AC4: Settings Inventory insérées

**Given** la catégorie `inventory_config`
**When** la migration s'exécute
**Then** les settings suivantes sont créées :
- `inventory_config.stock_warning_threshold` → `10` (type: number)
- `inventory_config.stock_critical_threshold` → `5` (type: number)
- `inventory_config.stock_percentage_warning` → `50` (type: number)
- `inventory_config.stock_percentage_critical` → `20` (type: number)
- `inventory_config.reorder_lookback_days` → `30` (type: number)
- `inventory_config.production_lookback_days` → `7` (type: number)
- `inventory_config.max_stock_multiplier` → `2` (type: number)
- `inventory_config.po_lead_time_days` → `7` (type: number)
- `inventory_config.stock_movements_default_limit` → `500` (type: number)
- `inventory_config.stock_movements_product_limit` → `100` (type: number)
- `inventory_config.low_stock_refresh_interval_seconds` → `300` (type: number)
- `inventory_config.production_priority_high_threshold` → `20` (type: number)
- `inventory_config.production_priority_medium_threshold` → `50` (type: number)

#### AC5: Settings Loyalty insérées

**Given** la catégorie `loyalty`
**When** la migration s'exécute
**Then** les settings suivantes sont créées :
- `loyalty.tier_discounts` → `{"bronze": 0, "silver": 5, "gold": 8, "platinum": 10}` (type: json)
- `loyalty.tier_thresholds` → `{"bronze": 0, "silver": 500, "gold": 2000, "platinum": 5000}` (type: json)
- `loyalty.tier_colors` → `{"bronze": "#cd7f32", "silver": "#c0c0c0", "gold": "#ffd700", "platinum": "#e5e4e2"}` (type: json)
- `loyalty.points_per_idr` → `1000` (type: number, description: "1 point par X IDR dépensés")
- `loyalty.default_customer_category_slug` → `"standard"` (type: string)

#### AC6: Settings B2B insérées

**Given** la catégorie `b2b`
**When** la migration s'exécute
**Then** les settings suivantes sont créées :
- `b2b.default_payment_terms_days` → `30` (type: number)
- `b2b.critical_overdue_threshold_days` → `30` (type: number)
- `b2b.aging_buckets` → `[{"label": "Current", "min": 0, "max": 30}, {"label": "Overdue", "min": 31, "max": 60}, {"label": "Critical", "min": 61, "max": null}]` (type: json)
- `b2b.payment_term_options` → `["cod", "net15", "net30", "net60"]` (type: array)

#### AC7: Settings KDS insérées

**Given** la catégorie `kds_config`
**When** la migration s'exécute
**Then** les settings suivantes sont créées :
- `kds_config.urgency_warning_seconds` → `300` (type: number)
- `kds_config.urgency_critical_seconds` → `600` (type: number)
- `kds_config.auto_remove_delay_ms` → `5000` (type: number)
- `kds_config.poll_interval_ms` → `5000` (type: number)
- `kds_config.exit_animation_duration_ms` → `300` (type: number)

#### AC8: Settings Display insérées

**Given** la catégorie `display`
**When** la migration s'exécute
**Then** les settings suivantes sont créées :
- `display.idle_timeout_seconds` → `30` (type: number)
- `display.promo_rotation_interval_seconds` → `10` (type: number)
- `display.ready_order_visible_duration_minutes` → `5` (type: number)
- `display.broadcast_debounce_ms` → `100` (type: number)

#### AC9: Settings Sécurité insérées (dans catégorie `security` existante)

**Given** la catégorie `security` existante
**When** la migration s'exécute
**Then** les settings suivantes sont ajoutées :
- `security.pin_min_length` → `4` (type: number)
- `security.pin_max_length` → `6` (type: number)
- `security.pin_max_attempts` → `3` (type: number)
- `security.pin_cooldown_minutes` → `15` (type: number)

#### AC10: Settings Sync/Advanced insérées (dans catégorie `sync_advanced`)

**Given** la catégorie `sync_advanced`
**When** la migration s'exécute
**Then** les settings suivantes sont créées :
- `sync_advanced.startup_delay_ms` → `5000` (type: number)
- `sync_advanced.background_interval_ms` → `30000` (type: number)
- `sync_advanced.item_process_delay_ms` → `100` (type: number)
- `sync_advanced.retry_backoff_delays_ms` → `[5000, 10000, 30000, 60000, 300000]` (type: array)
- `sync_advanced.max_queue_size` → `500` (type: number)
- `sync_advanced.max_retries` → `3` (type: number)
- `sync_advanced.cache_ttl_default_hours` → `24` (type: number)
- `sync_advanced.cache_ttl_orders_hours` → `168` (type: number)
- `sync_advanced.cache_refresh_interval_hours` → `1` (type: number)

#### AC11: Settings Print insérées (dans catégorie `printing` existante)

**Given** la catégorie `printing` existante
**When** la migration s'exécute
**Then** les settings suivantes sont ajoutées :
- `printing.server_url` → `"http://localhost:3001"` (type: string)
- `printing.request_timeout_ms` → `5000` (type: number)
- `printing.health_check_timeout_ms` → `2000` (type: number)

#### AC12: Settings LAN insérées (dans catégorie `sync_advanced` ou nouvelle)

**Given** la catégorie appropriée
**When** la migration s'exécute
**Then** les settings suivantes sont créées :
- `sync_advanced.lan_heartbeat_interval_ms` → `30000` (type: number)
- `sync_advanced.lan_stale_timeout_ms` → `120000` (type: number)
- `sync_advanced.lan_max_reconnect_attempts` → `10` (type: number)
- `sync_advanced.lan_reconnect_backoff_base_ms` → `1000` (type: number)
- `sync_advanced.lan_reconnect_backoff_max_ms` → `60000` (type: number)

## Tasks / Subtasks

- [ ] **Task 1: Créer migration SQL** (AC: 1-12)
  - [ ] 1.1: INSERT INTO settings_categories pour les nouvelles catégories
  - [ ] 1.2: INSERT INTO settings pour toutes les settings rows (~75 settings)
  - [ ] 1.3: Ajouter validation_rules JSONB pour les contraintes (min, max, required)
  - [ ] 1.4: Tester migration up/down

## Dev Notes

- Utiliser `ON CONFLICT DO NOTHING` pour l'idempotence
- Les `validation_rules` suivent le format `{"min": N, "max": N, "required": true}`
- Chaque setting doit avoir `name_fr` renseigné (document_output_language = francais)
- RLS existantes sur `settings` suffisent (authenticated read, permission-based write)

---

### Story 10.2: Types TypeScript — Interfaces pour les nouvelles settings

**As a** développeur,
**I want** des interfaces TypeScript typées pour chaque groupe de settings,
**So that** l'accès aux settings est type-safe dans tout le codebase.

**Acceptance Criteria:**

#### AC1: Interfaces définies

**Given** le fichier `src/types/settings.ts`
**When** les nouvelles interfaces sont ajoutées
**Then** les interfaces suivantes existent :
- `IPOSConfigSettings` (quick amounts, discounts, roles, shift)
- `IFinancialSettings` (max payment, rounding, reference methods)
- `IInventoryConfigSettings` (thresholds, lookback periods, multipliers)
- `ILoyaltySettings` (tiers, discounts, colors, conversion)
- `IB2BSettings` (payment terms, aging, overdue)
- `IKDSConfigSettings` (urgency, auto-remove, polling)
- `IDisplaySettings` (idle, promo, order visibility)
- `ISyncAdvancedSettings` (intervals, retry, cache TTLs, LAN)

#### AC2: Hook helpers créés

**Given** les nouvelles interfaces
**When** un composant a besoin des settings d'un module
**Then** des hooks typés sont disponibles :
- `usePOSConfigSettings(): IPOSConfigSettings`
- `useFinancialSettings(): IFinancialSettings`
- `useInventoryConfigSettings(): IInventoryConfigSettings`
- `useLoyaltySettings(): ILoyaltySettings`
- `useB2BSettings(): IB2BSettings`
- `useKDSConfigSettings(): IKDSConfigSettings`
- `useDisplaySettings(): IDisplaySettings`
- `useSyncAdvancedSettings(): ISyncAdvancedSettings`
**And** chaque hook utilise `useSettingsByCategory()` avec parsing typé
**And** chaque hook retourne des valeurs par défaut si les settings ne sont pas encore chargées

## Tasks / Subtasks

- [ ] **Task 1: Ajouter interfaces dans types/settings.ts** (AC: 1)
  - [ ] 1.1: Définir les 8 interfaces avec JSDoc
  - [ ] 1.2: Exporter depuis l'index
- [ ] **Task 2: Créer hooks typés** (AC: 2)
  - [ ] 2.1: Créer `src/hooks/settings/useModuleSettings.ts` avec les 8 hooks
  - [ ] 2.2: Implémenter parsing JSONB → interface typée avec defaults
  - [ ] 2.3: Exporter depuis hooks/settings/index.ts

## Dev Notes

- Pattern existant : `useSettingsByCategory(code)` retourne `Setting[]`, le hook typé parse les values
- Utiliser `parseSettingValue()` du settingsStore pour le parsing JSONB
- Les defaults doivent matcher exactement les `default_value` de la migration

---

### Story 10.3: Page Settings POS Configuration

**As a** manager/admin,
**I want** configurer les paramètres du POS depuis l'interface Settings,
**So that** je peux ajuster les montants rapides, discounts et rôles sans toucher au code.

**Acceptance Criteria:**

#### AC1: Page POS Config accessible

**Given** un utilisateur avec permission `settings.update`
**When** il navigue vers `/settings/pos-config`
**Then** la page affiche les sections :
- **Montants rapides caisse** : éditeur de liste de montants (ajout/suppression/réordonnancement)
- **Montants rapides ouverture shift** : même éditeur
- **Discounts rapides** : éditeur de liste de pourcentages
- **Discount maximum** : input numérique avec slider (0-100%)
- **Tolérance réconciliation** : input numérique (IDR)
- **Méthodes de remboursement** : checkboxes multi-select
- **Rôles requis** : 3 sections (void, refund, shift) avec multi-select des rôles

#### AC2: Sauvegarde et validation

**Given** l'utilisateur modifie un paramètre
**When** il clique sur Sauvegarder
**Then** les settings sont mises à jour via `useUpdateSetting()`
**And** un toast de confirmation s'affiche
**And** l'historique des modifications est enregistré

#### AC3: Reset aux valeurs par défaut

**Given** l'utilisateur a modifié des paramètres
**When** il clique sur "Réinitialiser"
**Then** tous les paramètres de la catégorie reviennent aux default_value
**And** une confirmation est demandée avant le reset

## Tasks / Subtasks

- [ ] **Task 1: Créer POSConfigSettingsPage** (AC: 1)
  - [ ] 1.1: Layout avec sections Card pour chaque groupe
  - [ ] 1.2: Composant ArrayEditor réutilisable (montants, pourcentages)
  - [ ] 1.3: Multi-select pour rôles et méthodes
- [ ] **Task 2: Logique save/reset** (AC: 2, 3)
  - [ ] 2.1: Handler de sauvegarde avec batch update
  - [ ] 2.2: Handler de reset avec confirmation dialog
- [ ] **Task 3: Route et navigation** (AC: 1)
  - [ ] 3.1: Ajouter route dans App.tsx
  - [ ] 3.2: Ajouter dans EXTRA_TABS ou catégorie dynamique

---

### Story 10.4: Page Settings Financial

**As a** admin,
**I want** configurer les paramètres financiers (plafonds, arrondis, méthodes),
**So that** les règles financières s'adaptent aux besoins business sans code.

**Acceptance Criteria:**

#### AC1: Page Financial accessible

**Given** un utilisateur admin
**When** il navigue vers `/settings/financial`
**Then** la page affiche :
- **Montant maximum de paiement** : input numérique formaté IDR
- **Unité d'arrondi** : select (100, 500, 1000 IDR)
- **Tolérance d'arrondi** : input numérique
- **Méthodes nécessitant une référence** : checkboxes (card, qris, edc, transfer, etc.)

#### AC2: Validation des contraintes

**Given** l'utilisateur entre une valeur invalide
**When** il tente de sauvegarder
**Then** un message d'erreur contextuel s'affiche
**And** la sauvegarde est bloquée

## Tasks / Subtasks

- [ ] **Task 1: Créer FinancialSettingsPage** (AC: 1, 2)
  - [ ] 1.1: Formulaire avec inputs formatés IDR
  - [ ] 1.2: Validation côté client (min/max depuis validation_rules)
  - [ ] 1.3: Route et navigation

---

### Story 10.5: Page Settings Inventory Configuration

**As a** manager/admin,
**I want** configurer les seuils d'alerte stock, périodes d'analyse et paramètres d'approvisionnement,
**So that** les alertes et suggestions correspondent à la réalité opérationnelle.

**Acceptance Criteria:**

#### AC1: Page Inventory Config accessible

**Given** un utilisateur avec permission `inventory.update` ou `settings.update`
**When** il navigue vers `/settings/inventory-config`
**Then** la page affiche les sections :
- **Seuils d'alerte stock** : WARNING (unités), CRITICAL (unités), WARNING % du min, CRITICAL % du min
- **Périodes d'analyse** : réapprovisionnement (jours), production (jours)
- **Approvisionnement** : multiplicateur stock max, délai livraison PO (jours)
- **Priorité production** : seuil % high, seuil % medium
- **Limites requêtes** : mouvements default, mouvements par produit
- **Rafraîchissement** : intervalle alertes low-stock (secondes)

#### AC2: Aperçu de l'impact

**Given** l'utilisateur modifie un seuil d'alerte
**When** la valeur change
**Then** un aperçu en temps réel montre combien de produits seraient en alerte avec cette nouvelle valeur

## Tasks / Subtasks

- [ ] **Task 1: Créer InventoryConfigSettingsPage** (AC: 1)
  - [ ] 1.1: Sections avec inputs numériques et tooltips explicatifs
  - [ ] 1.2: Sliders pour les pourcentages
- [ ] **Task 2: Aperçu d'impact** (AC: 2)
  - [ ] 2.1: Query pour compter les produits affectés par les nouveaux seuils
  - [ ] 2.2: Badge informatif "X produits seraient en alerte"

---

### Story 10.6: Page Settings Loyalty

**As a** admin,
**I want** configurer les tiers de fidélité, pourcentages de discount et taux de conversion des points,
**So that** le programme de fidélité s'adapte à la stratégie commerciale.

**Acceptance Criteria:**

#### AC1: Page Loyalty accessible

**Given** un utilisateur admin
**When** il navigue vers `/settings/loyalty`
**Then** la page affiche :
- **Tiers de fidélité** : tableau éditable avec pour chaque tier :
  - Nom (bronze/silver/gold/platinum)
  - Seuil de points minimum
  - Pourcentage de discount
  - Couleur (color picker)
- **Conversion points** : X IDR dépensés = 1 point
- **Catégorie client par défaut** : select des catégories existantes

#### AC2: Prévisualisation visuelle

**Given** l'utilisateur modifie une couleur ou un tier
**When** la valeur change
**Then** un aperçu des badges de fidélité s'affiche avec les nouvelles couleurs

## Tasks / Subtasks

- [ ] **Task 1: Créer LoyaltySettingsPage** (AC: 1, 2)
  - [ ] 1.1: Tableau éditable des tiers avec color pickers
  - [ ] 1.2: Input conversion points
  - [ ] 1.3: Select catégorie par défaut (query categories)
  - [ ] 1.4: Preview badges visuels
  - [ ] 1.5: Route et navigation

---

### Story 10.7: Page Settings B2B

**As a** admin,
**I want** configurer les termes de paiement B2B, seuils d'impayés et buckets de vieillissement,
**So that** la gestion des comptes B2B reflète la politique commerciale.

**Acceptance Criteria:**

#### AC1: Page B2B accessible

**Given** un utilisateur admin
**When** il navigue vers `/settings/b2b`
**Then** la page affiche :
- **Termes de paiement par défaut** : select (COD, Net 15, Net 30, Net 60) + custom
- **Options de termes disponibles** : liste éditable des options proposées aux clients
- **Seuil impayé critique** : input jours
- **Buckets aging report** : éditeur de plages (label + min/max jours), ajout/suppression

#### AC2: Validation cohérence

**Given** l'utilisateur modifie les buckets
**When** les plages se chevauchent ou ont des gaps
**Then** un warning s'affiche signalant l'incohérence

## Tasks / Subtasks

- [ ] **Task 1: Créer B2BSettingsPage** (AC: 1, 2)
  - [ ] 1.1: Formulaire avec éditeur de buckets
  - [ ] 1.2: Validation de cohérence des plages
  - [ ] 1.3: Route et navigation

---

### Story 10.8: Page Settings KDS Configuration

**As a** manager/admin,
**I want** configurer les seuils d'urgence KDS, délais d'auto-suppression et intervalles de rafraîchissement,
**So that** le comportement du KDS s'adapte au rythme de la cuisine.

**Acceptance Criteria:**

#### AC1: Page KDS Config accessible

**Given** un utilisateur avec permission appropriée
**When** il navigue vers `/settings/kds-config`
**Then** la page affiche :
- **Seuils d'urgence** : warning (minutes), critique (minutes) avec preview couleur
- **Auto-suppression** : délai avant suppression des commandes terminées (secondes)
- **Rafraîchissement** : intervalle de polling (secondes)
- **Animation** : durée animation de sortie (ms)

#### AC2: Preview visuel

**Given** l'utilisateur modifie les seuils d'urgence
**When** les valeurs changent
**Then** un aperçu montre une carte KDS avec les couleurs correspondantes (normal/warning/critique)

## Tasks / Subtasks

- [ ] **Task 1: Créer KDSConfigSettingsPage** (AC: 1, 2)
  - [ ] 1.1: Inputs avec conversion minutes↔secondes
  - [ ] 1.2: Preview carte KDS avec couleurs dynamiques
  - [ ] 1.3: Route et navigation

---

### Story 10.9: Page Settings Display & Print Avancés

**As a** admin,
**I want** configurer les paramètres d'affichage client et d'impression,
**So that** l'expérience client et les opérations d'impression sont optimales.

**Acceptance Criteria:**

#### AC1: Section Display

**Given** un utilisateur admin
**When** il navigue vers `/settings/display`
**Then** la page affiche :
- **Idle timeout** : input secondes (délai avant mode promo)
- **Rotation promos** : intervalle entre slides (secondes)
- **Durée commande prête** : minutes d'affichage avant auto-suppression
- **Debounce broadcast** : input ms (paramètre avancé)

#### AC2: Section Print avancé (ajout dans page printing existante)

**Given** la page `/settings/printing` existante
**When** l'utilisateur la consulte
**Then** une nouvelle section "Paramètres avancés" affiche :
- **URL serveur d'impression** : input texte
- **Timeout requête** : input ms
- **Timeout health check** : input ms
- **Bouton "Tester connexion"** qui ping le serveur

## Tasks / Subtasks

- [ ] **Task 1: Créer DisplaySettingsPage** (AC: 1)
  - [ ] 1.1: Formulaire avec tooltips explicatifs
  - [ ] 1.2: Route et navigation
- [ ] **Task 2: Enrichir PrintingSettingsPage** (AC: 2)
  - [ ] 2.1: Ajouter section "Paramètres avancés"
  - [ ] 2.2: Bouton test connexion (fetch /health)

---

### Story 10.10: Page Settings Sécurité — Politique PIN

**As a** admin,
**I want** configurer la politique PIN (longueur, tentatives, cooldown),
**So that** la sécurité s'adapte au niveau de risque de l'établissement.

**Acceptance Criteria:**

#### AC1: Section PIN dans page Security

**Given** la catégorie `security` existante
**When** l'utilisateur navigue vers `/settings/security`
**Then** la page affiche une section "Politique PIN" :
- **Longueur minimum** : input (2-8)
- **Longueur maximum** : input (4-12)
- **Tentatives max avant verrouillage** : input (1-10)
- **Durée de verrouillage** : input minutes (1-60)

#### AC2: Validation cohérence

**Given** l'utilisateur configure min > max
**When** il tente de sauvegarder
**Then** un message d'erreur indique l'incohérence

## Tasks / Subtasks

- [ ] **Task 1: Enrichir SecuritySettingsPage** (AC: 1, 2)
  - [ ] 1.1: Section PIN avec inputs et validation
  - [ ] 1.2: Alerte si les PIN existants ne respectent plus la nouvelle politique

---

### Story 10.11: Page Settings Sync & Avancé

**As a** admin technique,
**I want** configurer les intervalles de synchronisation, stratégie de retry et cache TTLs,
**So that** le comportement offline/sync est optimisé pour l'environnement réseau.

**Acceptance Criteria:**

#### AC1: Page Sync Advanced accessible

**Given** un utilisateur admin
**When** il navigue vers `/settings/sync-advanced`
**Then** la page affiche les sections :
- **Synchronisation** : délai démarrage (s), intervalle background (s), délai entre items (ms)
- **Stratégie de retry** : backoff delays (éditeur array ms), max retries, max queue size
- **Cache** : TTL par défaut (h), TTL commandes (h), intervalle refresh (h)
- **LAN** : heartbeat interval (s), stale timeout (s), max reconnect attempts, backoff base (ms), backoff max (ms)

#### AC2: Badge "Avancé" et warning

**Given** la nature technique de ces paramètres
**When** la page s'affiche
**Then** un bandeau warning indique "Ces paramètres sont destinés aux administrateurs techniques. Des valeurs incorrectes peuvent affecter les performances."

#### AC3: Presets

**Given** l'utilisateur souhaite une configuration rapide
**When** il sélectionne un preset
**Then** les valeurs sont pré-remplies :
- **Connexion stable** : sync interval 30s, retry conservative
- **Connexion instable** : sync interval 60s, retry aggressive, cache TTL étendu
- **Économie batterie** : sync interval 120s, minimal polling

## Tasks / Subtasks

- [ ] **Task 1: Créer SyncAdvancedSettingsPage** (AC: 1, 2)
  - [ ] 1.1: Sections avec inputs groupés
  - [ ] 1.2: Warning banner "Paramètres avancés"
- [ ] **Task 2: Système de presets** (AC: 3)
  - [ ] 2.1: Définir 3 presets avec valeurs
  - [ ] 2.2: Boutons de sélection rapide qui pré-remplissent le formulaire

---

### Story 10.12: Migration des constantes POS vers settings store

**As a** développeur,
**I want** remplacer les constantes hardcodées du POS par des lectures du settings store,
**So that** les paramètres POS sont réellement dynamiques.

**Acceptance Criteria:**

#### AC1: PaymentModal utilise settings

**Given** `PaymentModal.tsx` avec `QUICK_AMOUNTS` hardcodé
**When** le composant s'initialise
**Then** il lit `pos_config.quick_payment_amounts` depuis `usePOSConfigSettings()`
**And** fallback sur la valeur par défaut si setting non chargée

#### AC2: DiscountModal utilise settings

**Given** `DiscountModal.tsx` avec `quickPercentages` et max hardcodés
**When** le composant s'initialise
**Then** il lit `pos_config.quick_discount_percentages` et `pos_config.max_discount_percentage`

#### AC3: Void/Refund/Shift roles utilisent settings

**Given** les modals Void, Refund, Payment avec rôles hardcodés
**When** la vérification de rôle s'exécute
**Then** les rôles autorisés sont lus depuis les settings correspondantes

#### AC4: OpenShiftModal utilise settings

**Given** `OpenShiftModal.tsx` avec `QUICK_AMOUNTS` hardcodé
**When** le composant s'initialise
**Then** il lit `pos_config.shift_opening_cash_presets`

#### AC5: PaymentService utilise settings

**Given** `paymentService.ts` avec `MAX_PAYMENT_AMOUNT`, `IDR_ROUNDING`, `REFERENCE_REQUIRED_METHODS`
**When** les fonctions de validation s'exécutent
**Then** elles lisent depuis `useFinancialSettings()` ou paramètres injectés

#### AC6: ShiftHistoryModal utilise settings

**Given** la tolérance de réconciliation hardcodée à 5000
**When** l'analyse de variance s'exécute
**Then** elle lit `pos_config.shift_reconciliation_tolerance`

## Tasks / Subtasks

- [ ] **Task 1: Migrer PaymentModal** (AC: 1)
- [ ] **Task 2: Migrer DiscountModal** (AC: 2)
- [ ] **Task 3: Migrer VoidModal, RefundModal, PaymentModal roles** (AC: 3)
- [ ] **Task 4: Migrer OpenShiftModal** (AC: 4)
- [ ] **Task 5: Migrer paymentService** (AC: 5)
- [ ] **Task 6: Migrer ShiftHistoryModal** (AC: 6)

## Dev Notes

- Pattern : `const settings = usePOSConfigSettings()` en haut du composant
- Fallback : `settings.quickPaymentAmounts ?? DEFAULT_QUICK_AMOUNTS`
- Pour les services (non-React), injecter les valeurs en paramètre depuis le composant appelant
- Ne PAS supprimer les constantes par défaut — les garder comme fallback

---

### Story 10.13: Migration des constantes Inventaire vers settings store

**As a** développeur,
**I want** remplacer les constantes hardcodées de l'inventaire par des lectures du settings store,
**So that** les seuils d'alerte et paramètres d'approvisionnement sont dynamiques.

**Acceptance Criteria:**

#### AC1: inventoryAlerts.ts utilise settings

**Given** les seuils hardcodés dans `inventoryAlerts.ts`
**When** les fonctions d'alerte s'exécutent
**Then** elles utilisent les seuils depuis les settings injectées :
- `stock_percentage_critical` (au lieu de 20)
- `stock_percentage_warning` (au lieu de 50)
- `reorder_lookback_days` (au lieu de 30)
- `production_lookback_days` (au lieu de 7)
- `max_stock_multiplier` (au lieu de 2)
- `po_lead_time_days` (au lieu de 7)

#### AC2: constants/inventory.ts utilise settings

**Given** `STOCK_THRESHOLDS` et `QUERY_LIMITS` hardcodés
**When** les hooks les utilisent
**Then** les valeurs proviennent des settings avec fallback sur les constantes actuelles

#### AC3: Tax rate utilise la table tax_rates

**Given** le taux de taxe hardcodé à 0.1 dans inventoryAlerts et b2bPosOrderService
**When** un calcul fiscal s'exécute
**Then** le taux est lu depuis la table `tax_rates` (default rate) ou settings

## Tasks / Subtasks

- [ ] **Task 1: Refactorer inventoryAlerts.ts** (AC: 1)
  - [ ] 1.1: Ajouter paramètre settings aux fonctions
  - [ ] 1.2: Remplacer toutes les constantes
- [ ] **Task 2: Refactorer constants/inventory.ts** (AC: 2)
- [ ] **Task 3: Centraliser le taux de taxe** (AC: 3)
  - [ ] 3.1: Créer helper `getDefaultTaxRate()` qui lit depuis settings/tax_rates
  - [ ] 3.2: Remplacer les `0.1` hardcodés

---

### Story 10.14: Migration des constantes Loyalty, B2B et Customer vers settings store

**As a** développeur,
**I want** remplacer les constantes loyalty/B2B hardcodées par des lectures du settings store,
**So that** le programme de fidélité et les règles B2B sont dynamiques.

**Acceptance Criteria:**

#### AC1: constants/loyalty.ts utilise settings

**Given** les couleurs et discounts de tier hardcodés
**When** un composant affiche un badge loyalty ou calcule un discount
**Then** les valeurs proviennent de `useLoyaltySettings()`

#### AC2: b2bPosOrderService utilise settings

**Given** le default payment terms hardcodé à 30
**When** une commande B2B est créée
**Then** le terme par défaut vient de `b2b.default_payment_terms_days`

#### AC3: creditService et arService utilisent settings

**Given** le seuil critique 30 jours et les buckets hardcodés
**When** un aging report est généré
**Then** les valeurs proviennent des settings B2B

#### AC4: CustomerFormPage utilise settings

**Given** la catégorie par défaut "standard" hardcodée
**When** le formulaire client s'initialise
**Then** la catégorie par défaut vient de `loyalty.default_customer_category_slug`

## Tasks / Subtasks

- [ ] **Task 1: Migrer loyalty constants** (AC: 1)
- [ ] **Task 2: Migrer b2bPosOrderService** (AC: 2)
- [ ] **Task 3: Migrer creditService et arService** (AC: 3)
- [ ] **Task 4: Migrer CustomerFormPage default category** (AC: 4)

---

### Story 10.15: Migration des constantes KDS, Display, Sync et Sécurité vers settings store

**As a** développeur,
**I want** remplacer les constantes restantes par des lectures du settings store,
**So that** tous les paramètres de l'application sont dynamiques.

**Acceptance Criteria:**

#### AC1: KDS utilise settings

**Given** les seuils d'urgence et polling hardcodés
**When** KDSMainPage et KDSOrderCard s'initialisent
**Then** les valeurs proviennent de `useKDSConfigSettings()`

#### AC2: Display/Broadcast utilise settings

**Given** les timeouts et intervalles hardcodés dans displayStore et displayBroadcast
**When** le display client s'initialise
**Then** les valeurs proviennent de `useDisplaySettings()`

#### AC3: Sync engine utilise settings

**Given** les intervalles hardcodés dans syncEngine.ts
**When** le moteur de sync démarre
**Then** les timings proviennent des settings (avec fallback sur defaults)

#### AC4: Rate limiter utilise settings

**Given** MAX_ATTEMPTS=3 et COOLDOWN_MS=15min hardcodés
**When** rateLimitService vérifie un PIN
**Then** les limites proviennent de `security.pin_max_attempts` et `security.pin_cooldown_minutes`

#### AC5: Print service utilise settings

**Given** URL et timeouts hardcodés dans printService
**When** une impression est déclenchée
**Then** les valeurs proviennent des settings printing

#### AC6: LAN services utilisent settings

**Given** les heartbeat/stale/reconnect hardcodés
**When** le hub ou client LAN s'initialise
**Then** les valeurs proviennent des settings sync_advanced

## Tasks / Subtasks

- [ ] **Task 1: Migrer KDS** (AC: 1)
- [ ] **Task 2: Migrer Display** (AC: 2)
- [ ] **Task 3: Migrer Sync Engine** (AC: 3)
- [ ] **Task 4: Migrer Rate Limiter** (AC: 4)
- [ ] **Task 5: Migrer Print Service** (AC: 5)
- [ ] **Task 6: Migrer LAN Services** (AC: 6)

## Dev Notes

- Pour les services non-React (syncEngine, rateLimitService, printService, lanHub/lanClient) :
  - Option A : Lire les settings au démarrage et les passer en config
  - Option B : Accéder au store Zustand directement via `useSettingsStore.getState()`
  - Préférer Option B pour simplicité, avec fallback sur defaults hardcodés
- Les composants KDS/Display utilisent des hooks React, donc pattern standard `useXxxSettings()`

---

### Story 10.16: Tests unitaires et d'intégration

**As a** développeur,
**I want** des tests couvrant les nouveaux settings et leur migration,
**So that** la fiabilité du système de settings étendu est garantie.

**Acceptance Criteria:**

#### AC1: Tests des hooks typés

**Given** les 8 nouveaux hooks useXxxSettings
**When** les tests s'exécutent
**Then** chaque hook :
- Retourne les valeurs par défaut quand les settings ne sont pas chargées
- Parse correctement les valeurs JSONB
- Retourne les valeurs mises à jour après modification

#### AC2: Tests de migration des constantes

**Given** les composants migrés (PaymentModal, DiscountModal, etc.)
**When** les tests s'exécutent
**Then** chaque composant :
- Fonctionne avec les valeurs par défaut (backward compatible)
- Reflète les nouvelles valeurs quand les settings changent
- Gère gracieusement les settings absentes ou invalides

#### AC3: Tests des pages settings

**Given** les nouvelles pages de configuration
**When** les tests s'exécutent
**Then** chaque page :
- Charge et affiche les settings correctement
- Sauvegarde les modifications
- Valide les contraintes (min/max, cohérence)
- Reset fonctionne

## Tasks / Subtasks

- [ ] **Task 1: Tests hooks** (AC: 1)
  - [ ] 1.1: Tests pour chaque hook typé
- [ ] **Task 2: Tests migration** (AC: 2)
  - [ ] 2.1: Tests PaymentModal, DiscountModal, VoidModal avec settings mockées
  - [ ] 2.2: Tests inventoryAlerts avec différents seuils
  - [ ] 2.3: Tests loyalty/B2B avec settings dynamiques
- [ ] **Task 3: Tests pages** (AC: 3)
  - [ ] 3.1: Tests render et interaction pour chaque nouvelle page

---

## Estimation de complexité

| Story | Complexité | Effort estimé | Dépendances |
|-------|-----------|---------------|-------------|
| 10.1 Migration DB | Moyenne | 1 story point | Aucune |
| 10.2 Types & Hooks | Faible | 1 story point | 10.1 |
| 10.3 Page POS Config | Moyenne | 2 story points | 10.1, 10.2 |
| 10.4 Page Financial | Faible | 1 story point | 10.1, 10.2 |
| 10.5 Page Inventory Config | Moyenne | 2 story points | 10.1, 10.2 |
| 10.6 Page Loyalty | Moyenne | 2 story points | 10.1, 10.2 |
| 10.7 Page B2B | Moyenne | 2 story points | 10.1, 10.2 |
| 10.8 Page KDS Config | Faible | 1 story point | 10.1, 10.2 |
| 10.9 Page Display & Print | Faible | 1 story point | 10.1, 10.2 |
| 10.10 Page Sécurité PIN | Faible | 1 story point | 10.1, 10.2 |
| 10.11 Page Sync Avancé | Moyenne | 2 story points | 10.1, 10.2 |
| 10.12 Migration POS | Haute | 3 story points | 10.2 |
| 10.13 Migration Inventaire | Haute | 3 story points | 10.2 |
| 10.14 Migration Loyalty/B2B | Moyenne | 2 story points | 10.2 |
| 10.15 Migration KDS/Display/Sync | Haute | 3 story points | 10.2 |
| 10.16 Tests | Haute | 3 story points | 10.3-10.15 |

**Total : ~30 story points | 16 stories**

## Ordre d'implémentation recommandé

```
Phase 1 - Fondation (Stories 10.1 → 10.2)
  ↓
Phase 2 - Pages UI (Stories 10.3 → 10.11, parallélisables)
  ↓
Phase 3 - Migration constantes (Stories 10.12 → 10.15, parallélisables)
  ↓
Phase 4 - Tests (Story 10.16)
```
