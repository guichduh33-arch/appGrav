# Sprint Change Proposal

**Date:** 2026-02-01
**Projet:** AppGrav - ERP/POS The Breakery
**Demandeur:** MamatCEO
**Type de changement:** Ajout de périmètre (nouveau module)

---

## Section 1: Issue Summary

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

## Section 2: Impact Analysis

### Epic Impact

| Epic | Status Actuel | Impact | Action Requise |
|------|---------------|--------|----------------|
| Epic 1: Core System | ✅ done | Aucun | - |
| Epic 2: Catalogue | ✅ done | Aucun | - |
| Epic 3: POS & Ventes | ✅ done | Source données | Écritures ventes générées depuis orders |
| Epic 4: KDS | 📋 backlog | Aucun | - |
| Epic 5: Stock & Achats | 📋 backlog | Modéré | Hook pour écritures achats depuis PO |
| Epic 6: Clients & B2B | 📋 backlog | Modéré | Lier créances B2B au module comptable |
| Epic 7: Multi-Device | 📋 backlog | Aucun | - |
| Epic 8: Analytics | 📋 backlog | Coordination | Éviter duplication rapports financiers |
| **Epic 9: Comptabilité** | ➕ **NOUVEAU** | N/A | Créer epic complet (10 stories) |

### Story Impact

**Nouveau Epic 9: Comptabilité & Fiscalité**

| Story | Titre | Description |
|-------|-------|-------------|
| 9.1 | Plan comptable configurable | Comptes, classes, hiérarchie |
| 9.2 | Journal des ventes | Écritures auto depuis commandes POS |
| 9.3 | Journal des achats | Écritures auto depuis Purchase Orders |
| 9.4 | Journal de banque/caisse | Mouvements trésorerie |
| 9.5 | Grand livre | Détail par compte avec soldes |
| 9.6 | Balance des comptes | Balance générale et auxiliaire |
| 9.7 | Bilan | État actif/passif |
| 9.8 | Compte de résultat | Charges et produits |
| 9.9 | Gestion TVA | TVA collectée/déductible, rapprochement |
| 9.10 | Déclaration TVA mensuelle | Génération et suivi déclarations |

### Artifact Conflicts

| Artifact | Conflit | Modification Requise |
|----------|---------|---------------------|
| **PRD - Product Scope** | ⚠️ Oui | Ajouter "Module Comptabilité" dans Growth Features |
| **PRD - Functional Requirements** | ⚠️ Oui | Ajouter FR-ACCT-01 à FR-ACCT-15 |
| **PRD - User Journeys** | ⚠️ Oui | Ajouter persona et journey "Comptable" |
| **Architecture - ADRs** | ⚠️ Oui | Créer ADR-010: Accounting Module Architecture |
| **Architecture - Data Model** | ⚠️ Oui | Ajouter 5 nouvelles tables (voir ci-dessous) |
| **Epics - epic-list.md** | ⚠️ Oui | Ajouter Epic 9 complet |
| **Sprint - sprint-status.yaml** | ⚠️ Oui | Ajouter entrées Epic 9 |

### Technical Impact

**Nouvelles tables base de données:**

