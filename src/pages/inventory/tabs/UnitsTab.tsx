import React, { useState } from 'react'
import { Plus, Trash2, Package, Scale, ClipboardList, ShoppingCart } from 'lucide-react'
import { Product, ProductUOM } from '../../../types/database'
import { supabase } from '../../../lib/supabase'
import { logError } from '@/utils/logger'

// Extended UOM type with UI-specific fields
interface ExtendedUOM extends ProductUOM {
    is_stock_opname_unit?: boolean
    is_consumption_unit?: boolean
}

interface UnitsTabProps {
    product: Product
    uoms: ProductUOM[]
    onProductChange: (product: Product) => void
    onAddUOM?: () => void
    onDeleteUOM: (id: string) => void
}

type UOMContext = 'stock_opname' | 'recipe' | 'purchase'

export const UnitsTab: React.FC<UnitsTabProps> = ({ product, uoms, onProductChange, onDeleteUOM }) => {
    const [showAddModal, setShowAddModal] = useState(false)
    const [newUOM, setNewUOM] = useState({ uom_name: '', uom_code: '', conversion_factor: 1 })
    const [saving, setSaving] = useState(false)

    const extendedUoms = uoms as ExtendedUOM[]

    const getContextUnit = (context: UOMContext): ExtendedUOM | null => {
        return extendedUoms.find(u => {
            if (context === 'stock_opname') return u.is_stock_opname_unit
            if (context === 'recipe') return u.is_consumption_unit
            if (context === 'purchase') return u.is_purchase_uom
            return false
        }) || null
    }

    const setContextUnit = async (context: UOMContext, uomId: string | null) => {
        setSaving(true)
        try {
            const field = context === 'stock_opname' ? 'is_stock_opname_unit'
                : context === 'recipe' ? 'is_consumption_unit'
                    : 'is_purchase_uom'

            await supabase
                .from('product_uoms')
                .update({ [field]: false })
                .eq('product_id', product.id)

            if (uomId) {
                await supabase
                    .from('product_uoms')
                    .update({ [field]: true })
                    .eq('id', uomId)
            }

            window.location.reload()
        } catch (error) {
            logError('Error setting context unit:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleAddUOM = async () => {
        if (!newUOM.uom_name || newUOM.conversion_factor <= 0) return
        setSaving(true)
        try {
            const { error } = await supabase
                .from('product_uoms')
                .insert({
                    product_id: product.id,
                    uom_name: newUOM.uom_name,
                    uom_code: newUOM.uom_code || newUOM.uom_name.substring(0, 10).toUpperCase(),
                    conversion_factor: newUOM.conversion_factor
                })

            if (error) throw error
            setShowAddModal(false)
            setNewUOM({ uom_name: '', uom_code: '', conversion_factor: 1 })
            window.location.reload()
        } catch (error) {
            alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
        } finally {
            setSaving(false)
        }
    }

    // All available units (base + UOMs) - kept for future use
    const _allUnits = [
        { id: 'base', uom_name: product.unit, conversion_factor: 1, isBase: true },
        ...uoms.map(u => ({ ...u, isBase: false }))
    ]
    void _allUnits

    const contexts = [
        {
            id: 'stock_opname' as UOMContext,
            label: 'Stock Opname',
            description: 'Unit used for inventory counting',
            icon: ClipboardList,
            color: 'var(--color-gold)',
        },
        {
            id: 'recipe' as UOMContext,
            label: 'Recipes',
            description: 'Unit used in production recipes',
            icon: Scale,
            color: 'var(--color-gold)',
        },
        {
            id: 'purchase' as UOMContext,
            label: 'Purchases (PO)',
            description: 'Unit used for supplier orders',
            icon: ShoppingCart,
            color: 'var(--color-gold)',
        }
    ]

    return (
        <div className="space-y-6">
            {/* Base Unit Card */}
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 flex items-center justify-center">
                        <Package size={24} className="text-[var(--color-gold)]" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-white m-0">Base Unit (Stock)</h3>
                        <p className="text-xs text-[var(--theme-text-muted)] mt-0.5 m-0">
                            All conversions are done relative to this unit
                        </p>
                    </div>
                    <input
                        value={product.unit ?? ''}
                        onChange={e => onProductChange({ ...product, unit: e.target.value })}
                        className="w-24 bg-black/40 border-2 border-[var(--color-gold)]/40 rounded-lg text-center font-bold text-white text-sm py-2.5 focus:border-[var(--color-gold)] focus:ring-0 focus:outline-none transition-all"
                        title="Base unit"
                    />
                </div>
            </div>

            {/* UOM List Card */}
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Alternative Units</h3>
                        <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                            Define purchase or consumption units
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[var(--color-gold)] text-black font-bold px-4 py-2 rounded-sm flex items-center gap-2 text-xs uppercase tracking-wider hover:bg-[var(--color-gold)]/90 transition-colors cursor-pointer"
                    >
                        <Plus size={16} /> New Unit
                    </button>
                </div>

                <div className="p-6">
                    {uoms.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-xl">
                            <Package size={40} className="mx-auto mb-3 text-white/10" />
                            <p className="text-[var(--theme-text-muted)] text-sm m-0">No alternative unit</p>
                            <p className="text-[var(--theme-text-muted)] text-xs mt-1 opacity-60">
                                Add units like "Bag 5kg", "Box", etc.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {extendedUoms.map(uom => (
                                <div
                                    key={uom.id}
                                    className="flex items-center gap-4 p-4 bg-black/20 rounded-lg border border-white/5"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center font-bold text-[var(--theme-text-muted)] text-[10px] uppercase tracking-wider">
                                        {uom.uom_name.substring(0, 3).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-white text-sm">{uom.uom_name}</div>
                                        <div className="text-xs text-[var(--theme-text-muted)]">
                                            1 {uom.uom_name} = <strong className="text-white">{uom.conversion_factor}</strong> {product.unit}
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5">
                                        {uom.is_stock_opname_unit && (
                                            <span className="px-2 py-0.5 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded text-[9px] font-bold uppercase tracking-wider border border-[var(--color-gold)]/20">Stock</span>
                                        )}
                                        {uom.is_consumption_unit && (
                                            <span className="px-2 py-0.5 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded text-[9px] font-bold uppercase tracking-wider border border-[var(--color-gold)]/20">Recipe</span>
                                        )}
                                        {uom.is_purchase_uom && (
                                            <span className="px-2 py-0.5 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded text-[9px] font-bold uppercase tracking-wider border border-[var(--color-gold)]/20">Purchase</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onDeleteUOM(uom.id)}
                                        className="p-2 bg-transparent border-none text-[var(--theme-text-muted)] hover:text-red-400 cursor-pointer rounded transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Context Preferences Card */}
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-semibold text-white">Units by Context</h3>
                    <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                        Choose the unit to use in each application context
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    {contexts.map(ctx => {
                        const Icon = ctx.icon
                        const currentUnit = getContextUnit(ctx.id)

                        return (
                            <div
                                key={ctx.id}
                                className="p-5 bg-black/20 rounded-xl border border-white/5"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 flex items-center justify-center shrink-0">
                                        <Icon size={20} className="text-[var(--color-gold)]" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-white m-0">
                                            {ctx.label}
                                        </h4>
                                        <p className="text-[10px] text-[var(--theme-text-muted)] mt-0.5 mb-3">
                                            {ctx.description}
                                        </p>
                                        <select
                                            value={currentUnit?.id || 'base'}
                                            onChange={(e) => setContextUnit(ctx.id, e.target.value === 'base' ? null : e.target.value)}
                                            disabled={saving}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white font-medium cursor-pointer focus:border-[var(--color-gold)] focus:ring-0 focus:outline-none transition-all"
                                        >
                                            <option value="base">{product.unit} (Base unit)</option>
                                            {uoms.map(uom => (
                                                <option key={uom.id} value={uom.id}>
                                                    {uom.uom_name} (1 = {uom.conversion_factor} {product.unit})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Add UOM Modal */}
            {showAddModal && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]"
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className="bg-[var(--onyx-surface)] border border-white/10 rounded-xl p-6 w-[400px] max-w-[90vw] shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-white mb-6">New Unit</h3>

                        <div className="mb-4">
                            <label className="block text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.15em] mb-2">
                                Unit name
                            </label>
                            <input
                                type="text"
                                value={newUOM.uom_name}
                                onChange={e => setNewUOM({ ...newUOM, uom_name: e.target.value })}
                                placeholder="Ex: Bag 5kg, Box, Pack"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-0 focus:outline-none transition-all"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.15em] mb-2">
                                Conversion factor
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-[var(--theme-text-muted)]">1 {newUOM.uom_name || 'unit'} =</span>
                                <input
                                    type="number"
                                    value={newUOM.conversion_factor}
                                    onChange={e => setNewUOM({ ...newUOM, conversion_factor: parseFloat(e.target.value) || 0 })}
                                    step="0.01"
                                    min="0.01"
                                    className="w-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white text-center font-semibold focus:border-[var(--color-gold)] focus:ring-0 focus:outline-none transition-all"
                                />
                                <span className="text-sm font-semibold text-white">{product.unit}</span>
                            </div>
                            <p className="text-[10px] text-[var(--theme-text-muted)] mt-2 opacity-60">
                                Ex: If 1 Bag = 5000g, enter 5000
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-3 bg-transparent border border-white/10 text-white rounded-lg font-medium text-sm hover:border-white/20 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddUOM}
                                disabled={saving || !newUOM.uom_name}
                                className="flex-1 px-4 py-3 bg-[var(--color-gold)] text-black rounded-lg font-bold text-sm hover:bg-[var(--color-gold)]/90 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
