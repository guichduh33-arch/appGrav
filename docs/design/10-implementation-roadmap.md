# Plan d'Implémentation Priorisé

> Audit UI/UX AppGrav - Roadmap
> Date : 2026-02-13

---

## Priorités

| Priorité | Description | Délai |
|----------|-------------|-------|
| **Sprint 1** | Quick Wins critiques | 3-5 jours |
| **Sprint 2** | Design system foundation | 5-7 jours |
| **Sprint 3** | POS redesign | 5-7 jours |
| **Sprint 4** | KDS + Customer Display | 3-5 jours |
| **Sprint 5** | Back-office polish | 5-7 jours |

---

## Sprint 1 : Quick Wins Critiques (P0)

### 1.1 Supprimer tous les Emojis (1 jour)

**Fichiers à modifier :**
| Fichier | Changement |
|---------|-----------|
| `src/pages/auth/LoginPage.tsx` | 🥐 -> `<BreakeryLogo />` SVG |
| `src/pages/pos/POSMainPage.tsx` | 🍽️🥡🚴🏢 -> Lucide icons |
| `src/pages/kds/KDSMainPage.tsx` | "🥐 The Breakery KDS" -> Logo + "KDS" |
| `src/components/kds/KDSHeader.tsx` | Emojis type commande -> Lucide |
| `src/components/kds/KDSOrderCard.tsx` | Emojis -> Lucide icons |
| `src/components/pos/Cart.tsx` | Emojis type commande -> Lucide |
| `src/components/pos/ProductGrid.tsx` | `getProductEmoji()` -> catégorie dot |
| `src/pages/display/CustomerDisplayPage.tsx` | Emojis -> Lucide icons |
| `src/components/mobile/*.tsx` | Emojis -> Lucide icons |

**Composant à créer :**
```
src/components/ui/BreakeryLogo.tsx
  - Props: size (sm/md/lg), variant (light/dark/gold)
  - SVG inline ou import SVG asset
  - Fallback: texte "TB" en Cormorant Garamond si SVG non disponible
```

**Composant utilitaire à créer :**
```
src/components/ui/OrderTypeIcon.tsx
  - Props: type ('dine_in' | 'takeaway' | 'delivery' | 'b2b'), size
  - Retourne l'icône Lucide + label appropriés
  - Couleur par type: vert/ambre/bleu/violet
```

### 1.2 Centraliser les Couleurs Hardcodées (1 jour)

**Fichier :** `src/styles/index.css`

Ajouter les CSS custom properties manquantes :
```css
:root {
  /* POS Dark Theme */
  --pos-bg-deep: #111113;
  --pos-bg-surface: #1A1A1E;
  --pos-bg-elevated: #232328;
  --pos-bg-hover: #2C2C32;
  --pos-border: #353538;
  --pos-border-subtle: #28282C;
  --pos-text-primary: #F5F4F1;
  --pos-text-secondary: #A8A29E;
  --pos-text-muted: #78716C;
}
```

**Fichiers à migrer :**
| Fichier | Couleurs hardcodées à remplacer |
|---------|-------------------------------|
| `src/pages/pos/POSMainPage.css` | `#020617`, `#1a1a1f`, `#2a2a30`, `#0f0f12` |
| `src/components/kds/KDSHeader.tsx` | `#333`, `#444`, `#EF4444` inline |
| `src/components/kds/KDSOrderCard.tsx` | `#F59E0B`, couleurs station inline |
| `src/pages/kds/KDSMainPage.tsx` | `#2a2a2a`, couleurs station |

### 1.3 Augmenter les Cibles Tactiles KDS (0.5 jour)

**Fichier :** `src/components/kds/KDSHeader.tsx`
```
AVANT : w-10 h-10 (40px)
APRÈS : w-12 h-12 (48px)
```

Vérifier aussi :
- Boutons bump dans `KDSOrderCard.tsx`
- Boutons action dans `POSMainPage.tsx`
- Tous les `w-10 h-10` dans le contexte POS/KDS

---

## Sprint 2 : Design System Foundation (5-7 jours)

### 2.1 Mettre à jour `tailwind.config.js` (1 jour)

