# User Journeys - Module Reports

### Parcours 6 : Pak Made, le Manager (Analytics & Décisions)

**Persona :** Pak Made, manager de The Breakery, supervise les opérations quotidiennes

**Situation :** Pak Made doit comprendre la performance du restaurant pour prendre des décisions stratégiques. Il a besoin de données claires, pas de chiffres bruts.

**Scène d'ouverture :**
C'est lundi matin, 8h. Pak Made arrive et veut comprendre comment s'est passée la semaine dernière. Il ouvre le module Reports sur son PC.

**Action montante :**
Il sélectionne une plage de dates personnalisée (semaine dernière) via le Date Range Picker. Le dashboard lui montre les KPIs : chiffre d'affaires +12%, panier moyen 85,000 IDR, 1,247 commandes.

**Climax :**
Il clique sur "Sales by Category" et voit que les viennoiseries représentent 45% du CA. Il drill-down sur cette catégorie et découvre que les croissants nature ont explosé (+35%) grâce à une promo qu'il avait oubliée. Il exporte le rapport en PDF pour la réunion d'équipe.

**Résolution :**
Pak Made a les insights pour reconduire la promo croissants. Il identifie aussi que les boissons chaudes sont en baisse (-8%) → action : former les serveurs à suggérer un café.

**Fonctionnalités révélées :** Date Range Picker, Dashboard KPIs, Sales by Category, Drill-down, Export PDF, Comparaison périodes

---

### Parcours 7 : Ibu Ayu, la Comptable (Finance & Réconciliation)

**Persona :** Ibu Ayu, comptable externe, vient 2x/mois pour les comptes

**Situation :** Ibu Ayu doit réconcilier les ventes avec les encaissements et préparer les déclarations fiscales.

**Scène d'ouverture :**
C'est le 15 du mois. Ibu Ayu a besoin des rapports financiers pour clôturer la période.

**Action montante :**
Elle accède au module Reports avec son compte "comptable". Elle génère le rapport "Profit/Loss" pour le mois écoulé : revenus bruts 45M IDR, coût des marchandises 18M IDR, marge brute 27M IDR.

**Climax :**
Elle consulte le rapport "Payment Methods" et voit une différence de 500,000 IDR entre les paiements carte enregistrés et le relevé bancaire. Elle drill-down sur les transactions carte, filtre par date suspecte, et identifie 3 transactions annulées non remboursées.

**Résolution :**
Elle exporte les rapports en PDF et CSV pour ses archives. Le rapport des taxes (10% incluses) lui donne directement le montant à déclarer : 4.09M IDR.

**Fonctionnalités révélées :** Rapport Profit/Loss, Payment Methods détaillé, Filtres avancés, Drill-down transactions, Export PDF/CSV, Calcul taxes automatique

---

### Parcours 8 : Marie, la Serveuse (Performance personnelle)

**Persona :** Marie, serveuse, veut suivre sa performance

**Situation :** Marie est payée avec un bonus basé sur ses ventes. Elle veut voir sa performance.

**Scène d'ouverture :**
Fin de journée. Marie veut savoir combien elle a vendu aujourd'hui.

**Action montante :**
Elle ouvre l'app mobile et accède à "Mes Rapports" (vue limitée à ses propres ventes). Elle voit : 42 commandes, 3.2M IDR de ventes, panier moyen 76,000 IDR.

**Climax :**
Elle compare avec la semaine dernière. Son panier moyen a augmenté de 12% depuis qu'elle suggère systématiquement des viennoiseries avec le café.

**Résolution :**
Marie est motivée. Elle sait que son bonus ce mois-ci sera bon. Elle partage ses "best practices" avec les autres serveurs.

**Fonctionnalités révélées :** Rapports filtrés par utilisateur, Vue mobile, Comparaisons, Permissions par rôle

---

### Parcours 9 : Budi, le Caissier (Clôture de session)

**Persona :** Budi, caissier, clôture sa session chaque soir

**Situation :** Budi doit réconcilier sa caisse avant de partir.

**Scène d'ouverture :**
21h, fin de service. Budi clôture sa session POS.

**Action montante :**
Il accède au rapport "Session Summary" qui lui montre : 89 transactions, 7.2M IDR encaissés, répartition espèces/carte/QRIS.

**Climax :**
Le rapport "Cash Balance" indique un écart de -15,000 IDR entre le théorique et le réel. Budi vérifie les annulations du jour : une erreur de rendu monnaie identifiée.

**Résolution :**
Budi note l'écart dans le système avec la raison. Le manager pourra voir cette information dans le rapport d'audit.

**Fonctionnalités révélées :** Session Summary, Cash Balance, Historique annulations, Notes d'écart, Audit trail

---

### Parcours 10 : Ketut, le Cuisinier (Gestion Stock & Alertes)

**Persona :** Ketut, chef cuisine, gère les stocks de production

**Situation :** Ketut doit anticiper les ruptures et gérer la production.

**Scène d'ouverture :**
6h du matin. Ketut prépare la production du jour.

**Action montante :**
Il consulte le rapport "Stock Warning" qui affiche les produits en alerte : farine en zone critique (< 5kg), beurre en warning (< 10kg), levure OK.

**Climax :**
Il vérifie le rapport "Stock Movement" pour comprendre la consommation récente. Il filtre sur "farine" et voit que la consommation a doublé cette semaine (nouvelle recette de brioche). Il consulte aussi "Expired Stock" : 2kg de crème fraîche expire demain.

**Résolution :**
Ketut passe commande d'urgence de farine et décide d'utiliser la crème fraîche aujourd'hui pour des quiches. Zéro gaspillage, zéro rupture.

**Fonctionnalités révélées :** Stock Warning avec seuils visuels, Stock Movement avec filtres produit, Expired Stock, Historique consommation

---

### Journey Requirements Summary - Module Reports

| Parcours | Utilisateur | Fonctionnalités Clés |
|----------|-------------|----------------------|
| **6. Analytics** | Manager | Date Range Picker, Dashboard KPIs, Drill-down, Export PDF, Comparaisons |
| **7. Finance** | Comptable | Profit/Loss, Payment Methods, Filtres avancés, Réconciliation, Export PDF/CSV |
| **8. Performance** | Serveur | Rapports personnels, Vue mobile, Comparaisons, Permissions rôle |
| **9. Clôture** | Caissier | Session Summary, Cash Balance, Annulations, Audit |
| **10. Stock** | Cuisinier | Stock Warning, Stock Movement, Expired Stock, Filtres produit |

---
