/**
 * Unit Tests for Company Settings Page
 *
 * Tests form rendering, validation, submission, permission checks, and logo upload.
 *
 * @see Story 1.6: Company Settings UI
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import CompanySettingsPage from '../CompanySettingsPage';

// Mock hooks
vi.mock('../../../hooks/settings', () => ({
  useSettingsByCategory: vi.fn(),
  useUpdateSetting: vi.fn(),
}));

vi.mock('../../../hooks/usePermissions', () => ({
  usePermissions: vi.fn(),
}));

// Create mock functions for storage service
const mockReplaceLogo = vi.fn();
const mockDeleteLogo = vi.fn();

vi.mock('../../../services/storage', () => ({
  companyAssetsService: {
    replaceLogo: (...args: unknown[]) => mockReplaceLogo(...args),
    deleteLogo: (...args: unknown[]) => mockDeleteLogo(...args),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Import mocked modules
import { useSettingsByCategory, useUpdateSetting } from '../../../hooks/settings';
import { usePermissions } from '../../../hooks/usePermissions';
import { toast } from 'sonner';

// Mock settings data
const mockSettings = [
  { key: 'company.name', value: '"The Breakery"' },
  { key: 'company.legal_name', value: '"PT The Breakery"' },
  { key: 'company.npwp', value: '""' },
  { key: 'company.address', value: '"Jl. Senggigi"' },
  { key: 'company.phone', value: '"+62123456789"' },
  { key: 'company.email', value: '"test@test.com"' },
  { key: 'company.logo_url', value: '""' },
];

// Test wrapper with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CompanySettingsPage', () => {
  const mockUpdateSettingMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset storage service mocks
    mockReplaceLogo.mockReset();
    mockDeleteLogo.mockReset();

    // Default mock implementations
    (useSettingsByCategory as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockSettings,
      isLoading: false,
    });

    (useUpdateSetting as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync: mockUpdateSettingMutate,
      isPending: false,
    });

    (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({
      hasPermission: vi.fn((code: string) => code === 'settings.update'),
    });
  });

  describe('AC1: Form Rendering', () => {
    it('should render the form with all company fields', () => {
      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      // Check for form fields
      expect(screen.getByText('Company Information')).toBeInTheDocument();
      expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Legal Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/NPWP/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByText('Company Logo')).toBeInTheDocument();
    });

    it('should pre-fill form with existing settings values', () => {
      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      const companyNameInput = screen.getByLabelText(/Company Name/i) as HTMLInputElement;
      expect(companyNameInput.value).toBe('The Breakery');

      const legalNameInput = screen.getByLabelText(/Legal Name/i) as HTMLInputElement;
      expect(legalNameInput.value).toBe('PT The Breakery');

      const addressInput = screen.getByLabelText(/Address/i) as HTMLTextAreaElement;
      expect(addressInput.value).toBe('Jl. Senggigi');
    });

    it('should show loading state while fetching settings', () => {
      (useSettingsByCategory as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Loading company settings...')).toBeInTheDocument();
    });
  });

  describe('AC2: Form Submission', () => {
    it('should save settings when form is submitted', async () => {
      mockUpdateSettingMutate.mockResolvedValue({});

      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      // Wait for form to populate from settings useEffect
      await waitFor(() => {
        expect(screen.getByLabelText(/Company Name/i)).toHaveValue('The Breakery');
      }, { timeout: 3000 });

      // Modify a field to trigger dirty state
      const companyNameInput = screen.getByLabelText(/Company Name/i);
      fireEvent.change(companyNameInput, { target: { value: 'New Company Name' } });

      // Click save button
      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveButton);

      // Verify mutation was called
      await waitFor(() => {
        expect(mockUpdateSettingMutate).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Verify toast success
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Company settings saved');
      }, { timeout: 3000 });
    });

    it('should show dirty state indicator when form is modified', () => {
      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      // Initially no unsaved notice
      expect(screen.queryByText('You have unsaved changes')).not.toBeInTheDocument();

      // Modify a field
      const companyNameInput = screen.getByLabelText(/Company Name/i);
      fireEvent.change(companyNameInput, { target: { value: 'Modified Name' } });

      // Should show unsaved changes notice
      expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    });
  });

  describe('AC4: Field Validation', () => {
    it('should show error for empty company name', async () => {
      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      // Clear company name
      const companyNameInput = screen.getByLabelText(/Company Name/i);
      fireEvent.change(companyNameInput, { target: { value: '' } });

      // Try to save
      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Company name is required')).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      // Wait for form to populate from settings useEffect
      await waitFor(() => {
        expect(screen.getByLabelText(/Company Name/i)).toHaveValue('The Breakery');
      }, { timeout: 3000 });

      // Enter invalid email
      const emailInput = screen.getByLabelText(/Email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      // Modify company name to ensure validation runs
      const companyNameInput = screen.getByLabelText(/Company Name/i);
      fireEvent.change(companyNameInput, { target: { value: 'Test Company' } });

      // Try to save
      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show error for short phone number', async () => {
      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      // Enter short phone
      const phoneInput = screen.getByLabelText(/Phone/i);
      fireEvent.change(phoneInput, { target: { value: '123' } });

      // Modify company name
      const companyNameInput = screen.getByLabelText(/Company Name/i);
      fireEvent.change(companyNameInput, { target: { value: 'Test' } });

      // Try to save
      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Phone number must have at least 8 digits')).toBeInTheDocument();
      });
    });

    it('should show error for invalid NPWP format', async () => {
      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      // Enter invalid NPWP (will be auto-formatted but still invalid)
      const npwpInput = screen.getByLabelText(/NPWP/i);
      fireEvent.change(npwpInput, { target: { value: '12345' } });

      // Modify company name
      const companyNameInput = screen.getByLabelText(/Company Name/i);
      fireEvent.change(companyNameInput, { target: { value: 'Test' } });

      // Try to save
      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/Invalid NPWP format/i)).toBeInTheDocument();
      });
    });

    it('should auto-format NPWP input', () => {
      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      const npwpInput = screen.getByLabelText(/NPWP/i) as HTMLInputElement;
      fireEvent.change(npwpInput, { target: { value: '123456789012345' } });

      // Should be formatted as XX.XXX.XXX.X-XXX.XXX
      expect(npwpInput.value).toBe('12.345.678.9-012.345');
    });
  });

  describe('AC5: Permission Check', () => {
    it('should show read-only notice when user lacks settings.update permission', () => {
      (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({
        hasPermission: vi.fn(() => false),
      });

      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      expect(
        screen.getByText("You don't have permission to edit these settings")
      ).toBeInTheDocument();
    });

    it('should disable all form fields when user lacks settings.update permission', () => {
      (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({
        hasPermission: vi.fn(() => false),
      });

      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      const companyNameInput = screen.getByLabelText(/Company Name/i) as HTMLInputElement;
      expect(companyNameInput.disabled).toBe(true);

      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      expect(emailInput.disabled).toBe(true);
    });

    it('should not show save button when user lacks permission', () => {
      (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({
        hasPermission: vi.fn(() => false),
      });

      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      // Save button should not be present since user can't edit
      expect(screen.queryByRole('button', { name: /Save Changes/i })).not.toBeInTheDocument();
    });
  });

  describe('AC3: Logo Upload', () => {
    it('should show logo placeholder when no logo is set', () => {
      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      expect(screen.getByText('No logo uploaded')).toBeInTheDocument();
    });

    it('should show logo preview when logo URL is set', () => {
      const settingsWithLogo = [
        ...mockSettings.filter((s) => s.key !== 'company.logo_url'),
        { key: 'company.logo_url', value: '"https://example.com/logo.png"' },
      ];

      (useSettingsByCategory as ReturnType<typeof vi.fn>).mockReturnValue({
        data: settingsWithLogo,
        isLoading: false,
      });

      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      const logoImg = screen.getByAltText('Company logo');
      expect(logoImg).toBeInTheDocument();
      expect(logoImg).toHaveAttribute('src', 'https://example.com/logo.png');
    });

    it('should show upload button for users with permission', () => {
      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /Upload Logo/i })).toBeInTheDocument();
    });

    it('should not show upload button for users without permission', () => {
      (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({
        hasPermission: vi.fn(() => false),
      });

      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      expect(screen.queryByRole('button', { name: /Upload Logo/i })).not.toBeInTheDocument();
    });

    it('should call companyAssetsService when file is selected', async () => {
      mockReplaceLogo.mockResolvedValue({
        success: true,
        publicUrl: 'https://storage.example.com/logos/test.png',
      });

      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      // Create a mock file
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Trigger file selection
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Wait for upload to complete
      await waitFor(() => {
        expect(mockReplaceLogo).toHaveBeenCalledWith(file, undefined);
      });

      // Should show success toast
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Logo uploaded successfully');
      });
    });

    it('should show error toast when upload fails', async () => {
      mockReplaceLogo.mockResolvedValue({
        success: false,
        error: 'Storage quota exceeded',
      });

      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Storage quota exceeded');
      });
    });

    it('should reject non-image files via service validation', async () => {
      mockReplaceLogo.mockResolvedValue({
        success: false,
        error: 'Please select an image file',
      });

      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please select an image file');
      });
    });

    it('should reject files larger than 2MB via service validation', async () => {
      mockReplaceLogo.mockResolvedValue({
        success: false,
        error: 'Image must be smaller than 2MB',
      });

      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      // Create a file larger than 2MB (2 * 1024 * 1024 bytes)
      const largeContent = new Array(3 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Image must be smaller than 2MB');
      });
    });

    it('should call companyAssetsService.deleteLogo when logo is deleted', async () => {
      const settingsWithLogo = [
        ...mockSettings.filter((s) => s.key !== 'company.logo_url'),
        {
          key: 'company.logo_url',
          value: '"https://example.com/company-assets/logos/old_logo.png"',
        },
      ];

      (useSettingsByCategory as ReturnType<typeof vi.fn>).mockReturnValue({
        data: settingsWithLogo,
        isLoading: false,
      });

      mockDeleteLogo.mockResolvedValue(true);

      render(<CompanySettingsPage />, { wrapper: createWrapper() });

      // Find and click the remove button
      const removeButton = screen.getByTitle('Remove logo');
      fireEvent.click(removeButton);

      // Wait for removal to complete
      await waitFor(() => {
        expect(mockDeleteLogo).toHaveBeenCalledWith(
          'https://example.com/company-assets/logos/old_logo.png'
        );
      });

      // Should show success toast
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Logo removed');
      });
    });
  });
});
