# Story 1.8: Notification Settings UI

Status: ready-for-dev

## Story

As an **administrateur**,
I want **to configure SMTP settings and notification preferences**,
so that **the system can reliably send alerts and email reports**.

## Acceptance Criteria

1. **SMTP Configuration**:
   - Given I am on the notification settings page
   - When I enter SMTP information (Host, Port, User, Password, From Email)
   - And I click "Enregistrer"
   - Then the settings are securely saved in the database.

2. **Test Email**:
   - Given I click on "Envoyer email test"
   - When SMTP settings are valid
   - Then a test email is sent to the configured address
   - And a confirmation message is displayed.

3. **Alert Preferences**:
   - Given I modify alert settings (Low stock, Daily reports)
   - And I click "Enregistrer"
   - Then the preferences are updated and applied immediately.

## Tasks / Subtasks

- [ ] **Data layer & Hooks** (AC: 1, 3)
  - [ ] Update `useSettings.ts` to include `useNotificationSettings` hook targeting `notifications.%` keys.
  - [ ] Implement `useSendTestEmail` mutation to invoke the email edge function.
- [ ] **UI Implementation** (AC: 1, 2, 3)
  - [ ] Create `NotificationSettingsSection.tsx` component with form and toggles.
  - [ ] Implement "Send Test Email" button with loading and feedback states.
  - [ ] Integrate the section into `SettingsPage.tsx` under the "Notifications" tab.
- [ ] **Verification**
  - [ ] Unit test for the new section component.
  - [ ] Manual verification of save and test actions.

## Dev Notes

- **Architecture Patterns**: Follow the pattern used in `POSAdvancedSettingsSection.tsx` and `usePOSAdvancedSettings`.
- **Naming Convention**: Use `notifications.{key}` for settings keys in the database.
- **Sensitive Data**: Ensure `smtp_password` is handled as sensitive (masked in UI if necessary, though saved as JSONB).
- **Edge Function**: Call `supabase.functions.invoke('send-test-email', { body: settings })`. Note: This function may need to be created or stubbed if it doesn't exist.

### Project Structure Notes

- Component location: `src/components/settings/NotificationSettingsSection.tsx`
- Hook location: `src/hooks/useSettings.ts`
- Tab integration: `src/pages/settings/SettingsPage.tsx`

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#1.8 Notification Settings UI]
- [Source: docs/prompt-module-settings-erp.md#355 Notifications]

## Dev Agent Record

### Agent Model Used

Antigravity v1.0

### Debug Log References

- Verified `settings` table structure via `prompt-module-settings-erp.md`.
- Identified existing tab in `SettingsPage.tsx` requiring refactoring.

### Completion Notes List

### File List

- src/hooks/useSettings.ts
- src/components/settings/NotificationSettingsSection.tsx
- src/pages/settings/SettingsPage.tsx
