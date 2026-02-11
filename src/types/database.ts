/**
 * Database Types - Re-exports from generated Supabase types
 *
 * This file provides type aliases for common database entities.
 * Types are generated from Supabase schema via: npx supabase gen types typescript
 */

// Re-export everything from generated types
export * from './database.generated'

import type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './database.generated'

// ============================================================================
// TABLE ROW TYPES (Read operations)
// ============================================================================

// Core entities
export type Product = Tables<'products'>
export type Category = Tables<'categories'>
export type Section = Tables<'sections'>
export type Supplier = Tables<'suppliers'>

// Sales
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type PosSession = Tables<'pos_sessions'>
export type FloorPlanItem = Tables<'floor_plan_items'>

// Customers
export type Customer = Tables<'customers'>
export type CustomerCategory = Tables<'customer_categories'>
export type LoyaltyTier = Tables<'loyalty_tiers'>
export type LoyaltyTransaction = Tables<'loyalty_transactions'>

// Inventory
export type StockMovement = Tables<'stock_movements'>
export type ProductionRecord = Tables<'production_records'>
export type Recipe = Tables<'recipes'>
export type InventoryCount = Tables<'inventory_counts'>
export type ProductUOM = Tables<'product_uoms'>

// Internal Transfers & Stock Locations (Story 5.4)
export type InternalTransfer = Tables<'internal_transfers'>
export type TransferItem = Tables<'transfer_items'>
export type StockLocation = Tables<'stock_locations'>

// Section Stock (tracks inventory per section)
// Note: SectionStock will be available after running migration and regenerating types
// For now, we define a manual interface

// Product modifiers
export type ProductModifier = Tables<'product_modifiers'>

// ModifierGroup and ModifierOption are UI types, not database tables
// They are defined below in the MODIFIER GROUP TYPES section

// Combos & Promotions
export type ProductCombo = Tables<'product_combos'>
export type ProductComboGroup = Tables<'product_combo_groups'>
export type ProductComboGroupItem = Tables<'product_combo_group_items'>
export type Promotion = Tables<'promotions'>
export type PromotionProduct = Tables<'promotion_products'>
export type PromotionFreeProduct = Tables<'promotion_free_products'>
export type PromotionUsage = Tables<'promotion_usage'>

// B2B
export type B2BOrder = Tables<'b2b_orders'>
export type B2BOrderItem = Tables<'b2b_order_items'>
export type B2BPayment = Tables<'b2b_payments'>

// Purchasing
export type PurchaseOrder = Tables<'purchase_orders'>
export type PurchaseOrderItem = Tables<'purchase_order_items'>

// Backward compatibility alias (deprecated - use PurchaseOrderItem instead)
/** @deprecated Use PurchaseOrderItem instead */
export type POItem = PurchaseOrderItem

// Users & Permissions
export type UserProfile = Tables<'user_profiles'>
export type Role = Tables<'roles'>
export type Permission = Tables<'permissions'>
export type RolePermission = Tables<'role_permissions'>
export type UserRole = Tables<'user_roles'>
export type UserPermission = Tables<'user_permissions'>

// System
export type AuditLog = Tables<'audit_logs'>
export type Setting = Tables<'settings'>

// Settings Module (manual types - not yet in generated types)
// These tables were added in migration 20260128100000_settings_enhancements.sql

// ============================================================================
// INSERT TYPES (Create operations)
// ============================================================================

export type Insertable<T extends keyof Database['public']['Tables']> = TablesInsert<T>
export type ProductInsert = TablesInsert<'products'>
export type OrderInsert = TablesInsert<'orders'>
export type OrderItemInsert = TablesInsert<'order_items'>
export type StockMovementInsert = TablesInsert<'stock_movements'>
export type CustomerInsert = TablesInsert<'customers'>

// ============================================================================
// UPDATE TYPES (Update operations)
// ============================================================================

export type Updatable<T extends keyof Database['public']['Tables']> = TablesUpdate<T>
export type ProductUpdate = TablesUpdate<'products'>
export type OrderUpdate = TablesUpdate<'orders'>

// ============================================================================
// ENUM TYPES
// ============================================================================

