# Domain-Specific Requirements

### Compliance & Regulatory (Indonésie)

| Exigence | Description | Statut |
|----------|-------------|--------|
| **Taxe 10%** | Taxe incluse dans les prix (calcul: total × 10/110) | ✅ Implémenté |
| **Protection Données** | Données clients (fidélité, contacts) sécurisées | À renforcer |
| **Traçabilité** | Audit trail complet des transactions | Requis |

### Technical Constraints

| Contrainte | Spécification |
|------------|---------------|
| **Intégrité Offline** | Aucune perte de transaction, même en cas de coupure prolongée |
| **Horodatage** | Timestamps fiables pour la comptabilité (heure locale + UTC) |
| **Résolution Conflits** | Architecture 1 caisse = pas de conflit de numérotation |
| **Audit Trail** | Traçabilité complète incluant transactions offline avec marqueur |

### Data & Security Requirements

| Aspect | Exigence |
|--------|----------|
| **Authentification** | PIN par utilisateur avec permissions basées sur les rôles |
| **Données Client** | Stockage chiffré pour informations fidélité et contacts |
| **Transactions** | Non-répudiation, signature horodatée |
| **Backup** | Synchronisation cloud = backup automatique continu |
| **Offline Storage** | Stockage local sécurisé (IndexedDB/SQLite chiffré) |

### Integration Requirements

| Système | Type | Priorité |
|---------|------|----------|
| **Supabase Cloud** | Sync bidirectionnelle | MVP |
| **Réseau Local (LAN)** | Communication inter-appareils | MVP |
| **Imprimante Tickets** | ESC/POS via Print Server | Existant |
| **Paiements QRIS** | API paiement mobile | Post-MVP |
