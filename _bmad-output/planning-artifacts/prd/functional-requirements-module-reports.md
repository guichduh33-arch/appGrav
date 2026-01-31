# Functional Requirements - Module Reports

### Infrastructure Reports

- **FR29:** Le Système peut afficher un Date Range Picker permettant de sélectionner des périodes personnalisées (aujourd'hui, hier, cette semaine, ce mois, personnalisé)
- **FR30:** Le Système peut appliquer des filtres avancés sur les rapports (par produit, catégorie, employé, méthode de paiement)
- **FR31:** Le Système peut permettre le drill-down depuis une vue agrégée vers les détails (catégorie → produits → transactions)
- **FR32:** Le Système peut exporter les rapports en format CSV
- **FR33:** Le Système peut exporter les rapports en format PDF avec mise en page professionnelle
- **FR34:** Le Système peut restreindre l'accès aux rapports selon les permissions du rôle utilisateur

### Rapports de Ventes

- **FR35:** Le Manager peut voir un rapport Profit/Loss avec revenus bruts, coûts, marge brute et marge nette
- **FR36:** Le Manager peut voir un rapport Sales by Customer avec CA par client et fréquence d'achat
- **FR37:** Le Manager peut voir un rapport Sales by Hour montrant les pics d'activité par tranche horaire
- **FR38:** Le Manager peut voir un rapport Cancellations listant les commandes annulées avec raisons
- **FR39:** Le Manager peut comparer deux périodes sur n'importe quel rapport de ventes

### Rapports d'Inventaire

- **FR40:** Le Cuisinier peut voir un rapport Stock Balance avec quantités actuelles vs seuils d'alerte
- **FR41:** Le Cuisinier peut voir un rapport Stock Warning affichant uniquement les produits en alerte (< seuil)
- **FR42:** Le Cuisinier peut voir un rapport Expired Stock listant les produits proches de la date de péremption
- **FR43:** Le Manager peut voir un rapport Unsold Products identifiant les produits sans vente sur une période

### Rapports Finance & Paiements

- **FR44:** La Comptable peut voir un rapport Cash Balance avec réconciliation espèces théorique vs réel
- **FR45:** La Comptable peut voir un rapport Receivables listant les créances clients B2B en attente
- **FR46:** La Comptable peut voir un rapport Expenses avec les dépenses par catégorie (achats, pertes, ajustements)
- **FR47:** La Comptable peut voir le détail des taxes collectées (10% inclus) pour les déclarations

### Rapports Achats

- **FR48:** Le Manager peut voir un rapport Purchase Returns avec les retours fournisseurs et motifs
- **FR49:** Le Manager peut voir un rapport Outstanding Payments listant les factures fournisseurs impayées

### Rapports Audit & Logs

- **FR50:** Le Manager peut voir un rapport Price Changes traçant toutes les modifications de prix
- **FR51:** Le Manager peut voir un rapport Deleted Products avec historique des produits supprimés
- **FR52:** Le Système peut enregistrer toutes les actions utilisateur dans un audit trail consultable

### Alertes & Notifications

- **FR53:** Le Système peut générer des alertes automatiques pour les anomalies (taux d'annulation élevé, stock négatif, écart de caisse)
- **FR54:** Le Manager peut configurer les seuils d'alerte pour chaque type d'anomalie
- **FR55:** Le Manager peut voir un tableau de bord des alertes avec filtres (non lues, non résolues, par sévérité)
- **FR56:** Le Manager peut marquer une alerte comme résolue avec une note explicative

---
