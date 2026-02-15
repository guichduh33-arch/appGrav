import { Trash2 } from 'lucide-react'
import { FloorPlanItemIcon } from './FloorPlanItemIcon'
import type { FloorPlanItem } from './floorPlanConstants'
import { TABLE_SHAPES, ITEM_TYPE_CONFIGS } from './floorPlanConstants'

interface FloorPlanDetailsPanelProps {
  item: FloorPlanItem
  onDelete: (id: string) => void
  onEditCapacity: (id: string, capacity: number) => void
  onEditSize: (id: string, width: number, height: number) => void
  onEditRotation?: (id: string, rotation: number) => void
  onEditColor?: (id: string, color: string) => void
}

export function FloorPlanDetailsPanel({
  item, onDelete, onEditCapacity, onEditSize, onEditRotation, onEditColor,
}: FloorPlanDetailsPanelProps) {
  const cfg = ITEM_TYPE_CONFIGS[item.item_type] || ITEM_TYPE_CONFIGS.table

  const titleLabel = item.item_type === 'table'
    ? `Table ${item.number}`
    : cfg.label

  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5 flex flex-col gap-4 h-fit sticky top-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <FloorPlanItemIcon itemType={item.item_type} size={18} />
          <h3 className="text-base font-bold text-white">{titleLabel}</h3>
        </div>
        <button
          className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          onClick={() => onDelete(item.id)} title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        {/* Item Type badge */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Type</label>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${cfg.bgClass} border ${cfg.borderClass} rounded-lg text-sm text-white`}>
            <FloorPlanItemIcon itemType={item.item_type} size={14} className="text-white" />
            {cfg.label}
          </div>
        </div>

        {/* Shape (table only shows label, others show too) */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Shape</label>
          <div className="px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-sm text-white">
            {TABLE_SHAPES.find(s => s.value === item.shape)?.label || item.shape}
          </div>
        </div>

        {/* Section (table only) */}
        {item.item_type === 'table' && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Section</label>
            <div className="px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-sm text-white">
              {item.section}
            </div>
          </div>
        )}

        {/* Capacity (items with seats) */}
        {cfg.hasCapacity && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Capacity</label>
            <input
              type="number" aria-label="Capacity" min="1" max="30"
              value={item.capacity || 2}
              onChange={(e) => onEditCapacity(item.id, parseInt(e.target.value) || 2)}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20"
            />
          </div>
        )}

        {/* Position */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Position</label>
          <div className="px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-sm text-white">
            X: {item.x.toFixed(0)}%, Y: {item.y.toFixed(0)}%
          </div>
        </div>

        {/* Size */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Size</label>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-xs text-[var(--theme-text-muted)]">W:</span>
              <input type="number" aria-label="Width" min="40" max="300" value={item.width || 80}
                onChange={(e) => onEditSize(item.id, parseInt(e.target.value) || 80, item.height || 80)}
                className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm text-center outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20" />
              <span className="text-xs text-[var(--theme-text-muted)]">px</span>
            </div>
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-xs text-[var(--theme-text-muted)]">H:</span>
              <input type="number" aria-label="Height" min="8" max="300" value={item.height || 80}
                onChange={(e) => onEditSize(item.id, item.width || 80, parseInt(e.target.value) || 80)}
                className="w-full px-2 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-sm text-center outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20" />
              <span className="text-xs text-[var(--theme-text-muted)]">px</span>
            </div>
          </div>
        </div>

        {/* Rotation */}
        {onEditRotation && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Rotation</label>
            <div className="flex items-center gap-2">
              <input type="range" aria-label="Rotation" min="0" max="360" step="15"
                value={item.rotation || 0}
                onChange={(e) => onEditRotation(item.id, parseInt(e.target.value))}
                className="flex-1 accent-[var(--color-gold)]" />
              <span className="text-xs text-white w-10 text-right">{item.rotation || 0}&deg;</span>
            </div>
          </div>
        )}

        {/* Color */}
        {onEditColor && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Color</label>
            <div className="flex items-center gap-2">
              <input type="color" aria-label="Color"
                value={item.color || '#22c55e'}
                onChange={(e) => onEditColor(item.id, e.target.value)}
                className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent" />
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
