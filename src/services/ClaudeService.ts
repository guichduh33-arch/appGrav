import { supabase } from '../lib/supabase'

interface ClaudeProxyResponse {
    text: string
    model: string
    usage: {
        input_tokens: number
        output_tokens: number
    }
}

export const claudeService = {
    /**
     * Sends a message to Claude via secure Edge Function proxy.
     * @param content The user message to send.
     * @param system Optional system prompt.
     * @returns The text response from Claude.
     */
    async sendMessage(content: string, system?: string): Promise<string> {
        const { data: sessionData } = await supabase.auth.getSession()
        const accessToken = sessionData?.session?.access_token

        if (!accessToken) {
            throw new Error('Authentication required to use Claude')
        }

        const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claude-proxy`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content }],
                    system,
                    max_tokens: 1024,
                }),
            }
        )

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
            throw new Error(errorData.error || `API Error: ${response.status}`)
        }

        const data: ClaudeProxyResponse = await response.json()
        return data.text
    },
}
