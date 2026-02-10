/**
 * Hook for fetching audit logs (ARCH-005)
 * Extracted from AuditPage.tsx
 */

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { startOfDay, endOfDay, subDays } from 'date-fns'
import type { AuditLog } from '@/types/auth'

export interface IAuditLogWithUser extends AuditLog {
  user_profiles?: {
    name: string
    display_name?: string
    avatar_url?: string
  }
}

export interface IAuditLogFilters {
  page: number
  perPage: number
  filterAction: string
  filterTable: string
  filterUser: string
  dateRange: 'today' | '7days' | '30days' | 'custom'
  customStart: string
  customEnd: string
}

export function useAuditLogs(filters: IAuditLogFilters) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      let startDate: Date
      let endDate = endOfDay(new Date())

      switch (filters.dateRange) {
        case 'today':
          startDate = startOfDay(new Date())
          break
        case '7days':
          startDate = startOfDay(subDays(new Date(), 7))
          break
        case '30days':
          startDate = startOfDay(subDays(new Date(), 30))
          break
        case 'custom':
          startDate = filters.customStart ? startOfDay(new Date(filters.customStart)) : startOfDay(subDays(new Date(), 7))
          endDate = filters.customEnd ? endOfDay(new Date(filters.customEnd)) : endOfDay(new Date())
          break
        default:
          startDate = startOfDay(subDays(new Date(), 7))
      }

      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user_profiles!audit_logs_user_id_fkey(name, display_name, avatar_url)
        `, { count: 'exact' })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
        .range((filters.page - 1) * filters.perPage, filters.page * filters.perPage - 1)

      if (filters.filterAction) {
        query = query.eq('action', filters.filterAction)
      }
      if (filters.filterTable) {
        query = query.eq('table_name', filters.filterTable)
      }
      if (filters.filterUser) {
        query = query.eq('user_id', filters.filterUser)
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        logs: (data || []) as IAuditLogWithUser[],
        totalCount: count || 0,
      }
    },
    staleTime: 10_000,
  })
}

export function useAuditUsers() {
  return useQuery({
    queryKey: ['audit-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('id, name, display_name')
        .order('name')

      return (data || []).map(u => ({
        id: u.id,
        name: u.display_name || u.name,
      }))
    },
    staleTime: 60_000,
  })
}
