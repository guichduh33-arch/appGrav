// =====================================================
// Authentication & Authorization Types
// For the Users & Permissions Module
// =====================================================

// =====================================================
// Database Types
// =====================================================

export interface Role {
  id: string;
  code: string;
  name_fr: string;
  name_en: string;
  name_id: string;
  description: string | null;
  is_system: boolean;
  is_active: boolean;
  hierarchy_level: number;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  code: string;
  module: string;
  action: string;
  name_fr: string;
  name_en: string;
  name_id: string;
  description: string | null;
  is_sensitive: boolean;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  granted_at: string;
  granted_by: string | null;
  role?: Role;
  permission?: Permission;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  is_primary: boolean;
  valid_from: string | null;
  valid_until: string | null;
  assigned_at: string;
  assigned_by: string | null;
  role?: Role;
}

export interface UserPermission {
  id: string;
  user_id: string;
  permission_id: string;
  is_granted: boolean;
  valid_from: string | null;
  valid_until: string | null;
  reason: string | null;
  granted_at: string;
  granted_by: string | null;
  permission?: Permission;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_type: 'desktop' | 'tablet' | 'pos' | null;
  device_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  started_at: string;
  last_activity_at: string;
  ended_at: string | null;
  end_reason: 'logout' | 'timeout' | 'forced' | null;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  module: string;
  table_name: string | null;
  record_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
  severity: 'info' | 'warning' | 'critical';
  created_at: string;
}

