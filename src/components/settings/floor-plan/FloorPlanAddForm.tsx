import { useState, useEffect } from 'react'
import { Plus, Square, Circle, Minus } from 'lucide-react'
import { FloorPlanItemIcon } from './FloorPlanItemIcon'
import type { FloorPlanItemType, FloorPlanShape } from './floorPlanConstants'
import { ITEM_TYPE_CONFIGS, TABLE_SHAPES, FLOOR_SECTIONS } from './floorPlanConstants'

interface FloorPlanAddFormProps {
  itemType: FloorPlanItemType
  activeSection: string
  sections: string[]
  onAdd: (data: AddItemData) => void
  onCancel: () => void
}

export interface AddItemData {
  item_type: FloorPlanItemType
  number?: string
  capacity?: number
  section?: string
  shape: FloorPlanShape
}

const SHAPE_ICONS: Record<FloorPlanShape, React.ReactNode> = {
  square: <Square size={20} />,
  round: <Circle size={20} />,
  rectangle: <Minus size={20} />,
}

export function FloorPlanAddForm({ itemType, activeSection, sections, onAdd, onCancel }: FloorPlanAddFormProps) {
  const cfg = ITEM_TYPE_CONFIGS[itemType]
  const [number, setNumber] = useState('')
  const [capacity, setCapacity] = useState(itemType === 'bar' ? 4 : 2)
  const [section, setSection] = useState(activeSection)
  const [shape, setShape] = useState<FloorPlanShape>(cfg.defaultShape)

  useEffect(() => { setSection(activeSection) }, [activeSection])

  const handleSubmit = () => {
    if (itemType === 'table' && !number.trim()) {
      alert('Table number is required'); return
    }
    onAdd({
      item_type: itemType,
      ...(cfg.hasCapacity ? { capacity } : {}),
      ...(itemType === 'table' ? { number: number.trim(), section } : {}),
      shape,
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-[var(--onyx-surface)] rounded-xl border-2 border-[var(--color-gold)]/30">
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <FloorPlanItemIcon itemType={itemType} size={18} />
          <h4 className="text-base font-bold text-white">New {cfg.label}</h4>
        </div>
        <button className="text-sm text-[var(--theme-text-muted)] hover:text-white transition-colors" onClick={onCancel}>Cancel</button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {/* Table-specific: number + section */}
        {itemType === 'table' && (
          <>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Table Number</label>
              <input type="text" aria-label="Table Number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="e.g. 1, A1, T5..." autoFocus className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 placeholder:text-[var(--theme-text-muted)]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Section</label>
              <select aria-label="Section" value={section} onChange={(e) => setSection(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20">
                {sections.map(s => <option key={s} value={s}>{FLOOR_SECTIONS.find(f => f.value === s)?.label || s}</option>)}
              </select>
            </div>
          </>
        )}

        {/* Capacity (table + bar) */}
        {cfg.hasCapacity && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Capacity</label>
            <input type="number" aria-label="Capacity" min="1" max="30" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || 2)} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20" />
          </div>
        )}

        {/* Shape picker */}
        <div className="space-y-1.5 col-span-full">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Shape</label>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2">
            {TABLE_SHAPES.map(s => (
              <button key={s.value} type="button" className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${shape === s.value ? 'bg-[var(--color-gold)]/10 border-[var(--color-gold)] text-[var(--color-gold)]' : 'bg-black/20 border-transparent text-[var(--theme-text-muted)] hover:text-white hover:border-white/10'}`} onClick={() => setShape(s.value)}>
                {SHAPE_ICONS[s.value]}
                <span className="text-sm">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:opacity-90" onClick={handleSubmit}>
          <Plus size={16} /> Create {cfg.label}
        </button>
      </div>
    </div>
  )
}

export default FloorPlanAddForm
