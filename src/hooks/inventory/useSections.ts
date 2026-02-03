import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ISection, TSectionType } from '@/types/database'

// Cache configuration
const SECTIONS_STALE_TIME = 5 * 60 * 1000 // 5 minutes - sections rarely change

// ============================================================================
// TYPES
// ============================================================================

export interface ISectionFilters {
  sectionType?: TSectionType
  isActive?: boolean
}

// ============================================================================
// useSections - Fetch sections with optional filtering
// ============================================================================

/**
 * Hook to fetch sections with optional filtering by type
 * Query key: ['sections', sectionType, isActive]
 */
export function useSections(filters?: ISectionFilters) {
  const { sectionType, isActive = true } = filters || {}

  return useQuery({
    queryKey: ['sections', sectionType, isActive],
    queryFn: async (): Promise<ISection[]> => {
      let query = supabase
        .from('sections')
        .select('*')
        .order('sort_order', { ascending: true })

      if (sectionType) {
        query = query.eq('section_type', sectionType)
      }

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return (data || []) as ISection[]
    },
    staleTime: SECTIONS_STALE_TIME,
  })
}

/**
 * Hook to fetch a single section by ID
 */
export function useSection(sectionId: string | null) {
  return useQuery({
    queryKey: ['section', sectionId],
    queryFn: async (): Promise<ISection | null> => {
      if (!sectionId) return null

      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('id', sectionId)
        .single()

      if (error) {
        throw error
      }

      return data as ISection
    },
    enabled: !!sectionId
  })
}

/**
 * Hook to get sections grouped by type
 */
export function useSectionsByType() {
  const { data: sections, ...rest } = useSections({ isActive: true })

  const groupedSections = sections?.reduce((acc, section) => {
    const type = section.section_type || 'other'
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(section)
    return acc
  }, {} as Record<string, ISection[]>)

  return {
    ...rest,
    data: sections,
    groupedSections: groupedSections || {},
    warehouses: groupedSections?.['warehouse'] || [],
    productionSections: groupedSections?.['production'] || [],
    salesSections: groupedSections?.['sales'] || [],
  }
}
