import { useState, useRef, useCallback } from 'react'
import { X, Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, ChefHat } from 'lucide-react'
import { importRecipes, downloadRecipeImportTemplate, IRecipeImportResult } from '@/services/products/recipeImportExport'
import { cn } from '@/lib/utils'

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
                    <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg mb-6 max-sm:flex-col max-sm:text-center">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={downloadRecipeImportTemplate}
                        >
                            <Download size={18} />
                            Download Template
                        </button>
                        <span className="text-sm text-muted-foreground">
                            Format: product_name, material_name, quantity, unit
                        </span>
                    </div>

                    {/* File upload zone */}
                    {!result && (
                        <>
                            <div
                                className={cn(
                                    'flex flex-col items-center justify-center py-12 px-8 border-2 border-dashed rounded-xl cursor-pointer transition-all mb-6 max-sm:py-8 max-sm:px-4',
                                    'border-border bg-secondary [&_svg]:text-muted-foreground [&_svg]:mb-4',
                                    'hover:border-primary hover:bg-primary/5',
                                    dragOver && 'border-primary bg-primary/5 border-solid',
                                    file && 'border-success bg-success/5'
                                )}
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
                                    <div className="flex flex-col items-center gap-2">
                                        <FileSpreadsheet size={32} className="text-success" />
                                        <span className="font-semibold text-foreground">{file.name}</span>
                                        <span className="text-sm text-muted-foreground">
                                            ({(file.size / 1024).toFixed(1)} KB)
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={48} />
                                        <p className="text-base font-medium text-foreground m-0">
                                            Drag and drop a CSV file here
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-2 mb-0">
                                            or click to select
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Preview */}
                            {preview.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                        Preview
                                        <span className="font-normal text-muted-foreground">
                                            ({preview.length - 1} rows shown)
                                        </span>
                                    </h4>
                                    <div className="overflow-x-auto border border-border rounded-lg">
                                        <table className="w-full border-collapse text-xs">
                                            <thead>
                                                <tr>
                                                    {preview[0]?.map((header, i) => (
                                                        <th key={i} className="px-3 py-2 text-left border-b border-border bg-secondary font-semibold text-foreground whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis">{header}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {preview.slice(1).map((row, i) => (
                                                    <tr key={i}>
                                                        {row.map((cell, j) => (
                                                            <td key={j} className="px-3 py-2 text-left border-b border-border last:border-b-0 text-muted-foreground whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis">{cell}</td>
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
                                <div className="flex flex-col gap-3 p-4 bg-secondary rounded-lg mb-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={options.updateExisting}
                                            onChange={(e) => setOptions(prev => ({
                                                ...prev,
                                                updateExisting: e.target.checked
                                            }))}
                                            className="w-[1.125rem] h-[1.125rem] accent-primary"
                                        />
                                        <span className="text-sm text-foreground">Update existing recipes</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={options.skipErrors}
                                            onChange={(e) => setOptions(prev => ({
                                                ...prev,
                                                skipErrors: e.target.checked
                                            }))}
                                            className="w-[1.125rem] h-[1.125rem] accent-primary"
                                        />
                                        <span className="text-sm text-foreground">Skip errors and continue</span>
                                    </label>
                                </div>
                            )}
                        </>
                    )}

                    {/* Results */}
                    {result && (
                        <div className="p-6 bg-secondary rounded-xl">
                            <h4 className="flex items-center gap-3 text-lg font-semibold text-foreground mb-6">
                                {result.success ? (
                                    <CheckCircle size={24} className="text-success" />
                                ) : (
                                    <AlertCircle size={24} className="text-warning" />
                                )}
                                Import Results
                            </h4>

                            <div className="grid grid-cols-3 gap-4 mb-6 max-sm:grid-cols-1">
                                <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-border">
                                    <span className="text-2xl font-bold text-success">{result.created}</span>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                                        recipes created
                                    </span>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-border">
                                    <span className="text-2xl font-bold text-primary">{result.updated}</span>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                                        recipes updated
                                    </span>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-border">
                                    <span className="text-2xl font-bold text-destructive">{result.errors.length}</span>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                                        errors
                                    </span>
                                </div>
                            </div>

                            {result.errors.length > 0 && (
                                <div className="bg-white border border-border rounded-lg p-4">
                                    <h5 className="text-sm font-semibold text-foreground mb-3">Error Details</h5>
                                    <ul className="list-none m-0 p-0 max-h-[200px] overflow-y-auto">
                                        {result.errors.slice(0, 10).map((err, i) => (
                                            <li key={i} className="flex flex-wrap gap-2 py-2 border-b border-border last:border-b-0 text-sm">
                                                <span className="font-semibold text-destructive">
                                                    Row {err.row}
                                                </span>
                                                {err.product && (
                                                    <span className="text-muted-foreground">
                                                        ({err.product} → {err.material})
                                                    </span>
                                                )}
                                                <span className="text-muted-foreground flex-1">{err.error}</span>
                                            </li>
                                        ))}
                                        {result.errors.length > 10 && (
                                            <li className="py-2 text-sm italic text-muted-foreground">
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
                                className="btn btn-secondary"
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
                                className="btn btn-secondary"
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
                                        <Loader2 size={18} className="animate-spin" />
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