export type OrderStatus = Enums<'order_status'>
export type OrderType = Enums<'order_type'>
export type PaymentMethod = Enums<'payment_method'>
export type PaymentStatus = Enums<'payment_status'>
export type ProductType = Enums<'product_type'>
export type MovementType = Enums<'movement_type'>
export type DispatchStation = Enums<'dispatch_station'>
export type UserRoleEnum = Enums<'user_role'>
export type SessionStatus = Enums<'session_status'>
export type ItemStatus = Enums<'item_status'>
export type DiscountType = Enums<'discount_type'>
// PromotionType includes all promotion variations used in the UI
export type PromotionType = 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_product' | 'fixed' | 'free'

// Transfer status (Story 5.4)
export type TTransferStatus = 'draft' | 'pending' | 'in_transit' | 'received' | 'cancelled'

// Location type for stock_locations
export type TLocationType = 'main_warehouse' | 'section' | 'kitchen' | 'storage'

// Section type (warehouse, production, sales)
export type TSectionType = 'warehouse' | 'production' | 'sales'

// Stock status for section inventory
export type TStockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

// ============================================================================
// EXTENDED/JOINED TYPES
// ============================================================================

export interface ProductWithCategory extends Product {
    category?: Category | null
    sections?: Section | null
}

export interface RecipeWithProduct extends Recipe {
    ingredient?: Product | null
}

export interface OrderWithItems extends Order {
    order_items?: OrderItem[]
}

// Internal Transfer extended types (Story 5.4)
// Note: from_section_id, to_section_id, responsible_person, total_items, total_value, approved_at
// are already part of InternalTransfer table schema
export interface ITransferWithLocations extends InternalTransfer {
    from_location?: StockLocation | null
    to_location?: StockLocation | null
    // Section-based transfer support (populated via join)
    from_section?: ISection | null
    to_section?: ISection | null
}

export interface ITransferItemWithProduct extends TransferItem {
    product?: Pick<Product, 'id' | 'name' | 'sku' | 'cost_price'> | null
}

export interface ITransferWithDetails extends ITransferWithLocations {
    items?: ITransferItemWithProduct[]
}

// ============================================================================
// SECTION STOCK TYPES (Manual types until migration is applied)
// ============================================================================

/**
 * Enhanced Section interface with new columns from migration
 */
export interface ISection {
    id: string
    name: string
    code: string
    description: string | null
    section_type: TSectionType | null
    manager_id: string | null
    icon: string | null
    is_active: boolean
    sort_order: number
    created_at: string
    updated_at: string
}

/**
 * Section with manager details
 */
export interface ISectionWithManager extends ISection {
    manager?: Pick<UserProfile, 'id' | 'name' | 'email'> | null
}

/**
 * Section stock - tracks inventory quantity per section per product
 */
export interface ISectionStock {
    id: string
    section_id: string
    product_id: string
    quantity: number
    min_quantity: number | null
    max_quantity: number | null
    last_counted_at: string | null
    last_counted_by: string | null
    created_at: string
    updated_at: string
}

/**
 * Section stock with full product and section details
 * Matches view_section_stock_details
 */
export interface ISectionStockDetails {
    id: string
    section_id: string
    section_name: string
    section_code: string
    section_type: TSectionType | null
    product_id: string
    product_name: string
    sku: string
    product_type: ProductType
    unit: string
    quantity: number
    min_quantity: number | null
    max_quantity: number | null
    stock_status: TStockStatus
    last_counted_at: string | null
    updated_at: string
}

/**
 * Section stock insert type
 */
export interface ISectionStockInsert {
    section_id: string
    product_id: string
    quantity?: number
    min_quantity?: number
    max_quantity?: number
}

/**
 * Section stock update type
 */
export interface ISectionStockUpdate {
    quantity?: number
    min_quantity?: number
    max_quantity?: number
    last_counted_at?: string
    last_counted_by?: string
}

/**
 * Stock movement with section tracking (enhanced)
 * Note: from_section_id and to_section_id already exist in StockMovement
 */
export interface IStockMovementWithSections extends StockMovement {
    from_section?: ISection | null
    to_section?: ISection | null
}

/**
 * Recipe deduction info - used when consuming ingredients
 */
