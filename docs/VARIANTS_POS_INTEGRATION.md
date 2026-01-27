# Intégration des Variants dans le POS

## Vue d'ensemble

Le système de variants permet aux serveurs de personnaliser les produits lors de la commande. Les variants sont définis dans l'interface d'administration (onglet "Variants" du produit) et s'affichent automatiquement dans le POS.

## Architecture

### Composants créés/modifiés

1. **`src/hooks/products/useProductVariants.ts`** (NOUVEAU)
   - Hook React Query pour charger les variants depuis `product_modifiers`
   - Groupe les options par catégorie (group_name)
   - Retourne un tableau de `IVariantGroup[]`

2. **`src/components/pos/modals/VariantModal.tsx`** (MODIFIÉ)
   - Charge les variants depuis la base de données au lieu de parser les noms
   - Affiche dynamiquement les catégories et options
   - Supporte les sélections single/multiple
   - Calcule le prix total avec ajustements
   - Ajoute automatiquement au panier si aucun variant

3. **`src/pages/pos/POSMainPage.tsx`** (MODIFIÉ)
   - Simplifié : supprimé `productVariants` state
   - Ouvre toujours `VariantModal` lors du clic sur un produit
   - Le modal gère automatiquement le cas "pas de variants"

## Flux utilisateur

### 1. Configuration (Admin)

Dans la page produit, onglet "Variants" :
```
Catégorie: Lait
  Type: Single (1 choix)
  Requis: Oui
  Options:
    - Lait frais (+0 IDR) [défaut]
    - Lait d'avoine (+5000 IDR)
    - Lait de soja (+3000 IDR)

Catégorie: Taille
  Type: Single (1 choix)
  Requis: Oui
  Options:
    - Regular (+0 IDR) [défaut]
    - Large (+8000 IDR)

Catégorie: Topping
  Type: Multiple (choix multiples)
  Requis: Non
  Options:
    - Caramel (+5000 IDR)
    - Crème fouettée (+3000 IDR)
```

### 2. Utilisation (POS)

1. **Serveur clique sur un produit** (ex: Café Latte)
2. **Modal de variants s'ouvre** avec toutes les catégories
3. **Serveur sélectionne les options** :
   - Lait d'avoine (+5000)
   - Large (+8000)
   - Caramel (+5000)
4. **Prix mis à jour en temps réel** : 35000 → 53000 IDR
5. **Clic sur "Ajouter au panier"**
6. **Produit ajouté** avec note : `Lait: Lait d'avoine | Taille: Large | Topping: Caramel`

### 3. Affichage dans le panier

```
Café Latte                           53,000 IDR
Lait: Lait d'avoine | Taille: Large | Topping: Caramel
```

## Structure de données

### product_modifiers (table)

```sql
product_id        UUID          -- Référence au produit
group_name        VARCHAR       -- Nom de la catégorie (ex: "Lait")
group_type        VARCHAR       -- 'single' ou 'multiple'
group_required    BOOLEAN       -- Si la sélection est obligatoire
option_id         VARCHAR       -- ID unique de l'option
option_label      VARCHAR       -- Label affiché (ex: "Lait d'avoine")
price_adjustment  DECIMAL       -- Ajustement de prix (+/-)
is_default        BOOLEAN       -- Option sélectionnée par défaut
is_active         BOOLEAN       -- Si l'option est active
```

### IVariantGroup (interface TypeScript)

```typescript
interface IVariantGroup {
  group_name: string
  group_type: 'single' | 'multiple'
  group_required: boolean
  options: IVariantOption[]
}

interface IVariantOption {
  option_id: string
  option_label: string
  price_adjustment: number
  is_default: boolean
}
```

## Comportements spécifiques

### Produits sans variants

- Le modal se ferme automatiquement
- Le produit est ajouté directement au panier
- Pas d'étape supplémentaire pour l'utilisateur

### Validation

- Les catégories marquées "requises" doivent avoir au moins 1 sélection
- Le bouton "Ajouter au panier" est désactivé si validation échoue
- Indication visuelle avec `*` rouge pour les champs requis

### Prix

- Le prix de base du produit est affiché
- Chaque option affiche son ajustement : `+5,000 IDR` ou `-2,000 IDR`
- Le prix total est calculé dynamiquement : `Prix total: 53,000 IDR`
- Le panier stocke le prix final ajusté

## Avantages

1. **Flexibilité** : Catégories de variants illimitées
2. **Simplicité** : Configuration visuelle dans l'admin
3. **Performance** : Chargement depuis la base de données (react-query)
4. **UX** : Sélection intuitive avec feedback visuel
5. **Traçabilité** : Variants enregistrés dans les notes de commande

## Migration depuis l'ancien système

Avant : Variants dans le nom du produit `"Café Latte (Hot,Fresh milk)"`
Maintenant : Variants dans `product_modifiers`

**Compatibilité** : Le paramètre `variants` du modal est maintenant optionnel et déprécié. L'ancien code continuera de fonctionner mais les nouveaux produits doivent utiliser `product_modifiers`.

## Exemple complet

### Configuration produit "Croissant"

```
Variants:

  Catégorie: Fourrage
    Type: Single
    Requis: Non
    Options:
      - Nature (+0 IDR) [défaut]
      - Chocolat (+3000 IDR)
      - Amande (+4000 IDR)

  Catégorie: Réchauffé
    Type: Single
    Requis: Non
    Options:
      - Froid (+0 IDR) [défaut]
      - Réchauffé (+0 IDR)
```

### Commande POS

1. Clic sur "Croissant"
2. Modal affiche les 2 catégories
3. Serveur sélectionne : Chocolat, Réchauffé
4. Prix : 15000 → 18000 IDR
5. Ajout panier : `Croissant - Fourrage: Chocolat | Réchauffé: Réchauffé`

## Notes techniques

- **React Query** : Cache automatique des variants par produit
- **Performance** : 1 seule requête par produit (mise en cache)
- **Temps réel** : Les changements dans l'admin sont visibles après refresh
- **Offline** : Nécessite connexion pour charger les variants la première fois
