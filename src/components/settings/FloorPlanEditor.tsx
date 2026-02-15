import { useState, useEffect, useRef } from 'react'
import { Plus, Grid, Users, Circle, Square, Minus, Home, Sun, Star, Palmtree, Fence, Wine, DoorOpen, Palette } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { logError } from '@/utils/logger'
import type { Insertable } from '../../types/database'
import { FloorPlanToolbar, FloorPlanDetailsPanel } from './floor-plan'

export interface FloorPlanItem {
    id: string
    type: 'table' | 'decoration'
    number?: string
    capacity?: number
    section?: string
    status?: 'available' | 'occupied' | 'reserved'
    shape: 'square' | 'round' | 'rectangle'
    decoration_type?: 'plant' | 'wall' | 'bar' | 'entrance'
    x: number
    y: number
    width?: number
    height?: number
    rotation?: number
    color?: string
    floor?: number
}

const TABLE_SHAPES = [
    { value: 'square' as const, label: 'Square', icon: <Square size={20} /> },
    { value: 'round' as const, label: 'Round', icon: <Circle size={20} /> },
    { value: 'rectangle' as const, label: 'Rectangle', icon: <Minus size={20} /> }
]

const DECORATION_TYPE_ICONS: Record<string, React.ReactNode> = {
    plant: <Palmtree size={18} className="text-emerald-500" />,
    wall: <Fence size={18} className="text-stone-400" />,
    bar: <Wine size={18} className="text-amber-500" />,
    entrance: <DoorOpen size={18} className="text-blue-400" />,
}

const DECORATION_TYPES = [
    { value: 'plant' as const, label: 'Plant' },
    { value: 'wall' as const, label: 'Wall' },
    { value: 'bar' as const, label: 'Bar' },
    { value: 'entrance' as const, label: 'Entrance' }
]

const FLOOR_SECTIONS = [
    { value: 'Main', label: 'Indoor', icon: <Home size={18} /> },
    { value: 'Terrace', label: 'Terrace', icon: <Sun size={18} /> },
    { value: 'VIP', label: 'VIP', icon: <Star size={18} /> }
]

