# Analyse Concurrentielle POS/ERP Restaurant

> Audit UI/UX AppGrav - Phase 1 : Benchmarking
> Date : 2026-02-13

---

## 1. Concurrents Analysés

| Système | Segment | Force Principale |
|---------|---------|-----------------|
| Toast POS | POS restaurant US #1 | Dark UI, hardware dédié |
| Square for Restaurants | POS minimaliste | UX exemplaire, design épuré |
| Lightspeed Restaurant | POS Europe/haut de gamme | Interface riche, plan de salle |
| TouchBistro | POS iPad table-service | Ergonomie tactile native |
| Revel Systems | POS enterprise multi-sites | Dashboards analytiques denses |
| Restroworks (ex-Posist) | ERP restaurant full-stack | Gestion chaîne complète |
| MarketMan | Gestion stocks/achats | Inventaire, fournisseurs |
| Fresh KDS | KDS dédié | Référence design cuisine |

---

## 2. Palettes de Couleurs Comparées

| Système | Marque | POS BG | CTA | Success | Warning | Error |
|---------|--------|--------|-----|---------|---------|-------|
| Toast | `#FF6600` orange | `#1A1A2E` | `#FF6600` | `#00C853` | `#FFB300` | `#FF1744` |
| Square | `#006AFF` bleu | `#FFFFFF` | `#006AFF` | `#1DBE68` | `#FFBF00` | `#CC0023` |
| Lightspeed | `#00CC66` vert | `#1B2838` | `#00CC66` | `#00CC66` | `#F5A623` | `#E74C3C` |
| TouchBistro | `#FF6B35` orange | `#1C2833` | `#FF6B35` | `#2ECC71` | `#F1C40F` | `#E74C3C` |
| Revel | `#0066CC` bleu | `#2C2C2C` | `#0066CC` | `#28A745` | `#FFC107` | `#DC3545` |
| Restroworks | `#FF4B4B` rouge | Dark | `#FF4B4B` | `#4CAF50` | `#FF9800` | - |
| Fresh KDS | N/A | `#0D0D0D` | N/A | `#4CAF50` | `#FFB300` | `#F44336` |
| **AppGrav** | **`#d4b465` or** | **`#0f0f12`** | **`#d4b465`** | **`#22c55e`** | **`#eab308`** | **`#ef4444`** |

### Observations Clés
- AppGrav est le **seul** système à utiliser une palette dorée/champagne comme couleur primaire
- Tous les concurrents utilisent bleu, vert, orange ou rouge comme accent principal
- La palette gold donne à The Breakery une identité **premium et distinctive**
- Les couleurs fonctionnelles (success/warning/error) d'AppGrav sont alignées avec l'industrie

---

## 3. Patterns de Layout POS

### Toast POS
- **2 colonnes** : Gauche ~65% produits, Droite ~35% panier
- Catégories en **tabs horizontaux** (scroll) au-dessus de la grille
- Grille produits : tuiles carrées ~100px, nom + prix, image optionnelle
- Panier : pleine hauteur, totaux sticky en bas
- Paiement : modal plein écran avec numpad large

### Square for Restaurants
- **2 colonnes** : Gauche ~60% produits, Droite ~40% panier
- Catégories en **pills horizontaux** (scroll), pas de sidebar
- Design ultra-minimaliste : pas de gradients, flat, beaucoup de blanc
- Paiement : plein écran avec montant circulaire en haut

### Lightspeed Restaurant
- **3 colonnes** : Sidebar catégories | Grille produits | Panier
- Catégories : sidebar verticale avec boutons **colorés par catégorie**
- Tuiles produits colorées par catégorie (pâtisseries = rose, boissons = bleu)
- Plan de salle intégré directement dans le flux POS

### TouchBistro
- Layout iPad natif, **2 colonnes**
- Catégories : sidebar gauche avec grandes icônes + texte
- Bottom tab bar iOS-style : Tables, Commande, Menu, Rapports
- Mode "Quick Service" distinct du mode table-service

### AppGrav (Actuel)
- **3 sections** : Sidebar catégories (200px) | Grille produits | Panier (460px)
- Dark theme `#0f0f12`
- Header 64px, Footer 56px
- Plus proche du modèle **Lightspeed** (3 colonnes)

### Consensus Industrie
| Élément | Standard |
|---------|----------|
| Colonnes | 2-3 colonnes (produits + panier obligatoire) |
| Catégories | Horizontal (Toast, Square, Revel) OU Vertical (Lightspeed, TouchBistro) |
| CTA Paiement | Full-width, 48-56px hauteur, couleur primaire |
| Fond POS | Dark `#0F-#1A` (sauf Square en blanc) |
| Numpad | Large, séparé dans modal paiement |

---

## 4. Patterns KDS (Kitchen Display)

### Fresh KDS (Référence)
- Fond **pure dark** `#0D0D0D`
- Grille 3-4 colonnes de cartes commandes
- **Bordure gauche colorée** (4-6px) selon statut
- Timer monospace proéminent par carte
- Bouton "bump" large par carte
- Barre résumé en haut (compteurs par statut)
- All-day count panel (agrégat items)

### Codes Couleur Temporels (Standard Industrie)

| Temps | Couleur | Code |
|-------|---------|------|
| < 5 min | Vert | `#4CAF50` |
| 5-10 min | Jaune/Ambre | `#FFB300` |
| 10-15 min | Orange | `#FF9800` |
| > 15 min | Rouge | `#F44336` |
| > 20 min | Rouge pulsant | `#F44336` + animation |

