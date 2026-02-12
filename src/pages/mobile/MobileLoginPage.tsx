/**
 * Mobile Login Page
 * Story 6.1 - Mobile App Authentication
 *
 * PIN-based authentication for server mobile app.
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Lock } from 'lucide-react';
import { useMobileStore } from '@/stores/mobileStore';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

/**
 * PIN keypad configuration
 */
const KEYPAD_LAYOUT = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', '←'],
];

/**
 * Mobile Login Page Component
 */
export default function MobileLoginPage() {
  const navigate = useNavigate();
  const {
    login,
    incrementLoginAttempts,
    resetLoginAttempts,
    lockoutUntil,
    isAuthenticated,
    isSessionValid,
  } = useMobileStore();

  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && isSessionValid()) {
      navigate('/mobile');
    }
  }, [isAuthenticated, isSessionValid, navigate]);

  // Lockout countdown
  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutRemaining(0);
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((new Date(lockoutUntil).getTime() - Date.now()) / 1000));
      setLockoutRemaining(remaining);

      if (remaining === 0) {
        resetLoginAttempts();
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil, resetLoginAttempts]);

  /**
   * Handle keypad press
   */
  const handleKeyPress = useCallback((key: string) => {
    if (lockoutRemaining > 0 || isLoading) return;

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    if (key === 'C') {
      setPin('');
      setError(null);
    } else if (key === '←') {
      setPin((prev) => prev.slice(0, -1));
    } else if (pin.length < 6) {
      setPin((prev) => prev + key);
    }
  }, [pin, lockoutRemaining, isLoading]);

  /**
   * Verify PIN and login
   */
  const handleLogin = useCallback(async () => {
    if (pin.length < 4 || isLoading || lockoutRemaining > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Verify PIN server-side via RPC (never fetch pin_hash to client)
      const { data: verifyResult, error: verifyError } = await supabase.rpc('verify_user_pin', {
        p_pin: pin,
      });

      if (verifyError) {
        throw new Error(verifyError.message);
      }

      if (!verifyResult || !verifyResult.user_id) {
        incrementLoginAttempts();
        setError('Incorrect PIN');
        setPin('');
        return;
      }

      const { user_id, name, display_name, role } = verifyResult;

      // Check if user has server/waiter role
      const hasServerRole = ['admin', 'server', 'waiter', 'manager'].includes(role);
      if (!hasServerRole) {
        setError('Unauthorized access');
        setPin('');
        return;
      }

      // Login successful
      login(user_id, display_name || name || 'Server');
      navigate('/mobile');
    } catch (err) {
      console.error('[MobileLogin] Error:', err);
      incrementLoginAttempts();
      setError('Connection error');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  }, [pin, isLoading, lockoutRemaining, incrementLoginAttempts, login, navigate]);

  // Auto-submit when PIN is complete (6 digits)
  useEffect(() => {
    if (pin.length === 6) {
      handleLogin();
    }
  }, [pin, handleLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#BA90A2] to-[#DDB892] p-lg">
      <div className="w-full max-w-[320px] flex flex-col items-center gap-xl">
        {/* Logo */}
        <div className="text-center text-white">
          <span className="text-[4rem] block mb-md">🥐</span>
          <h1 className="text-3xl font-bold m-0 [text-shadow:0_2px_4px_rgba(0,0,0,0.1)]">The Breakery</h1>
          <p className="text-lg mt-xs m-0 opacity-90">Server App</p>
        </div>

        {/* PIN Display */}
        <div className="flex flex-col items-center gap-sm">
          <div className="flex gap-md">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-4 h-4 rounded-full bg-white/30 border-2 border-white transition-all duration-150 ease-in-out',
                  i < pin.length && 'bg-white scale-110'
                )}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-xs text-[#fee2e2] text-sm mt-sm animate-pin-shake">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Lockout Message */}
          {lockoutRemaining > 0 && (
            <div className="flex items-center gap-xs text-white/80 text-sm mt-sm">
              <Lock size={16} />
              <span>Try again in {lockoutRemaining}s</span>
            </div>
          )}
        </div>

        {/* Keypad */}
        <div className="flex flex-col gap-sm w-full">
          {KEYPAD_LAYOUT.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-sm">
              {row.map((key) => (
                <button
                  key={key}
                  className={cn(
                    'w-[72px] h-[72px] rounded-xl bg-white/20 border-none text-white text-2xl font-semibold cursor-pointer transition-all duration-150 ease-in-out min-w-[44px] min-h-[44px]',
                    'hover:bg-white/30 active:bg-white/40 active:scale-95',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    (key === 'C' || key === '←') && 'text-lg bg-white/10'
                  )}
                  onClick={() => handleKeyPress(key)}
                  disabled={lockoutRemaining > 0 || isLoading}
                >
                  {key}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          className={cn(
            'w-full p-md bg-white border-none rounded-xl text-primary text-lg font-semibold cursor-pointer transition-all duration-150 ease-in-out',
            'flex items-center justify-center gap-sm min-h-[56px]',
            'hover:not-disabled:bg-white/90 hover:not-disabled:-translate-y-px',
            'active:not-disabled:translate-y-0',
            'disabled:opacity-70 disabled:cursor-not-allowed'
          )}
          onClick={handleLogin}
          disabled={pin.length < 4 || isLoading || lockoutRemaining > 0}
        >
          {isLoading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            'Login'
          )}
        </button>
      </div>
    </div>
  );
}
