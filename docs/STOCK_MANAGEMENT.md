# Gestion des Stocks - The Breakery POS

## Vue d'ensemble

Le système de gestion des stocks de The Breakery utilise un modèle basé sur les **sections** pour suivre l'inventaire de manière précise et permettre un contrôle granulaire des mouvements de stock.

## Architecture

### Concept de Sections

Une **section** représente une équipe ou zone de travail qui gère son propre stock. Chaque section a un type qui définit son rôle:

| Type | Description | Exemples |
|------|-------------|----------|
| `warehouse` | Stockage principal des matières premières | Warehouse |
| `production` | Transforme les produits | Viennoiserie, Pâtisserie, Boulangerie, Cuisine Chaude |
| `sales` | Vend aux clients | Café, Bar |

### Structure de données

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    sections     │     │  section_stock  │     │    products     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │◄────│ section_id      │     │ id              │
│ name            │     │ product_id      │────►│ name            │
│ code            │     │ quantity        │     │ current_stock   │
│ section_type    │     │ min_quantity    │     │ product_type    │
│ manager_id      │     │ max_quantity    │     └─────────────────┘
│ icon            │     │ last_counted_at │
└─────────────────┘     └─────────────────┘
```

## Stock par Section

### Table `section_stock`

Chaque combinaison section/produit a sa propre entrée de stock:

```sql
-- Structure
section_stock (
    section_id      -- Section propriétaire
    product_id      -- Produit concerné
    quantity        -- Quantité actuelle
    min_quantity    -- Seuil d'alerte (réapprovisionnement)
    max_quantity    -- Quantité maximale suggérée
    last_counted_at -- Dernier inventaire
)
```

### Synchronisation avec `products.current_stock`

Un trigger automatique maintient `products.current_stock` comme la somme de tous les stocks de section:

```sql
products.current_stock = SUM(section_stock.quantity)
```

Cela permet de conserver une vue globale tout en ayant le détail par section.

## Types de Produits

| Type | Description | Comportement de déduction |
|------|-------------|---------------------------|
| `raw_material` | Matière première | Déduit de la section qui **consomme** |
| `semi_finished` | Produit semi-fini | Déduit de la section qui **produit** |
| `finished` | Produit fini | Vendu directement |

### Logique de déduction des recettes

Quand une section produit ou vend un produit avec recette:

```
Si ingrédient = raw_material:
    → Déduire du stock de la SECTION CONSOMMATRICE

Si ingrédient = semi_finished:
    → Déduire du stock de la SECTION D'ORIGINE (productrice)
