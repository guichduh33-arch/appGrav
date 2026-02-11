# Guide de Développement - AppGrav

*Généré le 2026-01-26 - Scan Exhaustif*

## Prérequis

| Outil | Version | Utilisation |
|-------|---------|-------------|
| Node.js | 18+ | Runtime JavaScript |
| npm | 9+ | Gestionnaire de paquets |
| Git | 2.30+ | Contrôle de version |

### Optionnel (Mobile)
| Outil | Version | Utilisation |
|-------|---------|-------------|
| Xcode | 15+ | Build iOS |
| Android Studio | 2023+ | Build Android |
| Capacitor CLI | 8.0 | Pont natif |

## Installation

```bash
# Cloner le repository
git clone <repo-url>
cd AppGrav

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés
```

## Variables d'Environnement

Créer un fichier `.env` à la racine :

```env
# Supabase (OBLIGATOIRE)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Application
VITE_APP_NAME=AppGrav

# Claude AI (optionnel)
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

## Commandes de Développement

### Application Principale

```bash
# Démarrer le serveur de dev (port 3000)
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview

# Lint du code
npm run lint

# Tests
npx vitest run              # Tous les tests
npx vitest run src/path/file.test.ts  # Un seul fichier
npx vitest                  # Mode watch

# Test intégration Claude
npm run test:claude
```

### Print-Server

```bash
cd print-server

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env

# Démarrer le serveur (port 3001)
npm start

# Mode développement (watch)
npm run dev

# Test d'impression
npm test
```

### Mobile (Capacitor)

```bash
# Synchroniser les assets web
npx cap sync

# Ouvrir dans Xcode (iOS)
npx cap open ios

# Ouvrir dans Android Studio
npx cap open android

# Build et run
npx cap run ios
npx cap run android
```

## Structure des Tests

```
src/
├── setupTests.ts          # Configuration Vitest
├── **/*.test.ts           # Tests unitaires
└── **/*.test.tsx          # Tests composants
```

### Configuration Vitest

```typescript
// vite.config.ts
test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
}
```

## Workflow de Développement

### 1. Nouvelle Feature

```bash
# Créer une branche
git checkout -b feature/nom-feature

# Développer...
npm run dev

# Tester
npx vitest run

# Lint
npm run lint

# Commit
git add .
git commit -m "feat: description"
```

### 2. Base de Données

```bash
# Les migrations sont dans supabase/migrations/
# Appliquer via le dashboard Supabase ou CLI

# Après modification du schéma, mettre à jour les types :
# src/types/database.ts
```

### 3. Nouvelles Traductions

Ajouter les clés dans les 3 fichiers :
- `src/locales/fr.json` (Français - principal)
- `src/locales/en.json` (Anglais)
- `src/locales/id.json` (Indonésien)

## Configuration Déploiement

### Docker

```dockerfile
# Build multi-stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serveur Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

```bash
# Build image
docker build -t appgrav .

# Run container
docker run -p 80:80 appgrav
```

### Supabase Edge Functions

```bash
# Déployer une fonction
supabase functions deploy auth-verify-pin

# Logs
supabase functions logs auth-verify-pin
```

## Conventions de Code

### Nommage

| Élément | Convention | Exemple |
|---------|------------|---------|
| Composants | PascalCase | `ProductCard.tsx` |
| Fonctions | camelCase | `handleSubmit()` |
| Interfaces | I + PascalCase | `IProduct` |
| Types | T + PascalCase | `TOrderStatus` |
| Colonnes DB | snake_case | `created_at` |

### Organisation des Fichiers

- Max 300 lignes par fichier
- Un composant par fichier
- CSS colocalisé (`Component.tsx` + `Component.css`)

### Imports

```typescript
// Utiliser l'alias @/ pour les imports depuis src/
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/stores/cartStore'
```

## Debugging

### React DevTools
- Installer l'extension navigateur
- Inspecter les composants et leur état

### Supabase
- Dashboard : logs SQL, Edge Functions
- `supabase.auth.getSession()` pour débugger auth

### Zustand
```typescript
// Inspecter les stores
console.log(useCartStore.getState())
```

## Ressources

- [Vite Documentation](https://vitejs.dev/)
- [React 18 Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query/latest)
