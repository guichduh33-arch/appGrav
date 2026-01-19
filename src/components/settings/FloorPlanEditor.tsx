import { useState, useEffect } from 'react'
import { Plus, Save, Trash2, Grid, Users, Circle, Square, Minus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './FloorPlanEditor.css'

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
}

const TABLE_SHAPES = [
    { value: 'square' as const, label: 'Carrée', icon: <Square size={20} /> },
    { value: 'round' as const, label: 'Ronde', icon: <Circle size={20} /> },
    { value: 'rectangle' as const, label: 'Rectangle', icon: <Minus size={20} /> }
]

const DECORATION_TYPES = [
    { value: 'plant' as const, label: '🌿 Plante', emoji: '🌿' },
    { value: 'wall' as const, label: '🧱 Mur', emoji: '🧱' },
    { value: 'bar' as const, label: '🍺 Bar', emoji: '🍺' },
    { value: 'entrance' as const, label: '🚪 Entrée', emoji: '🚪' }
]

export default function FloorPlanEditor() {
    const [items, setItems] = useState<FloorPlanItem[]>([])
    const [sections, setSections] = useState<string[]>(['Main', 'Terrace', 'VIP'])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [selectedItem, setSelectedItem] = useState<FloorPlanItem | null>(null)
    const [showAddMenu, setShowAddMenu] = useState(false)
    const [addMode, setAddMode] = useState<'table' | 'decoration' | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [draggedItem, setDraggedItem] = useState<FloorPlanItem | null>(null)

    // Form state for new table
    const [tableForm, setTableForm] = useState({
        number: '',
        capacity: 2,
        section: 'Main',
        shape: 'square' as const
    })

    // Form state for new decoration
    const [decorationForm, setDecorationForm] = useState({
        decoration_type: 'plant' as const,
        shape: 'square' as const
    })

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('floor_plan_items')
                .select('*')
                .order('created_at')

            if (error) throw error
            if (data) {
                setItems(data)
            }
        } catch (error) {
            console.error('Error fetching floor plan items:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveFloorPlan = async () => {
        setSaving(true)
        try {
            const { error } = await supabase
                .from('floor_plan_items')
                .upsert(items)

            if (error) throw error

            alert('Plan de salle sauvegardé avec succès!')
        } catch (error) {
            console.error('Error saving floor plan:', error)
            alert('Erreur lors de la sauvegarde')
        } finally {
            setSaving(false)
        }
    }

    const handleAddTable = async () => {
        if (!tableForm.number.trim()) {
            alert('Le numéro de table est requis')
            return
        }

        const newTable: Omit<FloorPlanItem, 'id'> = {
            type: 'table',
            number: tableForm.number,
            capacity: tableForm.capacity,
            section: tableForm.section,
            status: 'available',
            shape: tableForm.shape,
            x: 50,
            y: 50,
            width: tableForm.shape === 'rectangle' ? 120 : 80,
            height: 80
        }

        try {
            const { data, error } = await supabase
                .from('floor_plan_items')
                .insert(newTable)
                .select()
                .single()

            if (error) throw error
            if (data) {
                setItems([...items, data])
                setAddMode(null)
                setTableForm({ number: '', capacity: 2, section: 'Main', shape: 'square' })
            }
        } catch (error: any) {
            console.error('Error adding table:', error)
            alert('Erreur lors de l\'ajout: ' + error.message)
        }
    }

    const handleAddDecoration = async () => {
        const newDecoration: Omit<FloorPlanItem, 'id'> = {
            type: 'decoration',
            decoration_type: decorationForm.decoration_type,
            shape: decorationForm.shape,
            x: 50,
            y: 50,
            width: decorationForm.decoration_type === 'wall' ? 150 : 60,
            height: decorationForm.decoration_type === 'wall' ? 20 : 60
        }

        try {
            const { data, error } = await supabase
                .from('floor_plan_items')
                .insert(newDecoration)
                .select()
                .single()

            if (error) throw error
            if (data) {
                setItems([...items, data])
                setAddMode(null)
                setDecorationForm({ decoration_type: 'plant', shape: 'square' })
            }
        } catch (error: any) {
            console.error('Error adding decoration:', error)
            alert('Erreur lors de l\'ajout: ' + error.message)
        }
    }

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
            return
        }

        try {
            const { error } = await supabase
                .from('floor_plan_items')
                .delete()
                .eq('id', itemId)

            if (error) throw error

            setItems(items.filter(i => i.id !== itemId))
            setSelectedItem(null)
        } catch (error) {
            console.error('Error deleting item:', error)
            alert('Erreur lors de la suppression')
        }
    }

    const handleItemDragStart = (item: FloorPlanItem) => {
        setDraggedItem(item)
        setIsDragging(true)
    }

    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !draggedItem) return

        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        setItems(items.map(i =>
            i.id === draggedItem.id
                ? { ...i, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
                : i
        ))
    }

    const handleCanvasMouseUp = () => {
        setIsDragging(false)
        setDraggedItem(null)
    }

    const handleEditItemCapacity = (itemId: string, newCapacity: number) => {
        setItems(items.map(i =>
            i.id === itemId ? { ...i, capacity: newCapacity } : i
        ))
    }

    const getItemStyle = (item: FloorPlanItem) => {
        const baseStyle = {
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: item.width ? `${item.width}px` : '80px',
            height: item.height ? `${item.height}px` : '80px'
        }

        if (item.type === 'decoration') {
            return baseStyle
        }

        return baseStyle
    }

    const tables = items.filter(i => i.type === 'table')
    const decorations = items.filter(i => i.type === 'decoration')
    const totalCovers = tables.reduce((sum, t) => sum + (t.capacity || 0), 0)

    return (
        <div className="floor-plan-editor">
            {/* Toolbar */}
            <div className="floor-plan-editor__toolbar">
                <div className="floor-plan-editor__toolbar-left">
                    <div className="add-menu">
                        <button
                            className="btn-primary"
                            onClick={() => setShowAddMenu(!showAddMenu)}
                        >
                            <Plus size={18} />
                            Ajouter un Élément
                        </button>

                        {showAddMenu && (
                            <div className="add-menu__dropdown">
                                <button
                                    className="add-menu__item"
                                    onClick={() => {
                                        setAddMode('table')
                                        setShowAddMenu(false)
                                    }}
                                >
                                    <Grid size={18} />
                                    <div>
                                        <div className="add-menu__item-title">Table</div>
                                        <div className="add-menu__item-desc">Ajouter une table pour les clients</div>
                                    </div>
                                </button>
                                <button
                                    className="add-menu__item"
                                    onClick={() => {
                                        setAddMode('decoration')
                                        setShowAddMenu(false)
                                    }}
                                >
                                    <span style={{ fontSize: '18px' }}>🌿</span>
                                    <div>
                                        <div className="add-menu__item-title">Décoration</div>
                                        <div className="add-menu__item-desc">Plante, mur, bar, etc.</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="floor-plan-stats">
                        <div className="floor-plan-stat">
                            <Grid size={16} />
                            <span>{tables.length} tables</span>
                        </div>
                        <div className="floor-plan-stat">
                            <Users size={16} />
                            <span>{totalCovers} couverts</span>
                        </div>
                        <div className="floor-plan-stat">
                            <span style={{ fontSize: '16px' }}>🌿</span>
                            <span>{decorations.length} décorations</span>
                        </div>
                    </div>
                </div>

                <button
                    className="btn-success"
                    onClick={handleSaveFloorPlan}
                    disabled={saving}
                >
                    <Save size={18} />
                    {saving ? 'Sauvegarde...' : 'Sauvegarder le Plan'}
                </button>
            </div>

            {/* Table Form */}
            {addMode === 'table' && (
                <div className="floor-plan-form">
                    <div className="floor-plan-form__header">
                        <h4>Nouvelle Table</h4>
                        <button className="btn-text" onClick={() => setAddMode(null)}>Annuler</button>
                    </div>
                    <div className="floor-plan-form__body">
                        <div className="floor-plan-form__group">
                            <label>Numéro de Table</label>
                            <input
                                type="text"
                                value={tableForm.number}
                                onChange={(e) => setTableForm({ ...tableForm, number: e.target.value })}
                                placeholder="Ex: 1, A1, T5..."
                                autoFocus
                            />
                        </div>
                        <div className="floor-plan-form__group">
                            <label>Capacité</label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={tableForm.capacity}
                                onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) || 2 })}
                            />
                        </div>
                        <div className="floor-plan-form__group">
                            <label>Section</label>
                            <select
                                value={tableForm.section}
                                onChange={(e) => setTableForm({ ...tableForm, section: e.target.value })}
                            >
                                {sections.map(section => (
                                    <option key={section} value={section}>{section}</option>
                                ))}
                            </select>
                        </div>
                        <div className="floor-plan-form__group floor-plan-form__group--full">
                            <label>Forme de la Table</label>
                            <div className="shape-selector">
                                {TABLE_SHAPES.map(shape => (
                                    <button
                                        key={shape.value}
                                        type="button"
                                        className={`shape-btn ${tableForm.shape === shape.value ? 'is-active' : ''}`}
                                        onClick={() => setTableForm({ ...tableForm, shape: shape.value })}
                                    >
                                        {shape.icon}
                                        <span>{shape.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="btn-primary" onClick={handleAddTable}>
                            <Plus size={16} />
                            Créer la Table
                        </button>
                    </div>
                </div>
            )}

            {/* Decoration Form */}
            {addMode === 'decoration' && (
                <div className="floor-plan-form">
                    <div className="floor-plan-form__header">
                        <h4>Nouvel Élément de Décoration</h4>
                        <button className="btn-text" onClick={() => setAddMode(null)}>Annuler</button>
                    </div>
                    <div className="floor-plan-form__body">
                        <div className="floor-plan-form__group floor-plan-form__group--full">
                            <label>Type d'Élément</label>
                            <div className="decoration-selector">
                                {DECORATION_TYPES.map(deco => (
                                    <button
                                        key={deco.value}
                                        type="button"
                                        className={`decoration-btn ${decorationForm.decoration_type === deco.value ? 'is-active' : ''}`}
                                        onClick={() => setDecorationForm({ ...decorationForm, decoration_type: deco.value })}
                                    >
                                        <span className="decoration-btn__emoji">{deco.emoji}</span>
                                        <span>{deco.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="btn-primary" onClick={handleAddDecoration}>
                            <Plus size={16} />
                            Ajouter
                        </button>
                    </div>
                </div>
            )}

            {/* Canvas */}
            <div className="floor-plan-editor__content">
                <div
                    className="floor-plan-canvas"
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                >
                    {loading ? (
                        <div className="floor-plan-loading">
                            Chargement du plan de salle...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="floor-plan-empty">
                            <Grid size={48} opacity={0.3} />
                            <h3>Aucun élément configuré</h3>
                            <p>Cliquez sur "Ajouter un Élément" pour commencer</p>
                        </div>
                    ) : (
                        <>
                            {/* Decorations (rendered first, behind tables) */}
                            {decorations.map(item => {
                                const decorationType = DECORATION_TYPES.find(d => d.value === item.decoration_type)
                                return (
                                    <div
                                        key={item.id}
                                        className={`floor-plan-decoration ${selectedItem?.id === item.id ? 'is-selected' : ''} ${isDragging && draggedItem?.id === item.id ? 'is-dragging' : ''}`}
                                        style={getItemStyle(item)}
                                        onMouseDown={(e) => {
                                            e.stopPropagation()
                                            handleItemDragStart(item)
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedItem(item)
                                        }}
                                    >
                                        <span className="floor-plan-decoration__emoji">
                                            {decorationType?.emoji || '🎨'}
                                        </span>
                                    </div>
                                )
                            })}

                            {/* Tables */}
                            {tables.map(item => (
                                <div
                                    key={item.id}
                                    className={`floor-plan-table floor-plan-table--${item.shape} ${selectedItem?.id === item.id ? 'is-selected' : ''} ${isDragging && draggedItem?.id === item.id ? 'is-dragging' : ''}`}
                                    style={getItemStyle(item)}
                                    onMouseDown={(e) => {
                                        e.stopPropagation()
                                        handleItemDragStart(item)
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedItem(item)
                                    }}
                                >
                                    <div className="floor-plan-table__number">T{item.number}</div>
                                    <div className="floor-plan-table__capacity">
                                        <Users size={12} /> {item.capacity}
                                    </div>
                                    <div className="floor-plan-table__section">{item.section}</div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* Item Details Panel */}
                {selectedItem && (
                    <div className="floor-plan-details">
                        <div className="floor-plan-details__header">
                            <h3>
                                {selectedItem.type === 'table'
                                    ? `Table ${selectedItem.number}`
                                    : `Décoration ${DECORATION_TYPES.find(d => d.value === selectedItem.decoration_type)?.label || ''}`
                                }
                            </h3>
                            <button
                                className="btn-icon btn-icon--danger"
                                onClick={() => handleDeleteItem(selectedItem.id)}
                                title="Supprimer"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="floor-plan-details__body">
                            {selectedItem.type === 'table' ? (
                                <>
                                    <div className="floor-plan-details__field">
                                        <label>Forme</label>
                                        <span>{TABLE_SHAPES.find(s => s.value === selectedItem.shape)?.label}</span>
                                    </div>
                                    <div className="floor-plan-details__field">
                                        <label>Section</label>
                                        <span>{selectedItem.section}</span>
                                    </div>
                                    <div className="floor-plan-details__field">
                                        <label>Capacité</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={selectedItem.capacity || 2}
                                            onChange={(e) => handleEditItemCapacity(selectedItem.id, parseInt(e.target.value) || 2)}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="floor-plan-details__field">
                                    <label>Type</label>
                                    <span>{DECORATION_TYPES.find(d => d.value === selectedItem.decoration_type)?.label}</span>
                                </div>
                            )}
                            <div className="floor-plan-details__field">
                                <label>Position</label>
                                <span>X: {selectedItem.x.toFixed(0)}%, Y: {selectedItem.y.toFixed(0)}%</span>
                            </div>
                        </div>
                        <div className="floor-plan-details__hint">
                            💡 Cliquez et maintenez pour déplacer l'élément
                        </div>
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="floor-plan-instructions">
                <h4>Instructions</h4>
                <ul>
                    <li><strong>Ajouter:</strong> Cliquez sur "Ajouter un Élément" et choisissez entre Table ou Décoration</li>
                    <li><strong>Formes de tables:</strong> Choisissez entre carrée, ronde ou rectangle selon vos besoins</li>
                    <li><strong>Décorations:</strong> Ajoutez des plantes, murs, bars ou entrées pour structurer votre salle</li>
                    <li><strong>Déplacer:</strong> Cliquez et maintenez sur un élément, puis déplacez-le</li>
                    <li><strong>Modifier:</strong> Cliquez sur un élément pour voir les détails et modifier</li>
                    <li><strong>Sauvegarder:</strong> N'oubliez pas de cliquer sur "Sauvegarder le Plan" pour enregistrer</li>
                </ul>
            </div>
        </div>
    )
}
