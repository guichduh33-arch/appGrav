# Story 1.6: Company Settings UI

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Admin**,
I want **configurer les informations de l'entreprise**,
so that **elles apparaissent sur les tickets et rapports**.

## Acceptance Criteria

### AC1: Affichage du Formulaire Company Settings
**Given** j'ouvre la page `/settings/company`
**When** le formulaire s'affiche
**Then** je vois les champs : nom, raison sociale, NPWP, adresse, téléphone, email, logo
**And** les valeurs actuelles sont pré-remplies depuis la table `settings`

### AC2: Sauvegarde des Informations Entreprise
**Given** je modifie les informations (nom, adresse, etc.)
**When** je clique sur le bouton "Save"
**Then** les données sont enregistrées dans la table `settings` avec les clés appropriées
**And** un toast de confirmation s'affiche
**And** les données sont reflétées immédiatement dans l'UI

### AC3: Upload et Affichage du Logo
**Given** je souhaite modifier le logo de l'entreprise
**When** je clique sur le bouton d'upload et sélectionne une image
**Then** l'image est uploadée vers Supabase Storage bucket `company-assets`
**And** l'URL publique est enregistrée dans `settings` avec la clé `company.logo_url`
**And** le nouveau logo s'affiche dans le formulaire

### AC4: Validation des Champs
**Given** je modifie le formulaire
**When** je saisis des données invalides (email malformé, téléphone trop court)
**Then** les erreurs de validation s'affichent sous les champs concernés
**And** le bouton "Save" reste désactivé jusqu'à correction

### AC5: Permission Check
**Given** je suis un utilisateur sans permission `settings.update`
**When** j'ouvre la page `/settings/company`
**Then** je vois les informations en lecture seule
**And** les champs de formulaire et le bouton save sont désactivés

## Tasks / Subtasks

- [x] **Task 1: Créer la page CompanySettingsPage** (AC: 1, 2, 4, 5)
  - [x] 1.1: Créer `src/pages/settings/CompanySettingsPage.tsx`
  - [x] 1.2: Utiliser le pattern de TaxSettingsPage avec `settings-section` classes
  - [x] 1.3: Implémenter les champs: company_name, legal_name, npwp, address, phone, email
  - [x] 1.4: Ajouter validation des champs (email regex, phone length)
  - [x] 1.5: Intégrer `usePermissions` pour vérifier `settings.update`

- [x] **Task 2: Créer les settings keys et hooks** (AC: 1, 2)
  - [x] 2.1: Ajouter les settings keys dans `src/hooks/settings/settingsKeys.ts` si nécessaire
  - [x] 2.2: Utiliser `useSettingsByCategory('company')` pour charger les settings
  - [x] 2.3: Utiliser `useUpdateSetting` pour sauvegarder
  - [x] 2.4: Créer les settings dans Supabase si inexistants (migration ou seed)

