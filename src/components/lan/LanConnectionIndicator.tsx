/**
 * LanConnectionIndicator Component
 * Story 4.2 - KDS Socket.IO Client Connection
 *
 * Visual indicator for LAN connection status with icon and optional label.
 */

import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
        return t('lan.client.connected');
      case 'connecting':
        if (reconnectAttempts > 0) {
          return t('lan.client.reconnectAttempt', { count: reconnectAttempts, max: maxReconnectAttempts });
        }
        return t('lan.client.connecting');
      case 'error':
        return t('lan.client.error');
      default:
        return t('lan.client.disconnected');
    }
  };

  const getTooltip = () => {
    switch (status) {
      case 'connected':
        return t('lan.client.connected');
      case 'connecting':
        if (reconnectAttempts > 0) {
          return `${t('lan.client.reconnecting')} (${reconnectAttempts}/${maxReconnectAttempts})`;
        }
        return t('lan.client.connecting');
      case 'error':
        return `${t('lan.client.error')} - ${t('lan.client.reconnectAttempt', { count: reconnectAttempts, max: maxReconnectAttempts })}`;
      default:
        return t('lan.client.disconnected');
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
