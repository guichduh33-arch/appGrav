# Story 1.4: Network Status Indicator

Status: done

<!-- Note: Implementation already exists. This story documents and validates existing work with one correction applied. -->

## Story

As a **Caissier**,
I want **voir un indicateur discret du statut réseau**,
so that **je sais si je suis online ou offline sans stress**.

## Acceptance Criteria

### AC1: Indicateur Online Visible
**Given** l'application est online
**When** je regarde le header/sidebar
**Then** je vois une icône wifi verte discrète
**And** le texte "En ligne" est affiché (ou icône seule en mode compact)

### AC2: Indicateur Offline Non-Alarmant
**Given** internet est coupé
**When** la connexion est perdue
**Then** l'icône devient **grise** (pas rouge, pas alarmant)
**And** le texte "Hors ligne" est affiché
**And** aucune popup intrusive ne s'affiche

### AC3: Transition Rapide
**Given** le statut réseau change
**When** la connexion est perdue ou rétablie
**Then** la transition de l'indicateur est < 2 secondes (NFR-A2)
**And** le feedback visuel est < 100ms (NFR-U3)

### AC4: Mode LAN-Only
**Given** internet est coupé mais le LAN fonctionne
**When** la connexion LAN est détectée
**Then** l'icône devient jaune avec icône Radio
**And** le texte "Mode LAN" est affiché

### AC5: Accessibilité
**Given** un utilisateur avec lecteur d'écran
**When** le statut change
**Then** le changement est annoncé via aria-live="polite"
**And** le composant a role="status"

## Tasks / Subtasks

- [x] **Task 1: Créer Network Store (Zustand)** (AC: 1,2,3,4)
  - [x] 1.1: Créer `src/stores/networkStore.ts`
  - [x] 1.2: Définir `TNetworkMode = 'online' | 'lan-only' | 'offline'`
  - [x] 1.3: Implémenter `setIsOnline()` et `setIsLanConnected()`
  - [x] 1.4: Calculer `networkMode` basé sur `isOnline` et `isLanConnected`
  - [x] 1.5: Persister `lastOnlineAt` et `lanHubUrl` dans localStorage

- [x] **Task 2: Créer useNetworkStatus Hook** (AC: 3)
  - [x] 2.1: Créer `src/hooks/useNetworkStatus.ts`
  - [x] 2.2: Écouter les événements browser `online`/`offline`
  - [x] 2.3: Mettre à jour networkStore sur changement
  - [x] 2.4: Retourner `{ networkMode, isOnline, isLanConnected, lastOnlineAt }`

- [x] **Task 3: Créer NetworkIndicator Component** (AC: 1,2,4,5)
  - [x] 3.1: Créer `src/components/ui/NetworkIndicator.tsx`
  - [x] 3.2: Configurer couleurs par mode:
    - Online: vert (`text-green-600`, `bg-green-100`, icône Wifi)
    - LAN-only: jaune (`text-yellow-600`, `bg-yellow-100`, icône Radio)
    - Offline: **gris** (`text-gray-500`, `bg-gray-100`, icône WifiOff) ← CORRIGÉ
  - [x] 3.3: Ajouter mode `compact` (icône seule)
  - [x] 3.4: Ajouter `role="status"` et `aria-live="polite"`
  - [x] 3.5: Respecter NFR-U2 (touch target 44x44px minimum)

- [x] **Task 4: Intégrer dans les Layouts** (AC: 1,2)
  - [x] 4.1: Ajouter `<NetworkIndicator />` dans `CategoryNav.tsx` (POS)
  - [x] 4.2: Ajouter `<NetworkIndicator />` dans `BackOfficeLayout.tsx`
  - [x] 4.3: Position toujours visible (NFR-U4)

- [x] **Task 5: Ajouter Traductions** (AC: 1,2,4)
  - [x] 5.1: Ajouter clés dans `fr.json`: `network.online`, `network.offline`, `network.lanOnly`
  - [x] 5.2: Ajouter clés dans `en.json`
  - [x] 5.3: Ajouter clés dans `id.json`

