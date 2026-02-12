# Phase 1 : Stabilisation & Qualite (Semaines 1-4)

## 1.1 Securite Critique
- [ ] **Supprimer `.env` du depot git** et ajouter a `.gitignore`
- [ ] **Rotation des cles** Supabase (anon key + service key exposees)
- [ ] Creer `.env.example` avec placeholders (existe deja mais verifier completude)

## 1.2 CI/CD Pipeline (GitHub Actions)
Creer `.github/workflows/ci.yml` :
- [ ] TypeScript check (`tsc -b`)
- [ ] ESLint (`npm run lint`)
- [ ] Tests (`npx vitest run`)
- [ ] Build (`vite build`)
- [ ] Bundle size check (fail si > 1MB gzipped)

## 1.3 Nettoyage Code
- [ ] Migrer `console.*` restants vers `@/utils/logger` (12 fichiers identifies)
  - `StockProductionPage.tsx` (7 instances)
  - `authStore.ts`, `coreSettingsStore.ts`
  - Services/hooks offline
- [ ] Resoudre les 10 TODO/FIXME restants ou les documenter comme "post-launch"
- [ ] Finaliser migration CSS -> Tailwind (18 fichiers CSS restants)

## 1.4 Bundle Optimization
- [ ] Ajouter `rollup-plugin-visualizer` pour analyser le bundle
- [ ] Verifier que le code splitting fonctionne (vendor-react, vendor-query, vendor-supabase deja configures)
- [ ] Lazy load `recharts` et `jspdf` (uniquement charges sur /reports et /dashboard)
- [ ] Cible : < 500KB initial bundle (hors lazy chunks)

## 1.5 Tests Critiques Manquants
- [ ] Test E2E du flux POS complet (add -> modify -> pay -> receipt)
- [ ] Test du dashboard (nouveau)
- [ ] Verifier les 2 tests flaky documentes

---
