# 📘 INSTRUCTIONS DE DÉVELOPPEMENT - ERP The Breakery Lombok

> **Version**: 2.0 | **Mise à jour**: Janvier 2025  
> **Projet**: AppGrav ERP/POS | **Stack**: React + TypeScript + Supabase

---

## 🎯 MISSION & CONTEXTE

### Objectif du Système
Développer un ERP/POS complet pour **The Breakery Lombok**, une boulangerie française en Indonésie.

### Métriques Business Clés
| Métrique | Valeur |
|----------|--------|
| Transactions quotidiennes | ~200 |
| Chiffre d'affaires annuel | ~6 milliards IDR |
| Devise | IDR (Rupiah indonésienne) |
| TVA | 10% (incluse dans les prix) |
| Langue | English (module multilingue suspendu) |

### Plateformes Cibles
- 🖥️ Desktop Windows (application principale)
- 📱 Tablettes Android (POS mobile)
- 🖨️ Terminaux POS (caisse)
- 📺 KDS (Kitchen Display System)

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack Technologique
```
Frontend:     React 18.2 + TypeScript 5.2 + Vite 5.x
State:        Zustand (cartStore, authStore, orderStore)
Styling:      Tailwind CSS + Lucide React icons
Backend:      Supabase (PostgreSQL + Auth + Realtime + Edge Functions + Storage)
Routing:      React Router DOM 6.x
Data:         @tanstack/react-query
i18n:         [SUSPENDU] i18next installé mais non utilisé - English hardcodé
Charts:       Recharts
Mobile:       Capacitor (Android/iOS)
```

### Structure des Dossiers
```
src/
├── components/       # Composants React par feature
│   ├── pos/          # Interface POS
│   ├── inventory/    # Gestion stock
│   ├── ui/           # Composants réutilisables
│   └── ...
├── pages/            # Pages par route
│   ├── customers/    # Module clients + fidélité
│   ├── products/     # Produits, combos, promotions
│   ├── inventory/    # Stock & mouvements
│   ├── b2b/          # Module B2B wholesale
│   ├── purchasing/   # Commandes fournisseurs
│   └── ...
├── stores/           # Zustand stores
├── hooks/            # Custom React hooks
├── services/         # Intégrations API externes
├── types/            # TypeScript types (database.ts = schéma complet)
├── lib/              # Utilitaires (supabase.ts client)
├── locales/          # [SUSPENDU] Fichiers i18n existent mais non utilisés
└── styles/           # CSS global

supabase/
├── migrations/       # Migrations SQL (001-031+)
└── functions/        # Edge Functions (Deno/TypeScript)
```

---

## 📐 CONVENTIONS DE CODE

### Nommage
| Élément | Convention | Exemple |
|---------|------------|---------|
| Composants React | PascalCase | `ProductCard.tsx` |
| Fonctions/Variables | camelCase | `handleSubmit`, `isLoading` |
| Interfaces | PascalCase + préfixe `I` | `IProduct`, `ICustomer` |
| Types | PascalCase + préfixe `T` | `TOrderStatus`, `TPaymentMethod` |
| Colonnes DB | snake_case | `created_at`, `customer_id` |
| Clés primaires | UUID nommé `id` | `id UUID PRIMARY KEY` |
| Clés étrangères | `{table}_id` | `category_id`, `order_id` |
| Timestamps | `created_at`, `updated_at` | TIMESTAMPTZ avec DEFAULT NOW() |

### Règles de Code
```typescript
// ✅ BONNES PRATIQUES

// 1. Typage strict - toujours définir les types
interface IProductFormProps {
  product?: IProduct;
  onSubmit: (data: IProduct) => Promise<void>;
  isLoading?: boolean;
}

// 2. Composants fonctionnels avec hooks
export const ProductForm: React.FC<IProductFormProps> = ({ 
  product, 
  onSubmit, 
  isLoading = false 
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<IProduct>>(product || {});
  // ...
};

// 3. Custom hooks pour logique réutilisable
export function useProducts() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// 4. Gestion d'erreurs avec try-catch
const handleSave = async () => {
  try {
    setIsLoading(true);
    await supabase.from('products').insert(formData);
    toast.success(t('products.saveSuccess'));
  } catch (error) {
    console.error('Save error:', error);
    toast.error(t('errors.saveFailed'));
  } finally {
    setIsLoading(false);
  }
};

// 5. Loading states et error boundaries
{isLoading ? (
  <Spinner />
) : error ? (
  <ErrorMessage error={error} />
) : (
  <DataTable data={products} />
)}
```

