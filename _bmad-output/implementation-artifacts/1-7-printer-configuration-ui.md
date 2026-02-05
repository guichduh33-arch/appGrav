# Story 1.7: Printer Configuration UI

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Admin**,
I want **configurer les imprimantes depuis l'interface**,
so that **je peux ajouter/modifier les imprimantes sans code**.

## Acceptance Criteria

### AC1: Affichage de la Liste des Imprimantes
**Given** j'ouvre la page `/settings/printing`
**When** la liste s'affiche
**Then** je vois toutes les imprimantes configurées dans la table `printer_configurations`
**And** chaque imprimante affiche: nom, type (receipt/kitchen/barista), connexion (USB/network), statut (active/inactive)
**And** l'imprimante par défaut est clairement identifiée

### AC2: Création d'une Nouvelle Imprimante
**Given** je clique sur le bouton "Nouvelle Imprimante"
**When** le modal s'ouvre
**Then** je vois les champs: nom, type (receipt/kitchen/barista), connexion (USB/network), IP/port (si network), paper_width (80mm par défaut)
**And** les champs obligatoires sont marqués

**Given** je remplis le formulaire avec des données valides
**When** je clique sur "Créer"
**Then** l'imprimante est ajoutée à la table `printer_configurations`
**And** un toast de confirmation s'affiche
**And** la liste se rafraîchit automatiquement

### AC3: Modification d'une Imprimante Existante
**Given** je clique sur le bouton "Edit" d'une imprimante
**When** le modal s'ouvre
**Then** les valeurs actuelles sont pré-remplies
**And** je peux modifier tous les champs sauf l'ID

**Given** je modifie les valeurs
**When** je clique sur "Mettre à jour"
**Then** les changements sont enregistrés
**And** un toast de confirmation s'affiche

### AC4: Test de Connexion Imprimante
**Given** une imprimante est configurée
**When** je clique sur le bouton "Test d'impression"
**Then** une requête est envoyée au print-server sur `http://localhost:3001/print/receipt` (ou `/print/kitchen`, `/print/barista` selon le type)
**And** si le print-server répond OK, un toast "Test réussi" s'affiche
**And** si le print-server ne répond pas, un toast d'erreur s'affiche avec le message approprié

### AC5: Suppression d'une Imprimante
**Given** je clique sur le bouton "Supprimer" d'une imprimante
**When** je confirme la suppression
**Then** l'imprimante est supprimée de la table
**And** si c'était l'imprimante par défaut, aucune autre n'est automatiquement promue
**And** un toast de confirmation s'affiche

### AC6: Permission Check
**Given** je suis un utilisateur sans permission `settings.update`
**When** j'ouvre la page `/settings/printing`
**Then** je vois les informations en lecture seule
**And** les boutons d'action (créer, modifier, supprimer) sont désactivés ou cachés

## Tasks / Subtasks

- [ ] **Task 1: Créer la page PrintingSettingsPage** (AC: 1, 2, 3, 5, 6)
  - [ ] 1.1: Créer `src/pages/settings/PrintingSettingsPage.tsx`
  - [ ] 1.2: Utiliser le pattern de TaxSettingsPage avec `settings-section` classes
  - [ ] 1.3: Afficher la liste des imprimantes avec leurs statuts
  - [ ] 1.4: Implémenter le modal create/edit avec les champs appropriés
  - [ ] 1.5: Intégrer `usePermissions` pour vérifier `settings.update`

- [ ] **Task 2: Intégrer les hooks existants** (AC: 1, 2, 3, 5)
  - [ ] 2.1: Utiliser `usePrinters()` pour charger la liste
  - [ ] 2.2: Utiliser `useCreatePrinter()` pour créer
  - [ ] 2.3: Utiliser `useUpdatePrinter()` pour modifier
  - [ ] 2.4: Utiliser `useDeletePrinter()` pour supprimer
  - [ ] 2.5: Ajouter les toasts via `sonner`

- [ ] **Task 3: Implémenter le test de connexion** (AC: 4)
  - [ ] 3.1: Créer fonction `testPrinterConnection(printer)` qui appelle le print-server
  - [ ] 3.2: Endpoint: `/health` pour vérifier que le serveur répond
  - [ ] 3.3: Endpoint: `/print/{type}` avec payload de test minimal
  - [ ] 3.4: Gérer les erreurs réseau (print-server non accessible)
  - [ ] 3.5: Afficher le résultat via toast