```sql
-- Plan comptable
CREATE TABLE chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- asset, liability, equity, revenue, expense
  parent_id UUID REFERENCES chart_of_accounts(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- En-têtes des écritures
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date DATE NOT NULL,
  reference VARCHAR(100),
  description TEXT,
  source_type VARCHAR(50), -- order, purchase_order, manual, payment
  source_id UUID,
  is_posted BOOLEAN DEFAULT false,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lignes des écritures
CREATE TABLE journal_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  debit DECIMAL(15,2) DEFAULT 0,
  credit DECIMAL(15,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Périodes fiscales TVA
CREATE TABLE tax_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  status VARCHAR(20) DEFAULT 'open', -- open, closed, declared
  closed_at TIMESTAMPTZ,
  UNIQUE(year, month)
);

-- Déclarations TVA
CREATE TABLE tax_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL REFERENCES tax_periods(id),
  vat_collected DECIMAL(15,2) NOT NULL,
  vat_deductible DECIMAL(15,2) NOT NULL,
  vat_due DECIMAL(15,2) NOT NULL,
  submitted_at TIMESTAMPTZ,
  reference VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Nouvelles permissions:**

| Code | Description |
|------|-------------|
| `accounting.view` | Consulter les écritures et états |
| `accounting.create` | Créer des écritures manuelles |
| `accounting.close_period` | Clôturer une période comptable |
| `tax.view` | Consulter les données TVA |
| `tax.declare` | Générer/soumettre déclarations TVA |

---

## Section 3: Recommended Approach

### Approche sélectionnée: Direct Adjustment

**Description:** Ajouter un nouvel Epic 9 (Comptabilité & Fiscalité) sans modifier le travail existant ni le scope MVP.

### Rationale

| Facteur | Évaluation |
|---------|------------|
| **Effort** | 🟡 Medium - Epic complet mais indépendant |
| **Risque** | 🟢 Low - Pas de modification code existant |
| **Timeline MVP** | ✅ Non impactée - Compta = post-MVP |
| **Valeur business** | 🟢 High - Conformité fiscale + vision financière |
| **Maintenabilité** | 🟢 Good - Module découplé |

### Alternatives considérées

| Option | Évaluation | Raison du rejet |
|--------|------------|-----------------|
| Rollback | ❌ Not viable | Rien à défaire, Epic 3 (POS) est source de données |
| MVP reduction | ❌ Not viable | Non nécessaire, comptabilité naturellement post-MVP |
| Intégrer dans Epic 8 | ❌ Rejeté | Epic 8 = Analytics/Reports, pas comptabilité en partie double |

### Effort Estimate

| Composant | Effort |
|-----------|--------|
| Schema DB + migrations | 2-3 jours |
| Plan comptable UI | 2 jours |
| Journaux (ventes, achats, caisse) | 5-7 jours |
| Grand livre + Balance | 3-4 jours |
| États financiers (Bilan, P&L) | 4-5 jours |
| Module TVA + Déclarations | 4-5 jours |
| **Total Epic 9** | **~20-25 jours** |

### Risk Assessment

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Complexité règles comptables indonésiennes | Medium | Medium | Recherche standards PSAK |
| Performance requêtes grand livre | Low | Medium | Index sur account_id, entry_date |
| Intégration avec orders existants | Low | Low | Triggers SQL sur insert |

---

## Section 4: Detailed Change Proposals

### 4.1 PRD Update: Product Scope

**File:** `_bmad-output/planning-artifacts/prd/product-scope.md`

**OLD:**
```markdown
### Growth Features (Post-MVP)

- Encaissement mobile en salle
- Notifications push
- Mode offline étendu (4h+)
- Support multi-tablettes
- Statistiques temps réel sur mobile manager
```

**NEW:**
```markdown
### Growth Features (Post-MVP)

- Encaissement mobile en salle
- Notifications push
- Mode offline étendu (4h+)
- Support multi-tablettes
- Statistiques temps réel sur mobile manager
- **Module Comptabilité & Fiscalité**
  - Journal comptable (ventes, achats, caisse)
  - Grand livre et balance des comptes
  - États financiers (Bilan, Compte de résultat)
  - Gestion TVA (PPN 10%) et déclarations mensuelles
```

**Rationale:** Documenter officiellement le nouveau périmètre dans le PRD

---

### 4.2 Architecture Update: ADR-010

**File:** `_bmad-output/planning-artifacts/architecture/core-architectural-decisions.md`

**ADD:**
```markdown
#### ADR-010: Module Comptabilité

**Contexte:** Besoin d'un module comptable complet pour conformité fiscale Indonésie.

**Décision:**
- Comptabilité en partie double (debit = credit)
- Écritures auto-générées depuis orders et purchase_orders via triggers
- Plan comptable configurable (standard PME indonésien par défaut)
- TVA 10% (PPN) avec périodes mensuelles

