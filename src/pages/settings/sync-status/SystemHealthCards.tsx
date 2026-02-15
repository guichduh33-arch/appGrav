/**
 * SystemHealthCards - Client-side system health metrics (L3)
 * Shows connection latency, storage usage, and sync throughput
 */

import { useState, useEffect, useCallback } from 'react'
import { Wifi, HardDrive, Zap, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { logError } from '@/utils/logger'

interface IHealthMetrics {
  latencyMs: number | null
  storageUsageMB: number | null
  storageQuotaMB: number | null
  lastChecked: Date | null
}

export function SystemHealthCards() {
  const [metrics, setMetrics] = useState<IHealthMetrics>({
    latencyMs: null,
    storageUsageMB: null,
    storageQuotaMB: null,
    lastChecked: null,
  })
  const [checking, setChecking] = useState(false)

  const checkHealth = useCallback(async () => {
    setChecking(true)
    try {
      // Measure Supabase latency
      const start = performance.now()
      await supabase.from('settings').select('id').limit(1)
      const latencyMs = Math.round(performance.now() - start)

      // Check storage usage (IndexedDB + Cache)
      let storageUsageMB: number | null = null
      let storageQuotaMB: number | null = null
      if (navigator.storage?.estimate) {
        const estimate = await navigator.storage.estimate()
        storageUsageMB = estimate.usage ? Math.round(estimate.usage / 1024 / 1024) : null
        storageQuotaMB = estimate.quota ? Math.round(estimate.quota / 1024 / 1024) : null
      }

      setMetrics({ latencyMs, storageUsageMB, storageQuotaMB, lastChecked: new Date() })
    } catch (err) {
      logError('[SystemHealth] Check failed:', err)
      setMetrics(prev => ({ ...prev, latencyMs: -1, lastChecked: new Date() }))
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => { checkHealth() }, [checkHealth])

  const latencyColor = metrics.latencyMs === null
    ? 'text-white/30'
    : metrics.latencyMs < 0
      ? 'text-red-400'
      : metrics.latencyMs < 200
        ? 'text-emerald-400'
        : metrics.latencyMs < 500
          ? 'text-amber-400'
          : 'text-red-400'

  const latencyLabel = metrics.latencyMs === null
    ? '—'
    : metrics.latencyMs < 0
      ? 'Error'
      : `${metrics.latencyMs}ms`

  const storagePercent = metrics.storageUsageMB && metrics.storageQuotaMB
    ? Math.round((metrics.storageUsageMB / metrics.storageQuotaMB) * 100)
    : null

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-gold)]">
          System Health
        </h3>
        <button
          onClick={checkHealth}
          disabled={checking}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors disabled:opacity-30"
        >
          <RefreshCw size={12} className={checking ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Database Latency */}
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wifi size={14} className="text-[var(--theme-text-muted)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
              DB Latency
            </span>
          </div>
          <p className={`text-2xl font-bold ${latencyColor}`}>{latencyLabel}</p>
          <p className="text-[10px] text-white/30 mt-1">Supabase round-trip</p>
        </div>

        {/* Local Storage */}
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive size={14} className="text-[var(--theme-text-muted)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
              Local Storage
            </span>
          </div>
          <p className="text-2xl font-bold text-white">
            {metrics.storageUsageMB !== null ? `${metrics.storageUsageMB} MB` : '—'}
          </p>
          {storagePercent !== null && (
            <div className="mt-2">
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    storagePercent > 80 ? 'bg-red-400' : storagePercent > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(storagePercent, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-white/30 mt-1">
                {storagePercent}% of {metrics.storageQuotaMB} MB
              </p>
            </div>
          )}
        </div>

        {/* Service Worker */}
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-[var(--theme-text-muted)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
              Service Worker
            </span>
          </div>
          <p className={`text-2xl font-bold ${
            'serviceWorker' in navigator ? 'text-emerald-400' : 'text-white/30'
          }`}>
            {'serviceWorker' in navigator ? 'Active' : 'N/A'}
          </p>
          <p className="text-[10px] text-white/30 mt-1">Offline capability</p>
        </div>
      </div>
    </div>
  )
}
