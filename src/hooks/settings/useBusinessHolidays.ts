import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface IBusinessHoliday {
    id: string
    name: string
    date: string
    is_recurring: boolean
    is_closed: boolean
    modified_hours: Record<string, unknown> | null
    notes: string | null
    created_at: string
    updated_at: string
}

export function useBusinessHolidays(year?: number) {
    return useQuery({
        queryKey: ['business-holidays', year],
        queryFn: async () => {
            let query = supabase
                .from('business_holidays')
                .select('id, name, date, is_recurring, is_closed, modified_hours, notes, created_at, updated_at')
                .order('date', { ascending: true })

            if (year) {
                query = query
                    .gte('date', `${year}-01-01`)
                    .lte('date', `${year}-12-31`)
            }

            const { data, error } = await query
            if (error) throw error
            return (data ?? []) as IBusinessHoliday[]
        },
    })
}

export function useCreateHoliday() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (holiday: {
            name: string
            date: string
            is_recurring?: boolean
            is_closed?: boolean
            notes?: string
        }) => {
            const { data, error } = await supabase
                .from('business_holidays')
                .insert({
                    name: holiday.name,
                    date: holiday.date,
                    is_recurring: holiday.is_recurring ?? false,
                    is_closed: holiday.is_closed ?? true,
                    notes: holiday.notes ?? null,
                })
                .select('id, name, date, is_recurring, is_closed, modified_hours, notes, created_at, updated_at')
                .single()

            if (error) throw error
            return data as IBusinessHoliday
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['business-holidays'] })
        },
    })
}

export function useDeleteHoliday() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('business_holidays')
                .delete()
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['business-holidays'] })
        },
    })
}
