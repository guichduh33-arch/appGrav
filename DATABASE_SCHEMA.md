# AppGrav Database Schema Reference
**Last Updated**: 2026-01-23
**Source**: `src/types/database.ts` and `supabase/migrations/`

## Type Helpers

```typescript
// Import from src/types/database.ts
import type {
    Tables,      // Get Row type: Tables<'products'>
    Insertable,  // Get Insert type: Insertable<'products'>
    Updatable    // Get Update type: Updatable<'products'>
} from '@/types/database'
```

## Table Reference

### Core Commerce Tables

#### `products`
Product catalog with pricing and inventory tracking.
```typescript
type Product = {
    id: string                    // UUID, primary key
    sku: string                   // Unique product code
    name: string                  // Product name
    description: string | null
    category_id: string | null    // FK -> categories.id
    retail_price: number          // IDR price
    wholesale_price: number | null
    cost_price: number | null
    current_stock: number         // Current inventory level
    min_stock: number             // Low stock alert threshold (default: 10)
    unit: string                  // Unit of measure (pcs, kg, etc.)
    image_url: string | null
    is_active: boolean            // Soft delete flag
    product_type: 'finished' | 'semi_finished' | 'raw_material'
    created_at: string
    updated_at: string
}
```

#### `categories`
Product categories with kitchen dispatch routing.
```typescript
type Category = {
    id: string
    name: string
    description: string | null
    parent_id: string | null      // For nested categories
    display_order: number
    dispatch_station: 'barista' | 'kitchen' | 'display' | 'none'
    is_active: boolean
    created_at: string
}
```

#### `orders`
Sales orders with status tracking.
```typescript
type Order = {
    id: string
    order_number: string          // Auto-generated sequence
    customer_id: string | null    // FK -> customers.id
    pos_session_id: string | null // FK -> pos_sessions.id
    order_type: 'dine_in' | 'takeaway' | 'delivery' | 'b2b'
    status: 'draft' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
    subtotal: number              // Before tax
    tax_amount: number            // 10% tax
    discount_amount: number
    total_amount: number          // Final amount
    payment_method: string | null
    payment_status: 'pending' | 'partial' | 'paid'
    notes: string | null
    table_number: string | null
    staff_id: string | null       // FK -> user_profiles.id
    created_at: string
    updated_at: string
}
```

#### `order_items`
Line items within orders.
```typescript
type OrderItem = {
    id: string
    order_id: string              // FK -> orders.id
    product_id: string            // FK -> products.id
    quantity: number
    unit_price: number
    subtotal: number
    modifiers: Json | null        // Selected modifiers as JSON
    notes: string | null
    status: 'pending' | 'preparing' | 'ready' | 'served'
    created_at: string
}
```

### Customer & Loyalty Tables

#### `customers`
Customer profiles with loyalty tracking.
```typescript
type Customer = {
    id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
    customer_type: 'retail' | 'wholesale'
    customer_category_id: string | null  // FK -> customer_categories.id
    loyalty_points: number               // Current points balance
    lifetime_points: number              // Total earned (for tier calculation)
    loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum'
    qr_code: string | null               // Unique QR for identification
    notes: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}
```

#### `customer_categories`
Pricing categories for different customer types.
```typescript
type CustomerCategory = {
    id: string
    name: string                  // e.g., "VIP", "Staff", "Wholesale"
    slug: string                  // Unique identifier
    description: string | null
    price_modifier_type: 'retail' | 'wholesale' | 'discount_percentage' | 'custom'
    discount_percentage: number | null  // For discount_percentage type
    is_active: boolean
    created_at: string
}
```

#### `product_category_prices`
Custom pricing per customer category.
```typescript
type ProductCategoryPrice = {
    id: string
    product_id: string            // FK -> products.id
    customer_category_id: string  // FK -> customer_categories.id
    price: number                 // Custom price in IDR
    created_at: string
    updated_at: string
}
```

#### `loyalty_tiers`
Loyalty program tier definitions.
```typescript
type LoyaltyTier = {
    id: string
    name: string                  // bronze, silver, gold, platinum
    min_points: number            // Points required
    discount_percentage: number   // Tier benefit
    description: string | null
    created_at: string
}
```

