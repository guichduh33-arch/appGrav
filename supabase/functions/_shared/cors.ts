// Edge Functions - CORS Headers
// Shared utility for handling CORS in Supabase Edge Functions

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Helper to handle OPTIONS preflight requests
export function handleCors(req: Request): Response | null {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }
    return null;
}

// Helper to create JSON response with CORS
export function jsonResponse(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
        },
    });
}

// Helper to create error response
export function errorResponse(message: string, status = 400): Response {
    return jsonResponse({ error: message }, status);
}
