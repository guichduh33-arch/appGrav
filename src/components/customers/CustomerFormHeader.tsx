import { ArrowLeft, Save, Trash2, QrCode } from 'lucide-react'

interface CustomerFormHeaderProps {
    isEditing: boolean
    membershipNumber: string | null
    saving: boolean
    onBack: () => void
    onSave: () => void
    onDelete?: () => void
}

export function CustomerFormHeader({
    isEditing, membershipNumber, saving, onBack, onSave, onDelete,
}: CustomerFormHeaderProps) {
    return (
        <header className="flex justify-between items-center mb-8 gap-4 flex-wrap max-md:flex-col max-md:items-start">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-transparent text-white hover:bg-white/5 transition-all"
                    title="Back"
                    aria-label="Back"
                    onClick={onBack}
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-display font-bold text-white m-0">
                        {isEditing ? 'Edit Customer' : 'New Customer'}
                    </h1>
                    {membershipNumber && (
                        <span className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg font-mono text-xs text-[var(--muted-smoke)] w-fit">
                            <QrCode size={12} />
                            {membershipNumber}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex gap-3 max-md:w-full max-md:[&>button]:flex-1">
                {isEditing && onDelete && (
                    <button
                        type="button"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                        onClick={onDelete}
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                )}
                <button
                    type="button"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[var(--color-gold)] text-black hover:brightness-110 transition-all disabled:opacity-50"
                    onClick={onSave}
                    disabled={saving}
                >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>
        </header>
    )
}