#### `loyalty_transactions`
Points earning and redemption history.
```typescript
type LoyaltyTransaction = {
    id: string
    customer_id: string           // FK -> customers.id
    order_id: string | null       // FK -> orders.id
    transaction_type: 'earn' | 'redeem' | 'adjust'
    points: number                // Positive for earn, negative for redeem
    balance_after: number
    description: string | null
    created_at: string
}
```

### Inventory Tables

#### `stock_movements`
Complete inventory audit trail.
```typescript
type StockMovement = {
    id: string
    product_id: string            // FK -> products.id
    movement_type: 'in' | 'out' | 'adjustment' | 'transfer'
    quantity: number
    reference_type: string | null // 'order', 'production', 'transfer', etc.
    reference_id: string | null   // Related entity ID
    reason: string | null
    staff_id: string | null       // Who made the movement
    created_at: string
}
```

#### `stock_locations`
Physical storage locations.
```typescript
type StockLocation = {
    id: string
    name: string
    description: string | null
    location_type: 'warehouse' | 'store' | 'kitchen' | 'display'
    is_active: boolean
    created_at: string
}
```

#### `internal_transfers`
Stock transfers between locations.
```typescript
type InternalTransfer = {
    id: string
    transfer_number: string
    from_location_id: string      // FK -> stock_locations.id
    to_location_id: string        // FK -> stock_locations.id
    status: 'draft' | 'pending' | 'in_transit' | 'completed' | 'cancelled'
    notes: string | null
    requested_by: string | null
    approved_by: string | null
    created_at: string
    completed_at: string | null
}
```

#### `transfer_items`
Items within a transfer.
```typescript
type TransferItem = {
    id: string
    transfer_id: string           // FK -> internal_transfers.id
    product_id: string            // FK -> products.id
    requested_quantity: number
    transferred_quantity: number | null
    notes: string | null
}
```

#### `inventory_counts`
Physical inventory count sessions.
```typescript
type InventoryCount = {
    id: string
    count_number: string          // Auto-generated
    status: 'draft' | 'completed' | 'cancelled'
    notes: string | null
    counted_by: string | null
    approved_by: string | null
    created_at: string
    completed_at: string | null
}
```

#### `inventory_count_items`
Individual product counts.
```typescript
type InventoryCountItem = {
    id: string
    inventory_count_id: string    // FK -> inventory_counts.id
    product_id: string            // FK -> products.id
    system_stock: number          // Stock at count start
    actual_stock: number | null   // Counted quantity
    variance: number | null       // actual - system
    unit: string
    notes: string | null
    updated_at: string
}
```

### Production Tables

#### `recipes`
Bill of materials for production.
```typescript
type Recipe = {
    id: string
    product_id: string            // FK -> products.id (output product)
    ingredient_id: string         // FK -> products.id (input material)
    quantity: number              // Required quantity
    unit: string
    created_at: string
}
```

#### `production_records`
Production batch tracking.
```typescript
type ProductionRecord = {
    id: string
    product_id: string            // FK -> products.id
    quantity_produced: number
    recipe_id: string | null
    production_date: string
    staff_id: string | null
    notes: string | null
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
    created_at: string
}
```

### Combos & Promotions Tables

#### `product_combos`
Combo/bundle products.
```typescript
type ProductCombo = {
    id: string
    name: string
    description: string | null
    base_price: number            // Starting price
    is_active: boolean
    image_url: string | null
    created_at: string
    updated_at: string
}
```

#### `product_combo_groups`
Choice groups within a combo.
```typescript
type ProductComboGroup = {
    id: string
    combo_id: string              // FK -> product_combos.id
    name: string                  // e.g., "Choose your drink"
    min_selections: number        // Minimum required
    max_selections: number        // Maximum allowed
    display_order: number
    created_at: string
}
```

#### `product_combo_group_items`
Products available in a choice group.
```typescript
type ProductComboGroupItem = {
    id: string
    group_id: string              // FK -> product_combo_groups.id
    product_id: string            // FK -> products.id
    price_adjustment: number      // Additional cost (can be negative)
    is_default: boolean
    created_at: string
}
```

#### `promotions`
Time-based promotional offers.
```typescript
type Promotion = {
    id: string
    name: string
    description: string | null
    promotion_type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_product'
    discount_value: number | null
    buy_quantity: number | null   // For buy_x_get_y
    get_quantity: number | null   // For buy_x_get_y
    min_purchase_amount: number | null
    max_discount_amount: number | null
    start_date: string
    end_date: string
    start_time: string | null     // Daily start time
    end_time: string | null       // Daily end time
    days_of_week: number[] | null // 0=Sun, 6=Sat
    is_active: boolean
    usage_limit: number | null
    usage_count: number
    created_at: string
}
```

