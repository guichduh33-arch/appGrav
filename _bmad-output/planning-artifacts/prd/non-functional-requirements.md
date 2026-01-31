# Non-Functional Requirements

### Performance Requirements

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-P1** | Latence Customer Display | Temps entre action POS et affichage | < 500ms en LAN |
| **NFR-P2** | Temps de synchronisation | Durée sync après retour internet | < 30 secondes pour 50 transactions |
| **NFR-P3** | Temps de réponse app mobile | Temps entre tap et feedback | < 200ms |
| **NFR-P4** | Temps d'envoi commande au KDS | Depuis mobile ou POS | < 1 seconde |
| **NFR-P5** | Démarrage app mobile | Cold start | < 3 secondes |

### Reliability Requirements

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-R1** | Durée mode offline | Fonctionnement sans internet | 2 heures minimum |
| **NFR-R2** | Intégrité des données offline | Transactions perdues | 0 (zéro perte) |
| **NFR-R3** | Récupération après crash | Perte de données en cas de crash app | 0 transaction en cours perdue |
| **NFR-R4** | Capacité stockage offline | Transactions stockables localement | 500 transactions minimum |
| **NFR-R5** | Fiabilité sync | Taux de succès synchronisation | 99.9% |

### Availability Requirements

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-A1** | Disponibilité système POS | Uptime pendant heures d'ouverture | 99.5% (hors maintenance planifiée) |
| **NFR-A2** | Basculement offline | Temps transition online→offline | Transparent, < 2 secondes |
| **NFR-A3** | Communication LAN | Disponibilité réseau local | Indépendante d'internet |

### Security Requirements

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-S1** | Authentification | Type d'authentification | PIN 4-6 chiffres par utilisateur |
| **NFR-S2** | Expiration session | Timeout d'inactivité | 30 minutes (configurable) |
| **NFR-S3** | Stockage local sécurisé | Protection données offline | IndexedDB avec app encapsulée |
| **NFR-S4** | Transmission réseau local | Chiffrement LAN | HTTPS/WSS ou réseau isolé |
| **NFR-S5** | Audit trail | Traçabilité des actions | 100% des transactions loguées |

### Usability Requirements

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-U1** | Lisibilité Customer Display | Taille texte minimum | 24px pour prix, 18px pour articles |
| **NFR-U2** | Interface tactile | Taille zone cliquable | 44x44px minimum |
| **NFR-U3** | Feedback utilisateur | Indication visuelle action | < 100ms après interaction |
| **NFR-U4** | Indicateur statut réseau | Visibilité statut online/offline | Toujours visible, code couleur clair |

### Maintainability Requirements

| NFR ID | Exigence | Mesure | Seuil |
|--------|----------|--------|-------|
| **NFR-M1** | Déploiement app mobile | Méthode distribution | APK/IPA direct (pas de store) |
| **NFR-M2** | Mise à jour | Processus update | Manuel via download APK/IPA |
| **NFR-M3** | Logs diagnostic | Niveau de détail | Erreurs + warnings + actions critiques |

### Compatibility Requirements

| NFR ID | Exigence | Spécification |
|--------|----------|---------------|
| **NFR-C1** | Navigateur POS/KDS/Display | Chrome 100+ uniquement |
| **NFR-C2** | App Mobile iOS | iOS 14+ via Capacitor |
| **NFR-C3** | App Mobile Android | Android 8+ (API 26+) via Capacitor |
| **NFR-C4** | Réseau local | Ethernet 100Mbps minimum |

### NFR Priority Matrix

| Priorité | NFR IDs | Justification |
|----------|---------|---------------|
| **P0 - Bloquant** | NFR-R1, NFR-R2, NFR-P1, NFR-A2 | Core MVP: offline fonctionne, aucune perte |
| **P1 - Critique** | NFR-P2, NFR-P4, NFR-S1, NFR-S5 | Expérience utilisateur essentielle |
| **P2 - Important** | NFR-P3, NFR-P5, NFR-U1-U4, NFR-A3 | Qualité de service |
| **P3 - Souhaité** | NFR-R4, NFR-M1-M3, NFR-C1-C4 | Opérations et maintenance |

---
