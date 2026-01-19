import { useEffect, createContext, useContext, ReactNode } from 'react'
import {
  initializeCapacitor,
  useNetworkStatus,
  useAppState,
  useBackButton,
  isNativePlatform,
  getPlatform,
} from '../hooks/useCapacitor'

interface CapacitorContextType {
  isNative: boolean
  platform: string
  isOnline: boolean
  connectionType: string
  isAppActive: boolean
}

const CapacitorContext = createContext<CapacitorContextType>({
  isNative: false,
  platform: 'web',
  isOnline: true,
  connectionType: 'unknown',
  isAppActive: true,
})

export const useCapacitorContext = () => useContext(CapacitorContext)

interface CapacitorProviderProps {
  children: ReactNode
}

export function CapacitorProvider({ children }: CapacitorProviderProps) {
  const { isOnline, connectionType } = useNetworkStatus()
  const { isActive: isAppActive } = useAppState()

  // Initialize Capacitor on mount
  useEffect(() => {
    initializeCapacitor()
  }, [])

  // Handle back button (Android)
  useBackButton()

  const value: CapacitorContextType = {
    isNative: isNativePlatform(),
    platform: getPlatform(),
    isOnline,
    connectionType,
    isAppActive,
  }

  return (
    <CapacitorContext.Provider value={value}>
      {children}
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-[9999] text-sm">
          Mode hors ligne - Certaines fonctionnalités peuvent ne pas fonctionner
        </div>
      )}
    </CapacitorContext.Provider>
  )
}

export default CapacitorProvider
