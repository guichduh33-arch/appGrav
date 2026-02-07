// Edge Functions - CORS Headers
// Shared utility for handling CORS in Supabase Edge Functions

// Allowed origins - configure via environment variables in production
const ALLOWED_ORIGINS = [
    'https://thebreakery.app',
    'https://admin.thebreakery.app',
    'https://pos.thebreakery.app',
    // Development origins
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    // LAN development
    'http://172.30.208.1:3000',
];

// Get CORS origin based on request
export function getCorsOrigin(requestOrigin: string | null): string {
    if (!requestOrigin) return '';
    // Check if origin is in allowed list
    if (ALLOWED_ORIGINS.includes(requestOrigin)) {
        return requestOrigin;
    }
    // Allow any localhost for development
    if (requestOrigin.startsWith('http://localhost:') || requestOrigin.startsWith('http://127.0.0.1:')) {
        return requestOrigin;
    }
    return '';
}

// Security headers
export const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Will be overridden by getCorsHeaders
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
};

// Get headers with correct origin
export function getCorsHeaders(req: Request): Record<string, string> {
    const origin = req.headers.get('Origin');
    const allowedOrigin = getCorsOrigin(origin);
    return {
        ...corsHeaders,
        ...securityHeaders,
        'Access-Control-Allow-Origin': allowedOrigin || '',
    };
}

// Helper to handle OPTIONS preflight requests
export function handleCors(req: Request): Response | null {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: getCorsHeaders(req) });
    }
    return null;
}

// Helper to create JSON response with CORS
export function jsonResponse(data: unknown, status = 200, req?: Request): Response {
    const headers = req ? getCorsHeaders(req) : corsHeaders;
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            ...headers,
            'Content-Type': 'application/json',
        },
    });
}

// Helper to create error response
export function errorResponse(message: string, status = 400, req?: Request): Response {
    return jsonResponse({ error: message }, status, req);
}
