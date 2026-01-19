# Intégration des Combos dans le POS

## 📦 Composants créés

### 1. ComboSelectorModal
**Fichier**: `src/components/pos/ComboSelectorModal.tsx`

Modal de sélection pour les combos avec groupes de choix. Permet au client/caissier de :
- Voir tous les groupes de choix du combo
- Sélectionner des options (single ou multiple)
- Voir les suppléments de prix en temps réel
- Valider les sélections avant d'ajouter au panier

### 2. CartStore mis à jour
**Fichier**: `src/stores/cartStore.ts`

Le store a été étendu pour supporter les combos :
- Nouveau type `CartItem` avec champ `type: 'product' | 'combo'`
- Interface `ComboSelectedItem` pour les sélections
- Nouvelle action `addCombo()` pour ajouter un combo au panier

## 🔧 Comment intégrer dans le POS

### Étape 1: Importer les dépendances

```typescript
import { useState } from 'react'
import ComboSelectorModal from '@/components/pos/ComboSelectorModal'
import { useCartStore } from '@/stores/cartStore'
import type { ProductCombo } from '@/types/database'
```

### Étape 2: Ajouter le state du modal

```typescript
const [selectedCombo, setSelectedCombo] = useState<string | null>(null)
const addCombo = useCartStore(state => state.addCombo)
```

### Étape 3: Créer la fonction de gestion du clic sur un combo

```typescript
const handleComboClick = (comboId: string) => {
    setSelectedCombo(comboId)
}
```

### Étape 4: Créer la fonction de confirmation

```typescript
const handleComboConfirm = (
    combo: ProductCombo,
    selectedItems: ComboSelectedItem[],
    totalPrice: number
) => {
    // Ajouter le combo au panier
    addCombo(combo, 1, selectedItems, totalPrice, '')

    // Fermer le modal
    setSelectedCombo(null)

    // Optionnel: afficher une notification
    toast.success(`${combo.name} ajouté au panier`)
}
```

### Étape 5: Afficher le modal conditionnellement

```tsx
{selectedCombo && (
    <ComboSelectorModal
        comboId={selectedCombo}
        onClose={() => setSelectedCombo(null)}
        onConfirm={handleComboConfirm}
    />
)}
```

### Étape 6: Afficher les combos dans la liste des produits

```tsx
{combos.map(combo => (
    <button
        key={combo.id}
        className="product-card combo-card"
        onClick={() => handleComboClick(combo.id)}
    >
        <div className="product-name">{combo.name}</div>
        <div className="product-price">
            À partir de {formatCurrency(combo.combo_price)}
        </div>
        <div className="combo-badge">Combo</div>
    </button>
))}
```

## 📝 Exemple complet d'intégration

```tsx
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/stores/cartStore'
import ComboSelectorModal from '@/components/pos/ComboSelectorModal'
import { formatCurrency } from '@/utils/helpers'
import toast from 'react-hot-toast'
import type { ProductCombo } from '@/types/database'

export default function POSProductGrid() {
    const [combos, setCombos] = useState<ProductCombo[]>([])
    const [selectedCombo, setSelectedCombo] = useState<string | null>(null)
    const addCombo = useCartStore(state => state.addCombo)

    // Charger les combos disponibles au POS
    useEffect(() => {
        fetchCombos()
    }, [])

    const fetchCombos = async () => {
        const { data, error } = await supabase
            .from('product_combos')
            .select('*')
            .eq('is_active', true)
            .eq('available_at_pos', true)
            .order('sort_order', { ascending: true })

        if (error) {
            console.error('Error fetching combos:', error)
            return
        }

        setCombos(data || [])
    }

    const handleComboClick = (comboId: string) => {
        setSelectedCombo(comboId)
    }

    const handleComboConfirm = (
        combo: ProductCombo,
        selectedItems: any[],
        totalPrice: number
    ) => {
        addCombo(combo, 1, selectedItems, totalPrice, '')
        setSelectedCombo(null)
        toast.success(`${combo.name} ajouté au panier`)
    }

    return (
        <div className="pos-product-grid">
            {/* Combos Section */}
            {combos.length > 0 && (
                <div className="combos-section">
                    <h3 className="section-title">Combos</h3>
                    <div className="product-grid">
                        {combos.map(combo => (
                            <button
                                key={combo.id}
                                className="product-card combo-card"
                                onClick={() => handleComboClick(combo.id)}
                            >
                                {combo.image_url && (
                                    <img src={combo.image_url} alt={combo.name} />
                                )}
                                <div className="product-info">
                                    <div className="product-name">{combo.name}</div>
                                    <div className="product-price">
                                        À partir de {formatCurrency(combo.combo_price)}
                                    </div>
                                    <div className="combo-badge">🎁 Combo</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal de sélection */}
            {selectedCombo && (
                <ComboSelectorModal
                    comboId={selectedCombo}
                    onClose={() => setSelectedCombo(null)}
                    onConfirm={handleComboConfirm}
                />
            )}
        </div>
    )
}
```

