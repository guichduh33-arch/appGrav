import { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, AlertCircle, Package, Info, BarChart3, Truck, Gauge, Database } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useSettingsByCategory, useUpdateSetting } from '@/hooks/settings';
import { INVENTORY_CONFIG_DEFAULTS } from '@/hooks/settings/useModuleConfigSettings';
import { toast } from 'sonner';

const FIELDS = [
  { key: 'inventory_config.stock_warning_threshold', label: 'Warning Threshold', desc: 'Units remaining before a warning alert is triggered', suffix: 'units', section: 'alerts' },
  { key: 'inventory_config.stock_critical_threshold', label: 'Critical Threshold', desc: 'Units remaining before a critical alert is triggered', suffix: 'units', section: 'alerts' },
  { key: 'inventory_config.stock_percentage_warning', label: 'Warning % of Minimum', desc: 'Percentage of minimum stock that triggers a warning', suffix: '%', section: 'alerts' },
  { key: 'inventory_config.stock_percentage_critical', label: 'Critical % of Minimum', desc: 'Percentage of minimum stock that triggers a critical alert', suffix: '%', section: 'alerts' },
  { key: 'inventory_config.reorder_lookback_days', label: 'Reorder Lookback', desc: 'Number of days to analyze for reorder calculations', suffix: 'days', section: 'analysis' },
  { key: 'inventory_config.production_lookback_days', label: 'Production Lookback', desc: 'Number of days to analyze for production planning', suffix: 'days', section: 'analysis' },
  { key: 'inventory_config.max_stock_multiplier', label: 'Max Stock Multiplier', desc: 'Maximum stock level as a multiplier of average usage', suffix: 'x', section: 'supply' },
  { key: 'inventory_config.po_lead_time_days', label: 'PO Lead Time', desc: 'Default lead time for purchase orders', suffix: 'days', section: 'supply' },
  { key: 'inventory_config.production_priority_high_threshold', label: 'High Priority %', desc: 'Stock percentage below which production is high priority', suffix: '%', section: 'priority' },
  { key: 'inventory_config.production_priority_medium_threshold', label: 'Medium Priority %', desc: 'Stock percentage below which production is medium priority', suffix: '%', section: 'priority' },
  { key: 'inventory_config.stock_movements_default_limit', label: 'Default Movements Limit', desc: 'Max stock movements returned in general queries', suffix: 'rows', section: 'query' },
  { key: 'inventory_config.stock_movements_product_limit', label: 'Per-Product Limit', desc: 'Max stock movements returned per product', suffix: 'rows', section: 'query' },
  { key: 'inventory_config.low_stock_refresh_interval_seconds', label: 'Low Stock Refresh', desc: 'How often the low stock list refreshes', suffix: 'sec', section: 'query' },
] as const;

const DEFAULTS: Record<string, number> = {
  'inventory_config.stock_warning_threshold': INVENTORY_CONFIG_DEFAULTS.stockWarningThreshold,
  'inventory_config.stock_critical_threshold': INVENTORY_CONFIG_DEFAULTS.stockCriticalThreshold,
  'inventory_config.stock_percentage_warning': INVENTORY_CONFIG_DEFAULTS.stockPercentageWarning,
  'inventory_config.stock_percentage_critical': INVENTORY_CONFIG_DEFAULTS.stockPercentageCritical,
  'inventory_config.reorder_lookback_days': INVENTORY_CONFIG_DEFAULTS.reorderLookbackDays,
  'inventory_config.production_lookback_days': INVENTORY_CONFIG_DEFAULTS.productionLookbackDays,
  'inventory_config.max_stock_multiplier': INVENTORY_CONFIG_DEFAULTS.maxStockMultiplier,
  'inventory_config.po_lead_time_days': INVENTORY_CONFIG_DEFAULTS.poLeadTimeDays,
  'inventory_config.production_priority_high_threshold': INVENTORY_CONFIG_DEFAULTS.productionPriorityHighThreshold,
  'inventory_config.production_priority_medium_threshold': INVENTORY_CONFIG_DEFAULTS.productionPriorityMediumThreshold,
  'inventory_config.stock_movements_default_limit': INVENTORY_CONFIG_DEFAULTS.stockMovementsDefaultLimit,
  'inventory_config.stock_movements_product_limit': INVENTORY_CONFIG_DEFAULTS.stockMovementsProductLimit,
  'inventory_config.low_stock_refresh_interval_seconds': INVENTORY_CONFIG_DEFAULTS.lowStockRefreshIntervalSeconds,
};

