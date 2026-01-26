// Edge Function: claude-proxy
// Securely proxies requests to Anthropic Claude API
// Keeps API key server-side, never exposed to browser

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getCorsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'

// Types
interface ClaudeMessage {
    role: 'user' | 'assistant'
    content: string
}

interface ClaudeRequest {
    messages: ClaudeMessage[]
    system?: string
    max_tokens?: number
    model?: string
}

interface AnthropicResponse {
    id: string
    type: string
    role: string
    content: Array<{
        type: string
        text?: string
    }>
    model: string
    stop_reason: string
    usage: {
        input_tokens: number
        output_tokens: number
    }
}

// Validate request structure
function validateRequest(body: unknown): body is ClaudeRequest {
    if (!body || typeof body !== 'object') return false
    const req = body as Record<string, unknown>

    if (!Array.isArray(req.messages) || req.messages.length === 0) return false

    for (const msg of req.messages) {
        if (!msg || typeof msg !== 'object') return false
        if (!['user', 'assistant'].includes((msg as ClaudeMessage).role)) return false
        if (typeof (msg as ClaudeMessage).content !== 'string') return false
    }

    return true
}

serve(async (req: Request) => {
    // Handle CORS preflight
    const corsResponse = handleCors(req)
    if (corsResponse) return corsResponse

    // Only allow POST
    if (req.method !== 'POST') {
        return errorResponse('Method not allowed', 405, req)
    }

    try {
        // Get API key from environment
        const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
        if (!apiKey) {
            console.error('ANTHROPIC_API_KEY not configured')
            return errorResponse('API configuration error', 500, req)
        }

        // Parse request body
        const body = await req.json()

        // Validate request
        if (!validateRequest(body)) {
            return errorResponse('Invalid request: messages array required', 400, req)
        }

        // Prepare Anthropic API request
        const anthropicRequest = {
            model: body.model || 'claude-3-haiku-20240307',
            max_tokens: Math.min(body.max_tokens || 1024, 4096), // Cap at 4096
            system: body.system,
            messages: body.messages.map((msg: ClaudeMessage) => ({
                role: msg.role,
                content: msg.content,
            })),
        }

        // Call Anthropic API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify(anthropicRequest),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Anthropic API error:', response.status, errorText)
            return errorResponse('AI service error', response.status, req)
        }

        const data: AnthropicResponse = await response.json()

        // Extract text response
        const textContent = data.content.find(c => c.type === 'text')
        if (!textContent?.text) {
            return errorResponse('No text response from AI', 500, req)
        }

        // Return simplified response
        return jsonResponse({
            text: textContent.text,
            model: data.model,
            usage: data.usage,
        }, 200, req)

    } catch (error) {
        console.error('Claude proxy error:', error)
        return errorResponse('Internal server error', 500, req)
    }
})
