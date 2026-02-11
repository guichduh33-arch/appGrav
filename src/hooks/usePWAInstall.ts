/**
 * PWA Install Hook
 * Story 1.6 - Service Worker & PWA Setup
 *
 * Handles PWA installation prompt and status tracking.
 */

import { useState, useEffect, useCallback } from 'react';
import logger from '@/utils/logger';

interface IBeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface IPWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isStandalone: boolean;
}

interface IPWAInstallActions {
  promptInstall: () => Promise<boolean>;
}

/** Navigator with non-standard PWA properties */
interface INavigatorStandalone extends Navigator {
  standalone?: boolean;
  getInstalledRelatedApps?: () => Promise<unknown[]>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: IBeforeInstallPromptEvent;
  }
}

/**
 * Hook for managing PWA installation
 *
 * @returns Object containing install state and prompt function
 *
 * @example
 * ```tsx
 * const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
 *
 * if (isInstallable && !isInstalled) {
 *   return <button onClick={promptInstall}>Install App</button>;
 * }
 * ```
 */
export function usePWAInstall(): IPWAInstallState & IPWAInstallActions {
  const [deferredPrompt, setDeferredPrompt] = useState<IBeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if running on iOS
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !('MSStream' in window);

  // Check if running in standalone mode (installed PWA)
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as INavigatorStandalone).standalone === true);

  useEffect(() => {
    // Already installed
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: IBeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e);
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      logger.debug('[PWA] App was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed using getInstalledRelatedApps (if supported)
    const nav = navigator as INavigatorStandalone;
    if (nav.getInstalledRelatedApps) {
      nav.getInstalledRelatedApps().then((apps) => {
        if (apps.length > 0) {
          setIsInstalled(true);
        }
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  /**
   * Trigger the PWA install prompt
   * @returns true if user accepted, false if dismissed or unavailable
   */
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.warn('[PWA] Install prompt not available');
      return false;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;

      // Clear the deferred prompt
      setDeferredPrompt(null);

      if (outcome === 'accepted') {
        logger.debug('[PWA] User accepted the install prompt');
        return true;
      } else {
        logger.debug('[PWA] User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('[PWA] Error prompting install:', error);
      return false;
    }
  }, [deferredPrompt]);

  return {
    isInstallable: deferredPrompt !== null,
    isInstalled: isInstalled || isStandalone,
    isIOS,
    isStandalone,
    promptInstall,
  };
}

/**
 * Hook for registering service worker updates
 *
 * @example
 * ```tsx
 * const { needRefresh, updateServiceWorker } = useServiceWorkerUpdate();
 *
 * if (needRefresh) {
 *   return <button onClick={updateServiceWorker}>Update Available</button>;
 * }
 * ```
 */
export function useServiceWorkerUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Check for updates when the page loads
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Check for waiting service worker
        if (reg.waiting) {
          setNeedRefresh(true);
        }

        // Listen for new service worker installing
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setNeedRefresh(true);
              }
            });
          }
        });
      });

      // Handle controller change (new service worker took over)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  const updateServiceWorker = useCallback(() => {
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [registration]);

  return {
    needRefresh,
    updateServiceWorker,
  };
}
