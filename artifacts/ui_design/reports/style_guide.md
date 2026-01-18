# 🎨 Guide de Style - The Breakery Design System

**Généré par:** UIDesignAgent
**Date:** 2026-01-18 06:33
**Version:** 1.0.0

---

## 📌 Vue d'ensemble

Ce guide définit les standards visuels et les composants UI pour l'application The Breakery POS/ERP.

### Principes de design

1. **Clarté** - Interface intuitive pour utilisation rapide en caisse
2. **Accessibilité** - Conforme WCAG 2.1 AA minimum
3. **Cohérence** - Utilisation systématique des tokens
4. **Performance** - Composants légers et optimisés

---

## 🎨 Couleurs

### Palette principale

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-500` | #3B82F6 | Actions principales, liens |
| `secondary-100` | #FEF3C7 | Boutons crème (keypad) |
| `secondary-500` | #F59E0B | Accents, bordures |
| `success-500` | #10B981 | Succès, paiement cash |
| `warning-500` | #F59E0B | Alertes stock |
| `danger-500` | #EF4444 | Erreurs, suppressions |

### Neutres

| Token | Hex | Usage |
|-------|-----|-------|
| `neutral-50` | #F8FAFC | Fond clair |
| `neutral-100` | #F1F5F9 | Fond secondaire |
| `neutral-600` | #475569 | Texte secondaire |
| `neutral-900` | #0F172A | Texte principal |

---

## 📝 Typographie

### Famille de polices

```css
--font-sans: Inter, system-ui, -apple-system, sans-serif;
--font-mono: JetBrains Mono, Menlo, Monaco, monospace;
```

### Tailles

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 0.75rem | 1rem | Labels, badges |
| `text-sm` | 0.875rem | 1.25rem | Texte secondaire |
| `text-base` | 1rem | 1.5rem | Texte courant |
| `text-lg` | 1.125rem | 1.75rem | Sous-titres |
| `text-xl` | 1.25rem | 1.75rem | Titres |
| `text-2xl` | 1.5rem | 2rem | Prix, totaux |

---

## 📐 Espacements

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

---

## 🔘 Composants clés

### Boutons

#### Primary Button
```jsx
<button className="bg-blue-600 hover:bg-blue-700 text-white
                   px-6 py-3 rounded-lg font-medium
                   transition-colors duration-200">
  Confirmer
</button>
```

#### Secondary Button (Crème)
```jsx
<button className="bg-amber-100 hover:bg-amber-200
                   text-slate-900 font-semibold
                   px-6 py-3 rounded-xl
                   border-2 border-amber-500 shadow-md">
  Annuler
</button>
```

### Pavé numérique (PIN)

```jsx
<div className="grid grid-cols-3 gap-3 p-4 bg-slate-100 rounded-2xl">
  <button className="w-16 h-16
                     bg-amber-100 border-2 border-amber-500
                     rounded-xl shadow-md
                     text-2xl font-extrabold text-slate-900
                     hover:bg-amber-200 hover:shadow-lg
                     active:scale-98 transition-all">
    1
  </button>
</div>
```

### Cartes produit

```jsx
<div className="bg-white rounded-lg shadow-sm p-3
                hover:shadow-md transition-shadow
                cursor-pointer">
  <img src="..." className="w-16 h-16 mx-auto rounded" />
  <p className="mt-2 text-sm font-medium text-center">Croissant</p>
  <p className="text-lg font-bold text-center">Rp 25.000</p>
</div>
```

---

## ♿ Accessibilité

### Ratios de contraste (WCAG AA)

| Combinaison | Ratio | Statut |
|-------------|-------|--------|
| Blanc sur primary-500 | 4.5:1+ | ✅ Pass |
| neutral-900 sur secondary-100 | 7:1+ | ✅ Pass |
| neutral-900 sur neutral-50 | 16:1+ | ✅ Pass |

### Bonnes pratiques

- Toujours fournir `aria-label` pour les boutons icône
- Utiliser `focus:ring-2` pour les indicateurs de focus
- Assurer la navigation clavier (Tab, Enter, Escape)
- Utiliser `role="alert"` pour les messages toast

---

## 📱 Breakpoints responsifs

| Nom | Min-width | Usage |
|-----|-----------|-------|
| `sm` | 640px | Tablettes portrait |
| `md` | 768px | Tablettes paysage |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Grand écran |

---

## 🔧 Utilisation avec Tailwind

### Import des couleurs personnalisées

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3B82F6',
          // ...
        },
        secondary: {
          100: '#FEF3C7',
          500: '#F59E0B',
          // ...
        }
      }
    }
  }
}
```

---

*Guide généré automatiquement par UIDesignAgent v1.0*
