import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { BreakeryLogo } from '@/components/ui/BreakeryLogo';
import { Mail, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';
import { logError } from '@/utils/logger';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');

  const maskEmail = (addr: string) => {
    const [user, domain] = addr.split('@');
    if (!user || !domain) return addr;
    return `${user.charAt(0)}${'*'.repeat(Math.max(user.length - 1, 2))}@${domain}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;

      setMaskedEmail(maskEmail(email));
      setIsSent(true);
      toast.success('Reset link sent!');
    } catch (err) {
      logError('Password reset error:', err);
      // Always show success for security (don't reveal if email exists)
      setMaskedEmail(maskEmail(email));
      setIsSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      toast.success('Reset link resent!');
    } catch (err) {
      logError('Resend error:', err);
      toast.error('Failed to resend. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative"
      style={{ background: 'var(--theme-bg-primary)' }}
    >
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 opacity-20">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
          style={{ background: 'var(--color-gold)', filter: 'blur(150px)' }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full"
          style={{ background: 'rgba(202,176,109,0.2)', filter: 'blur(120px)' }}
        />
      </div>

      <div className="w-full max-w-[480px]">
        {/* Card */}
        <div
          className="relative rounded-xl p-10 shadow-2xl overflow-hidden"
          style={{
            background: 'var(--theme-bg-secondary)',
            border: '1px solid var(--theme-border)',
          }}
        >
          {/* Gold accent bar */}
          {isSent && (
            <div
              className="absolute top-0 left-0 w-full h-1 opacity-50"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)',
              }}
            />
          )}

          {!isSent ? (
            /* State A: Request Form */
            <>
              <div className="flex flex-col items-center text-center mb-8">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                  style={{ background: 'rgba(202,176,109,0.1)' }}
                >
                  <KeyRound className="w-8 h-8" style={{ color: 'var(--color-gold)' }} />
                </div>
                <h1
                  className="font-display text-3xl font-bold mb-3"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  Reset Password
                </h1>
                <p
                  className="text-sm leading-relaxed max-w-[280px]"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  Enter your email and we'll send a password reset link to your inbox.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-xs font-semibold uppercase tracking-widest mb-2 ml-1"
                    style={{ color: 'var(--color-gold)' }}
                  >
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail
                        className="w-5 h-5 transition-colors"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      />
                    </div>
                    <input
                      id="reset-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="bakery@example.com"
                      className="block w-full pl-11 pr-4 py-3.5 rounded-lg text-sm transition-all outline-none"
                      style={{
                        background: 'var(--theme-bg-primary)',
                        border: '1px solid var(--theme-border)',
                        color: 'var(--theme-text-primary)',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full font-bold py-4 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'var(--color-gold)',
                    color: 'var(--theme-bg-secondary)',
                    boxShadow: '0 4px 12px rgba(202,176,109,0.2)',
                  }}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div
                className="mt-8 pt-8 text-center"
                style={{ borderTop: '1px solid rgba(42,42,48,0.5)' }}
              >
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: 'var(--color-gold)' }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            /* State B: Success */
            <>
              <div className="flex flex-col items-center text-center py-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-8"
                  style={{ background: 'rgba(74,93,78,0.15)' }}
                >
                  <CheckCircle className="w-12 h-12" style={{ color: 'var(--color-success-text)' }} />
                </div>
                <h2
                  className="font-display text-3xl font-bold mb-4"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  Check Your Email
                </h2>
                <p
                  className="text-sm leading-relaxed mb-8"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  We've sent a password reset link to{' '}
                  <span style={{ color: 'var(--theme-text-primary)', fontWeight: 500 }}>
                    {maskedEmail}
                  </span>
                  . Please check your spam folder if you don't see it.
                </p>

                <div className="space-y-4 w-full">
                  <button
                    onClick={handleResend}
                    disabled={isLoading}
                    className="w-full font-medium py-3.5 rounded-lg transition-all text-sm disabled:opacity-50"
                    style={{
                      background: 'var(--theme-bg-tertiary)',
                      color: 'var(--theme-text-primary)',
                      border: '1px solid var(--theme-border)',
                    }}
                  >
                    {isLoading ? 'Sending...' : 'Resend Email'}
                  </button>
                  <Link
                    to="/login"
                    className="block text-center text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: 'var(--color-gold)' }}
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>

              {/* Progress dots */}
              <div
                className="mt-8 pt-8 flex justify-center space-x-1"
                style={{ borderTop: '1px solid rgba(42,42,48,0.5)' }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(202,176,109,0.2)' }} />
                <div className="w-4 h-1.5 rounded-full" style={{ background: 'var(--color-gold)' }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(202,176,109,0.2)' }} />
              </div>
            </>
          )}
        </div>

        {/* Branding Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-3">
            <BreakeryLogo size="sm" variant="gold" showText={false} />
            <span
              className="font-display italic text-xl font-bold"
              style={{ color: 'var(--color-gold)' }}
            >
              The Breakery
            </span>
            <span className="h-4 w-px" style={{ background: 'var(--theme-border)' }} />
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              Artisan Management
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
