import { ArrowDownCircle, ArrowUpCircle, Package, Hash } from 'lucide-react';

interface MovementKpisProps {
  isLoading: boolean;
  totalIn: number;
  totalOut: number;
  netMovement: number;
  movementCount: number;
}

export function MovementKpis({ isLoading, totalIn, totalOut, netMovement, movementCount }: MovementKpisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <ArrowDownCircle className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total In</span>
        </div>
        <p className="text-2xl font-bold text-blue-400">
          {isLoading ? (
            <span className="inline-block w-20 h-6 bg-white/5 rounded animate-pulse" />
          ) : (
            `+${totalIn.toLocaleString()}`
          )}
        </p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <ArrowUpCircle className="w-5 h-5 text-orange-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total Out</span>
        </div>
        <p className="text-2xl font-bold text-orange-400">
          {isLoading ? (
            <span className="inline-block w-20 h-6 bg-white/5 rounded animate-pulse" />
          ) : (
            `-${totalOut.toLocaleString()}`
          )}
        </p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Package className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Net Movement</span>
        </div>
        <p className={`text-2xl font-bold ${netMovement >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {isLoading ? (
            <span className="inline-block w-20 h-6 bg-white/5 rounded animate-pulse" />
          ) : (
            `${netMovement >= 0 ? '+' : ''}${netMovement.toLocaleString()}`
          )}
        </p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Hash className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Movement Count</span>
        </div>
        <p className="text-2xl font-bold text-white">
          {isLoading ? (
            <span className="inline-block w-20 h-6 bg-white/5 rounded animate-pulse" />
          ) : (
            movementCount.toLocaleString()
          )}
        </p>
      </div>
    </div>
  );
}
