# Web App + Mobile Specific Requirements

### Project-Type Overview

| Aspect | Décision |
|--------|----------|
| **Type** | Web App (React SPA) + Mobile (Capacitor) |
| **Distribution Mobile** | Interne (APK/IPA direct, pas de stores) |
| **Navigateur Cible** | Chrome uniquement |
| **Notifications Push** | Non requises |
| **Fonctionnalités Natives** | Aucune (pas de caméra, bluetooth) |

### Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    APPAREILS                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ POS      │  │ Mobile   │  │ Customer │  │  KDS   │  │
│  │ (Chrome) │  │(Capacitor)│  │ Display  │  │(Chrome)│  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
└───────┼─────────────┼─────────────┼────────────┼───────┘
        │             │             │            │
        └─────────────┴──────┬──────┴────────────┘
                             │
┌────────────────────────────┴────────────────────────────┐
│                    RÉSEAU LOCAL (LAN)                    │
│            Communication temps réel même offline         │
└────────────────────────────┬────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │   SUPABASE      │
                    │   (Cloud)       │
                    │   Sync quand    │
                    │   internet OK   │
                    └─────────────────┘
```

### Technical Stack Decisions

| Domaine | Spécification |
|---------|---------------|
| **Frontend** | React 18 + TypeScript + Vite (existant) |
| **État Local** | Zustand + IndexedDB pour persistence offline |
| **Sync** | Supabase Realtime + file d'attente offline |
| **Mobile** | Capacitor (distribution APK/IPA interne) |
| **Réseau Local** | WebSocket ou HTTP local pour communication LAN |
| **Customer Display** | Route dédiée `/display` (même app, écran secondaire) |

### Implementation Simplifications

| Ce qu'on évite | Bénéfice |
|----------------|----------|
| Publication stores | Pas de review Apple/Google, déploiement rapide |
| Multi-navigateurs | Pas de tests Safari/Firefox, CSS simplifié |
| Push notifications | Pas de Firebase/APNs à configurer |
| Fonctionnalités natives | Pas de permissions complexes |
