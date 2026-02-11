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
import './MobileLoginPage.css';

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
    <div className="mobile-login">
      <div className="mobile-login__container">
        {/* Logo */}
        <div className="mobile-login__logo">
          <span className="mobile-login__logo-icon">🥐</span>
          <h1 className="mobile-login__title">The Breakery</h1>
          <p className="mobile-login__subtitle">Server App</p>
        </div>

        {/* PIN Display */}
        <div className="mobile-login__pin-display">
          <div className="mobile-login__pin-dots">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`mobile-login__pin-dot ${i < pin.length ? 'mobile-login__pin-dot--filled' : ''}`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mobile-login__error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Lockout Message */}
          {lockoutRemaining > 0 && (
            <div className="mobile-login__lockout">
              <Lock size={16} />
              <span>Try again in {lockoutRemaining}s</span>
            </div>
          )}
        </div>

        {/* Keypad */}
        <div className="mobile-login__keypad">
          {KEYPAD_LAYOUT.map((row, rowIndex) => (
            <div key={rowIndex} className="mobile-login__keypad-row">
              {row.map((key) => (
                <button
                  key={key}
                  className={`mobile-login__key ${
                    key === 'C' || key === '←' ? 'mobile-login__key--action' : ''
                  }`}
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
          className="mobile-login__submit"
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
