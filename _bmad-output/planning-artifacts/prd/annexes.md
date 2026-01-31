# Annexes

### A. Glossaire

| Terme | Définition |
|-------|------------|
| **POS** | Point of Sale - Caisse enregistreuse |
| **KDS** | Kitchen Display System - Écran cuisine |
| **LAN** | Local Area Network - Réseau local câblé |
| **Offline Mode** | Fonctionnement sans connexion internet |
| **Customer Display** | Écran client face au comptoir |
| **Modifier** | Option/personnalisation sur un produit |
| **Capacitor** | Framework pour apps mobiles natives depuis React |
| **IndexedDB** | Base de données locale navigateur |
| **Supabase** | Backend-as-a-Service (base de données cloud) |
| **IDR** | Indonesian Rupiah - Devise indonésienne |

### B. Documents de Référence

| Document | Localisation |
|----------|--------------|
| Architecture Main App | `docs/architecture-main.md` |
| Guide Développement | `CLAUDE.md` |
| Documentation Index | `docs/index.md` |
| Module Combos | `docs/COMBOS_AND_PROMOTIONS.md` |
| Module Stock | `docs/STOCK_MOVEMENTS_MODULE.md` |

### C. Matrice de Traçabilité FR → NFR

| Fonctionnalité | FR | NFR Associés |
|----------------|-----|--------------|
| Mode Offline 2h | FR1-FR6 | NFR-R1, NFR-R2, NFR-R4, NFR-A2 |
| Customer Display | FR7-FR10 | NFR-P1, NFR-U1, NFR-U3 |
| App Mobile | FR11-FR17 | NFR-P3, NFR-P5, NFR-U2, NFR-C2, NFR-C3 |
| Communication LAN | FR18-FR20 | NFR-P1, NFR-A3, NFR-C4 |
| KDS Améliorations | FR21-FR24 | NFR-P4, NFR-S5 |
| Supervision | FR25-FR28 | NFR-P2, NFR-S5, NFR-U4 |

### D. Hypothèses et Dépendances

**Hypothèses:**
- Réseau local câblé (Ethernet) disponible et fonctionnel
- Une seule caisse POS (pas de conflits de numérotation)
- Utilisateurs formés sur l'interface existante AppGrav
- Tablette Android ou iPad disponible pour l'app serveurs

**Dépendances:**
- Supabase project actif et configuré
- Print-Server local opérationnel
- Infrastructure réseau The Breakery fonctionnelle

---
