import { Trash2 } from 'lucide-react'
import type { FloorPlanItem } from '../FloorPlanEditor'

const TABLE_SHAPES = [
  { value: 'square', label: 'Square' },
  { value: 'round', label: 'Round' },
  { value: 'rectangle', label: 'Rectangle' },
]

const DECORATION_TYPES = [
  { value: 'plant', label: 'Plant' },
  { value: 'wall', label: 'Wall' },
  { value: 'bar', label: 'Bar' },
  { value: 'entrance', label: 'Entrance' },
]

interface FloorPlanDetailsPanelProps {
  item: FloorPlanItem
  onDelete: (id: string) => void
  onEditCapacity: (id: string, capacity: number) => void
  onEditSize: (id: string, width: number, height: number) => void
  onEditRotation?: (id: string, rotation: number) => void
  onEditColor?: (id: string, color: string) => void
}

export function FloorPlanDetailsPanel({
  item,
  onDelete,
  onEditCapacity,
  onEditSize,
  onEditRotation,
  onEditColor,
}: FloorPlanDetailsPanelProps) {
  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5 flex flex-col gap-4 h-fit sticky top-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5">
        <h3 className="text-base font-bold text-white">
          {item.type === 'table'
            ? `Table ${item.number}`
            : `Decoration ${DECORATION_TYPES.find((d) => d.value === item.decoration_type)?.label || ''}`}
        </h3>
        <button
          className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          onClick={() => onDelete(item.id)}
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        {item.type === 'table' ? (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Shape</label>
              <div className="px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-sm text-white">
                {TABLE_SHAPES.find((s) => s.value === item.shape)?.label}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Section</label>
              <div className="px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-sm text-white">
                {item.section}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Capacity</label>
              <input
                type="number"
                aria-label="Capacity"
                min="1"
                max="20"
                value={item.capacity || 2}
                onChange={(e) => onEditCapacity(item.id, parseInt(e.target.value) || 2)}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20"
              />
            </div>
          </>
        ) : (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Type</label>
            <div className="px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-sm text-white">
              {DECORATION_TYPES.find((d) => d.value === item.decoration_type)?.label}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Position</label>
          <div className="px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-sm text-white">
            X: {item.x.toFixed(0)}%, Y: {item.y.toFixed(0)}%
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Size</label>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-xs text-[var(--theme-text-muted)]">W:</span>
              <input
                type="number"
                aria-label="Width"
                min="40"
                max="200"
                value={item.width || 80}
                onChange={(e) => onEditSize(item.id, parseInt(e.target.value) || 80, item.height || 80)}
                className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm text-center outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20"
              />
              <span className="text-xs text-[var(--theme-text-muted)]">px</span>
            </div>
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-xs text-[var(--theme-text-muted)]">H:</span>
              <input
                type="number"
                aria-label="Height"
                min="40"
                max="200"
                value={item.height || 80}
                onChange={(e) => onEditSize(item.id, item.width || 80, parseInt(e.target.value) || 80)}
                className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm text-center outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20"
              />
              <span className="text-xs text-[var(--theme-text-muted)]">px</span>
            </div>
          </div>
        </div>
        {onEditRotation && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Rotation</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                aria-label="Rotation"
                min="0"
                max="360"
                step="15"
                value={item.rotation || 0}
                onChange={(e) => onEditRotation(item.id, parseInt(e.target.value))}
                className="flex-1 accent-[var(--color-gold)]"
              />
              <span className="text-xs text-white w-10 text-right">{item.rotation || 0}&deg;</span>
            </div>
          </div>
        )}

        {onEditColor && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Color"
                value={item.color || (item.type === 'table' ? '#22c55e' : '#a855f7')}
                onChange={(e) => onEditColor(item.id, e.target.value)}
                className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent"
              />
              <span className="text-xs text-[var(--theme-text-muted)]">{item.color || 'Default'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Hint */}
      <div className="px-3 py-2 bg-[var(--color-gold)]/5 border border-[var(--color-gold)]/10 rounded-lg text-xs text-[var(--color-gold)] text-center">
        Drag corners to resize, or move the element
      </div>
    </div>
  )
}

export default FloorPlanDetailsPanel
