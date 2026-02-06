import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Save, RotateCcw, AlertCircle } from 'lucide-react';
import { useSettingsByCategory, useUpdateSetting, useResetSetting } from '../../hooks/settings';
import { useSettingsStore } from '../../stores/settingsStore';
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
  const categories = useSettingsStore((state) => state.categories);

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

  // Handle value change
  const handleChange = (key: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setPendingChanges((prev) => new Set(prev).add(key));
  };

  // Handle reset single setting
  const handleReset = async (key: string) => {
    try {
      await resetSettingMutation.mutateAsync(key);
      toast.success('Setting reset');
      setPendingChanges((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    } catch (error) {
      toast.error('Error resetting setting');
    }
  };

  // Handle save all changes
  const handleSaveAll = async () => {
    if (pendingChanges.size === 0) return;

    setIsSaving(true);
    const errors: string[] = [];

    try {
      for (const key of pendingChanges) {
        try {
          await updateSettingMutation.mutateAsync({
            key,
            value: formValues[key],
          });
        } catch (error) {
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

  // Handle reset all
  const handleResetAll = () => {
    if (!settings) return;

    // Restore original values
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
      <div className="settings-section">
        <div className="settings-section__body settings-section__loading">
          <div className="spinner" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="settings-section">
        <div className="settings-section__body settings-section__error">
          <AlertCircle size={24} />
          <span>Error loading settings</span>
        </div>
      </div>
    );
  }

  const categoryName = categoryInfo?.[nameKey] || categoryInfo?.name_en || category;
  const categoryDescription = categoryInfo?.[descKey] || categoryInfo?.description_en;

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <div className="settings-section__header-content">
          <div>
            <h2 className="settings-section__title">{categoryName}</h2>
            {categoryDescription && (
              <p className="settings-section__description">{categoryDescription}</p>
            )}
          </div>
          {pendingChanges.size > 0 && (
            <div className="settings-section__actions">
              <button
                className="btn-secondary"
                onClick={handleResetAll}
                disabled={isSaving}
              >
                <RotateCcw size={16} />
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSaveAll}
                disabled={isSaving}
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : `Save (${pendingChanges.size})`}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="settings-section__body">
        {settings.length === 0 ? (
          <div className="settings-section__empty">
            <p>No settings in this category.</p>
          </div>
        ) : (
          <div className="settings-list">
            {settings.map((setting) => (
              <SettingField
                key={setting.key}
                setting={setting}
                value={formValues[setting.key]}
                onChange={(value) => handleChange(setting.key, value)}
                onReset={() => handleReset(setting.key)}
                disabled={(setting.is_readonly ?? false) || (setting.is_system ?? false)}
              />
            ))}
          </div>
        )}
      </div>

      {pendingChanges.size > 0 && (
        <div className="settings-section__footer">
          <div className="settings-unsaved-notice">
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
