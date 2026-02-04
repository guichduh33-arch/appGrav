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
            Advanced POS Settings
          </h2>
        </div>
        <div className="settings-section__body" style={{ textAlign: 'center', padding: '2rem' }}>
          <RefreshCw size={24} className="spinning" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <h2 className="settings-section__title">
          Advanced POS Settings
        </h2>
        <p className="settings-section__description">
          Advanced point of sale configuration
        </p>
      </div>
      <div className="settings-section__body">
        {/* Cart Settings */}
        <div className="settings-group">
          <h3 className="settings-group__title">
            <ShoppingCart size={18} />
            Cart
          </h3>
          <Toggle
            label="Lock after kitchen send"
            description="Items sent to kitchen cannot be modified without PIN"
            checked={settings.cart.lock_on_kitchen_send}
            onChange={(v) => handleUpdate('cart', 'lock_on_kitchen_send', v)}
          />
          <Toggle
            label="PIN required for removal"
            description="Require PIN to remove a locked item"
            checked={settings.cart.require_pin_locked_remove}
            onChange={(v) => handleUpdate('cart', 'require_pin_locked_remove', v)}
          />
        </div>

        {/* Rounding Settings */}
        <div className="settings-group">
          <h3 className="settings-group__title">
            <DollarSign size={18} />
            IDR Rounding
          </h3>
          <Select
            label="Round to"
            value={settings.rounding.amount}
            options={[
              { value: 100, label: 'Rp 100' },
              { value: 500, label: 'Rp 500' },
              { value: 1000, label: 'Rp 1.000' },
            ]}
            onChange={(v) => handleUpdate('rounding', 'amount', Number(v))}
          />
          <Select
            label="Method"
            value={settings.rounding.method}
            options={[
              { value: 'round' as RoundingMethod, label: 'Standard rounding' },
              { value: 'floor' as RoundingMethod, label: 'Round down' },
              { value: 'ceil' as RoundingMethod, label: 'Round up' },
            ]}
            onChange={(v) => handleUpdate('rounding', 'method', v)}
          />
        </div>

        {/* Payment Settings */}
        <div className="settings-group">
          <h3 className="settings-group__title">
            <CreditCard size={18} />
            Payment
          </h3>
          <Toggle
            label="Split payment"
            description="Allow dividing payment into multiple parts"
            checked={settings.payment.allow_split}
            onChange={(v) => handleUpdate('payment', 'allow_split', v)}
          />
          {settings.payment.allow_split && (
            <Select
              label="Max split count"
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
            Sounds
          </h3>
          <Toggle
            label="Sounds enabled"
            description="Enable sound notifications"
            checked={settings.sound.enabled}
            onChange={(v) => handleUpdate('sound', 'enabled', v)}
          />
          {settings.sound.enabled && (
            <>
              <Select
                label="New order"
                value={settings.sound.new_order}
                options={[
                  { value: 'none' as SoundType, label: 'None' },
                  { value: 'chime' as SoundType, label: 'Chime' },
                  { value: 'bell' as SoundType, label: 'Bell' },
                  { value: 'beep' as SoundType, label: 'Beep' },
                ]}
                onChange={(v) => handleUpdate('sound', 'new_order', v)}
              />
              <Select
                label="Payment success"
                value={settings.sound.payment_success}
                options={[
                  { value: 'none' as SoundType, label: 'None' },
                  { value: 'cash' as SoundType, label: 'Cash register' },
                  { value: 'success' as SoundType, label: 'Success' },
                  { value: 'chime' as SoundType, label: 'Chime' },
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
            Screensaver
          </h3>
          <Toggle
            label="Enable screensaver"
            description="Show screensaver after inactivity"
            checked={settings.screensaver.enabled}
            onChange={(v) => handleUpdate('screensaver', 'enabled', v)}
          />
          {settings.screensaver.enabled && (
            <>
              <Select
                label="Timeout (seconds)"
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
                label="Show clock"
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
            Offline Mode
          </h3>
          <Toggle
            label="Offline mode enabled"
            description="Allow sales without internet connection"
            checked={settings.offline.enabled}
            onChange={(v) => handleUpdate('offline', 'enabled', v)}
          />
          {settings.offline.enabled && (
            <>
              <Toggle
                label="Auto switch"
                description="Automatically switch to offline mode when connection is lost"
                checked={settings.offline.auto_switch}
                onChange={(v) => handleUpdate('offline', 'auto_switch', v)}
              />
              <Select
                label="Sync interval (sec)"
                value={settings.offline.sync_interval}
                options={[
                  { value: 15, label: '15 seconds' },
                  { value: 30, label: '30 seconds' },
                  { value: 60, label: '1 minute' },
                  { value: 120, label: '2 minutes' },
                ]}
                onChange={(v) => handleUpdate('offline', 'sync_interval', Number(v))}
              />
              <Select
                label="Max offline orders"
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
            Customer Display
          </h3>
          <Toggle
            label="Enable customer display"
            description="Show information on a second screen"
            checked={settings.customer_display.enabled}
            onChange={(v) => handleUpdate('customer_display', 'enabled', v)}
          />
          {settings.customer_display.enabled && (
            <>
              <Toggle
                label="Show items"
                checked={settings.customer_display.show_items}
                onChange={(v) => handleUpdate('customer_display', 'show_items', v)}
              />
              <Toggle
                label="Show promotions"
                checked={settings.customer_display.show_promotions}
                onChange={(v) => handleUpdate('customer_display', 'show_promotions', v)}
              />
              <Toggle
                label="Show logo"
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
