import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface IRecipeIngredient {
  id: string
  product_id: string
  material_id: string
  quantity: number
  unit_id: string | null
  is_active: boolean
  material: {
    id: string
    name: string
    unit: string
    current_stock: number
  } | null
}

/**
 * Hook to fetch recipe ingredients for a product
 */
export function useProductRecipe(productId: string | null) {
  return useQuery({
    queryKey: ['recipe', productId],
    queryFn: async (): Promise<IRecipeIngredient[]> => {
      if (!productId) return []

      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          material:products!material_id(id, name, unit, current_stock)
        `)
        .eq('product_id', productId)
        .eq('is_active', true)

      if (error) {
        throw error
      }

      return (data || []) as unknown as IRecipeIngredient[]
    },
    enabled: !!productId
  })
}

/**
 * Check if all ingredients are available for production
 */
export function useRecipeAvailability(productId: string | null, quantity: number = 1) {
  const { data: recipe, isLoading } = useProductRecipe(productId)

  const availability = recipe?.map(ingredient => {
    const needed = ingredient.quantity * quantity
    const available = ingredient.material?.current_stock || 0
    const isAvailable = available >= needed

    return {
      ingredientId: ingredient.material_id,
      ingredientName: ingredient.material?.name || 'Unknown',
      needed,
      available,
      isAvailable,
      shortage: isAvailable ? 0 : needed - available
    }
  }) || []

  const allAvailable = availability.every(i => i.isAvailable)
  const missingIngredients = availability.filter(i => !i.isAvailable)

  return {
    isLoading,
    availability,
    allAvailable,
    missingIngredients,
    canProduce: allAvailable && availability.length > 0
  }
}
