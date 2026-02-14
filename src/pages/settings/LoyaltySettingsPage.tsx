import { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, AlertCircle, Heart, Info, Award, Coins, Users } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
        <div className="flex flex-col items-center justify-center py-16 text-[var(--theme-text-muted)] gap-3">
          <div className="w-6 h-6 border-2 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
          <span className="text-sm">Loading settings...</span>
        </div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
        <div className="flex items-center justify-center gap-2 py-16 text-red-400">
          <AlertCircle size={24} />
          <span>Error loading settings</span>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-[var(--color-gold)]" />
            <div>
              <h2 className="text-lg font-bold text-white">Loyalty Program</h2>
              <p className="text-sm text-[var(--theme-text-muted)]">Configure loyalty tiers, points conversion, and default customer category</p>
            </div>
          </div>
          {pendingChanges.size > 0 && (
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl text-sm transition-colors" onClick={handleCancel} disabled={isSaving}>
                <RotateCcw size={14} /> Cancel
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:opacity-90 disabled:opacity-50" onClick={handleSaveAll} disabled={isSaving}>
                <Save size={14} /> {isSaving ? 'Saving...' : `Save (${pendingChanges.size})`}
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          {/* Tier Configuration */}
          <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Award size={16} className="text-[var(--color-gold)]" /> Loyalty Tiers
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">Set point thresholds, discount rates, and tier colors</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Tier</th>
                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Points Threshold</th>
                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Discount %</th>
                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Color</th>
                    <th className="text-center px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {TIERS.map((tier) => (
                    <tr key={tier} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 text-sm font-semibold text-white">{TIER_LABELS[tier]}</td>
                      <td className="px-4 py-2.5">
                        <input type="number" className="w-24 px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20" min={0} value={form.tierThresholds[tier]} onChange={(e) => handleTierThreshold(tier, e.target.value)} />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <input type="number" className="w-20 px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20" min={0} max={100} step={0.5} value={form.tierDiscounts[tier]} onChange={(e) => handleTierDiscount(tier, e.target.value)} />
                          <span className="text-xs text-[var(--theme-text-muted)]">%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full shrink-0 ring-1 ring-white/10" style={{ background: form.tierColors[tier] }} />
                          <input type="text" className="w-24 px-2 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs font-mono outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20" value={form.tierColors[tier]} onChange={(e) => handleTierColor(tier, e.target.value)} />
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <Badge style={{ backgroundColor: form.tierColors[tier], color: '#fff', border: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                          {TIER_LABELS[tier]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Points Conversion */}
          <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Coins size={16} className="text-[var(--color-gold)]" /> Points Conversion
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">How much a customer spends to earn 1 loyalty point</p>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-white/80">1 point per</span>
                  <Tooltip>
                    <TooltipTrigger asChild><span className="cursor-help"><Info size={12} className="text-[var(--theme-text-muted)]" /></span></TooltipTrigger>
                    <TooltipContent><p>Amount in IDR a customer must spend to earn 1 loyalty point</p></TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" className="w-28 px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 text-right" min={1} value={form.pointsPerIdr} onChange={(e) => { setForm((prev) => ({ ...prev, pointsPerIdr: parseInt(e.target.value, 10) || 0 })); markDirty('pointsPerIdr'); }} />
                  <span className="text-xs text-[var(--theme-text-muted)]">IDR spent</span>
                </div>
              </div>
            </div>
          </div>

          {/* Default Customer Category */}
          <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Users size={16} className="text-[var(--color-gold)]" /> Default Customer Category
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">Category slug assigned to new customers by default</p>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-white/80">Category Slug</span>
                <input type="text" className="w-40 px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm font-mono outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20" value={form.defaultCustomerCategorySlug} onChange={(e) => { setForm((prev) => ({ ...prev, defaultCustomerCategorySlug: e.target.value })); markDirty('defaultCustomerCategorySlug'); }} />
              </div>
            </div>
          </div>
        </div>

        {/* Unsaved notice */}
        {pendingChanges.size > 0 && (
          <div className="px-6 py-3 border-t border-white/5 bg-[var(--color-gold)]/5">
            <div className="flex items-center gap-2 text-[var(--color-gold)] text-sm">
              <AlertCircle size={16} />
              <span>{pendingChanges.size} unsaved change{pendingChanges.size > 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default LoyaltySettingsPage;
