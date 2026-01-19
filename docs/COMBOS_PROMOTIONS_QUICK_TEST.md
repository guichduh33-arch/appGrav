# Guide de Test Rapide - Combos et Promotions

## 🚀 Démarrage rapide

### 1. Appliquer la migration SQL

Ouvrez Supabase SQL Editor et exécutez:
```sql
-- Contenu du fichier: supabase/migrations/030_combos_and_promotions.sql
```

### 2. Vérifier que les tables existent

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%combo%' OR table_name LIKE '%promotion%'
ORDER BY table_name;
```

Résultat attendu:
```
product_combos
product_combo_items
promotion_free_products
promotion_products
promotion_usage
promotions
```

### 3. Créer des données de test

#### Créer un combo de test
```sql
-- Insérer un combo
INSERT INTO product_combos (name, description, combo_price, is_active, available_at_pos)
VALUES (
  'Combo Petit Déjeuner',
  'Croissant + Café + Jus',
  45000,
  true,
  true
)
RETURNING id;

-- Récupérer l'ID et l'utiliser pour ajouter des items
-- (Remplacez 'COMBO_ID_HERE' par l'ID retourné ci-dessus)
-- (Remplacez 'PRODUCT_ID_X' par des IDs réels de votre table products)

INSERT INTO product_combo_items (combo_id, product_id, quantity, is_optional)
VALUES
  ('COMBO_ID_HERE', 'PRODUCT_ID_CROISSANT', 1, false),
  ('COMBO_ID_HERE', 'PRODUCT_ID_CAFE', 1, false),
  ('COMBO_ID_HERE', 'PRODUCT_ID_JUS', 1, true);
```

#### Créer une promotion de test (Happy Hour)
```sql
INSERT INTO promotions (
  code,
  name,
  description,
  promotion_type,
  discount_percentage,
  time_start,
  time_end,
  days_of_week,
  is_active,
  priority
)
VALUES (
  'HAPPY30',
  'Happy Hour',
  '30% de réduction sur toutes les boissons entre 14h et 17h',
  'percentage',
  30,
  '14:00',
  '17:00',
  ARRAY[1, 2, 3, 4, 5], -- Lundi à Vendredi
  true,
  50
);
```

#### Créer une promotion "Achetez X obtenez Y"
```sql
INSERT INTO promotions (
  code,
  name,
  description,
  promotion_type,
  buy_quantity,
  get_quantity,
  is_active,
  priority
)
VALUES (
  'BUY2GET1',
  'Achetez 2 obtenez 1 gratuit',
  'Sur tous les croissants',
  'buy_x_get_y',
  2,
  1,
  true,
  40
);
```

#### Créer une promotion weekend
```sql
INSERT INTO promotions (
  code,
  name,
  description,
  promotion_type,
  discount_amount,
  min_purchase_amount,
  days_of_week,
  is_active,
  priority
)
VALUES (
  'WEEKEND20',
  'Weekend Special',
  '20,000 IDR de réduction pour tout achat supérieur à 100,000 IDR',
  'fixed_amount',
  20000,
  100000,
  ARRAY[0, 6], -- Dimanche et Samedi
  true,
  30
);
```

### 4. Tester les requêtes

#### Récupérer tous les combos avec leurs items
```sql
SELECT
  pc.*,
  json_agg(
    json_build_object(
      'product_id', pci.product_id,
      'quantity', pci.quantity,
      'is_optional', pci.is_optional,
      'product_name', p.name,
      'product_price', p.retail_price
    )
  ) as items
FROM product_combos pc
LEFT JOIN product_combo_items pci ON pc.id = pci.combo_id
LEFT JOIN products p ON pci.product_id = p.id
WHERE pc.is_active = true
GROUP BY pc.id
ORDER BY pc.sort_order;
```

#### Récupérer toutes les promotions actives
```sql
SELECT *
FROM promotions
WHERE is_active = true
AND (start_date IS NULL OR start_date <= NOW())
AND (end_date IS NULL OR end_date >= NOW())
ORDER BY priority DESC;
```

#### Tester la fonction de validation
```sql
SELECT * FROM check_promotion_validity(
  'PROMO_ID_HERE'::UUID,
  NULL,
  50000
);
```

### 5. Tester dans l'application

#### Démarrer l'application
```bash
npm run dev
```

#### Navigation
1. Ouvrez http://localhost:3000
2. Connectez-vous
3. Allez dans **Produits**
4. Vous devriez voir 3 onglets:
   - Produits
   - **Combos** ← nouveau
   - **Promotions** ← nouveau

#### Vérifications visuelles

**Page Combos:**
- [ ] La liste des combos s'affiche
- [ ] Les stats sont correctes (Total, Actifs, Inactifs)
- [ ] La recherche fonctionne
- [ ] Les cartes affichent les détails correctement
- [ ] Le calcul des économies est correct
- [ ] Les actions (voir, modifier, activer/désactiver, supprimer) fonctionnent

**Page Promotions:**
- [ ] La liste des promotions s'affiche
- [ ] Les stats sont correctes (Total, Actives, Inactives, Expirées)
- [ ] La recherche fonctionne
- [ ] Les filtres (type, statut) fonctionnent
- [ ] Les badges de type affichent la bonne icône
- [ ] Les contraintes temporelles sont visibles
- [ ] Les actions fonctionnent

### 6. Test du service de promotions

Ouvrez la console du navigateur et testez:

```javascript
// Importer le service (dans un composant React)
import {
  getApplicablePromotions,
  calculatePromotionDiscount,
  isPromotionValid
} from '@/services/promotionService'

// Test de validation
const promo = {
  id: 'promo-id',
  code: 'HAPPY30',
  promotion_type: 'percentage',
  discount_percentage: 30,
  is_active: true,
  time_start: '14:00',
  time_end: '17:00',
  days_of_week: [1, 2, 3, 4, 5],
  // ... autres champs
}

const validation = isPromotionValid(promo)
console.log('Validation:', validation)

// Test de récupération
const cartItems = [
  {
    product_id: 'product-1',
    product_name: 'Café',
    category_id: 'category-boissons',
    quantity: 2,
    unit_price: 20000,
    total_price: 40000
  }
]

const applicablePromos = await getApplicablePromotions(cartItems, 40000)
console.log('Promotions applicables:', applicablePromos)
```

### 7. Vérification des contraintes

#### Test des contraintes temporelles

**Dates:**
```sql
-- Promotion valide maintenant
UPDATE promotions
SET start_date = NOW() - INTERVAL '1 day',
    end_date = NOW() + INTERVAL '7 days'
WHERE code = 'HAPPY30';

-- Promotion expirée
UPDATE promotions
SET end_date = NOW() - INTERVAL '1 day'
WHERE code = 'HAPPY30';
```

**Jours de la semaine:**
```sql
-- Activer uniquement le lundi (1)
UPDATE promotions
SET days_of_week = ARRAY[1]
WHERE code = 'HAPPY30';

-- Vérifier le jour actuel
SELECT EXTRACT(DOW FROM NOW()); -- 0=Dimanche, 1=Lundi, etc.
```

**Heures:**
```sql
-- Happy hour 14h-17h
UPDATE promotions
SET time_start = '14:00',
    time_end = '17:00'
WHERE code = 'HAPPY30';

-- Vérifier l'heure actuelle
SELECT NOW()::TIME;
```

#### Test des limites d'utilisation

```sql
-- Limite totale de 100 utilisations
UPDATE promotions
SET max_uses_total = 100,
    current_uses = 0
WHERE code = 'WEEKEND20';

-- Limite par client de 1 utilisation
UPDATE promotions
SET max_uses_per_customer = 1
WHERE code = 'WEEKEND20';

-- Simuler une utilisation
INSERT INTO promotion_usage (
  promotion_id,
  customer_id,
  discount_amount
)
VALUES (
  (SELECT id FROM promotions WHERE code = 'WEEKEND20'),
  'customer-id-here',
  20000
);

-- Incrémenter le compteur
UPDATE promotions
SET current_uses = current_uses + 1
WHERE code = 'WEEKEND20';
```

### 8. Test de performance

```sql
-- Vérifier les indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('promotions', 'promotion_usage', 'product_combos');

-- Analyser une requête
EXPLAIN ANALYZE
SELECT *
FROM promotions
WHERE is_active = true
AND (start_date IS NULL OR start_date <= NOW())
AND (end_date IS NULL OR end_date >= NOW())
ORDER BY priority DESC;
```

### 9. Test RLS (Row Level Security)

```sql
-- Se connecter en tant qu'utilisateur authentifié
SET ROLE authenticated;

-- Tester la lecture
SELECT * FROM promotions;

-- Tester l'écriture
INSERT INTO promotions (code, name, promotion_type)
VALUES ('TEST', 'Test Promo', 'percentage');

-- Revenir au rôle par défaut
RESET ROLE;
```

## ✅ Checklist de validation

### Base de données
- [ ] Tables créées avec succès
- [ ] Fonctions SQL disponibles
- [ ] Indexes créés
- [ ] RLS policies actives
- [ ] Données de test insérées

### Frontend
- [ ] Application démarre sans erreur
- [ ] Navigation entre onglets fonctionne
- [ ] Page Combos s'affiche correctement
- [ ] Page Promotions s'affiche correctement
- [ ] Recherche fonctionne
- [ ] Filtres fonctionnent
- [ ] Stats affichées correctement
- [ ] Actions (voir, modifier, supprimer) fonctionnent

### Service
- [ ] isPromotionValid() fonctionne
- [ ] getApplicablePromotions() retourne les bonnes promos
- [ ] calculatePromotionDiscount() calcule correctement
- [ ] applyBestPromotions() applique la meilleure offre
- [ ] validatePromotionCode() valide les codes
- [ ] recordPromotionUsage() enregistre correctement

### Tests avancés
- [ ] Contraintes de dates respectées
- [ ] Contraintes de jours respectées
- [ ] Contraintes d'heures respectées
- [ ] Limites d'utilisation respectées
- [ ] Stacking fonctionne correctement
- [ ] Priorités appliquées dans l'ordre

## 🐛 Debugging

### Erreurs courantes

**"Table doesn't exist"**
- La migration n'a pas été appliquée
- Exécutez le script SQL de migration

**"Type error: ProductCombo not found"**
- Les types TypeScript n'ont pas été mis à jour
- Vérifiez `src/types/database.ts`

**"Cannot read property of undefined"**
- Les données ne sont pas chargées
- Vérifiez la console pour les erreurs de requête
- Vérifiez les RLS policies

**"Promotion not applying"**
- Vérifiez les contraintes temporelles
- Vérifiez le statut `is_active`
- Vérifiez les limites d'utilisation

### Logs utiles

```sql
-- Voir toutes les promotions et leur validité
SELECT
  code,
  name,
  is_active,
  start_date,
  end_date,
  time_start,
  time_end,
  days_of_week,
  current_uses,
  max_uses_total,
  CASE
    WHEN NOT is_active THEN 'Inactive'
    WHEN start_date IS NOT NULL AND start_date > NOW() THEN 'Not started'
    WHEN end_date IS NOT NULL AND end_date < NOW() THEN 'Expired'
    WHEN max_uses_total IS NOT NULL AND current_uses >= max_uses_total THEN 'Limit reached'
    ELSE 'Valid'
  END as status
FROM promotions;
```

```sql
-- Historique d'utilisation d'une promotion
SELECT
  pu.*,
  c.name as customer_name,
  o.order_number
FROM promotion_usage pu
LEFT JOIN customers c ON pu.customer_id = c.id
LEFT JOIN orders o ON pu.order_id = o.id
WHERE pu.promotion_id = 'PROMO_ID_HERE'
ORDER BY pu.used_at DESC;
```

## 🎉 Résultat attendu

Après avoir suivi ce guide, vous devriez avoir:
1. ✅ Un module Combos fonctionnel
2. ✅ Un module Promotions fonctionnel
3. ✅ Des données de test
4. ✅ Toutes les validations passées
5. ✅ Une application prête pour la production

Félicitations ! 🚀
