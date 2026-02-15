import { useState, useEffect } from 'react'
import { Home, Sun, Star } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { logError } from '@/utils/logger'
import type { Insertable } from '../../types/database'
import {
  FloorPlanToolbar, FloorPlanDetailsPanel, FloorPlanCanvas, FloorPlanAddForm,
  ITEM_TYPE_CONFIGS, FLOOR_SECTIONS,
} from './floor-plan'
import type { FloorPlanItem, FloorPlanItemType } from './floor-plan'
import type { AddItemData } from './floor-plan/FloorPlanAddForm'

// Re-export for backward compatibility
export type { FloorPlanItem }

const SECTION_ICONS: Record<string, React.ReactNode> = {
  Main: <Home size={18} />, Terrace: <Sun size={18} />, VIP: <Star size={18} />,
}

export default function FloorPlanEditor() {
  const [items, setItems] = useState<FloorPlanItem[]>([])
  const [sections] = useState<string[]>(['Main', 'Terrace', 'VIP'])
  const [activeSection, setActiveSection] = useState('Main')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedItem, setSelectedItem] = useState<FloorPlanItem | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [addMode, setAddMode] = useState<FloorPlanItemType | null>(null)

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('floor_plan_items').select('*').order('created_at')
      if (error) throw error
      if (data) setItems(data.map(mapDbToLocal))
    } catch (error) { logError('Error fetching floor plan items:', error) }
    finally { setLoading(false) }
  }

  /** Map DB row to local FloorPlanItem shape */
  const mapDbToLocal = (row: Record<string, unknown>): FloorPlanItem => ({
    id: row.id as string,
    item_type: (row.item_type as FloorPlanItemType) || 'table',
    number: row.table_number as string | undefined,
    capacity: row.capacity as number | undefined,
    section: row.zone as string | undefined,
    shape: (row.shape as FloorPlanItem['shape']) || 'square',
    x: (row.x_position as number) || 50,
    y: (row.y_position as number) || 50,
    width: row.width as number | undefined,
    height: row.height as number | undefined,
    rotation: row.rotation as number | undefined,
    color: row.color as string | undefined,
    floor: row.floor as number | undefined,
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from('floor_plan_items').upsert(items)
      if (error) throw error
      alert('Floor plan saved successfully!')
    } catch (error) { logError('Error saving floor plan:', error); alert('Error saving floor plan') }
    finally { setSaving(false) }
  }

  const handleAddItem = async (data: AddItemData) => {
    const cfg = ITEM_TYPE_CONFIGS[data.item_type]
    const dbRow = {
      item_type: data.item_type,
      name: data.item_type === 'table' ? `Table ${data.number}` : cfg.label,
      table_number: data.number || null,
      capacity: data.capacity || null,
      zone: data.section || null,
      is_available: true,
      shape: data.shape,
      x_position: 50, y_position: 50,
      width: cfg.defaultWidth, height: cfg.defaultHeight,
    }
    try {
      const insertData = dbRow as Insertable<'floor_plan_items'>
      const { data: row, error } = await supabase.from('floor_plan_items').insert(insertData).select().single()
      if (error) throw error
      if (row) { setItems([...items, mapDbToLocal(row as Record<string, unknown>)]); setAddMode(null) }
    } catch (error) {
      logError('Error adding item:', error)
      alert('Error adding item: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    try {
      const { error } = await supabase.from('floor_plan_items').delete().eq('id', itemId)
      if (error) throw error
      setItems(items.filter(i => i.id !== itemId)); setSelectedItem(null)
    } catch (error) { logError('Error deleting item:', error); alert('Error deleting item') }
  }

  const handleMove = (id: string, x: number, y: number) => {
    setItems(items.map(i => i.id === id ? { ...i, x, y } : i))
  }

  const handleResize = (id: string, width: number, height: number) => {
    setItems(items.map(i => i.id === id ? { ...i, width, height } : i))
    if (selectedItem?.id === id) setSelectedItem({ ...selectedItem, width, height })
  }

  const handleEditCapacity = (id: string, capacity: number) => {
    setItems(items.map(i => i.id === id ? { ...i, capacity } : i))
  }

  const handleEditRotation = (id: string, rotation: number) => {
    setItems(items.map(i => i.id === id ? { ...i, rotation } : i))
    if (selectedItem?.id === id) setSelectedItem({ ...selectedItem, rotation })
  }

  const handleEditColor = (id: string, color: string) => {
    setItems(items.map(i => i.id === id ? { ...i, color } : i))
    if (selectedItem?.id === id) setSelectedItem({ ...selectedItem, color })
  }

  const tables = items.filter(i => i.item_type === 'table')
  const nonTables = items.filter(i => i.item_type !== 'table')
  const totalCovers = tables.reduce((sum, t) => sum + (t.capacity || 0), 0)

  return (
    <div className="flex flex-col gap-5">
      <FloorPlanToolbar
        tables={tables.length} totalCovers={totalCovers} otherItems={nonTables.length}
        saving={saving} showAddMenu={showAddMenu}
        onToggleAddMenu={() => setShowAddMenu(!showAddMenu)}
        onAddItem={(type) => { setAddMode(type); setShowAddMenu(false) }}
        onSave={handleSave}
      />

      {addMode && (
        <FloorPlanAddForm
          itemType={addMode} activeSection={activeSection} sections={sections}
          onAdd={handleAddItem} onCancel={() => setAddMode(null)}
        />
      )}

      {/* Section Tabs */}
      <div className="flex gap-2 p-2 bg-[var(--onyx-surface)] rounded-xl border border-white/5">
        {FLOOR_SECTIONS.map(sec => {
          const secTables = items.filter(i => i.item_type === 'table' && i.section === sec.value)
          const secCovers = secTables.reduce((sum, t) => sum + (t.capacity || 0), 0)
          return (
            <button key={sec.value} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${activeSection === sec.value ? 'bg-[var(--color-gold)]/10 border-[var(--color-gold)] text-[var(--color-gold)]' : 'border-transparent text-[var(--theme-text-muted)] hover:text-white hover:bg-white/[0.02]'}`}
              onClick={() => { setActiveSection(sec.value); setSelectedItem(null) }}>
              {SECTION_ICONS[sec.value]}
              <span className="font-semibold">{sec.label}</span>
              <span className={`text-xs ml-1 ${activeSection === sec.value ? 'text-[var(--color-gold)]/70' : 'text-[var(--theme-text-muted)]'}`}>{secTables.length} tables / {secCovers} covers</span>
            </button>
          )
        })}
      </div>

      {/* Canvas + Details */}
      <div className="grid grid-cols-[1fr_300px] gap-5 min-h-[600px]">
        <FloorPlanCanvas
          items={items} loading={loading} activeSection={activeSection}
          selectedItem={selectedItem} onSelectItem={setSelectedItem}
          onMoveItem={handleMove} onResizeItem={handleResize}
        />

        {selectedItem ? (
          <FloorPlanDetailsPanel
            item={selectedItem} onDelete={handleDelete}
            onEditCapacity={handleEditCapacity} onEditSize={handleResize}
            onEditRotation={handleEditRotation} onEditColor={handleEditColor}
          />
        ) : (
          <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5 h-fit">
            <p className="text-sm text-[var(--theme-text-muted)] text-center">Select an element to see details</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-5 bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
        <h4 className="text-sm font-bold text-white mb-3">Instructions</h4>
        <ul className="space-y-1.5 text-sm text-[var(--theme-text-muted)]">
          <li><strong className="text-[var(--color-gold)]">Add:</strong> Click &quot;Add Element&quot; and choose Table, Wall, Bar, Counter, or Divider</li>
          <li><strong className="text-[var(--color-gold)]">Table shapes:</strong> Choose between square, round, or rectangle as needed</li>
          <li><strong className="text-[var(--color-gold)]">Structural items:</strong> Add walls, bars, counters, and dividers to structure your floor plan</li>
          <li><strong className="text-[var(--color-gold)]">Move:</strong> Click and hold on an element, then drag it</li>
          <li><strong className="text-[var(--color-gold)]">Edit:</strong> Click on an element to see details and edit</li>
          <li><strong className="text-[var(--color-gold)]">Save:</strong> Don&apos;t forget to click &quot;Save Floor Plan&quot; to save</li>
        </ul>
      </div>
    </div>
  )
}
