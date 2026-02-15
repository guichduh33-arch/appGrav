import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export interface INotificationEvent {
    code: string
    name: string
    description: string | null
    category: string | null
    is_locked: boolean
    created_at: string
}

export interface INotificationPreference {
    id: string
    user_id: string
    event_code: string
    channel: 'in_app' | 'email' | 'push' | 'sms'
    is_enabled: boolean
    created_at: string
}

export function useNotificationEvents() {
    return useQuery({
        queryKey: ['notification-events'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('notification_events')
                .select('*')
                .order('category', { ascending: true })

            if (error) throw error
            return (data ?? []) as INotificationEvent[]
        },
    })
}

export function useNotificationPreferences() {
    const { user } = useAuthStore()

    return useQuery({
        queryKey: ['notification-preferences', user?.id],
        queryFn: async () => {
            if (!user?.id) return []

            const { data, error } = await supabase
                .from('notification_preferences')
                .select('*')
                .eq('user_id', user.id)

            if (error) throw error
            return (data ?? []) as INotificationPreference[]
        },
        enabled: !!user?.id,
    })
}

export function useToggleNotificationPreference() {
    const queryClient = useQueryClient()
    const { user } = useAuthStore()

    return useMutation({
        mutationFn: async ({
            eventCode,
            channel,
            enabled,
        }: {
            eventCode: string
            channel: INotificationPreference['channel']
            enabled: boolean
        }) => {
            if (!user?.id) throw new Error('Not authenticated')

            // Upsert the preference
            const { error } = await supabase
                .from('notification_preferences')
                .upsert(
                    {
                        user_id: user.id,
                        event_code: eventCode,
                        channel,
                        is_enabled: enabled,
                    },
                    { onConflict: 'user_id,event_code,channel' }
                )

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
        },
    })
}
