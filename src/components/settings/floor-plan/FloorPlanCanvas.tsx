import { useRef, useState } from 'react'
import { Users, Grid } from 'lucide-react'
import { FloorPlanItemIcon } from './FloorPlanItemIcon'
import type { FloorPlanItem } from './floorPlanConstants'
import { ITEM_TYPE_CONFIGS, FLOOR_SECTIONS } from './floorPlanConstants'

interface FloorPlanCanvasProps {
  items: FloorPlanItem[]
  loading: boolean
  activeSection: string
  selectedItem: FloorPlanItem | null
  onSelectItem: (item: FloorPlanItem | null) => void
  onMoveItem: (id: string, x: number, y: number) => void
  onResizeItem: (id: string, width: number, height: number) => void
}

export function FloorPlanCanvas({
  items, loading, activeSection, selectedItem,
  onSelectItem, onMoveItem, onResizeItem,
}: FloorPlanCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedItem, setDraggedItem] = useState<FloorPlanItem | null>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDir, setResizeDir] = useState<string | null>(null)

  const filteredItems = items.filter(
    i => i.item_type !== 'table' || i.section === activeSection
  )

  const handleDragStart = (item: FloorPlanItem) => {
    setDraggedItem(item); setIsDragging(true)
  }

  const handleResizeStart = (e: React.MouseEvent, dir: string) => {
    e.stopPropagation(); e.preventDefault()
    setIsResizing(true); setResizeDir(dir)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    if (isResizing && selectedItem && resizeDir) {
      const mx = e.clientX - rect.left, my = e.clientY - rect.top
      const ix = (selectedItem.x / 100) * rect.width
      const iy = (selectedItem.y / 100) * rect.height
      let w = selectedItem.width || 80, h = selectedItem.height || 80
      if (resizeDir.includes('e')) w = Math.max(40, Math.min(300, mx - ix + w / 2))
      if (resizeDir.includes('w')) w = Math.max(40, Math.min(300, ix - mx + w / 2))
      if (resizeDir.includes('s')) h = Math.max(8, Math.min(300, my - iy + h / 2))
      if (resizeDir.includes('n')) h = Math.max(8, Math.min(300, iy - my + h / 2))
      onResizeItem(selectedItem.id, Math.round(w), Math.round(h))
      return
    }
    if (!isDragging || !draggedItem) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    onMoveItem(draggedItem.id, Math.max(5, Math.min(95, x)), Math.max(5, Math.min(95, y)))
  }

  const handleMouseUp = () => {
    setIsDragging(false); setDraggedItem(null)
    setIsResizing(false); setResizeDir(null)
  }

  const getStyle = (item: FloorPlanItem): React.CSSProperties => ({
    left: `${item.x}%`, top: `${item.y}%`,
    width: item.width ? `${item.width}px` : '80px',
    height: item.height ? `${item.height}px` : '80px',
    ...(item.rotation ? { transform: `translate(-50%, -50%) rotate(${item.rotation}deg)` } : {}),
    ...(item.color ? { borderColor: item.color } : {}),
  })

  const resizeHandles = (
    <>
      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--color-gold)] border-2 border-white rounded-full cursor-e-resize z-[100]" onMouseDown={(e) => handleResizeStart(e, 'e')} />
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--color-gold)] border-2 border-white rounded-full cursor-s-resize z-[100]" onMouseDown={(e) => handleResizeStart(e, 's')} />
      <div className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-[var(--color-gold)] border-2 border-white rounded-full cursor-se-resize z-[100]" onMouseDown={(e) => handleResizeStart(e, 'se')} />
    </>
  )

  const sectionLabel = FLOOR_SECTIONS.find(s => s.value === activeSection)?.label

  return (
    <div
      ref={canvasRef}
      className="relative bg-black/40 border-2 border-white/5 rounded-xl cursor-crosshair overflow-hidden"
      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
    >
      {loading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--theme-text-muted)] gap-3">
          <div className="w-6 h-6 border-2 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
          Loading floor plan...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--theme-text-muted)] gap-3">
          <Grid size={48} className="opacity-20" />
          <h3 className="text-white/40 font-semibold">No elements in &quot;{sectionLabel}&quot;</h3>
          <p className="text-sm">Click &quot;Add Element&quot; to get started</p>
        </div>
      ) : (
        filteredItems.map(item => {
          const cfg = ITEM_TYPE_CONFIGS[item.item_type] || ITEM_TYPE_CONFIGS.table
          const isSelected = selectedItem?.id === item.id
          const isDragged = isDragging && draggedItem?.id === item.id
          const isTable = item.item_type === 'table'
          const shapeClass = item.shape === 'round' ? 'rounded-full' : 'rounded-lg'

          return (
            <div
              key={item.id}
              className={`absolute flex flex-col items-center justify-center gap-0.5 ${cfg.bgClass} border-2 ${cfg.borderClass} -translate-x-1/2 -translate-y-1/2 cursor-move select-none transition-all ${shapeClass} ${isSelected ? 'border-[var(--color-gold)] shadow-[0_0_20px_rgba(var(--color-gold-rgb),0.4)] z-20' : 'hover:scale-105 z-10'} ${isDragged ? 'opacity-70 cursor-grabbing z-30' : ''}`}
              style={getStyle(item)}
              onMouseDown={(e) => { e.stopPropagation(); handleDragStart(item) }}
              onClick={(e) => { e.stopPropagation(); onSelectItem(item) }}
            >
              {isTable ? (
                <>
                  <div className="text-base font-bold text-white">T{item.number}</div>
                  <div className="text-xs text-white/60 flex items-center gap-1"><Users size={10} /> {item.capacity}</div>
                </>
              ) : (
                <FloorPlanItemIcon itemType={item.item_type} size={20} />
              )}
              {isSelected && resizeHandles}
            </div>
          )
        })
      )}
    </div>
  )
}

export default FloorPlanCanvas