### Purchasing Tables

#### `suppliers`
Vendor/supplier management.
```typescript
type Supplier = {
    id: string
    name: string
    contact_person: string | null
    email: string | null
    phone: string | null
    address: string | null
    payment_terms: string | null
    notes: string | null
    is_active: boolean
    created_at: string
}
```

#### `purchase_orders`
Purchase order headers.
```typescript
type PurchaseOrder = {
    id: string
    po_number: string
    supplier_id: string           // FK -> suppliers.id
    status: 'draft' | 'submitted' | 'approved' | 'partial' | 'received' | 'cancelled'
    order_date: string
    expected_date: string | null
    subtotal: number
    tax_amount: number
    total_amount: number
    notes: string | null
    created_by: string | null
    approved_by: string | null
    created_at: string
    updated_at: string
}
```

#### `purchase_order_items`
PO line items.
```typescript
type PurchaseOrderItem = {
    id: string
    purchase_order_id: string     // FK -> purchase_orders.id
    product_id: string            // FK -> products.id
    quantity: number
    received_quantity: number
    unit_price: number
    subtotal: number
    notes: string | null
}
```

### B2B Tables

#### `b2b_orders`
Wholesale order headers.
```typescript
type B2BOrder = {
    id: string
    order_number: string
    customer_id: string           // FK -> customers.id
    status: 'draft' | 'confirmed' | 'processing' | 'ready' | 'delivered' | 'cancelled'
    payment_status: 'pending' | 'partial' | 'paid'
    payment_terms: 'cod' | 'net_7' | 'net_14' | 'net_30'
    subtotal: number
    tax_amount: number
    discount_amount: number
    total_amount: number
    paid_amount: number
    delivery_date: string | null
    delivery_address: string | null
    notes: string | null
    created_by: string | null
    created_at: string
    updated_at: string
}
```

#### `b2b_order_items`
B2B order line items.
```typescript
type B2BOrderItem = {
    id: string
    b2b_order_id: string          // FK -> b2b_orders.id
    product_id: string            // FK -> products.id
    quantity: number
    unit_price: number
    subtotal: number
    notes: string | null
}
```

#### `b2b_payments`
Payment records for B2B orders.
```typescript
type B2BPayment = {
    id: string
    b2b_order_id: string          // FK -> b2b_orders.id
    amount: number
    payment_method: string
    payment_date: string
    reference: string | null
    notes: string | null
    created_by: string | null
    created_at: string
}
```

### Users & Permissions Tables

#### `user_profiles`
Extended user data (links to Supabase auth.users).
```typescript
type UserProfile = {
    id: string                    // Same as auth.users.id
    email: string
    full_name: string | null
    avatar_url: string | null
    pin_hash: string | null       // Hashed PIN for quick auth
    is_active: boolean
    created_at: string
    updated_at: string
}
```

#### `roles`
Role definitions.
```typescript
type Role = {
    id: string
    name: string                  // admin, manager, cashier, kitchen, etc.
    description: string | null
    is_system: boolean            // Cannot be deleted
    created_at: string
}
```

#### `permissions`
Available permissions.
```typescript
type Permission = {
    id: string
    name: string                  // e.g., "products.create"
    description: string | null
    module: string                // e.g., "products", "orders", "settings"
    created_at: string
}
```

#### `role_permissions`
Role-permission mapping.
```typescript
type RolePermission = {
    id: string
    role_id: string               // FK -> roles.id
    permission_id: string         // FK -> permissions.id
}
```

#### `user_roles`
User-role assignment.
```typescript
type UserRole = {
    id: string
    user_id: string               // FK -> user_profiles.id
    role_id: string               // FK -> roles.id
}
```

#### `audit_logs`
System audit trail.
```typescript
type AuditLog = {
    id: string
    user_id: string | null
    action: string                // e.g., "CREATE", "UPDATE", "DELETE"
    table_name: string
    record_id: string | null
    old_values: Json | null
    new_values: Json | null
    ip_address: string | null
    user_agent: string | null
    created_at: string
}
```