- [x] **Task 6: Écrire Tests** (AC: 1,2,3,4,5)
  - [x] 6.1: Créer `src/components/ui/NetworkIndicator.test.tsx`
  - [x] 6.2: Tester affichage online (vert, Wifi)
  - [x] 6.3: Tester affichage offline (**gris**, WifiOff) ← CORRIGÉ
  - [x] 6.4: Tester affichage lan-only (jaune, Radio)
  - [x] 6.5: Tester mode compact
  - [x] 6.6: Tester accessibilité (role, aria-live, aria-label)
  - [x] 6.7: Tester NFR-U2 (44x44px minimum)

## Dev Notes

### Architecture Compliance (MANDATORY)

From [architecture.md]:

**ADR-006: Architecture Socket.IO LAN**
- NetworkStore prépare l'infrastructure pour LAN detection (Story 4.1)
- `isLanConnected` sera activé quand le WebSocket hub est implémenté

**NFR Compliance:**
- NFR-A2: Transition detection < 2 secondes (événements browser instantanés)
- NFR-U2: Touch target minimum 44x44px
- NFR-U3: Visual feedback < 100ms (state updates trigger immediate re-render)
- NFR-U4: Indicateur toujours visible dans le header persistant

### Implementation Status (ALREADY COMPLETE)

Cette story a été **PRÉ-IMPLÉMENTÉE** lors des stories précédentes. L'analyse de la codebase révèle:

**Fichiers existants:**
- `src/stores/networkStore.ts` - Store Zustand complet
- `src/hooks/useNetworkStatus.ts` - Hook avec événements browser
- `src/components/ui/NetworkIndicator.tsx` - Composant avec 3 modes
- `src/components/ui/NetworkIndicator.test.tsx` - 13 tests complets

**Intégrations existantes:**
- `src/components/pos/CategoryNav.tsx` - Indicateur dans POS sidebar
- `src/layouts/BackOfficeLayout.tsx` - Indicateur dans Back Office sidebar

**Traductions complètes:**
- `fr.json`: "En ligne", "Hors ligne", "Mode LAN"
- `en.json`: "Online", "Offline", "LAN Mode"
- `id.json`: "Daring", "Luring", "Mode LAN"

### Correction Appliquée

**Problème identifié:** Le mode offline utilisait rouge au lieu de gris
- Avant: `text-red-600`, `bg-red-100`
- Après: `text-gray-500`, `bg-gray-100`

**Raison:** La story exige explicitement "icône grise (pas rouge, pas alarmant)" pour éviter de stresser les caissiers pendant les coupures internet normales.

### Project Structure Notes

**Fichiers impliqués:**
```
src/
├── stores/
│   ├── networkStore.ts          # ✅ EXISTS: Network state management
│   └── networkStore.test.ts     # ✅ EXISTS: Store tests
├── hooks/
│   ├── useNetworkStatus.ts      # ✅ EXISTS: Main hook
│   ├── useNetworkStatus.test.ts # ✅ EXISTS: Hook tests
│   ├── useNetworkAlerts.ts      # ✅ EXISTS: Toast alerts on change
│   └── offline/
│       └── useNetworkStatus.ts  # ✅ EXISTS: Simplified version
├── components/
│   └── ui/
│       ├── NetworkIndicator.tsx      # ✅ EXISTS: Main component
│       └── NetworkIndicator.test.tsx # ✅ EXISTS: 13 tests passing
└── layouts/
    └── BackOfficeLayout.tsx     # ✅ INTEGRATED: Indicator visible
```

### Testing Strategy

**Test File:** `src/components/ui/NetworkIndicator.test.tsx`
**Tests:** 13 tests all passing

