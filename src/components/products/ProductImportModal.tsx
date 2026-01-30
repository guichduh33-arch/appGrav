import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { importProducts, downloadImportTemplate, IImportResult } from '@/services/products/productImportExport'
import './ProductImportModal.css'

interface ProductImportModalProps {
    onClose: () => void
    onSuccess: () => void
}

export default function ProductImportModal({ onClose, onSuccess }: ProductImportModalProps) {
    const { t } = useTranslation()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string[][]>([])
    const [importing, setImporting] = useState(false)
    const [result, setResult] = useState<IImportResult | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const [options, setOptions] = useState({
        updateExisting: false,
        skipErrors: true
    })

    const parsePreview = useCallback((content: string) => {
        const lines = content.split('\n').filter(line => line.trim())
        const previewLines = lines.slice(0, 6) // Header + 5 rows
        const parsed = previewLines.map(line => {
            const values: string[] = []
            let current = ''
            let inQuotes = false

            for (let i = 0; i < line.length; i++) {
                const char = line[i]
                if (char === '"') {
                    if (inQuotes && line[i + 1] === '"') {
                        current += '"'
                        i++
                    } else {
                        inQuotes = !inQuotes
                    }
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim())
                    current = ''
                } else {
                    current += char
                }
            }
            values.push(current.trim())
            return values
        })
        setPreview(parsed)
    }, [])

    const handleFileSelect = useCallback((selectedFile: File) => {
        if (!selectedFile.name.endsWith('.csv')) {
            alert(t('product_import.invalid_format', 'Veuillez sélectionner un fichier CSV'))
            return
        }

        setFile(selectedFile)
        setResult(null)

        const reader = new FileReader()
        reader.onload = (e) => {
            const content = e.target?.result as string
            parsePreview(content)
        }
        reader.readAsText(selectedFile)
    }, [t, parsePreview])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)

        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) {
            handleFileSelect(droppedFile)
        }
    }, [handleFileSelect])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
    }, [])

    const handleImport = async () => {
        if (!file) return

        setImporting(true)
        try {
            const content = await file.text()
            const importResult = await importProducts(content, {
                updateExisting: options.updateExisting,
                skipErrors: options.skipErrors
            })
            setResult(importResult)

            if (importResult.success || importResult.created > 0 || importResult.updated > 0) {
                onSuccess()
            }
        } catch (error) {
            console.error('Import error:', error)
            setResult({
                success: false,
                created: 0,
                updated: 0,
                errors: [{ row: 0, sku: '', error: String(error) }]
            })
        } finally {
            setImporting(false)
        }
    }

    const handleReset = () => {
        setFile(null)
        setPreview([])
        setResult(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="modal-backdrop is-active" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-lg is-active">
                <div className="modal__header">
                    <div>
                        <h3 className="modal__title">
                            <FileSpreadsheet size={24} />
                            {t('product_import.title', 'Importer des produits')}
                        </h3>
                        <p className="modal__subtitle">
                            {t('product_import.subtitle', 'Importez des produits depuis un fichier CSV')}
                        </p>
                    </div>
                    <button
                        className="modal__close"
                        onClick={onClose}
                        title={t('common.close', 'Fermer')}
                        aria-label={t('common.close', 'Fermer')}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="modal__body">
                    {/* Template download */}
                    <div className="import-template-section">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={downloadImportTemplate}
                        >
                            <Download size={18} />
                            {t('product_import.download_template', 'Télécharger le template')}
                        </button>
                        <span className="import-template-hint">
                            {t('product_import.template_hint', 'Utilisez ce fichier comme modèle pour vos imports')}
                        </span>
                    </div>

                    {/* File upload zone */}
                    {!result && (
                        <>
                            <div
                                className={`import-dropzone ${dragOver ? 'is-dragover' : ''} ${file ? 'has-file' : ''}`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                    hidden
                                />
                                {file ? (
                                    <div className="import-file-info">
                                        <FileSpreadsheet size={32} />
                                        <span className="import-file-name">{file.name}</span>
                                        <span className="import-file-size">
                                            ({(file.size / 1024).toFixed(1)} KB)
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={48} />
                                        <p className="import-dropzone-text">
                                            {t('product_import.drag_drop', 'Glissez-déposez un fichier CSV ici')}
                                        </p>
                                        <p className="import-dropzone-hint">
                                            {t('product_import.or_click', 'ou cliquez pour sélectionner')}
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Preview */}
                            {preview.length > 0 && (
                                <div className="import-preview">
                                    <h4 className="import-preview-title">
                                        {t('product_import.preview', 'Aperçu')}
                                        <span className="import-preview-count">
                                            ({preview.length - 1} {t('product_import.rows_shown', 'lignes affichées')})
                                        </span>
                                    </h4>
                                    <div className="import-preview-table-wrapper">
                                        <table className="import-preview-table">
                                            <thead>
                                                <tr>
                                                    {preview[0]?.map((header, i) => (
                                                        <th key={i}>{header}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {preview.slice(1).map((row, i) => (
                                                    <tr key={i}>
                                                        {row.map((cell, j) => (
                                                            <td key={j}>{cell}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Options */}
                            {file && (
                                <div className="import-options">
                                    <label className="import-option">
                                        <input
                                            type="checkbox"
                                            checked={options.updateExisting}
                                            onChange={(e) => setOptions(prev => ({
                                                ...prev,
                                                updateExisting: e.target.checked
                                            }))}
                                        />
                                        <span>{t('product_import.options.update_existing', 'Mettre à jour les produits existants')}</span>
                                    </label>
                                    <label className="import-option">
                                        <input
                                            type="checkbox"
                                            checked={options.skipErrors}
                                            onChange={(e) => setOptions(prev => ({
                                                ...prev,
                                                skipErrors: e.target.checked
                                            }))}
                                        />
                                        <span>{t('product_import.options.skip_errors', 'Ignorer les erreurs et continuer')}</span>
                                    </label>
                                </div>
                            )}
                        </>
                    )}

                    {/* Results */}
                    {result && (
                        <div className="import-results">
                            <h4 className="import-results-title">
                                {result.success ? (
                                    <CheckCircle size={24} className="text-success" />
                                ) : (
                                    <AlertCircle size={24} className="text-warning" />
                                )}
                                {t('product_import.results.title', 'Résultats de l\'import')}
                            </h4>

                            <div className="import-results-stats">
                                <div className="import-stat created">
                                    <span className="import-stat-value">{result.created}</span>
                                    <span className="import-stat-label">
                                        {t('product_import.results.created', 'produits créés')}
                                    </span>
                                </div>
                                <div className="import-stat updated">
                                    <span className="import-stat-value">{result.updated}</span>
                                    <span className="import-stat-label">
                                        {t('product_import.results.updated', 'produits mis à jour')}
                                    </span>
                                </div>
                                <div className="import-stat errors">
                                    <span className="import-stat-value">{result.errors.length}</span>
                                    <span className="import-stat-label">
                                        {t('product_import.results.errors', 'erreurs')}
                                    </span>
                                </div>
                            </div>

                            {result.errors.length > 0 && (
                                <div className="import-errors">
                                    <h5>{t('product_import.error_details', 'Détails des erreurs')}</h5>
                                    <ul className="import-errors-list">
                                        {result.errors.slice(0, 10).map((err, i) => (
                                            <li key={i} className="import-error-item">
                                                <span className="import-error-row">
                                                    {t('product_import.error_row', 'Ligne')} {err.row}
                                                </span>
                                                {err.sku && (
                                                    <span className="import-error-sku">({err.sku})</span>
                                                )}
                                                <span className="import-error-message">{err.error}</span>
                                            </li>
                                        ))}
                                        {result.errors.length > 10 && (
                                            <li className="import-error-more">
                                                ... {t('product_import.and_more', 'et')} {result.errors.length - 10} {t('product_import.more_errors', 'autres erreurs')}
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal__footer">
                    {result ? (
                        <>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={handleReset}
                            >
                                {t('product_import.import_another', 'Importer un autre fichier')}
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={onClose}
                            >
                                {t('common.close', 'Fermer')}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={onClose}
                            >
                                {t('common.cancel', 'Annuler')}
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleImport}
                                disabled={!file || importing}
                            >
                                {importing ? (
                                    <>
                                        <Loader2 size={18} className="spin" />
                                        {t('product_import.importing', 'Importation en cours...')}
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        {t('product_import.import', 'Importer')}
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
