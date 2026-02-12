import { useState, useRef, useEffect } from 'react'
import { QrCode, X } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { ICustomerSearchCustomer } from './customerSearchTypes'

interface QRScanAreaProps {
    onCustomerFound: (customer: ICustomerSearchCustomer) => void
}

export default function QRScanArea({ onCustomerFound }: QRScanAreaProps) {
    const [qrInput, setQrInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [qrError, setQrError] = useState('')
    const qrInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (qrInputRef.current) {
            qrInputRef.current.focus()
        }
    }, [])

    const handleQrScan = async () => {
        if (!qrInput.trim()) return

        setLoading(true)
        setQrError('')
        try {
            const { data, error } = await supabase
                .from('customers')
                .select(`
                    *,
                    category:customer_categories(name, slug, color, price_modifier_type, discount_percentage)
                `)
                .or(`loyalty_qr_code.eq.${qrInput.trim()},membership_number.eq.${qrInput.trim()}`)
                .eq('is_active', true)
                .single()

            if (error || !data) {
                setQrInput('')
                setQrError('Customer not found with this QR code')
                return
            }

            onCustomerFound(data as unknown as ICustomerSearchCustomer)
        } catch (error) {
            console.error('Error scanning QR:', error)
            setQrError('Error during search')
            setQrInput('')
        } finally {
            setLoading(false)
        }
    }

    const handleQrKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleQrScan()
        }
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="text-indigo-500 mb-6 animate-pulse">
                <QrCode size={80} />
            </div>
            <p className="mb-6 text-slate-500 text-[0.9rem] leading-relaxed">
                Scan customer QR code or enter member number
            </p>
            {qrError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[0.85rem] mb-4">
                    <X size={16} />
                    {qrError}
                </div>
            )}
            <input
                ref={qrInputRef}
                type="text"
                className="w-full max-w-[300px] p-4 border-2 border-slate-200 rounded-[10px] text-lg text-center font-mono mb-4 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                onKeyDown={handleQrKeyDown}
                placeholder="QR Code or Member #..."
                autoFocus
            />
            <button
                className="inline-flex items-center gap-2 py-3.5 px-8 rounded-lg text-base font-medium cursor-pointer border-none transition-all duration-200 bg-indigo-500 text-white hover:not-disabled:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleQrScan}
                disabled={!qrInput.trim() || loading}
            >
                {loading ? 'Searching...' : 'Submit'}
            </button>
        </div>
    )
}
