import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { cn } from '@/lib/utils'

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

const TABLE_STATUS_STYLES = {
    available: 'bg-emerald-500/20 border-success hover:bg-emerald-500/30 hover:!-translate-x-1/2 hover:!-translate-y-1/2 hover:scale-110',
    occupied: 'bg-red-500/20 border-danger cursor-not-allowed opacity-60',
    reserved: 'bg-amber-500/20 border-warning cursor-not-allowed opacity-60',
} as const

export default function TableSelectionModal({ onSelectTable, onClose: _onClose }: TableSelectionModalProps) {
    const [selectedSection, setSelectedSection] = useState<string>('all')
    const [selectedTable, setSelectedTable] = useState<string | null>(null)
    const [tables, setTables] = useState<Table[]>([])
    const [, setLoading] = useState(true)

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
                setTables(data as Table[])
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
                            Select a Table
                        </h2>
                        <p className="modal__subtitle">Select an available table for this order (required)</p>
                    </div>
                </div>

                {/* Body */}
                <div className="modal__body">
                    {/* Section Selector */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {sections.map(section => (
                            <button
                                key={section}
                                className={cn(
                                    'px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 border-2',
                                    selectedSection === section
                                        ? 'bg-primary border-primary-light text-white'
                                        : 'bg-gray-700 border-transparent text-gray-300 hover:bg-gray-600 hover:text-white'
                                )}
                                onClick={() => setSelectedSection(section)}
                            >
                                {section === 'all' ? 'All' : section}
                            </button>
                        ))}
                    </div>

                    {/* Floor Plan View */}
                    <div className="relative w-full h-[400px] bg-gray-800 border-2 border-gray-700 rounded-xl mb-6">
                        {filteredTables.map(table => (
                            <div
                                key={table.id}
                                className={cn(
                                    'absolute w-20 h-20 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all duration-200 -translate-x-1/2 -translate-y-1/2 border-2',
                                    TABLE_STATUS_STYLES[table.status],
                                    selectedTable === table.number && 'bg-primary border-primary-light shadow-[0_0_20px_rgba(59,130,246,0.5)] !scale-115'
                                )}
                                style={{
                                    left: `${table.x}%`,
                                    top: `${table.y}%`,
                                }}
                                onClick={() => handleTableClick(table)}
                            >
                                <div className="text-lg font-bold text-white mb-1">T{table.number}</div>
                                <div className="text-xs text-gray-300 flex items-center gap-1">
                                    <Users size={12} /> {table.capacity}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex gap-6 justify-center p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <span className="w-4 h-4 rounded-full border-2 bg-emerald-500/30 border-success" />
                            Available
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <span className="w-4 h-4 rounded-full border-2 bg-red-500/30 border-danger" />
                            Occupied
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <span className="w-4 h-4 rounded-full border-2 bg-amber-500/30 border-warning" />
                            Reserved
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal__footer">
                    <button
                        className="btn btn-primary w-full"
                        onClick={handleConfirm}
                        disabled={!selectedTable}
                    >
                        Confirm Table {selectedTable}
                    </button>
                </div>
            </div>
        </div>
    )
}
