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
        <div className="qr-scan-area">
            <div className="qr-scan-icon">
                <QrCode size={80} />
            </div>
            <p className="qr-scan-instruction">
                Scan customer QR code or enter member number
            </p>
            {qrError && (
                <div className="qr-error">
                    <X size={16} />
                    {qrError}
                </div>
            )}
            <input
                ref={qrInputRef}
                type="text"
                className="qr-scan-input"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                onKeyDown={handleQrKeyDown}
                placeholder="QR Code or Member #..."
                autoFocus
            />
            <button
                className="btn btn-primary btn-scan"
                onClick={handleQrScan}
                disabled={!qrInput.trim() || loading}
            >
                {loading ? 'Searching...' : 'Submit'}
            </button>
        </div>
    )
}