**Conséquences:**
- 5 nouvelles tables: chart_of_accounts, journal_entries, journal_lines, tax_periods, tax_declarations
- Triggers sur orders.insert → écriture vente
- Triggers sur purchase_orders.received → écriture achat
- Permissions dédiées (accounting.*, tax.*)

**Mode Offline:** ❌ Online-only
- Comptabilité requiert cohérence temps réel
- Pas de sync offline pour ce module
```

---

### 4.3 Epic List Update

**File:** `_bmad-output/planning-artifacts/epics/epic-list.md`

**ADD après Epic 8:**

```markdown
---

### Epic 9: Comptabilité & Fiscalité

Les comptables et managers peuvent gérer la comptabilité de l'entreprise avec journal, grand livre, états financiers et déclarations TVA.

**FRs couverts:** FR-ACCT-01 à FR-ACCT-15

**Offline Integration:** Online-only (pas de sync offline)

#### Story 9.1: Plan Comptable Configurable

**As a** Admin,
**I want** configurer le plan comptable,
**So that** les écritures utilisent les bons comptes.

**Acceptance Criteria:**

**Given** j'ouvre la configuration comptable
**When** je consulte le plan comptable
**Then** je vois les comptes par classe (1-Actif, 2-Passif, etc.)
**And** un plan comptable PME indonésien est pré-chargé

**Given** je souhaite ajouter un compte
**When** je crée un nouveau compte avec code et libellé
**Then** il est ajouté à la hiérarchie appropriée

#### Story 9.2: Journal des Ventes (Auto-génération)

**As a** Système,
**I want** générer automatiquement les écritures de vente,
**So that** chaque commande POS est comptabilisée.

**Acceptance Criteria:**

**Given** une commande est finalisée et payée
**When** le paiement est enregistré
**Then** une écriture est créée:
  - Débit: 411 Clients (ou 512 Banque si cash)
  - Crédit: 707 Ventes de marchandises
  - Crédit: 44571 TVA collectée (10%)

**Given** une commande est annulée (void)
**When** l'annulation est confirmée
**Then** une écriture d'extourne est générée

#### Story 9.3: Journal des Achats (Auto-génération)

**As a** Système,
**I want** générer automatiquement les écritures d'achat,
**So that** chaque réception de commande fournisseur est comptabilisée.

**Acceptance Criteria:**

**Given** une réception de PO est enregistrée
**When** les quantités sont validées
**Then** une écriture est créée:
  - Débit: 607 Achats de marchandises
  - Débit: 44566 TVA déductible (10%)
  - Crédit: 401 Fournisseurs

#### Story 9.4: Journal de Banque/Caisse

**As a** Comptable,
**I want** enregistrer les mouvements de trésorerie manuels,
**So that** la comptabilité reflète tous les flux financiers.

**Acceptance Criteria:**

**Given** je crée une écriture manuelle
**When** je saisis les comptes débit/crédit et montants
**Then** le système vérifie que débit = crédit
**And** l'écriture est enregistrée avec ma signature

#### Story 9.5: Grand Livre par Compte

**As a** Comptable,
**I want** consulter le grand livre d'un compte,
**So that** je vois tous les mouvements et le solde.

**Acceptance Criteria:**

**Given** je sélectionne un compte et une période
**When** le grand livre s'affiche
**Then** je vois toutes les écritures avec date, libellé, débit, crédit
**And** le solde progressif et final sont calculés

#### Story 9.6: Balance des Comptes

**As a** Comptable,
**I want** générer la balance des comptes,
**So that** je vérifie l'équilibre comptable.

**Acceptance Criteria:**

**Given** je sélectionne une période
**When** la balance s'affiche
**Then** je vois pour chaque compte: solde début, mouvements débit/crédit, solde fin
**And** le total des débits = total des crédits

#### Story 9.7: Bilan (État Financier)

**As a** Manager,
**I want** générer le bilan comptable,
**So that** je connais la situation patrimoniale.

**Acceptance Criteria:**

**Given** je demande le bilan à une date
**When** le rapport s'affiche
**Then** je vois l'Actif (immobilisations, stocks, créances, trésorerie)
**And** je vois le Passif (capitaux propres, dettes)
**And** Total Actif = Total Passif

