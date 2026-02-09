import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { settingsKeys } from './settingsKeys'
import type { POSAdvancedSettings } from '../../types/settings'
import type { Json } from '../../types/database.generated'

const defaultPOSAdvanced: POSAdvancedSettings = {
  cart: { lock_on_kitchen_send: true, require_pin_locked_remove: true },
  rounding: { amount: 100, method: 'round' },
  payment: { allow_split: true, max_split_count: 4 },
  sound: { enabled: true, new_order: 'chime', payment_success: 'cash', error: 'error' },
  screensaver: { enabled: false, timeout: 300, show_clock: true },
  offline: { enabled: true, auto_switch: true, sync_interval: 30, max_offline_orders: 100 },
  customer_display: { enabled: false, show_items: true, show_promotions: true, show_logo: true },
}

export function usePOSAdvancedSettings() {
  return useQuery({
    queryKey: settingsKeys.posAdvanced(),
    queryFn: async (): Promise<POSAdvancedSettings> => {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .like('key', 'pos_advanced.%')

      if (error) throw error

      // Build the nested object from flat key-value pairs
      const result = { ...defaultPOSAdvanced }
      for (const row of data || []) {
        const parts = row.key.replace('pos_advanced.', '').split('.')
        if (parts.length === 2) {
          const [group, key] = parts
          if (group in result) {
            (result as Record<string, Record<string, unknown>>)[group][key] = row.value
          }
        }
      }
      return result
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdatePOSAdvancedSetting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      group,
      key,
      value,
    }: {
      group: keyof POSAdvancedSettings
      key: string
      value: unknown
    }) => {
      const settingKey = `pos_advanced.${group}.${key}`
      const { error } = await supabase
        .from('settings')
        .update({ value: value as Json })
        .eq('key', settingKey)

      if (error) throw error
      return { group, key, value }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.posAdvanced() })
    },
  })
}
