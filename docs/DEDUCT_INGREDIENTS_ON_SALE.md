# Déduction des ingrédients lors de la vente

## Nouveau champ : `deduct_ingredients_on_sale`

### Description
Certains produits sont préparés à la demande (ex: café, sandwiches) et doivent déduire les ingrédients lors de la vente.
D'autres produits sont pré-produits en batch (ex: croissants, pains) et les ingrédients ont déjà été déduits lors de la production.

### Champ de base de données
```sql
ALTER TABLE products
ADD COLUMN deduct_ingredients_on_sale BOOLEAN DEFAULT FALSE;
```

**Défaut**: `FALSE` (les ingrédients ne sont pas déduits à la vente)

### Comportement

#### Cas 1: `deduct_ingredients_on_sale = FALSE` (défaut)
- Produits pré-fabriqués en batch (croissants, pains, pâtisseries)
- Les ingrédients sont déduits lors de l'enregistrement de la production
- Lors de la vente: seul le produit fini est déduit du stock

#### Cas 2: `deduct_ingredients_on_sale = TRUE`
- Produits faits à la demande (café, sandwiches, smoothies)
- Lors de la vente:
  1. Le produit fini est déduit du stock
  2. Tous les ingrédients de la recette sont automatiquement déduits
  3. Des mouvements de stock `production_out` sont créés pour chaque ingrédient

### Exemple

**Produit: Café Latte**
- `deduct_ingredients_on_sale = TRUE`
- Recette:
  - Café moulu: 18g
  - Lait: 250ml

**Lors de la vente de 1 Café Latte:**
1. Stock de "Café Latte" : -1
2. Stock de "Café moulu" : -18g
3. Stock de "Lait" : -250ml

**Mouvements de stock créés:**
- 1x `sale_pos` pour le Café Latte
- 1x `production_out` pour le Café moulu
- 1x `production_out` pour le Lait

### Mise à jour des types TypeScript

Après avoir régénéré les types depuis Supabase:
```bash
npx supabase gen types typescript --local > src/types/database.generated.ts
```

Le type `Product` inclura:
```typescript
export type Product = {
  // ... autres champs
  deduct_ingredients_on_sale: boolean
}
```

### Configuration dans l'interface

Pour configurer ce paramètre, il faudra ajouter un toggle dans le formulaire de produit:
- Emplacement suggéré: Section "Inventaire" ou "Production"
- Label: "Déduire les ingrédients à la vente"
- Description: "Activer pour les produits faits à la demande (café, sandwiches, etc.)"

### Migration appliquée
- ✅ `087_add_deduct_ingredients_flag.sql`
- Trigger `deduct_stock_on_sale()` mis à jour pour gérer la déduction des ingrédients
