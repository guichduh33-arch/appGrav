// Database Types for Supabase
// Re-export all types from the auto-generated file

export * from './database.generated'
export type { Database, Json } from './database.generated'

// Import Database type for convenience aliases
import type { Database } from './database.generated'

// =====================================================
// Convenience Type Helpers
// =====================================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// =====================================================
// Common Table Row Types
// =====================================================

export type Category = Tables<'categories'>
export type Product = Tables<'products'>
export type ProductModifier = Tables<'product_modifiers'>
export type Customer = Tables<'customers'>
export type POSSession = Tables<'pos_sessions'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type UserProfile = Tables<'user_profiles'>
export type StockMovement = Tables<'stock_movements'>
export type Recipe = Tables<'recipes'>
export type ProductUOM = Tables<'product_uoms'>
export type InventoryCount = Tables<'inventory_counts'>
export type InventoryCountItem = Tables<'inventory_count_items'>
export type Supplier = Tables<'suppliers'>
export type ProductionRecord = Tables<'production_records'>
export type Section = Tables<'sections'>
export type ProductStock = Tables<'product_stocks'>
export type ProductSection = Tables<'product_sections'>

// Combos and Promotions types
export type ProductCombo = Tables<'product_combos'>
export type ProductComboGroup = Tables<'product_combo_groups'>
export type ProductComboGroupItem = Tables<'product_combo_group_items'>
export type Promotion = Tables<'promotions'>
export type PromotionProduct = Tables<'promotion_products'>
export type PromotionFreeProduct = Tables<'promotion_free_products'>
export type PromotionUsage = Tables<'promotion_usage'>

// Users & Permissions types
export type Role = Tables<'roles'>
export type Permission = Tables<'permissions'>
export type RolePermission = Tables<'role_permissions'>
export type UserRole = Tables<'user_roles'>
export type UserPermissionRow = Tables<'user_permissions'>
export type UserSession = Tables<'user_sessions'>
export type AuditLog = Tables<'audit_logs'>

// Floor Plan
export type FloorPlanItem = Tables<'floor_plan_items'>

// Purchasing
export type PurchaseOrder = Tables<'purchase_orders'>
export type PurchaseOrderItem = Tables<'purchase_order_items'>
export type PurchaseOrderHistory = Tables<'purchase_order_history'>
export type PurchaseOrderReturn = Tables<'purchase_order_returns'>

// B2B
export type B2BOrder = Tables<'b2b_orders'>
export type B2BOrderItem = Tables<'b2b_order_items'>
export type B2BPayment = Tables<'b2b_payments'>

// Stock Locations and Transfers
export type StockLocation = Tables<'stock_locations'>
export type InternalTransfer = Tables<'internal_transfers'>
export type TransferItem = Tables<'transfer_items'>

// Customer Categories
export type CustomerCategory = Tables<'customer_categories'>
export type ProductCategoryPrice = Tables<'product_category_prices'>

// Settings Module
export type SettingsCategory = Tables<'settings_categories'>
export type Setting = Tables<'settings'>
export type SettingsHistory = Tables<'settings_history'>
export type TaxRate = Tables<'tax_rates'>
export type PaymentMethodRow = Tables<'payment_methods'>
export type BusinessHour = Tables<'business_hours'>
export type PrinterConfiguration = Tables<'printer_configurations'>
export type EmailTemplate = Tables<'email_templates'>
export type ReceiptTemplate = Tables<'receipt_templates'>

// Loyalty
export type LoyaltyTier = Tables<'loyalty_tiers'>
export type LoyaltyTransaction = Tables<'loyalty_transactions'>

// =====================================================
// Promotion Type Enum
// =====================================================

export type PromotionType = 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_product'

// =====================================================
// Extended Types with Relations
// =====================================================

export interface ProductWithCategory extends Product {
    category: Category | null
}

export interface ProductSectionWithDetails extends ProductSection {
    section: Section
}

export interface ProductWithSections extends Product {
    sections: ProductSectionWithDetails[]
}

export interface OrderWithItems extends Order {
    items: OrderItemWithProduct[]
}

export interface OrderItemWithProduct extends OrderItem {
    product: Product
}

// Combo with groups
export interface ProductComboWithGroups extends ProductCombo {
    groups: ProductComboGroupWithItems[]
}

export interface ProductComboGroupWithItems extends ProductComboGroup {
    items: ProductComboGroupItemWithProduct[]
}

export interface ProductComboGroupItemWithProduct extends ProductComboGroupItem {
    product: Product
}

// Promotion with products
export interface PromotionWithProducts extends Promotion {
    promotion_products: PromotionProduct[]
    promotion_free_products: PromotionFreeProduct[]
}

// Transfer with items
export interface InternalTransferWithItems extends InternalTransfer {
    items: TransferItemWithProduct[]
    from_location: StockLocation
    to_location: StockLocation
}

export interface TransferItemWithProduct extends TransferItem {
    product: Product
}
