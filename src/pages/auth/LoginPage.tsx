import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import './LoginPage.css'
import { UserProfile } from '../../types/database'

export default function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuthStore()

    const [users, setUsers] = useState<UserProfile[]>([])
    const [selectedUser, setSelectedUser] = useState<string>('')
    const [pin, setPin] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Demo users fallback (used when RLS blocks anonymous access)
    const DEMO_USERS: UserProfile[] = [
        { id: 'a1110000-0000-0000-0000-000000000001', name: 'Apni', role: 'cashier', pin_code: '1234', is_active: true } as UserProfile,
        { id: 'a1110000-0000-0000-0000-000000000002', name: 'Dani', role: 'manager', pin_code: '0000', is_active: true } as UserProfile,
        { id: 'a1110000-0000-0000-0000-000000000004', name: 'Bayu', role: 'barista', pin_code: '2222', is_active: true } as UserProfile,
        { id: 'a1110000-0000-0000-0000-000000000005', name: 'Admin', role: 'admin', pin_code: '9999', is_active: true } as UserProfile,
    ]

    // Load real users from Supabase (with demo fallback)
    useEffect(() => {
        async function loadUsers() {
            try {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('is_active', true)
                    .order('name')

                if (error) throw error

                // If Supabase returns empty (RLS blocking), use demo users
                if (data && data.length > 0) {
                    setUsers(data)
                } else {
                    console.warn('No users from Supabase, using demo fallback')
                    setUsers(DEMO_USERS)
                }
            } catch (err) {
                console.error('Error loading users:', err)
                // Fallback to demo users on error
                setUsers(DEMO_USERS)
                toast.error('Mode démo activé (base de données inaccessible)')
            }
        }
        loadUsers()
    }, [])

    const handleNumpadKey = (key: string) => {
        setError('')
        if (key === 'clear') {
            setPin('')
        } else if (key === 'backspace') {
            setPin(prev => prev.slice(0, -1))
        } else if (pin.length < 6) {
            setPin(prev => prev + key)
        }
    }

    const handleLogin = async () => {
        if (!selectedUser) {
            setError('Veuillez sélectionner un utilisateur')
            return
        }
        if (pin.length < 4) {
            setError('Code PIN trop court')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const user = users.find(u => u.id === selectedUser)

            if (!user) {
                setError('Utilisateur non trouvé')
                setIsLoading(false)
                return
            }

            if (user.pin_code !== pin) {
                setError('Code PIN incorrect')
                setIsLoading(false)
                return
            }

            // Success - log in
            login(user)

            toast.success(`Bienvenue, ${user.name}!`)
            navigate('/pos')

        } catch (err) {
            console.error('Login error:', err)
            setError('Erreur de connexion')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                {/* Logo */}
                <div className="login-logo">
                    <span className="login-logo__icon">🥐</span>
                    <h1 className="login-logo__text">The Breakery</h1>
                    <p className="login-logo__subtitle">Point de Vente</p>
                </div>

                {/* User Selection */}
                <div className="login-section">
                    <label className="login-label">Sélectionnez votre profil</label>
                    <select
                        className="login-select"
                        value={selectedUser}
                        onChange={(e) => {
                            setSelectedUser(e.target.value)
                            setPin('')
                            setError('')
                        }}
                        title="Sélectionnez votre profil"
                        aria-label="Sélection du profil utilisateur"
                    >
                        <option value="">-- Choisir --</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.name} ({user.role})
                            </option>
                        ))}
                    </select>
                </div>

                {/* PIN Entry */}
                {selectedUser && (
                    <div className="login-section">
                        <label className="login-label">Code PIN</label>
                        <div className="pin-display">
                            {[...Array(6)].map((_, i) => (
                                <span key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`}>
                                    {i < pin.length ? '●' : '○'}
                                </span>
                            ))}
                        </div>

                        {/* Numpad */}
                        <div className="numpad login-numpad">
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'backspace'].map(key => (
                                <button
                                    key={key}
                                    className={`numpad__key ${key === 'clear' ? 'clear' : ''} ${key === 'backspace' ? 'backspace' : ''}`}
                                    onClick={() => handleNumpadKey(key)}
                                >
                                    {key === 'clear' ? 'C' : key === 'backspace' ? '⌫' : key}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                {/* Login Button */}
                <button
                    className="btn btn-primary btn-block login-btn"
                    onClick={handleLogin}
                    disabled={!selectedUser || pin.length < 4 || isLoading}
                >
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                </button>

                {/* Demo hint */}
                <p className="login-hint">
                    💡 Demo: PIN pour tous les utilisateurs = leur code affiché
                </p>
            </div>
        </div>
    )
}
