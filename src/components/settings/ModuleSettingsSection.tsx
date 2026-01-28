import { useTranslation } from 'react-i18next';
import {
  Package,
  Factory,
  Users,
  ShoppingBag,
  Gift,
  ChefHat,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  useModuleSettings,
  useUpdateModuleSetting,
} from '../../hooks/useSettings';
import type { ModuleSettings } from '../../types/settings';

interface ModuleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children?: React.ReactNode;
}

function ModuleCard({ icon, title, description, enabled, onToggle, children }: ModuleCardProps) {
  return (
    <div className={`module-card ${enabled ? 'is-enabled' : 'is-disabled'}`}>
      <div className="module-card__header">
        <div className="module-card__icon">{icon}</div>
        <div className="module-card__info">
          <h4 className="module-card__title">{title}</h4>
          <p className="module-card__description">{description}</p>
        </div>
        <button
          className={`module-card__toggle ${enabled ? 'is-on' : ''}`}
          onClick={() => onToggle(!enabled)}
          aria-label={enabled ? 'Désactiver' : 'Activer'}
        >
          {enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
        </button>
      </div>
      {enabled && children && <div className="module-card__settings">{children}</div>}
    </div>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

function NumberInput({ label, value, onChange, min, max, step = 1, suffix }: NumberInputProps) {
  return (
    <div className="form-group form-group--inline">
      <label className="form-label">{label}</label>
      <div className="form-input-group">
        <input
          type="number"
          className="form-input form-input--narrow"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
        />
        {suffix && <span className="form-input-suffix">{suffix}</span>}
      </div>
    </div>
  );
}

export default function ModuleSettingsSection() {
  const { t } = useTranslation();
  const { data: settings, isLoading } = useModuleSettings();
  const updateSetting = useUpdateModuleSetting();

  const handleUpdate = (module: keyof ModuleSettings, key: string, value: unknown) => {
    updateSetting.mutate({ module, key, value });
  };

  if (isLoading || !settings) {
    return (
      <div className="settings-section">
        <div className="settings-section__header">
          <h2 className="settings-section__title">
            <Package size={20} />
            {t('settings.modules.title', 'Modules')}
          </h2>
        </div>
        <div className="settings-section__body" style={{ textAlign: 'center', padding: '2rem' }}>
          <RefreshCw size={24} className="spinning" />
          <p>{t('common.loading', 'Chargement...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <h2 className="settings-section__title">
          <Package size={20} />
          {t('settings.modules.title', 'Modules')}
        </h2>
        <p className="settings-section__description">
          {t('settings.modules.description', 'Activez ou désactivez les modules de l\'application')}
        </p>
      </div>
      <div className="settings-section__body">
        <div className="module-cards-grid">
          {/* Production Module */}
          <ModuleCard
            icon={<Factory size={24} />}
            title={t('settings.modules.production.title', 'Production')}
            description={t('settings.modules.production.description', 'Gestion de la production et des recettes')}
            enabled={settings.production.enabled}
            onToggle={(v) => handleUpdate('production', 'enabled', v)}
          >
            <div className="toggle-group toggle-group--compact">
              <div className="toggle-group__info">
                <span className="toggle-group__label">
                  {t('settings.modules.production.autoConsumeStock', 'Consommation auto du stock')}
                </span>
              </div>
              <div
                className={`toggle-switch toggle-switch--sm ${settings.production.auto_consume_stock ? 'is-on' : ''}`}
                onClick={() => handleUpdate('production', 'auto_consume_stock', !settings.production.auto_consume_stock)}
              />
            </div>
          </ModuleCard>

          {/* B2B Module */}
          <ModuleCard
            icon={<Users size={24} />}
            title={t('settings.modules.b2b.title', 'B2B / Wholesale')}
            description={t('settings.modules.b2b.description', 'Commandes en gros et clients professionnels')}
            enabled={settings.b2b.enabled}
            onToggle={(v) => handleUpdate('b2b', 'enabled', v)}
          >
            <NumberInput
              label={t('settings.modules.b2b.minOrderAmount', 'Commande minimum')}
              value={settings.b2b.min_order_amount}
              onChange={(v) => handleUpdate('b2b', 'min_order_amount', v)}
              min={0}
              step={10000}
              suffix="Rp"
            />
            <NumberInput
              label={t('settings.modules.b2b.defaultPaymentTerms', 'Délai de paiement')}
              value={settings.b2b.default_payment_terms}
              onChange={(v) => handleUpdate('b2b', 'default_payment_terms', v)}
              min={0}
              max={90}
              suffix={t('common.days', 'jours')}
            />
          </ModuleCard>

          {/* Purchasing Module */}
          <ModuleCard
            icon={<ShoppingBag size={24} />}
            title={t('settings.modules.purchasing.title', 'Achats')}
            description={t('settings.modules.purchasing.description', 'Bons de commande et gestion des fournisseurs')}
            enabled={settings.purchasing.enabled}
            onToggle={(v) => handleUpdate('purchasing', 'enabled', v)}
          >
            <NumberInput
              label={t('settings.modules.purchasing.autoReorderThreshold', 'Seuil de réapprovisionnement auto')}
              value={settings.purchasing.auto_reorder_threshold}
              onChange={(v) => handleUpdate('purchasing', 'auto_reorder_threshold', v)}
              min={0}
              suffix={t('common.units', 'unités')}
            />
          </ModuleCard>

          {/* Loyalty Module */}
          <ModuleCard
            icon={<Gift size={24} />}
            title={t('settings.modules.loyalty.title', 'Fidélité')}
            description={t('settings.modules.loyalty.description', 'Programme de points et récompenses')}
            enabled={settings.loyalty.enabled}
            onToggle={(v) => handleUpdate('loyalty', 'enabled', v)}
          >
            <NumberInput
              label={t('settings.modules.loyalty.pointsPerIdr', 'Points par Rp')}
              value={settings.loyalty.points_per_idr}
              onChange={(v) => handleUpdate('loyalty', 'points_per_idr', v)}
              min={100}
              step={100}
              suffix="Rp"
            />
            <NumberInput
              label={t('settings.modules.loyalty.pointsExpiryDays', 'Expiration des points')}
              value={settings.loyalty.points_expiry_days}
              onChange={(v) => handleUpdate('loyalty', 'points_expiry_days', v)}
              min={30}
              max={730}
              suffix={t('common.days', 'jours')}
            />
          </ModuleCard>

          {/* KDS Module */}
          <ModuleCard
            icon={<ChefHat size={24} />}
            title={t('settings.modules.kds.title', 'KDS')}
            description={t('settings.modules.kds.description', 'Affichage cuisine et gestion des commandes')}
            enabled={settings.kds.enabled}
            onToggle={(v) => handleUpdate('kds', 'enabled', v)}
          >
            <NumberInput
              label={t('settings.modules.kds.autoAcknowledgeDelay', 'Délai accusé auto')}
              value={settings.kds.auto_acknowledge_delay}
              onChange={(v) => handleUpdate('kds', 'auto_acknowledge_delay', v)}
              min={0}
              max={60}
              suffix={t('common.seconds', 'sec')}
            />
            <div className="toggle-group toggle-group--compact">
              <div className="toggle-group__info">
                <span className="toggle-group__label">
                  {t('settings.modules.kds.soundNewOrder', 'Son nouvelle commande')}
                </span>
              </div>
              <div
                className={`toggle-switch toggle-switch--sm ${settings.kds.sound_new_order ? 'is-on' : ''}`}
                onClick={() => handleUpdate('kds', 'sound_new_order', !settings.kds.sound_new_order)}
              />
            </div>
          </ModuleCard>
        </div>
      </div>
    </div>
  );
}
