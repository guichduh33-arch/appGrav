import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/types/database'

/**
 * Fetch active user profiles for login screen / user selection.
 */
export function useActiveUsers() {
    return useQuery({
        queryKey: ['active-users'],
        queryFn: async (): Promise<UserProfile[]> => {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('id, name, display_name, role, is_active, avatar_url, employee_code')
                .eq('is_active', true)
                .order('name')

            if (error) throw error
            return (data ?? []) as UserProfile[]
        },
    })
}
