import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export interface ICustomerWithCategory {
    id: string
    name: string
    company_name: string | null
    phone: string | null
    email: string | null
    address: string | null
    customer_type: string
    category_id: string | null
    category?: {
        id: string
        name: string
        slug: string
        color: string
        price_modifier_type: string
        discount_percentage: number | null
    }
    loyalty_points: number
    lifetime_points: number
    loyalty_tier: string
    total_spent: number
    total_visits: number
    is_active: boolean
    membership_number: string | null
    loyalty_qr_code: string | null
    date_of_birth: string | null
    created_at: string
    last_visit_at: string | null
}

export function useCustomers() {
    return useQuery({
        queryKey: ['customers'],
        queryFn: async (): Promise<ICustomerWithCategory[]> => {
            const { data, error } = await supabase
                .from('customers')
                .select(`
                    *,
                    category:customer_categories(id, name, slug, color, price_modifier_type, discount_percentage)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            return (data ?? []) as unknown as ICustomerWithCategory[]
        },
    })
}

export function useCustomerById(id: string | undefined) {
    return useQuery({
        queryKey: ['customer', id],
        enabled: !!id,
        queryFn: async (): Promise<ICustomerWithCategory> => {
            const { data, error } = await supabase
                .from('customers')
                .select(`
                    *,
                    category:customer_categories(id, name, slug, color, price_modifier_type, discount_percentage)
                `)
                .eq('id', id!)
                .single()

            if (error) throw error
            return data as unknown as ICustomerWithCategory
        },
    })
}

export function useCustomerOrders(customerId: string | undefined) {
    return useQuery({
        queryKey: ['customer-orders', customerId],
        enabled: !!customerId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('id, order_number, total, status, created_at')
                .eq('customer_id', customerId!)
                .order('created_at', { ascending: false })
                .limit(20)

            if (error) throw error
            return (data ?? []).map(d => ({
                id: d.id,
                order_number: d.order_number ?? '',
                total_amount: d.total ?? 0,
                status: d.status ?? '',
                created_at: d.created_at ?? '',
            }))
        },
    })
}

export function useLoyaltyTransactions(customerId: string | undefined) {
    return useQuery({
        queryKey: ['loyalty-transactions', customerId],
        enabled: !!customerId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('loyalty_transactions')
                .select('*')
                .eq('customer_id', customerId!)
                .order('created_at', { ascending: false })
                .limit(50)

            if (error) throw error
            return data ?? []
        },
    })
}

export function useLoyaltyTiers() {
    return useQuery({
        queryKey: ['loyalty-tiers'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('loyalty_tiers')
                .select('*')
                .eq('is_active', true)
                .order('min_points')

            if (error) throw error
            return data ?? []
        },
    })
}

export function useAddLoyaltyPoints() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (params: { customerId: string; points: number; description: string }) => {
            const { error } = await supabase.rpc('add_loyalty_points' as never, {
                p_customer_id: params.customerId,
                p_points: params.points,
                p_description: params.description,
                p_order_id: null,
            } as never)
            if (error) throw error
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] })
            queryClient.invalidateQueries({ queryKey: ['loyalty-transactions', variables.customerId] })
            toast.success('Points added')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function useRedeemLoyaltyPoints() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (params: { customerId: string; points: number; description: string }) => {
            const { error } = await supabase.rpc('redeem_loyalty_points' as never, {
                p_customer_id: params.customerId,
                p_points: params.points,
                p_description: params.description,
            } as never)
            if (error) throw error
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] })
            queryClient.invalidateQueries({ queryKey: ['loyalty-transactions', variables.customerId] })
            toast.success('Points redeemed')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function useCreateCustomer() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (input: Record<string, unknown>) => {
            const { error } = await supabase
                .from('customers')
                .insert(input as never)
                .select()

            if (error) {
                if (error.code === '42501') throw new Error('Permission denied. Please check RLS policies.')
                if (error.code === '23503') throw new Error('Invalid category. Please select a valid category.')
                if (error.code === '23505') throw new Error('A customer with this phone number or email already exists.')
                throw new Error(error.message)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
            toast.success('Customer created successfully')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function useUpdateCustomer() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...input }: Record<string, unknown> & { id: string }) => {
            const { error } = await supabase
                .from('customers')
                .update(input)
                .eq('id', id)
                .select()

            if (error) throw new Error(error.message)
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
            queryClient.invalidateQueries({ queryKey: ['customer', variables.id] })
            toast.success('Customer updated successfully')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}

export function useDeleteCustomer() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('customers')
                .delete()
                .eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
            toast.success('Customer deleted')
        },
        onError: () => toast.error('Error deleting customer'),
    })
}
