# Non-Functional Requirements - Module Reports

### Performance

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-RP1** | Temps de chargement rapport | Durée affichage initial | < 2 secondes pour 30 jours de données |
| **NFR-RP2** | Temps drill-down | Durée navigation détail | < 500ms |
| **NFR-RP3** | Génération export CSV | Durée téléchargement | < 5 secondes pour 10,000 lignes |
| **NFR-RP4** | Génération export PDF | Durée création document | < 10 secondes |
| **NFR-RP5** | Filtrage temps réel | Durée application filtres | < 300ms |

### Disponibilité

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-RA1** | Rapports en mode offline | Accès aux données locales | Données des 7 derniers jours disponibles offline |
| **NFR-RA2** | Cache des rapports | Durée validité cache | 5 minutes (configurable) |

### Sécurité

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-RS1** | Contrôle d'accès | Granularité permissions | Par catégorie de rapport |
| **NFR-RS2** | Audit des accès | Traçabilité consultation | 100% des accès rapports loggés |
| **NFR-RS3** | Protection exports | Filigrane PDF | Nom utilisateur + date sur exports |

### Utilisabilité

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-RU1** | Visualisations | Types graphiques | Bar, Line, Pie, Table minimum |
| **NFR-RU2** | Responsive | Affichage mobile | Rapports consultables sur tablette/mobile |
| **NFR-RU3** | Accessibilité couleurs | Contraste | Graphiques lisibles pour daltoniens |

---