// Extended UserProfile with new fields
export interface UserProfileExtended {
  id: string;
  auth_user_id: string | null;
  name: string;
  role: LegacyUserRole; // Keep for backwards compatibility
  pin_code: string | null;
  can_apply_discount: boolean;
  can_cancel_order: boolean;
  can_access_reports: boolean;
  avatar_url: string | null;
  is_active: boolean;
  // New fields
  employee_code: string | null;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  phone: string | null;
  preferred_language: 'fr' | 'en' | 'id';
  timezone: string;
  pin_hash: string | null;
  last_login_at: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  password_changed_at: string | null;
  must_change_password: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Legacy Types (for backwards compatibility)
// =====================================================

export type LegacyUserRole = 'admin' | 'manager' | 'cashier' | 'server' | 'barista' | 'kitchen' | 'backoffice';

// =====================================================
// Permission Code Types
// =====================================================

export type PermissionModule =
  | 'sales'
  | 'inventory'
  | 'products'
  | 'customers'
  | 'reports'
  | 'users'
  | 'settings'
  | 'production'
  | 'purchases'
  | 'pos'
  | 'kds';

export type PermissionAction =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'void'
  | 'discount'
  | 'refund'
  | 'report'
  | 'export'
  | 'adjust'
  | 'transfer'
  | 'pricing'
  | 'loyalty'
  | 'roles'
  | 'permissions'
  | 'backup'
  | 'recipes'
  | 'approve'
  | 'receive'
  | 'open_drawer'
  | 'close_session'
  | 'no_sale'
  | 'price_override';

export type PermissionCode =
  // Admin
  | 'admin.roles'
  | 'admin.permissions'
  | 'admin.audit'
  // Sales
  | 'sales.view'
  | 'sales.create'
  | 'sales.void'
  | 'sales.discount'
  | 'sales.refund'
  | 'sales.report'
  | 'sales.export'
  // Inventory
  | 'inventory.view'
  | 'inventory.create'
  | 'inventory.update'
  | 'inventory.delete'
  | 'inventory.adjust'
  | 'inventory.transfer'
  // Products
  | 'products.view'
  | 'products.create'
  | 'products.update'
  | 'products.delete'
  | 'products.pricing'
  // Customers
  | 'customers.view'
  | 'customers.create'
  | 'customers.update'
  | 'customers.delete'
  | 'customers.loyalty'
  // Reports
  | 'reports.view'
  | 'reports.sales'
  | 'reports.sales.personal'
  | 'reports.inventory'
  | 'reports.financial'
  | 'reports.analytics'
  | 'reports.purchases'
  | 'reports.audit'
  | 'reports.alerts'
  | 'reports.export'
  | 'reports.configure'
  // Users
  | 'users.view'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'users.roles'
  | 'users.permissions'
  // Accounting
  | 'accounting.view'
  | 'accounting.manage'
  | 'accounting.journal.create'
  | 'accounting.journal.update'
  | 'accounting.vat.manage'
  // Expenses
  | 'expenses.view'
  | 'expenses.create'
  | 'expenses.update'
  | 'expenses.delete'
  | 'expenses.approve'
  | 'expenses.categories'
  // Settings
  | 'settings.view'
  | 'settings.update'
  | 'settings.backup'
  // Production
  | 'production.view'
  | 'production.create'
  | 'production.update'
  | 'production.recipes'
  // Purchases
  | 'purchases.view'
  | 'purchases.create'
  | 'purchases.approve'
  | 'purchases.receive'
  // POS
  | 'pos.open_drawer'
  | 'pos.close_session'
  | 'pos.no_sale'
  | 'pos.price_override'
  // KDS
  | 'kds.view'
  | 'kds.update';

export type RoleCode =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'CASHIER'
  | 'BAKER'
  | 'INVENTORY'
  | 'SERVER'
  | 'BARISTA'
  | 'KITCHEN'
  | 'VIEWER';

// =====================================================
// Runtime Permission Check Types
// =====================================================

export interface EffectivePermission {
  permission_code: string;
  permission_module: string;
  permission_action: string;
  is_granted: boolean;
  source: 'direct' | 'role';
  is_sensitive: boolean;
}

// =====================================================
// Auth State Types
// =====================================================

export interface AuthState {
  user: UserProfileExtended | null;
  roles: Role[];
  permissions: EffectivePermission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionId: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  loginWithPin: (userId: string, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
  updateProfile: (data: Partial<UserProfileExtended>) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
}

// =====================================================
// Form Types
// =====================================================

export interface CreateUserInput {
  first_name: string;
  last_name: string;
  display_name?: string;
  employee_code?: string;
  phone?: string;
  avatar_url?: string;
  preferred_language?: 'fr' | 'en' | 'id';
  pin_code?: string;
  role_ids: string[];
  primary_role_id: string;
  additional_permissions?: Array<{
    permission_id: string;
    is_granted: boolean;
    reason?: string;
  }>;
}

export interface UpdateUserInput extends Partial<CreateUserInput> {
  is_active?: boolean;
  must_change_password?: boolean;
}

export interface CreateRoleInput {
  code: string;
  name_fr: string;
  name_en: string;
  name_id: string;
  description?: string;
  hierarchy_level: number;
  permission_ids: string[];
}

export interface UpdateRoleInput extends Partial<Omit<CreateRoleInput, 'code'>> {
  is_active?: boolean;
}

// =====================================================
// API Response Types
// =====================================================

export interface LoginResponse {
  success: boolean;
  user?: UserProfileExtended;
  session?: UserSession;
  error?: string;
}

export interface PermissionCheckResponse {
  has_permission: boolean;
  source?: 'direct' | 'role';
}

// =====================================================
// UI Component Props Types
// =====================================================

export interface PermissionGuardProps {
  permission?: PermissionCode;
  permissions?: PermissionCode[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export interface RoleSelectProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  excludeSystemRoles?: boolean;
  disabled?: boolean;
}

export interface PermissionMatrixProps {
  roleId?: string;
  userId?: string;
  onChange?: (permissions: string[]) => void;
  readOnly?: boolean;
}

// =====================================================
// Utility Types
// =====================================================

export type PermissionsByModule = Record<PermissionModule, Permission[]>;

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface UserWithRolesAndPermissions extends UserProfileExtended {
  user_roles: UserRole[];
  user_permissions: UserPermission[];
  effective_permissions: EffectivePermission[];
}
