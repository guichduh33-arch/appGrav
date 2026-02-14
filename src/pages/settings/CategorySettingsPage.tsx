import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Save, RotateCcw, AlertCircle } from 'lucide-react';
import { useSettingsByCategory, useUpdateSetting, useResetSetting } from '../../hooks/settings';
import { useCoreSettingsStore } from '../../stores/settings';
import SettingField from '../../components/settings/SettingField';
import { toast } from 'sonner';

const CategorySettingsPage = () => {
  const location = useLocation();

  // Extract category from URL path (e.g., /settings/company -> company)
  // Default to 'company' when at /settings root
  const pathParts = location.pathname.split('/').filter(Boolean);
  const category = pathParts.length > 1 ? pathParts[pathParts.length - 1] : 'company';

  const { data: settings, isLoading, error } = useSettingsByCategory(category);
  const updateSettingMutation = useUpdateSetting();
  const resetSettingMutation = useResetSetting();
  const categories = useCoreSettingsStore((state) => state.categories);

  // Local state for form values
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Get category info
  const categoryInfo = categories.find((c) => c.code === category);

  // Use English
  const nameKey = 'name_en' as const;
  const descKey = 'description_en' as const;

  // Initialize form values from settings
  useEffect(() => {
    if (settings) {
      const values: Record<string, unknown> = {};
      settings.forEach((setting) => {
        values[setting.key] = setting.value;
      });
      setFormValues(values);
      setPendingChanges(new Set());
    }
  }, [settings]);

  const handleChange = (key: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setPendingChanges((prev) => new Set(prev).add(key));
  };

  const handleReset = async (key: string) => {
    try {
      await resetSettingMutation.mutateAsync(key);
      toast.success('Setting reset');
      setPendingChanges((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    } catch {
      toast.error('Error resetting setting');
    }
  };

  const handleSaveAll = async () => {
    if (pendingChanges.size === 0) return;
    setIsSaving(true);
    const errors: string[] = [];
    try {
      for (const key of pendingChanges) {
        try {
          await updateSettingMutation.mutateAsync({ key, value: formValues[key] });
        } catch {
          errors.push(key);
        }
      }
      if (errors.length === 0) {
        toast.success('Settings saved');
        setPendingChanges(new Set());
      } else {
        toast.error(`Error on ${errors.length} setting(s)`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetAll = () => {
    if (!settings) return;
    const values: Record<string, unknown> = {};
    settings.forEach((setting) => {
      values[setting.key] = setting.value;
    });
    setFormValues(values);
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

  const categoryName = categoryInfo?.[nameKey] || categoryInfo?.name_en || category;
  const categoryDescription = categoryInfo?.[descKey] || categoryInfo?.description_en;

  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold text-white">{categoryName}</h2>
          {categoryDescription && (
            <p className="text-sm text-[var(--theme-text-muted)] mt-0.5">{categoryDescription}</p>
          )}
        </div>
        {pendingChanges.size > 0 && (
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl text-sm transition-colors"
              onClick={handleResetAll}
              disabled={isSaving}
            >
              <RotateCcw size={14} />
              Cancel
            </button>
            <button
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:opacity-90 disabled:opacity-50"
              onClick={handleSaveAll}
              disabled={isSaving}
            >
              <Save size={14} />
              {isSaving ? 'Saving...' : `Save (${pendingChanges.size})`}
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-4">
        {settings.length === 0 ? (
          <div className="text-center py-12 text-[var(--theme-text-muted)]">
            <p>No settings in this category.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {settings.map((setting) => (
              <SettingField
                key={setting.key}
                setting={setting}
                value={formValues[setting.key]}
                onChange={(value) => handleChange(setting.key, value)}
                onReset={() => handleReset(setting.key)}
                disabled={setting.is_readonly ?? false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Unsaved notice */}
      {pendingChanges.size > 0 && (
        <div className="px-6 py-3 border-t border-white/5 bg-[var(--color-gold)]/5">
          <div className="flex items-center gap-2 text-[var(--color-gold)] text-sm">
            <AlertCircle size={16} />
            <span>
              {pendingChanges.size} unsaved change{pendingChanges.size > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySettingsPage;
