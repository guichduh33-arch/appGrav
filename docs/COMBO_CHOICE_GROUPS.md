# Système de Combos avec Groupes de Choix

## 🎯 Concept

Le nouveau système de combos permet de créer des offres où **le client choisit parmi des groupes d'options**, avec des **suppléments de prix** possibles pour certaines options premium.

## 📦 Exemple concret

### Combo "Petit Déjeuner" - 45,000 IDR (prix de base)

**Groupe 1: Boissons** (obligatoire, choix unique)
- ☕ Café (+0 IDR) [par défaut, inclus dans le prix]
- ☕ Cappuccino (+5,000 IDR) [supplément]
- 🧃 Jus d'orange (+3,000 IDR) [supplément]

**Groupe 2: Viennoiseries** (obligatoire, choix unique)
- 🥐 Croissant (+0 IDR) [par défaut, inclus]
- 🍫 Pain au chocolat (+2,000 IDR) [supplément]
- 🥖 Baguette (+1,000 IDR) [supplément]

### Prix final calculé:
- Client choisit: Cappuccino + Pain au chocolat
- **Prix total: 45,000 + 5,000 + 2,000 = 52,000 IDR**

## 🗄️ Structure de la base de données

### Migration: `031_combo_choice_groups.sql`

#### Table `product_combo_groups`
Définit les groupes de choix dans un combo.

```sql
CREATE TABLE product_combo_groups (
    id UUID PRIMARY KEY,
    combo_id UUID REFERENCES product_combos(id),
    group_name VARCHAR(255),           -- Ex: "Boissons", "Viennoiseries"
    group_type VARCHAR(20),            -- 'single' ou 'multiple'
    is_required BOOLEAN,               -- Client doit choisir?
    min_selections INTEGER,            -- Min d'options à choisir
    max_selections INTEGER,            -- Max d'options à choisir
    sort_order INTEGER                 -- Ordre d'affichage
);
```

**Champs importants**:
- `group_name`: Nom du groupe affiché au client
- `group_type`:
  - `'single'`: Choisir 1 seule option (radio button)
  - `'multiple'`: Choisir plusieurs options (checkboxes)
- `is_required`: Si `true`, le client doit faire un choix
- `min_selections` / `max_selections`: Pour type `'multiple'`, définit combien d'options peuvent être sélectionnées

#### Table `product_combo_group_items`
Options disponibles dans chaque groupe.

```sql
CREATE TABLE product_combo_group_items (
    id UUID PRIMARY KEY,
    group_id UUID REFERENCES product_combo_groups(id),
    product_id UUID REFERENCES products(id),
    price_adjustment NUMERIC(10, 2),   -- Supplément de prix
    is_default BOOLEAN,                -- Option par défaut?
    sort_order INTEGER                 -- Ordre d'affichage
);
```

**Champs importants**:
- `product_id`: Référence au produit dans la table `products`
- `price_adjustment`:
  - `0`: Inclus dans le prix de base du combo
  - `> 0`: Supplément à ajouter (ex: 5000 pour +5,000 IDR)
  - `< 0`: Réduction possible (rare)
- `is_default`: Si `true`, cette option est pré-sélectionnée

## 📊 Schéma relationnel

```
product_combos (combo principal)
    ↓ 1:N
product_combo_groups (groupes de choix)
    ↓ 1:N
product_combo_group_items (options dans chaque groupe)
    ↓ N:1
products (produits existants)
```

## 🔧 Fonctions SQL disponibles

### `get_combo_with_groups(combo_id)`
Retourne un combo avec tous ses groupes et options en JSON.

```sql
SELECT get_combo_with_groups('combo-uuid-here');
```

**Retour**:
```json
{
  "combo": {...},
  "groups": [
    {
      "group": {
        "id": "...",
        "group_name": "Boissons",
        "group_type": "single",
        "is_required": true
      },
      "items": [
        {
          "id": "...",
          "product_id": "...",
          "product": {...},
          "price_adjustment": 0,
          "is_default": true
        },
        {
          "id": "...",
          "product_id": "...",
          "product": {...},
          "price_adjustment": 5000,
          "is_default": false
        }
      ]
    }
  ]
}
```

### `calculate_combo_total_price(combo_id, selected_items[])`
Calcule le prix total d'un combo avec les options sélectionnées.

```sql
SELECT calculate_combo_total_price(
    'combo-uuid',
    ARRAY['item-uuid-1', 'item-uuid-2']
);
```

**Retour**: `52000` (prix de base + ajustements)

## 💡 Cas d'usage

### Cas 1: Choix simple (1 parmi plusieurs)
**Combo Sandwich - 35,000 IDR**

Groupe "Type de pain" (single, required):
- Pain blanc (+0)
- Pain complet (+2,000)
- Baguette (+3,000)

### Cas 2: Choix multiple avec limites
**Combo Salade - 40,000 IDR**

Groupe "Ingrédients" (multiple, min=2, max=4):
- Tomate (+0) ✓
- Concombre (+0) ✓
- Avocat (+5,000)
- Poulet (+8,000)
- Fromage (+4,000)

Client peut choisir 2 à 4 ingrédients.

### Cas 3: Groupes multiples
**Combo Complet - 60,000 IDR**

Groupe 1 "Plat principal" (single, required):
- Quiche (+0)
- Tarte salée (+3,000)

