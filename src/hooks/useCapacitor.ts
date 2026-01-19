import { useEffect, useState, useCallback } from 'react'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { Network } from '@capacitor/network'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { Keyboard } from '@capacitor/keyboard'
import { SplashScreen } from '@capacitor/splash-screen'
import { Preferences } from '@capacitor/preferences'

// Platform detection
export const isNativePlatform = () => Capacitor.isNativePlatform()
export const getPlatform = () => Capacitor.getPlatform()
export const isAndroid = () => getPlatform() === 'android'
export const isIOS = () => getPlatform() === 'ios'
export const isWeb = () => getPlatform() === 'web'

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [connectionType, setConnectionType] = useState<string>('unknown')

  useEffect(() => {
    if (!isNativePlatform()) {
      // Use browser API for web
      setIsOnline(navigator.onLine)
      const handleOnline = () => setIsOnline(true)
      const handleOffline = () => setIsOnline(false)
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }

    // Use Capacitor Network plugin for native
    const checkNetwork = async () => {
      const status = await Network.getStatus()
      setIsOnline(status.connected)
      setConnectionType(status.connectionType)
    }

    checkNetwork()

    const listener = Network.addListener('networkStatusChange', (status) => {
      setIsOnline(status.connected)
      setConnectionType(status.connectionType)
    })

    return () => {
      listener.then(l => l.remove())
    }
  }, [])

  return { isOnline, connectionType }
}

// Haptic feedback
export function useHaptics() {
  const impact = useCallback(async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (isNativePlatform()) {
      await Haptics.impact({ style })
    }
  }, [])

  const notification = useCallback(async (type: NotificationType = NotificationType.Success) => {
    if (isNativePlatform()) {
      await Haptics.notification({ type })
    }
  }, [])

  const vibrate = useCallback(async (duration = 300) => {
    if (isNativePlatform()) {
      await Haptics.vibrate({ duration })
    }
  }, [])

  const selectionStart = useCallback(async () => {
    if (isNativePlatform()) {
      await Haptics.selectionStart()
    }
  }, [])

  const selectionChanged = useCallback(async () => {
    if (isNativePlatform()) {
      await Haptics.selectionChanged()
    }
  }, [])

  const selectionEnd = useCallback(async () => {
    if (isNativePlatform()) {
      await Haptics.selectionEnd()
    }
  }, [])

  return {
    impact,
    notification,
    vibrate,
    selectionStart,
    selectionChanged,
    selectionEnd,
    ImpactStyle,
    NotificationType,
  }
}

// App state hook (for handling back button, app state changes)
export function useAppState() {
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!isNativePlatform()) return

    const stateListener = App.addListener('appStateChange', ({ isActive }) => {
      setIsActive(isActive)
    })

    return () => {
      stateListener.then(l => l.remove())
    }
  }, [])

  return { isActive }
}

// Back button handler for Android
export function useBackButton(handler?: () => void) {
  useEffect(() => {
    if (!isNativePlatform() || !isAndroid()) return

    const backListener = App.addListener('backButton', ({ canGoBack }) => {
      if (handler) {
        handler()
      } else if (canGoBack) {
        window.history.back()
      } else {
        App.exitApp()
      }
    })

    return () => {
      backListener.then(l => l.remove())
    }
  }, [handler])
}

// Keyboard visibility hook
export function useKeyboard() {
  const [isVisible, setIsVisible] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    if (!isNativePlatform()) return

    const showListener = Keyboard.addListener('keyboardWillShow', (info) => {
      setIsVisible(true)
      setKeyboardHeight(info.keyboardHeight)
    })

    const hideListener = Keyboard.addListener('keyboardWillHide', () => {
      setIsVisible(false)
      setKeyboardHeight(0)
    })

    return () => {
      showListener.then(l => l.remove())
      hideListener.then(l => l.remove())
    }
  }, [])

  const hide = useCallback(async () => {
    if (isNativePlatform()) {
      await Keyboard.hide()
    }
  }, [])

  return { isVisible, keyboardHeight, hide }
}

// Status bar control
export function useStatusBar() {
  const setStyle = useCallback(async (style: 'light' | 'dark') => {
    if (isNativePlatform()) {
      await StatusBar.setStyle({ style: style === 'dark' ? Style.Dark : Style.Light })
    }
  }, [])

  const setBackgroundColor = useCallback(async (color: string) => {
    if (isNativePlatform() && isAndroid()) {
      await StatusBar.setBackgroundColor({ color })
    }
  }, [])

  const hide = useCallback(async () => {
    if (isNativePlatform()) {
      await StatusBar.hide()
    }
  }, [])

  const show = useCallback(async () => {
    if (isNativePlatform()) {
      await StatusBar.show()
    }
  }, [])

  return { setStyle, setBackgroundColor, hide, show }
}

// Splash screen control
export function useSplashScreen() {
  const hide = useCallback(async () => {
    if (isNativePlatform()) {
      await SplashScreen.hide()
    }
  }, [])

  const show = useCallback(async () => {
    if (isNativePlatform()) {
      await SplashScreen.show()
    }
  }, [])

  return { hide, show }
}

// Local storage using Preferences (more reliable on mobile)
export function usePreferences() {
  const get = useCallback(async (key: string): Promise<string | null> => {
    if (isNativePlatform()) {
      const { value } = await Preferences.get({ key })
      return value
    }
    return localStorage.getItem(key)
  }, [])

  const set = useCallback(async (key: string, value: string): Promise<void> => {
    if (isNativePlatform()) {
      await Preferences.set({ key, value })
    } else {
      localStorage.setItem(key, value)
    }
  }, [])

  const remove = useCallback(async (key: string): Promise<void> => {
    if (isNativePlatform()) {
      await Preferences.remove({ key })
    } else {
      localStorage.removeItem(key)
    }
  }, [])

  const clear = useCallback(async (): Promise<void> => {
    if (isNativePlatform()) {
      await Preferences.clear()
    } else {
      localStorage.clear()
    }
  }, [])

  return { get, set, remove, clear }
}

// Initialize Capacitor plugins
export async function initializeCapacitor() {
  if (!isNativePlatform()) return

  try {
    // Hide splash screen after app is ready
    await SplashScreen.hide()

    // Set status bar style
    await StatusBar.setStyle({ style: Style.Dark })

    if (isAndroid()) {
      await StatusBar.setBackgroundColor({ color: '#1a1a2e' })
    }

    console.log('Capacitor initialized successfully')
  } catch (error) {
    console.error('Error initializing Capacitor:', error)
  }
}
