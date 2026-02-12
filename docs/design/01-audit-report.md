# Rapport d'Audit UI/UX - AppGrav

> Audit complet page par page
> Date : 2026-02-13

---

## Échelle de Notation

| Score | Signification |
|-------|--------------|
| 9-10 | Excellent - Niveau leader de marché |
| 7-8 | Bon - Quelques améliorations mineures |
| 5-6 | Passable - Améliorations significatives nécessaires |
| 3-4 | Faible - Refonte recommandée |
| 1-2 | Critique - Refonte urgente |

---

## 1. Écran de Login (`/login`)

### Score Global : 7.5/10

| Critère | Score | Observations |
|---------|-------|-------------|
| Hiérarchie visuelle | 8 | Bon focus sur le PIN pad, card centrée |
| Lisibilité | 8 | Bon contraste gold sur dark, tailles correctes |
| Cohérence | 6 | Utilise un emoji 🥐 au lieu d'un vrai logo |
| Densité | 8 | Équilibré, pas surchargé |
| Navigation | 7 | Flow linéaire clair (user > PIN) |
| Feedback | 8 | Animation shake sur erreur, dots gold remplis |
| Accessibilité tactile | 8 | Numpad 68px hauteur, bonne taille |
| États | 7 | Rate limit affiché, mode offline indiqué |
| Iconographie | 4 | Emoji 🥐 comme logo = non professionnel |
| Performance | 8 | Backdrop blur fluide, transitions rapides |

### Problèmes Identifiés

| ID | Priorité | Description | Fichier |
|----|----------|-------------|---------|
| L1 | P0 | Emoji 🥐 utilisé comme logo au lieu du vrai logo SVG The Breakery | `LoginPage.tsx:~L45` |
| L2 | P1 | Card avec `border-radius: 2rem` (32px) excessif pour un écran professionnel | `LoginPage.tsx` style |
| L3 | P2 | Dropdown de sélection utilisateur pourrait être une grille d'avatars (switch rapide) | `LoginPage.tsx` |
| L4 | P3 | Pas d'animation d'entrée pour la card (apparition brutale) | `LoginPage.tsx` |

### Recommandations
- Remplacer l'emoji par le logo SVG The Breakery (centré, taille moyenne)
- Réduire le border-radius à 16px (xl) pour un look plus professionnel
- Considérer une grille d'avatars utilisateurs pour le multi-user switch (comme Toast)
- Ajouter une animation `slide-up` subtile à l'apparition de la card

---

## 2. POS - Point de Vente (`/pos`)

### Score Global : 6.5/10

C'est l'écran **le plus critique** (8h+/jour, 200+ interactions/jour).

| Critère | Score | Observations |
|---------|-------|-------------|
| Hiérarchie visuelle | 7 | Bon layout 3 zones, mais header/footer trop chargés |
| Lisibilité | 7 | Dark theme correct, mais certains textes trop petits |
| Cohérence | 5 | Mix de hardcoded hex (`#1a1a1f`, `#020617`) et CSS vars |
| Densité | 6 | Panier 460px trop large pour tablette 10", sidebar catégories étroite |
| Navigation | 6 | Catégories en sidebar OK mais pas d'option tabs horizontaux |
| Feedback | 7 | Toast notifications, mais pas de feedback haptique visuel sur ajout panier |
| Accessibilité tactile | 7 | Boutons corrects mais certains trop petits (search 180px) |
| États | 5 | Loading basique, empty state minimal |
| Iconographie | 4 | Emojis 🍽️🥡🚴🏢 pour types de commande au lieu de Lucide icons |
| Performance | 7 | Pas de layout shift notable, animations fluides |

### Problèmes Identifiés

| ID | Priorité | Description | Fichier |
|----|----------|-------------|---------|
| P1 | P0 | Emojis utilisés comme icônes de type commande (🍽️🥡🚴🏢) | `POSMainPage.tsx`, `Cart.tsx` |
| P2 | P0 | Couleurs hardcodées (`#020617`, `#1a1a1f`, `#2a2a30`) au lieu de CSS vars | `POSMainPage.css` |
| P3 | P1 | Panier 460px trop large : sur tablette 10" ne laisse que ~560px pour produits | `POSMainPage.css` |
| P4 | P1 | Pas de feedback visuel "ajout au panier" (animation card fly, flash, ou counter bump) | `ProductGrid.tsx` |
| P5 | P1 | Search bar 180px trop petite, ronde (`rounded-full`) incohérente avec le design | `POSMainPage.css` |
| P6 | P2 | Header info trop dense (logo + user + time + status + menu) | `POSMainPage.tsx` |
| P7 | P2 | Bouton PAY pas assez proéminent (devrait être le plus grand/visible) | `Cart.tsx` |
| P8 | P2 | Pas de color-coding des catégories produits sur les tuiles | `ProductGrid.tsx` |
| P9 | P3 | Shift banner en `position: fixed` en bas de sidebar peut masquer du contenu | `POSMainPage.css` |
| P10 | P3 | Pas d'indication visuelle de stock faible sur les cartes produit | `ProductGrid.tsx` |

