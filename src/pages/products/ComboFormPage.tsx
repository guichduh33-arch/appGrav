import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Plus, X, Save, ArrowLeft, Search, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Product } from '../../types/database'
import toast from 'react-hot-toast'
import './ComboFormPage.css'

interface GroupItem {
    id?: string
    product_id: string
    product?: Product
    price_adjustment: number
    is_default: boolean
    sort_order: number
}

interface ComboGroup {
    id?: string
    group_name: string
    group_type: 'single' | 'multiple'
    is_required: boolean
    min_selections: number
    max_selections: number
    sort_order: number
    items: GroupItem[]
    expanded?: boolean
}

export default function ComboFormPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditing = !!id

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    // Form state
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [comboPrice, setComboPrice] = useState<number>(0)
    const [isActive, setIsActive] = useState(true)
    const [availableAtPos, setAvailableAtPos] = useState(true)
    const [imageUrl, setImageUrl] = useState('')
    const [sortOrder, setSortOrder] = useState(0)
    const [groups, setGroups] = useState<ComboGroup[]>([])

    // Product selection
    const [products, setProducts] = useState<Product[]>([])
    const [showProductSearch, setShowProductSearch] = useState<number | null>(null) // index du groupe
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchProducts()
        if (isEditing) {
            fetchCombo()
        }
    }, [id])

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('name')

            if (error) throw error
            if (data) setProducts(data)
        } catch (error) {
            console.error('Error fetching products:', error)
            toast.error('Erreur lors du chargement des produits')
        }
    }

    const fetchCombo = async () => {
        if (!id) return

        setLoading(true)
        try {
            // Fetch combo
            const { data: comboData, error: comboError } = await supabase
                .from('product_combos')
                .select('*')
                .eq('id', id)
                .single()

            if (comboError) throw comboError

            if (comboData) {
                setName(comboData.name)
                setDescription(comboData.description || '')
                setComboPrice(comboData.combo_price)
                setIsActive(comboData.is_active)
                setAvailableAtPos(comboData.available_at_pos)
                setImageUrl(comboData.image_url || '')
                setSortOrder(comboData.sort_order)

                // Fetch groups with items
                const { data: groupsData, error: groupsError } = await supabase
                    .from('product_combo_groups')
                    .select('*')
                    .eq('combo_id', id)
                    .order('sort_order')

                if (groupsError) throw groupsError

                if (groupsData) {
                    const groupsWithItems = await Promise.all(
                        groupsData.map(async (group) => {
                            const { data: itemsData } = await supabase
                                .from('product_combo_group_items')
                                .select(`
                                    *,
                                    product:products(*)
                                `)
                                .eq('group_id', group.id)
                                .order('sort_order')

                            return {
                                ...group,
                                items: itemsData || [],
                                expanded: true
                            }
                        })
                    )
                    setGroups(groupsWithItems)
                }
            }
        } catch (error) {
            console.error('Error fetching combo:', error)
            toast.error('Erreur lors du chargement du combo')
        } finally {
            setLoading(false)
        }
    }

    const addGroup = () => {
        setGroups([...groups, {
            group_name: '',
            group_type: 'single',
            is_required: true,
            min_selections: 1,
            max_selections: 1,
            sort_order: groups.length,
            items: [],
            expanded: true
        }])
    }

    const removeGroup = (index: number) => {
        setGroups(groups.filter((_, i) => i !== index))
    }

    const updateGroup = (index: number, updates: Partial<ComboGroup>) => {
        const newGroups = [...groups]
        newGroups[index] = { ...newGroups[index], ...updates }
        setGroups(newGroups)
    }

    const toggleGroupExpanded = (index: number) => {
        const newGroups = [...groups]
        newGroups[index].expanded = !newGroups[index].expanded
        setGroups(newGroups)
    }

    const addProductToGroup = (groupIndex: number, product: Product) => {
        const group = groups[groupIndex]

        if (group.items.some(item => item.product_id === product.id)) {
            toast.error('Ce produit est déjà dans ce groupe')
            return
        }

        const newGroups = [...groups]
        newGroups[groupIndex].items.push({
            product_id: product.id,
            product,
            price_adjustment: 0,
            is_default: group.items.length === 0, // Premier produit = défaut
            sort_order: group.items.length
        })
        setGroups(newGroups)
        setShowProductSearch(null)
        setSearchTerm('')
    }

    const removeProductFromGroup = (groupIndex: number, itemIndex: number) => {
        const newGroups = [...groups]
        newGroups[groupIndex].items = newGroups[groupIndex].items.filter((_, i) => i !== itemIndex)
        setGroups(newGroups)
    }

    const updateGroupItem = (groupIndex: number, itemIndex: number, updates: Partial<GroupItem>) => {
        const newGroups = [...groups]
        newGroups[groupIndex].items[itemIndex] = {
            ...newGroups[groupIndex].items[itemIndex],
            ...updates
        }
        setGroups(newGroups)
    }

    const setAsDefault = (groupIndex: number, itemIndex: number) => {
        const newGroups = [...groups]
        // Unset all defaults in this group
        newGroups[groupIndex].items.forEach(item => item.is_default = false)
        // Set this one as default
        newGroups[groupIndex].items[itemIndex].is_default = true
        setGroups(newGroups)
    }

    const calculateMinPrice = () => {
        let min = comboPrice
        groups.forEach(group => {
            if (group.is_required && group.items.length > 0) {
                // Find cheapest option (or default)
                const defaultItem = group.items.find(item => item.is_default)
                const cheapest = group.items.reduce((min, item) =>
                    item.price_adjustment < min.price_adjustment ? item : min
                , group.items[0])

                min += (defaultItem || cheapest).price_adjustment
            }
        })
        return min
    }

    const calculateMaxPrice = () => {
        let max = comboPrice
        groups.forEach(group => {
            if (group.group_type === 'single') {
                // For single selection, take most expensive
                const mostExpensive = group.items.reduce((max, item) =>
                    item.price_adjustment > max.price_adjustment ? item : max
                , group.items[0] || { price_adjustment: 0 })
                max += mostExpensive.price_adjustment
            } else {
                // For multiple, sum up to max_selections of most expensive
                const sorted = [...group.items].sort((a, b) => b.price_adjustment - a.price_adjustment)
                const topItems = sorted.slice(0, group.max_selections)
                max += topItems.reduce((sum, item) => sum + item.price_adjustment, 0)
            }
        })
        return max
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!name.trim()) {
            toast.error('Le nom du combo est requis')
            return
        }

        if (comboPrice <= 0) {
            toast.error('Le prix du combo doit être supérieur à 0')
            return
        }

        if (groups.length === 0) {
            toast.error('Ajoutez au moins un groupe de choix')
            return
        }

        for (let i = 0; i < groups.length; i++) {
            const group = groups[i]
            if (!group.group_name.trim()) {
                toast.error(`Le nom du groupe ${i + 1} est requis`)
                return
            }
            if (group.items.length === 0) {
                toast.error(`Le groupe "${group.group_name}" doit contenir au moins un produit`)
                return
            }
            if (group.group_type === 'single' && group.max_selections !== 1) {
                toast.error(`Le groupe "${group.group_name}" de type "choix unique" doit avoir max_selections = 1`)
                return
            }
            if (group.min_selections > group.max_selections) {
                toast.error(`Le groupe "${group.group_name}": min_selections ne peut pas être > max_selections`)
                return
            }
        }

        setSaving(true)
        try {
            if (isEditing) {
                // Update combo
                const { error: comboError } = await supabase
                    .from('product_combos')
                    .update({
                        name,
                        description: description || null,
                        combo_price: comboPrice,
                        is_active: isActive,
                        available_at_pos: availableAtPos,
                        image_url: imageUrl || null,
                        sort_order: sortOrder
                    })
                    .eq('id', id!)

                if (comboError) throw comboError

                // Delete existing groups and items (cascade will handle items)
                const { error: deleteError } = await supabase
                    .from('product_combo_groups')
                    .delete()
                    .eq('combo_id', id!)

                if (deleteError) throw deleteError

                // Insert new groups and items
                await insertGroupsAndItems(id!)

                toast.success('Combo mis à jour avec succès')
            } else {
                // Create combo
                const { data: comboData, error: comboError } = await supabase
                    .from('product_combos')
                    .insert({
                        name,
                        description: description || null,
                        combo_price: comboPrice,
                        is_active: isActive,
                        available_at_pos: availableAtPos,
                        image_url: imageUrl || null,
                        sort_order: sortOrder
                    })
                    .select()
                    .single()

                if (comboError) throw comboError

                await insertGroupsAndItems(comboData.id)

                toast.success('Combo créé avec succès')
            }

            navigate('/products/combos')
        } catch (error) {
            console.error('Error saving combo:', error)
            toast.error('Erreur lors de la sauvegarde du combo')
        } finally {
            setSaving(false)
        }
    }

    const insertGroupsAndItems = async (comboId: string) => {
        for (const group of groups) {
            // Insert group
            const { data: groupData, error: groupError } = await supabase
                .from('product_combo_groups')
                .insert({
                    combo_id: comboId,
                    group_name: group.group_name,
                    group_type: group.group_type,
                    is_required: group.is_required,
                    min_selections: group.min_selections,
                    max_selections: group.max_selections,
                    sort_order: group.sort_order
                })
                .select()
                .single()

            if (groupError) throw groupError

            // Insert items
            if (group.items.length > 0) {
                const { error: itemsError } = await supabase
                    .from('product_combo_group_items')
                    .insert(
                        group.items.map(item => ({
                            group_id: groupData.id,
                            product_id: item.product_id,
                            price_adjustment: item.price_adjustment,
                            is_default: item.is_default,
                            sort_order: item.sort_order
                        }))
                    )

                if (itemsError) throw itemsError
            }
        }
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const minPrice = calculateMinPrice()
    const maxPrice = calculateMaxPrice()

    if (loading) {
        return (
            <div className="combo-form-loading">
                <div className="spinner"></div>
                <span>Chargement...</span>
            </div>
        )
    }

    return (
        <div className="combo-form-page">
            <header className="combo-form-header">
                <button
                    type="button"
                    className="btn-back"
                    onClick={() => navigate('/products/combos')}
                >
                    <ArrowLeft size={20} />
                    Retour
                </button>
                <h1>
                    <Box size={28} />
                    {isEditing ? 'Modifier le combo' : 'Nouveau combo'}
                </h1>
            </header>

            <form onSubmit={handleSubmit} className="combo-form">
                <div className="form-grid">
                    {/* Left column - General info */}
                    <div className="form-section">
                        <h2>Informations générales</h2>

                        <div className="form-group">
                            <label htmlFor="name">Nom du combo *</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Petit Déjeuner Complet"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Choisissez votre boisson et votre viennoiserie..."
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="comboPrice">Prix de base (IDR) *</label>
                            <input
                                id="comboPrice"
                                type="number"
                                value={comboPrice}
                                onChange={(e) => setComboPrice(Number(e.target.value))}
                                min="0"
                                step="1000"
                                required
                            />
                            <small>Les suppléments seront ajoutés selon les choix du client</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="imageUrl">URL de l'image</label>
                            <input
                                id="imageUrl"
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="sortOrder">Ordre d'affichage</label>
                            <input
                                id="sortOrder"
                                type="number"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(Number(e.target.value))}
                                min="0"
                            />
                        </div>

                        <div className="form-group-horizontal">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                                <span>Actif</span>
                            </label>

                            <label>
                                <input
                                    type="checkbox"
                                    checked={availableAtPos}
                                    onChange={(e) => setAvailableAtPos(e.target.checked)}
                                />
                                <span>Visible au POS</span>
                            </label>
                        </div>

                        {/* Price summary */}
                        {groups.length > 0 && (
                            <div className="pricing-preview">
                                <h3>Aperçu des prix</h3>
                                <div className="price-range">
                                    <div className="price-item">
                                        <span>Prix minimum:</span>
                                        <span className="price">{new Intl.NumberFormat('id-ID').format(minPrice)} IDR</span>
                                    </div>
                                    <div className="price-item">
                                        <span>Prix maximum:</span>
                                        <span className="price highlight">{new Intl.NumberFormat('id-ID').format(maxPrice)} IDR</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column - Groups */}
                    <div className="form-section">
                        <div className="section-header">
                            <h2>Groupes de choix</h2>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={addGroup}
                            >
                                <Plus size={18} />
                                Ajouter un groupe
                            </button>
                        </div>

                        <div className="groups-list">
                            {groups.length === 0 ? (
                                <div className="empty-state">
                                    <Box size={48} />
                                    <p>Aucun groupe ajouté</p>
                                    <small>Ex: "Boissons", "Viennoiseries", "Accompagnements"</small>
                                </div>
                            ) : (
                                groups.map((group, groupIndex) => (
                                    <div key={groupIndex} className="group-card">
                                        <div className="group-header">
                                            <button
                                                type="button"
                                                className="group-expand"
                                                onClick={() => toggleGroupExpanded(groupIndex)}
                                            >
                                                {group.expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </button>
                                            <input
                                                type="text"
                                                className="group-name-input"
                                                value={group.group_name}
                                                onChange={(e) => updateGroup(groupIndex, { group_name: e.target.value })}
                                                placeholder="Nom du groupe (ex: Boissons)"
                                            />
                                            <button
                                                type="button"
                                                className="btn-icon danger"
                                                onClick={() => removeGroup(groupIndex)}
                                                title="Supprimer le groupe"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        {group.expanded && (
                                            <div className="group-body">
                                                <div className="group-settings">
                                                    <div className="form-group">
                                                        <label htmlFor={`group-type-${groupIndex}`}>Type de sélection</label>
                                                        <select
                                                            id={`group-type-${groupIndex}`}
                                                            value={group.group_type}
                                                            onChange={(e) => {
                                                                const type = e.target.value as 'single' | 'multiple'
                                                                updateGroup(groupIndex, {
                                                                    group_type: type,
                                                                    max_selections: type === 'single' ? 1 : group.max_selections
                                                                })
                                                            }}
                                                        >
                                                            <option value="single">Choix unique (1 option)</option>
                                                            <option value="multiple">Choix multiple</option>
                                                        </select>
                                                    </div>

                                                    <div className="form-group">
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                checked={group.is_required}
                                                                onChange={(e) => updateGroup(groupIndex, { is_required: e.target.checked })}
                                                            />
                                                            <span>Obligatoire</span>
                                                        </label>
                                                    </div>

                                                    {group.group_type === 'multiple' && (
                                                        <div className="form-row">
                                                            <div className="form-group">
                                                                <label htmlFor={`min-sel-${groupIndex}`}>Min sélections</label>
                                                                <input
                                                                    id={`min-sel-${groupIndex}`}
                                                                    type="number"
                                                                    value={group.min_selections}
                                                                    onChange={(e) => updateGroup(groupIndex, { min_selections: Number(e.target.value) })}
                                                                    min="0"
                                                                    title="Nombre minimum de sélections"
                                                                />
                                                            </div>
                                                            <div className="form-group">
                                                                <label htmlFor={`max-sel-${groupIndex}`}>Max sélections</label>
                                                                <input
                                                                    id={`max-sel-${groupIndex}`}
                                                                    type="number"
                                                                    value={group.max_selections}
                                                                    onChange={(e) => updateGroup(groupIndex, { max_selections: Number(e.target.value) })}
                                                                    min="1"
                                                                    title="Nombre maximum de sélections"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="group-items-header">
                                                    <h4>Options disponibles</h4>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm"
                                                        onClick={() => setShowProductSearch(groupIndex)}
                                                    >
                                                        <Plus size={16} />
                                                        Ajouter
                                                    </button>
                                                </div>

                                                {showProductSearch === groupIndex && (
                                                    <div className="product-search">
                                                        <div className="search-input">
                                                            <Search size={18} />
                                                            <input
                                                                type="text"
                                                                value={searchTerm}
                                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                                placeholder="Rechercher un produit..."
                                                                autoFocus
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowProductSearch(null)}
                                                                title="Fermer la recherche"
                                                                aria-label="Fermer la recherche"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                        <div className="product-list">
                                                            {filteredProducts.map(product => (
                                                                <div
                                                                    key={product.id}
                                                                    className="product-item"
                                                                    onClick={() => addProductToGroup(groupIndex, product)}
                                                                >
                                                                    <span className="product-name">{product.name}</span>
                                                                    <span className="product-price">
                                                                        {new Intl.NumberFormat('id-ID').format(product.retail_price || 0)} IDR
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="group-items-list">
                                                    {group.items.length === 0 ? (
                                                        <div className="empty-items">
                                                            <small>Aucune option ajoutée</small>
                                                        </div>
                                                    ) : (
                                                        group.items.map((item, itemIndex) => (
                                                            <div key={itemIndex} className="group-item">
                                                                <div className="item-info">
                                                                    <span className="item-name">
                                                                        {item.product?.name}
                                                                        {item.is_default && <span className="default-badge">Par défaut</span>}
                                                                    </span>
                                                                    <div className="item-controls">
                                                                        <div className="price-adjustment">
                                                                            <label>Supplément:</label>
                                                                            <input
                                                                                type="number"
                                                                                value={item.price_adjustment}
                                                                                onChange={(e) => updateGroupItem(groupIndex, itemIndex, { price_adjustment: Number(e.target.value) })}
                                                                                step="1000"
                                                                                placeholder="0"
                                                                            />
                                                                            <span>IDR</span>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            className="btn-sm"
                                                                            onClick={() => setAsDefault(groupIndex, itemIndex)}
                                                                            disabled={item.is_default}
                                                                        >
                                                                            Défaut
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn-icon danger"
                                                                            onClick={() => removeProductFromGroup(groupIndex, itemIndex)}
                                                                            title="Retirer ce produit"
                                                                            aria-label="Retirer ce produit"
                                                                        >
                                                                            <X size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/products/combos')}
                        disabled={saving}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <div className="spinner-small"></div>
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                {isEditing ? 'Mettre à jour' : 'Créer le combo'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
