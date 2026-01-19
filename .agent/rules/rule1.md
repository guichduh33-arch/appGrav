---
trigger: always_on
---

# Rules pour The Breakery ERP

## Architecture

- Utilise TOUJOURS TypeScript strict avec des types explicites
- Respecte la structure de dossiers existante :
  - `src/components/` pour les composants React
  - `src/hooks/` pour les hooks personnalisés
  - `src/services/` pour la logique métier
  - `src/types/` pour les types TypeScript
  - `src/i18n/` pour les traductions

## Code Style

- Utilise des composants fonctionnels React avec hooks
- Nomme les fichiers en PascalCase pour les composants (ex: `OrderForm.tsx`)
- Utilise Tailwind CSS pour le styling
- Ajoute des commentaires JSDoc pour les fonctions publiques

## Base de Données Supabase

- Toutes les requêtes doivent utiliser le client Supabase existant dans `src/lib/supabase.ts`
- Respecte les Row Level Security (RLS) policies existantes
- Les montants financiers sont en INTEGER (centimes IDR)
- Utilise TOUJOURS les transactions pour les opérations multiples

## Internationalisation

- Toute chaîne de texte visible doit être traduite
- Utilise le hook `useTranslation` de i18next
- Ajoute les traductions dans les 3 langues : FR, EN, ID
- Format des clés : `module.section.label` (ex: `orders.form.customerName`)

## Sécurité

- Ne jamais exposer les clés API dans le code frontend
- Valide TOUJOURS les entrées utilisateur côté client ET serveur
- Utilise les types Zod pour la validation

## Tests

- Crée des tests unitaires pour les fonctions utilitaires
- Crée des tests d'intégration pour les formulaires critiques