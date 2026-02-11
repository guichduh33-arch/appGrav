import { useState } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    CheckCircle,
    Printer,
    Wifi,
    Usb,
    AlertCircle,
    Activity,
} from 'lucide-react';
import {
    usePrinters,
    useCreatePrinter,
    useUpdatePrinter,
    useDeletePrinter,
} from '../../hooks/settings';
import { usePrintingServerSettings } from '../../hooks/settings/useModuleConfigSettings';
import { usePermissions } from '../../hooks/usePermissions';
import type { PrinterConfiguration } from '../../types/settings';
import { toast } from 'sonner';

interface IPrinterFormData {
    name: string;
    printer_type: string;
    connection_type: string;
    connection_string: string;
    paper_width: number;
    is_active: boolean;
    is_default: boolean;
}

const emptyForm: IPrinterFormData = {
    name: '',
    printer_type: 'receipt',
    connection_type: 'network',
    connection_string: '',
    paper_width: 80,
    is_active: true,
    is_default: false,
};

const PrintingSettingsPage = () => {
    const { data: printers, isLoading: loadingPrinters } = usePrinters();
    const createPrinter = useCreatePrinter();
    const updatePrinter = useUpdatePrinter();
    const deletePrinter = useDeletePrinter();
    const { hasPermission, isAdmin } = usePermissions();

    const [showModal, setShowModal] = useState(false);
    const [editingPrinter, setEditingPrinter] = useState<PrinterConfiguration | null>(null);
    const [formData, setFormData] = useState<IPrinterFormData>(emptyForm);
    const [testingId, setTestingId] = useState<string | null>(null);

    const printingConfig = usePrintingServerSettings();
    const canUpdate = hasPermission('settings.update') || isAdmin;

    // Open create modal
    const openCreateModal = () => {
        setEditingPrinter(null);
        setFormData(emptyForm);
        setShowModal(true);
    };

    // Open edit modal
    const openEditModal = (printer: PrinterConfiguration) => {
        setEditingPrinter(printer);
        setFormData({
            name: printer.name,
            printer_type: printer.printer_type,
            connection_type: printer.connection_type,
            connection_string: printer.connection_string || '',
            paper_width: printer.paper_width || 80,
            is_active: printer.is_active ?? true,
            is_default: printer.is_default ?? false,
        });
        setShowModal(true);
    };

    // Handle save
    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('Printer name is required');
            return;
        }

        if (formData.connection_type === 'network' && !formData.connection_string.trim()) {
            toast.error('IP address:port is required for network connection');
            return;
        }

        if (formData.connection_type === 'network' && formData.connection_string) {
            const ipPortRegex = /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/;
            if (!ipPortRegex.test(formData.connection_string)) {
                toast.error('Invalid format. Expected: 192.168.1.100:9100');
                return;
            }
        }

        try {
            if (editingPrinter) {
                await updatePrinter.mutateAsync({
                    id: editingPrinter.id,
                    updates: formData as Partial<PrinterConfiguration>,
                });
                toast.success('Printer updated');
            } else {
                await createPrinter.mutateAsync(formData as Omit<PrinterConfiguration, 'id' | 'created_at' | 'updated_at'>);
                toast.success('Printer created');
            }
            setShowModal(false);
        } catch {
            toast.error('Error saving printer');
        }
    };

    // Handle delete
    const handleDelete = async (printer: PrinterConfiguration) => {
        if (!confirm(`Delete printer "${printer.name}"?`)) return;

        try {
            await deletePrinter.mutateAsync(printer.id);
            toast.success('Printer deleted');
        } catch {
            toast.error('Error deleting printer');
        }
    };

    // Test printer connection
    const handleTestPrint = async (printer: PrinterConfiguration) => {
        setTestingId(printer.id);

        try {
            // First check if print server is running
            const healthCheck = await fetch(`${printingConfig.serverUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(printingConfig.healthCheckTimeoutMs),
            });

            if (!healthCheck.ok) {
                throw new Error('Print server is not responding');
            }

            // Determine endpoint based on printer type
            const endpoint = printer.printer_type === 'receipt'
                ? '/print/receipt'
                : printer.printer_type === 'kitchen'
                    ? '/print/kitchen'
                    : printer.printer_type === 'barista'
                        ? '/print/barista'
                        : '/print/receipt';

            // Send test print
            const response = await fetch(`${printingConfig.serverUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    test: true,
                    printer_name: printer.name,
                    connection_string: printer.connection_string,
                    message: `Print test - ${new Date().toLocaleString()}`,
                }),
                signal: AbortSignal.timeout(printingConfig.requestTimeoutMs),
            });

            if (!response.ok) {
                let errorMessage = 'Print test failed';
                try {
                    const error = await response.json();
                    errorMessage = error.message || errorMessage;
                } catch {
                    // Response body may not be JSON
                }
                throw new Error(errorMessage);
            }

            toast.success('Print test successful');
        } catch (error) {
            console.error('Print test error:', error);
            if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.name === 'TypeError')) {
                toast.error(`Print server unreachable. Is it running at ${printingConfig.serverUrl}?`);
            } else if (error instanceof Error && error.name === 'TimeoutError') {
                toast.error('Timeout. Print server is not responding.');
            } else {
                toast.error((error as Error).message);
            }
        } finally {
            setTestingId(null);
        }
    };

    return (
        <>
            <div className="settings-section">
                <div className="settings-section__header">
                    <div className="settings-section__header-content">
                        <div>
                            <h2 className="settings-section__title">Printer Configuration</h2>
                            <p className="settings-section__description">
                                Manage thermal printers for receipts and kitchen tickets
                            </p>
                        </div>
                        {canUpdate && (
                            <button className="btn-primary" onClick={openCreateModal}>
                                <Plus size={16} />
                                New Printer
                            </button>
                        )}
                    </div>
                </div>

                <div className="settings-section__body">
                    {!canUpdate && (
                        <div className="settings-section__readonly-notice">
                            <AlertCircle size={16} />
                            <span>You do not have permission to modify these settings</span>
                        </div>
                    )}
                    {loadingPrinters ? (
                        <div className="settings-section__loading">
                            <div className="spinner" />
                            <span>Loading...</span>
                        </div>
                    ) : !printers || printers.length === 0 ? (
                        <div className="settings-section__empty">
                            <Printer size={48} />
                            <h3>No printers configured</h3>
                            <p>Add a printer to start printing tickets.</p>
                            {canUpdate && (
                                <button className="btn-primary" onClick={openCreateModal}>
                                    <Plus size={16} />
                                    Add a printer
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="tax-rates-list">
                            {printers.map((printer) => (
                                <div
                                    key={printer.id}
                                    className={`tax-rate-item ${!printer.is_active ? 'is-inactive' : ''}`}
                                >
                                    <div className="tax-rate-item__info">
                                        <div className="tax-rate-item__header">
                                            <span className="tax-rate-item__code u-capitalize">
                                                {printer.printer_type}
                                            </span>
                                            {printer.is_default && (
                                                <span className="tax-rate-item__default-badge">
                                                    <CheckCircle size={12} />
                                                    Default
                                                </span>
                                            )}
                                            {!printer.is_active && (
                                                <span className="tax-rate-item__inactive-badge">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <div className="tax-rate-item__name">{printer.name}</div>
                                        <div className="tax-rate-item__details">
                                            <span className="flex items-center gap-1">
                                                {printer.connection_type === 'network' ? <Wifi size={14} /> : <Usb size={14} />}
                                                {printer.connection_type === 'network' ? printer.connection_string : 'USB'}
                                            </span>
                                            <span className="tax-rate-item__type">
                                                {printer.paper_width}mm
                                            </span>
                                        </div>
                                    </div>

                                    <div className="tax-rate-item__actions">
                                        <button
                                            className={`btn-ghost ${testingId === printer.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            onClick={() => handleTestPrint(printer)}
                                            title="Test print"
                                            disabled={testingId === printer.id}
                                        >
                                            {testingId === printer.id ? (
                                                <Activity size={16} className="animate-spin" />
                                            ) : (
                                                <Printer size={16} />
                                            )}
                                        </button>
                                        {canUpdate && (
                                            <>
                                                <button
                                                    className="btn-ghost"
                                                    onClick={() => openEditModal(printer)}
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="btn-ghost btn-ghost--danger"
                                                    onClick={() => handleDelete(printer)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="settings-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="settings-modal__header">
                            <h2 className="settings-modal__title">
                                {editingPrinter ? 'Edit Printer' : 'New Printer'}
                            </h2>
                            <button className="settings-modal__close" onClick={() => setShowModal(false)} title="Close">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="settings-modal__body">
                            <div className="form-group">
                                <label className="form-label">Printer name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Cash Register Printer"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Type *</label>
                                    <select
                                        className="form-input"
                                        value={formData.printer_type}
                                        onChange={(e) => setFormData({ ...formData, printer_type: e.target.value })}
                                        title="Printer type"
                                    >
                                        <option value="receipt">Receipt (POS)</option>
                                        <option value="kitchen">Kitchen</option>
                                        <option value="barista">Barista</option>
                                        <option value="label">Labels</option>
                                        <option value="report">Reports</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Paper width (mm)</label>
                                    <select
                                        className="form-input"
                                        value={formData.paper_width}
                                        onChange={(e) => setFormData({ ...formData, paper_width: Number(e.target.value) })}
                                        title="Paper width"
                                    >
                                        <option value={80}>80mm (Standard)</option>
                                        <option value={58}>58mm (Mobile/Compact)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Connection *</label>
                                    <select
                                        className="form-input"
                                        value={formData.connection_type}
                                        onChange={(e) => setFormData({ ...formData, connection_type: e.target.value })}
                                        title="Connection type"
                                    >
                                        <option value="network">Network (Ethernet/WiFi)</option>
                                        <option value="usb">USB</option>
                                        <option value="bluetooth">Bluetooth</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        {formData.connection_type === 'network' ? 'IP Address:Port *' : 'Connection string'}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.connection_string}
                                        onChange={(e) => setFormData({ ...formData, connection_string: e.target.value })}
                                        placeholder={formData.connection_type === 'network' ? '192.168.1.100:9100' : '/dev/usb/lp0'}
                                    />
                                    {formData.connection_type === 'network' && (
                                        <span className="text-[10px] text-[var(--color-gris-chaud)] mt-1 flex items-center gap-1">
                                            <AlertCircle size={10} />
                                            Expected format: IP:PORT (e.g. 192.168.1.100:9100)
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="form-row mt-4">
                                <div className="form-group">
                                    <label className="form-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_default}
                                            onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                        />
                                        <span>Use as default for this type</span>
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label className="form-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        />
                                        <span>Active</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="settings-modal__footer">
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleSave}
                                disabled={createPrinter.isPending || updatePrinter.isPending}
                            >
                                <Save size={16} />
                                {editingPrinter ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PrintingSettingsPage;
