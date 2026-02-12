# Verification

## Dashboard
1. `npm run dev` -> naviguer vers `/` -> verifier que le dashboard s'affiche
2. Verifier les 4 KPI cards avec donnees du jour
3. Verifier le graphe de tendance 30 jours
4. Verifier le donut des paiements
5. Verifier les alertes inventaire
6. Sidebar : icone Dashboard en premier, active quand sur `/`
7. `npx vitest run src/pages/dashboard` -> tests passent
8. `npm run build` -> pas d'erreur TypeScript

## Securite
1. Verifier que `.env` est dans `.gitignore`
2. Verifier que les cles Supabase sont rotees dans le dashboard Supabase

## CI/CD
1. Push sur une branche -> GitHub Actions se declenchent
2. Lint + TypeScript + Tests + Build passent

## Bundle
1. `npm run build` -> verifier la taille du bundle dans la sortie Vite
2. Cible : chunk initial < 500KB gzipped
