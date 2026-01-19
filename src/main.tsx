import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { CapacitorProvider } from './components/CapacitorProvider'
import './styles/index.css'
import './i18n'

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
        <CapacitorProvider>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <App />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: '#4A3728',
                                color: '#FDF8F3',
                                borderRadius: '12px',
                            },
                        }}
                    />
                </BrowserRouter>
            </QueryClientProvider>
        </CapacitorProvider>
    </React.StrictMode>,
)