Basé sur l'Option C (Hybride Moderne), mettre à jour :
- Palette de couleurs complète
- Tokens de spacing
- Border-radius uniformisés
- Ombres
- Z-index stack
- Animation tokens

### 2.2 Refondre `src/styles/index.css` (1.5 jour)

- Consolider les CSS custom properties avec la nouvelle palette
- Mettre à jour les composants `.btn-*`, `.card`, `.input`, `.badge-*`
- Ajouter les tokens POS dark mode
- Vérifier tous les contrastes WCAG AA

### 2.3 Composant Skeleton Loader (0.5 jour)

```
src/components/ui/Skeleton.tsx
  Variants: text, card, table-row, chart, stat-card
  Props: width, height, className
  Animation: pulse opacity 0.4-0.7, 1.5s
```

Remplacer tous les "Loading..." par `<Skeleton>` dans :
- `src/pages/reports/ReportsPage.tsx`
- `src/pages/dashboard/DashboardPage.tsx`
- `src/pages/inventory/StockPage.tsx`
- `src/pages/orders/OrdersPage.tsx`

### 2.4 Composant Empty State (0.5 jour)

```
src/components/ui/EmptyState.tsx
  Props: icon (Lucide), title, description, action? (button)
  Style: centered, 48px icon muted, text hierarchy
```

### 2.5 Mettre à jour Badge Component (0.5 jour)

`src/components/ui/badge.tsx` : ajouter les variants manquantes et uniformiser.

### 2.6 Mettre à jour Button Component (0.5 jour)

`src/components/ui/button.tsx` : ajouter tailles `xl` et `icon-lg` pour POS/KDS.

### 2.7 Breadcrumbs Component (0.5 jour)

Améliorer `src/components/ui/Breadcrumbs.tsx` :
- Auto-génération depuis le router
- Intégration dans `BackOfficeLayout.tsx`

---

## Sprint 3 : POS Redesign (5-7 jours)

### 3.1 Ajustement Layout POS (1 jour)

- Réduire panier de 460px à 380px
- Réduire sidebar catégories de 200px à 172px
- Compacter header de 64px à 56px
- Compacter footer de 56px à 52px

### 3.2 Redesign Bouton PAY (0.5 jour)

- Full-width, 56px hauteur
- Gradient gold
- Total intégré dans le bouton "PAY IDR XXX,XXX"
- Icon CreditCard 20px
- Shadow gold

### 3.3 Feedback Ajout Panier (1 jour)

- Scale bounce carte produit (150ms)
- Badge counter bump (200ms)
- Toast discret "Added" (1.5s)

### 3.4 Product Cards Enhancement (1 jour)

- Dot catégorie (4px, couleur)
- Badge stock faible
- Hover amélioré (elevation + border)
- Image produit optionnelle

### 3.5 Redesign Header POS (0.5 jour)

- Simplifier : Logo | Session | [spacer] | Time | Online dot | Menu
- Search déplacé dans la zone produits (plus grande)

### 3.6 Search Bar Améliorée (0.5 jour)

- 44px hauteur (POS tactile)
- Rounded-md (pas rounded-full)
- Clear button visible
- Debounce 200ms

### 3.7 Held Orders Indicator (1 jour)

- Badge numérique sur bouton Hold
- Slide-over panel liste des held orders
- Restore + Delete par commande

---

## Sprint 4 : KDS + Customer Display (3-5 jours)

### 4.1 KDS Progress Bar (0.5 jour)

Ajouter `<OrderProgressBar>` dans chaque `KDSOrderCard`.

### 4.2 KDS Typographie Augmentée (0.5 jour)

Augmenter toutes les tailles selon les specs KDS redesign.

### 4.3 KDS Bump Button Redesign (0.5 jour)

- 48px min height
- Full-width
- Couleur par action (Start=bleu, Ready=vert, Served=gris)

### 4.4 Customer Display Redesign (2 jours)

- État Idle avec carousel
- État Active avec animation ajout
- État Success avec checkmark
- Transitions fluides entre états
- Logo watermark
- Mode Queue multi-commandes

### 4.5 Customer Display Veille (0.5 jour)

- Dimming après 30min
- Carousel ralenti

---

