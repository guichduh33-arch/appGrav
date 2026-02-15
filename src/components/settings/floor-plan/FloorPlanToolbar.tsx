import { Plus, Save, Grid, Users } from 'lucide-react'
import { FloorPlanItemIcon } from './FloorPlanItemIcon'
import { ITEM_TYPES, ITEM_TYPE_CONFIGS } from './floorPlanConstants'
import type { FloorPlanItemType } from './floorPlanConstants'

interface FloorPlanToolbarProps {
  tables: number
  totalCovers: number
  otherItems: number
  saving: boolean
  showAddMenu: boolean
  onToggleAddMenu: () => void
  onAddItem: (type: FloorPlanItemType) => void
  onSave: () => void
}

export function FloorPlanToolbar({
  tables, totalCovers, otherItems,
  saving, showAddMenu, onToggleAddMenu, onAddItem, onSave,
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
              {ITEM_TYPES.map((type, idx) => {
                const cfg = ITEM_TYPE_CONFIGS[type]
                return (
                  <button
                    key={type}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors ${idx < ITEM_TYPES.length - 1 ? 'border-b border-white/5' : ''}`}
                    onClick={() => { onAddItem(type); onToggleAddMenu() }}
                  >
                    <FloorPlanItemIcon itemType={type} size={18} />
                    <div>
                      <div className="text-sm font-semibold text-white">{cfg.label}</div>
                      <div className="text-xs text-[var(--theme-text-muted)]">{cfg.description}</div>
                    </div>
                  </button>
                )
              })}
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
            <span className="text-[var(--color-gold)]">{otherItems}</span>
            <span>other items</span>
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