export interface IRecipeDeduction {
    ingredient_id: string
    ingredient_name: string
    ingredient_type: ProductType
    quantity: number
    deduction_section_id: string
    deduction_section_name: string
}

// ============================================================================
// POS TERMINAL TYPES (matches pos_terminals table with enhancements)
// ============================================================================

export type TTerminalMode = 'primary' | 'secondary' | 'self_service' | 'kds_only'
export type TKDSStation = 'kitchen' | 'barista' | 'display' | null
export type TDefaultOrderType = 'dine_in' | 'takeaway' | 'delivery' | null

export interface IPosTerminal {
    id: string
    terminal_name: string
    device_id: string
    is_hub: boolean | null
    location: string | null
    status: string | null
    // New columns from settings enhancements
    mode: TTerminalMode | null
    default_printer_id: string | null
    kitchen_printer_id: string | null
    kds_station: TKDSStation
    allowed_payment_methods: string[] | null
    default_order_type: TDefaultOrderType
    floor_plan_id: string | null
    auto_logout_timeout: number | null
    created_at: string | null
    updated_at: string | null
}

// ============================================================================
// TERMINAL SETTINGS TYPES (key-value per terminal)
// ============================================================================

export interface ITerminalSetting {
    id: string
    terminal_id: string
    key: string
    value: unknown
    created_at: string
    updated_at: string
}

// ============================================================================
// SETTINGS PROFILE TYPES
// ============================================================================

export type TSettingsProfileType = 'production' | 'test' | 'training' | 'custom'

export interface ISettingsProfile {
    id: string
    name: string
    description: string | null
    profile_type: TSettingsProfileType
    settings_snapshot: Record<string, unknown>
    terminal_settings_snapshot: Record<string, unknown>
    is_active: boolean
    is_system: boolean
    created_by: string | null
    created_at: string
    updated_at: string
}

// ============================================================================
// SOUND ASSETS TYPES
// ============================================================================

export type TSoundCategory = 'order' | 'payment' | 'error' | 'notification'

export interface ISoundAsset {
    id: string
    code: string
    name: string
    category: TSoundCategory
    file_path: string | null
    is_system: boolean
    is_active: boolean
    created_at: string
}

export type TPosTerminalStatus = 'active' | 'inactive' | 'maintenance'

// ============================================================================
// SYNC TYPES
// ============================================================================

export interface ISyncDevice {
    id: string
    device_type: TSyncDeviceType
    device_name: string
    last_sync: string | null
    status: 'online' | 'offline' | 'syncing'
}

export type TSyncDeviceType = 'pos' | 'kds' | 'display' | 'mobile'

// ============================================================================
// LAN NODE TYPES (matches lan_nodes table)
// ============================================================================

export interface ILanNode {
    id: string
    device_id: string
    device_name: string | null
    device_type: string
    ip_address: string | null
    port: number
    status: string | null
    is_hub: boolean | null
    last_heartbeat: string | null
    created_at: string | null
    updated_at: string | null
}

export type TLanNodeStatus = 'online' | 'offline' | 'connecting'

// ============================================================================
// DISPLAY TYPES
// ============================================================================

export interface IDisplayPromotion {
    id: string
    title: string
    description: string | null
    subtitle: string | null
    image_url: string | null
    start_date: string | null
    end_date: string | null
    is_active: boolean
    priority: number | null
    background_color: string | null
    text_color: string | null
}

// ============================================================================
// MODIFIER GROUP TYPES (UI types - not database tables)
// ============================================================================

export interface ModifierGroup {
    id: string
    name: string
    type: 'single' | 'multiple'
    is_required: boolean
    min_selections?: number
    max_selections?: number
    options: ModifierOption[]
}

export interface ModifierOption {
    id: string
    name: string
    price_adjustment: number
}

// ============================================================================
// ACCOUNTING (Epic 9)
// ============================================================================

// Accounting types are defined in src/types/accounting.ts
// Re-export for convenience
export type { IAccount, IJournalEntry, IJournalEntryLine, IFiscalPeriod } from './accounting'

// ============================================================================
// HELPER TYPES
// ============================================================================

export type { Json } from './database.generated'
export type { Database } from './database.generated'
