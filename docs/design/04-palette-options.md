# Options de Palette de Couleurs

> Audit UI/UX AppGrav - Phase 3 : Propositions
> Date : 2026-02-13

---

## Option A -- Artisan Chaleureux (Évolution de l'existant)

### Philosophie
Évolution naturelle de la palette actuelle. Conserve l'identité gold/champagne de The Breakery en affinant les contrastes et en ajoutant de la profondeur. Renforce l'ambiance "boulangerie artisanale française".

### Palette Complète

#### Couleurs de Marque
| Rôle | Nom | HEX | Tailwind | Usage |
|------|-----|-----|----------|-------|
| Primary | Champagne Gold | `#C9A55C` | `primary` | CTA, accents, liens actifs |
| Primary Light | Wheat | `#E8D5A3` | `primary-light` | Hover states, badges |
| Primary Dark | Aged Gold | `#8B7334` | `primary-dark` | Active/pressed states |
| Primary Deep | Espresso Gold | `#5C4B1F` | `primary-deep` | Text sur fond clair |
| Secondary | Warm Stone | `#8C8272` | `secondary` | Texte secondaire, labels |
| Accent | Terracotta | `#C47D5A` | `accent` | Accent complémentaire |

#### Fonds & Surfaces
| Rôle | Light Mode | Dark Mode (POS) | Tailwind |
|------|-----------|----------------|----------|
| App Background | `#FAF7F2` (crème chaud) | `#121210` | `bg-app` |
| Surface / Card | `#FFFFFF` | `#1C1B18` | `bg-surface` |
| Surface Elevated | `#F5F1EA` | `#252420` | `bg-elevated` |
| Surface Hover | `#EDE8DF` | `#2E2C27` | `bg-hover` |
| Border | `#E2DCD2` | `#3A3730` | `border-default` |
| Border Subtle | `#EDE8DF` | `#2E2C27` | `border-subtle` |

#### Texte
| Rôle | Light Mode | Dark Mode | Tailwind |
|------|-----------|-----------|----------|
| Primary | `#1A1814` | `#F5F2ED` | `text-primary` |
| Secondary | `#6B6358` | `#A39B8E` | `text-secondary` |
| Muted | `#9C9488` | `#6B6358` | `text-muted` |
| Disabled | `#C4BDB2` | `#4A4640` | `text-disabled` |

#### Couleurs Fonctionnelles
| Rôle | Default | Light (bg) | Dark (text) | Tailwind |
|------|---------|-----------|------------|----------|
| Success | `#2D9F48` | `#E8F5E9` | `#1B7A30` | `success` |
| Warning | `#E5A100` | `#FFF8E1` | `#B37F00` | `warning` |
| Error | `#D32F2F` | `#FFEBEE` | `#B71C1C` | `danger` |
| Info | `#1976D2` | `#E3F2FD` | `#0D47A1` | `info` |

#### POS Spécifique
| Rôle | Couleur | Usage |
|------|---------|-------|
| Pay Button | `#C9A55C` gradient vers `#8B7334` | CTA paiement |
| Cart Active | `#2D9F48` | Validation, send to kitchen |
| Cart Remove | `#D32F2F` | Suppression item |
| Cart Modify | `#E5A100` | Modification quantité |
| Category Accent | `#C9A55C` | Catégorie sélectionnée |

#### KDS Spécifique
| Timer | Couleur | Animation |
|-------|---------|-----------|
| < 5 min | `#2D9F48` | Aucune |
| 5-10 min | `#E5A100` | Aucune |
| 10-15 min | `#E67C00` | Aucune |
| > 15 min | `#D32F2F` | Pulse 1s |
| > 20 min | `#B71C1C` | Pulse rapide 0.5s |

### Avantages
- Continuité avec le design actuel (migration douce)
- Identité forte "boulangerie française"
- Chaleur et élégance distinctives
- Palette gold unique sur le marché POS

### Inconvénients
- Le doré peut manquer de "punch" pour les CTA critiques (Pay button)
- Moins de contraste naturel que le bleu ou le vert sur fond sombre
- Risque de "trop chaud" sur de longues sessions

