### Non-Functional Requirements

#### Performance (NFR-PERF)

* **NFR-PERF-01**: Latence Customer Display < 500ms en LAN
* **NFR-PERF-02**: Temps de synchronisation < 30 secondes pour 50 transactions
* **NFR-PERF-03**: Temps de réponse app mobile < 200ms
* **NFR-PERF-04**: Temps d'envoi commande au KDS < 1 seconde
* **NFR-PERF-05**: Démarrage app mobile < 3 secondes
* **NFR-PERF-06**: Chargement rapport < 2 secondes pour 30 jours
* **NFR-PERF-07**: Drill-down < 500ms
* **NFR-PERF-08**: Export CSV < 5 secondes pour 10,000 lignes
* **NFR-PERF-09**: Export PDF < 10 secondes
* **NFR-PERF-10**: Filtrage temps réel < 300ms

#### Reliability (NFR-REL)

* **NFR-REL-01**: Durée mode offline 2 heures minimum
* **NFR-REL-02**: Zéro perte de transaction offline
* **NFR-REL-03**: Zéro perte de transaction en cas de crash app
* **NFR-REL-04**: Capacité stockage offline 500 transactions minimum
* **NFR-REL-05**: Taux de succès synchronisation 99.9%
* **NFR-REL-06**: Rapports offline disponibles sur 7 derniers jours

#### Availability (NFR-AVAIL)

* **NFR-AVAIL-01**: Uptime système POS 99.5% (hors maintenance)
* **NFR-AVAIL-02**: Basculement offline transparent < 2 secondes
* **NFR-AVAIL-03**: Communication LAN indépendante d'internet

#### Security (NFR-SEC)

* **NFR-SEC-01**: Authentification PIN 4-6 chiffres par utilisateur
* **NFR-SEC-02**: Expiration session après 30 minutes d'inactivité
* **NFR-SEC-03**: Stockage local sécurisé (IndexedDB encapsulé)
* **NFR-SEC-04**: Transmission LAN sécurisée (HTTPS/WSS ou réseau isolé)
* **NFR-SEC-05**: Audit trail 100% des transactions loguées
* **NFR-SEC-06**: Contrôle d'accès par catégorie de rapport
* **NFR-SEC-07**: Filigrane sur exports PDF (nom utilisateur + date)
* **NFR-SEC-08**: PIN hash stocké (bcrypt), jamais en clair
* **NFR-SEC-09**: RLS (Row Level Security) sur toutes les tables

#### Usability (NFR-USE)

* **NFR-USE-01**: Lisibilité prix 24px minimum, articles 18px minimum
* **NFR-USE-02**: Zones tactiles 44x44px minimum
* **NFR-USE-03**: Feedback visuel < 100ms après interaction
* **NFR-USE-04**: Indicateur statut réseau toujours visible
* **NFR-USE-05**: Visualisations: Bar, Line, Pie, Table minimum
* **NFR-USE-06**: Rapports consultables sur tablette/mobile
* **NFR-USE-07**: Graphiques lisibles pour daltoniens

#### Maintainability (NFR-MAIN)

* **NFR-MAIN-01**: Distribution mobile APK/IPA direct (pas de store)
* **NFR-MAIN-02**: Mise à jour manuelle via download APK/IPA
* **NFR-MAIN-03**: Logs diagnostic: erreurs + warnings + actions critiques
* **NFR-MAIN-04**: Fichiers max 300 lignes

#### Compatibility (NFR-COMPAT)

* **NFR-COMPAT-01**: Navigateur POS/KDS/Display: Chrome 100+ uniquement
* **NFR-COMPAT-02**: App Mobile iOS: iOS 14+ via Capacitor
* **NFR-COMPAT-03**: App Mobile Android: Android 8+ (API 26+) via Capacitor
* **NFR-COMPAT-04**: Réseau local: Ethernet 100Mbps minimum

#### Internationalization (NFR-I18N)

* **NFR-I18N-01**: Support 3 langues: Français (défaut), English, Indonesian
* **NFR-I18N-02**: Toute nouvelle feature doit avoir traductions dans les 3 locales
* **NFR-I18N-03**: Devise IDR, arrondi au 100 le plus proche

#### Business Rules (NFR-BIZ)

* **NFR-BIZ-01**: Taxe 10% incluse dans les prix (tax = total × 10/110)
* **NFR-BIZ-02**: Fidélité: 1 point = 1,000 IDR dépensés
* **NFR-BIZ-03**: Tiers fidélité: Bronze 0%, Silver 500pts 5%, Gold 2000pts 8%, Platinum 5000pts 10%
* **NFR-BIZ-04**: Alertes stock: < 10 warning, < 5 critical
* **NFR-BIZ-05**: Types de commande: dine\_in, takeaway, delivery, b2b

***
