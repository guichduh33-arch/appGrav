# Modèles de Données - AppGrav

*Généré le 2026-01-26 - Scan Exhaustif*

## Statistiques

| Élément | Nombre |
|---------|--------|
| Tables | 67 |
| Types Enum | 21 |
| Fonctions DB | 20+ |
| Vues | 3 |
| Triggers | 15+ |

## Tables par Domaine

### Commerce (11 tables)

| Table | Rôle | Colonnes Clés |
|-------|------|---------------|
| `categories` | Catégories produits | id, name, icon, color, dispatch_station, sort_order |
| `products` | Catalogue produits | id, sku, name, category_id, product_type, retail_price, wholesale_price, cost_price, current_stock |
| `product_modifiers` | Variantes/options | product_id, group_name, group_type, option_label, price_adjustment |
| `orders` | Commandes | order_number, customer_id, order_type, status, subtotal, tax_amount, total, payment_method |
| `order_items` | Lignes commande | order_id, product_id, quantity, unit_price, modifiers (JSON), dispatch_station |
| `stock_movements` | Audit inventaire | movement_id, product_id, movement_type, quantity, unit_cost, reference_type |
| `pos_sessions` | Sessions caisse | session_number, user_id, status, opening_cash, expected_cash, actual_cash |
| `recipes` | Nomenclatures | product_id, ingredient_id, quantity, unit |
| `production_records` | Lots production | product_id, production_number, quantity_produced, batch_number |
| `product_uoms` | Unités alternatives | product_id, uom_name, conversion_factor |
| `sections` | Sections/départements | name, code, description |

### Clients & Fidélité (6 tables)

| Table | Rôle | Colonnes Clés |
|-------|------|---------------|
| `customers` | Profils clients | name, email, phone, customer_type, loyalty_points, loyalty_tier |
| `customer_categories` | Catégories prix | slug, name, price_modifier_type, discount_percentage |
| `product_category_prices` | Prix personnalisés | product_id, customer_category_slug, price |
| `loyalty_tiers` | Niveaux fidélité | slug, min_points, discount_percentage, points_multiplier |
| `loyalty_transactions` | Historique points | customer_id, transaction_type, points, balance_after |

### Inventaire & Stock (6 tables)

| Table | Rôle | Colonnes Clés |
|-------|------|---------------|
| `stock_locations` | Emplacements | name, code, is_default |
| `product_stocks` | Stock par emplacement | product_id, location_id, quantity |
| `internal_transfers` | Transferts stock | transfer_number, from_location_id, to_location_id, status |
| `transfer_items` | Lignes transfert | transfer_id, product_id, quantity_requested, quantity_received |
| `inventory_counts` | Sessions inventaire | count_number, count_date, status, location_id |
| `inventory_count_items` | Lignes comptage | count_id, product_id, system_quantity, counted_quantity |

### Combos & Promotions (7 tables)

| Table | Rôle | Colonnes Clés |
|-------|------|---------------|
| `product_combos` | Définitions combos | name, description, base_price, pos_visible |
| `product_combo_groups` | Groupes de choix | combo_id, name, min_selections, max_selections |
| `product_combo_group_items` | Produits par groupe | group_id, product_id, price_adjustment, is_default |
| `promotions` | En-têtes promos | name, promotion_type, discount_percentage, start_date, end_date |
| `promotion_products` | Produits en promo | promotion_id, product_id |
| `promotion_free_products` | Produits gratuits | promotion_id, product_id, quantity |
| `promotion_usage` | Suivi utilisation | promotion_id, order_id, discount_amount |

### Achats (5 tables)

| Table | Rôle | Colonnes Clés |
|-------|------|---------------|
| `suppliers` | Fournisseurs | code, name, contact_person, payment_terms |
| `purchase_orders` | Bons de commande | po_number, supplier_id, status, order_date |
| `purchase_order_items` | Lignes BC | po_id, product_id, quantity_ordered, quantity_received |
| `purchase_order_history` | Historique BC | po_id, action, old_status, new_status |
| `purchase_order_returns` | Retours | po_id, product_id, quantity, reason |

### B2B (3 tables)

| Table | Rôle | Colonnes Clés |
|-------|------|---------------|
| `b2b_orders` | Commandes grossiste | order_number, customer_id, status, payment_status |
| `b2b_order_items` | Lignes B2B | order_id, product_id, quantity, unit_price |
| `b2b_payments` | Paiements B2B | order_id, amount, payment_method, reference_number |

### Utilisateurs & Permissions (8 tables)

