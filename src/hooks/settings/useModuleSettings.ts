import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { settingsKeys } from './settingsKeys'
import type { ModuleSettings } from '../../types/settings'
import type { Json } from '../../types/database.generated'

const defaultModuleSettings: ModuleSettings = {
  production: { enabled: true, auto_consume_stock: true },
  b2b: { enabled: true, min_order_amount: 100000, default_payment_terms: 7 },
  purchasing: { enabled: true, auto_reorder_threshold: 0 },
  loyalty: { enabled: false, points_per_idr: 1000, points_expiry_days: 365 },
  kds: { enabled: true, auto_acknowledge_delay: 0, sound_new_order: true },
}

export function useModuleSettings() {
  return useQuery({
    queryKey: settingsKeys.modules(),
    queryFn: async (): Promise<ModuleSettings> => {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .like('key', 'modules.%')

      if (error) throw error

      const result = { ...defaultModuleSettings }
      for (const row of data || []) {
        const parts = row.key.replace('modules.', '').split('.')
        if (parts.length === 2) {
          const [module, key] = parts
          if (module in result) {
            (result as Record<string, Record<string, unknown>>)[module][key] = row.value
          }
        }
      }
      return result
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateModuleSetting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      module,
      key,
      value,
    }: {
      module: keyof ModuleSettings
      key: string
      value: unknown
    }) => {
      const settingKey = `modules.${module}.${key}`
      const { error } = await supabase
        .from('settings')
        .update({ value: value as Json })
        .eq('key', settingKey)

      if (error) throw error
      return { module, key, value }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.modules() })
    },
  })
}

export function useIsModuleEnabled(moduleName: keyof ModuleSettings): boolean {
  const { data } = useModuleSettings()
  return data?.[moduleName]?.enabled ?? defaultModuleSettings[moduleName].enabled
}
