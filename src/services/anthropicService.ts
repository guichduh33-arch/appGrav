import { supabase } from '../lib/supabase'

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ClaudeProxyResponse {
  text: string
  model: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

/**
 * Appelle l'Edge Function claude-proxy pour communiquer avec Claude
 */
async function callClaudeProxy(
  messages: ClaudeMessage[],
  systemPrompt?: string,
  maxTokens?: number
): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession()
  const accessToken = sessionData?.session?.access_token

  if (!accessToken) {
    throw new Error('Authentification requise pour utiliser Claude')
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
        messages,
        system: systemPrompt,
        max_tokens: maxTokens,
      }),
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(errorData.error || `Erreur API: ${response.status}`)
  }

  const data: ClaudeProxyResponse = await response.json()
  return data.text
}

/**
 * Envoie un message à Claude et retourne la réponse
 */
export async function askClaude(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  return callClaudeProxy(
    [{ role: 'user', content: prompt }],
    systemPrompt,
    2000
  )
}

/**
 * Conversation multi-tours avec Claude
 */
export async function chatWithClaude(
  messages: ClaudeMessage[],
  systemPrompt?: string
): Promise<string> {
  return callClaudeProxy(messages, systemPrompt, 2000)
}
