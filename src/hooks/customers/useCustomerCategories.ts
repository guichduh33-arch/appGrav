import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export interface ICustomerCategory {
    id: string
    name: string
    slug: string
    description: string | null
    color: string
    price_modifier_type: 'retail' | 'wholesale' | 'discount_percentage' | 'custom'
    discount_percentage: number | null
    is_active: boolean
    created_at: string
}

type TCustomerCategoryInput = Omit<ICustomerCategory, 'id' | 'created_at'>

export function useCustomerCategories(activeOnly = false) {
    return useQuery({
        queryKey: ['customer-categories', { activeOnly }],
        queryFn: async (): Promise<ICustomerCategory[]> => {
            let query = supabase
                .from('customer_categories')
                .select('*')
                .order('name')

            if (activeOnly) {
                query = query.eq('is_active', true)
            }

            const { data, error } = await query
            if (error) throw error
            return (data ?? []) as unknown as ICustomerCategory[]
        },
    })
}

export function useCreateCustomerCategory() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (input: TCustomerCategoryInput) => {
            const { error } = await supabase
                .from('customer_categories')
                .insert(input as never)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer-categories'] })
            toast.success('Category created')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function useUpdateCustomerCategory() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...input }: TCustomerCategoryInput & { id: string }) => {
            const { error } = await supabase
                .from('customer_categories')
                .update(input as never)
                .eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer-categories'] })
            toast.success('Category updated')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function useDeleteCustomerCategory() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('customer_categories')
                .delete()
                .eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer-categories'] })
            toast.success('Category deleted')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}
