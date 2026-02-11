import { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, AlertCircle, Heart, Info, Award, Coins, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useSettingsByCategory, useUpdateSetting } from '@/hooks/settings';
import { LOYALTY_DEFAULTS } from '@/hooks/settings/useModuleConfigSettings';
import type { ILoyaltyTierMap, ILoyaltyColorMap } from '@/types/settingsModuleConfig';
import { toast } from 'sonner';

type TierName = 'bronze' | 'silver' | 'gold' | 'platinum';
const TIERS: TierName[] = ['bronze', 'silver', 'gold', 'platinum'];
const TIER_LABELS: Record<TierName, string> = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', platinum: 'Platinum' };

interface ILocalState {
  tierThresholds: ILoyaltyTierMap;
  tierDiscounts: ILoyaltyTierMap;
  tierColors: ILoyaltyColorMap;
  pointsPerIdr: number;
  defaultCustomerCategorySlug: string;
}

const buildDefaults = (): ILocalState => ({
  tierThresholds: { ...LOYALTY_DEFAULTS.tierThresholds },
  tierDiscounts: { ...LOYALTY_DEFAULTS.tierDiscounts },
  tierColors: { ...LOYALTY_DEFAULTS.tierColors },
  pointsPerIdr: LOYALTY_DEFAULTS.pointsPerIdr,
  defaultCustomerCategorySlug: LOYALTY_DEFAULTS.defaultCustomerCategorySlug,
});

const KEY_MAP: Record<keyof ILocalState, string> = {
  tierThresholds: 'loyalty.tier_thresholds',
  tierDiscounts: 'loyalty.tier_discounts',
  tierColors: 'loyalty.tier_colors',
  pointsPerIdr: 'loyalty.points_per_idr',
  defaultCustomerCategorySlug: 'loyalty.default_customer_category_slug',
};