- [ ] **Task 4: Ajouter la route** (AC: 1)
  - [ ] 4.1: Vérifier que `/settings/printing` est bien routée dans App.tsx
  - [ ] 4.2: Vérifier que SettingsLayout a déjà l'entrée "printing" (déjà fait - voir CATEGORY_ICONS)

- [ ] **Task 5: Écrire les tests** (AC: 1, 2, 3, 4, 5, 6)
  - [ ] 5.1: Test de rendu de la liste des imprimantes
  - [ ] 5.2: Test de création d'imprimante
  - [ ] 5.3: Test de modification d'imprimante
  - [ ] 5.4: Test de suppression d'imprimante
  - [ ] 5.5: Test de mode lecture seule sans permission
  - [ ] 5.6: Mock du print-server pour test de connexion

## Dev Notes

### Architecture Compliance (MANDATORY)

**Pattern existant à suivre** [Source: src/pages/settings/TaxSettingsPage.tsx]
- Structure avec `settings-section`, `settings-section__header`, `settings-section__body`
- Modal avec classes `settings-modal`, `settings-modal__header`, `settings-modal__body`, `settings-modal__footer`
- Buttons: `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-ghost--danger`
- Toast notifications via `sonner`
- Lucide icons: `Plus`, `Edit2`, `Trash2`, `Save`, `X`, `CheckCircle`, `Printer`, `Wifi`, `Usb`, `AlertCircle`

**i18n - SUSPENDU** [Source: CLAUDE.md]
- ⚠️ NE PAS utiliser `t()` ou `useTranslation()`
- Utiliser des strings en français directement dans l'UI (pattern existant)
- Les toasts et labels en français

### Existing Code Analysis

**Hooks disponibles** [Source: src/hooks/settings/useBusinessSettings.ts]
```typescript
// Hooks EXISTANTS à utiliser (NE PAS recréer):
import { usePrinters, useCreatePrinter, useUpdatePrinter, useDeletePrinter } from '../../hooks/settings';

// usePrinters() retourne: { data: PrinterConfiguration[], isLoading: boolean }
// useCreatePrinter() retourne mutation pour créer
// useUpdatePrinter() retourne mutation avec { id, updates }
// useDeletePrinter() retourne mutation avec id
```

**Type PrinterConfiguration** [Source: src/types/database.generated.ts + settings.ts]
```typescript
interface PrinterConfiguration {
  id: string;
  name: string;
  printer_type: string;       // 'receipt' | 'kitchen' | 'barista' | 'label' | 'report'
  connection_type: string;    // 'usb' | 'network' | 'bluetooth'
  connection_string: string | null;  // IP:port pour network, path pour USB
  paper_width: number | null; // 80 (mm) pour receipt, 58 pour mobile
  is_active: boolean | null;
  is_default: boolean | null;
  settings: Json | null;      // Config avancée (vitesse, densité, etc.)
  created_at: string | null;
  updated_at: string | null;
}
```

