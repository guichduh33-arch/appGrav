# Logique de Déduction de Stock lors des Ventes

## Vue d'ensemble

Le système gère deux types de produits avec des comportements de déduction différents :

1. **Produits pré-fabriqués (batch)** - Le stock du produit fini est déduit
2. **Produits faits à la demande (made-to-order)** - Seuls les ingrédients sont déduits

## Champ `deduct_ingredients_on_sale`

Ce champ booléen dans la table `products` détermine le comportement de déduction :

- **`false`** (défaut) → Produit pré-fabriqué en batch
- **`true`** → Produit fait à la demande

## Comportements Détaillés

### Cas 1 : Produits Pré-fabriqués (`deduct_ingredients_on_sale = false`)

**Exemples** : Croissants, pains, gâteaux, viennoiseries

**Flux de production** :
1. Production batch : Ingrédients déduits, produits finis ajoutés au stock
2. Vente : Le produit fini est déduit du stock

**Lors de la vente** :
```
Produit: Croissant
Stock avant: 50 pcs
Vente: 3 croissants

Mouvements créés:
✅ Croissant: -3 pcs (50 → 47)
❌ Ingrédients: PAS de déduction (déjà déduits lors de la production)
```

**Raison** : Les ingrédients ont déjà été déduits lors de la production en batch. Le stock du produit fini représente les unités physiques disponibles.

---

### Cas 2 : Produits Faits à la Demande (`deduct_ingredients_on_sale = true`)

**Exemples** : Café, smoothies, sandwiches faits sur commande

**Flux de production** :
1. Pas de production batch
2. Vente : Les ingrédients sont déduits à la demande

**Lors de la vente - SANS variants** :
```
Produit: Café Latte
Recette:
  - Café moulu: 18g
  - Lait frais: 250ml

Vente: 1 Café Latte

Mouvements créés:
❌ Café Latte: PAS de déduction (produit virtuel, pas en stock)
✅ Café moulu: -18g
✅ Lait frais: -250ml
```

**Lors de la vente - AVEC variants** :
```
Produit: Café Latte
Recette de base:
  - Café moulu: 18g
  - Lait frais: 250ml (par défaut)

Variant sélectionné: "Lait d'avoine"
  - Ingrédient: Lait d'avoine
  - Quantité: 250ml

Vente: 1 Café Latte (Lait d'avoine)

Mouvements créés:
❌ Café Latte: PAS de déduction (produit virtuel)
✅ Café moulu: -18g (de la recette)
✅ Lait d'avoine: -250ml (du variant)
⚠️ Lait frais: NON déduit (remplacé par le variant)
```

**Raison** : Le produit n'existe pas physiquement en stock. Il est créé à la demande en assemblant ses ingrédients. Les variants permettent de remplacer certains ingrédients de la recette de base.

---

## Logique des Variants

Quand un variant avec ingrédient est sélectionné :

1. **Priorité aux variants** : Les ingrédients définis dans les variants sont déduits
2. **Fallback sur la recette** : Si aucun variant n'a d'ingrédient, utiliser la recette de base
3. **Combinaison possible** : Certains ingrédients viennent des variants, d'autres de la recette

### Exemple Complet : Bubble Tea

```
Produit: Bubble Tea Classic
deduct_ingredients_on_sale: true
Prix de base: 25,000 IDR

Recette de base:
  - Thé noir liquide: 300ml
  - Sirop sucre: 30ml (100%)

Variants configurés:

1. Base (Single, Requis)
   - Thé noir (0 IDR) → Thé noir liquide: 300ml
   - Thé vert (+2000 IDR) → Thé vert liquide: 300ml

2. Topping (Multiple, Non requis)
   - Perles tapioca (+5000 IDR) → Perles: 50g
   - Gelée coco (+4000 IDR) → Gelée: 40g

3. Niveau de sucre (Single, Requis)
   - 0% (0 IDR) → Pas d'ingrédient
   - 50% (0 IDR) → Sirop sucre: 15ml
   - 100% (0 IDR) → Sirop sucre: 30ml
```

**Commande client** :
- Base : Thé vert (+2000)
- Topping : Perles + Gelée (+9000)
- Sucre : 50% (0)
- **Total : 36,000 IDR**

**Mouvements de stock créés** :
```
❌ Bubble Tea Classic: PAS de déduction
✅ Thé vert liquide: -300ml (variant Base)
✅ Perles tapioca: -50g (variant Topping)
✅ Gelée coco: -40g (variant Topping)
✅ Sirop sucre: -15ml (variant Sucre)
```

**Note** : Même si la recette de base contient "Thé noir liquide" et "Sirop sucre 30ml", ils ne sont PAS déduits car remplacés par les variants sélectionnés.

---

## Configuration dans l'Interface

### Page Produit > Onglet Général

**Checkbox "Déduire les ingrédients à la vente"** :
- ☐ Désactivée (défaut) → Produit pré-fabriqué
- ☑ Activée → Produit fait à la demande

**Quand l'activer ?**
- ✅ Café, boissons préparées à la demande
- ✅ Sandwiches faits sur commande
- ✅ Smoothies, jus frais
- ✅ Salades assemblées à la demande
- ❌ Croissants, pains, pâtisseries (pré-fabriqués)
- ❌ Gâteaux entiers (pré-fabriqués)

### Page Produit > Onglet Variants

Pour les produits faits à la demande, configurer les variants avec leurs ingrédients :