## Sprint 5 : Back-Office Polish (5-7 jours)

### 5.1 Sidebar Navigation (1.5 jour)

- Corriger active state (rose -> gold)
- Ajouter badges dynamiques
- Restructurer les groupes
- Sous-menus expandables

### 5.2 Settings Active State (0.5 jour)

- Corriger `--color-rose-poudre` -> gold dans SettingsLayout

### 5.3 Tables Uniformisées (1 jour)

- Appliquer le design system aux tables inventory, orders, users
- Stock level badges (au lieu de gradient rouge)
- Pagination uniforme

### 5.4 Dashboard KPIs (1 jour)

- Skeleton loaders
- Trend indicators (flèche + %)
- Palette graphiques cohérente

### 5.5 Toasts Redesign (0.5 jour)

- Sonner config mise à jour
- Bordure gauche colorée par type
- Icônes Lucide par type

### 5.6 Forms Polish (1 jour)

- Focus state gold uniforme
- Error state uniforme
- Labels et validation visuelle

---

## Checklist de Cohérence Post-Implémentation

### Couleurs
- [ ] Aucune couleur hex hardcodée dans les composants (tout via CSS vars ou Tailwind)
- [ ] Palette fonctionnelle (success/warning/danger/info) identique partout
- [ ] Contrastes WCAG AA vérifiés pour toutes les combinaisons texte/fond
- [ ] POS entièrement en dark mode via `--pos-*` variables
- [ ] Back-office en light mode via variables standard

### Typographie
- [ ] Cormorant Garamond uniquement pour les headings
- [ ] DM Sans pour tout le texte UI
- [ ] JetBrains Mono pour timers et montants tabulaires
- [ ] Taille minimum 14px pour contenu, 16px pour POS
- [ ] `tabular-nums` sur tous les montants financiers

### Iconographie
- [ ] Zéro emoji dans toute l'application
- [ ] Lucide icons exclusivement
- [ ] Stroke-width cohérent (1.5 nav, 2 actions)
- [ ] Tailles uniformes par contexte (16/18/20/24px)
- [ ] Logo SVG The Breakery intégré (login, sidebar, POS, display)

### Composants
- [ ] Boutons : même variants partout (primary/secondary/ghost/danger)
- [ ] Cards : radius 12px back-office, 8px POS/KDS
- [ ] Inputs : height 40px, focus ring gold
- [ ] Modals : overlay blur, radius 16px, animation in/out
- [ ] Toasts : Sonner, position top-right, border gauche colorée
- [ ] Tables : header sticky, hover rows, pagination uniforme
- [ ] Badges : variants semantic (success/warning/danger/info/default)

### Accessibilité
- [ ] Focus visible (:focus-visible) sur tous les interactifs
- [ ] `prefers-reduced-motion` respecté
- [ ] Cibles tactiles >= 44px (48px pour POS/KDS)
- [ ] `aria-label` sur les boutons icon-only
- [ ] Skip link fonctionnel

### Performance
- [ ] Animations < 300ms (sauf pulse KDS intentionnels)
- [ ] Pas de layout shift
- [ ] Skeleton loaders au lieu de "Loading..."
- [ ] Transitions GPU-accelerated (transform/opacity)

---

## Estimation Globale

| Sprint | Effort | Priorité |
|--------|--------|----------|
| Sprint 1 : Quick Wins | 3-5 jours | Immédiat |
| Sprint 2 : Design System | 5-7 jours | Semaine 2 |
| Sprint 3 : POS | 5-7 jours | Semaine 3-4 |
| Sprint 4 : KDS + Display | 3-5 jours | Semaine 4-5 |
| Sprint 5 : Back-office | 5-7 jours | Semaine 5-6 |
| **Total** | **21-31 jours** | **6-8 semaines** |

### Quick Wins à Impact Maximal (Jour 1)
1. Remplacer les emojis par Lucide icons + logo SVG
2. Corriger les cibles tactiles KDS < 44px
3. Centraliser 4 couleurs hardcodées les plus fréquentes

Ces 3 actions seules améliorent significativement le professionnalisme perçu.

---

*Document généré dans le cadre de l'audit UI/UX complet d'AppGrav*