const LoyaltySettingsPage = () => {
  const { data: settings, isLoading, error } = useSettingsByCategory('loyalty');
  const updateSetting = useUpdateSetting();
  const [form, setForm] = useState<ILocalState>(buildDefaults);
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const initFromSettings = useCallback(() => {
    if (!settings) return buildDefaults();
    const get = <T,>(key: string, fallback: T): T => {
      const s = settings.find((x) => x.key === key);
      return s ? (s.value as T) : fallback;
    };
    return {
      tierThresholds: get<ILoyaltyTierMap>('loyalty.tier_thresholds', LOYALTY_DEFAULTS.tierThresholds),
      tierDiscounts: get<ILoyaltyTierMap>('loyalty.tier_discounts', LOYALTY_DEFAULTS.tierDiscounts),
      tierColors: get<ILoyaltyColorMap>('loyalty.tier_colors', LOYALTY_DEFAULTS.tierColors),
      pointsPerIdr: get<number>('loyalty.points_per_idr', LOYALTY_DEFAULTS.pointsPerIdr),
      defaultCustomerCategorySlug: get<string>('loyalty.default_customer_category_slug', LOYALTY_DEFAULTS.defaultCustomerCategorySlug),
    };
  }, [settings]);

  useEffect(() => {
    if (settings) { setForm(initFromSettings()); setPendingChanges(new Set()); }
  }, [settings, initFromSettings]);

  const markDirty = (field: keyof ILocalState) => setPendingChanges((prev) => new Set(prev).add(field));

  const handleTierThreshold = (tier: TierName, raw: string) => {
    const val = parseInt(raw, 10) || 0;
    setForm((prev) => ({ ...prev, tierThresholds: { ...prev.tierThresholds, [tier]: val } }));
    markDirty('tierThresholds');
  };

  const handleTierDiscount = (tier: TierName, raw: string) => {
    const val = parseFloat(raw) || 0;
    setForm((prev) => ({ ...prev, tierDiscounts: { ...prev.tierDiscounts, [tier]: val } }));
    markDirty('tierDiscounts');
  };

  const handleTierColor = (tier: TierName, color: string) => {
    setForm((prev) => ({ ...prev, tierColors: { ...prev.tierColors, [tier]: color } }));
    markDirty('tierColors');
  };

  const handleSaveAll = async () => {
    if (pendingChanges.size === 0) return;
    setIsSaving(true);
    const errors: string[] = [];
    for (const field of pendingChanges) {
      const key = KEY_MAP[field as keyof ILocalState];
      const value = form[field as keyof ILocalState];
      try { await updateSetting.mutateAsync({ key, value }); }
      catch { errors.push(key); }
    }
    setIsSaving(false);
    if (errors.length === 0) { toast.success('Loyalty settings saved'); setPendingChanges(new Set()); }
    else toast.error(`Failed to save ${errors.length} setting(s)`);
  };

  const handleCancel = () => {
    setForm(initFromSettings());
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
              <h2 className="settings-section__title"><Heart size={20} /> Loyalty Program</h2>
              <p className="settings-section__description">Configure loyalty tiers, points conversion, and default customer category</p>
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
          {/* Tier configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Award size={18} className="text-rose-400" /> Loyalty Tiers</CardTitle>
              <CardDescription>Set point thresholds, discount rates, and tier colors</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.8125rem', fontWeight: 600 }}>Tier</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.8125rem', fontWeight: 600 }}>Points Threshold</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.8125rem', fontWeight: 600 }}>Discount %</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.8125rem', fontWeight: 600 }}>Color</th>
                      <th style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.8125rem', fontWeight: 600 }}>Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TIERS.map((tier) => (
                      <tr key={tier} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '0.5rem', fontWeight: 600 }}>{TIER_LABELS[tier]}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <input type="number" className="form-input form-input--narrow" min={0} value={form.tierThresholds[tier]} onChange={(e) => handleTierThreshold(tier, e.target.value)} />
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          <div className="form-input-group">
                            <input type="number" className="form-input form-input--narrow" min={0} max={100} step={0.5} value={form.tierDiscounts[tier]} onChange={(e) => handleTierDiscount(tier, e.target.value)} />
                            <span className="form-input-suffix">%</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: 20, height: 20, borderRadius: '50%', background: form.tierColors[tier], border: '1px solid #ccc', flexShrink: 0 }} />
                            <input type="text" className="form-input form-input--narrow form-input--mono" value={form.tierColors[tier]} onChange={(e) => handleTierColor(tier, e.target.value)} style={{ width: 100 }} />
                          </div>
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <Badge style={{ backgroundColor: form.tierColors[tier], color: '#fff', border: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                            {TIER_LABELS[tier]}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Points Conversion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Coins size={18} className="text-rose-400" /> Points Conversion</CardTitle>
              <CardDescription>How much a customer spends to earn 1 loyalty point</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="form-group--inline">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>1 point per</label>
                  <Tooltip>
                    <TooltipTrigger asChild><span style={{ cursor: 'help' }}><Info size={14} className="text-gray-400" /></span></TooltipTrigger>
                    <TooltipContent><p>Amount in IDR a customer must spend to earn 1 loyalty point</p></TooltipContent>
                  </Tooltip>
                </div>
                <div className="form-input-group">
                  <input type="number" className="form-input form-input--narrow" min={1} value={form.pointsPerIdr} onChange={(e) => { setForm((prev) => ({ ...prev, pointsPerIdr: parseInt(e.target.value, 10) || 0 })); markDirty('pointsPerIdr'); }} />
                  <span className="form-input-suffix">IDR spent</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Default Customer Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Users size={18} className="text-rose-400" /> Default Customer Category</CardTitle>
              <CardDescription>Category slug assigned to new customers by default</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="form-group--inline">
                <label className="form-label" style={{ marginBottom: 0 }}>Category Slug</label>
                <input type="text" className="form-input form-input--narrow form-input--mono" value={form.defaultCustomerCategorySlug} onChange={(e) => { setForm((prev) => ({ ...prev, defaultCustomerCategorySlug: e.target.value })); markDirty('defaultCustomerCategorySlug'); }} />
              </div>
            </CardContent>
          </Card>
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

export default LoyaltySettingsPage;
