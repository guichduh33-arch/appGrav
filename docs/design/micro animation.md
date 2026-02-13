🪄 Guide des Micro-Animations : The Breakery
1. Les Courbes de Bézier (Easing)
Pour éviter un look "logiciel standard", n'utilisez jamais les easings par défaut (ease-in-out). Utilisez des courbes personnalisées qui imitent un mouvement organique.

:root {
  /* "The Royal Glide" - Pour les ouvertures de menus et transitions de pages */
  --ease-luxe: cubic-bezier(0.22, 1, 0.36, 1);
  /* "The Subtle Pop" - Pour les hover et feedbacks boutons */
  --ease-out-quint: cubic-bezier(0.23, 1, 0.32, 1);
}
2. Transitions de Navigation (Sidebar)
L'indicateur de focus (la barre dorée à gauche) ne doit pas simplement apparaître, il doit "glisser" ou "s'étirer".

L'effet : Quand on change de page, la barre dorée se déplace verticalement vers le nouvel item.
Code (Framer Motion / CSS) :
layoutId="active-nav" pour un glissement fluide.
Durée : 0.4s.
Opacité de l'icône : de 0.5 à 1 avec un passage de la couleur Stone à Gold.
3. Feedback des Cartes Produits (Hover)
L'interaction ne doit pas être brutale. On cherche un effet de "mise en lumière".

Action : Survol d'une carte (Croissant, Éclair).
Micro-mouvements :
La bordure passe de transparent à #C9A55C (Aged Gold) via un transition: border-color 0.3s var(--ease-luxe).
L'image à l'intérieur de la carte fait un zoom très subtil (scale 1.05).
Une ombre portée très diffuse et légère (couleur or avec 5% d'opacité) apparaît derrière la carte.
4. Apparition des Données (Stagger Effect)
Lors du chargement d'un tableau ou d'une grille (ex: Liste des fournisseurs), ne faites pas tout apparaître d'un bloc.

Technique : "Staggered Fade-in".
Mouvement : Les lignes du tableau apparaissent une par une avec un léger décalage (delay) de 0.05s entre chaque ligne.
Direction : Un léger mouvement de bas en haut (translation de 10px vers 0px) pendant l'apparition.
5. Interaction de Checkout (Feedback de Validation)
Le bouton "Process Payment" doit donner un sentiment de sécurité et de prestige.

Clic : Lors de l'appui, le bouton se réduit légèrement (scale(0.98)).
Chargement : Au lieu d'un spinner standard, la bordure du bouton s'illumine avec un gradient doré qui circule sur le contour.
Succès : Le montant total s'efface en "fade-out" et un message "Merci, Chef" ou "Order Confirmed" apparaît avec un fondu lent.
6. Saisie de PIN (Staff Clock-In)
Action : Appui sur un chiffre.
Feedback : Le cercle vide se remplit de couleur Aged Gold avec une expansion radiale (ripple) très discrète.
Erreur : Si le PIN est faux, le champ de saisie fait une petite vibration latérale (shake) et la bordure devient Muted Orange temporairement.
Directives d'Implémentation (Prompt pour Claude Code)
"Implémente les transitions en utilisant Framer Motion (ou CSS Transitions). Utilise exclusivement la courbe cubic-bezier(0.22, 1, 0.36, 1) pour tous les mouvements de composants. Ajoute un délai d'apparition de 0.05s par élément dans les listes pour créer un effet de cascade luxueux. Assure-toi que les changements de couleur Gold sont progressifs (0.3s) et non instantanés."