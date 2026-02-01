# Design System Foundation

### Design System Choice

**Choix : Tailwind CSS + shadcn/ui**

| Aspect | Décision |
|--------|----------|
| **Framework CSS** | Tailwind CSS (déjà en place) |
| **Bibliothèque de composants** | shadcn/ui |
| **Icônes** | Lucide React (déjà en place) |
| **Approche** | Composants copiés, pas installés — contrôle total |

### Rationale for Selection

**Pourquoi shadcn/ui pour AppGrav :**

1. **Accessibilité native** — Basé sur Radix UI, composants accessibles par défaut (ARIA, keyboard navigation)
2. **Contrôle total** — Code copié dans le projet, pas de dépendance npm à maintenir
3. **Cohérence Tailwind** — Stylé avec les mêmes classes Tailwind, pas de conflit de styles
4. **Composants utiles** — Toast, Dialog, Select, Tabs, Badge couvrent 80% des besoins AppGrav
5. **Personnalisation facile** — Fichier `components.json` + CSS variables pour le thème
6. **Communauté active** — Bien documenté, patterns éprouvés

### Implementation Approach

**Étapes d'intégration :**

```bash
# 1. Initialiser shadcn/ui
npx shadcn-ui@latest init

# 2. Ajouter les composants nécessaires
npx shadcn-ui@latest add toast dialog select tabs badge button card
```

**Structure des composants :**
```
src/components/
├── ui/           # Composants shadcn/ui (copiés)
│   ├── toast.tsx
│   ├── dialog.tsx
│   ├── select.tsx
│   ├── tabs.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   └── card.tsx
├── pos/          # Composants métier POS
├── inventory/    # Composants métier Inventaire
└── ...
```

### Customization Strategy

**Design Tokens AppGrav :**

```css
/* globals.css - Thème AppGrav */
:root {
  /* Couleurs principales */
  --primary: 222.2 47.4% 11.2%;      /* Bleu foncé professionnel */
  --primary-foreground: 210 40% 98%;

  /* États */
  --success: 142 76% 36%;            /* Vert stock OK */
  --warning: 38 92% 50%;             /* Orange attention */
  --destructive: 0 84% 60%;          /* Rouge erreur */

  /* Surfaces */
  --background: 0 0% 100%;
  --card: 0 0% 100%;
  --muted: 210 40% 96%;

  /* Rayons */
  --radius: 0.5rem;                  /* Coins arrondis modérés */
}
```

**Adaptations spécifiques AppGrav :**

| Composant | Personnalisation |
|-----------|------------------|
| **Toast** | Position: bottom-right, durée: 3s par défaut |
| **Button** | Taille minimum: 44x44px, padding augmenté |
| **Dialog** | Overlay semi-transparent, animation douce |
| **Badge** | 3 variantes: stock-ok, stock-low, stock-out |
| **Card** | Ombre légère, hover subtil pour produits |

### Component Priority List

**Phase 1 — Critiques (immédiat) :**
- `Toast` — Feedback utilisateur
- `Button` — Actions principales
- `Badge` — Statuts stock
- `Card` — Grille produits

**Phase 2 — Importants (court terme) :**
- `Dialog` — Confirmations, PIN manager
- `Select` — Variantes produits
- `Tabs` — Catégories, navigation

**Phase 3 — Utiles (moyen terme) :**
- `Sheet` — Panels latéraux mobile
- `Dropdown` — Menus contextuels
- `Tooltip` — Aide contextuelle

---
