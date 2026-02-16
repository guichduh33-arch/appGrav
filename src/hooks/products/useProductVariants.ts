import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface IVariantMaterial {
  material_id: string
  quantity: number
}

export interface IVariantOption {
  option_id: string
  option_label: string
  price_adjustment: number
  is_default: boolean
  materials: IVariantMaterial[]
}

export interface IVariantGroup {
  group_name: string
  group_type: 'single' | 'multiple'
  group_required: boolean
  options: IVariantOption[]
}

/**
 * Hook pour charger les variants d'un produit depuis product_modifiers
 */
export function useProductVariants(productId: string | null) {
  return useQuery({
    queryKey: ['product-variants', productId],
    queryFn: async (): Promise<IVariantGroup[]> => {
      if (!productId) return []

      const { data, error } = await supabase
        .from('product_modifiers')
        .select('group_name, group_type, group_required, materials, option_id, option_label, price_adjustment, is_default')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('group_name')
        .order('option_label')

      if (error) {
        throw error
      }

      // Grouper les options par groupe
      const groupsMap = new Map<string, IVariantGroup>()

      data?.forEach((modifier) => {
        if (!groupsMap.has(modifier.group_name)) {
          groupsMap.set(modifier.group_name, {
            group_name: modifier.group_name,
            group_type: modifier.group_type as 'single' | 'multiple',
            group_required: modifier.group_required || false,
            options: []
          })
        }

        const group = groupsMap.get(modifier.group_name)!

        // Parse materials from JSONB field
        let materials: IVariantMaterial[] = []
        if (modifier.materials && Array.isArray(modifier.materials)) {
          materials = modifier.materials.map((m: any) => ({
            material_id: m.material_id,
            quantity: m.quantity || 0
          }))
        }

        group.options.push({
          option_id: modifier.option_id,
          option_label: modifier.option_label,
          price_adjustment: modifier.price_adjustment || 0,
          is_default: modifier.is_default || false,
          materials
        })
      })

      return Array.from(groupsMap.values())
    },
    enabled: !!productId
  })
}
