import { Plus, Save, Grid, Users, Palmtree } from 'lucide-react'

interface FloorPlanToolbarProps {
  tables: number
  totalCovers: number
  decorations: number
  saving: boolean
  showAddMenu: boolean
  onToggleAddMenu: () => void
  onAddTable: () => void
  onAddDecoration: () => void
  onSave: () => void
}

export function FloorPlanToolbar({
  tables,
  totalCovers,
  decorations,
  saving,
  showAddMenu,
  onToggleAddMenu,
  onAddTable,
  onAddDecoration,
  onSave,
}: FloorPlanToolbarProps) {
  return (
    <div className="flex justify-between items-center p-4 bg-[var(--onyx-surface)] rounded-xl border border-white/5">
      <div className="flex items-center gap-6">
        {/* Add Menu */}
        <div className="relative">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:opacity-90"
            onClick={onToggleAddMenu}
          >
            <Plus size={18} />
            Add Element
          </button>

          {showAddMenu && (
            <div className="absolute top-[calc(100%+8px)] left-0 min-w-[280px] bg-[var(--theme-bg-secondary)] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-white/5 text-left hover:bg-white/[0.03] transition-colors"
                onClick={onAddTable}
              >
                <Grid size={18} className="text-emerald-400" />
                <div>
                  <div className="text-sm font-semibold text-white">Table</div>
                  <div className="text-xs text-[var(--theme-text-muted)]">Add a table for customers</div>
                </div>
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
                onClick={onAddDecoration}
              >
                <Palmtree size={18} className="text-emerald-500" />
                <div>
                  <div className="text-sm font-semibold text-white">Decoration</div>
                  <div className="text-xs text-[var(--theme-text-muted)]">Plant, wall, bar, etc.</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 border border-white/5 rounded-lg text-sm text-[var(--theme-text-muted)]">
            <Grid size={14} className="text-[var(--color-gold)]" />
            <span>{tables} tables</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 border border-white/5 rounded-lg text-sm text-[var(--theme-text-muted)]">
            <Users size={14} className="text-[var(--color-gold)]" />
            <span>{totalCovers} covers</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 border border-white/5 rounded-lg text-sm text-[var(--theme-text-muted)]">
            <Palmtree size={14} className="text-emerald-500" />
            <span>{decorations} decorations</span>
          </div>
        </div>
      </div>

      <button
        className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onSave}
        disabled={saving}
      >
        <Save size={18} />
        {saving ? 'Saving...' : 'Save Floor Plan'}
      </button>
    </div>
  )
}

export default FloorPlanToolbar
