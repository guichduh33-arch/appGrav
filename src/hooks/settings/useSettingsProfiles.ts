import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { untypedFrom, untypedRpc } from '../../lib/supabase'
import { settingsKeys } from './settingsKeys'
import type { ISettingsProfile } from '../../types/database'

export function useSettingsProfiles() {
  return useQuery({
    queryKey: settingsKeys.profiles(),
    queryFn: async (): Promise<ISettingsProfile[]> => {
      const { data, error } = await untypedFrom('settings_profiles')
        .select('id, name, description, profile_type, settings_snapshot, terminal_settings_snapshot, is_active, is_system, created_by, created_at, updated_at')
        .order('name')
        .returns<ISettingsProfile[]>()

      if (error) throw error
      return data || []
    },
  })
}

export function useSettingsProfile(id: string) {
  return useQuery({
    queryKey: settingsKeys.profile(id),
    queryFn: async (): Promise<ISettingsProfile | null> => {
      const { data, error } = await untypedFrom('settings_profiles')
        .select('id, name, description, profile_type, settings_snapshot, terminal_settings_snapshot, is_active, is_system, created_by, created_at, updated_at')
        .eq('id', id)
        .returns<ISettingsProfile>()
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      return data
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
        .select('id, name, description, profile_type, settings_snapshot, terminal_settings_snapshot, is_active, is_system, created_by, created_at, updated_at')
        .returns<ISettingsProfile>()
        .single()

      if (error) throw error
      return data
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
      const { error } = await untypedRpc('apply_settings_profile', { p_profile_id: profileId })
      if (error) throw error
      return profileId
    },
    onSuccess: () => {
      // Invalidate all settings as they may have changed
      queryClient.invalidateQueries({ queryKey: settingsKeys.all })
    },
  })
}
