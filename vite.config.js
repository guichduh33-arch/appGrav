import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
    return ({
        plugins: [
            react(),
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
                manifest: {
                    name: 'AppGrav - The Breakery POS',
                    short_name: 'AppGrav',
                    description: 'Point of Sale system for The Breakery bakery',
                    theme_color: '#3b82f6',
                    background_color: '#ffffff',
                    display: 'standalone',
                    orientation: 'portrait',
                    start_url: '/pos',
                    scope: '/',
                    icons: [
                        {
                            src: '/pwa-192x192.png',
                            sizes: '192x192',
                            type: 'image/png',
                        },
                        {
                            src: '/pwa-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                        },
                        {
                            src: '/pwa-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'maskable',
                        },
                    ],
                    shortcuts: [
                        {
                            name: 'Point of Sale',
                            short_name: 'POS',
                            description: 'Open the POS terminal',
                            url: '/pos',
                            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
                        },
                        {
                            name: 'Kitchen Display',
                            short_name: 'KDS',
                            description: 'Open Kitchen Display System',
                            url: '/kds',
                            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
                        },
                    ],
                },
                workbox: {
                    // Pre-cache static assets
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
                    // Cache Google Fonts
                    runtimeCaching: [
                        {
                            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'google-fonts-cache',
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                                },
                                cacheableResponse: {
                                    statuses: [0, 200],
                                },
                            },
                        },
                        {
                            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'gstatic-fonts-cache',
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                                },
                                cacheableResponse: {
                                    statuses: [0, 200],
                                },
                            },
                        },
                        // SECURITY: Never cache auth-related endpoints (QUAL-08)
                        {
                            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/(user_profiles|roles|permissions|role_permissions|user_roles|user_permissions|pin_auth_sessions).*/i,
                            handler: 'NetworkOnly',
                        },
                        // Cache Supabase API responses (stale-while-revalidate)
                        {
                            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'supabase-api-cache',
                                expiration: {
                                    maxEntries: 100,
                                    maxAgeSeconds: 60 * 60 * 24, // 1 day
                                },
                                networkTimeoutSeconds: 10,
                                cacheableResponse: {
                                    statuses: [0, 200],
                                },
                            },
                        },
                        // Cache images
                        {
                            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'images-cache',
                                expiration: {
                                    maxEntries: 100,
                                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                                },
                            },
                        },
                    ],
                    // Offline fallback
                    navigateFallback: '/offline.html',
                    navigateFallbackDenylist: [/^\/api\//],
                },
                devOptions: {
                    enabled: false, // Disable in development to avoid caching issues
                },
            }),
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port: 3000,
            host: true,
        },
        // Production build optimizations
        esbuild: {
            // Remove console.log, console.debug, console.info in production
            // Keep console.warn and console.error for critical issues
            drop: mode === 'production' ? ['console', 'debugger'] : [],
            pure: mode === 'production' ? ['console.log', 'console.debug', 'console.info'] : [],
        },
        build: {
            // Minify in production
            minify: mode === 'production' ? 'esbuild' : false,
            // Source maps only in development
            sourcemap: mode !== 'production',
        },
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: './src/setupTests.ts',
            css: true,
        },
    });
});
