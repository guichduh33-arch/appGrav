import { useState, useEffect } from 'react'
import { X, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { logError } from '@/utils/logger'
import { cn } from '@/lib/utils'

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
    title = 'Verification Required',
    message = 'Enter a manager PIN to continue',
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
                    logError('Error fetching users:', usersError)
                    setError('Error loading users')
                    return
                }

                // Get user_roles with role codes
                type UserRoleRow = { user_id: string; roles: { code: string } | { code: string }[] | null };
                const { data: userRoles, error: rolesError } = await supabase
                    .from('user_roles')
                    .select('user_id, roles(code)')
                    .returns<UserRoleRow[]>()

                if (rolesError) {
                    logError('Error fetching user roles:', rolesError)
                    // Continue with legacy roles only
                }

                // Build a map of user_id -> role codes
                const userRoleMap = new Map<string, string[]>()
                if (userRoles) {
                    for (const ur of userRoles) {
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
                logError('Error:', err)
                setError('Connection error')
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
            setError('PIN too short')
            return
        }

        if (users.length === 0) {
            setError('No authorized user found')
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
                    logError(`PIN verification error for user ${user.id}`, verifyError)
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
            setError('Invalid PIN or unauthorized role')
            setIsShaking(true)
            setTimeout(() => setIsShaking(false), 500)
            setPin('')
        } catch (err) {
            logError('Verification error:', err)
            setError('Verification error')
        } finally {
            setIsVerifying(false)
        }
    }

    const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back']

    return (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={cn('bg-[var(--theme-bg-primary)] rounded-xl text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] w-full max-w-[360px]', isShaking && 'animate-pin-shake')}>
                <div className="flex items-center px-6 py-5 border-b border-white/5">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl mr-4 text-white"
                        style={{ background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)' }}>
                        <Lock size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white m-0">{title}</h3>
                        <p className="text-sm text-[var(--theme-text-secondary)] mt-1">{message}</p>
                    </div>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-transparent text-[var(--theme-text-muted)] hover:text-white hover:border-white/20 cursor-pointer ml-auto" onClick={onClose} title="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {isLoadingUsers ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-4 text-[var(--theme-text-secondary)]">
                            <Loader2 size={32} className="animate-spin" />
                            <p>Loading...</p>
                        </div>
                    ) : (
                        <>
                            {/* PIN Display */}
                            <div className="text-center mb-6">
                                <div className="flex justify-center gap-2 mb-4">
                                    {[...Array(6)].map((_, i) => (
                                        <span key={i} className={cn(
                                            'w-4 h-4 text-xl transition-all duration-150',
                                            i < pin.length ? 'text-[var(--color-gold)]' : 'text-[var(--theme-text-muted)]'
                                        )}>
                                            {i < pin.length ? '\u25CF' : '\u25CB'}
                                        </span>
                                    ))}
                                </div>

                                {error && (
                                    <div className="flex items-center justify-center gap-1 text-[var(--color-danger-text)] text-sm animate-in fade-in">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}
                            </div>

                            {/* Numpad */}
                            <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
                                {numpadKeys.map((key) => (
                                    <button
                                        key={key}
                                        className={cn(
                                            'h-14 flex items-center justify-center text-2xl font-bold bg-[var(--theme-bg-tertiary)] text-white border border-white/10 rounded-lg cursor-pointer shadow-sm transition-all duration-150 hover:bg-[var(--theme-bg-secondary)] hover:border-white/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
                                            (key === 'clear' || key === 'back') && 'bg-red-900/30 text-red-400 border-red-800 text-xl hover:bg-red-900/50 hover:border-red-600'
                                        )}
                                        onClick={() => handleKeyPress(key)}
                                        disabled={isVerifying}
                                    >
                                        {key === 'clear' ? 'C' : key === 'back' ? '\u2190' : key}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3">
                    <button className="px-6 py-3 border border-white/10 rounded-xl bg-transparent text-sm font-semibold text-[var(--theme-text-secondary)] hover:text-white cursor-pointer" onClick={onClose} disabled={isVerifying}>
                        Cancel
                    </button>
                    <button
                        className="px-6 py-3 bg-[var(--color-gold)] rounded-xl text-black text-sm font-bold cursor-pointer hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        onClick={handleVerify}
                        disabled={pin.length < 4 || isVerifying || isLoadingUsers}
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Verify'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
