# Core User Experience

### Defining Experience

**L'Action Critique : La Prise de Commande**

Le cœur battant d'AppGrav est la prise de commande au POS. Si cette action échoue, bloque ou frustre, tout le reste perd son sens. Cette interaction doit être :
- **Infaillible** : Fonctionne toujours, online ou offline
- **Rapide** : Produit ajouté en 1 tap, variante en 2 taps maximum
- **Informative** : Stock, prix, options visibles instantanément
- **Réversible** : Erreur = correction facile, pas de panique

### Platform Strategy

| Plateforme | Rôle | Interaction Primaire |
|------------|------|----------------------|
| **POS (Chrome)** | Caisse principale | Tactile, écran large, flux d'encaissement |
| **Mobile (Capacitor)** | Serveurs en salle | Tactile, écran compact, prise de commande rapide |
| **KDS (Chrome)** | Cuisine | Tactile, lecture seule, marquage "prêt" |
| **Customer Display** | Client face comptoir | Lecture seule, transparence commande |

**Contraintes Techniques :**
- Communication LAN obligatoire (offline-first)
- Synchronisation cloud opportuniste
- État cohérent entre tous les appareils en < 1 seconde (LAN)

### Effortless Interactions

**Ce qui doit être invisible :**

1. **Disponibilité Stock**
   - Badge visuel sur chaque produit (vert/orange/rouge)
   - Stock exact visible au survol/tap long
   - Impossible d'ajouter un produit en rupture (grisé avec explication)

2. **Variantes et Options**
   - Affichage automatique des variantes à la sélection du produit
   - Prix ajusté en temps réel selon les options
   - Options fréquentes en premier (apprentissage par usage)

3. **Transition Offline**
   - Indicateur discret mais visible (icône, pas de texte alarmant)
   - Aucune fonctionnalité bloquée
   - Synchronisation silencieuse au retour online

4. **Calculs et Totaux**
   - Sous-total, taxes, remises : calcul instantané
   - Customer Display synchronisé en < 500ms

### Critical Success Moments

**Le Succès se Mesure en Fin de Journée**

Contrairement aux produits "wow" qui cherchent un moment magique, AppGrav vise la **fatigue zéro**. Le succès n'est pas "Waouh, c'est génial !" mais "Tiens, c'était facile aujourd'hui".

**Moments Critiques par Persona :**

| Persona | Moment Critique | Indicateur de Succès |
|---------|-----------------|----------------------|
| **Caissier** | Première coupure internet | "Je n'ai même pas remarqué" |
| **Serveur** | Première commande envoyée depuis la salle | "La cuisine l'a reçue instantanément" |
| **Client** | Voir sa commande s'afficher | "Je vois exactement ce que je paie" |
| **Manager** | Consultation du dashboard le matin | "Tout est là en 30 secondes" |

**Moment Make-or-Break :**
Un nouvel employé qui termine sa première journée sans avoir eu besoin d'appeler le manager pour un problème d'interface = victoire UX.

### Experience Principles

1. **"Le POS est Sacré"**
   - Rien ne bloque jamais la prise de commande
   - Toute information nécessaire est visible sans navigation
   - Les erreurs sont réversibles en 1 tap

2. **"Information Proactive"**
   - L'interface montre avant qu'on demande
   - Stock, variantes, prix : visibles au bon moment
   - Zéro recherche, zéro menu caché pour l'essentiel

3. **"Fatigue Zéro"**
   - Chaque interaction économise de l'énergie cognitive
   - Zones tactiles généreuses, contrastes forts
   - Feedback discret mais présent

4. **"Offline = Normal"**
   - Le cloud est un bonus, pas une dépendance
   - L'expérience est identique online/offline
   - La synchronisation est invisible et fiable

---
