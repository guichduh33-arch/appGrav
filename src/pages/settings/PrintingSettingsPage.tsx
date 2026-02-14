import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
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
import { PrinterModal } from './printing/PrinterModal';
import type { IPrinterFormData } from './printing/PrinterModal';
import { toast } from 'sonner';
import { logError } from '@/utils/logger'

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

  const openCreateModal = () => {
    setEditingPrinter(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

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

  const handleDelete = async (printer: PrinterConfiguration) => {
    if (!confirm(`Delete printer "${printer.name}"?`)) return;
    try {
      await deletePrinter.mutateAsync(printer.id);
      toast.success('Printer deleted');
    } catch {
      toast.error('Error deleting printer');
    }
  };

  const handleTestPrint = async (printer: PrinterConfiguration) => {
    setTestingId(printer.id);
    try {
      const healthCheck = await fetch(`${printingConfig.serverUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(printingConfig.healthCheckTimeoutMs),
      });
      if (!healthCheck.ok) {
        throw new Error('Print server is not responding');
      }
      const endpoint = printer.printer_type === 'receipt'
        ? '/print/receipt'
        : printer.printer_type === 'kitchen'
          ? '/print/kitchen'
          : printer.printer_type === 'barista'
            ? '/print/barista'
            : '/print/receipt';
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
        } catch { /* Response body may not be JSON */ }
        throw new Error(errorMessage);
      }
      toast.success('Print test successful');
    } catch (error) {
      logError('Print test error:', error);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-white">Printer Configuration</h2>
            <p className="text-sm text-[var(--theme-text-muted)] mt-1">
              Manage thermal printers for receipts and kitchen tickets
            </p>
          </div>
          {canUpdate && (
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm" onClick={openCreateModal}>
              <Plus size={16} />
              New Printer
            </button>
          )}
        </div>

        {/* Permission notice */}
        {!canUpdate && (
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">
            <AlertCircle size={16} />
            <span>You do not have permission to modify these settings</span>
          </div>
        )}

        {/* Content */}
        {loadingPrinters ? (
          <div className="flex items-center justify-center py-12 text-[var(--theme-text-muted)]">
            <div className="animate-spin w-5 h-5 border-2 border-[var(--color-gold)] border-t-transparent rounded-full mr-3" />
            <span>Loading...</span>
          </div>
        ) : !printers || printers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--theme-text-muted)]">
            <Printer size={48} className="mb-4 opacity-40" />
            <h3 className="text-lg font-bold text-white mb-1">No printers configured</h3>
            <p className="text-sm mb-4">Add a printer to start printing tickets.</p>
            {canUpdate && (
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm" onClick={openCreateModal}>
                <Plus size={16} />
                Add a printer
              </button>
            )}
          </div>
        ) : (
          <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
            {printers.map((printer) => (
              <div
                key={printer.id}
                className={`flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors ${!printer.is_active ? 'opacity-40' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-gold)] bg-[var(--color-gold)]/10 px-2 py-0.5 rounded-md">
                      {printer.printer_type}
                    </span>
                    {printer.is_default && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">
                        <CheckCircle size={10} />
                        Default
                      </span>
                    )}
                    {!printer.is_active && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--theme-text-muted)] bg-white/5 px-2 py-0.5 rounded-md">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-white">{printer.name}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--theme-text-muted)]">
                    <span className="flex items-center gap-1">
                      {printer.connection_type === 'network' ? <Wifi size={12} /> : <Usb size={12} />}
                      {printer.connection_type === 'network' ? printer.connection_string : 'USB'}
                    </span>
                    <span>{printer.paper_width}mm</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    className={`p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-white hover:bg-white/5 transition-colors ${testingId === printer.id ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                        className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => openEditModal(printer)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-red-400 hover:bg-white/5 transition-colors"
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

      {showModal && (
        <PrinterModal
          isEditing={!!editingPrinter}
          formData={formData}
          onFormChange={setFormData}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          isSaving={createPrinter.isPending || updatePrinter.isPending}
        />
      )}
    </>
  );
};

export default PrintingSettingsPage;