Groupe 2 "Accompagnement" (single, required):
- Salade (+0)
- Soupe (+5,000)

Groupe 3 "Boisson" (single, optional):
- Eau (+0)
- Soda (+3,000)
- Jus (+5,000)

Groupe 4 "Extras" (multiple, min=0, max=2, optional):
- Pain (+2,000)
- Dessert (+8,000)
- Café (+4,000)

## 🎨 Interface utilisateur

### Affichage dans le formulaire de création

Le formulaire `ComboFormPage` doit permettre:

1. **Créer des groupes**:
   - Nom du groupe
   - Type (single/multiple)
   - Requis? (oui/non)
   - Min/Max sélections

2. **Ajouter des produits à chaque groupe**:
   - Recherche de produit
   - Supplément de prix
   - Marquer comme défaut
   - Ordre d'affichage

3. **Aperçu en temps réel**:
   - Prix de base
   - Prix minimum (avec options par défaut)
   - Prix maximum (avec toutes les options premium)

### Affichage au POS

Lors de la sélection d'un combo au POS:

```
┌─────────────────────────────────────┐
│ Combo Petit Déjeuner - 45,000 IDR   │
├─────────────────────────────────────┤
│ ☕ Choisissez votre boisson:         │
│   ○ Café (+0)                       │
│   ○ Cappuccino (+5,000) ◄ sélection│
│   ○ Jus (+3,000)                    │
├─────────────────────────────────────┤
│ 🥐 Choisissez votre viennoiserie:   │
│   ○ Croissant (+0)                  │
│   ○ Pain choco (+2,000) ◄ sélection│
│   ○ Baguette (+1,000)               │
├─────────────────────────────────────┤
│ Total: 52,000 IDR                   │
│ [Ajouter au panier]                 │
└─────────────────────────────────────┘
```

## 🔄 Flux de travail

### 1. Création d'un combo

```typescript
// 1. Créer le combo
const combo = await supabase
  .from('product_combos')
  .insert({ name: 'Petit Déjeuner', combo_price: 45000 })
  .select()
  .single()

// 2. Créer le groupe "Boissons"
const groupDrinks = await supabase
  .from('product_combo_groups')
  .insert({
    combo_id: combo.id,
    group_name: 'Boissons',
    group_type: 'single',
    is_required: true,
    min_selections: 1,
    max_selections: 1
  })
  .select()
  .single()

// 3. Ajouter les options de boissons
await supabase
  .from('product_combo_group_items')
  .insert([
    {
      group_id: groupDrinks.id,
      product_id: 'coffee-id',
      price_adjustment: 0,
      is_default: true
    },
    {
      group_id: groupDrinks.id,
      product_id: 'cappuccino-id',
      price_adjustment: 5000,
      is_default: false
    }
  ])
```

### 2. Sélection au POS

```typescript
// Récupérer le combo avec ses groupes
const { data } = await supabase
  .rpc('get_combo_with_groups', { p_combo_id: comboId })

// Client sélectionne des options
const selectedItems = [
  'cappuccino-item-id', // +5,000
  'pain-choco-item-id'  // +2,000
]

// Calculer le prix total
const { data: totalPrice } = await supabase
  .rpc('calculate_combo_total_price', {
    p_combo_id: comboId,
    p_selected_items: selectedItems
  })

// totalPrice = 52000 (45000 + 5000 + 2000)
```

### 3. Ajout au panier

```typescript
// Dans le cartStore
{
  type: 'combo',
  combo_id: 'combo-uuid',
  combo_name: 'Petit Déjeuner',
  selected_items: [
    {
      group_name: 'Boissons',
      product_name: 'Cappuccino',
      price_adjustment: 5000
    },
    {
      group_name: 'Viennoiseries',
      product_name: 'Pain au chocolat',
      price_adjustment: 2000
    }
  ],
  total_price: 52000
}
```

## ✅ Avantages du système

1. **Flexibilité**: Le client compose son combo selon ses préférences
2. **Upselling**: Options premium avec suppléments de prix
3. **Clarté**: Prix transparents, client voit les suppléments
4. **Gestion**: Facile d'ajouter/modifier des options sans recréer le combo
5. **Réutilisabilité**: Les produits existants sont réutilisés
6. **Évolutif**: Supporte des combos simples ou complexes

## 🔒 Règles de validation

### Côté backend (SQL)
- Les groupes requis doivent avoir au moins 1 item
- `min_selections` ≤ `max_selections`
- Pour type `'single'`: `max_selections` = 1

### Côté frontend
- Vérifier que tous les groupes requis ont une sélection
- Respecter min/max selections pour type `'multiple'`
- Afficher le prix total mis à jour en temps réel

## 📝 TODO pour l'implémentation

- [ ] Mettre à jour `ComboFormPage` pour gérer les groupes
- [ ] Mettre à jour `CombosPage` pour afficher les groupes
- [ ] Créer le composant de sélection de combo au POS
- [ ] Mettre à jour le cartStore pour gérer les combos avec sélections
- [ ] Ajouter la logique de validation des sélections
- [ ] Créer les tests unitaires pour le calcul de prix

## 🎯 Exemple complet SQL

Voir le fichier `031_combo_choice_groups.sql` pour un exemple commenté de création d'un combo avec groupes.

---

**Note**: Ce système remplace l'ancien système `product_combo_items` qui était plus limité (quantité fixe + optionnel).
