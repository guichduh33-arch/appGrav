import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useSettingsStore } from '../../stores/settingsStore'
import { settingsKeys } from './settingsKeys'
import type { SettingsCategory, Setting, SettingHistory } from '../../types/settings'

/**
 * Initialize settings - call once at app start
 */
export function useInitializeSettings() {
  const initialize = useSettingsStore((state) => state.initialize)
  const isInitialized = useSettingsStore((state) => state.isInitialized)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  return isInitialized
}

/**
 * Fetch settings categories
 */
export function useSettingsCategories() {
  return useQuery({
    queryKey: settingsKeys.categories(),
    queryFn: async (): Promise<SettingsCategory[]> => {
      const { data, error } = await supabase
        .from('settings_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch settings by category
 */
export function useSettingsByCategory(categoryCode: string) {
  return useQuery({
    queryKey: settingsKeys.settingsByCategory(categoryCode),
    queryFn: async (): Promise<Setting[]> => {
      const { data, error } = await supabase
        .from('settings')
        .select(`
          *,
          category:settings_categories!inner(code)
        `)
        .eq('settings_categories.code', categoryCode)
        .order('sort_order')

      if (error) throw error
      return data || []
    },
    enabled: !!categoryCode,
  })
}

/**
 * Fetch single setting by key
 */
export function useSetting(key: string) {
  const storeValue = useSettingsStore((state) => state.getSetting(key))

  return useQuery({
    queryKey: settingsKeys.setting(key),
    queryFn: async (): Promise<Setting | null> => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', key)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    initialData: storeValue ? { key, value: storeValue } as Setting : undefined,
    enabled: !!key,
  })
}

/**
 * Update a setting
 */
export function useUpdateSetting() {
  const queryClient = useQueryClient()
  const updateStoreSetting = useSettingsStore((state) => state.updateSetting)

  return useMutation({
    mutationFn: async ({
      key,
      value,
      reason,
    }: {
      key: string
      value: unknown
      reason?: string
    }) => {
      const success = await updateStoreSetting(key, value, reason)
      if (!success) throw new Error('Failed to update setting')
      return { key, value }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.setting(data.key) })
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings() })
    },
  })
}

/**
 * Reset a setting to default
 */
export function useResetSetting() {
  const queryClient = useQueryClient()
  const resetStoreSetting = useSettingsStore((state) => state.resetSetting)

  return useMutation({
    mutationFn: async (key: string) => {
      const success = await resetStoreSetting(key)
      if (!success) throw new Error('Failed to reset setting')
      return key
    },
    onSuccess: (key) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.setting(key) })
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings() })
    },
  })
}

/**
 * Fetch settings history
 */
export function useSettingsHistory(settingId?: string) {
  return useQuery({
    queryKey: settingsKeys.history(settingId),
    queryFn: async (): Promise<SettingHistory[]> => {
      let query = supabase
        .from('settings_history')
        .select(`
          *,
          setting:settings(key, name_fr, name_en, name_id),
          user:user_profiles(display_name, first_name, last_name)
        `)
        .order('changed_at', { ascending: false })
        .limit(100)

      if (settingId) {
        query = query.eq('setting_id', settingId)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    },
  })
}

/**
 * Get a typed setting value with default fallback
 */
export function useSettingValue<T>(key: string, defaultValue: T): T {
  const storeValue = useSettingsStore((state) => state.getSetting<T>(key))
  return storeValue ?? defaultValue
}

/**
 * Get appearance settings from store (instant, no loading)
 */
export function useAppearance() {
  return useSettingsStore((state) => state.appearance)
}

/**
 * Get localization settings from store (instant, no loading)
 */
export function useLocalization() {
  return useSettingsStore((state) => state.localization)
}

/**
 * Set appearance settings (immediate + async sync)
 */
export function useSetAppearance() {
  return useSettingsStore((state) => state.setAppearance)
}

/**
 * Set localization settings (immediate + async sync)
 */
export function useSetLocalization() {
  return useSettingsStore((state) => state.setLocalization)
}
