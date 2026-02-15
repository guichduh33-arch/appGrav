import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export interface IVatFiling {
    id: string
    fiscal_period_id: string | null
    filing_year: number
    filing_month: number
    vat_collected: number
    vat_deductible: number
    vat_payable: number
    status: string
    filed_at: string | null
    filed_by: string | null
    reference_number: string | null
    notes: string | null
    created_at: string
    updated_at: string
}

export function useVatFilings(year: number, month?: number) {
    return useQuery({
        queryKey: ['vat-filings', year, month],
        queryFn: async () => {
            let query = supabase
                .from('vat_filings')
                .select('*')
                .eq('filing_year', year)
                .order('filing_month', { ascending: true })

            if (month) {
                query = query.eq('filing_month', month)
            }

            const { data, error } = await query
            if (error) throw error
            return (data ?? []) as IVatFiling[]
        },
    })
}

export function useCreateVatFiling() {
    const queryClient = useQueryClient()
    const { user } = useAuthStore()

    return useMutation({
        mutationFn: async (params: {
            year: number
            month: number
            vatCollected: number
            vatDeductible: number
            vatPayable: number
            fiscalPeriodId?: string
        }) => {
            const { data, error } = await supabase
                .from('vat_filings')
                .insert({
                    filing_year: params.year,
                    filing_month: params.month,
                    vat_collected: params.vatCollected,
                    vat_deductible: params.vatDeductible,
                    vat_payable: params.vatPayable,
                    fiscal_period_id: params.fiscalPeriodId ?? null,
                    status: 'draft',
                    filed_by: user?.id ?? null,
                })
                .select()
                .single()

            if (error) throw error
            return data as IVatFiling
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vat-filings'] })
        },
    })
}

export function useMarkVatFiled() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (params: { filingId: string; referenceNumber: string }) => {
            const { error } = await supabase
                .from('vat_filings')
                .update({
                    status: 'filed',
                    filed_at: new Date().toISOString(),
                    reference_number: params.referenceNumber,
                })
                .eq('id', params.filingId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vat-filings'] })
        },
    })
}
