import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { settingsKeys } from './settingsKeys'
import type { ISettingsProfile } from '../../types/database'

// Helper for tables not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untypedFrom = (table: string) => supabase.from(table as any)

export function useSettingsProfiles() {
  return useQuery({
    queryKey: settingsKeys.profiles(),
    queryFn: async (): Promise<ISettingsProfile[]> => {
      const { data, error } = await untypedFrom('settings_profiles')
        .select('*')
        .order('name')

      if (error) throw error
      return (data || []) as unknown as ISettingsProfile[]
    },
  })
}

export function useSettingsProfile(id: string) {
  return useQuery({
    queryKey: settingsKeys.profile(id),
    queryFn: async (): Promise<ISettingsProfile | null> => {
      const { data, error } = await untypedFrom('settings_profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      return data as unknown as ISettingsProfile
    },
    enabled: !!id,
  })
}

export function useCreateSettingsProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (profile: Omit<ISettingsProfile, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await untypedFrom('settings_profiles')
        .insert(profile)
        .select()
        .single()

      if (error) throw error
      return data as unknown as ISettingsProfile
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profiles() })
    },
  })
}

export function useUpdateSettingsProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<ISettingsProfile>
    }) => {
      const { error } = await untypedFrom('settings_profiles')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      return { id, updates }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profiles() })
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile(data.id) })
    },
  })
}

export function useDeleteSettingsProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await untypedFrom('settings_profiles')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profiles() })
    },
  })
}

export function useApplySettingsProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (profileId: string) => {
      // Call the database function to apply profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.rpc as any)('apply_settings_profile', { p_profile_id: profileId })
      if (error) throw error
      return profileId
    },
    onSuccess: () => {
      // Invalidate all settings as they may have changed
      queryClient.invalidateQueries({ queryKey: settingsKeys.all })
    },
  })
}