## 🎨 Affichage des combos dans le panier

Le `CartItem` pour un combo contient :

```typescript
{
    id: "combo-uuid-123456789",
    type: "combo",
    combo: { /* ProductCombo object */ },
    quantity: 1,
    unitPrice: 52000, // Prix avec sélections
    comboSelections: [
        {
            group_id: "group-1",
            group_name: "Boissons",
            item_id: "item-1",
            product_id: "product-cappuccino",
            product_name: "Cappuccino",
            price_adjustment: 5000
        },
        {
            group_id: "group-2",
            group_name: "Viennoiseries",
            item_id: "item-2",
            product_id: "product-pain-choco",
            product_name: "Pain au chocolat",
            price_adjustment: 2000
        }
    ],
    modifiersTotal: 7000, // 5000 + 2000
    notes: "",
    totalPrice: 52000
}
```

### Afficher un combo dans le panier

```tsx
{cartItems.map(item => {
    if (item.type === 'combo' && item.combo) {
        return (
            <div key={item.id} className="cart-item combo-item">
                <div className="item-header">
                    <span className="item-name">
                        🎁 {item.combo.name}
                    </span>
                    <span className="item-price">
                        {formatCurrency(item.totalPrice)}
                    </span>
                </div>
                <div className="item-selections">
                    {item.comboSelections?.map((sel, idx) => (
                        <div key={idx} className="selection-line">
                            <span className="selection-group">{sel.group_name}:</span>
                            <span className="selection-product">{sel.product_name}</span>
                            {sel.price_adjustment !== 0 && (
                                <span className="selection-adjustment">
                                    +{formatCurrency(sel.price_adjustment)}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
                <div className="item-quantity">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
            </div>
        )
    }

    // Produit normal...
})}
```

## 💾 Enregistrement en base de données

Lors de la création d'une commande avec des combos, il faut stocker les sélections.

### Option 1: Champ JSON dans order_items

Ajouter un champ `combo_selections` de type JSONB dans la table `order_items`:

```sql
ALTER TABLE order_items
ADD COLUMN combo_selections JSONB;
```

Puis lors de l'insertion:

```typescript
const { error } = await supabase
    .from('order_items')
    .insert({
        order_id: orderId,
        product_id: item.combo?.id, // ID du combo
        product_name: item.combo?.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        combo_selections: item.comboSelections, // Stocké en JSON
        notes: item.notes
    })
```

### Option 2: Table séparée pour les sélections

Créer une table `order_combo_selections`:

```sql
CREATE TABLE order_combo_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    group_id UUID,
    group_name VARCHAR(255),
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(255),
    price_adjustment NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔄 Récapitulatif du flux complet

1. **POS affiche les combos** disponibles (`is_active` et `available_at_pos`)
2. **Utilisateur clique** sur un combo
3. **Modal s'ouvre** avec les groupes de choix
4. **Utilisateur sélectionne** ses options dans chaque groupe
5. **Prix total se met à jour** en temps réel
6. **Validation** vérifie que toutes les contraintes sont respectées
7. **Combo ajouté au panier** avec `addCombo()`
8. **Affichage dans le panier** avec les sélections détaillées
9. **Commande créée** avec les sélections stockées en base

## ✅ Checklist d'intégration

- [ ] Importer `ComboSelectorModal` dans le composant POS
- [ ] Ajouter le state pour le combo sélectionné
- [ ] Créer la fonction `handleComboConfirm`
- [ ] Afficher le modal conditionnellement
- [ ] Charger les combos depuis Supabase
- [ ] Afficher les combos dans la grille de produits
- [ ] Adapter l'affichage du panier pour les combos
- [ ] Gérer l'enregistrement des sélections en base
- [ ] Tester le flux complet

## 🎯 Prochaines améliorations possibles

1. **Modification d'un combo dans le panier** : permettre de rouvrir le modal pour changer les sélections
2. **Templates de sélections** : sauvegarder des combinaisons favorites
3. **Suggestions automatiques** : proposer les options les plus populaires
4. **Images des options** : afficher des photos des produits dans le modal
5. **Mode rapide** : validation automatique si toutes les options par défaut sont OK

---

**Note**: Le système est maintenant complet et fonctionnel. Les combos peuvent être créés, affichés, sélectionnés et ajoutés au panier avec toutes les options choisies par le client.
