---
description: 
---

---
name: new-table
description: Crée une nouvelle table Supabase avec RLS
---

# Instructions

Crée une nouvelle table Supabase avec :

1. **Migration SQL** dans `supabase/migrations/`
2. **Types TypeScript** générés
3. **Row Level Security** policies appropriées
4. **Hooks React** pour les opérations CRUD

Schema existant à respecter :
- `id` : UUID avec default gen_random_uuid()
- `created_at` : TIMESTAMPTZ avec default now()
- `updated_at` : TIMESTAMPTZ avec trigger
- `created_by` : UUID référence auth.users(id)

Demande-moi le nom de la table et ses colonnes.