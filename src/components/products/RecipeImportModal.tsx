import { useState, useRef, useCallback } from 'react'
import { X, Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, ChefHat } from 'lucide-react'
import { importRecipes, downloadRecipeImportTemplate, IRecipeImportResult } from '@/services/products/recipeImportExport'
import './ProductImportModal.css' // Reuse the same styles

interface RecipeImportModalProps {
    onClose: () => void
    onSuccess: () => void
}

export default function RecipeImportModal({ onClose, onSuccess }: RecipeImportModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string[][]>([])
    const [importing, setImporting] = useState(false)
    const [result, setResult] = useState<IRecipeImportResult | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const [options, setOptions] = useState({
        updateExisting: false,
        skipErrors: true
    })

    const parsePreview = useCallback((content: string) => {
        const lines = content.split('\n').filter(line => line.trim())
        const previewLines = lines.slice(0, 8) // Header + 7 rows
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
            alert('Please select a CSV file')
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
    }, [parsePreview])

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
            const importResult = await importRecipes(content, {
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
                errors: [{ row: 0, product: '', material: '', error: String(error) }]
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
                            <ChefHat size={24} />
                            Import Recipes
                        </h3>
                        <p className="modal__subtitle">
                            Import product compositions from a CSV file
                        </p>
                    </div>
                    <button
                        className="modal__close"
                        onClick={onClose}
                        title="Close"
                        aria-label="Close"
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
                            onClick={downloadRecipeImportTemplate}
                        >
                            <Download size={18} />
                            Download Template
                        </button>
                        <span className="import-template-hint">
                            Format: product_name, material_name, quantity, unit
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
                                            Drag and drop a CSV file here
                                        </p>
                                        <p className="import-dropzone-hint">
                                            or click to select
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Preview */}
                            {preview.length > 0 && (
                                <div className="import-preview">
                                    <h4 className="import-preview-title">
                                        Preview
                                        <span className="import-preview-count">
                                            ({preview.length - 1} rows shown)
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
                                        <span>Update existing recipes</span>
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
                                        <span>Skip errors and continue</span>
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
                                Import Results
                            </h4>

                            <div className="import-results-stats">
                                <div className="import-stat created">
                                    <span className="import-stat-value">{result.created}</span>
                                    <span className="import-stat-label">
                                        recipes created
                                    </span>
                                </div>
                                <div className="import-stat updated">
                                    <span className="import-stat-value">{result.updated}</span>
                                    <span className="import-stat-label">
                                        recipes updated
                                    </span>
                                </div>
                                <div className="import-stat errors">
                                    <span className="import-stat-value">{result.errors.length}</span>
                                    <span className="import-stat-label">
                                        errors
                                    </span>
                                </div>
                            </div>

                            {result.errors.length > 0 && (
                                <div className="import-errors">
                                    <h5>Error Details</h5>
                                    <ul className="import-errors-list">
                                        {result.errors.slice(0, 10).map((err, i) => (
                                            <li key={i} className="import-error-item">
                                                <span className="import-error-row">
                                                    Row {err.row}
                                                </span>
                                                {err.product && (
                                                    <span className="import-error-sku">
                                                        ({err.product} → {err.material})
                                                    </span>
                                                )}
                                                <span className="import-error-message">{err.error}</span>
                                            </li>
                                        ))}
                                        {result.errors.length > 10 && (
                                            <li className="import-error-more">
                                                ... and {result.errors.length - 10} more errors
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
                                Import another file
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={onClose}
                            >
                                Cancel
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
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        Import
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