---

## Option B -- Professionnel Neutre

### Philosophie
Style SaaS moderne inspiré de Square, Stripe, Linear. Base neutre gris/blanc avec un accent bleu professionnel. Maximum de lisibilité et de neutralité. L'identité The Breakery passe par le logo et la typographie plutôt que la couleur.

### Palette Complète

#### Couleurs de Marque
| Rôle | Nom | HEX | Tailwind | Usage |
|------|-----|-----|----------|-------|
| Primary | Deep Blue | `#2563EB` | `primary` | CTA, liens, accents |
| Primary Light | Sky | `#93C5FD` | `primary-light` | Hover states |
| Primary Dark | Navy | `#1D4ED8` | `primary-dark` | Active/pressed |
| Primary Deep | Midnight | `#1E3A5F` | `primary-deep` | Text emphasis |
| Secondary | Cool Gray | `#6B7280` | `secondary` | Texte secondaire |
| Accent | Bakery Gold | `#C9A55C` | `accent` | Logo, branding subtil |

#### Fonds & Surfaces
| Rôle | Light Mode | Dark Mode (POS) | Tailwind |
|------|-----------|----------------|----------|
| App Background | `#F8FAFC` (slate-50) | `#0F1117` | `bg-app` |
| Surface / Card | `#FFFFFF` | `#1A1D26` | `bg-surface` |
| Surface Elevated | `#F1F5F9` | `#242830` | `bg-elevated` |
| Surface Hover | `#E2E8F0` | `#2D3240` | `bg-hover` |
| Border | `#E2E8F0` | `#334155` | `border-default` |
| Border Subtle | `#F1F5F9` | `#1E293B` | `border-subtle` |

#### Texte
| Rôle | Light Mode | Dark Mode | Tailwind |
|------|-----------|-----------|----------|
| Primary | `#0F172A` | `#F8FAFC` | `text-primary` |
| Secondary | `#475569` | `#94A3B8` | `text-secondary` |
| Muted | `#94A3B8` | `#64748B` | `text-muted` |
| Disabled | `#CBD5E1` | `#475569` | `text-disabled` |

#### Couleurs Fonctionnelles
| Rôle | Default | Light (bg) | Dark (text) | Tailwind |
|------|---------|-----------|------------|----------|
| Success | `#16A34A` | `#F0FDF4` | `#15803D` | `success` |
| Warning | `#EAB308` | `#FEFCE8` | `#CA8A04` | `warning` |
| Error | `#DC2626` | `#FEF2F2` | `#B91C1C` | `danger` |
| Info | `#2563EB` | `#EFF6FF` | `#1D4ED8` | `info` |

#### POS Spécifique
| Rôle | Couleur | Usage |
|------|---------|-------|
| Pay Button | `#16A34A` (vert vif) | CTA paiement (convention universelle) |
| Cart Active | `#2563EB` | Actions, send to kitchen |
| Cart Remove | `#DC2626` | Suppression |
| Cart Modify | `#EAB308` | Modification |
| Category Accent | `#2563EB` | Catégorie sélectionnée |

### Avantages
- Maximum de lisibilité et contraste
- Familier pour les utilisateurs (style SaaS standard)
- Bleu = confiance, stabilité, professionnalisme
- Fonctionne parfaitement en dark et light mode
- Bouton Pay vert = convention universelle "valider"

### Inconvénients
- Perd l'identité boulangerie/artisanale
- Générique, ressemble à Square/Stripe/Linear
- Pas de différenciation visuelle avec la concurrence
- L'accent gold relegué en décoration secondaire

---

## Option C -- Hybride Moderne (RECOMMANDÉE)

### Philosophie
Le meilleur des deux mondes. Base neutre (gris chaud) pour la lisibilité maximale, touches de gold/champagne The Breakery pour l'identité. POS en dark mode avec accents gold. Back-office en light mode neutre avec touches chaudes. Le gold est réservé aux éléments d'identité et CTA principaux.

### Palette Complète