### Limites et Bonnes Pratiques
- **Max 300 lignes par fichier** - Diviser si nécessaire
- **Prefer composition over inheritance**
- **Un composant = une responsabilité**
- **Toujours gérer les états loading/error/empty**
- **Utiliser optional chaining (`?.`) pour les données async**

---

## 🗄️ BASE DE DONNÉES SUPABASE

### Tables Principales (25+)
```sql
-- CORE
products, categories, suppliers

-- VENTES
orders, order_items, pos_sessions, floor_plan_items

-- CLIENTS
customers, customer_categories, loyalty_tiers, loyalty_transactions
product_category_prices  -- Prix personnalisés par catégorie client

-- INVENTAIRE
stock_movements, production_records, recipes

-- ACHATS
purchase_orders, po_items

-- B2B
b2b_orders, b2b_order_items, b2b_payments

-- PROMOTIONS
product_combos, product_combo_groups, product_combo_group_items
promotions, promotion_products, promotion_free_products, promotion_usage

-- SYSTÈME
user_profiles, product_modifiers
```

### Row Level Security (RLS)
**TOUJOURS activer RLS sur les nouvelles tables!**

```sql
-- Pattern standard pour RLS
ALTER TABLE public.{table_name} ENABLE ROW LEVEL SECURITY;

-- Policy lecture authentifiée
CREATE POLICY "Authenticated users can read" ON public.{table_name}
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy écriture avec permission
CREATE POLICY "Users with permission can write" ON public.{table_name}
    FOR INSERT WITH CHECK (public.user_has_permission(auth.uid(), '{module}.create'));

-- Policy modification avec permission
CREATE POLICY "Users with permission can update" ON public.{table_name}
    FOR UPDATE USING (public.user_has_permission(auth.uid(), '{module}.update'));
```

### Fonctions Utilitaires Existantes
```sql
-- Vérifier permission utilisateur
public.user_has_permission(p_user_id UUID, p_permission_code VARCHAR) → BOOLEAN

-- Vérifier si admin
public.is_admin(p_user_id UUID) → BOOLEAN

-- Obtenir prix client personnalisé
public.get_customer_product_price(p_product_id UUID, p_customer_category_slug VARCHAR) → DECIMAL

-- Gestion fidélité
public.add_loyalty_points(p_customer_id UUID, p_points INTEGER, p_order_id UUID) → VOID
public.redeem_loyalty_points(p_customer_id UUID, p_points INTEGER) → BOOLEAN
```

---

## 💼 RÈGLES MÉTIER

### Calculs Financiers
```typescript
// TVA 10% incluse dans les prix
const calculateTax = (totalTTC: number): number => {
  return Math.round(totalTTC * 10 / 110); // TVA = Total * 10/110
};

const calculateHT = (totalTTC: number): number => {
  return totalTTC - calculateTax(totalTTC);
};

// Arrondi IDR (pas de centimes)
const roundIDR = (amount: number): number => {
  return Math.round(amount / 100) * 100; // Arrondi aux 100 IDR
};
```

### Programme de Fidélité
```typescript
// 1 point = 1,000 IDR dépensé
const LOYALTY_RATIO = 1000;

// Tiers et avantages
const LOYALTY_TIERS = {
  bronze:   { min_points: 0,    discount: 0 },
  silver:   { min_points: 500,  discount: 5 },
  gold:     { min_points: 2000, discount: 8 },
  platinum: { min_points: 5000, discount: 10 },
};
```

### Types de Commandes
```typescript
type TOrderType = 'dine_in' | 'takeaway' | 'delivery' | 'b2b';
```

### Alertes Stock
```typescript
const LOW_STOCK_THRESHOLD = 10;  // Alerte jaune
const CRITICAL_STOCK_THRESHOLD = 5;  // Alerte rouge
```

### Catégories Client & Pricing
```typescript
type TPriceModifierType = 
  | 'retail'              // Prix standard
  | 'wholesale'           // Utilise wholesale_price du produit
  | 'discount_percentage' // Applique X% de réduction
  | 'custom';             // Prix personnalisé dans product_category_prices
```

---

## 🔌 INTÉGRATIONS

