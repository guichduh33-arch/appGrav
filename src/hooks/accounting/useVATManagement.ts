/**
 * useVATManagement Hook (Epic 9 - Story 9.9)
 * VAT collected/deductible/payable
 */

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { IVATSummary } from '@/types/accounting'

interface IVATParams {
  year: number
  month: number
}

export function useVATManagement({ year, month }: IVATParams) {
  return useQuery({
    queryKey: ['accounting', 'vat', year, month],
    queryFn: async (): Promise<IVATSummary> => {
      const { data, error } = await supabase.rpc('calculate_vat_payable', {
        p_year: year,
        p_month: month,
      })
      if (error) throw error

      const row = Array.isArray(data) ? data[0] : data
      return {
        collected: Number(row?.collected) || 0,
        deductible: Number(row?.deductible) || 0,
        payable: Number(row?.payable) || 0,
      }
    },
  })
}
