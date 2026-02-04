/**
 * LanConnectionIndicator Component
 * Story 4.2 - KDS Socket.IO Client Connection
 *
 * Visual indicator for LAN connection status with icon and optional label.
 */

import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import type { TLanConnectionStatus } from '@/stores/lanStore';

interface ILanConnectionIndicatorProps {
  status: TLanConnectionStatus;
  reconnectAttempts?: number;
  maxReconnectAttempts?: number;
  className?: string;
  showLabel?: boolean;
}

export function LanConnectionIndicator({
  status,
  reconnectAttempts = 0,
  maxReconnectAttempts = 10,
  className = '',
  showLabel = false,
}: ILanConnectionIndicatorProps) {
  const getIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="text-green-500" size={20} />;
      case 'connecting':
        return <Loader2 className="text-yellow-500 animate-spin" size={20} />;
      case 'error':
        return <WifiOff className="text-red-500" size={20} />;
      default:
        return <WifiOff className="text-gray-400" size={20} />;
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'connected':
        return 'Connected to LAN hub';
      case 'connecting':
        if (reconnectAttempts > 0) {
          return `Reconnecting (${reconnectAttempts}/${maxReconnectAttempts})`;
        }
        return 'Connecting to LAN hub...';
      case 'error':
        return 'Connection error';
      default:
        return 'Disconnected from LAN hub';
    }
  };

  const getTooltip = () => {
    switch (status) {
      case 'connected':
        return 'Connected to LAN hub';
      case 'connecting':
        if (reconnectAttempts > 0) {
          return `Reconnecting (${reconnectAttempts}/${maxReconnectAttempts})`;
        }
        return 'Connecting to LAN hub...';
      case 'error':
        return `Connection error - Reconnecting (${reconnectAttempts}/${maxReconnectAttempts})`;
      default:
        return 'Disconnected from LAN hub';
    }
  };

  return (
    <div
      className={`flex items-center gap-1.5 ${className}`}
      title={getTooltip()}
    >
      {getIcon()}
      {showLabel && (
        <span className="text-sm whitespace-nowrap">{getLabel()}</span>
      )}
    </div>
  );
}