**Test Coverage:**
1. Online mode - green styling, Wifi icon
2. Offline mode - **gray styling** (corrected), WifiOff icon
3. LAN-only mode - yellow styling, Radio icon
4. Compact mode - icon only
5. Accessibility - role="status", aria-live="polite", aria-label
6. NFR-U2 compliance - 44x44px minimum touch target
7. Custom className support

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-1.4]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-006]
- [Source: src/stores/networkStore.ts] - Network state management
- [Source: src/hooks/useNetworkStatus.ts] - Browser event handling
- [Source: src/components/ui/NetworkIndicator.tsx] - UI component
- [Source: CLAUDE.md#Architecture] - Project conventions

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

None - Pre-existing implementation validated, one color correction applied.

### Completion Notes List

1. **Analysis Complete**: Full codebase analysis revealed Story 1.4 was already implemented during prior development work.

2. **Color Correction Applied**: Changed offline mode from alarming red to neutral gray per story requirements:
   - `text-red-600` → `text-gray-500`
   - `bg-red-100` → `bg-gray-100`

3. **Tests Updated**: Modified test expectations to match gray styling (13/13 tests passing).

4. **Validation**: All acceptance criteria satisfied:
   - AC1: Green indicator when online ✅
   - AC2: Gray indicator when offline (non-alarming) ✅
   - AC3: Transition < 2 seconds ✅
   - AC4: Yellow indicator for LAN-only mode ✅
   - AC5: Full accessibility support ✅

### File List

**Modified (Color Correction + Code Review Fixes):**
- `src/components/ui/NetworkIndicator.tsx` - Changed offline color from red to gray, updated JSDoc
- `src/components/ui/NetworkIndicator.test.tsx` - Updated test expectations for gray color
- `src/stores/networkStore.ts` - Updated comment, added localStorage error handling
- `src/hooks/useNetworkStatus.ts` - Added clarifying JSDoc, added default export
- `src/hooks/offline/useNetworkStatus.ts` - Updated JSDoc with correct story reference

**Pre-existing (No Changes Needed):**
- `src/stores/networkStore.ts` - Network state store
- `src/stores/networkStore.test.ts` - Store tests
- `src/hooks/useNetworkStatus.ts` - Main network status hook
- `src/hooks/useNetworkStatus.test.ts` - Hook tests
- `src/hooks/useNetworkAlerts.ts` - Network change toast alerts
- `src/hooks/offline/useNetworkStatus.ts` - Simplified offline hook
- `src/components/pos/CategoryNav.tsx` - POS integration
- `src/layouts/BackOfficeLayout.tsx` - Back Office integration
- `src/locales/fr.json` - French translations
- `src/locales/en.json` - English translations
- `src/locales/id.json` - Indonesian translations

### Senior Developer Review (AI)

**Review Date:** 2026-01-30
**Reviewer:** Claude Opus 4.5 (code-review workflow)
**Outcome:** ✅ Approved (all issues fixed)

**Issues Found:** 1 High, 4 Medium, 3 Low
**Issues Fixed:** 5 (all HIGH and MEDIUM)

**Action Items:**
- [x] [HIGH] Clarified dual useNetworkStatus hooks with JSDoc documentation
- [x] [MEDIUM] Fixed JSDoc comment in NetworkIndicator.tsx (red → gray)
- [x] [MEDIUM] Fixed comment in networkStore.ts (red → gray)
- [x] [MEDIUM] Added try/catch error handling for localStorage operations
- [x] [MEDIUM] Added default export to main useNetworkStatus hook
- [ ] [LOW] Magic strings for i18n keys (deferred - works correctly)
- [ ] [LOW] console.debug in production (deferred - useful for debugging)
- [ ] [LOW] Story reference in offline hook (fixed during review)

**Files Modified During Review:**
- `src/components/ui/NetworkIndicator.tsx` - Updated JSDoc comment
- `src/stores/networkStore.ts` - Updated comment + added localStorage error handling
- `src/hooks/useNetworkStatus.ts` - Added clarifying JSDoc + default export
- `src/hooks/offline/useNetworkStatus.ts` - Updated JSDoc with correct story reference

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-30 | Code review passed: 5 issues fixed, 39/39 tests pass, status → done | Claude Opus 4.5 |
| 2026-01-30 | Story validated: pre-existing implementation discovered, color corrected (red→gray), 39/39 tests pass | Claude Opus 4.5 |