### Claude AI API
```typescript
// Configuration dans .env
ANTHROPIC_API_KEY=your-key

// Service d'intégration
import { claudeService } from '@/services/claude';

// Utilisation pour assistance intelligente
const response = await claudeService.analyze({
  context: 'inventory_optimization',
  data: stockData,
});
```

### Supabase Realtime
```typescript
// Écouter les changements en temps réel
const channel = supabase
  .channel('orders-changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'orders',
  }, (payload) => {
    // Mettre à jour l'UI
    queryClient.invalidateQueries(['orders']);
  })
  .subscribe();
```

---

## 🌐 INTERNATIONALISATION (i18n) - ⚠️ SUSPENDU

> **IMPORTANT**: Le module multilingue est actuellement **suspendu**. L'anglais est utilisé comme langue principale avec des strings hardcodées.

### État Actuel
- L'infrastructure i18next existe mais n'est **pas activement utilisée**
- Les fichiers de traduction (`fr.json`, `en.json`, `id.json`) existent mais sont **obsolètes**
- **NE PAS** utiliser `useTranslation()` ou `t()` dans le nouveau code

### Pattern Actuel (English Hardcoded)
```typescript
// ✅ CORRECT - Utiliser des strings anglaises directement
const MyComponent = () => {
  return (
    <div>
      <h1>Products</h1>
      <Button>Save</Button>
      <Button>Cancel</Button>
    </div>
  );
};

// ❌ NE PAS FAIRE - i18n suspendu
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<h1>{t('products.title')}</h1>
```

### Note de Réactivation Future
Si le multilingue doit être réactivé à l'avenir, les fichiers de traduction devront être mis à jour pour refléter toutes les nouvelles fonctionnalités ajoutées pendant la suspension.

---

## 🔒 SÉCURITÉ

### Permissions Système
```typescript
type TPermissionCode = 
  // Ventes
  | 'sales.view' | 'sales.create' | 'sales.void' 
  | 'sales.discount' | 'sales.refund'
  // Inventaire
  | 'inventory.view' | 'inventory.create' 
  | 'inventory.update' | 'inventory.delete' | 'inventory.adjust'
  // Produits
  | 'products.view' | 'products.create' 
  | 'products.update' | 'products.pricing'
  // Clients
  | 'customers.view' | 'customers.create' 
  | 'customers.update' | 'customers.loyalty'
  // Rapports
  | 'reports.sales' | 'reports.inventory' | 'reports.financial'
  // Admin
  | 'users.view' | 'users.create' | 'users.roles'
  | 'settings.view' | 'settings.update';
```

### Hook de Permissions
```typescript
import { usePermissions } from '@/hooks/usePermissions';

const MyComponent = () => {
  const { hasPermission, isAdmin } = usePermissions();
  
  return (
    <>
      {hasPermission('sales.void') && (
        <Button onClick={handleVoid}>Annuler</Button>
      )}
    </>
  );
};
```

### Composant PermissionGuard
```tsx
<PermissionGuard permission="sales.discount">
  <DiscountButton />
</PermissionGuard>
```

---

## 🧪 TESTS & QUALITÉ

### Commandes de Développement
```bash
npm run dev          # Démarrer serveur dev (port 3000)
npm run build        # Build production (TypeScript + Vite)
npm run lint         # Vérifier le code
npm run preview      # Preview build production
npm run test:claude  # Tester intégration Claude API
```

### Avant Chaque Commit
1. ✅ `npm run lint` - Zéro erreur
2. ✅ `npm run build` - Build réussi
3. ✅ Tester manuellement les changements
4. ✅ Vérifier que les strings sont en anglais (i18n suspendu)

---

## 📝 WORKFLOW DE DÉVELOPPEMENT

### Création d'une Nouvelle Feature

#### 1. Base de données
```sql
-- a) Créer la migration
-- supabase/migrations/032_feature_name.sql

-- b) Créer la table
CREATE TABLE public.new_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- colonnes...
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- c) Activer RLS
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- d) Créer les policies
CREATE POLICY "..." ON public.new_table ...
```

#### 2. Types TypeScript
```typescript
// src/types/database.ts - Ajouter le type
new_table: {
    Row: {
        id: string;
        // propriétés...
        created_at: string;
        updated_at: string;
    };
    Insert: Partial<...>;
    Update: Partial<...>;
}
```

