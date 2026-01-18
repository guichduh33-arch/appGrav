import { useState } from 'react'
import { X, Lock, AlertCircle } from 'lucide-react'
import type { UserProfile } from '../../types/database'
import './PinVerificationModal.css'

interface VerifiedUser {
    id: string
    name: string
    role: string
}

interface PinVerificationModalProps {
    title?: string
    message?: string
    onVerify: (verified: boolean, user?: VerifiedUser) => void
    onClose: () => void
    allowedRoles?: string[]
}

// Demo users for PIN verification (same as login)
const DEMO_USERS: Partial<UserProfile>[] = [
    { id: 'a1110000-0000-0000-0000-000000000001', name: 'Apni', role: 'cashier', pin_code: '1234' },
    { id: 'a1110000-0000-0000-0000-000000000002', name: 'Dani', role: 'manager', pin_code: '0000' },
    { id: 'a1110000-0000-0000-0000-000000000004', name: 'Bayu', role: 'barista', pin_code: '2222' },
    { id: 'a1110000-0000-0000-0000-000000000005', name: 'Admin', role: 'admin', pin_code: '9999' },
]

export default function PinVerificationModal({
    title = 'Vérification requise',
    message = 'Entrez un code PIN manager pour continuer',
    onVerify,
    onClose,
    allowedRoles = ['manager', 'admin']
}: PinVerificationModalProps) {
    const [pin, setPin] = useState('')
    const [error, setError] = useState('')
    const [isShaking, setIsShaking] = useState(false)

    const handleKeyPress = (key: string) => {
        if (key === 'clear') {
            setPin('')
            setError('')
        } else if (key === 'back') {
            setPin(prev => prev.slice(0, -1))
            setError('')
        } else if (pin.length < 6) {
            setPin(prev => prev + key)
            setError('')
        }
    }

    const handleVerify = () => {
        if (pin.length < 4) {
            setError('Code PIN trop court')
            return
        }

        // Check if PIN matches any allowed user
        const matchingUser = DEMO_USERS.find(
            user => user.pin_code === pin && allowedRoles.includes(user.role || '')
        )

        if (matchingUser) {
            onVerify(true, {
                id: matchingUser.id!,
                name: matchingUser.name!,
                role: matchingUser.role!
            })
            // Don't call onClose here - let parent handle modal closure
        } else {
            setError('Code PIN invalide ou rôle non autorisé')
            setIsShaking(true)
            setTimeout(() => setIsShaking(false), 500)
            setPin('')
        }
    }

    const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back']

    return (
        <div className="modal-backdrop is-active" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={`modal modal-sm is-active pin-modal ${isShaking ? 'shake' : ''}`}>
                <div className="modal__header">
                    <div className="pin-modal__icon">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h3 className="modal__title">{title}</h3>
                        <p className="modal__subtitle">{message}</p>
                    </div>
                    <button className="modal__close" onClick={onClose} title="Fermer">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal__body">
                    {/* PIN Display */}
                    <div className="pin-entry">
                        <div className="pin-display">
                            {[...Array(6)].map((_, i) => (
                                <span key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`}>
                                    {i < pin.length ? '●' : '○'}
                                </span>
                            ))}
                        </div>

                        {error && (
                            <div className="pin-error">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Numpad */}
                    <div className="numpad">
                        {numpadKeys.map((key) => (
                            <button
                                key={key}
                                className={`numpad__key ${key === 'clear' || key === 'back' ? 'numpad__key--action' : ''}`}
                                onClick={() => handleKeyPress(key)}
                            >
                                {key === 'clear' ? 'C' : key === 'back' ? '←' : key}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="modal__footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Annuler
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleVerify}
                        disabled={pin.length < 4}
                    >
                        Vérifier
                    </button>
                </div>
            </div>
        </div>
    )
}