#### Couleurs de Marque
| Rôle | Nom | HEX | Tailwind | Usage |
|------|-----|-----|----------|-------|
| Primary | Champagne | `#C9A55C` | `primary` | CTA principal, accents identitaires |
| Primary Light | Wheat Silk | `#E2D0A0` | `primary-light` | Hover, badges, highlights |
| Primary Dark | Burnished Gold | `#9A7B3A` | `primary-dark` | Active/pressed, text on light |
| Primary Deep | Bronze | `#6B5425` | `primary-deep` | Text emphasis |
| Secondary | Warm Slate | `#64748B` | `secondary` | Labels, texte secondaire |
| Accent | French Blue | `#3B82F6` | `accent` | Liens, info, actions secondaires |

#### Fonds & Surfaces
| Rôle | Light Mode | Dark Mode (POS/KDS) | Tailwind |
|------|-----------|---------------------|----------|
| App Background | `#FAFAF8` (warm white) | `#111113` (warm black) | `bg-app` |
| Surface / Card | `#FFFFFF` | `#1A1A1E` | `bg-surface` |
| Surface Elevated | `#F5F4F1` | `#232328` | `bg-elevated` |
| Surface Hover | `#ECEAE5` | `#2C2C32` | `bg-hover` |
| Border | `#E5E2DC` | `#353538` | `border-default` |
| Border Subtle | `#F0EDE8` | `#28282C` | `border-subtle` |
| Sidebar BG | `#F5F4F1` | N/A | `bg-sidebar` |
| Sidebar Active | `#C9A55C15` (gold 8%) | N/A | `bg-sidebar-active` |

#### Texte
| Rôle | Light Mode | Dark Mode | Tailwind |
|------|-----------|-----------|----------|
| Primary | `#1C1917` (warm near-black) | `#F5F4F1` | `text-primary` |
| Secondary | `#57534E` (stone-600) | `#A8A29E` | `text-secondary` |
| Muted | `#A8A29E` (stone-400) | `#78716C` | `text-muted` |
| Disabled | `#D6D3D1` (stone-300) | `#44403C` | `text-disabled` |
| Brand | `#9A7B3A` (gold dark) | `#C9A55C` | `text-brand` |

#### Couleurs Fonctionnelles
| Rôle | Default | Light BG | Dark BG | Tailwind |
|------|---------|----------|---------|----------|
| Success | `#22C55E` | `#F0FDF4` | `#052E16` | `success` |
| Warning | `#F59E0B` | `#FFFBEB` | `#451A03` | `warning` |
| Error | `#EF4444` | `#FEF2F2` | `#450A0A` | `danger` |
| Info | `#3B82F6` | `#EFF6FF` | `#172554` | `info` |

#### POS Spécifique (Dark Mode)
| Rôle | Couleur | Tailwind | Usage |
|------|---------|----------|-------|
| Pay Button BG | `#C9A55C` | `bg-primary` | Gradient gold, CTA dominant |
| Pay Button Text | `#1C1917` | `text-primary-contrast` | Texte sombre sur gold |
| Send Kitchen | `#22C55E` | `bg-success` | Envoi en cuisine |
| Hold Order | `#3B82F6` | `bg-accent` | Mettre en attente |
| Clear Cart | `#EF4444` | `bg-danger` | Vider panier |
| Discount | `#F59E0B` | `bg-warning` | Appliquer remise |
| Category Selected | `#C9A55C20` | `bg-primary/12` | Fond catégorie active |
| Category Border | `#C9A55C` | `border-primary` | Gauche, 3px |
| Product Card | `#1A1A1E` | `bg-surface` | Carte produit |
| Product Card Hover | `#232328` | `bg-elevated` | Hover produit |