### Recommandations
- **P0** : Remplacer tous les emojis par des icônes Lucide (`UtensilsCrossed`, `Package`, `Bike`, `Building2`)
- **P0** : Migrer les hex hardcodés vers `var(--color-*)` CSS custom properties
- **P1** : Réduire la largeur du panier à 360-380px, augmenter la grille produits
- **P1** : Ajouter une micro-animation d'ajout panier (scale bounce sur le counter)
- **P2** : Bouton PAY : full-width, 56px hauteur, gradient gold proéminent
- **P2** : Ajouter un dot de couleur par catégorie sur les tuiles produit

---

## 3. KDS - Kitchen Display System (`/kds`)

### Score Global : 7/10

| Critère | Score | Observations |
|---------|-------|-------------|
| Hiérarchie visuelle | 8 | Bon Kanban 4 colonnes, compteurs visibles |
| Lisibilité | 7 | Bon contraste, mais typographie pourrait être plus grande |
| Cohérence | 6 | Stations color-codées cohérentes, mais emoji dans le header |
| Densité | 7 | Bonne répartition Kanban |
| Navigation | 7 | Station selector clair, boutons d'action en header |
| Feedback | 8 | Animations pulse pour urgent/new, sons configurable |
| Accessibilité tactile | 6 | Boutons header 40x40px (sous le minimum 44px) |
| États | 7 | Urgent/new/preparing/ready bien gérés |
| Iconographie | 4 | "🥐 The Breakery KDS" avec emoji, emojis type commande |
| Performance | 7 | Animations pulse performantes, real-time OK |

### Problèmes Identifiés

| ID | Priorité | Description | Fichier |
|----|----------|-------------|---------|
| K1 | P0 | "🥐 The Breakery KDS" avec emoji dans le header | `KDSMainPage.tsx:~header` |
| K2 | P0 | Emojis 🍽️🥡🚴🏢 pour types commande sur les cartes | `KDSOrderCard.tsx` |
| K3 | P1 | Boutons header 40x40px (`w-10 h-10`) < minimum 44px | `KDSHeader.tsx:~L87` |
| K4 | P1 | Typographie items pourrait être plus grande (lisible à 2-3m) | `KDSOrderCard.tsx` |
| K5 | P2 | Pas de barre de progression temporelle par carte (juste timer texte) | `KDSOrderCard.tsx` |
| K6 | P2 | Colonnes Kanban fixes, pas responsive pour écrans plus petits | `KDSMainPage.tsx` |
| K7 | P3 | Timer en `toLocaleTimeString` pas en monospace dédié partout | KDS components |

### Recommandations
- **P0** : Remplacer emojis par icônes Lucide + logo SVG
- **P1** : Augmenter boutons header à 44x44px minimum (`w-11 h-11`)
- **P1** : Augmenter taille texte items à 18-20px (lisibilité distance)
- **P2** : Ajouter une progress bar horizontale colorée sous le timer de chaque carte
- **P2** : Timer en `font-mono` partout avec `tabular-nums`

---

## 4. Customer Display (`/display/customers`)

### Score Global : 6/10

| Critère | Score | Observations |
|---------|-------|-------------|
| Hiérarchie visuelle | 6 | Basique, total pas assez proéminent |
| Lisibilité | 7 | Texte large, bon contraste |
| Cohérence | 5 | Design séparé du reste de l'app |
| Densité | 6 | Pourrait mieux utiliser l'espace |
| Navigation | N/A | Affichage passif |
| Feedback | 6 | Transitions basiques entre états |
| Accessibilité | N/A | Affichage non-interactif |
| États | 6 | Idle/active/ready mais transitions abruptes |
| Iconographie | 5 | Minimaliste |
| Performance | 7 | Fonctionne en continu sans fuite mémoire notable |

### Problèmes Identifiés

