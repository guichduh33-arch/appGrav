Cette documentation technique est conçue pour être fournie directement à un agent comme Claude Code ou un développeur travaillant sur le framework Antigravity. Elle contient les spécifications exactes pour implémenter l'interface "The Breakery".

📜 Spécifications Techniques : Système POS & Back-Office "The Breakery"
1. Identité Visuelle (Design Tokens)
Palette de Couleurs (HEX & Tailwind)
{
  "colors": {
    "bg-onyx": "#0D0D0F",       // Background principal
    "bg-card": "#161618",       // Surfaces secondaires / Cartes
    "gold-aged": "#C9A55C",     // Actions primaires, highlights, bordures luxe
    "text-stone": "#E5E7EB",    // Texte principal / Titres
    "text-smoke": "#9CA3AF",    // Texte secondaire / Métadonnées
    "status-green": "#4A5D4E",  // Succès / Shipped / In-Stock
    "status-orange": "#A6634B", // Alerte / Delayed / Low-Stock
    "border-subtle": "rgba(255, 255, 255, 0.08)"
  }
}
Typographie
Sans-Serif (Interface & Data) : Inter, variable font. Utiliser font-feature-settings: "tnum" on, "lnum" on; pour les tableaux financiers.
Serif (Branding & Titres de section) : Playfair Display ou Cormorant Garamond (poids Light ou Regular).
Logo : Script élégant (ex: Dancing Script ou SVG custom) en couleur #C9A55C.
2. Layouts de Référence
Architecture 3-Colonnes (POS)
Sidebar (80px) : Icônes Lucide (stroke 1.5px), centrées. État actif : Gold.
Grid Central (Flexible) : Cartes de produits. Aspect ratio 1:1. Bordure Gold au hover (transition 0.3s).
Ticket/Cart (380px) : Bordure gauche 1px solid border-subtle. Fond légèrement plus clair que le BG principal.
Architecture 2-Colonnes (Back-Office)
Sidebar Navigation (260px) : Fond bg-onyx. Logo en haut. Menu vertical avec indicateur de focus (barre verticale Gold de 3px à gauche).
Main Content Area : Padding p-8 ou p-12. Utilisation intensive de la "Bento Grid" pour les analytics.
3. Bibliothèque de Composants (UI Kit)
Bouton Primaire (Luxe)
Style : Fond #C9A55C, Texte #0D0D0F, Font-weight: 600.
Hover : Opacité 0.9 + légère ombre dorée diffuse.
Border-radius : 4px (presque angulaire pour le côté pro).
Cartes Analytics (Metric Cards)
Structure : Label (Smoke), Value (Stone, large), Trend (Green/Orange small).
Bordure : 1px solid border-subtle. Pas d'ombre portée, ou alors très large et floue.
Tableaux de Données (Stock/Inventory)
Header : text-transform: uppercase, letter-spacing: 0.05em, font-size xs.
Row Hover : bg-white/5.
Status Badges : Fond à 10% d'opacité de la couleur de statut, bordure 1px, texte de la couleur pleine.
4. Directives d'Implémentation pour Claude Code
Instruction Prompt : "Génère les composants React/Tailwind pour le projet Antigravity en suivant le thème 'The Breakery'. Utilise un background #0D0D0F et des accents #C9A55C. Les espacements doivent être larges pour un look premium. Priorise la lisibilité des données avec la font Inter. Pour les graphiques, utilise des lignes minimalistes dorées."

États Interactifs
Focus Input : Bordure passe de border-subtle à #C9A55C. Pas d'outline navigateur.
Loading : Spinner minimaliste type "Circle Notch" en Gold.
Empty States : Illustrations filaires (line-art) en Gold/Smoke très atténuées.
5. Checklist de Recette (Fidélité Totale)
 Le noir n'est pas pur (utiliser #0D0D0F), sauf pour les ombres profondes.
 Les icônes sont toutes de la même épaisseur (1.5px).
 Les chiffres dans les tableaux sont alignés (Tabular Numbers).
 Aucun emoji n'est présent dans l'interface.
 L'équilibre entre la police Serif (titres) et Sans-Serif (données) est respecté.