export default function FloorPlanEditor() {
    const [items, setItems] = useState<FloorPlanItem[]>([])
    const [sections] = useState<string[]>(['Main', 'Terrace', 'VIP'])
    const [activeSection, setActiveSection] = useState<string>('Main')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [selectedItem, setSelectedItem] = useState<FloorPlanItem | null>(null)
    const [showAddMenu, setShowAddMenu] = useState(false)
    const [addMode, setAddMode] = useState<'table' | 'decoration' | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [draggedItem, setDraggedItem] = useState<FloorPlanItem | null>(null)
    const [isResizing, setIsResizing] = useState(false)
    const [resizeDirection, setResizeDirection] = useState<string | null>(null)
    const canvasRef = useRef<HTMLDivElement>(null)

    const [tableForm, setTableForm] = useState<{
        number: string; capacity: number; section: string; shape: 'square' | 'round' | 'rectangle'
    }>({ number: '', capacity: 2, section: activeSection, shape: 'square' })

    useEffect(() => {
        setTableForm(prev => ({ ...prev, section: activeSection }))
    }, [activeSection])

    const [decorationForm, setDecorationForm] = useState<{
        decoration_type: 'plant' | 'wall' | 'bar' | 'entrance'; shape: 'square' | 'round' | 'rectangle'
    }>({ decoration_type: 'plant', shape: 'square' })

    useEffect(() => { fetchItems() }, [])

    const fetchItems = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase.from('floor_plan_items').select('*').order('created_at')
            if (error) throw error
            if (data) setItems(data as FloorPlanItem[])
        } catch (error) { logError('Error fetching floor plan items:', error) }
        finally { setLoading(false) }
    }

    const handleSaveFloorPlan = async () => {
        setSaving(true)
        try {
            const { error } = await supabase.from('floor_plan_items').upsert(items)
            if (error) throw error
            alert('Floor plan saved successfully!')
        } catch (error) { logError('Error saving floor plan:', error); alert('Error saving floor plan') }
        finally { setSaving(false) }
    }

    const handleAddTable = async () => {
        if (!tableForm.number.trim()) { alert('Table number is required'); return }
        const newTable = {
            item_type: 'table', name: `Table ${tableForm.number}`, table_number: tableForm.number,
            capacity: tableForm.capacity, zone: tableForm.section, is_available: true, shape: tableForm.shape,
            x_position: 50, y_position: 50, width: tableForm.shape === 'rectangle' ? 120 : 80, height: 80
        }
        try {
            const tableData = newTable as Insertable<'floor_plan_items'>
            const { data, error } = await supabase.from('floor_plan_items').insert(tableData).select().single()
            if (error) throw error
            if (data) { setItems([...items, data as FloorPlanItem]); setAddMode(null); setTableForm({ number: '', capacity: 2, section: 'Main', shape: 'square' }) }
        } catch (error) { logError('Error adding table:', error); alert('Error adding table: ' + (error instanceof Error ? error.message : String(error))) }
    }

    const handleAddDecoration = async () => {
        const newDecoration = {
            item_type: 'decoration', name: `Decoration ${decorationForm.decoration_type}`, shape: decorationForm.shape,
            x_position: 50, y_position: 50,
            width: decorationForm.decoration_type === 'wall' ? 150 : 60, height: decorationForm.decoration_type === 'wall' ? 20 : 60,
            metadata: { decoration_type: decorationForm.decoration_type }
        }
        try {
            const decorationData = newDecoration as Insertable<'floor_plan_items'>
            const { data, error } = await supabase.from('floor_plan_items').insert(decorationData).select().single()
            if (error) throw error
            if (data) { setItems([...items, data as FloorPlanItem]); setAddMode(null); setDecorationForm({ decoration_type: 'plant', shape: 'square' }) }
        } catch (error) { logError('Error adding decoration:', error); alert('Error adding decoration: ' + (error instanceof Error ? error.message : String(error))) }
    }

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return
        try {
            const { error } = await supabase.from('floor_plan_items').delete().eq('id', itemId)
            if (error) throw error
            setItems(items.filter(i => i.id !== itemId)); setSelectedItem(null)
        } catch (error) { logError('Error deleting item:', error); alert('Error deleting item') }
    }

    const handleItemDragStart = (item: FloorPlanItem) => { setDraggedItem(item); setIsDragging(true) }

    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!canvasRef.current) return
        const rect = canvasRef.current.getBoundingClientRect()
        if (isResizing && selectedItem && resizeDirection) {
            const mouseX = e.clientX - rect.left; const mouseY = e.clientY - rect.top
            const itemX = (selectedItem.x / 100) * rect.width; const itemY = (selectedItem.y / 100) * rect.height
            let newWidth = selectedItem.width || 80; let newHeight = selectedItem.height || 80
            if (resizeDirection.includes('e')) newWidth = Math.max(40, Math.min(200, mouseX - itemX + (selectedItem.width || 80) / 2))
            if (resizeDirection.includes('w')) newWidth = Math.max(40, Math.min(200, itemX - mouseX + (selectedItem.width || 80) / 2))
            if (resizeDirection.includes('s')) newHeight = Math.max(40, Math.min(200, mouseY - itemY + (selectedItem.height || 80) / 2))
            if (resizeDirection.includes('n')) newHeight = Math.max(40, Math.min(200, itemY - mouseY + (selectedItem.height || 80) / 2))
            setItems(items.map(i => i.id === selectedItem.id ? { ...i, width: Math.round(newWidth), height: Math.round(newHeight) } : i))
            setSelectedItem({ ...selectedItem, width: Math.round(newWidth), height: Math.round(newHeight) })
            return
        }
        if (!isDragging || !draggedItem) return
        const x = ((e.clientX - rect.left) / rect.width) * 100; const y = ((e.clientY - rect.top) / rect.height) * 100
        setItems(items.map(i => i.id === draggedItem.id ? { ...i, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) } : i))
    }

    const handleCanvasMouseUp = () => { setIsDragging(false); setDraggedItem(null); setIsResizing(false); setResizeDirection(null) }

    const handleResizeStart = (e: React.MouseEvent, direction: string) => { e.stopPropagation(); e.preventDefault(); setIsResizing(true); setResizeDirection(direction) }

    const handleEditItemSize = (itemId: string, width: number, height: number) => {
        setItems(items.map(i => i.id === itemId ? { ...i, width, height } : i))
        if (selectedItem && selectedItem.id === itemId) setSelectedItem({ ...selectedItem, width, height })
    }

    const filteredItems = items.filter(item => item.type === 'decoration' || item.section === activeSection)

    const handleEditItemCapacity = (itemId: string, newCapacity: number) => {
        setItems(items.map(i => i.id === itemId ? { ...i, capacity: newCapacity } : i))
    }

    const handleEditItemRotation = (itemId: string, rotation: number) => {
        setItems(items.map(i => i.id === itemId ? { ...i, rotation } : i))
        if (selectedItem && selectedItem.id === itemId) setSelectedItem({ ...selectedItem, rotation })
    }

    const handleEditItemColor = (itemId: string, color: string) => {
        setItems(items.map(i => i.id === itemId ? { ...i, color } : i))
        if (selectedItem && selectedItem.id === itemId) setSelectedItem({ ...selectedItem, color })
    }

    const getItemStyle = (item: FloorPlanItem): React.CSSProperties => ({
        left: `${item.x}%`, top: `${item.y}%`,
        width: item.width ? `${item.width}px` : '80px', height: item.height ? `${item.height}px` : '80px',
        ...(item.rotation ? { transform: `translate(-50%, -50%) rotate(${item.rotation}deg)` } : {}),
        ...(item.color ? { borderColor: item.color } : {}),
    })

    const tables = items.filter(i => i.type === 'table')
    const decorations = items.filter(i => i.type === 'decoration')
    const totalCovers = tables.reduce((sum, t) => sum + (t.capacity || 0), 0)

    return (
        <div className="flex flex-col gap-5">
            {/* Toolbar */}
            <FloorPlanToolbar
                tables={tables.length}
                totalCovers={totalCovers}
                decorations={decorations.length}
                saving={saving}
                showAddMenu={showAddMenu}
                onToggleAddMenu={() => setShowAddMenu(!showAddMenu)}
                onAddTable={() => { setAddMode('table'); setShowAddMenu(false) }}
                onAddDecoration={() => { setAddMode('decoration'); setShowAddMenu(false) }}
                onSave={handleSaveFloorPlan}
            />

            {/* Table Form */}
            {addMode === 'table' && (
                <div className="flex flex-col gap-4 p-4 bg-[var(--onyx-surface)] rounded-xl border-2 border-[var(--color-gold)]/30">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <h4 className="text-base font-bold text-white">New Table</h4>
                        <button className="text-sm text-[var(--theme-text-muted)] hover:text-white transition-colors" onClick={() => setAddMode(null)}>Cancel</button>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Table Number</label>
                            <input type="text" aria-label="Table Number" value={tableForm.number} onChange={(e) => setTableForm({ ...tableForm, number: e.target.value })} placeholder="e.g. 1, A1, T5..." autoFocus className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 placeholder:text-[var(--theme-text-muted)]" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Capacity</label>
                            <input type="number" aria-label="Capacity" min="1" max="20" value={tableForm.capacity} onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) || 2 })} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Section</label>
                            <select aria-label="Section" value={tableForm.section} onChange={(e) => setTableForm({ ...tableForm, section: e.target.value })} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20">
                                {sections.map(section => <option key={section} value={section}>{section}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5 col-span-full">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Table Shape</label>
                            <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
                                {TABLE_SHAPES.map(shape => (
                                    <button key={shape.value} type="button" className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${tableForm.shape === shape.value ? 'bg-[var(--color-gold)]/10 border-[var(--color-gold)] text-[var(--color-gold)]' : 'bg-black/20 border-transparent text-[var(--theme-text-muted)] hover:text-white hover:border-white/10'}`} onClick={() => setTableForm({ ...tableForm, shape: shape.value })}>
                                        {shape.icon}
                                        <span className="text-sm">{shape.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:opacity-90" onClick={handleAddTable}>
                            <Plus size={16} /> Create Table
                        </button>
                    </div>
                </div>
            )}

            {/* Decoration Form */}
            {addMode === 'decoration' && (
                <div className="flex flex-col gap-4 p-4 bg-[var(--onyx-surface)] rounded-xl border-2 border-[var(--color-gold)]/30">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <h4 className="text-base font-bold text-white">New Decoration Element</h4>
                        <button className="text-sm text-[var(--theme-text-muted)] hover:text-white transition-colors" onClick={() => setAddMode(null)}>Cancel</button>
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Element Type</label>
                            <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
                                {DECORATION_TYPES.map(deco => (
                                    <button key={deco.value} type="button" className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${decorationForm.decoration_type === deco.value ? 'bg-[var(--color-gold)]/10 border-[var(--color-gold)] text-[var(--color-gold)]' : 'bg-black/20 border-transparent text-[var(--theme-text-muted)] hover:text-white hover:border-white/10'}`} onClick={() => setDecorationForm({ ...decorationForm, decoration_type: deco.value })}>
                                        <span className="text-2xl">{DECORATION_TYPE_ICONS[deco.value]}</span>
                                        <span className="text-sm">{deco.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:opacity-90" onClick={handleAddDecoration}>
                            <Plus size={16} /> Add
                        </button>
                    </div>
                </div>
            )}

            {/* Section Tabs */}
            <div className="flex gap-2 p-2 bg-[var(--onyx-surface)] rounded-xl border border-white/5">
                {FLOOR_SECTIONS.map(section => {
                    const sectionTables = items.filter(i => i.type === 'table' && i.section === section.value)
                    const sectionCovers = sectionTables.reduce((sum, t) => sum + (t.capacity || 0), 0)
                    return (
                        <button key={section.value} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${activeSection === section.value ? 'bg-[var(--color-gold)]/10 border-[var(--color-gold)] text-[var(--color-gold)]' : 'border-transparent text-[var(--theme-text-muted)] hover:text-white hover:bg-white/[0.02]'}`}
                            onClick={() => { setActiveSection(section.value); setSelectedItem(null) }}>
                            {section.icon}
                            <span className="font-semibold">{section.label}</span>
                            <span className={`text-xs ml-1 ${activeSection === section.value ? 'text-[var(--color-gold)]/70' : 'text-[var(--theme-text-muted)]'}`}>{sectionTables.length} tables / {sectionCovers} covers</span>
                        </button>
                    )
                })}
            </div>

            {/* Canvas + Details */}
            <div className="grid grid-cols-[1fr_300px] gap-5 min-h-[600px]">
                <div ref={canvasRef} className="relative bg-black/40 border-2 border-white/5 rounded-xl cursor-crosshair overflow-hidden" onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUp} onMouseLeave={handleCanvasMouseUp}>
                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--theme-text-muted)] gap-3">
                            <div className="w-6 h-6 border-2 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
                            Loading floor plan...
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--theme-text-muted)] gap-3">
                            <Grid size={48} className="opacity-20" />
                            <h3 className="text-white/40 font-semibold">No elements in "{FLOOR_SECTIONS.find(s => s.value === activeSection)?.label}"</h3>
                            <p className="text-sm">Click "Add Element" to get started</p>
                        </div>
                    ) : (
                        <>
                            {/* Decorations */}
                            {filteredItems.filter(i => i.type === 'decoration').map(item => (
                                <div key={item.id} className={`absolute flex items-center justify-center bg-purple-500/15 border-2 border-dashed rounded-lg -translate-x-1/2 -translate-y-1/2 cursor-move select-none transition-all ${selectedItem?.id === item.id ? 'border-[var(--color-gold)] border-solid shadow-[0_0_20px_rgba(139,92,246,0.3)] opacity-100 z-20' : 'border-white/10 opacity-80 hover:border-[var(--color-gold)]/50 hover:opacity-100 z-10'} ${isDragging && draggedItem?.id === item.id ? 'opacity-50 cursor-grabbing z-30' : ''}`}
                                    style={getItemStyle(item)} onMouseDown={(e) => { e.stopPropagation(); handleItemDragStart(item) }} onClick={(e) => { e.stopPropagation(); setSelectedItem(item) }}>
                                    <span className="text-[32px]">{DECORATION_TYPE_ICONS[item.decoration_type || ''] || <Palette size={18} />}</span>
                                    {selectedItem?.id === item.id && (
                                        <>
                                            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--color-gold)] border-2 border-white rounded-full cursor-e-resize z-[100]" onMouseDown={(e) => handleResizeStart(e, 'e')} />
                                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--color-gold)] border-2 border-white rounded-full cursor-s-resize z-[100]" onMouseDown={(e) => handleResizeStart(e, 's')} />
                                            <div className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-[var(--color-gold)] border-2 border-white rounded-full cursor-se-resize z-[100]" onMouseDown={(e) => handleResizeStart(e, 'se')} />
                                        </>
                                    )}
                                </div>
                            ))}

                            {/* Tables */}
                            {filteredItems.filter(i => i.type === 'table').map(item => (
                                <div key={item.id} className={`absolute flex flex-col items-center justify-center gap-0.5 bg-emerald-500/20 border-2 border-emerald-500 -translate-x-1/2 -translate-y-1/2 cursor-move select-none transition-all ${item.shape === 'round' ? 'rounded-full' : 'rounded-lg'} ${selectedItem?.id === item.id ? 'bg-[var(--color-gold)]/30 border-[var(--color-gold)] shadow-[0_0_20px_rgba(var(--color-gold-rgb),0.5)] z-20' : 'hover:bg-emerald-500/30 hover:scale-105 z-10'} ${isDragging && draggedItem?.id === item.id ? 'opacity-70 cursor-grabbing z-30' : ''}`}
                                    style={getItemStyle(item)} onMouseDown={(e) => { e.stopPropagation(); handleItemDragStart(item) }} onClick={(e) => { e.stopPropagation(); setSelectedItem(item) }}>
                                    <div className="text-base font-bold text-white">T{item.number}</div>
                                    <div className="text-xs text-white/60 flex items-center gap-1"><Users size={10} /> {item.capacity}</div>
                                    {selectedItem?.id === item.id && (
                                        <>
                                            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--color-gold)] border-2 border-white rounded-full cursor-e-resize z-[100]" onMouseDown={(e) => handleResizeStart(e, 'e')} />
                                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--color-gold)] border-2 border-white rounded-full cursor-s-resize z-[100]" onMouseDown={(e) => handleResizeStart(e, 's')} />
                                            <div className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-[var(--color-gold)] border-2 border-white rounded-full cursor-se-resize z-[100]" onMouseDown={(e) => handleResizeStart(e, 'se')} />
                                        </>
                                    )}
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* Item Details Panel */}
                {selectedItem ? (
                    <FloorPlanDetailsPanel
                        item={selectedItem}
                        onDelete={handleDeleteItem}
                        onEditCapacity={handleEditItemCapacity}
                        onEditSize={handleEditItemSize}
                        onEditRotation={handleEditItemRotation}
                        onEditColor={handleEditItemColor}
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
                    <li><strong className="text-[var(--color-gold)]">Add:</strong> Click "Add Element" and choose between Table or Decoration</li>
                    <li><strong className="text-[var(--color-gold)]">Table shapes:</strong> Choose between square, round or rectangle as needed</li>
                    <li><strong className="text-[var(--color-gold)]">Decorations:</strong> Add plants, walls, bars or entrances to structure your room</li>
                    <li><strong className="text-[var(--color-gold)]">Move:</strong> Click and hold on an element, then drag it</li>
                    <li><strong className="text-[var(--color-gold)]">Edit:</strong> Click on an element to see details and edit</li>
                    <li><strong className="text-[var(--color-gold)]">Save:</strong> Don't forget to click "Save Floor Plan" to save</li>
                </ul>
            </div>
        </div>
    )
}
