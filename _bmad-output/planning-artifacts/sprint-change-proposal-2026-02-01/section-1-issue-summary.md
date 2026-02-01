# Section 1: Issue Summary

### Problème identifié

AppGrav gère efficacement les ventes POS et génère des rapports opérationnels (CA, marges, créances), mais **ne dispose pas d'un module comptable complet** permettant :

- La tenue d'un journal comptable avec écritures automatiques
- Un grand livre par compte comptable
- Des états financiers normalisés (Bilan, Compte de résultat)
- La gestion de la TVA indonésienne (PPN 10% - collectée et déductible)
- La préparation des déclarations fiscales mensuelles

### Contexte de découverte

- **Source:** Besoin exprimé directement par le stakeholder
- **Motivation:** Conformité fiscale pour The Breakery (entreprise en Indonésie)
- **Gap identifié:** L'Epic 8 (Analytics) contient des "Financial Reports" mais limités au P&L opérationnel, sans véritable comptabilité en partie double

### Evidence

- Le PRD actuel ne mentionne pas la comptabilité dans le scope
- Aucune table `accounting_*` dans le schéma base de données existant
- Pas de plan comptable ni d'écritures automatiques lors des ventes/achats

---
