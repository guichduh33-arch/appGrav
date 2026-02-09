import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { settingsKeys } from './settingsKeys'
import type { NotificationSettings } from '../../types/settings'
import type { Json } from '../../types/database.generated'

const defaultNotificationSettings: NotificationSettings = {
  email_enabled: true,
  smtp_host: '',
  smtp_port: 587,
  smtp_user: '',
  smtp_password: '',
  from_email: '',
  low_stock_alerts: true,
  daily_report: true,
  daily_report_time: '21:00',
  whatsapp_enabled: false,
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: settingsKeys.notifications(),
    queryFn: async (): Promise<NotificationSettings> => {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .like('key', 'notifications.%')

      if (error) throw error

      const result = { ...defaultNotificationSettings }
      for (const row of data || []) {
        const key = row.key.replace('notifications.', '') as keyof NotificationSettings
        if (key in result) {
          (result[key] as unknown) = row.value
        }
      }
      return result
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateNotificationSetting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      key,
      value,
    }: {
      key: keyof NotificationSettings
      value: unknown
    }) => {
      const settingKey = `notifications.${key}`
      const { error } = await supabase
        .from('settings')
        .update({ value: value as Json })
        .eq('key', settingKey)

      if (error) throw error
      return { key, value }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.notifications() })
    },
  })
}

export function useSendTestEmail() {
  return useMutation({
    mutationFn: async (recipientEmail: string) => {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { email: recipientEmail },
      })

      if (error) throw error
      return data
    },
  })
}
