/**
 * Lightweight PDF Export Service (Gap F2)
 * Uses window.print() with @media print CSS instead of heavy PDF libraries.
 * Generates printable HTML for statements, reports, and PPN/VAT filing.
 */

export interface IStatementLine {
  label: string
  amount: number
  indent?: number
  bold?: boolean
}

export interface IStatementData {
  title: string
  period: string
  lines: IStatementLine[]
  total: number
}

/* eslint-disable max-len */
const PRINT_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,Helvetica,sans-serif;color:#1a1a1a;background:#fff;padding:20mm 15mm;font-size:11pt;line-height:1.5}
.header{text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #222}
.header h1{font-size:18pt;font-weight:700;letter-spacing:1px;margin-bottom:4px}
.header .subtitle{font-size:10pt;color:#555}
.report-title{font-size:14pt;font-weight:700;text-align:center;margin:16px 0 4px}
.report-period{font-size:10pt;color:#555;text-align:center;margin-bottom:20px}
table{width:100%;border-collapse:collapse;margin:12px 0;page-break-inside:auto}
thead{display:table-header-group}
tr{page-break-inside:avoid}
th{background:#f0f0f0;border:1px solid #ccc;padding:6px 10px;text-align:left;font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
th.right,td.right{text-align:right}
td{border:1px solid #ddd;padding:5px 10px;font-size:10pt}
tr:nth-child(even) td{background:#fafafa}
.summary-box{margin-top:20px;padding:12px 16px;border:2px solid #222;border-radius:4px;page-break-inside:avoid}
.summary-row{display:flex;justify-content:space-between;padding:4px 0;font-size:10pt}
.summary-row.total{font-weight:700;font-size:12pt;border-top:1px solid #ccc;margin-top:6px;padding-top:8px}
.statement-line{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #eee}
.statement-line.bold{font-weight:700;border-bottom:2px solid #ccc}
.statement-line .label{flex:1}
.statement-line .amount{text-align:right;font-variant-numeric:tabular-nums;min-width:140px}
.statement-total{display:flex;justify-content:space-between;padding:10px 0 4px;font-weight:700;font-size:13pt;border-top:3px double #222;margin-top:8px}
.footer{margin-top:32px;padding-top:12px;border-top:1px solid #ccc;font-size:8pt;color:#888;display:flex;justify-content:space-between}
@media print{body{padding:10mm}@page{margin:10mm;size:A4}.no-print{display:none!important}}
@media screen{body{max-width:800px;margin:0 auto}.print-btn{position:fixed;top:16px;right:16px;padding:10px 24px;background:#222;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;z-index:100}.print-btn:hover{background:#444}}
`
/* eslint-enable max-len */

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount / 100) * 100)
}

function buildPageShell(title: string, bodyContent: string): string {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - The Breakery</title>
  <style>${PRINT_CSS}</style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Print / Save PDF</button>
  <div class="header">
    <h1>The Breakery</h1>
    <div class="subtitle">French Bakery &amp; Cafe &mdash; Lombok, Indonesia</div>
  </div>
  ${bodyContent}
  <div class="footer">
    <span>The Breakery - Confidential</span>
    <span>Generated on ${escapeHtml(dateStr)} at ${escapeHtml(timeStr)}</span>
  </div>
</body>
</html>`
}

// =============================================================
// Public API
// =============================================================

/**
 * Open a new window with styled HTML and trigger print dialog.
 * Users can "Save as PDF" from the browser print dialog.
 */
export function exportToPdf(
  title: string,
  content: string,
  _filename?: string,
): void {
  const html = buildPageShell(title, content)
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to export PDF.')
    return
  }
  printWindow.document.write(html)
  printWindow.document.close()
  // Delay to let styles render before printing
  printWindow.setTimeout(() => printWindow.print(), 400)
}

/**
 * Generate a formatted HTML table for tabular reports.
 */
export function generateReportHtml(
  title: string,
  headers: string[],
  rows: string[][],
  summary?: Record<string, string>,
): string {
  const thCells = headers
    .map((h, i) => {
      const isNumeric = rows.length > 0 && !isNaN(Number(rows[0][i]?.replace(/[^\d.-]/g, '')))
      return `<th${isNumeric ? ' class="right"' : ''}>${escapeHtml(h)}</th>`
    })
    .join('')

  const bodyRows = rows
    .map(
      (row) =>
        '<tr>' +
        row
          .map((cell, i) => {
            const isNumeric = !isNaN(Number(cell?.replace(/[^\d.-]/g, '')))
            return `<td${isNumeric ? ' class="right"' : ''}>${escapeHtml(cell)}</td>`
          })
          .join('') +
        '</tr>',
    )
    .join('\n')

  let summaryHtml = ''
  if (summary && Object.keys(summary).length > 0) {
    const summaryRows = Object.entries(summary)
      .map(
        ([k, v]) =>
          `<div class="summary-row"><span>${escapeHtml(k)}</span><span>${escapeHtml(v)}</span></div>`,
      )
      .join('')
    summaryHtml = `<div class="summary-box">${summaryRows}</div>`
  }

  return `
    <div class="report-title">${escapeHtml(title)}</div>
    <table>
      <thead><tr>${thCells}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
    ${summaryHtml}
  `
}

/**
 * Generate HTML for a financial statement (balance sheet, income statement, etc.)
 */
export function generateStatementHtml(data: IStatementData): string {
  const lines = data.lines
    .map((line) => {
      const indent = (line.indent ?? 0) * 24
      const cls = line.bold ? 'statement-line bold' : 'statement-line'
      return `<div class="${cls}">
        <span class="label" style="padding-left:${indent}px">${escapeHtml(line.label)}</span>
        <span class="amount">${formatIDR(line.amount)}</span>
      </div>`
    })
    .join('')

  return `
    <div class="report-title">${escapeHtml(data.title)}</div>
    <div class="report-period">${escapeHtml(data.period)}</div>
    ${lines}
    <div class="statement-total">
      <span>Total</span>
      <span>${formatIDR(data.total)}</span>
    </div>
  `
}

/**
 * Convenience: export a tabular report directly (generates HTML + opens print).
 */
export function exportReportToPdf(
  title: string,
  headers: string[],
  rows: string[][],
  summary?: Record<string, string>,
): void {
  const html = generateReportHtml(title, headers, rows, summary)
  exportToPdf(title, html)
}

/**
 * Convenience: export a financial statement directly.
 */
export function exportStatementToPdf(data: IStatementData): void {
  const html = generateStatementHtml(data)
  exportToPdf(data.title, html)
}