#### Story 9.8: Compte de Résultat (État Financier)

**As a** Manager,
**I want** générer le compte de résultat,
**So that** je connais la performance financière.

**Acceptance Criteria:**

**Given** je sélectionne une période
**When** le rapport s'affiche
**Then** je vois les Produits (ventes, autres produits)
**And** je vois les Charges (achats, frais, amortissements)
**And** le Résultat net = Produits - Charges

#### Story 9.9: Gestion TVA (Collectée/Déductible)

**As a** Comptable,
**I want** suivre la TVA collectée et déductible,
**So that** je prépare les déclarations.

**Acceptance Criteria:**

**Given** je consulte le module TVA
**When** je sélectionne une période
**Then** je vois la TVA collectée (sur ventes)
**And** je vois la TVA déductible (sur achats)
**And** je vois la TVA à payer = collectée - déductible

#### Story 9.10: Déclaration TVA Mensuelle

**As a** Comptable,
**I want** générer et suivre les déclarations TVA,
**So that** je suis en conformité fiscale.

**Acceptance Criteria:**

**Given** une période est complète
**When** je génère la déclaration
**Then** un récapitulatif TVA est créé avec les montants
**And** je peux marquer la déclaration comme "soumise"
**And** la période est clôturée

---
```

---

### 4.4 Sprint Status Update

**File:** `_bmad-output/implementation-artifacts/sprint-status.yaml`

**ADD après epic-8-retrospective:**

```yaml
  # Epic 9: Comptabilité & Fiscalité
  epic-9: backlog
  9-1-chart-of-accounts: backlog
  9-2-sales-journal-auto: backlog
  9-3-purchase-journal-auto: backlog
  9-4-bank-cash-journal: backlog
  9-5-general-ledger: backlog
  9-6-trial-balance: backlog
  9-7-balance-sheet: backlog
  9-8-income-statement: backlog
  9-9-vat-management: backlog
  9-10-vat-declaration: backlog
  epic-9-retrospective: optional
```

---

## Section 5: Implementation Handoff

### Change Scope Classification

**Classification:** 🟡 **Moderate**

> Réorganisation du backlog nécessaire (nouvel epic), mais pas de refonte architecturale majeure ni d'impact sur le travail en cours.

### Handoff Responsibilities

| Rôle | Agent | Responsabilité | Livrable |
|------|-------|----------------|----------|
| **Scrum Master** | Bob 🏃 | Mettre à jour sprint-status.yaml | Entrées Epic 9 ajoutées |
| **Product Manager** | John 📋 | Mettre à jour PRD et créer Epic 9 | PRD + epic-list.md |
| **Architect** | Winston 🏗️ | Créer ADR-010 et schema DB | ADR + migration SQL |
| **Developer** | Amelia 💻 | Implémenter Epic 9 (après Epic 8) | Code |

### Success Criteria

- [ ] PRD mis à jour avec section Comptabilité
- [ ] ADR-010 créé et validé
- [ ] Epic 9 ajouté à epic-list.md avec 10 stories détaillées
- [ ] sprint-status.yaml mis à jour avec Epic 9
- [ ] Migration SQL pour les 5 nouvelles tables prête
- [ ] Développement Epic 4-8 non impacté

### Next Steps

1. **Immédiat:** Mettre à jour sprint-status.yaml avec Epic 9
2. **Court terme:** Mettre à jour PRD et Architecture
3. **Moyen terme:** Continuer Epic 4 (KDS) normalement
4. **Long terme:** Développer Epic 9 après Epic 8

---

## Approval

**Proposition préparée par:** Bob (Scrum Master) avec analyse Correct Course

**Date:** 2026-02-01

**Status:** ✅ **APPROUVÉ** par MamatCEO le 2026-02-01

**Changements appliqués:**
- [x] sprint-status.yaml mis à jour avec Epic 9
- [x] epic-list.md mis à jour avec 10 stories détaillées

---

_Document généré via BMAD Correct Course Workflow_
