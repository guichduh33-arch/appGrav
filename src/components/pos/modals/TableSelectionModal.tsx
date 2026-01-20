import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import './TableSelectionModal.css'

interface Table {
    id: string
    number: string
    capacity: number
    section: string
    status: 'available' | 'occupied' | 'reserved'
    x?: number
    y?: number
}

interface TableSelectionModalProps {
    onSelectTable: (tableNumber: string) => void
    onClose: () => void
}

export default function TableSelectionModal({ onSelectTable, onClose: _onClose }: TableSelectionModalProps) {
    const [selectedSection, setSelectedSection] = useState<string>('all')
    const [selectedTable, setSelectedTable] = useState<string | null>(null)
    const [tables, setTables] = useState<Table[]>([])
    const [_loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTables()
    }, [])

    const fetchTables = async () => {
        try {
            const { data, error } = await supabase
                .from('floor_plan_items')
                .select('*')
                .eq('type', 'table')
                .order('number')

            if (error) throw error
            if (data) {
                setTables(data)
            }
        } catch (error) {
            console.error('Error fetching tables:', error)
        } finally {
            setLoading(false)
        }
    }

    const sections = ['all', ...Array.from(new Set(tables.map(t => t.section)))]

    const filteredTables = selectedSection === 'all'
        ? tables
        : tables.filter(t => t.section === selectedSection)

    const handleTableClick = (table: Table) => {
        if (table.status === 'available') {
            setSelectedTable(table.number)
        }
    }

    const handleConfirm = () => {
        if (selectedTable) {
            onSelectTable(selectedTable)
        }
    }

    return (
        <div className="modal-backdrop is-active">
            <div className="modal modal-lg is-active" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="modal__header">
                    <div>
                        <h2 className="modal__title">
                            <Users size={24} />
                            Sélectionner une Table
                        </h2>
                        <p className="modal__subtitle">Choisissez une table disponible pour cette commande (obligatoire)</p>
                    </div>
                </div>

                {/* Body */}
                <div className="modal__body">
                    {/* Section Selector */}
                    <div className="table-selection__sections">
                        {sections.map(section => (
                            <button
                                key={section}
                                className={`section-btn ${selectedSection === section ? 'is-active' : ''}`}
                                onClick={() => setSelectedSection(section)}
                            >
                                {section === 'all' ? 'Toutes' : section}
                            </button>
                        ))}
                    </div>

                    {/* Floor Plan View */}
                    <div className="table-selection__floor-plan">
                        {filteredTables.map(table => (
                            <div
                                key={table.id}
                                className={`table-item table-item--${table.status} ${selectedTable === table.number ? 'is-selected' : ''}`}
                                style={{
                                    left: `${table.x}%`,
                                    top: `${table.y}%`,
                                }}
                                onClick={() => handleTableClick(table)}
                            >
                                <div className="table-item__number">T{table.number}</div>
                                <div className="table-item__capacity">
                                    <Users size={12} /> {table.capacity}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="table-selection__legend">
                        <div className="legend-item">
                            <span className="legend-dot legend-dot--available"></span>
                            Disponible
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot legend-dot--occupied"></span>
                            Occupée
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot legend-dot--reserved"></span>
                            Réservée
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal__footer">
                    <button
                        className="btn btn-primary-lg"
                        onClick={handleConfirm}
                        disabled={!selectedTable}
                    >
                        Confirmer Table {selectedTable}
                    </button>
                </div>
            </div>
        </div>
    )
}
