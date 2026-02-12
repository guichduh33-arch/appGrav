import { useState, useCallback } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useReportPermissions } from '@/hooks/reports/useReportPermissions';
import { useAuthStore } from '@/stores/authStore';
import {
  exportToCSV,
  type CsvColumn,
  type CsvExportOptions,
} from '@/services/reports/csvExport';
import {
  exportToPDF,
  type PdfColumn,
  type PdfExportOptions,
  type PdfSummary,
} from '@/services/reports/pdfExport';
import { logError } from '@/utils/logger'

export interface ExportConfig<T extends object> {
  data: T[];
  columns: Array<{
    key: keyof T | string;
    header: string;
    align?: 'left' | 'center' | 'right';
    width?: number;
    format?: (value: unknown, row: T) => string;
  }>;
  filename: string;
  title: string;
  subtitle?: string;
  dateRange?: { from: Date; to: Date };
  summaries?: PdfSummary[];
}

export interface ExportButtonsProps<T extends object> {
  config: ExportConfig<T>;
  disabled?: boolean;
  showLabels?: boolean;
  className?: string;
  onExportStart?: () => void;
  onExportComplete?: (type: 'csv' | 'pdf', success: boolean) => void;
}

export function ExportButtons<T extends object>({
  config,
  disabled = false,
  showLabels = true,
  className = '',
  onExportStart,
  onExportComplete,
}: ExportButtonsProps<T>) {
  const { canExport } = useReportPermissions();
  const { user } = useAuthStore();
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleCsvExport = useCallback(async () => {
    if (isExportingCsv || disabled || config.data.length === 0) return;

    setIsExportingCsv(true);
    onExportStart?.();

    try {
      const csvColumns: CsvColumn<T>[] = config.columns.map((col) => ({
        key: col.key,
        header: col.header,
        format: col.format,
      }));

      const csvOptions: CsvExportOptions = {
        filename: config.filename,
        reportName: config.title,
        dateRange: config.dateRange,
      };

      const result = exportToCSV(config.data, csvColumns, csvOptions);
      onExportComplete?.('csv', result.success);
    } catch (error) {
      logError('CSV export error:', error);
      onExportComplete?.('csv', false);
    } finally {
      setIsExportingCsv(false);
    }
  }, [config, disabled, isExportingCsv, onExportStart, onExportComplete]);

  const handlePdfExport = useCallback(async () => {
    if (isExportingPdf || disabled || config.data.length === 0) return;

    setIsExportingPdf(true);
    onExportStart?.();

    try {
      const pdfColumns: PdfColumn<T>[] = config.columns.map((col) => ({
        key: col.key,
        header: col.header,
        align: col.align,
        width: col.width,
        format: col.format,
      }));

      const pdfOptions: PdfExportOptions = {
        filename: config.filename,
        title: config.title,
        subtitle: config.subtitle,
        dateRange: config.dateRange,
        watermark: user ? {
          text: user.display_name || user.name || 'The Breakery',
          showDate: true,
        } : undefined,
        orientation: config.columns.length > 6 ? 'landscape' : 'portrait',
        footerText: 'The Breakery - Lombok, Indonesia',
      };

      const result = await exportToPDF(config.data, pdfColumns, pdfOptions, config.summaries);
      onExportComplete?.('pdf', result.success);
    } catch (error) {
      logError('PDF export error:', error);
      onExportComplete?.('pdf', false);
    } finally {
      setIsExportingPdf(false);
    }
  }, [config, disabled, isExportingPdf, user, onExportStart, onExportComplete]);

  // Don't render if user doesn't have export permission
  if (!canExport) {
    return null;
  }

  const isDisabled = disabled || config.data.length === 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* CSV Export Button */}
      <button
        type="button"
        onClick={handleCsvExport}
        disabled={isDisabled || isExportingCsv}
        className={`
          inline-flex items-center gap-2 px-3 py-2
          text-sm font-medium rounded-lg
          transition-colors
          ${
            isDisabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }
        `}
        title="Export to CSV"
      >
        {isExportingCsv ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4" />
        )}
        {showLabels && <span>CSV</span>}
      </button>

      {/* PDF Export Button */}
      <button
        type="button"
        onClick={handlePdfExport}
        disabled={isDisabled || isExportingPdf}
        className={`
          inline-flex items-center gap-2 px-3 py-2
          text-sm font-medium rounded-lg
          transition-colors
          ${
            isDisabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }
        `}
        title="Export to PDF"
      >
        {isExportingPdf ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        {showLabels && <span>PDF</span>}
      </button>
    </div>
  );
}

// Compact version for toolbars
export interface ExportDropdownProps<T extends object> {
  config: ExportConfig<T>;
  disabled?: boolean;
  className?: string;
}

export function ExportDropdown<T extends object>({
  config,
  disabled = false,
  className = '',
}: ExportDropdownProps<T>) {
  const { canExport } = useReportPermissions();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<'csv' | 'pdf' | null>(null);

  const handleExport = useCallback(
    async (type: 'csv' | 'pdf') => {
      setIsExporting(type);
      setIsOpen(false);

      try {
        if (type === 'csv') {
          const csvColumns: CsvColumn<T>[] = config.columns.map((col) => ({
            key: col.key,
            header: col.header,
            format: col.format,
          }));

          exportToCSV(config.data, csvColumns, {
            filename: config.filename,
            dateRange: config.dateRange,
          });
        } else {
          const pdfColumns: PdfColumn<T>[] = config.columns.map((col) => ({
            key: col.key,
            header: col.header,
            align: col.align,
            width: col.width,
            format: col.format,
          }));

          await exportToPDF(config.data, pdfColumns, {
            filename: config.filename,
            title: config.title,
            subtitle: config.subtitle,
            dateRange: config.dateRange,
            watermark: user ? {
              text: user.display_name || user.name || 'The Breakery',
              showDate: true,
            } : undefined,
            orientation: config.columns.length > 6 ? 'landscape' : 'portrait',
            footerText: 'The Breakery - Lombok, Indonesia',
          }, config.summaries);
        }
      } finally {
        setIsExporting(null);
      }
    },
    [config, user]
  );

  if (!canExport) {
    return null;
  }

  const isDisabled = disabled || config.data.length === 0;

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={`
          inline-flex items-center gap-2 px-3 py-2
          text-sm font-medium rounded-lg
          transition-colors
          ${
            isDisabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }
        `}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>Export</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <button
            type="button"
            onClick={() => handleExport('csv')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV (Excel)
          </button>
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>
      )}
    </div>
  );
}
