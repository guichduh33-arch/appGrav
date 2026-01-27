# Système de Variants avec Tracking des Ingrédients

## Vue d'ensemble

Le système de variants a été étendu pour permettre l'association d'ingrédients spécifiques à chaque option de variant. Lorsqu'un client sélectionne un variant (ex: "Lait d'avoine" au lieu de "Lait frais"), le système déduit automatiquement le bon ingrédient du stock.

## Architecture Complète

### 1. Base de données

#### Table `product_modifiers` (étendue)

```sql
-- Colonnes existantes
product_id UUID
group_name VARCHAR       -- Ex: "Lait", "Taille"
group_type VARCHAR       -- 'single' ou 'multiple'
group_required BOOLEAN
option_id VARCHAR
option_label VARCHAR     -- Ex: "Lait d'avoine"
price_adjustment DECIMAL
is_default BOOLEAN
is_active BOOLEAN

-- Nouvelles colonnes (Migration 089)
material_id UUID         -- ID du produit/ingrédient à déduire
material_quantity DECIMAL -- Quantité à déduire (ex: 250 pour 250ml)
```

#### Table `order_items` (étendue)

```sql
-- Nouvelle colonne (Migration 090)
selected_variants JSONB  -- Variants sélectionnés avec leurs ingrédients

-- Structure JSON:
{
  "variants": [
    {
      "groupName": "Lait",
      "optionIds": ["opt_123"],
      "optionLabels": ["Lait d'avoine"],
      "materials": [
        {
          "materialId": "uuid-produit-lait-avoine",
          "quantity": 250
        }
      ]
    }
  ]
}
```

### 2. Trigger de Déduction (Migration 091)

Le trigger `deduct_stock_on_sale()` a été mis à jour pour:

1. **Vérifier si des variants avec matériaux sont sélectionnés**
   - Parse le champ JSON `selected_variants`
   - Extrait les materials de chaque variant

2. **Déduire les ingrédients des variants** (prioritaire)
   - Si des materials sont trouvés dans selected_variants
   - Crée des mouvements de stock pour chaque material
   - Type de mouvement: `sale_pos` ou `sale_b2b`

3. **Déduire les ingrédients de la recette** (fallback)
   - Si aucun variant material trouvé
   - Utilise la recette de base du produit
   - Comportement identique à avant

### 3. Frontend

#### VariantsTab (Admin)

**Emplacement**: `src/pages/inventory/tabs/VariantsTab.tsx`

**Nouvelles fonctionnalités**:
- Sélection d'un produit/ingrédient pour chaque option
- Saisie de la quantité d'ingrédient
- Affichage de l'unité du produit sélectionné (ex: "ml", "g", "pcs")
- Validation automatique

**Interface**:
```
Option: Lait d'avoine  |  Prix: +5000  |  ☑ Défaut

Ingrédient à déduire (optionnel):
[Dropdown: Lait d'avoine (LAV-001)]

Quantité (ml):
[Input: 250]
```

#### VariantModal (POS)

**Emplacement**: `src/components/pos/modals/VariantModal.tsx`

**Flux**:
1. Charge les variants depuis `product_modifiers`
2. Affiche les catégories et options
3. Collecte les sélections avec leurs materials
4. Passe les `selectedVariants` structurés au panier

```typescript
const selectedVariants = [
  {
    groupName: "Lait",
    optionIds: ["opt_123"],
    optionLabels: ["Lait d'avoine"],
    materials: [
      { materialId: "uuid-xxx", quantity: 250 }
    ]
  }
]
```

#### CartStore

**Emplacement**: `src/stores/cartStore.ts`

**Nouvelles interfaces**:
```typescript
interface VariantMaterial {
  materialId: string
  quantity: number
}

interface SelectedVariant {
  groupName: string
  optionIds: string[]
  optionLabels: string[]
  materials: VariantMaterial[]
}

interface CartItem {
  // ... champs existants
  selectedVariants?: SelectedVariant[]
}
```

**Fonction modifiée**:
```typescript
addItem(product, quantity, modifiers, notes, selectedVariants?)
```

#### useOrders Hook

**Emplacement**: `src/hooks/useOrders.ts`

**Modification**:
Lors de la création des `order_items`, inclut le champ `selected_variants`:

```typescript
const itemsData = items.map(item => ({
  // ... autres champs
  selected_variants: item.selectedVariants
    ? { variants: item.selectedVariants }
    : null
}))
```

## Flux Complet

### Configuration (Admin)

1. **Créer un produit** : "Café Latte" avec `deduct_ingredients_on_sale = true`

2. **Ajouter des variants** dans l'onglet Variants:
   ```
   Catégorie: Lait (Single, Requis)

   Option 1: Lait frais
   - Prix: +0 IDR
   - Ingrédient: Lait frais (ID: xxx)
   - Quantité: 250 ml

   Option 2: Lait d'avoine
   - Prix: +5000 IDR
   - Ingrédient: Lait d'avoine (ID: yyy)
   - Quantité: 250 ml

   Option 3: Lait de soja
   - Prix: +3000 IDR
   - Ingrédient: Lait de soja (ID: zzz)
   - Quantité: 250 ml
   ```

### Utilisation (POS)

1. **Serveur clique** sur "Café Latte"
2. **Modal s'ouvre** avec la catégorie "Lait"
3. **Serveur sélectionne** "Lait d'avoine"
4. **Prix ajusté** : 35,000 → 40,000 IDR
5. **Ajout au panier** :
   ```
   CartItem {
     product: Café Latte,
     unitPrice: 40000,
     notes: "Lait: Lait d'avoine",
     selectedVariants: [
       {
         groupName: "Lait",
         optionIds: ["opt_123"],
         optionLabels: ["Lait d'avoine"],
         materials: [
           { materialId: "yyy", quantity: 250 }
         ]
       }
     ]
   }
   ```

