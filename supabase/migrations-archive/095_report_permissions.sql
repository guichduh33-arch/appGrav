-- Migration: Report Permissions
-- Story 1.4: Report Permissions Database Migration
-- Adds new permission codes for granular report access control

-- =============================================================
-- Add Report Permission Codes
-- =============================================================

INSERT INTO public.permissions (code, module, action, name_fr, name_en, name_id, description, is_sensitive)
VALUES
  -- Base reports access
  ('reports.view', 'reports', 'view', 'Voir les rapports', 'View reports', 'Lihat laporan', 'Accès de base au module rapports', false),

  -- Sales reports
  ('reports.sales.personal', 'reports', 'report', 'Voir mes ventes personnelles', 'View personal sales', 'Lihat penjualan pribadi', 'Accès aux rapports de ventes personnelles uniquement', false),

  -- Additional report categories
  ('reports.purchases', 'reports', 'report', 'Rapports achats', 'Purchases reports', 'Laporan pembelian', 'Accès aux rapports d''achats et fournisseurs', false),
  ('reports.audit', 'reports', 'report', 'Rapports audit', 'Audit reports', 'Laporan audit', 'Accès aux rapports d''audit et historique', true),
  ('reports.alerts', 'reports', 'report', 'Alertes rapports', 'Reports alerts', 'Peringatan laporan', 'Accès aux alertes automatiques', false),

  -- Export & Configuration
  ('reports.export', 'reports', 'export', 'Exporter rapports', 'Export reports', 'Ekspor laporan', 'Permet l''export CSV et PDF des rapports', false),
  ('reports.configure', 'reports', 'update', 'Configurer rapports', 'Configure reports', 'Konfigurasi laporan', 'Configurer les seuils d''alerte et paramètres', true)
ON CONFLICT (code) DO NOTHING;

-- =============================================================
-- Assign Permissions to Default Roles
-- =============================================================

-- Get role IDs
DO $$
DECLARE
  v_admin_role_id UUID;
  v_manager_role_id UUID;
  v_cashier_role_id UUID;
  v_server_role_id UUID;
  v_kitchen_role_id UUID;
  v_barista_role_id UUID;
  v_inventory_role_id UUID;
  v_perm_id UUID;
BEGIN
  -- Get role IDs
  SELECT id INTO v_admin_role_id FROM public.roles WHERE code = 'ADMIN';
  SELECT id INTO v_manager_role_id FROM public.roles WHERE code = 'MANAGER';
  SELECT id INTO v_cashier_role_id FROM public.roles WHERE code = 'CASHIER';
  SELECT id INTO v_server_role_id FROM public.roles WHERE code = 'SERVER';
  SELECT id INTO v_kitchen_role_id FROM public.roles WHERE code = 'KITCHEN';
  SELECT id INTO v_barista_role_id FROM public.roles WHERE code = 'BARISTA';
  SELECT id INTO v_inventory_role_id FROM public.roles WHERE code = 'INVENTORY';

  -- Grant ALL report permissions to ADMIN
  IF v_admin_role_id IS NOT NULL THEN
    FOR v_perm_id IN SELECT id FROM public.permissions WHERE module = 'reports'
    LOOP
      INSERT INTO public.role_permissions (role_id, permission_id)
      VALUES (v_admin_role_id, v_perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END LOOP;
  END IF;

  -- Grant most report permissions to MANAGER (except configure)
  IF v_manager_role_id IS NOT NULL THEN
    FOR v_perm_id IN
      SELECT id FROM public.permissions
      WHERE module = 'reports' AND code != 'reports.configure'
    LOOP
      INSERT INTO public.role_permissions (role_id, permission_id)
      VALUES (v_manager_role_id, v_perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END LOOP;
  END IF;

  -- Grant basic + personal sales to CASHIER
  IF v_cashier_role_id IS NOT NULL THEN
    FOR v_perm_id IN
      SELECT id FROM public.permissions
      WHERE code IN ('reports.view', 'reports.sales.personal')
    LOOP
      INSERT INTO public.role_permissions (role_id, permission_id)
      VALUES (v_cashier_role_id, v_perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END LOOP;
  END IF;

  -- Grant basic + personal sales to SERVER
  IF v_server_role_id IS NOT NULL THEN
    FOR v_perm_id IN
      SELECT id FROM public.permissions
      WHERE code IN ('reports.view', 'reports.sales.personal')
    LOOP
      INSERT INTO public.role_permissions (role_id, permission_id)
      VALUES (v_server_role_id, v_perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END LOOP;
  END IF;

  -- Grant basic + inventory to KITCHEN
  IF v_kitchen_role_id IS NOT NULL THEN
    FOR v_perm_id IN
      SELECT id FROM public.permissions
      WHERE code IN ('reports.view', 'reports.inventory')
    LOOP
      INSERT INTO public.role_permissions (role_id, permission_id)
      VALUES (v_kitchen_role_id, v_perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END LOOP;
  END IF;

  -- Grant basic + personal sales to BARISTA
  IF v_barista_role_id IS NOT NULL THEN
    FOR v_perm_id IN
      SELECT id FROM public.permissions
      WHERE code IN ('reports.view', 'reports.sales.personal')
    LOOP
      INSERT INTO public.role_permissions (role_id, permission_id)
      VALUES (v_barista_role_id, v_perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END LOOP;
  END IF;

  -- Grant basic + inventory + purchases to INVENTORY role
  IF v_inventory_role_id IS NOT NULL THEN
    FOR v_perm_id IN
      SELECT id FROM public.permissions
      WHERE code IN ('reports.view', 'reports.inventory', 'reports.purchases')
    LOOP
      INSERT INTO public.role_permissions (role_id, permission_id)
      VALUES (v_inventory_role_id, v_perm_id)
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END LOOP;
  END IF;

  RAISE NOTICE 'Report permissions assigned to roles successfully';
END $$;

-- =============================================================
-- Add analytics permission if not exists (for compatibility)
-- =============================================================
INSERT INTO public.permissions (code, module, action, name_fr, name_en, name_id, description, is_sensitive)
VALUES
  ('reports.analytics', 'reports', 'report', 'Analytics avancées', 'Advanced analytics', 'Analitik lanjutan', 'Accès aux analyses avancées et comparaisons', false)
ON CONFLICT (code) DO NOTHING;

-- =============================================================
-- Verification Query (for testing)
-- =============================================================
-- SELECT p.code, p.name_fr, array_agg(r.code) as roles
-- FROM permissions p
-- LEFT JOIN role_permissions rp ON rp.permission_id = p.id
-- LEFT JOIN roles r ON r.id = rp.role_id
-- WHERE p.module = 'reports'
-- GROUP BY p.code, p.name_fr
-- ORDER BY p.code;
