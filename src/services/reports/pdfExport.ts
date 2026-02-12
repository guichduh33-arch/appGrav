/**
 * PDF Export Service
 * Epic 2: Story 2.2 - PDF Export with Watermark
 *
 * Export reports to PDF format with professional formatting
 */

import jsPDF from 'jspdf';
import autoTable, { RowInput, CellDef } from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// =============================================================
// Types
// =============================================================

export interface PdfColumn<T> {
  key: keyof T | string;
  header: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: unknown, row: T) => string;
}

export interface PdfExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  dateRange?: { from: Date; to: Date };
  watermark?: {
    text: string;
    showDate?: boolean;
  };
  orientation?: 'portrait' | 'landscape';
  showLogo?: boolean;
  footerText?: string;
}

export interface PdfSummary {
  label: string;
  value: string | number;
}

// =============================================================
// Helper Functions
// =============================================================

/**
 * Add watermark to PDF (NFR-RS3)
 */
function addWatermark(doc: jsPDF, text: string, showDate: boolean = true): void {
  const pageCount = doc.getNumberOfPages();
  const watermarkText = showDate
    ? `${text} - ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })}`
    : text;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.setFont('helvetica', 'italic');

    // Diagonal watermark
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.text(watermarkText, pageWidth / 2, pageHeight / 2, {
      angle: 45,
      align: 'center',
    });

    // Footer watermark
    doc.setFontSize(8);
    doc.text(watermarkText, pageWidth - 10, pageHeight - 10, { align: 'right' });
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: object, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
}

// =============================================================
// Main Export Function
// =============================================================

/**
 * Export data to PDF with professional formatting
 */
export function exportToPDF<T extends object>(
  data: T[],
  columns: PdfColumn<T>[],
  options: PdfExportOptions,
  summaries?: PdfSummary[]
): { success: boolean; error?: string } {
  try {
    const doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 15;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80); // Dark blue
    doc.text(options.title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    // Subtitle or date range
    if (options.subtitle) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(options.subtitle, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
    }

    if (options.dateRange) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const fromStr = format(options.dateRange.from, 'dd MMMM yyyy', { locale: fr });
      const toStr = format(options.dateRange.to, 'dd MMMM yyyy', { locale: fr });
      doc.text(`Période: ${fromStr} - ${toStr}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
    }

    // Report generation date
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Généré le ${format(new Date(), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );
    yPosition += 10;

    // Summaries (if provided)
    if (summaries && summaries.length > 0) {
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(10, yPosition, pageWidth - 20, 8 + summaries.length * 6, 2, 2, 'F');

      yPosition += 5;
      doc.setFontSize(10);
      doc.setTextColor(44, 62, 80);

      summaries.forEach((summary, index) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${summary.label}:`, 15, yPosition + index * 6);
        doc.setFont('helvetica', 'normal');
        doc.text(String(summary.value), 60, yPosition + index * 6);
      });

      yPosition += summaries.length * 6 + 8;
    }

    // Data table
    const headers = columns.map((col) => col.header);
    const rows: RowInput[] = data.map((row) =>
      columns.map((col) => {
        const key = col.key as keyof T;
        const value = key.toString().includes('.')
          ? getNestedValue(row, key.toString())
          : row[key];

        const formatted = col.format ? col.format(value, row) : String(value ?? '');

        const cell: CellDef = {
          content: formatted,
          styles: { halign: col.align || 'left' },
        };

        return cell;
      })
    );

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: yPosition,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246], // Blue
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: columns.reduce(
        (acc, col, index) => {
          if (col.width) {
            acc[index] = { cellWidth: col.width };
          }
          if (col.align) {
            acc[index] = { ...acc[index], halign: col.align };
          }
          return acc;
        },
        {} as Record<number, { cellWidth?: number; halign?: 'left' | 'center' | 'right' }>
      ),
      margin: { left: 10, right: 10 },
      didDrawPage: () => {
        // Footer on each page
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);

        // Page numbers
        doc.text(
          `Page ${doc.getCurrentPageInfo().pageNumber}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );

        // Footer text
        if (options.footerText) {
          doc.text(options.footerText, 10, pageHeight - 10);
        }
      },
    });

    // Add watermark if specified
    if (options.watermark) {
      addWatermark(doc, options.watermark.text, options.watermark.showDate ?? true);
    }

    // Generate filename
    let filename = options.filename;
    if (options.dateRange) {
      const fromStr = format(options.dateRange.from, 'yyyy-MM-dd');
      const toStr = format(options.dateRange.to, 'yyyy-MM-dd');
      filename = `${filename}_${fromStr}_${toStr}`;
    } else {
      filename = `${filename}_${format(new Date(), 'yyyy-MM-dd')}`;
    }
    filename = `${filename}.pdf`;

    // Save the PDF
    doc.save(filename);

    return { success: true };
  } catch (err) {
    console.error('PDF Export error:', err);
    return { success: false, error: 'Erreur lors de l\'export PDF' };
  }
}

// =============================================================
// Formatting Helpers
// =============================================================

/**
 * Format number for PDF export
 */
export function formatNumber(value: unknown): string {
  if (value === null || value === undefined) return '';
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return num.toLocaleString('fr-FR');
}

/**
 * Format currency for PDF export (IDR)
 */
export function formatCurrency(value: unknown): string {
  if (value === null || value === undefined) return '';
  const num = Number(value);
  if (isNaN(num)) return String(value);
  // Round to nearest 100 IDR
  const rounded = Math.round(num / 100) * 100;
  return `${rounded.toLocaleString('fr-FR')} IDR`;
}

/**
 * Format date for PDF export
 */
export function formatDate(value: unknown): string {
  if (!value) return '';
  const date = new Date(value as string);
  if (isNaN(date.getTime())) return String(value);
  return format(date, 'dd/MM/yyyy', { locale: fr });
}

/**
 * Format datetime for PDF export
 */
export function formatDateTime(value: unknown): string {
  if (!value) return '';
  const date = new Date(value as string);
  if (isNaN(date.getTime())) return String(value);
  return format(date, 'dd/MM/yyyy HH:mm', { locale: fr });
}

/**
 * Format percentage for PDF export
 */
export function formatPercentage(value: unknown): string {
  if (value === null || value === undefined) return '';
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return `${(num * 100).toFixed(1)}%`;
}
