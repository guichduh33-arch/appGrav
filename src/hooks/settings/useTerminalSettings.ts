import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { settingsKeys } from './settingsKeys'
import type { TerminalSettings } from '../../types/settings'
import type { ITerminalSetting } from '../../types/database'

// Helper for tables not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untypedFrom = (table: string) => supabase.from(table as any)

export function useTerminalSettings(terminalId: string) {
  return useQuery({
    queryKey: settingsKeys.terminalSettings(terminalId),
    queryFn: async (): Promise<TerminalSettings | null> => {
      // Get the terminal with its settings (columns added by migration)
      const { data: terminal, error: terminalError } = await untypedFrom('pos_terminals')
        .select('mode, default_printer_id, kitchen_printer_id, kds_station, allowed_payment_methods, default_order_type, floor_plan_id, auto_logout_timeout')
        .eq('id', terminalId)
        .single()

      if (terminalError) {
        if (terminalError.code === 'PGRST116') return null
        throw terminalError
      }

      return terminal as unknown as TerminalSettings
    },
    enabled: !!terminalId,
  })
}

export function useUpdateTerminalSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      terminalId,
      updates,
    }: {
      terminalId: string
      updates: Partial<TerminalSettings>
    }) => {
      const { error } = await untypedFrom('pos_terminals')
        .update(updates)
        .eq('id', terminalId)

      if (error) throw error
      return { terminalId, updates }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.terminalSettings(data.terminalId) })
    },
  })
}

// Terminal-specific key-value overrides
export function useTerminalSettingOverrides(terminalId: string) {
  return useQuery({
    queryKey: [...settingsKeys.terminalSettings(terminalId), 'overrides'] as const,
    queryFn: async (): Promise<ITerminalSetting[]> => {
      const { data, error } = await untypedFrom('terminal_settings')
        .select('*')
        .eq('terminal_id', terminalId)

      if (error) throw error
      return (data || []) as unknown as ITerminalSetting[]
    },
    enabled: !!terminalId,
  })
}

export function useSetTerminalSettingOverride() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      terminalId,
      key,
      value,
    }: {
      terminalId: string
      key: string
      value: unknown
    }) => {
      const { error } = await untypedFrom('terminal_settings')
        .upsert({ terminal_id: terminalId, key, value }, { onConflict: 'terminal_id,key' })

      if (error) throw error
      return { terminalId, key, value }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.terminalSettings(data.terminalId) })
    },
  })
}