| ID | Priorité | Description |
|----|----------|-------------|
| D1 | P1 | Pas de logo The Breakery en filigrane/watermark |
| D2 | P1 | Transitions entre états (idle/commande/prêt) trop abruptes |
| D3 | P2 | Mode promo/idle basique, pas de carousel avec images produits |
| D4 | P2 | Total de la commande pas assez grand (devrait dominer l'écran) |
| D5 | P3 | Pas de thème cohérent avec l'identité The Breakery |

### Recommandations
- Logo SVG The Breakery en filigrane bas de l'écran (opacity 10-15%)
- Transitions CSS `fade-in/slide-up` de 500ms entre les états
- Mode veille avec carousel d'images produits + ambiance boulangerie
- Total en gros format (48-64px) centré, gold sur fond sombre

---

## 5. Dashboard / Reports (`/reports`)

### Score Global : 6.5/10

| Critère | Score | Observations |
|---------|-------|-------------|
| Hiérarchie visuelle | 7 | KPIs en cartes, graphiques Recharts |
| Lisibilité | 7 | Chiffres lisibles, labels corrects |
| Cohérence | 6 | Palette graphiques (vert/bleu/violet/ambre/cyan) non unifiée |
| Densité | 6 | Certains rapports trop denses, d'autres trop vides |
| Navigation | 7 | Sidebar rapports + tabs dans chaque rapport |
| Feedback | 5 | Pas de skeletons pendant chargement des données |
| Accessibilité tactile | 7 | Boutons et filtres corrects |
| États | 5 | Loading = "Loading...", pas de skeleton layout |
| Iconographie | 7 | Icônes Lucide correctes pour les filtres |
| Performance | 6 | Lazy loading OK mais pas de skeleton |

### Problèmes Identifiés

| ID | Priorité | Description |
|----|----------|-------------|
| R1 | P1 | Loading state = texte "Loading..." au lieu de skeleton screen |
| R2 | P1 | Palette graphiques incohérente avec le design system |
| R3 | P2 | KPIs sans indicateur de tendance (flèche haut/bas vs hier) |
| R4 | P2 | Pas de comparaison temporelle visuelle (sparklines) |
| R5 | P3 | Widgets non réorganisables |

### Recommandations
- Skeleton loaders animés (`animate-pulse`) pour chaque widget
- Palette graphiques alignée sur le design system (gold, stone, smoke + accent)
- Trend indicators (flèche + %) sur chaque KPI card
- Sparklines inline pour tendances rapides

---

## 6. Back-Office - Sidebar & Navigation

### Score Global : 7/10

| Critère | Score | Observations |
|---------|-------|-------------|
| Hiérarchie visuelle | 7 | Groupement logique OK, 3 sections |
| Lisibilité | 7 | Icônes + texte, bon contraste |
| Cohérence | 7 | Style consistant avec accent gold |
| Densité | 7 | Bonne utilisation de l'espace |
| Navigation | 7 | Collapse/expand fluide, active state clair |
| Feedback | 6 | Hover state mais pas de transition sur active |
| Accessibilité tactile | 7 | Items assez grands |
| États | 6 | Pas de badges/compteurs sur les items (commandes en attente) |
| Iconographie | 8 | Lucide icons cohérentes |
| Performance | 8 | Animation sidebar fluide |

### Problèmes Identifiés

| ID | Priorité | Description |
|----|----------|-------------|
| N1 | P1 | Pas de badges/compteurs dynamiques (commandes en attente, alertes stock) |
| N2 | P2 | Pas de breadcrumbs dans le contenu principal |
| N3 | P2 | Active state utilise `--color-rose-poudre` (rose) incohérent avec gold |
| N4 | P3 | Pas de sous-menus expandables pour les modules avec sous-pages |

### Recommandations
- Ajouter des badges numériques (commandes en attente, stock critique)
- Breadcrumbs dans le header de chaque page
- Changer active state vers gold (`--color-gold`) pour cohérence
- Sous-menus pour Inventory, Products, Settings (avec chevron)

---

## 7. Inventory (`/inventory`)

### Score Global : 6.5/10

| Critère | Score | Observations |
|---------|-------|-------------|
| Hiérarchie visuelle | 7 | Alertes en haut, KPIs, puis table |
| Lisibilité | 7 | Table lisible, SKU monospace |
| Cohérence | 6 | Mix de styles table custom vs standard |
| Densité | 7 | Correct, filtres en tabs |
| Navigation | 6 | Tabs (All/Raw/Finished/Low) basiques |
| Feedback | 6 | Debounced search mais pas de feedback visuel |
| Accessibilité tactile | 7 | Boutons actions corrects |
| États | 6 | Offline banner OK mais stale warning basique |
| Iconographie | 7 | Icônes Lucide correctes |
| Performance | 7 | Debounce search 300ms |

### Problèmes
| ID | Priorité | Description |
|----|----------|-------------|
| I1 | P1 | Lignes stock faible en gradient rouge - pourrait être plus subtil (badge) |
| I2 | P2 | Pas de vue "cartes" alternative à la table |
| I3 | P2 | Ajustement stock = modal, pourrait être inline |

---

## 8. Orders (`/orders`)

### Score Global : 7/10

| Critère | Score | Observations |
|---------|-------|-------------|
| Hiérarchie visuelle | 7 | Filtres clairs, table bien structurée |
| Lisibilité | 7 | Statuts en badges colorés |
| Cohérence | 7 | Suit le pattern table standard |
| Densité | 7 | Bon ratio filtres/données |
| Navigation | 7 | Multi-filtres + date range |
| Feedback | 7 | Real-time via Supabase subscription |
| Accessibilité tactile | 7 | OK |
| États | 6 | Animation tracking basique |
| Iconographie | 7 | OK |
| Performance | 7 | Pagination correcte |

### Problèmes
| ID | Priorité | Description |
|----|----------|-------------|
| O1 | P2 | Pas de vue timeline/kanban alternative |
| O2 | P2 | Export CSV mais pas de bouton visible |
| O3 | P3 | Detail modal pourrait être un slide-over panel |

---

## 9. Users (`/users`)

### Score Global : 7/10

Bon pattern standard avec stat cards + filtres + table.

### Problèmes Mineurs
| ID | Priorité | Description |
|----|----------|-------------|
| U1 | P3 | Avatar utilisateur = initiales uniquement, pas de photo |
| U2 | P3 | Pas d'indicateur "en ligne" pour les utilisateurs actifs |

---

## 10. Settings (`/settings`)

### Score Global : 6.5/10

| Critère | Score | Observations |
|---------|-------|-------------|
| Hiérarchie visuelle | 7 | Navigation gauche + contenu |
| Lisibilité | 7 | OK |
| Cohérence | 5 | Active state en `--color-rose-poudre` (rose) ≠ gold du reste |
| Densité | 6 | Certaines pages trop longues sans sections |
| Navigation | 7 | Sidebar settings avec icônes |
| Feedback | 6 | Save feedback basique |
| États | 5 | Pas de confirmation visuelle après save |
| Iconographie | 7 | Lucide icons correctes |

### Problèmes
| ID | Priorité | Description |
|----|----------|-------------|
| S1 | P1 | Active state rose incohérent (`--color-rose-poudre`) |
| S2 | P2 | Pas de confirmation visuelle type "Saved !" avec checkmark |
| S3 | P2 | Pages longues sans sections collapsibles |

---

## 11. Accounting (`/accounting`)

### Score Global : 6/10

| Critère | Score | Observations |
|---------|-------|-------------|
| Hiérarchie visuelle | 6 | Tables de données denses |
| Lisibilité | 7 | Chiffres en tabular-nums, bon |
| Cohérence | 6 | Suit les patterns mais dense |
| Densité | 5 | Beaucoup d'info par écran, pas de résumé visuel |
| Navigation | 6 | Tabs entre sous-modules |
| Feedback | 5 | Journal entries validation basique |
| États | 5 | Loading basique |
| Iconographie | 7 | OK |

### Problèmes
| ID | Priorité | Description |
|----|----------|-------------|
| A1 | P2 | Pas de KPIs visuels en haut (solde, P&L résumé) |
| A2 | P2 | Table chart of accounts plate, pas de tree-view |
| A3 | P3 | Balance sheet et income statement = tables, pourrait avoir des graphiques |

---

## Synthèse des Scores

| Module | Score | Priorité Refonte |
|--------|-------|-----------------|
| Login | 7.5 | Basse |
| **POS** | **6.5** | **Haute** |
| **KDS** | **7** | **Moyenne** |
| **Customer Display** | **6** | **Moyenne** |
| Dashboard/Reports | 6.5 | Moyenne |
| Sidebar/Navigation | 7 | Moyenne |
| Inventory | 6.5 | Basse |
| Orders | 7 | Basse |
| Users | 7 | Basse |
| Settings | 6.5 | Basse |
| Accounting | 6 | Basse |

### Top 10 Problèmes Critiques (P0-P1)

| # | ID | Module | Description | Priorité |
|---|-----|--------|-------------|----------|
| 1 | P1 | POS | Emojis comme icônes type commande | P0 |
| 2 | P2 | POS | Couleurs hardcodées au lieu de CSS vars | P0 |
| 3 | K1 | KDS | Emoji 🥐 dans le header KDS | P0 |
| 4 | K2 | KDS | Emojis type commande sur cartes KDS | P0 |
| 5 | L1 | Login | Emoji comme logo | P0 |
| 6 | P3 | POS | Panier trop large (460px) pour tablettes | P1 |
| 7 | P4 | POS | Pas de feedback visuel ajout panier | P1 |
| 8 | K3 | KDS | Boutons header < 44px minimum | P1 |
| 9 | N1 | Nav | Pas de badges dynamiques sidebar | P1 |
| 10 | R1 | Reports | Loading texte au lieu de skeleton | P1 |

---

*Document généré dans le cadre de l'audit UI/UX complet d'AppGrav*
