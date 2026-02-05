import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Plus, Search, Edit, Trash2, Eye, Package, AlertCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import {
    ProductCombo,
    ProductComboGroup,
    ProductComboGroupItem,
    Product
} from '../../types/database'
import './CombosPage.css'

interface GroupItemWithProduct extends ProductComboGroupItem {
    product: Product
}

interface ComboGroupWithItems extends ProductComboGroup {
    items: GroupItemWithProduct[]
}

interface ComboWithGroups extends ProductCombo {
    groups: ComboGroupWithItems[]
    combo_price: number
    available_at_pos: boolean
}

export default function CombosPage() {
    const navigate = useNavigate()
    const [combos, setCombos] = useState<ComboWithGroups[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchCombos()
    }, [])

    const fetchCombos = async () => {
        try {
            const { data: combosData, error: combosError } = await supabase
                .from('product_combos')
                .select('*')
                .order('sort_order', { ascending: true })

            if (combosError) throw combosError

            if (combosData) {
                // Fetch groups and items for each combo
                const combosWithGroups = await Promise.all(
                    combosData.map(async (combo) => {
                        // Fetch groups for this combo
                        const { data: groupsData } = await supabase
                            .from('product_combo_groups')
                            .select('*')
                            .eq('combo_id', combo.id)
                            .order('sort_order', { ascending: true })

                        const groups = groupsData || []

                        // For each group, fetch its items
                        const groupsWithItems = await Promise.all(
                            groups.map(async (group) => {
                                const { data: itemsData } = await supabase
                                    .from('product_combo_group_items')
                                    .select(`
                                        *,
                                        product:products(*)
                                    `)
                                    .eq('group_id', group.id)
                                    .order('sort_order', { ascending: true })

                                return {
                                    ...group,
                                    items: itemsData || []
                                }
                            })
                        )

                        // Map combo fields to match interface
                        type RawGroup = ProductComboGroup & { items?: Array<ProductComboGroupItem & { product?: Product }> };
                        const rawGroups = groupsWithItems as unknown as RawGroup[];
                        const mappedGroups = rawGroups.map((g) => ({
                            ...g,
                            items: (g.items || []).map((item) => ({
                                ...item,
                                price_adjustment: item.price_adjustment ?? 0,
                                is_default: item.is_default ?? false,
                                product: item.product
                            }))
                        }))
                        return {
                            ...combo,
                            combo_price: combo.combo_price ?? 0,
                            available_at_pos: combo.available_at_pos ?? true,
                            groups: mappedGroups
                        }
                    })
                )
                setCombos(combosWithGroups as unknown as ComboWithGroups[])
            }
        } catch (error) {
            console.error('Error fetching combos:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredCombos = combos.filter(combo =>
        combo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        combo.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce combo ?')) return

        try {
            const { error } = await supabase
                .from('product_combos')
                .delete()
                .eq('id', id)

            if (error) throw error

            await fetchCombos()
        } catch (error) {
            console.error('Error deleting combo:', error)
        }
    }

    const handleToggleActive = async (combo: ComboWithGroups) => {
        try {
            const { error } = await supabase
                .from('product_combos')
                .update({ is_active: !combo.is_active })
                .eq('id', combo.id)

            if (error) throw error

            await fetchCombos()
        } catch (error) {
            console.error('Error updating combo:', error)
        }
    }

    const getMinPrice = (combo: ComboWithGroups) => {
        // Base price + sum of minimum price adjustments (default or cheapest options)
        let minAdjustment = 0
        combo.groups.forEach(group => {
            if (group.items.length > 0) {
                // Find default item or cheapest item
                const defaultItem = group.items.find(item => item.is_default)
                const cheapestItem = group.items.reduce((min, item) =>
                    (item.price_adjustment ?? 0) < (min.price_adjustment ?? 0) ? item : min
                )
                const selectedItem = defaultItem || cheapestItem
                minAdjustment += selectedItem.price_adjustment ?? 0
            }
        })
        return combo.combo_price + minAdjustment
    }

    const getMaxPrice = (combo: ComboWithGroups) => {
        // Base price + sum of maximum price adjustments (most expensive options)
        let maxAdjustment = 0
        combo.groups.forEach(group => {
            if (group.items.length > 0) {
                const maxItem = group.items.reduce((max, item) =>
                    (item.price_adjustment ?? 0) > (max.price_adjustment ?? 0) ? item : max
                )
                maxAdjustment += maxItem.price_adjustment ?? 0
            }
        })
        return combo.combo_price + maxAdjustment
    }

    const getRegularPrice = (combo: ComboWithGroups) => {
        // Calculate regular retail price (using default items)
        let totalRetailPrice = 0
        combo.groups.forEach(group => {
            const defaultItem = group.items.find(item => item.is_default)
            if (defaultItem && defaultItem.product) {
                totalRetailPrice += defaultItem.product.retail_price || 0
            }
        })
        return totalRetailPrice
    }

    const getSavings = (combo: ComboWithGroups) => {
        const regularPrice = getRegularPrice(combo)
        const minComboPrice = getMinPrice(combo)
        return regularPrice - minComboPrice
    }

    return (
        <div className="combos-page">
            {/* Header */}
            <header className="combos-header">
                <div className="combos-header__info">
                    <h1 className="combos-header__title">
                        <Box size={28} />
                        Gestion des Combos
                    </h1>
                    <p className="combos-header__subtitle">
                        Créez des offres groupées de produits à prix réduit
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/products/combos/new')}
                >
                    <Plus size={18} />
                    Nouveau Combo
                </button>
            </header>

            {/* Stats */}
            <div className="combos-stats">
                <div className="stat-card">
                    <Box size={24} />
                    <div className="stat-content">
                        <span className="stat-value">{combos.length}</span>
                        <span className="stat-label">Total Combos</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Package size={24} />
                    <div className="stat-content">
                        <span className="stat-value">{combos.filter(c => c.is_active).length}</span>
                        <span className="stat-label">Actifs</span>
                    </div>
                </div>
                <div className="stat-card">
                    <AlertCircle size={24} />
                    <div className="stat-content">
                        <span className="stat-value">{combos.filter(c => !c.is_active).length}</span>
                        <span className="stat-label">Inactifs</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="combos-filters">
                <div className="combos-search">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher un combo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Combos Grid */}
            {loading ? (
                <div className="combos-loading">
                    <div className="spinner"></div>
                    <span>Chargement des combos...</span>
                </div>
            ) : filteredCombos.length === 0 ? (
                <div className="combos-empty">
                    <Box size={64} />
                    <h3>Aucun combo trouvé</h3>
                    <p>
                        {searchTerm
                            ? 'Essayez de modifier votre recherche'
                            : 'Commencez par créer votre premier combo'}
                    </p>
                </div>
            ) : (
                <div className="combos-grid">
                    {filteredCombos.map(combo => {
                        const regularPrice = getRegularPrice(combo)
                        const minPrice = getMinPrice(combo)
                        const maxPrice = getMaxPrice(combo)
                        const savings = getSavings(combo)
                        const savingsPercentage = regularPrice > 0
                            ? ((savings / regularPrice) * 100).toFixed(0)
                            : 0

                        return (
                            <div
                                key={combo.id}
                                className={`combo-card ${!combo.is_active ? 'inactive' : ''}`}
                            >
                                {combo.image_url && (
                                    <div className="combo-card__image">
                                        <img src={combo.image_url} alt={combo.name} />
                                    </div>
                                )}

                                <div className="combo-card__content">
                                    <div className="combo-card__header">
                                        <h3 className="combo-card__name">{combo.name}</h3>
                                        {!combo.is_active && (
                                            <span className="status-badge inactive">Inactif</span>
                                        )}
                                    </div>

                                    {combo.description && (
                                        <p className="combo-card__description">{combo.description}</p>
                                    )}

                                    <div className="combo-card__items">
                                        <h4>Groupes de choix:</h4>
                                        {combo.groups.length === 0 ? (
                                            <p className="no-groups">Aucun groupe configuré</p>
                                        ) : (
                                            combo.groups.map((group, groupIdx) => (
                                                <div key={groupIdx} className="group-summary">
                                                    <div className="group-name">
                                                        <strong>{group.name}</strong>
                                                        {!group.is_required && (
                                                            <span className="optional-badge">Optionnel</span>
                                                        )}
                                                    </div>
                                                    <ul className="group-options">
                                                        {group.items.map((item, itemIdx) => (
                                                            <li key={itemIdx}>
                                                                {item.product?.name || 'Produit inconnu'}
                                                                {(item.price_adjustment ?? 0) !== 0 && (
                                                                    <span className="price-adj">
                                                                        {(item.price_adjustment ?? 0) > 0 ? '+' : ''}
                                                                        {formatCurrency(item.price_adjustment ?? 0)}
                                                                    </span>
                                                                )}
                                                                {item.is_default && (
                                                                    <span className="default-tag">Par défaut</span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="combo-card__pricing">
                                        <div className="price-comparison">
                                            {regularPrice > 0 && (
                                                <div className="regular-price">
                                                    <span className="label">Prix normal:</span>
                                                    <span className="value crossed">{formatCurrency(regularPrice)}</span>
                                                </div>
                                            )}
                                            <div className="combo-price">
                                                <span className="label">Prix combo:</span>
                                                {minPrice === maxPrice ? (
                                                    <span className="value highlight">{formatCurrency(minPrice)}</span>
                                                ) : (
                                                    <span className="value highlight">
                                                        {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {savings > 0 && (
                                            <div className="savings-badge">
                                                Économie: {formatCurrency(savings)} ({savingsPercentage}%)
                                            </div>
                                        )}
                                    </div>

                                    <div className="combo-card__footer">
                                        <span className={`pos-badge ${combo.available_at_pos ? 'visible' : ''}`}>
                                            {combo.available_at_pos ? 'Visible POS' : 'Masqué POS'}
                                        </span>
                                    </div>
                                </div>

                                <div className="combo-card__actions">
                                    <button
                                        className="btn-icon"
                                        onClick={() => navigate(`/products/combos/${combo.id}`)}
                                        title="Voir détails"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        className="btn-icon"
                                        onClick={() => navigate(`/products/combos/${combo.id}/edit`)}
                                        title="Modifier"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className={`btn-icon ${combo.is_active ? 'active' : 'inactive'}`}
                                        onClick={() => handleToggleActive(combo)}
                                        title={combo.is_active ? 'Désactiver' : 'Activer'}
                                    >
                                        <Package size={16} />
                                    </button>
                                    <button
                                        className="btn-icon danger"
                                        onClick={() => handleDelete(combo.id)}
                                        title="Supprimer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
