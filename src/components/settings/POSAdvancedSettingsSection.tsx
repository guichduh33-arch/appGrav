import { useTranslation } from 'react-i18next';
import {
  ShoppingCart,
  Lock,
  Volume2,
  DollarSign,
  CreditCard,
  Monitor,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import {
  usePOSAdvancedSettings,
  useUpdatePOSAdvancedSetting,
} from '../../hooks/useSettings';
import type { POSAdvancedSettings, RoundingMethod, SoundType } from '../../types/settings';

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function Toggle({ label, description, checked, onChange, disabled }: ToggleProps) {
  return (
    <div className="toggle-group">
      <div className="toggle-group__info">
        <span className="toggle-group__label">{label}</span>
        {description && <span className="toggle-group__description">{description}</span>}
      </div>
      <div
        className={`toggle-switch ${checked ? 'is-on' : ''} ${disabled ? 'is-disabled' : ''}`}
        onClick={() => !disabled && onChange(!checked)}
      />
    </div>
  );
}

interface SelectProps {
  label: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (value: string | number) => void;
  disabled?: boolean;
}

function Select({ label, value, options, onChange, disabled }: SelectProps) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select
        className="form-input form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function POSAdvancedSettingsSection() {
  const { t } = useTranslation();
  const { data: settings, isLoading } = usePOSAdvancedSettings();
  const updateSetting = useUpdatePOSAdvancedSetting();

  const handleUpdate = (
    group: keyof POSAdvancedSettings,
    key: string,
    value: unknown
  ) => {
    updateSetting.mutate({ group, key, value });
  };

  if (isLoading || !settings) {
    return (
      <div className="settings-section">
        <div className="settings-section__header">
          <h2 className="settings-section__title">
            {t('settings.posAdvanced.title', 'Paramètres POS Avancés')}
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
          {t('settings.posAdvanced.title', 'Paramètres POS Avancés')}
        </h2>
        <p className="settings-section__description">
          {t('settings.posAdvanced.description', 'Configuration avancée du point de vente')}
        </p>
      </div>
      <div className="settings-section__body">
        {/* Cart Settings */}
        <div className="settings-group">
          <h3 className="settings-group__title">
            <ShoppingCart size={18} />
            {t('settings.posAdvanced.cart.title', 'Panier')}
          </h3>
          <Toggle
            label={t('settings.posAdvanced.cart.lockOnKitchenSend', 'Verrouiller après envoi cuisine')}
            description={t('settings.posAdvanced.cart.lockOnKitchenSendDesc', 'Les articles envoyés en cuisine ne peuvent plus être modifiés sans PIN')}
            checked={settings.cart.lock_on_kitchen_send}
            onChange={(v) => handleUpdate('cart', 'lock_on_kitchen_send', v)}
          />
          <Toggle
            label={t('settings.posAdvanced.cart.requirePinLockedRemove', 'PIN requis pour supprimer')}
            description={t('settings.posAdvanced.cart.requirePinLockedRemoveDesc', 'Demander le PIN pour supprimer un article verrouillé')}
            checked={settings.cart.require_pin_locked_remove}
            onChange={(v) => handleUpdate('cart', 'require_pin_locked_remove', v)}
          />
        </div>

        {/* Rounding Settings */}
        <div className="settings-group">
          <h3 className="settings-group__title">
            <DollarSign size={18} />
            {t('settings.posAdvanced.rounding.title', 'Arrondi IDR')}
          </h3>
          <Select
            label={t('settings.posAdvanced.rounding.amount', 'Arrondi au')}
            value={settings.rounding.amount}
            options={[
              { value: 100, label: 'Rp 100' },
              { value: 500, label: 'Rp 500' },
              { value: 1000, label: 'Rp 1.000' },
            ]}
            onChange={(v) => handleUpdate('rounding', 'amount', Number(v))}
          />
          <Select
            label={t('settings.posAdvanced.rounding.method', 'Méthode')}
            value={settings.rounding.method}
            options={[
              { value: 'round' as RoundingMethod, label: t('settings.posAdvanced.rounding.round', 'Arrondi standard') },
              { value: 'floor' as RoundingMethod, label: t('settings.posAdvanced.rounding.floor', 'Arrondi inférieur') },
              { value: 'ceil' as RoundingMethod, label: t('settings.posAdvanced.rounding.ceil', 'Arrondi supérieur') },
            ]}
            onChange={(v) => handleUpdate('rounding', 'method', v)}
          />
        </div>

        {/* Payment Settings */}
        <div className="settings-group">
          <h3 className="settings-group__title">
            <CreditCard size={18} />
            {t('settings.posAdvanced.payment.title', 'Paiement')}
          </h3>
          <Toggle
            label={t('settings.posAdvanced.payment.allowSplit', 'Paiement fractionné')}
            description={t('settings.posAdvanced.payment.allowSplitDesc', 'Permettre de diviser le paiement en plusieurs parties')}
            checked={settings.payment.allow_split}
            onChange={(v) => handleUpdate('payment', 'allow_split', v)}
          />
          {settings.payment.allow_split && (
            <Select
              label={t('settings.posAdvanced.payment.maxSplitCount', 'Nombre max de fractions')}
              value={settings.payment.max_split_count}
              options={[
                { value: 2, label: '2' },
                { value: 3, label: '3' },
                { value: 4, label: '4' },
                { value: 5, label: '5' },
              ]}
              onChange={(v) => handleUpdate('payment', 'max_split_count', Number(v))}
            />
          )}
        </div>

        {/* Sound Settings */}
        <div className="settings-group">
          <h3 className="settings-group__title">
            <Volume2 size={18} />
            {t('settings.posAdvanced.sound.title', 'Sons')}
          </h3>
          <Toggle
            label={t('settings.posAdvanced.sound.enabled', 'Sons activés')}
            description={t('settings.posAdvanced.sound.enabledDesc', 'Activer les notifications sonores')}
            checked={settings.sound.enabled}
            onChange={(v) => handleUpdate('sound', 'enabled', v)}
          />
          {settings.sound.enabled && (
            <>
              <Select
                label={t('settings.posAdvanced.sound.newOrder', 'Nouvelle commande')}
                value={settings.sound.new_order}
                options={[
                  { value: 'none' as SoundType, label: t('settings.posAdvanced.sound.none', 'Aucun') },
                  { value: 'chime' as SoundType, label: t('settings.posAdvanced.sound.chime', 'Carillon') },
                  { value: 'bell' as SoundType, label: t('settings.posAdvanced.sound.bell', 'Cloche') },
                  { value: 'beep' as SoundType, label: t('settings.posAdvanced.sound.beep', 'Bip') },
                ]}
                onChange={(v) => handleUpdate('sound', 'new_order', v)}
              />
              <Select
                label={t('settings.posAdvanced.sound.paymentSuccess', 'Paiement réussi')}
                value={settings.sound.payment_success}
                options={[
                  { value: 'none' as SoundType, label: t('settings.posAdvanced.sound.none', 'Aucun') },
                  { value: 'cash' as SoundType, label: t('settings.posAdvanced.sound.cash', 'Caisse') },
                  { value: 'success' as SoundType, label: t('settings.posAdvanced.sound.success', 'Succès') },
                  { value: 'chime' as SoundType, label: t('settings.posAdvanced.sound.chime', 'Carillon') },
                ]}
                onChange={(v) => handleUpdate('sound', 'payment_success', v)}
              />
            </>
          )}
        </div>

        {/* Screensaver Settings */}
        <div className="settings-group">
          <h3 className="settings-group__title">
            <Lock size={18} />
            {t('settings.posAdvanced.screensaver.title', 'Économiseur d\'écran')}
          </h3>
          <Toggle
            label={t('settings.posAdvanced.screensaver.enabled', 'Activer l\'économiseur')}
            description={t('settings.posAdvanced.screensaver.enabledDesc', 'Afficher un économiseur d\'écran après inactivité')}
            checked={settings.screensaver.enabled}
            onChange={(v) => handleUpdate('screensaver', 'enabled', v)}
          />
          {settings.screensaver.enabled && (
            <>
              <Select
                label={t('settings.posAdvanced.screensaver.timeout', 'Délai (secondes)')}
                value={settings.screensaver.timeout}
                options={[
                  { value: 60, label: '1 minute' },
                  { value: 120, label: '2 minutes' },
                  { value: 300, label: '5 minutes' },
                  { value: 600, label: '10 minutes' },
                ]}
                onChange={(v) => handleUpdate('screensaver', 'timeout', Number(v))}
              />
              <Toggle
                label={t('settings.posAdvanced.screensaver.showClock', 'Afficher l\'horloge')}
                checked={settings.screensaver.show_clock}
                onChange={(v) => handleUpdate('screensaver', 'show_clock', v)}
              />
            </>
          )}
        </div>

        {/* Offline Mode Settings */}
        <div className="settings-group">
          <h3 className="settings-group__title">
            <WifiOff size={18} />
            {t('settings.posAdvanced.offline.title', 'Mode Hors-ligne')}
          </h3>
          <Toggle
            label={t('settings.posAdvanced.offline.enabled', 'Mode hors-ligne activé')}
            description={t('settings.posAdvanced.offline.enabledDesc', 'Permettre les ventes sans connexion internet')}
            checked={settings.offline.enabled}
            onChange={(v) => handleUpdate('offline', 'enabled', v)}
          />
          {settings.offline.enabled && (
            <>
              <Toggle
                label={t('settings.posAdvanced.offline.autoSwitch', 'Basculement automatique')}
                description={t('settings.posAdvanced.offline.autoSwitchDesc', 'Passer automatiquement en mode hors-ligne si la connexion est perdue')}
                checked={settings.offline.auto_switch}
                onChange={(v) => handleUpdate('offline', 'auto_switch', v)}
              />
              <Select
                label={t('settings.posAdvanced.offline.syncInterval', 'Intervalle de sync (sec)')}
                value={settings.offline.sync_interval}
                options={[
                  { value: 15, label: '15 secondes' },
                  { value: 30, label: '30 secondes' },
                  { value: 60, label: '1 minute' },
                  { value: 120, label: '2 minutes' },
                ]}
                onChange={(v) => handleUpdate('offline', 'sync_interval', Number(v))}
              />
              <Select
                label={t('settings.posAdvanced.offline.maxOfflineOrders', 'Max commandes hors-ligne')}
                value={settings.offline.max_offline_orders}
                options={[
                  { value: 50, label: '50' },
                  { value: 100, label: '100' },
                  { value: 200, label: '200' },
                  { value: 500, label: '500' },
                ]}
                onChange={(v) => handleUpdate('offline', 'max_offline_orders', Number(v))}
              />
            </>
          )}
        </div>

        {/* Customer Display Settings */}
        <div className="settings-group">
          <h3 className="settings-group__title">
            <Monitor size={18} />
            {t('settings.posAdvanced.customerDisplay.title', 'Affichage Client')}
          </h3>
          <Toggle
            label={t('settings.posAdvanced.customerDisplay.enabled', 'Activer l\'affichage client')}
            description={t('settings.posAdvanced.customerDisplay.enabledDesc', 'Afficher les informations sur un second écran')}
            checked={settings.customer_display.enabled}
            onChange={(v) => handleUpdate('customer_display', 'enabled', v)}
          />
          {settings.customer_display.enabled && (
            <>
              <Toggle
                label={t('settings.posAdvanced.customerDisplay.showItems', 'Afficher les articles')}
                checked={settings.customer_display.show_items}
                onChange={(v) => handleUpdate('customer_display', 'show_items', v)}
              />
              <Toggle
                label={t('settings.posAdvanced.customerDisplay.showPromotions', 'Afficher les promotions')}
                checked={settings.customer_display.show_promotions}
                onChange={(v) => handleUpdate('customer_display', 'show_promotions', v)}
              />
              <Toggle
                label={t('settings.posAdvanced.customerDisplay.showLogo', 'Afficher le logo')}
                checked={settings.customer_display.show_logo}
                onChange={(v) => handleUpdate('customer_display', 'show_logo', v)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