**Print Server Endpoints** [Source: CLAUDE.md#Print-Server]
```typescript
// Le print-server tourne sur localhost:3001
const PRINT_SERVER_URL = 'http://localhost:3001';

// Endpoints disponibles:
// GET  /health              - Vérifie que le serveur est up
// POST /print/receipt       - Imprime ticket caisse (ESC/POS 80mm)
// POST /print/kitchen       - Imprime ticket cuisine
// POST /print/barista       - Imprime ticket barista
// POST /drawer/open         - Ouvre tiroir-caisse

// Payload de test minimal:
const testPayload = {
  test: true,
  printer_name: printer.name,
  message: 'Test print from AppGrav'
};
```

### Previous Story Intelligence

**Story 1.6 patterns** [Source: 1-6-company-settings-ui.md]
- Formulaire avec validation des champs
- Toast success/error pattern
- Permission check avec `usePermissions`
- Pattern read-only si pas de permission `settings.update`

**Story 1.5 learnings:**
- Les settings sont cachés dans Dexie pour offline (pas applicable pour printers - gestion online only)

### Critical Implementation Details

**Form validation:**
```typescript
const validatePrinterForm = (data: PrinterFormData) => {
  const errors: Record<string, string> = {};

  if (!data.name?.trim()) {
    errors.name = 'Printer name is required';
  }

  if (!data.printer_type) {
    errors.printer_type = 'Printer type is required';
  }

  if (!data.connection_type) {
    errors.connection_type = 'Connection type is required';
  }

  // Network connection requires IP:port
  if (data.connection_type === 'network' && !data.connection_string?.trim()) {
    errors.connection_string = 'IP address and port required for network connection';
  }

  // Validate IP:port format
  if (data.connection_type === 'network' && data.connection_string) {
    const ipPortRegex = /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/;
    if (!ipPortRegex.test(data.connection_string)) {
      errors.connection_string = 'Invalid format. Expected: 192.168.1.100:9100';
    }
  }

  return errors;
};
```

**Test print function:**
```typescript
const testPrinterConnection = async (printer: PrinterConfiguration) => {
  const PRINT_SERVER_URL = 'http://localhost:3001';

  try {
    // First check if print server is running
    const healthCheck = await fetch(`${PRINT_SERVER_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000), // 3s timeout
    });

    if (!healthCheck.ok) {
      throw new Error('Print server not responding');
    }

    // Determine endpoint based on printer type
    const endpoint = printer.printer_type === 'receipt'
      ? '/print/receipt'
      : printer.printer_type === 'kitchen'
        ? '/print/kitchen'
        : '/print/barista';

    // Send test print
    const response = await fetch(`${PRINT_SERVER_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        test: true,
        printer_name: printer.name,
        connection_string: printer.connection_string,
        message: `Test print - ${new Date().toLocaleString()}`,
      }),
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Print test failed');
    }

    return { success: true };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { success: false, error: 'Print server not accessible. Is it running?' };
    }
    return { success: false, error: (error as Error).message };
  }
};
```

### Project Structure Notes

**Files to create:**
```
src/
└── pages/
    └── settings/
        └── PrintingSettingsPage.tsx      # NEW: Main page (follow TaxSettingsPage pattern)
```

**Files to verify:**
```
src/App.tsx                              # Route /settings/printing → PrintingSettingsPage
src/pages/settings/SettingsLayout.tsx    # Already has "printing" in CATEGORY_ICONS ✓
```

**SettingsLayout already configured:**
```typescript
// CATEGORY_ICONS déjà défini (line 31):
printing: <Printer size={18} />,

// La route devrait déjà exister via le pattern dynamique
// Vérifier dans App.tsx si route existe
```

### Testing Strategy

**Unit Tests - PrintingSettingsPage:**
1. Renders list of printers from usePrinters hook
2. Shows empty state when no printers configured
3. Opens create modal on button click
4. Pre-fills edit modal with existing values
5. Validates required fields before save
6. Validates IP:port format for network connection
7. Shows read-only mode without `settings.update` permission
8. Calls correct endpoint for test print based on printer type

**Mocking:**
```typescript
// Mock hooks
vi.mock('../../hooks/settings', () => ({
  usePrinters: vi.fn(),
  useCreatePrinter: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useUpdatePrinter: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useDeletePrinter: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

// Mock fetch for print server
global.fetch = vi.fn();

// Mock permissions
vi.mock('../../hooks/usePermissions', () => ({
  usePermissions: vi.fn(() => ({
    hasPermission: vi.fn((code) => code === 'settings.update'),
  })),
}));
```

### Git Intelligence

**Recent commits patterns:**
- Feature commits use: `feat: Implement X with Y`
- Files follow PascalCase for pages/components
- 300 lines max per file

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-1.7]
- [Source: CLAUDE.md#Print-Server] - Print server endpoints
- [Source: src/pages/settings/TaxSettingsPage.tsx] - Pattern reference (416 lines - slightly long but good pattern)
- [Source: src/pages/settings/SettingsLayout.tsx] - Navigation already configured
- [Source: src/hooks/settings/useBusinessSettings.ts] - Printer hooks exist
- [Source: src/types/database.generated.ts] - printer_configurations schema
- [Source: 1-6-company-settings-ui.md] - Previous story patterns

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