#### 3. Hook personnalisé
```typescript
// src/hooks/useNewFeature.ts
export function useNewFeature() {
  return useQuery({
    queryKey: ['new_feature'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('new_table')
        .select('*');
      if (error) throw error;
      return data;
    },
  });
}
```

#### 4. Composants UI
```typescript
// src/components/feature/FeatureComponent.tsx
// src/pages/feature/FeaturePage.tsx
```

#### 5. Strings UI (English)
```typescript
// ⚠️ i18n SUSPENDU - Utiliser des strings anglaises directement
// NE PAS ajouter de clés de traduction

// Dans le composant:
<h1>New Feature Title</h1>
<p>Description of the feature</p>
```

#### 6. Route
```typescript
// Dans App.tsx ou router config
<Route path="/new-feature" element={<FeaturePage />} />
```

---

## 🤖 INSTRUCTIONS POUR AGENTS CLAUDE

### Principes Généraux
1. **Lire avant d'agir** - Toujours examiner le code existant avant modification
2. **Respecter les patterns** - Suivre les conventions établies dans ce document
3. **Tester les modifications** - Vérifier que le build passe après chaque changement
4. **Documenter** - Mettre à jour la documentation si nécessaire

### Agent Error-Debugger
Quand une erreur est rencontrée:
1. Classifier le type d'erreur (Reference, Type, Database, API, Build)
2. Examiner le fichier concerné et ses imports
3. Vérifier les types dans `database.ts`
4. Proposer un fix avec explication

### Agent System-Auditor
Pour les audits système:
1. Scanner la structure du projet
2. Vérifier la conformité aux conventions
3. Identifier les problèmes de sécurité (RLS, permissions)
4. Prioriser par sévérité: 🔴 Critical → 🟠 High → 🟡 Medium → 🟢 Low

### Fichiers Clés à Connaître
- `CLAUDE.md` - Vue d'ensemble du projet
- `src/types/database.ts` - Schéma complet de la BDD
- `src/stores/*.ts` - State management (Zustand)
- `supabase/migrations/*.sql` - Historique des migrations

---

## 📚 RESSOURCES

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [i18next](https://www.i18next.com/)

### Fichiers de Référence Projet
- `/docs/COMBOS_AND_PROMOTIONS.md` - Module combos & promos
- `/docs/STOCK_MOVEMENTS_MODULE.md` - Mouvements de stock
- `/docs/prompt-module-settings-erp.md` - Spec module paramètres
- `/docs/prompt-module-utilisateur-erp.md` - Spec module utilisateurs

---

## ⚠️ PIÈGES COURANTS À ÉVITER

### 1. Données Async Non Prêtes
```typescript
// ❌ MAUVAIS - Crash si categories est undefined
{categories.map(cat => <CategoryCard key={cat.id} />)}

// ✅ BON - Vérification avec optional chaining
{categories?.map(cat => <CategoryCard key={cat.id} />)}
```

### 2. Imports Manquants
```typescript
// ❌ MAUVAIS - Import non vérifié
import { supabase } from '@/lib/supabase';

// ✅ BON - Vérifier que le fichier existe et exporte bien
// src/lib/supabase.ts doit exister et exporter supabase
```

### 3. RLS Oubliée
```sql
-- ❌ MAUVAIS - Table sans RLS = faille de sécurité
CREATE TABLE public.sensitive_data (...);

-- ✅ BON - Toujours activer RLS
ALTER TABLE public.sensitive_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "..." ON public.sensitive_data ...
```

### 4. Types Database Non Synchronisés
Après modification du schéma SQL, **toujours mettre à jour** `src/types/database.ts`

### 5. Module i18n Suspendu
**NE PAS** utiliser `useTranslation()` ou `t()` - utiliser des strings anglaises directement

---

## 🚀 PROCHAINES ÉTAPES DÉVELOPPEMENT

### Modules en Cours
- [ ] Module Settings/Paramètres (voir `/docs/prompt-module-settings-erp.md`)
- [ ] Module Utilisateurs & Permissions (voir `/docs/prompt-module-utilisateur-erp.md`)
- [ ] Intégration Claude API pour assistance intelligente

### Améliorations Planifiées
- [ ] Mode hors-ligne avec synchronisation
- [ ] Rapports PDF automatisés
- [ ] Intégration WhatsApp Business API
- [ ] Dashboard analytics avancé

---

*Dernière mise à jour: Janvier 2025*
