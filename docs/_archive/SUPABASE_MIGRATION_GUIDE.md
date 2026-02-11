# Guide de Migration Supabase

## Problème actuel
La table `purchase_orders` dans votre base de données n'a pas les bonnes colonnes, ce qui cause l'erreur :
```
Could not find the 'discount_amount' column of 'purchase_orders' in the schema cache
```

## Solution : Appliquer les migrations

### Option 1 : Via Supabase Dashboard (Recommandé)

1. **Ouvrez le Dashboard Supabase**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Accédez au SQL Editor**
   - Cliquez sur "SQL Editor" dans le menu de gauche

3. **Exécutez les migrations manuellement**

   Copiez et exécutez dans l'ordre :

   a) D'abord la migration de correction des payment_terms :
   ```sql
   -- Migration: Fix suppliers payment_terms column type
   -- supabase/migrations/20260128000000_fix_suppliers_payment_terms.sql

   -- Update any existing invalid values to valid enum values
   UPDATE public.suppliers
   SET payment_terms = CASE
       WHEN payment_terms IN ('Net 30', 'net 30', 'NET 30') THEN 'net30'
       WHEN payment_terms IN ('Net 15', 'net 15', 'NET 15') THEN 'net15'
       WHEN payment_terms IN ('Net 45', 'net 45', 'NET 45') THEN 'net60'
       WHEN payment_terms IN ('Net 60', 'net 60', 'NET 60') THEN 'net60'
       WHEN payment_terms IN ('Comptant', 'comptant', 'COMPTANT', 'COD') THEN 'cod'
       ELSE payment_terms
   END
   WHERE payment_terms IS NOT NULL;

   -- Alter the column type
   DO $$
   BEGIN
       IF EXISTS (
           SELECT 1
           FROM information_schema.columns
           WHERE table_schema = 'public'
           AND table_name = 'suppliers'
           AND column_name = 'payment_terms'
           AND data_type = 'text'
       ) THEN
           ALTER TABLE public.suppliers
           ALTER COLUMN payment_terms TYPE payment_terms
           USING payment_terms::payment_terms;

           ALTER TABLE public.suppliers
           ALTER COLUMN payment_terms SET DEFAULT 'net30';

           RAISE NOTICE 'Column suppliers.payment_terms converted from TEXT to payment_terms enum';
       ELSE
           RAISE NOTICE 'Column suppliers.payment_terms is already of correct type';
       END IF;
   END $$;

   COMMENT ON COLUMN public.suppliers.payment_terms IS 'Payment terms: cod (Cash on Delivery), net15 (15 days), net30 (30 days), net60 (60 days)';
   ```

   b) Vérifiez si la table purchase_orders a toutes les colonnes nécessaires :
   ```sql
   -- Vérifier les colonnes existantes
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'purchase_orders'
   AND table_schema = 'public'
   ORDER BY ordinal_position;
   ```

   c) Si les colonnes `discount_amount`, `discount_percentage` ou `total_amount` sont manquantes, ajoutez-les :
   ```sql
   -- Ajouter les colonnes manquantes si nécessaire
   DO $$
   BEGIN
       -- discount_amount
       IF NOT EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_name = 'purchase_orders'
           AND column_name = 'discount_amount'
       ) THEN
           ALTER TABLE public.purchase_orders
           ADD COLUMN discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0;

           ALTER TABLE public.purchase_orders
           ADD CONSTRAINT purchase_orders_discount_check CHECK (discount_amount >= 0);
       END IF;

       -- discount_percentage
       IF NOT EXISTS (
           SELECT 1 FROM information_schema.columns
           WHERE table_name = 'purchase_orders'
           AND column_name = 'discount_percentage'
       ) THEN
           ALTER TABLE public.purchase_orders
           ADD COLUMN discount_percentage NUMERIC(5,2);

           ALTER TABLE public.purchase_orders
           ADD CONSTRAINT purchase_orders_discount_percentage_check
           CHECK (discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 100));
       END IF;
   END $$;
   ```

4. **Régénérez les types TypeScript**

   Dans votre terminal :
   ```bash
   npx supabase gen types typescript --project-id dzlkcuekwybgvrzutzbb > src/types/database.generated.ts
   ```

5. **Redémarrez le serveur**
   ```bash
   npm run dev
   ```

### Option 2 : Via Supabase CLI (Si configuré)

Si vous avez le CLI Supabase configuré avec link :

```bash
# 1. Lier votre projet (si pas déjà fait)
npx supabase link --project-ref dzlkcuekwybgvrzutzbb

# 2. Pousser les migrations
npx supabase db push

# 3. Régénérer les types
npx supabase gen types typescript --linked > src/types/database.generated.ts

# 4. Redémarrer
npm run dev
```

## Vérification

Après avoir appliqué les migrations, vérifiez que tout fonctionne :

1. Le formulaire de création de fournisseur devrait accepter les conditions de paiement
2. Le formulaire de création de bon de commande devrait fonctionner sans erreur
3. Les types TypeScript devraient être régénérés avec toutes les colonnes

## En cas de problème

Si vous rencontrez toujours des erreurs, vérifiez :
- Les logs de la console pour plus de détails
- Que toutes les migrations sont bien appliquées dans le Dashboard Supabase
- Que le fichier `src/types/database.generated.ts` n'est plus vide
