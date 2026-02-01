# Section 4: Detailed Change Proposals

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
