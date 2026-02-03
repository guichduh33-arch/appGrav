import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Cache configuration
const SUPPLIERS_STALE_TIME = 5 * 60 * 1000 // 5 minutes - suppliers don't change often

// ============================================================================
// TYPES
// ============================================================================

export interface ISupplier {
  id: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ISupplierFilters {
  isActive?: boolean
  searchTerm?: string
}

// ============================================================================
// useSuppliers - Fetch suppliers list
// ============================================================================

/**
 * Hook to fetch active suppliers for dropdowns
 * Query key: ['suppliers', filters]
 */
export function useSuppliers(filters?: ISupplierFilters) {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: async (): Promise<ISupplier[]> => {
      let query = supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true })

      // Default to active suppliers only unless explicitly specified
      const showActive = filters?.isActive !== false
      if (showActive) {
        query = query.neq('is_active', false)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      // Apply search filter in JS if provided (Supabase ilike can be slow)
      let results = (data || []) as ISupplier[]

      if (filters?.searchTerm) {
        const search = filters.searchTerm.toLowerCase()
        results = results.filter(supplier =>
          supplier.name.toLowerCase().includes(search) ||
          supplier.contact_name?.toLowerCase().includes(search) ||
          supplier.email?.toLowerCase().includes(search)
        )
      }

      return results
    },
    staleTime: SUPPLIERS_STALE_TIME,
  })
}

// ============================================================================
// useSupplier - Fetch single supplier
// ============================================================================

/**
 * Hook to fetch a single supplier by ID
 */
export function useSupplier(supplierId: string | null) {
  return useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: async () => {
      if (!supplierId) return null

      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', supplierId)
        .single()

      if (error) throw error
      return data as ISupplier
    },
    enabled: !!supplierId
  })
}
