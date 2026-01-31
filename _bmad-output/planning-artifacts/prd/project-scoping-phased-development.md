# Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP - Résout les 3 problèmes concrets identifiés

| Problème | Solution MVP |
|----------|--------------|
| Coupures internet fréquentes | Mode Offline 2h + Sync auto |
| Inefficacité serveurs (allers-retours) | App Mobile commandes |
| Erreurs commandes / manque transparence | Customer Display temps réel |

**Équipe Minimum:** 1-2 développeurs fullstack (React + Supabase)

### MVP Feature Set (Phase 1)

**Parcours Utilisateurs Supportés:**
- ✅ Marie (Serveur) - Prise commande mobile
- ✅ Budi (Caissier) - Continuité offline
- ✅ Pak Wayan (Client) - Transparence display
- ✅ Ketut (Cuisinier) - Réception commandes multi-source
- ✅ Pak Made (Manager) - Supervision sync

**Must-Have Capabilities:**

| Fonctionnalité | Criticité | Justification |
|----------------|-----------|---------------|
| Mode Offline 2h | CRITIQUE | Sans ça, échec à chaque coupure |
| Sync automatique | CRITIQUE | Sans ça, données perdues |
| Communication LAN | CRITIQUE | Permet offline inter-appareils |
| Customer Display | HAUTE | Valeur immédiate client |
| App Mobile commandes | HAUTE | Élimine allers-retours |
| Envoi KDS depuis mobile | HAUTE | Complète le flux serveur |

### Post-MVP Features

**Phase 2 (Growth) - Post-MVP:**

| Fonctionnalité | Raison d'attendre |
|----------------|-------------------|
| Encaissement mobile en salle | Sécurité paiement à renforcer |
| Notifications push (commande prête) | Amélioration, pas essentiel |
| Mode offline étendu (4h+) | 2h couvre 95% des cas |
| Multi-tablettes serveurs | 1 tablette suffit au départ |
| Stats temps réel mobile manager | Nice-to-have |

**Phase 3 (Expansion) - Vision Future:**

| Fonctionnalité | Raison d'attendre |
|----------------|-------------------|
| Commande client autonome (QR) | Changement comportement client |
| Intégration QRIS/GoPay/OVO | Intégration externe complexe |
| Mode kiosque self-service | Nouveau use case |
| Intégration GoFood/GrabFood | Nouveau marché |
| Analytics mobile avancés | Dépend de données accumulées |

### Risk Mitigation Strategy

**Risques Techniques:**

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Complexité sync offline | Moyenne | Haut | Architecture 1 caisse = pas de conflits |
| Communication LAN instable | Faible | Haut | Tests sur réseau réel The Breakery |
| Performance IndexedDB | Faible | Moyen | Limiter données locales à 2h |

**Risques Marché:**

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Résistance adoption mobile | Moyenne | Moyen | Formation + interface ultra-simple |
| Clients ignorent le display | Faible | Faible | Positionnement visible |

**Risques Ressources:**

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Délais développement | Moyenne | Moyen | MVP minimaliste, itérer après |
| Budget limité | Faible | Moyen | Pas de stores = économies |
