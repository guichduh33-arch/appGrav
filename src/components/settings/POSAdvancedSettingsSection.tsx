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
} from '../../hooks/settings';
import type { POSAdvancedSettings, RoundingMethod, SoundType } from '../../types/settings';
import { SettingsToggle } from './pos-advanced/SettingsToggle';
import { SettingsSelect } from './pos-advanced/SettingsSelect';

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
      <div className="space-y-6">
        <h2 className="text-lg font-display font-bold text-white">
          Advanced POS Settings
        </h2>
        <div className="flex items-center justify-center py-12 text-[var(--theme-text-muted)]">
          <RefreshCw size={24} className="animate-spin mr-3" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-bold text-white">
          Advanced POS Settings
        </h2>
        <p className="text-sm text-[var(--theme-text-muted)] mt-1">
          Advanced point of sale configuration
        </p>
      </div>

      {/* Cart Settings */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <ShoppingCart size={16} className="text-[var(--color-gold)]" />
          Cart
        </h3>
        <div className="space-y-1 divide-y divide-white/5">
          <SettingsToggle
            label="Lock after kitchen send"
            description="Items sent to kitchen cannot be modified without PIN"
            checked={settings.cart.lock_on_kitchen_send}
            onChange={(v) => handleUpdate('cart', 'lock_on_kitchen_send', v)}
          />
          <SettingsToggle
            label="PIN required for removal"
            description="Require PIN to remove a locked item"
            checked={settings.cart.require_pin_locked_remove}
            onChange={(v) => handleUpdate('cart', 'require_pin_locked_remove', v)}
          />
        </div>
      </div>

      {/* Rounding Settings */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <DollarSign size={16} className="text-[var(--color-gold)]" />
          IDR Rounding
        </h3>
        <div className="space-y-1">
          <SettingsSelect
            label="Round to"
            value={settings.rounding.amount}
            options={[
              { value: 100, label: 'Rp 100' },
              { value: 500, label: 'Rp 500' },
              { value: 1000, label: 'Rp 1.000' },
            ]}
            onChange={(v) => handleUpdate('rounding', 'amount', Number(v))}
          />
          <SettingsSelect
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
      </div>

      {/* Payment Settings */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <CreditCard size={16} className="text-[var(--color-gold)]" />
          Payment
        </h3>
        <div className="space-y-1">
          <SettingsToggle
            label="Split payment"
            description="Allow dividing payment into multiple parts"
            checked={settings.payment.allow_split}
            onChange={(v) => handleUpdate('payment', 'allow_split', v)}
          />
          {settings.payment.allow_split && (
            <SettingsSelect
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
      </div>

      {/* Sound Settings */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Volume2 size={16} className="text-[var(--color-gold)]" />
          Sounds
        </h3>
        <div className="space-y-1">
          <SettingsToggle
            label="Sounds enabled"
            description="Enable sound notifications"
            checked={settings.sound.enabled}
            onChange={(v) => handleUpdate('sound', 'enabled', v)}
          />
          {settings.sound.enabled && (
            <>
              <SettingsSelect
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
              <SettingsSelect
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
      </div>

      {/* Screensaver Settings */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Lock size={16} className="text-[var(--color-gold)]" />
          Screensaver
        </h3>
        <div className="space-y-1">
          <SettingsToggle
            label="Enable screensaver"
            description="Show screensaver after inactivity"
            checked={settings.screensaver.enabled}
            onChange={(v) => handleUpdate('screensaver', 'enabled', v)}
          />
          {settings.screensaver.enabled && (
            <>
              <SettingsSelect
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
              <SettingsToggle
                label="Show clock"
                checked={settings.screensaver.show_clock}
                onChange={(v) => handleUpdate('screensaver', 'show_clock', v)}
              />
            </>
          )}
        </div>
      </div>

      {/* Offline Mode Settings */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <WifiOff size={16} className="text-[var(--color-gold)]" />
          Offline Mode
        </h3>
        <div className="space-y-1">
          <SettingsToggle
            label="Offline mode enabled"
            description="Allow sales without internet connection"
            checked={settings.offline.enabled}
            onChange={(v) => handleUpdate('offline', 'enabled', v)}
          />
          {settings.offline.enabled && (
            <>
              <SettingsToggle
                label="Auto switch"
                description="Automatically switch to offline mode when connection is lost"
                checked={settings.offline.auto_switch}
                onChange={(v) => handleUpdate('offline', 'auto_switch', v)}
              />
              <SettingsSelect
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
              <SettingsSelect
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
      </div>

      {/* Customer Display Settings */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Monitor size={16} className="text-[var(--color-gold)]" />
          Customer Display
        </h3>
        <div className="space-y-1">
          <SettingsToggle
            label="Enable customer display"
            description="Show information on a second screen"
            checked={settings.customer_display.enabled}
            onChange={(v) => handleUpdate('customer_display', 'enabled', v)}
          />
          {settings.customer_display.enabled && (
            <>
              <SettingsToggle
                label="Show items"
                checked={settings.customer_display.show_items}
                onChange={(v) => handleUpdate('customer_display', 'show_items', v)}
              />
              <SettingsToggle
                label="Show promotions"
                checked={settings.customer_display.show_promotions}
                onChange={(v) => handleUpdate('customer_display', 'show_promotions', v)}
              />
              <SettingsToggle
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
