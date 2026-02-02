import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { StockLocation, TLocationType } from '@/types/database'

// Cache configuration
const LOCATIONS_STALE_TIME = 5 * 60 * 1000 // 5 minutes - locations rarely change

// ============================================================================
// TYPES
// ============================================================================

export interface ILocationFilters {
  locationType?: TLocationType
  isActive?: boolean
}

// ============================================================================
// useLocations - Fetch stock locations with optional filtering
// ============================================================================

/**
 * Hook to fetch stock locations with optional filtering by type
 * Query key: ['stock-locations', locationType]
 */
export function useLocations(filters?: ILocationFilters) {
  const { locationType, isActive = true } = filters || {}

  return useQuery({
    queryKey: ['stock-locations', locationType, isActive],
    queryFn: async (): Promise<StockLocation[]> => {
      let query = supabase
        .from('stock_locations')
        .select('*')
        .order('name', { ascending: true })

      if (locationType) {
        query = query.eq('location_type', locationType)
      }

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return (data || []) as StockLocation[]
    },
    staleTime: LOCATIONS_STALE_TIME,
  })
}

/**
 * Hook to fetch a single location by ID
 */
export function useLocation(locationId: string | null) {
  return useQuery({
    queryKey: ['stock-location', locationId],
    queryFn: async (): Promise<StockLocation | null> => {
      if (!locationId) return null

      const { data, error } = await supabase
        .from('stock_locations')
        .select('*')
        .eq('id', locationId)
        .single()

      if (error) {
        throw error
      }

      return data as StockLocation
    },
    enabled: !!locationId
  })
}

/**
 * Hook to get locations grouped by type
 */
export function useLocationsByType() {
  const { data: locations, ...rest } = useLocations({ isActive: true })

  const groupedLocations = locations?.reduce((acc, location) => {
    const type = location.location_type || 'other'
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(location)
    return acc
  }, {} as Record<string, StockLocation[]>)

  return {
    ...rest,
    data: locations,
    groupedLocations: groupedLocations || {},
    warehouses: groupedLocations?.['main_warehouse'] || [],
    sections: groupedLocations?.['section'] || [],
    kitchens: groupedLocations?.['kitchen'] || [],
    storageAreas: groupedLocations?.['storage'] || [],
  }
}
