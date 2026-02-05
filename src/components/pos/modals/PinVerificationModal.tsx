import { useState, useEffect } from 'react'
import { X, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import './PinVerificationModal.css'

interface VerifiedUser {
    id: string
    name: string
    role: string
}

interface UserForVerification {
    id: string
    name: string
    display_name: string | null
    role: string
}

interface PinVerificationModalProps {
    title?: string
    message?: string
    onVerify: (verified: boolean, user?: VerifiedUser) => void
    onClose: () => void
    allowedRoles?: string[]
}

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
    const [isVerifying, setIsVerifying] = useState(false)
    const [users, setUsers] = useState<UserForVerification[]>([])
    const [isLoadingUsers, setIsLoadingUsers] = useState(true)

    // Fetch users with allowed roles on mount
    useEffect(() => {
        async function fetchUsers() {
            setIsLoadingUsers(true)
            try {
                // Get all active users
                const { data: users, error: usersError } = await supabase
                    .from('user_profiles')
                    .select('id, name, display_name, role')
                    .eq('is_active', true)

                if (usersError) {
                    console.error('Error fetching users:', usersError)
                    setError('Erreur de chargement des utilisateurs')
                    return
                }

                // Get user_roles with role codes
                const { data: userRoles, error: rolesError } = await supabase
                    .from('user_roles')
                    .select('user_id, roles(code)')

                if (rolesError) {
                    console.error('Error fetching user roles:', rolesError)
                    // Continue with legacy roles only
                }

                // Build a map of user_id -> role codes
                const userRoleMap = new Map<string, string[]>()
                if (userRoles) {
                    for (const ur of userRoles as any[]) {
                        const roles = ur.roles
                        const roleCode = Array.isArray(roles) ? roles[0]?.code : roles?.code
                        if (roleCode) {
                            const existing = userRoleMap.get(ur.user_id) || []
                            existing.push(roleCode)
                            userRoleMap.set(ur.user_id, existing)
                        }
                    }
                }

                // Normalize allowed roles to lowercase for comparison
                const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase())

                // Filter users that have at least one allowed role (case-insensitive)
                const filteredUsers = (users || []).filter(user => {
                    // Check legacy role field (case-insensitive)
                    if (user.role && normalizedAllowedRoles.includes(user.role.toLowerCase())) {
                        return true
                    }
                    // Check user_roles map (case-insensitive)
                    const roles = userRoleMap.get(user.id)
                    if (roles && roles.length > 0) {
                        return roles.some(r => normalizedAllowedRoles.includes(r.toLowerCase()))
                    }
                    return false
                }).map(user => {
                    // Determine the primary role
                    let primaryRole: string = user.role || 'unknown'
                    const roles = userRoleMap.get(user.id)
                    if (roles && roles.length > 0) {
                        // Use the first role that matches allowed roles (case-insensitive)
                        const matchedRole = roles.find(r => normalizedAllowedRoles.includes(r.toLowerCase()))
                        if (matchedRole) {
                            primaryRole = matchedRole
                        }
                    }
                    return {
                        id: user.id,
                        name: user.name,
                        display_name: user.display_name,
                        role: primaryRole
                    }
                })

                setUsers(filteredUsers)
            } catch (err) {
                console.error('Error:', err)
                setError('Erreur de connexion')
            } finally {
                setIsLoadingUsers(false)
            }
        }

        fetchUsers()
    }, [allowedRoles])

    const handleKeyPress = (key: string) => {
        if (isVerifying) return

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

    const handleVerify = async () => {
        if (pin.length < 4) {
            setError('Code PIN trop court')
            return
        }

        if (users.length === 0) {
            setError('Aucun utilisateur autorisé trouvé')
            return
        }

        setIsVerifying(true)
        setError('')

        try {
            // Try to verify PIN against each allowed user
            for (const user of users) {
                const { data: isValid, error: verifyError } = await supabase.rpc('verify_user_pin', {
                    p_user_id: user.id,
                    p_pin: pin
                })

                if (verifyError) {
                    console.error('PIN verification error for user', user.id, verifyError)
                    continue
                }

                if (isValid) {
                    // Found matching user
                    onVerify(true, {
                        id: user.id,
                        name: user.display_name || user.name,
                        role: user.role
                    })
                    return
                }
            }

            // No matching user found
            setError('Code PIN invalide ou rôle non autorisé')
            setIsShaking(true)
            setTimeout(() => setIsShaking(false), 500)
            setPin('')
        } catch (err) {
            console.error('Verification error:', err)
            setError('Erreur de vérification')
        } finally {
            setIsVerifying(false)
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
                    <button className="modal__close" onClick={onClose} title="Close">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal__body">
                    {isLoadingUsers ? (
                        <div className="pin-loading">
                            <Loader2 size={32} className="spin" />
                            <p>Loading...</p>
                        </div>
                    ) : (
                        <>
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
                                        disabled={isVerifying}
                                    >
                                        {key === 'clear' ? 'C' : key === 'back' ? '←' : key}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="modal__footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={isVerifying}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleVerify}
                        disabled={pin.length < 4 || isVerifying || isLoadingUsers}
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 size={16} className="spin" />
                                Vérification...
                            </>
                        ) : (
                            'Vérifier'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