**Exemple : Café**
```
Catégorie: Type de lait (Single, Requis)

Option 1: Lait frais (+0 IDR)
  Ingrédient: [Lait frais]
  Quantité: 250 (ml)

Option 2: Lait d'avoine (+5000 IDR)
  Ingrédient: [Lait d'avoine]
  Quantité: 250 (ml)

Option 3: Lait de soja (+3000 IDR)
  Ingrédient: [Lait de soja]
  Quantité: 250 (ml)
```

L'unité du produit sélectionné s'affiche automatiquement à côté de "Quantité".

---

## Mouvements de Stock Visibles

### Page Stock Movements

Après une vente, vous verrez :

**Produit pré-fabriqué** (Croissant) :
```
Date: 28/01/2026 14:35
Produit: Croissant
Type: Vente POS
Quantité: -3 pcs
Stock avant: 50 pcs
Stock après: 47 pcs
Raison: Sale of pre-made product
```

**Produit fait à la demande** (Café Latte avec Lait d'avoine) :
```
Date: 28/01/2026 14:35
Produit: Café moulu
Type: Vente POS
Quantité: -18 g
Stock avant: 5000 g
Stock après: 4982 g
Raison: Ingredient for made-to-order sale

Date: 28/01/2026 14:35
Produit: Lait d'avoine
Type: Vente POS
Quantité: -250 ml
Stock avant: 10000 ml
Stock après: 9750 ml
Raison: Variant ingredient for made-to-order sale
```

**Note** : Il n'y a PAS de mouvement pour "Café Latte" car c'est un produit virtuel.

---

## Avantages de cette Approche

### Pour les Produits Pré-fabriqués
✅ Stock visible du produit fini
✅ Suivi précis des unités disponibles
✅ Alertes de stock bas
✅ Inventaire simplifié

### Pour les Produits Faits à la Demande
✅ Pas de "faux stock" pour des produits virtuels
✅ Déduction précise des ingrédients réellement utilisés
✅ Support des variants avec substitution d'ingrédients
✅ Traçabilité exacte de la consommation
✅ Optimisation des commandes d'ingrédients

---

## Trigger SQL

**Fichier** : `supabase/migrations/092_fix_made_to_order_stock_deduction.sql`

**Logique** :
```sql
IF NOT v_deduct_ingredients THEN
    -- Produit pré-fabriqué: déduire le produit fini
    -- Créer mouvement pour le produit
    -- Mettre à jour le stock du produit
ELSE
    -- Produit fait à la demande: déduire SEULEMENT les ingrédients
    IF variants avec materials THEN
        -- Déduire les ingrédients des variants
    ELSE
        -- Déduire les ingrédients de la recette
    END IF
    -- NOTE: Le produit fini n'est JAMAIS déduit
END IF
```

---

## Exemples Pratiques

### Bakery avec Croissants et Café

**Croissants** (`deduct_ingredients_on_sale = false`) :
```
Production du matin:
- Farine: -10kg
- Beurre: -2kg
- Levure: -100g
→ Croissants produits: +100 pcs

Stock visible: 100 croissants

Vente de 5 croissants:
→ Croissants: -5 pcs (100 → 95)
```

**Café Latte** (`deduct_ingredients_on_sale = true`) :
```
Pas de production batch

Stock visible: 0 café latte (produit virtuel)
Stock ingrédients:
- Café moulu: 5kg
- Lait frais: 10L

Vente de 1 café:
→ Café moulu: -18g (5000g → 4982g)
→ Lait frais: -250ml (10000ml → 9750ml)

Stock café latte: Toujours 0 (pas concerné)
```

---

## Questions Fréquentes

**Q : Que se passe-t-il si je vends un produit fait à la demande sans avoir configuré de recette ni de variants ?**
R : Aucune déduction ne sera effectuée. Seule la vente sera enregistrée sans impact sur le stock.

**Q : Puis-je avoir un produit avec à la fois une recette ET des variants ?**
R : Oui ! Les ingrédients des variants remplacent ceux de la recette pour les catégories concernées. Les autres ingrédients de la recette sont toujours déduits.

**Q : Comment gérer un produit qui peut être pré-fabriqué OU fait à la demande ?**
R : Créez deux produits séparés :
- "Sandwich Jambon (Pré-fait)" avec `deduct_ingredients_on_sale = false`
- "Sandwich Jambon (À la demande)" avec `deduct_ingredients_on_sale = true`

**Q : Le champ `current_stock` d'un produit fait à la demande est-il utilisé ?**
R : Non, il devrait rester à 0. Le stock réel est dans les ingrédients.

**Q : Puis-je changer `deduct_ingredients_on_sale` après avoir commencé à vendre ?**
R : Oui, mais cela affectera uniquement les ventes futures. Les mouvements passés ne seront pas modifiés.

---

## Résumé Visuel

```
┌─────────────────────────────────────────────────────────────┐
│              FLUX DE DÉDUCTION DE STOCK                     │
└─────────────────────────────────────────────────────────────┘

Vente d'un produit
       ↓
    Est-ce que deduct_ingredients_on_sale = true ?
       ↓                                    ↓
      NON                                  OUI
       ↓                                    ↓
  PRODUIT PRÉ-FABRIQUÉ              PRODUIT FAIT À LA DEMANDE
       ↓                                    ↓
  Déduire le produit fini          NE PAS déduire le produit
       ↓                                    ↓
  Movement: -X pcs                  Est-ce qu'il y a des variants ?
       ↓                                    ↓
  Stock produit: diminue            OUI          NON
                                     ↓             ↓
                         Déduire ingrédients  Déduire ingrédients
                            des variants       de la recette
                                     ↓             ↓
                         Movements: -Y ml    Movements: -Z g
                                     ↓             ↓
                         Stock ingrédients diminue
```
