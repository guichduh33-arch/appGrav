import React, { useState } from 'react'
import { Plus, Trash2, Package, Scale, ClipboardList, ShoppingCart } from 'lucide-react'
import { Product, ProductUOM } from '../../../types/database'
import { supabase } from '../../../lib/supabase'

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
    const [newUOM, setNewUOM] = useState({ unit_name: '', conversion_factor: 1 })
    const [saving, setSaving] = useState(false)

    // Get currently selected unit for each context
    const getContextUnit = (context: UOMContext): ProductUOM | null => {
        return uoms.find(u => {
            if (context === 'stock_opname') return u.is_stock_opname_unit
            if (context === 'recipe') return u.is_consumption_unit
            if (context === 'purchase') return u.is_purchase_unit
            return false
        }) || null
    }

    // Set preferred unit for a context
    const setContextUnit = async (context: UOMContext, uomId: string | null) => {
        setSaving(true)
        try {
            // First, unset all units for this context
            const field = context === 'stock_opname' ? 'is_stock_opname_unit'
                : context === 'recipe' ? 'is_consumption_unit'
                : 'is_purchase_unit'

            // Unset all
            await supabase
                .from('product_uoms')
                .update({ [field]: false })
                .eq('product_id', product.id)

            // Set the selected one
            if (uomId) {
                await supabase
                    .from('product_uoms')
                    .update({ [field]: true })
                    .eq('id', uomId)
            }

            // Refresh - this would need to be passed from parent
            window.location.reload()
        } catch (error) {
            console.error('Error setting context unit:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleAddUOM = async () => {
        if (!newUOM.unit_name || newUOM.conversion_factor <= 0) return
        setSaving(true)
        try {
            const { error } = await supabase
                .from('product_uoms')
                .insert({
                    product_id: product.id,
                    unit_name: newUOM.unit_name,
                    conversion_factor: newUOM.conversion_factor
                })

            if (error) throw error
            setShowAddModal(false)
            setNewUOM({ unit_name: '', conversion_factor: 1 })
            window.location.reload()
        } catch (error: any) {
            alert('Erreur: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    // All available units (base + UOMs) - kept for future use
    const _allUnits = [
        { id: 'base', unit_name: product.unit, conversion_factor: 1, isBase: true },
        ...uoms.map(u => ({ ...u, isBase: false }))
    ]
    void _allUnits // Prevent unused variable warning

    const contexts = [
        {
            id: 'stock_opname' as UOMContext,
            label: 'Stock Opname',
            description: 'Unité utilisée pour le comptage d\'inventaire',
            icon: ClipboardList,
            color: '#3B82F6',
            bgColor: '#EFF6FF'
        },
        {
            id: 'recipe' as UOMContext,
            label: 'Recettes',
            description: 'Unité utilisée dans les recettes de production',
            icon: Scale,
            color: '#F59E0B',
            bgColor: '#FFFBEB'
        },
        {
            id: 'purchase' as UOMContext,
            label: 'Achats (PO)',
            description: 'Unité utilisée pour les commandes fournisseurs',
            icon: ShoppingCart,
            color: '#10B981',
            bgColor: '#ECFDF5'
        }
    ]

    return (
        <div className="space-y-6">
            {/* Base Unit Card */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #BA90A2 0%, #D4A5B5 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Package size={24} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#4A3728' }}>
                            Unité de Base (Stock)
                        </h3>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: '#8B7355' }}>
                            Toutes les conversions se font par rapport à cette unité
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            value={product.unit}
                            onChange={e => onProductChange({ ...product, unit: e.target.value })}
                            style={{
                                width: '100px',
                                padding: '0.75rem',
                                border: '2px solid #BA90A2',
                                borderRadius: '0.5rem',
                                textAlign: 'center',
                                fontWeight: 700,
                                fontSize: '1rem'
                            }}
                            title="Unité de base"
                        />
                    </div>
                </div>
            </div>

            {/* UOM List Card */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                        <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>Unités Alternatives</h3>
                        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#8B7355' }}>
                            Définissez les unités d'achat ou de consommation
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.625rem 1rem',
                            background: 'linear-gradient(135deg, #BA90A2 0%, #D4A5B5 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <Plus size={18} /> Nouvelle Unité
                    </button>
                </div>

                {uoms.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '2rem',
                        background: '#F9FAFB',
                        borderRadius: '0.75rem',
                        border: '2px dashed #E5E7EB'
                    }}>
                        <Package size={40} style={{ color: '#D1D5DB', margin: '0 auto 0.75rem' }} />
                        <p style={{ margin: 0, color: '#6B7280' }}>Aucune unité alternative</p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: '#9CA3AF' }}>
                            Ajoutez des unités comme "Sac 5kg", "Carton", etc.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {uoms.map(uom => (
                            <div
                                key={uom.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem',
                                    background: '#F9FAFB',
                                    borderRadius: '0.75rem',
                                    border: '1px solid #E5E7EB'
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    background: '#E5E7EB',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    color: '#4B5563',
                                    fontSize: '0.75rem'
                                }}>
                                    {uom.unit_name.substring(0, 3).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: '#1F2937' }}>{uom.unit_name}</div>
                                    <div style={{ fontSize: '0.8125rem', color: '#6B7280' }}>
                                        1 {uom.unit_name} = <strong>{uom.conversion_factor}</strong> {product.unit}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.375rem' }}>
                                    {uom.is_stock_opname_unit && (
                                        <span style={{ padding: '0.25rem 0.5rem', background: '#DBEAFE', color: '#1D4ED8', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: 600 }}>STOCK</span>
                                    )}
                                    {uom.is_consumption_unit && (
                                        <span style={{ padding: '0.25rem 0.5rem', background: '#FEF3C7', color: '#B45309', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: 600 }}>RECETTE</span>
                                    )}
                                    {uom.is_purchase_unit && (
                                        <span style={{ padding: '0.25rem 0.5rem', background: '#D1FAE5', color: '#047857', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: 600 }}>ACHAT</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => onDeleteUOM(uom.id)}
                                    style={{
                                        padding: '0.5rem',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#EF4444',
                                        cursor: 'pointer',
                                        borderRadius: '0.375rem'
                                    }}
                                    title="Supprimer"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Context Preferences Card */}
            <div className="card">
                <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>Unités par Contexte</h3>
                <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.8125rem', color: '#8B7355' }}>
                    Choisissez l'unité à utiliser dans chaque contexte de l'application
                </p>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {contexts.map(ctx => {
                        const Icon = ctx.icon
                        const currentUnit = getContextUnit(ctx.id)

                        return (
                            <div
                                key={ctx.id}
                                style={{
                                    padding: '1.25rem',
                                    background: ctx.bgColor,
                                    borderRadius: '0.75rem',
                                    border: `1px solid ${ctx.color}20`
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                    }}>
                                        <Icon size={20} style={{ color: ctx.color }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937' }}>
                                            {ctx.label}
                                        </h4>
                                        <p style={{ margin: '0.25rem 0 0.75rem 0', fontSize: '0.75rem', color: '#6B7280' }}>
                                            {ctx.description}
                                        </p>
                                        <select
                                            value={currentUnit?.id || 'base'}
                                            onChange={(e) => setContextUnit(ctx.id, e.target.value === 'base' ? null : e.target.value)}
                                            disabled={saving}
                                            style={{
                                                width: '100%',
                                                padding: '0.625rem 1rem',
                                                border: '2px solid #E5E7EB',
                                                borderRadius: '0.5rem',
                                                background: 'white',
                                                fontWeight: 500,
                                                fontSize: '0.875rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="base">{product.unit} (Unité de base)</option>
                                            {uoms.map(uom => (
                                                <option key={uom.id} value={uom.id}>
                                                    {uom.unit_name} (1 = {uom.conversion_factor} {product.unit})
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
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }} onClick={() => setShowAddModal(false)}>
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        width: '400px',
                        maxWidth: '90vw'
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', fontWeight: 600 }}>
                            Nouvelle Unité
                        </h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                                Nom de l'unité
                            </label>
                            <input
                                type="text"
                                value={newUOM.unit_name}
                                onChange={e => setNewUOM({ ...newUOM, unit_name: e.target.value })}
                                placeholder="Ex: Sac 5kg, Carton, Pack"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
                                Facteur de conversion
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#6B7280' }}>1 {newUOM.unit_name || 'unité'} =</span>
                                <input
                                    type="number"
                                    value={newUOM.conversion_factor}
                                    onChange={e => setNewUOM({ ...newUOM, conversion_factor: parseFloat(e.target.value) || 0 })}
                                    step="0.01"
                                    min="0.01"
                                    style={{
                                        width: '100px',
                                        padding: '0.75rem',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem',
                                        textAlign: 'center'
                                    }}
                                />
                                <span style={{ fontWeight: 600 }}>{product.unit}</span>
                            </div>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>
                                Ex: Si 1 Sac = 5000g, entrez 5000
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setShowAddModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '0.5rem',
                                    background: 'white',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAddUOM}
                                disabled={saving || !newUOM.unit_name}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    background: 'linear-gradient(135deg, #BA90A2 0%, #D4A5B5 100%)',
                                    color: 'white',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    opacity: saving || !newUOM.unit_name ? 0.5 : 1
                                }}
                            >
                                {saving ? 'Enregistrement...' : 'Ajouter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
