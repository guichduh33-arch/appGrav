import { useRef } from 'react'
import { Users, Plus, Filter, Upload } from 'lucide-react'

interface CustomersHeaderProps {
    onNavigateCategories: () => void
    onNavigateNew: () => void
    onImportCsv?: (file: File) => void
}

export function CustomersHeader({ onNavigateCategories, onNavigateNew, onImportCsv }: CustomersHeaderProps) {
    const fileRef = useRef<HTMLInputElement>(null)

    return (
        <header className="flex justify-between items-start mb-8 gap-4 flex-wrap max-md:flex-col max-md:gap-4">
            <div>
                <h1 className="flex items-center gap-3 text-2xl font-display font-bold text-white m-0">
                    <Users size={28} className="text-[var(--color-gold)]" />
                    Customer Management
                </h1>
                <p className="text-[var(--theme-text-muted)] mt-1.5 text-sm font-body">
                    Manage your customers, categories and loyalty program
                </p>
            </div>
            <div className="flex gap-3 max-md:w-full max-md:[&>button]:flex-1">
                <button
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-transparent border border-white/10 text-white hover:border-white/20 transition-all"
                    onClick={onNavigateCategories}
                >
                    <Filter size={16} />
                    Categories
                </button>
                {onImportCsv && (
                    <>
                        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) { onImportCsv(file); e.target.value = '' }
                        }} />
                        <button
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-transparent border border-white/10 text-white hover:border-white/20 transition-all"
                            onClick={() => fileRef.current?.click()}
                        >
                            <Upload size={16} />
                            Import CSV
                        </button>
                    </>
                )}
                <button
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-[var(--color-gold)] text-black hover:brightness-110 transition-all"
                    onClick={onNavigateNew}
                >
                    <Plus size={16} />
                    New Customer
                </button>
            </div>
        </header>
    )
}
