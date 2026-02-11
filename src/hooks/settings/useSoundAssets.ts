import { useQuery } from '@tanstack/react-query'
import { untypedFrom } from '../../lib/supabase'
import { settingsKeys } from './settingsKeys'
import type { ISoundAsset } from '../../types/database'

export function useSoundAssets() {
  return useQuery({
    queryKey: settingsKeys.soundAssets(),
    queryFn: async (): Promise<ISoundAsset[]> => {
      const { data, error } = await untypedFrom('sound_assets')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      return (data || []) as unknown as ISoundAsset[]
    },
  })
}

export function useSoundAssetsByCategory(category: ISoundAsset['category']) {
  const { data: allSounds } = useSoundAssets()
  return allSounds?.filter((s) => s.category === category) || []
}
