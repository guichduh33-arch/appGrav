import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { settingsKeys } from './settingsKeys'
import type { ISoundAsset } from '../../types/database'

// Helper for tables not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untypedFrom = (table: string) => supabase.from(table as any)

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