```

**Exemple:** La Cuisine Chaude produit un "Croissant Jambon Fromage"
- Croissant Stock (semi_finished) → Déduit du stock **Viennoiserie**
- Jambon (raw_material) → Déduit du stock **Cuisine Chaude**
- Fromage (raw_material) → Déduit du stock **Cuisine Chaude**

## Transferts Internes

### Workflow quotidien de réapprovisionnement

```
1. Chef de section identifie les besoins
2. Création d'une demande de transfert (Warehouse → Section)
3. Validation par le responsable warehouse
4. Préparation et envoi
5. Réception par la section destinataire
6. Mise à jour automatique des stocks
```

### Statuts des transferts

| Statut | Description |
|--------|-------------|
| `draft` | Brouillon, en cours de préparation |
| `pending` | En attente de validation/envoi |
| `in_transit` | En cours de livraison |
| `received` | Réceptionné |
| `cancelled` | Annulé |

### Création d'un transfert

**Route:** `/inventory/transfers/new`

```typescript
// Paramètres
{
  fromSectionId: string,    // Section source (ex: Warehouse)
  toSectionId: string,      // Section destination (ex: Viennoiserie)
  items: [{
    productId: string,
    quantity: number
  }],
  responsiblePerson: string,
  transferDate: string,
  notes?: string
}
```

### Mouvements de stock générés

À la réception d'un transfert:
1. **OUT** de la section source (quantité négative)
2. **IN** vers la section destination (quantité positive)

## Stock Opname (Inventaire)

### Fréquence recommandée

- **Hebdomadaire:** Inventaire complet par section
- **Quotidien:** Vérification des produits critiques

### Processus

1. Accéder à `/inventory/opname`
2. Sélectionner la section à inventorier
3. Compter physiquement chaque produit
4. Saisir les quantités comptées
5. Valider l'inventaire
6. Les écarts sont automatiquement ajustés

### Ajustements automatiques

Les différences entre stock système et comptage physique génèrent des mouvements d'ajustement:
- `adjustment_in` si comptage > système
- `adjustment_out` si comptage < système

## Interface utilisateur

### Navigation

L'onglet **Transferts** est accessible via:
```
Inventaire → Transferts
```

### Pages disponibles

| Route | Description |
|-------|-------------|
| `/inventory/transfers` | Liste des transferts |
| `/inventory/transfers/new` | Nouveau transfert |
| `/inventory/transfers/:id` | Détail d'un transfert |
| `/inventory/opname` | Liste des inventaires |
| `/inventory/opname/new` | Nouvel inventaire |

## Hooks React

### `useSections()`

Récupère les sections avec filtrage optionnel:

```typescript
const { data: sections } = useSections({
  sectionType: 'production',
  isActive: true
})
```

### `useSectionsByType()`

Regroupe les sections par type:

```typescript
const {
  warehouses,         // section_type = 'warehouse'
  productionSections, // section_type = 'production'
  salesSections       // section_type = 'sales'
} = useSectionsByType()
```

### `useInternalTransfers()`

Récupère les transferts avec filtrage:

```typescript
const { data: transfers } = useInternalTransfers({
  status: 'pending',
  fromSectionId: warehouseId
})
```

### `useCreateTransfer()`

Mutation pour créer un transfert:

```typescript
const createMutation = useCreateTransfer()
await createMutation.mutateAsync({
  fromSectionId,
  toSectionId,
  items: [{ productId, quantity }],
  responsiblePerson: 'Chef Pâtisserie'
})
```

## Base de données

### Tables principales

| Table | Description |
|-------|-------------|
| `sections` | Définition des sections |
| `section_stock` | Stock par section/produit |
| `internal_transfers` | En-têtes de transferts |
| `transfer_items` | Lignes de transferts |
| `stock_movements` | Historique des mouvements |

### Vues utiles

| Vue | Description |
|-----|-------------|
| `view_section_stock_details` | Stock par section avec statut |
| `view_section_transfers` | Transferts avec noms de sections |

### Fonctions SQL

```sql
-- Obtenir la section de déduction pour un ingrédient
get_ingredient_deduction_section(
  p_ingredient_id UUID,
  p_consuming_section_id UUID
) RETURNS UUID

-- Appelé automatiquement par trigger
sync_product_total_stock() -- Met à jour products.current_stock
update_transfer_totals()   -- Met à jour total_items et total_value
```

## Migrations

Les migrations suivantes implémentent le modèle:

1. `002_core_products.sql` - Tables de base (sections, products)
2. `20260203110000_section_stock_model.sql` - Modèle de stock par section
3. `20260203120000_internal_transfers_sections.sql` - Support sections pour transferts

## Permissions requises

| Action | Permission |
|--------|------------|
| Voir les stocks | `inventory.view` |
| Créer un transfert | `inventory.create` |
| Modifier un stock | `inventory.update` |
| Ajuster un stock | `inventory.adjust` |

## Bonnes pratiques

1. **Toujours utiliser les transferts** pour déplacer du stock entre sections
2. **Faire l'inventaire régulièrement** pour maintenir la précision
3. **Configurer les seuils min/max** pour les alertes de réapprovisionnement
4. **Documenter les écarts** lors des ajustements d'inventaire
5. **Former les chefs de section** à la gestion de leur stock

## Diagramme de flux

```
                    ┌─────────────┐
                    │  WAREHOUSE  │
                    │   (Stock)   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │VIENNOISE.│ │PÂTISSERIE│ │BOULANGER.│
        │(Produit) │ │(Produit) │ │(Produit) │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             │            │            │
             └────────────┼────────────┘
                          │
                          ▼
                    ┌──────────┐
                    │   CAFÉ   │
                    │  (Vente) │
                    └──────────┘
```

## Support

Pour toute question sur la gestion des stocks:
- Consultez les logs d'audit: `/settings/audit`
- Vérifiez les mouvements: `/inventory/movements`
- Contactez l'administrateur système