#### KDS Spécifique (Dark Mode)
| Élément | Couleur | Usage |
|---------|---------|-------|
| Station Hot Kitchen | `#EF4444` | Badge + bordure |
| Station Barista | `#8B5CF6` | Badge + bordure |
| Station Display | `#22C55E` | Badge + bordure |
| Station Waiter | `#3B82F6` | Badge + bordure |
| Timer < 5min | `#22C55E` | Texte + progress bar |
| Timer 5-10min | `#F59E0B` | Texte + progress bar |
| Timer 10-15min | `#F97316` (orange) | Texte + progress bar |
| Timer > 15min | `#EF4444` | Texte + progress bar + pulse |
| Card New | `#3B82F6` bordure gauche | Nouvelle commande |
| Card Preparing | `#F59E0B` bordure gauche | En préparation |
| Card Ready | `#22C55E` bordure gauche | Prête |
| Card Urgent | `#EF4444` bordure gauche | Urgente + pulse |

#### Customer Display
| Élément | Couleur | Usage |
|---------|---------|-------|
| Background | `#111113` | Fond sombre élégant |
| Total Price | `#C9A55C` | Grand format, gold |
| Item Text | `#F5F4F1` | Nom produit, blanc chaud |
| Price Text | `#A8A29E` | Prix unitaire, gris |
| Status Ready | `#22C55E` | "Your order is ready" |
| Logo Watermark | `#C9A55C` @ 10% | Filigrane bas d'écran |

#### Graphiques & Dashboard
| Série | Couleur | Usage |
|-------|---------|-------|
| Série 1 (Revenue) | `#C9A55C` | Primaire, gold |
| Série 2 (Orders) | `#3B82F6` | Secondaire, bleu |
| Série 3 (Expenses) | `#EF4444` | Dépenses, rouge |
| Série 4 (Growth) | `#22C55E` | Croissance, vert |
| Série 5 (Other) | `#8B5CF6` | Complémentaire, violet |
| Série 6 (Neutral) | `#78716C` | Neutre, stone |

### Avantages
- **Identité préservée** : le gold reste la couleur signature
- **Lisibilité maximale** : base neutre warm-gray, pas de teinte excessive
- **Professionnalisme** : bleu French Blue en accent secondaire
- **POS optimisé** : dark mode avec gold = premium, distinctif
- **Back-office neutre** : light mode confortable pour longues sessions admin
- **Convention respectée** : vert = validation, rouge = danger, bleu = info
- **Différenciation** : aucun concurrent n'a cette combinaison

### Inconvénients
- Légèrement plus complexe à implémenter (2 modes distincts)
- Le gold comme CTA primaire nécessite un bon contraste text (dark text sur gold)

---

## Comparaison Visuelle des 3 Options

### Bouton PAY
| Option | Fond | Texte | Effet |
|--------|------|-------|-------|
| A - Artisan | Gold gradient `#C9A55C` -> `#8B7334` | Dark `#1A1814` | Ombre gold |
| B - Neutre | Green solid `#16A34A` | White `#FFFFFF` | Ombre grise |
| C - Hybride | Gold solid `#C9A55C` | Dark `#1C1917` | Ombre gold subtile |

### Sidebar Active Item
| Option | Fond | Texte | Accent |
|--------|------|-------|--------|
| A - Artisan | `#C9A55C20` | `#C9A55C` | Barre gauche gold |
| B - Neutre | `#2563EB10` | `#2563EB` | Barre gauche bleue |
| C - Hybride | `#C9A55C15` | `#9A7B3A` | Barre gauche gold |

### KDS Card New Order
| Option | Bordure | Animation | Fond |
|--------|---------|-----------|------|
| A - Artisan | Gold `#C9A55C` | Pulse gold glow | `#1C1B18` |
| B - Neutre | Blue `#2563EB` | Pulse blue glow | `#1A1D26` |
| C - Hybride | Blue `#3B82F6` | Pulse blue glow | `#1A1A1E` |

---

## Recommandation

**L'Option C (Hybride Moderne) est recommandée** car elle :

1. Préserve l'identité unique de The Breakery (gold distinctif)
2. Offre la meilleure lisibilité grâce à une base neutre warm-gray
3. Suit les conventions POS pour les couleurs fonctionnelles
4. Se distingue de tous les concurrents analysés
5. Supporte nativement le dual-theme (POS dark / back-office light)
6. Utilise le bleu comme accent secondaire (confiance, actions neutres)

---

*Document généré dans le cadre de l'audit UI/UX complet d'AppGrav*