- [x] **Task 3: Implémenter l'upload de logo** (AC: 3)
  - [x] 3.1: Créer ou étendre hook pour upload Supabase Storage
  - [x] 3.2: Créer bucket `company-assets` si inexistant (migration ou admin)
  - [x] 3.3: Implémenter composant LogoUpload avec preview et drag-drop
  - [x] 3.4: Stocker l'URL publique dans setting `company.logo_url`
  - [x] 3.5: Gérer le remplacement de logo (supprimer l'ancien fichier)

- [x] **Task 4: Ajouter la route et navigation** (AC: 1)
  - [x] 4.1: Ajouter route `/settings/company` dans App.tsx ou router
  - [x] 4.2: Ajouter lien dans SettingsLayout.tsx sidebar (si pas déjà présent)

- [x] **Task 5: Créer la migration pour settings company** (AC: 2)
  - [x] 5.1: Créer migration pour insérer les settings company si inexistants
  - [x] 5.2: Keys: `company.name`, `company.legal_name`, `company.npwp`, `company.address`, `company.phone`, `company.email`, `company.logo_url`
  - [x] 5.3: Créer la category `company` dans `settings_categories` si inexistante

- [x] **Task 6: Écrire les tests** (AC: 1, 2, 3, 4, 5)
  - [x] 6.1: Test de rendu du formulaire avec données existantes
  - [x] 6.2: Test de validation des champs
  - [x] 6.3: Test de sauvegarde des settings
  - [x] 6.4: Test de permission check (read-only mode)

## Dev Notes

### Architecture Compliance (MANDATORY)

**Pattern existant à suivre** [Source: src/pages/settings/TaxSettingsPage.tsx]
- Structure avec `settings-section`, `settings-section__header`, `settings-section__body`
- Utilisation de hooks `useSettingsByCategory`, `useUpdateSetting`
- Toast notifications via `sonner`
- Lucide icons pour les actions

**i18n - SUSPENDU** [Source: project-context.md]
- ⚠️ NE PAS utiliser `t()` ou `useTranslation()`
- Utiliser des strings anglaises directement
- Le code existant mélange FR/EN - suivre le pattern existant (strings en français dans l'UI)

### Existing Code Analysis

**Hooks settings existants** [Source: src/hooks/settings/index.ts]
```typescript
// À utiliser:
useSettingsByCategory('company')  // Charger tous les settings company
useUpdateSetting()                // Sauvegarder un setting
useSetting('company.name')        // Charger un setting spécifique (optionnel)
```

**Pattern de page settings** [Source: TaxSettingsPage.tsx]
- État local `settingValues` pour les modifications
- `handleSettingChange()` pour update via `updateSetting.mutateAsync()`
- `SettingField` component pour afficher les champs

**Supabase Storage pattern** [Source: Context7 docs]
```typescript
// Upload vers bucket
const { data, error } = await supabase.storage
  .from('company-assets')
  .upload(`logos/${fileName}`, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type
  });

// URL publique
const { data: publicUrl } = supabase.storage
  .from('company-assets')
  .getPublicUrl(`logos/${fileName}`);
```

### Previous Story Intelligence

**Story 1.5 learnings** [Source: 1-5-settings-offline-cache.md]
- Le hook `useSettingsOffline` existe pour fallback offline
- Pattern: `useLiveQuery` pour Dexie, `useQuery` pour online
- Settings cachés dans Dexie table `offline_settings`
- **Note:** Les company settings seront automatiquement cachés via le système existant

**Story 1.4 pattern:**
- `usePermissions` hook pour vérifier les droits
- Pattern `hasPermission('settings.update')` pour disable des actions

### Critical Implementation Details

**Settings keys structure:**
```typescript
// Company settings category
const COMPANY_SETTINGS_KEYS = {
  name: 'company.name',           // Nom commercial
  legalName: 'company.legal_name', // Raison sociale
  npwp: 'company.npwp',           // Numéro fiscal indonésien
  address: 'company.address',      // Adresse complète
  phone: 'company.phone',          // Téléphone
  email: 'company.email',          // Email contact
  logoUrl: 'company.logo_url',     // URL logo Supabase Storage
};
```

**Migration SQL suggérée:**
```sql
-- Insert settings_category if not exists
INSERT INTO settings_categories (id, name, description, sort_order)
VALUES ('company', 'Company', 'Company information', 1)
ON CONFLICT (id) DO NOTHING;

-- Insert company settings
INSERT INTO settings (key, value, value_type, category_id)
VALUES
  ('company.name', '"The Breakery"', 'string', 'company'),
  ('company.legal_name', '""', 'string', 'company'),
  ('company.npwp', '""', 'string', 'company'),
  ('company.address', '""', 'string', 'company'),
  ('company.phone', '""', 'string', 'company'),
  ('company.email', '""', 'string', 'company'),
  ('company.logo_url', '""', 'string', 'company')
ON CONFLICT (key) DO NOTHING;
```

**Storage bucket policy (RLS):**
```sql
-- Bucket: company-assets (public read, authenticated write)
CREATE POLICY "Public can view company assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-assets');

CREATE POLICY "Authenticated users can upload company assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'company-assets' AND auth.uid() IS NOT NULL);
```

**Validation rules:**
```typescript
const validateCompanyForm = (data: CompanyFormData) => {
  const errors: Record<string, string> = {};

  if (!data.name?.trim()) {
    errors.name = 'Company name is required';
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (data.phone && data.phone.length < 8) {
    errors.phone = 'Phone number too short';
  }

  // NPWP format: XX.XXX.XXX.X-XXX.XXX (15 digits with separators)
  if (data.npwp && !/^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/.test(data.npwp)) {
    errors.npwp = 'Invalid NPWP format';
  }

  return errors;
};
```

### Project Structure Notes

**Files to create:**
```
src/
├── pages/
│   └── settings/
│       └── CompanySettingsPage.tsx      # NEW: Main page
├── components/
│   └── settings/
│       └── LogoUpload.tsx               # NEW: Logo upload component (optional)
└── hooks/
    └── settings/
        └── useCompanySettings.ts        # OPTIONAL: Dedicated hook if needed
```

**Files to modify:**
- `src/App.tsx` - Add route `/settings/company`
- `src/pages/settings/SettingsLayout.tsx` - Add sidebar link if missing

**Migration file:**
- `supabase/migrations/YYYYMMDDHHMMSS_add_company_settings.sql`

### Testing Strategy

**Unit Tests - CompanySettingsPage:**
1. Renders form with existing values from settings
2. Validates required fields (company name)
3. Validates email format
4. Validates NPWP format (Indonesian tax number)
5. Saves settings on submit
6. Shows read-only mode without `settings.update` permission

**Integration Tests:**
1. Logo upload flow (mock Supabase Storage)
2. Settings persistence and reload

**Mocking:**
- Mock `useSettingsByCategory` with test data
- Mock `useUpdateSetting` mutation
- Mock `supabase.storage` for logo upload
- Mock `usePermissions` for permission tests

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-1.6]
- [Source: _bmad-output/project-context.md] - Project rules and patterns
- [Source: src/pages/settings/TaxSettingsPage.tsx] - Pattern reference
- [Source: src/hooks/settings/index.ts] - Available hooks
- [Source: 1-5-settings-offline-cache.md] - Previous story learnings
- [Source: Context7 Supabase-js docs] - Storage upload patterns
- [Source: CLAUDE.md#Architecture] - Project conventions

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Initial test failure: `@testing-library/user-event` not installed - resolved by using `fireEvent`
- Label association error: Added `htmlFor` and `id` attributes to form controls

### Completion Notes List

- All 5 acceptance criteria implemented and tested
- 22 unit tests passing covering form rendering, validation, submission, permission checks, and logo upload/removal
- NPWP auto-formatting implemented (XX.XXX.XXX.X-XXX.XXX)
- Logo upload to Supabase Storage bucket `company-assets`
- Permission-based read-only mode working

### File List

**Created:**
- `src/pages/settings/CompanySettingsPage.tsx` - Main page component
- `src/pages/settings/__tests__/CompanySettingsPage.test.tsx` - 22 unit tests
- `supabase/migrations/20260205120000_add_company_settings.sql` - Migration for company settings + storage bucket

**Modified:**
- `src/App.tsx` - Added route for `/settings/company`
- `src/pages/settings/SettingsPage.css` - Added CSS for company settings form

---

## Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.5 (claude-opus-4-5-20251101)
**Date:** 2026-02-05
**Outcome:** ✅ APPROVED (after fixes)

### Issues Found & Fixed

| ID | Severity | Issue | Fix Applied |
|----|----------|-------|-------------|
| H1 | HIGH | Storage bucket `company-assets` not created in migration (policies were commented out) | Enabled bucket creation with INSERT INTO storage.buckets + RLS policies |
| H2 | HIGH | No integration test for logo upload flow | Added 5 new tests for upload, validation, and removal |
| M1 | MEDIUM | Generic error messages in upload/remove handlers | Improved toast messages to include actual error details |
| M2 | MEDIUM | No test for logo removal flow | Added test verifying supabase.storage.remove() is called |
| M3 | MEDIUM | Potential null pointer on file extension extraction | Added fallback for files without extensions |

### Test Results After Fix
- **Tests:** 22/22 passing (was 17/17 before)
- **New tests added:**
  - `should call supabase storage upload when file is selected`
  - `should show error toast when upload fails`
  - `should reject non-image files`
  - `should reject files larger than 2MB`
  - `should call supabase storage remove when logo is deleted`

### Files Modified During Review
- `supabase/migrations/20260205120000_add_company_settings.sql` - Enabled bucket + RLS policies
- `src/pages/settings/CompanySettingsPage.tsx` - Improved error handling + null safety
- `src/pages/settings/__tests__/CompanySettingsPage.test.tsx` - Added 5 integration tests