### Settings Tables

#### `settings_categories`
Setting category groups.
```typescript
type SettingsCategory = {
    id: string
    name: string
    slug: string
    description: string | null
    display_order: number
    icon: string | null
    created_at: string
}
```

#### `settings`
Key-value settings store.
```typescript
type Setting = {
    id: string
    category_id: string | null    // FK -> settings_categories.id
    key: string                   // Unique setting key
    value: Json                   // Setting value
    value_type: 'string' | 'number' | 'boolean' | 'json'
    label: string
    description: string | null
    is_sensitive: boolean         // Hide value in UI
    is_readonly: boolean
    created_at: string
    updated_at: string
}
```

#### `payment_methods`
Available payment methods.
```typescript
type PaymentMethodRow = {
    id: string
    name: string
    code: string                  // cash, card, qris, transfer
    is_active: boolean
    requires_reference: boolean
    display_order: number
    icon: string | null
    created_at: string
}
```

#### `tax_rates`
Tax configuration.
```typescript
type TaxRate = {
    id: string
    name: string
    rate: number                  // e.g., 0.10 for 10%
    is_default: boolean
    is_active: boolean
    created_at: string
}
```

### POS Session Tables

#### `pos_sessions`
Cash drawer sessions.
```typescript
type POSSession = {
    id: string
    cashier_id: string            // FK -> user_profiles.id
    opening_amount: number
    closing_amount: number | null
    expected_amount: number | null
    variance: number | null
    status: 'open' | 'closed'
    opened_at: string
    closed_at: string | null
    notes: string | null
}
```

#### `floor_plan_items`
Table/seat layout for dine-in.
```typescript
type FloorPlanItem = {
    id: string
    name: string                  // e.g., "Table 1"
    type: 'table' | 'bar' | 'counter'
    capacity: number
    x_position: number
    y_position: number
    width: number
    height: number
    rotation: number
    status: 'available' | 'occupied' | 'reserved'
    current_order_id: string | null
    created_at: string
}
```

### Product Configuration Tables

#### `product_modifiers`
Product variant options.
```typescript
type ProductModifier = {
    id: string
    product_id: string            // FK -> products.id
    name: string                  // Group name: "Size", "Extras"
    options: Json                 // Array of options with prices
    is_required: boolean
    min_selections: number
    max_selections: number
    created_at: string
}
```

#### `product_uoms`
Alternative units of measure.
```typescript
type ProductUOM = {
    id: string
    product_id: string            // FK -> products.id
    unit_name: string             // e.g., "box", "pack"
    conversion_factor: number     // How many base units
    barcode: string | null
    created_at: string
}
```

#### `sections`
Business sections/departments.
```typescript
type Section = {
    id: string
    name: string                  // e.g., "Bakery", "Coffee Shop"
    code: string
    description: string | null
    is_active: boolean
    created_at: string
}
```

## Database Functions

### Loyalty Functions
- `add_loyalty_points(customer_uuid, order_uuid, points_amount)` - Award points
- `redeem_loyalty_points(customer_uuid, points_amount)` - Redeem points
- `get_customer_product_price(product_uuid, customer_category_uuid)` - Get custom price

### Inventory Functions
- `finalize_inventory_count(count_uuid, user_uuid)` - Apply count variances
- `process_stock_movement(...)` - Create movement with triggers

### Auth Functions
- `get_user_profile_id()` - Get current user's profile ID
- `is_admin_or_manager()` - Check role for RLS
- `check_user_permission(permission_name)` - Permission check

## Views

| View Name | Description |
|-----------|-------------|
| `view_daily_kpis` | Daily sales metrics |
| `view_inventory_valuation` | Stock value calculation |
| `view_payment_method_stats` | Payment method breakdown |
| `view_low_stock_products` | Products below min_stock |
| `view_top_selling_products` | Best sellers ranking |

## Naming Conventions

| Entity | Convention | Example |
|--------|------------|---------|
| Tables | snake_case | `order_items` |
| Columns | snake_case | `created_at` |
| Primary Key | `id` (UUID) | `id` |
| Foreign Key | `table_id` | `customer_id` |
| Timestamps | `*_at` suffix | `created_at`, `updated_at` |
| Interfaces | I prefix | `IProduct` |
| Types | T prefix | `TOrderStatus` |
| Enums | PascalCase | `PaymentMethod` |
