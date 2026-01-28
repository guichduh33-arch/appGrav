import { useMemo, useCallback } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { PermissionCode } from '@/types/auth';

export type ReportCategory =
  | 'sales'
  | 'inventory'
  | 'finance'
  | 'purchases'
  | 'audit'
  | 'alerts';

export interface ReportCategoryConfig {
  key: ReportCategory;
  label: string;
  permission: PermissionCode;
  subReports: {
    key: string;
    label: string;
    permission?: PermissionCode; // Optional specific permission
  }[];
}

const REPORT_CATEGORIES: ReportCategoryConfig[] = [
  {
    key: 'sales',
    label: 'Ventes',
    permission: 'reports.sales',
    subReports: [
      { key: 'overview', label: 'Vue d\'ensemble' },
      { key: 'profit-loss', label: 'Profit/Perte' },
      { key: 'by-product', label: 'Par produit' },
      { key: 'by-category', label: 'Par catégorie' },
      { key: 'by-customer', label: 'Par client' },
      { key: 'by-hour', label: 'Par heure' },
      { key: 'cancellations', label: 'Annulations' },
      { key: 'personal', label: 'Mes ventes', permission: 'reports.sales.personal' },
    ],
  },
  {
    key: 'inventory',
    label: 'Inventaire',
    permission: 'reports.inventory',
    subReports: [
      { key: 'stock-balance', label: 'Balance stock' },
      { key: 'stock-warning', label: 'Alertes stock' },
      { key: 'expired', label: 'Stock expiré' },
      { key: 'unsold', label: 'Produits invendus' },
      { key: 'movements', label: 'Mouvements stock' },
    ],
  },
  {
    key: 'finance',
    label: 'Finance',
    permission: 'reports.financial',
    subReports: [
      { key: 'cash-balance', label: 'Balance caisse' },
      { key: 'receivables', label: 'Créances B2B' },
      { key: 'expenses', label: 'Dépenses' },
      { key: 'taxes', label: 'Taxes collectées' },
    ],
  },
  {
    key: 'purchases',
    label: 'Achats',
    permission: 'reports.purchases',
    subReports: [
      { key: 'returns', label: 'Retours fournisseurs' },
      { key: 'outstanding', label: 'Paiements en attente' },
    ],
  },
  {
    key: 'audit',
    label: 'Audit',
    permission: 'reports.audit',
    subReports: [
      { key: 'price-changes', label: 'Modifications prix' },
      { key: 'deleted-products', label: 'Produits supprimés' },
      { key: 'activity-log', label: 'Journal d\'activité' },
    ],
  },
  {
    key: 'alerts',
    label: 'Alertes',
    permission: 'reports.alerts',
    subReports: [
      { key: 'dashboard', label: 'Dashboard alertes' },
      { key: 'configuration', label: 'Configuration', permission: 'reports.configure' },
    ],
  },
];

export interface UseReportPermissionsReturn {
  // Category access
  canAccessReports: boolean;
  canAccessCategory: (category: ReportCategory) => boolean;
  accessibleCategories: ReportCategoryConfig[];

  // Specific permissions
  canViewSales: boolean;
  canViewPersonalSales: boolean;
  canViewInventory: boolean;
  canViewFinance: boolean;
  canViewPurchases: boolean;
  canViewAudit: boolean;
  canViewAlerts: boolean;
  canExport: boolean;
  canConfigure: boolean;

  // Report access
  canAccessReport: (category: ReportCategory, reportKey: string) => boolean;

  // Helpers
  isFullAccess: boolean;
  isPersonalOnly: boolean;
}

export function useReportPermissions(): UseReportPermissionsReturn {
  const { hasPermission, hasAnyPermission, isAdmin, isManagerOrAbove } = usePermissions();

  // Basic permission checks
  const canAccessReports = useMemo(
    () => hasPermission('reports.view') || hasAnyPermission([
      'reports.sales',
      'reports.sales.personal',
      'reports.inventory',
      'reports.financial',
      'reports.purchases',
      'reports.audit',
      'reports.alerts',
    ]),
    [hasPermission, hasAnyPermission]
  );

  const canViewSales = useMemo(
    () => hasPermission('reports.sales'),
    [hasPermission]
  );

  const canViewPersonalSales = useMemo(
    () => hasPermission('reports.sales.personal') || canViewSales,
    [hasPermission, canViewSales]
  );

  const canViewInventory = useMemo(
    () => hasPermission('reports.inventory'),
    [hasPermission]
  );

  const canViewFinance = useMemo(
    () => hasPermission('reports.financial'),
    [hasPermission]
  );

  const canViewPurchases = useMemo(
    () => hasPermission('reports.purchases'),
    [hasPermission]
  );

  const canViewAudit = useMemo(
    () => hasPermission('reports.audit'),
    [hasPermission]
  );

  const canViewAlerts = useMemo(
    () => hasPermission('reports.alerts'),
    [hasPermission]
  );

  const canExport = useMemo(
    () => hasPermission('reports.export'),
    [hasPermission]
  );

  const canConfigure = useMemo(
    () => hasPermission('reports.configure'),
    [hasPermission]
  );

  // Category access check
  const canAccessCategory = useCallback(
    (category: ReportCategory): boolean => {
      // Admins have full access
      if (isAdmin) return true;

      switch (category) {
        case 'sales':
          return canViewSales || canViewPersonalSales;
        case 'inventory':
          return canViewInventory;
        case 'finance':
          return canViewFinance;
        case 'purchases':
          return canViewPurchases;
        case 'audit':
          return canViewAudit;
        case 'alerts':
          return canViewAlerts;
        default:
          return false;
      }
    },
    [isAdmin, canViewSales, canViewPersonalSales, canViewInventory, canViewFinance, canViewPurchases, canViewAudit, canViewAlerts]
  );

  // Report-level access check
  const canAccessReport = useCallback(
    (category: ReportCategory, reportKey: string): boolean => {
      if (!canAccessCategory(category)) return false;

      // Find the category config
      const categoryConfig = REPORT_CATEGORIES.find((c) => c.key === category);
      if (!categoryConfig) return false;

      // Find the specific report
      const report = categoryConfig.subReports.find((r) => r.key === reportKey);
      if (!report) return false;

      // Check specific permission if defined
      if (report.permission) {
        return hasPermission(report.permission);
      }

      // For sales category, handle personal-only access
      if (category === 'sales' && !canViewSales && canViewPersonalSales) {
        return reportKey === 'personal';
      }

      return true;
    },
    [canAccessCategory, hasPermission, canViewSales, canViewPersonalSales]
  );

  // Get accessible categories
  const accessibleCategories = useMemo(() => {
    return REPORT_CATEGORIES.filter((category) => canAccessCategory(category.key));
  }, [canAccessCategory]);

  // Helper flags
  const isFullAccess = useMemo(
    () => isAdmin || isManagerOrAbove,
    [isAdmin, isManagerOrAbove]
  );

  const isPersonalOnly = useMemo(
    () => canViewPersonalSales && !canViewSales && !canViewInventory && !canViewFinance,
    [canViewPersonalSales, canViewSales, canViewInventory, canViewFinance]
  );

  return {
    canAccessReports,
    canAccessCategory,
    accessibleCategories,
    canViewSales,
    canViewPersonalSales,
    canViewInventory,
    canViewFinance,
    canViewPurchases,
    canViewAudit,
    canViewAlerts,
    canExport,
    canConfigure,
    canAccessReport,
    isFullAccess,
    isPersonalOnly,
  };
}