### Paiement et Déduction

1. **Client paie** → `createOrder()` appelé
2. **Order créé** avec status 'new', payment_status 'paid'
3. **Order_items insérés** avec `selected_variants` JSON
4. **Trigger `deduct_stock_on_sale` s'exécute**:

   a. Déduit le produit fini :
   ```sql
   Stock "Café Latte": 50 → 49
   Movement: sale_pos, quantity: -1
   ```

   b. Parse `selected_variants` JSON

   c. Trouve material: Lait d'avoine (yyy), quantity: 250

   d. Déduit l'ingrédient du variant :
   ```sql
   Stock "Lait d'avoine": 5000ml → 4750ml
   Movement: sale_pos, quantity: -250
   Reason: "Variant ingredient for made-to-order sale"
   ```

### Stock Movements (Résultat)

Dans la page Stock Movements, on verra:

```
Date: 28/01/2026 14:35
Produit: Café Latte
Type: Vente POS
Quantité: -1 pcs
Stock avant: 50 pcs
Stock après: 49 pcs

Date: 28/01/2026 14:35
Produit: Lait d'avoine
Type: Vente POS
Quantité: -250 ml
Stock avant: 5000 ml
Stock après: 4750 ml
Raison: Variant ingredient for made-to-order sale
```

## Cas d'usage

### Cas 1: Produit avec variants et ingrédients configurés

**Exemple**: Café avec types de lait

- Chaque option a son ingrédient configuré
- Le trigger déduit l'ingrédient sélectionné
- ✅ **Utilise les materials des variants**

### Cas 2: Produit avec variants sans ingrédients

**Exemple**: Pizza avec tailles (Small/Large) sans material_id

- Variants définis mais aucun material_id
- Le trigger utilise la recette de base
- ✅ **Fallback sur la recette**

### Cas 3: Produit sans variants

**Exemple**: Croissant classique

- Pas de variants définis
- `selected_variants = null` dans order_items
- Le trigger utilise la recette de base
- ✅ **Fallback sur la recette**

### Cas 4: Produit avec `deduct_ingredients_on_sale = false`

**Exemple**: Pain pré-produit

- Ingrédients déjà déduits lors de la production
- Le trigger ne déduit rien
- ✅ **Pas de déduction d'ingrédients**

## Migrations

| #   | Fichier | Description |
|-----|---------|-------------|
| 089 | `089_add_variant_material_tracking.sql` | Ajoute `material_id` et `material_quantity` à `product_modifiers` |
| 090 | `090_add_order_items_variants_field.sql` | Ajoute `selected_variants JSONB` à `order_items` |
| 091 | `091_update_stock_deduction_with_variants.sql` | Met à jour le trigger `deduct_stock_on_sale()` pour gérer les variants |

## Avantages

1. **Flexibilité** : Chaque option peut avoir son propre ingrédient
2. **Précision** : Déduction du bon ingrédient basée sur la sélection client
3. **Traçabilité** : Mouvements de stock distincts pour chaque variant
4. **Fallback** : Compatible avec les produits sans variants
5. **Performance** : Trigger SQL optimal, un seul INSERT trigger

## Exemple Complet: Bubble Tea

### Configuration

```
Produit: Bubble Tea Classic
Prix de base: 25,000 IDR
deduct_ingredients_on_sale: true

Variant 1: Base
- Thé noir (0 IDR) → Thé noir liquide, 300ml
- Thé vert (+2000 IDR) → Thé vert liquide, 300ml

Variant 2: Topping (Multiple)
- Perles tapioca (+5000 IDR) → Perles tapioca, 50g
- Gelée coco (+4000 IDR) → Gelée coco, 40g
- Pudding (+4000 IDR) → Pudding, 40g

Variant 3: Niveau de sucre (Single)
- 0% (0 IDR) → Aucun matériel
- 50% (0 IDR) → Sirop sucre, 15ml
- 100% (0 IDR) → Sirop sucre, 30ml
```

### Commande Exemple

Client commande:
- Base: Thé vert (+2000)
- Topping: Perles + Gelée (+9000)
- Sucre: 50% (0)

**Prix total**: 36,000 IDR

**Déductions stock**:
1. Bubble Tea Classic: -1 pcs
2. Thé vert liquide: -300 ml
3. Perles tapioca: -50 g
4. Gelée coco: -40 g
5. Sirop sucre: -15 ml

**5 mouvements de stock** créés automatiquement !

## Notes Techniques

- **Unités**: L'unité de l'ingrédient s'affiche automatiquement dans l'interface admin
- **Validation**: La quantité est désactivée si aucun ingrédient n'est sélectionné
- **Performance**: Index GIN sur `selected_variants` pour recherches JSON rapides
- **Type de mouvement**: Les variants utilisent le même type que la vente (`sale_pos` ou `sale_b2b`)

## Fichiers Modifiés

### Migrations SQL
- `089_add_variant_material_tracking.sql`
- `090_add_order_items_variants_field.sql`
- `091_update_stock_deduction_with_variants.sql`

### Frontend
- `src/hooks/products/useProductVariants.ts` - Ajout material_id et material_quantity
- `src/pages/inventory/tabs/VariantsTab.tsx` - UI pour configurer les ingrédients
- `src/components/pos/modals/VariantModal.tsx` - Collecte et envoie les variants
- `src/stores/cartStore.ts` - Nouvelles interfaces et paramètre selectedVariants
- `src/hooks/useOrders.ts` - Inclut selected_variants dans order_items

### Documentation
- `VARIANTS_POS_INTEGRATION.md` - Documentation du système de base
- `VARIANTS_WITH_INGREDIENT_TRACKING.md` - Ce document
