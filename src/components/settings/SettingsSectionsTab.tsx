import {
  Plus, Edit2, Trash2, RefreshCw, Layers,
  ShoppingCart, Factory, Warehouse,
} from 'lucide-react';
import type { ISettingsSection } from '@/hooks/settings/useSections';

const SECTION_TYPES = [
  { value: 'warehouse' as const, label: 'Warehouse / Storage', icon: <Warehouse size={20} />, color: '#3B82F6' },
  { value: 'production' as const, label: 'Production', icon: <Factory size={20} />, color: '#10B981' },
  { value: 'sales' as const, label: 'Point of Sale', icon: <ShoppingCart size={20} />, color: '#F59E0B' },
];

interface SettingsSectionsTabProps {
  sections: ISettingsSection[];
  loadingSections: boolean;
  onCreateSection: () => void;
  onEditSection: (section: ISettingsSection) => void;
  onDeleteSection: (section: ISettingsSection) => void;
}

const SettingsSectionsTab = ({
  sections, loadingSections,
  onCreateSection, onEditSection, onDeleteSection,
}: SettingsSectionsTabProps) => {
  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-display font-bold text-white mb-1">Establishment Sections</h2>
            <p className="text-sm text-[var(--theme-text-muted)]">
              Manage the different sections of your establishment (kitchen, bar, warehouse, etc.)
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-all hover:brightness-110 shrink-0" onClick={onCreateSection}>
            <Plus size={18} />
            New Section
          </button>
        </div>
      </div>
      <div className="p-6">
        {loadingSections ? (
          <div className="flex items-center justify-center gap-4 py-12 text-[var(--theme-text-muted)]">
            <RefreshCw size={24} className="animate-spin" />
            <span>Loading...</span>
          </div>
        ) : sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--theme-text-muted)]">
            <Layers size={48} className="opacity-30 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">No sections configured</h3>
            <p className="mb-6">Create sections to organize your stock and production.</p>
            <button className="inline-flex items-center gap-2 px-5 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-all hover:brightness-110" onClick={onCreateSection}>
              <Plus size={18} />
              Create a section
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sections.map((section) => {
              const sectionTypeInfo = SECTION_TYPES.find((t) => t.value === section.section_type);
              return (
                <div key={section.id} className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl hover:bg-white/[0.06] transition-all">
                  <div className="w-10 h-10 flex items-center justify-center text-xl bg-black/40 rounded-lg border border-white/5" style={{ color: sectionTypeInfo?.color }}>
                    {section.icon || sectionTypeInfo?.icon || <Layers size={20} />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white m-0 mb-1">{section.name}</h3>
                    <div className="flex gap-1.5 flex-wrap">
                      {section.section_type === 'sales' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <ShoppingCart size={12} /> Point of Sale
                        </span>
                      )}
                      {section.section_type === 'production' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Factory size={12} /> Production
                        </span>
                      )}
                      {section.section_type === 'warehouse' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Warehouse size={12} /> Warehouse
                        </span>
                      )}
                    </div>
                    {section.description && (
                      <p className="text-xs text-[var(--theme-text-muted)] mt-1">{section.description}</p>
                    )}
                  </div>
                  <div className="font-mono text-xs text-[var(--theme-text-muted)] px-3 py-1 bg-black/40 rounded-lg text-center min-w-[100px]">
                    {section.code}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      className="w-9 h-9 flex items-center justify-center bg-black/40 border border-white/10 rounded-lg text-[var(--theme-text-muted)] cursor-pointer transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                      onClick={() => onEditSection(section)}
                      title="Edit"
                      aria-label="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="w-9 h-9 flex items-center justify-center bg-black/40 border border-white/10 rounded-lg text-[var(--theme-text-muted)] cursor-pointer transition-all hover:border-red-500 hover:text-red-400 hover:bg-red-500/5"
                      onClick={() => onDeleteSection(section)}
                      title="Delete"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsSectionsTab;
