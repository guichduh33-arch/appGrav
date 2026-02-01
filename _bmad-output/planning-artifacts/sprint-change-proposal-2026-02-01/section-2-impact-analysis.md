# Section 2: Impact Analysis

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