| Table | Rôle | Colonnes Clés |
|-------|------|---------------|
| `user_profiles` | Profils utilisateurs | user_id, first_name, last_name, pin_hash, language, is_active |
| `roles` | Définitions rôles | code, name_fr, name_en, name_id, hierarchy_level |
| `permissions` | Catalogue permissions | code, module, name_fr, name_en, name_id |
| `role_permissions` | Mapping rôle-permission | role_id, permission_id |
| `user_roles` | Assignation rôles | user_id, role_id, assigned_by |
| `user_permissions` | Permissions utilisateur | user_id, permission_id, granted |
| `user_sessions` | Sessions actives | user_id, session_token, device_info, ip_address |
| `audit_logs` | Journal audit | user_id, action, table_name, old_values, new_values |

### Paramètres (7 tables)

| Table | Rôle | Colonnes Clés |
|-------|------|---------------|
| `settings_categories` | Groupes paramètres | code, name_fr, name_en, name_id |
| `settings` | Paramètres clé-valeur | key, value (JSON), value_type, category_id |
| `settings_history` | Historique modifs | setting_id, old_value, new_value |
| `tax_rates` | Taux de taxe | name, rate, is_default |
| `payment_methods` | Options paiement | code, name, icon, requires_reference |
| `business_hours` | Heures ouverture | day_of_week, is_open, open_time, close_time |
| `printer_configurations` | Config imprimantes | name, printer_type, ip_address, station |

### Autres (4 tables)

| Table | Rôle | Colonnes Clés |
|-------|------|---------------|
| `floor_plan_items` | Plan de salle | type, label, x, y, width, height, capacity |
| `email_templates` | Templates email | code, subject, body (multilingue) |
| `receipt_templates` | Formats reçus | name, template_type, header, footer |

## Types Enum

```sql
product_type: 'finished' | 'semi_finished' | 'raw_material'
dispatch_station: 'barista' | 'kitchen' | 'display' | 'none'
order_status: 'new' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled'
order_type: 'dine_in' | 'takeaway' | 'delivery' | 'b2b'
payment_method_type: 'cash' | 'card' | 'qris' | 'split' | 'transfer'
movement_type: 'purchase' | 'production_in' | 'production_out' | 'sale_pos' | 'sale_b2b' | 'adjustment_in' | 'adjustment_out' | 'waste' | 'transfer'
po_status: 'draft' | 'sent' | 'partial' | 'received' | 'cancelled'
customer_type: 'retail' | 'wholesale'
promotion_type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_product'
loyalty_tier_slug: 'bronze' | 'silver' | 'gold' | 'platinum'
transfer_status: 'pending' | 'in_transit' | 'completed' | 'cancelled'
```

## Fonctions Base de Données

### Authentification
- `verify_user_pin(user_id, pin)` → BOOLEAN
- `user_has_permission(user_id, permission_code)` → BOOLEAN
- `is_admin(user_id)` → BOOLEAN
- `hash_pin(pin)` → VARCHAR

### Sessions POS
- `open_shift(user_id, opening_cash, terminal_id, notes)` → JSON
- `close_shift(session_id, actual_cash, actual_qris, actual_edc, closed_by, notes)` → JSON

### Tarification
- `get_customer_product_price(product_id, customer_category_slug)` → NUMERIC

### Fidélité
- `add_loyalty_points(customer_id, points, order_id, description)` → VOID
- `redeem_loyalty_points(customer_id, points, order_id)` → BOOLEAN

### Promotions
- `get_active_promotions(product_ids)` → TABLE
- `record_promotion_usage(promotion_id, customer_id, order_id, discount_amount)` → VOID

### Combos
- `get_combo_with_groups(combo_id)` → JSON
- `calculate_combo_total_price(combo_id, selected_items)` → NUMERIC

## Vues

| Vue | Rôle |
|-----|------|
| `view_daily_kpis` | Métriques ventes journalières |
| `view_inventory_valuation` | Valorisation stock |
| `view_payment_method_stats` | Répartition paiements |

## Politiques RLS

Toutes les tables suivent le pattern :
```sql
-- Lecture authentifiée
CREATE POLICY "Authenticated read" ON public.{table}
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Écriture basée permissions
CREATE POLICY "Permission-based write" ON public.{table}
    FOR INSERT WITH CHECK (public.user_has_permission(auth.uid(), '{module}.create'));
```

## Relations Clés

```
products → categories (category_id)
order_items → orders (order_id)
order_items → products (product_id)
stock_movements → products (product_id)
purchase_order_items → purchase_orders (po_id)
role_permissions → roles, permissions
user_roles → user_profiles, roles
product_combo_groups → product_combos (combo_id)
product_combo_group_items → product_combo_groups (group_id)
promotion_products → promotions, products
internal_transfers → stock_locations (from/to)
```
