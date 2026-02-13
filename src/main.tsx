import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import App from './App'
import './styles/index.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
                <Toaster
                    position="top-right"
                    richColors
                    duration={3000}
                    toastOptions={{
                        style: {
                            background: '#FFFBF5',
                            color: '#2D2A24',
                            borderRadius: '12px',
                            border: '1px solid #E8E0D4',
                            boxShadow: '0 4px 24px rgba(45,42,36,0.08)',
                            fontSize: '14px',
                        },
                        classNames: {
                            success: 'toast-success',
                            error: 'toast-error',
                            warning: 'toast-warning',
                            info: 'toast-info',
                        },
                    }}
                />
            </BrowserRouter>
        </QueryClientProvider>
    </React.StrictMode>,
)
