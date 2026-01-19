# Module Combos et Promotions - Documentation

## Vue d'ensemble

Le module **Combos et Promotions** permet de créer des offres marketing flexibles et personnalisables pour augmenter les ventes et fidéliser la clientèle.

## Caractéristiques principales

### 1. Combos (Offres Groupées)

Les combos permettent de vendre plusieurs produits ensemble à un prix réduit.

#### Fonctionnalités:
- **Prix fixe du combo**: Définissez un prix spécial pour l'ensemble
- **Produits multiples**: Ajoutez autant de produits que nécessaire
- **Quantités personnalisables**: Spécifiez la quantité de chaque produit
- **Produits optionnels**: Marquez certains produits comme optionnels
- **Calcul automatique des économies**: Le système affiche l'économie par rapport au prix normal
- **Visibilité POS**: Activez/désactivez l'affichage au point de vente
- **Tri personnalisé**: Organisez l'ordre d'affichage des combos

#### Exemple de combo:
```
Nom: "Petit Déjeuner Complet"
Prix combo: 45,000 IDR
Contenu:
  - 1x Croissant (15,000 IDR)
  - 1x Café (20,000 IDR)
  - 1x Jus d'orange (18,000 IDR)
Prix normal total: 53,000 IDR
Économie: 8,000 IDR (15%)
```

### 2. Promotions

Système de promotions flexible avec règles temporelles et conditions d'achat.

#### Types de promotions:

##### A. Réduction Pourcentage
Applique un pourcentage de réduction sur les produits éligibles.
```
Exemple: -20% sur tous les pâtisseries
```

##### B. Montant Fixe
Réduit le total de la commande d'un montant fixe.
```
Exemple: -10,000 IDR sur la commande
```

##### C. Achetez X obtenez Y
Offre gratuite basée sur la quantité achetée.
```
Exemple: Achetez 2 cafés, obtenez le 3ème gratuit
```

##### D. Produit Offert
Offre un produit gratuit lors de l'achat.
```
Exemple: Pour tout achat de croissant, recevez un cookie gratuit
```

#### Contraintes temporelles:

1. **Période de validité**
   - Date de début et date de fin
   - Exemple: Du 01/02/2026 au 28/02/2026

2. **Jours de la semaine**
   - Sélectionnez les jours où la promotion est active
   - Exemple: Lundi, Mercredi, Vendredi uniquement

3. **Plages horaires**
   - Heure de début et heure de fin
   - Exemple: De 14:00 à 17:00 (Happy Hour)

#### Conditions d'achat:

1. **Montant minimum**
   - Définissez un montant minimum de commande
   - Exemple: Minimum 50,000 IDR

2. **Quantité minimum**
   - Nombre minimum d'articles requis
   - Exemple: Minimum 3 articles

3. **Produits/Catégories spécifiques**
   - Appliquez la promotion uniquement sur certains produits ou catégories
   - Laissez vide pour appliquer à tous les produits

#### Limites d'utilisation:

1. **Limite totale**
   - Nombre maximum d'utilisations de la promotion
   - Exemple: 100 premières utilisations

2. **Limite par client**
   - Nombre maximum d'utilisations par client
   - Exemple: 1 fois par client

#### Options avancées:

1. **Priorité**
   - Définit l'ordre d'application des promotions (plus élevé = appliqué en premier)
   - Utile quand plusieurs promotions sont actives

2. **Cumulable**
   - Permet de combiner cette promotion avec d'autres
   - Si désactivé, seule la meilleure promotion sera appliquée

## Structure de la base de données

### Tables principales:

1. **product_combos**
   - Stocke les informations des combos
   - Champs: name, description, combo_price, is_active, available_at_pos, image_url, sort_order

2. **product_combo_items**
   - Détails des produits dans un combo
   - Champs: combo_id, product_id, quantity, is_optional

3. **promotions**
   - Stocke toutes les promotions
   - Champs: code, name, description, promotion_type, start_date, end_date, days_of_week, time_start, time_end, discount_percentage, discount_amount, buy_quantity, get_quantity, min_purchase_amount, max_uses_total, max_uses_per_customer, priority, is_stackable