### AppGrav KDS (Actuel)
- Fond `#2A2A2A`, stations color-codées (rouge, violet, vert, bleu)
- Kanban 4 colonnes : Urgent | New | Preparing | Ready
- Animations pulse : urgent (1s), new (3s), critical (2s)
- **Aligné** avec les standards Fresh KDS

---

## 5. Navigation Back-Office

| Système | Pattern | Détail |
|---------|---------|--------|
| Toast | Sidebar gauche | Icon + text, collapsible |
| Square | Sidebar icon-only | Expand on hover |
| Lightspeed | Top bar + sidebar | Double navigation |
| Revel | Sidebar gauche nested | Menu profond |
| Restroworks | Sidebar dark navy | Sections groupées |
| MarketMan | Sidebar 240px | Toujours visible |
| **AppGrav** | **Sidebar 280px collapsible** | **Collapse à 88px** |

### Consensus
- **Sidebar gauche** est le standard universel pour le back-office
- Collapse/expand est attendu (AppGrav l'implémente)
- Groupement logique par module (Opérations, Stocks, Finance, Admin)
- Badges/compteurs sur items actifs (commandes en attente, alertes stock)
- Breadcrumbs pour la navigation interne

---

## 6. Tendances Design POS/ERP 2025-2026

### A. Dark Mode
- **Standard POS** : Dark mode par défaut (Toast, Lightspeed, TouchBistro)
- **Standard Back-office** : Light mode par défaut
- **KDS** : Universellement dark
- **Tendance** : "Contextual theming" -- POS dark, back-office light
- **AppGrav** : Aligné (POS dark, back-office light)

### B. Touch-First
- Cible tactile minimum : 44x44px (WCAG) tendant vers **48x48px** (Material Design 3)
- Espacement entre cibles : minimum 8px, recommandé 12-16px
- "Thumb zone" : actions critiques dans les 40% inférieurs de l'écran
- Feedback visuel : changement couleur < 150ms
- CTA principal : 48-56px hauteur, full-width

### C. Typographie Data-Heavy
- **Inter** devenu le standard de facto pour SaaS data-heavy
- **DM Sans** alternative solide (choix actuel d'AppGrav)
- Taille base : tendance vers 13-14px (AppGrav à 13px : aligné)
- Chiffres tabulaires (`tabular-nums`) obligatoire pour données financières
- Polices serif réservées au branding uniquement

### D. Glassmorphism / Neomorphism
- **Glassmorphism** (backdrop-blur) : pertinent uniquement pour overlays/modals
- **Neomorphism** : **abandonné** pour POS (mauvais contraste, affordance floue)
- **Tendance réelle** : "Flat with depth" -- design plat avec élévation subtile (box-shadow)

### E. Accessibilité
- WCAG 2.1 AA minimum, tendance vers 2.2 AA
- Contraste : 4.5:1 texte normal, 3:1 gros texte
- Ne jamais dépendre de la couleur seule : toujours icône + texte
- Focus visible obligatoire
- `prefers-reduced-motion` supporté

---

## 7. Positionnement AppGrav vs Concurrence

### Forces (Avance sur la concurrence)

| Aspect | Détail |
|--------|--------|
| **Identité unique** | Palette gold/champagne distinctive, aucun concurrent n'utilise de doré |
| **Typographie serif** | Cormorant Garamond pour headings = touche "boulangerie française" |
| **Ombres chaudes** | `rgba(45,42,36,...)` au lieu de noir pur = chaleur artisanale |
| **Dual theme** | POS dark + back-office light = pattern Toast/Lightspeed |
| **Accessibilité** | Focus visible, reduced motion, contraste WCAG implémentés |
| **Offline-first** | Indicateurs réseau/sync intégrés (rare chez les concurrents cloud-only) |

### Faiblesses (Écarts à combler)

| Aspect | Détail | Priorité |
|--------|--------|----------|
| **Emojis dans l'UI** | 🥐☕🍞 utilisés comme icônes (non professionnel pour un POS) | P0 |
| **Incohérence couleurs** | Hardcoded hex vs CSS vars vs Tailwind classes mixés | P1 |
| **Logo manquant** | Emoji 🥐 utilisé en lieu et place du vrai logo The Breakery | P1 |
| **Empty states** | Basiques ("No items found"), pas de design dédié | P2 |
| **Loading states** | Texte "Loading..." sans skeleton ni spinner unifié | P2 |
| **Couleurs catégories** | Pas de color-coding produits par catégorie (Lightspeed le fait) | P2 |
| **Plan de salle POS** | Floor plan en settings mais pas intégré au flux POS | P3 |
| **Paiement** | Modal standard, pas d'expérience plein écran type Square/Toast | P3 |

---

## 8. Recommandations Stratégiques

### Quick Wins (< 1 semaine)
1. Remplacer **tous les emojis** par des icônes Lucide cohérentes
2. Centraliser les couleurs hardcodées vers CSS custom properties
3. Ajouter un vrai logo SVG The Breakery (remplacer 🥐)
4. Unifier les skeleton loaders avec un composant `<Skeleton>` réutilisable

### Améliorations Majeures (2-4 semaines)
1. Color-coding des catégories produits sur les tuiles POS
2. Refonte de l'écran de paiement (full-screen, numpad large)
3. Composant empty state unifié avec illustrations
4. Refonte navigation catégories POS (option horizontal tabs)

### Vision Long Terme (1-2 mois)
1. Plan de salle interactif intégré au POS
2. Système de thèmes configurable (palette par établissement)
3. Mode "Quick Service" vs "Table Service" comme TouchBistro
4. Widget drag-and-drop pour dashboard

---

*Document généré dans le cadre de l'audit UI/UX complet d'AppGrav*
*Voir aussi : `01-audit-report.md` pour l'audit page par page*
