import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    WifiOff,
    AlertCircle,
    Loader2,
    ChevronRight
} from 'lucide-react';
import { BreakeryLogo } from '@/components/ui/BreakeryLogo';

export default function EmailLoginPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(true);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/pos');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
                return;
            }

            if (data.user) {
                toast.success('Welcome back!');
                // The authStore will pick up the session change via its listener
                navigate('/pos');
            }
        } catch (err: any) {
            setError('An unexpected error occurred. Please try again.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#0D0D0F] min-h-screen flex flex-col items-center justify-center font-sans antialiased text-white relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#c8a45b]/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#c8a45b]/5 rounded-full blur-[120px]"></div>
            </div>

            <main className="flex-grow flex items-center justify-center p-6 w-full z-10">
                <div className="bg-[#1A1A1D] border border-[#2A2A30] rounded-xl p-10 shadow-2xl relative overflow-hidden w-full max-w-[480px]">
                    {/* Logo & Branding */}
                    <div className="text-center mb-10">
                        <div className="inline-block mb-4">
                            <BreakeryLogo className="w-16 h-16 text-[#c8a45b]" />
                        </div>
                        <h1 className="font-serif text-[36px] text-[#c8a45b] leading-tight flex items-center justify-center gap-3">
                            The Breakery
                        </h1>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="h-px w-4 bg-[#c8a45b]/30"></span>
                            <p className="text-[#A09B8E] text-sm tracking-widest uppercase font-medium">Artisan Bakery · Lombok</p>
                            <span className="h-px w-4 bg-[#c8a45b]/30"></span>
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-[#A09B8E] uppercase tracking-wider ml-1" htmlFor="email">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A09B8E] w-5 h-5" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0D0D0F]/50 border border-[#2A2A30] rounded-lg py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 outline-none transition-all focus:border-[#c8a45b] focus:ring-2 focus:ring-[#c8a45b]/20"
                                    placeholder="manager@thebreakery.id"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-semibold text-[#A09B8E] uppercase tracking-wider" htmlFor="password">
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A09B8E] w-5 h-5" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0D0D0F]/50 border border-[#2A2A30] rounded-lg py-3 pl-11 pr-11 text-white placeholder:text-zinc-600 outline-none transition-all focus:border-[#c8a45b] focus:ring-2 focus:ring-[#c8a45b]/20"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A09B8E] hover:text-[#c8a45b] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-red-400 text-sm leading-relaxed">{error}</p>
                            </div>
                        )}

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center group cursor-pointer">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="peer h-5 w-5 border-[#2A2A30] bg-[#0D0D0F]/50 rounded text-[#c8a45b] focus:ring-[#c8a45b] focus:ring-offset-[#0D0D0F]"
                                    />
                                </div>
                                <span className="ml-2 text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Remember me</span>
                            </label>
                            <Link to="/login/reset" className="text-sm text-[#c8a45b]/80 hover:text-[#c8a45b] transition-colors font-medium">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#c8a45b] hover:bg-[#b8944b] disabled:opacity-50 disabled:cursor-not-allowed text-[#0D0D0F] font-bold py-3.5 rounded-lg transition-all transform active:scale-[0.98] shadow-lg shadow-[#c8a45b]/10 mt-2 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    SIGN IN
                                    <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Secondary Divider */}
                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#2A2A30]"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#1A1A1D] px-4 text-[#A09B8E] tracking-widest italic font-serif">Crafted Excellence</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-zinc-500 text-sm italic">"The finest crusts in the archipelago."</p>
                    </div>
                </div>
            </main>

            {/* Footer Utility */}
            <footer className="w-full p-8 flex flex-col items-center gap-4 z-10">
                <Link
                    to="/login"
                    className="flex items-center gap-2 text-[#A09B8E] hover:text-[#c8a45b] transition-colors text-sm font-medium group"
                >
                    <WifiOff className="w-5 h-5 group-hover:animate-pulse" />
                    Use Offline Mode (PIN)
                </Link>
                <div className="text-zinc-600 text-[10px] tracking-widest uppercase font-bold">
                    Version 2.1.0
                </div>
            </footer>
        </div>
    );
}
