# Responsive & Accessibility

### Breakpoints

| Breakpoint | Largeur | Cible |
|------------|---------|-------|
| **Mobile** | < 640px | App serveur, téléphones |
| **Tablet** | 640-1024px | Tablette serveur, petit écran |
| **Desktop** | > 1024px | POS principal, back-office |

### Adaptations par Taille

| Élément | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Grille produits** | 2 colonnes | 3 colonnes | 4 colonnes |
| **Panier** | Bottom sheet | Sidebar réduite | Sidebar fixe 40% |
| **Navigation** | Bottom bar | Bottom bar | Sidebar + header |
| **Taille boutons** | 48px | 44px | 44px |
| **Taille texte prix** | 20px | 22px | 24px |

### Accessibilité

**Principes appliqués :**

1. **Contraste**
   - Ratio minimum 4.5:1 pour texte normal
   - Ratio minimum 3:1 pour texte large
   - Jamais de texte gris clair sur fond blanc

2. **Focus Visible**
   - Outline visible sur tous les éléments focusables
   - Navigation clavier complète
   - Skip links pour navigation rapide

3. **Labels**
   - Tous les inputs ont des labels explicites
   - Icônes accompagnées de texte ou aria-label
   - Messages d'erreur associés aux champs

4. **Motion**
   - Animations réduites si `prefers-reduced-motion`
   - Pas d'animation essentielle à la compréhension

---