const SECTIONS = [
  { id: 'alerts', title: 'Stock Alert Thresholds', icon: AlertCircle, desc: 'Configure when stock warnings and critical alerts are triggered' },
  { id: 'analysis', title: 'Analysis Periods', icon: BarChart3, desc: 'Time ranges for demand analysis and planning' },
  { id: 'supply', title: 'Supply Parameters', icon: Truck, desc: 'Purchase order and stock level parameters' },
  { id: 'priority', title: 'Production Priority Thresholds', icon: Gauge, desc: 'Stock levels that determine production urgency' },
  { id: 'query', title: 'Query Limits', icon: Database, desc: 'Data retrieval limits and refresh intervals' },
] as const;

const InventoryConfigSettingsPage = () => {
  const { data: settings, isLoading, error } = useSettingsByCategory('inventory_config');
  const updateSetting = useUpdateSetting();
  const [formValues, setFormValues] = useState<Record<string, number>>({});
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      const values: Record<string, number> = {};
      FIELDS.forEach(({ key }) => {
        const setting = settings.find((s) => s.key === key);
        values[key] = (setting?.value as number) ?? DEFAULTS[key];
      });
      setFormValues(values);
      setPendingChanges(new Set());
    }
  }, [settings]);

  const handleChange = useCallback((key: string, raw: string) => {
    const value = key.includes('max_stock_multiplier') ? parseFloat(raw) || 0 : parseInt(raw, 10) || 0;
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setPendingChanges((prev) => new Set(prev).add(key));
  }, []);

  const handleSaveAll = async () => {
    if (pendingChanges.size === 0) return;
    setIsSaving(true);
    const errors: string[] = [];
    for (const key of pendingChanges) {
      try {
        await updateSetting.mutateAsync({ key, value: formValues[key] });
      } catch { errors.push(key); }
    }
    setIsSaving(false);
    if (errors.length === 0) { toast.success('Inventory settings saved'); setPendingChanges(new Set()); }
    else toast.error(`Failed to save ${errors.length} setting(s)`);
  };

  const handleCancel = () => {
    if (!settings) return;
    const values: Record<string, number> = {};
    FIELDS.forEach(({ key }) => {
      const setting = settings.find((s) => s.key === key);
      values[key] = (setting?.value as number) ?? DEFAULTS[key];
    });
    setFormValues(values);
    setPendingChanges(new Set());
    toast.success('Changes discarded');
  };

  if (isLoading) return <div className="settings-section"><div className="settings-section__body settings-section__loading"><div className="spinner" /><span>Loading settings...</span></div></div>;
  if (error || !settings) return <div className="settings-section"><div className="settings-section__body settings-section__error"><AlertCircle size={24} /><span>Error loading settings</span></div></div>;

  return (
    <TooltipProvider>
      <div className="settings-section">
        <div className="settings-section__header">
          <div className="settings-section__header-content">
            <div>
              <h2 className="settings-section__title"><Package size={20} /> Inventory Configuration</h2>
              <p className="settings-section__description">Manage stock thresholds, analysis periods, and query limits</p>
            </div>
            {pendingChanges.size > 0 && (
              <div className="settings-section__actions">
                <button className="btn-secondary" onClick={handleCancel} disabled={isSaving}><RotateCcw size={16} /> Cancel</button>
                <button className="btn-primary" onClick={handleSaveAll} disabled={isSaving}><Save size={16} /> {isSaving ? 'Saving...' : `Save (${pendingChanges.size})`}</button>
              </div>
            )}
          </div>
        </div>

        <div className="settings-section__body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const sectionFields = FIELDS.filter((f) => f.section === section.id);
            return (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><Icon size={18} className="text-rose-400" />{section.title}</CardTitle>
                  <CardDescription>{section.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {sectionFields.map((field) => (
                      <div key={field.key} className="form-group--inline">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <label className="form-label" style={{ marginBottom: 0 }}>{field.label}</label>
                          <Tooltip>
                            <TooltipTrigger asChild><span style={{ cursor: 'help' }}><Info size={14} className="text-gray-400" /></span></TooltipTrigger>
                            <TooltipContent><p>{field.desc}</p></TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="form-input-group">
                          <input
                            type="number"
                            className="form-input form-input--narrow"
                            value={formValues[field.key] ?? ''}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            min={0}
                            step={field.key.includes('max_stock_multiplier') ? 0.1 : 1}
                          />
                          <span className="form-input-suffix">{field.suffix}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {pendingChanges.size > 0 && (
          <div className="settings-section__footer">
            <div className="settings-unsaved-notice"><AlertCircle size={16} /><span>{pendingChanges.size} unsaved change{pendingChanges.size > 1 ? 's' : ''}</span></div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default InventoryConfigSettingsPage;