4. **promotion_products**
   - Produits/catégories éligibles pour une promotion
   - Si vide, la promotion s'applique à tous les produits

5. **promotion_free_products**
   - Produits gratuits offerts par une promotion

6. **promotion_usage**
   - Historique d'utilisation des promotions
   - Permet de tracker les limites par client

## Intégration POS

Le service `promotionService.ts` fournit des fonctions pour:

### 1. Récupérer les promotions applicables
```typescript
const promotions = await getApplicablePromotions(cartItems, subtotal, customerId)
```

### 2. Calculer la réduction
```typescript
const result = await calculatePromotionDiscount(promotion, cartItems, subtotal)
```

### 3. Appliquer les meilleures promotions
```typescript
const appliedPromotions = await applyBestPromotions(cartItems, subtotal, customerId)
```

### 4. Valider un code promo manuel
```typescript
const validation = await validatePromotionCode(code, cartItems, subtotal, customerId)
```

### 5. Enregistrer l'utilisation
```typescript
await recordPromotionUsage(promotionId, customerId, orderId, discountAmount)
```

## Exemples d'utilisation

### Exemple 1: Happy Hour
```
Type: Réduction Pourcentage
Nom: "Happy Hour - 30% sur boissons"
Code: HAPPY30
Réduction: 30%
Jours: Lundi-Vendredi
Horaire: 14:00 - 17:00
Produits: Catégorie "Boissons"
```

### Exemple 2: Offre Petit Déjeuner
```
Type: Achetez X obtenez Y
Nom: "2 Croissants = 1 Offert"
Code: CROISSANT3
Achetez: 2
Obtenez: 1
Jours: Tous les jours
Horaire: 06:00 - 10:00
Produits: Croissant uniquement
```

### Exemple 3: Promotion Weekend
```
Type: Montant Fixe
Nom: "Weekend Special"
Code: WEEKEND20
Réduction: 20,000 IDR
Jours: Samedi, Dimanche
Montant minimum: 100,000 IDR
Limite: 50 utilisations totales
```

### Exemple 4: Fidélité Client
```
Type: Produit Offert
Nom: "Cookie Gratuit"
Code: COOKIE-FREE
Montant minimum: 50,000 IDR
Produit offert: Cookie (x1)
Limite par client: 1 fois
Cumulable: Oui
```

## Fonctions SQL disponibles

### check_promotion_validity()
Valide si une promotion est actuellement valide pour un client donné.

### get_applicable_promotions()
Retourne toutes les promotions valides pour un panier donné.

### record_promotion_usage()
Enregistre l'utilisation d'une promotion et incrémente les compteurs.

## Bonnes pratiques

1. **Codes uniques**: Utilisez des codes faciles à mémoriser mais uniques
2. **Priorités cohérentes**: Assignez des priorités logiques (10 = faible, 50 = moyenne, 90 = haute)
3. **Limites raisonnables**: Définissez des limites pour contrôler les coûts
4. **Tests**: Testez toujours une nouvelle promotion avant de l'activer en production
5. **Monitoring**: Suivez l'utilisation des promotions via la table `promotion_usage`
6. **Nettoyage**: Désactivez ou supprimez les promotions expirées régulièrement

## Navigation

Accès au module:
1. Menu principal → **Produits**
2. Onglets disponibles:
   - **Produits**: Gestion des produits standards
   - **Combos**: Gestion des offres groupées
   - **Promotions**: Gestion des promotions

## Permissions

Les permissions sont gérées via RLS (Row Level Security):
- Lecture: Tous les utilisateurs authentifiés
- Création/Modification/Suppression: Utilisateurs authentifiés avec rôle approprié

## Migration

La migration SQL est disponible dans:
```
supabase/migrations/030_combos_and_promotions.sql
```

Appliquez-la via:
```bash
supabase db push
```

Ou via le dashboard Supabase en collant le contenu SQL.

## Support et Questions

Pour toute question ou problème:
1. Vérifiez les logs de la console pour les erreurs
2. Consultez la table `promotion_usage` pour l'historique
3. Testez les fonctions SQL directement dans le SQL Editor de Supabase
