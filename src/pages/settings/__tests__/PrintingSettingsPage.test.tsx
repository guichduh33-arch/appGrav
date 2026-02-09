import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import PrintingSettingsPage from '../PrintingSettingsPage';

// Mock hooks
vi.mock('../../../hooks/settings', () => ({
    usePrinters: vi.fn(),
    useCreatePrinter: vi.fn(),
    useUpdatePrinter: vi.fn(),
    useDeletePrinter: vi.fn(),
}));

vi.mock('../../../hooks/usePermissions', () => ({
    usePermissions: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Import mocked modules
import {
    usePrinters,
    useCreatePrinter,
    useUpdatePrinter,
    useDeletePrinter,
} from '../../../hooks/settings';
import { usePermissions } from '../../../hooks/usePermissions';
import { toast } from 'sonner';

// Mock data
const mockPrinters = [
    {
        id: '1',
        name: 'Main Receipt Printer',
        printer_type: 'receipt',
        connection_type: 'network',
        connection_string: '192.168.1.100:9100',
        paper_width: 80,
        is_active: true,
        is_default: true,
    },
    {
        id: '2',
        name: 'Kitchen Printer',
        printer_type: 'kitchen',
        connection_type: 'network',
        connection_string: '192.168.1.101:9100',
        paper_width: 80,
        is_active: true,
        is_default: false,
    },
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

describe('PrintingSettingsPage', () => {
    const mockCreateMutate = vi.fn();
    const mockUpdateMutate = vi.fn();
    const mockDeleteMutate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementations
        (usePrinters as ReturnType<typeof vi.fn>).mockReturnValue({
            data: mockPrinters,
            isLoading: false,
        });

        (useCreatePrinter as ReturnType<typeof vi.fn>).mockReturnValue({
            mutateAsync: mockCreateMutate,
            isPending: false,
        });

        (useUpdatePrinter as ReturnType<typeof vi.fn>).mockReturnValue({
            mutateAsync: mockUpdateMutate,
            isPending: false,
        });

        (useDeletePrinter as ReturnType<typeof vi.fn>).mockReturnValue({
            mutateAsync: mockDeleteMutate,
            isPending: false,
        });

        (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({
            hasPermission: vi.fn((code: string) => code === 'settings.update'),
        });

        // Mock global fetch for health check and test print
        global.fetch = vi.fn();
    });

    describe('List Rendering', () => {
        it('should render the list of printers', () => {
            render(<PrintingSettingsPage />, { wrapper: createWrapper() });

            expect(screen.getByText('Main Receipt Printer')).toBeInTheDocument();
            expect(screen.getByText('Kitchen Printer')).toBeInTheDocument();
            expect(screen.getByText('192.168.1.100:9100')).toBeInTheDocument();
            expect(screen.getByText('192.168.1.101:9100')).toBeInTheDocument();
        });

        it('should show empty state when no printers exist', () => {
            (usePrinters as ReturnType<typeof vi.fn>).mockReturnValue({
                data: [],
                isLoading: false,
            });

            render(<PrintingSettingsPage />, { wrapper: createWrapper() });

            expect(screen.getByText(/No printers configured/i)).toBeInTheDocument();
        });

        it('should show loading state', () => {
            (usePrinters as ReturnType<typeof vi.fn>).mockReturnValue({
                data: undefined,
                isLoading: true,
            });

            render(<PrintingSettingsPage />, { wrapper: createWrapper() });

            expect(screen.getByText(/Loading/i)).toBeInTheDocument();
        });
    });

    describe('Create Printer', () => {
        it('should open modal and create a new printer', async () => {
            mockCreateMutate.mockResolvedValue({});
            render(<PrintingSettingsPage />, { wrapper: createWrapper() });

            // Open modal
            fireEvent.click(screen.getByRole('button', { name: /New Printer/i }));

            expect(screen.getByRole('heading', { name: 'New Printer' })).toBeInTheDocument();

            // Fill form
            fireEvent.change(screen.getByPlaceholderText(/Cash Register Printer/i), {
                target: { value: 'New Test Printer' },
            });
            fireEvent.change(screen.getByPlaceholderText(/192.168.1.100:9100/i), {
                target: { value: '10.0.0.50:9100' },
            });

            // Submit
            fireEvent.click(screen.getByRole('button', { name: /Create/i }));

            await waitFor(() => {
                expect(mockCreateMutate).toHaveBeenCalledWith(expect.objectContaining({
                    name: 'New Test Printer',
                    connection_string: '10.0.0.50:9100',
                }));
            });

            expect(toast.success).toHaveBeenCalledWith('Printer created');
        });

        it('should validate required fields', async () => {
            render(<PrintingSettingsPage />, { wrapper: createWrapper() });

            fireEvent.click(screen.getByRole('button', { name: /New Printer/i }));

            // Submit empty
            fireEvent.click(screen.getByRole('button', { name: /Create/i }));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/name.*required/i));
            });

            expect(mockCreateMutate).not.toHaveBeenCalled();
        });
    });

    describe('Update Printer', () => {
        it('should open modal with data and update printer', async () => {
            mockUpdateMutate.mockResolvedValue({});
            render(<PrintingSettingsPage />, { wrapper: createWrapper() });

            // Click edit button for the first printer
            const editButtons = screen.getAllByTitle('Edit');
            fireEvent.click(editButtons[0]);

            expect(screen.getByText('Edit Printer')).toBeInTheDocument();

            const nameInput = screen.getByPlaceholderText(/Cash Register Printer/i) as HTMLInputElement;
            expect(nameInput.value).toBe('Main Receipt Printer');

            // Change name
            fireEvent.change(nameInput, { target: { value: 'Updated Receipt Printer' } });

            // Submit
            fireEvent.click(screen.getByRole('button', { name: /Update/i }));

            await waitFor(() => {
                expect(mockUpdateMutate).toHaveBeenCalledWith(expect.objectContaining({
                    id: '1',
                    updates: expect.objectContaining({
                        name: 'Updated Receipt Printer',
                    }),
                }));
            });

            expect(toast.success).toHaveBeenCalledWith('Printer updated');
        });
    });

    describe('Delete Printer', () => {
        it('should call delete hook when confirmed', async () => {
            mockDeleteMutate.mockResolvedValue({});
            vi.spyOn(window, 'confirm').mockReturnValue(true);

            render(<PrintingSettingsPage />, { wrapper: createWrapper() });

            const deleteButtons = screen.getAllByTitle('Delete');
            fireEvent.click(deleteButtons[0]);

            expect(window.confirm).toHaveBeenCalled();

            await waitFor(() => {
                expect(mockDeleteMutate).toHaveBeenCalledWith('1');
            });

            expect(toast.success).toHaveBeenCalledWith('Printer deleted');
        });

        it('should not delete if not confirmed', () => {
            vi.spyOn(window, 'confirm').mockReturnValue(false);

            render(<PrintingSettingsPage />, { wrapper: createWrapper() });

            const deleteButtons = screen.getAllByTitle('Delete');
            fireEvent.click(deleteButtons[0]);

            expect(mockDeleteMutate).not.toHaveBeenCalled();
        });
    });

    describe('Permissions', () => {
        it('should hide action buttons when user lacks permission', () => {
            (usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({
                hasPermission: vi.fn(() => false),
            });

            render(<PrintingSettingsPage />, { wrapper: createWrapper() });

            expect(screen.queryByRole('button', { name: /New Printer/i })).not.toBeInTheDocument();
            expect(screen.queryByTitle('Edit')).not.toBeInTheDocument();
            expect(screen.queryByTitle('Delete')).not.toBeInTheDocument();

            // Test Print should still Bbe visible even if can't update (read-only diagnostics)
            expect(screen.getAllByTitle("Test print")[0]).toBeInTheDocument();
        });
    });

    describe('Test Print', () => {
        it('should perform health check and send test print', async () => {
            (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
                ok: true,
                json: async () => ({ status: 'ok' }),
            });

            render(<PrintingSettingsPage />, { wrapper: createWrapper() });

            const testButtons = screen.getAllByTitle("Test print");
            fireEvent.click(testButtons[0]);

            // Verify health check call
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/health', expect.anything());
            });

            // Verify print call
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/print/receipt', expect.anything());
            });

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/Print test successful/i));
            });
        });

        it('should show error if print server is offline', async () => {
            (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new TypeError('Failed to fetch'));

            render(<PrintingSettingsPage />, { wrapper: createWrapper() });

            const testButtons = screen.getAllByTitle("Test print");
            fireEvent.click(testButtons[0]);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/Print server unreachable/i));
            });
        });
    });
});
