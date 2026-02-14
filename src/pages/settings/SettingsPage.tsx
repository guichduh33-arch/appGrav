import { useState, useEffect } from 'react';
import {
    Store, Printer, Bell, Shield, Wifi, Sliders, Package,
    Layers, ChefHat, Grid,
} from 'lucide-react';
import { saveCategory } from '@/services/products/catalogSyncService';
import {
    useSettingsSections,
    useSaveSection,
    useDeleteSection,
    useKdsCategories,
    type ISettingsSection,
} from '@/hooks/settings/useSections';
import { toast } from 'sonner';
import { logError } from '@/utils/logger';
import FloorPlanEditor from '@/components/settings/FloorPlanEditor';
import TerminalSettingsSection from '@/components/settings/TerminalSettingsSection';
import POSAdvancedSettingsSection from '@/components/settings/POSAdvancedSettingsSection';
import ModuleSettingsSection from '@/components/settings/ModuleSettingsSection';
import NotificationSettingsSection from '@/components/settings/NotificationSettingsSection';
import SettingsGeneralTab from '@/components/settings/SettingsGeneralTab';
import SettingsSectionsTab from '@/components/settings/SettingsSectionsTab';
import SettingsKdsTab from '@/components/settings/SettingsKdsTab';
import SettingsPrintersTab from '@/components/settings/SettingsPrintersTab';
import SettingsSecurityTab from '@/components/settings/SettingsSecurityTab';
import SectionModal from '@/components/settings/SectionModal';
import { cn } from '@/lib/utils';
import './SettingsPage.css';

type SettingsTab = 'general' | 'terminal' | 'pos_advanced' | 'modules' | 'printers' | 'notifications' | 'security' | 'sections' | 'kds' | 'floorplan';
type TSectionType = 'warehouse' | 'production' | 'sales';

interface Category {
    id: string;
    name: string;
    icon: string;
    dispatch_station: 'barista' | 'kitchen' | 'display' | 'none' | null;
    is_active: boolean;
}

const tabs = [
    { id: 'general' as const, label: 'General', icon: <Store size={18} /> },
    { id: 'terminal' as const, label: 'POS Terminal', icon: <Wifi size={18} /> },
    { id: 'pos_advanced' as const, label: 'POS Advanced', icon: <Sliders size={18} /> },
    { id: 'modules' as const, label: 'Modules', icon: <Package size={18} /> },
    { id: 'sections' as const, label: 'Sections', icon: <Layers size={18} /> },
    { id: 'floorplan' as const, label: 'Floor Plan', icon: <Grid size={18} /> },
    { id: 'kds' as const, label: 'KDS Stations', icon: <ChefHat size={18} /> },
    { id: 'printers' as const, label: 'Printers', icon: <Printer size={18} /> },
    { id: 'notifications' as const, label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security' as const, label: 'Security', icon: <Shield size={18} /> },
];

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const { data: sections = [], isLoading: loadingSections } = useSettingsSections();
    const { data: kdsCategories = [], isLoading: loadingCategories } = useKdsCategories();
    const saveSectionMutation = useSaveSection();
    const deleteSectionMutation = useDeleteSection();
    const [categories, setCategories] = useState<Category[]>([]);
    const [savingCategory, setSavingCategory] = useState<string | null>(null);
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [editingSection, setEditingSection] = useState<ISettingsSection | null>(null);
    const [sectionForm, setSectionForm] = useState({
        name: '', code: '', description: '', section_type: 'production' as TSectionType, icon: '',
    });
    const [savingSection, setSavingSection] = useState(false);
    const [settings, setSettings] = useState({
        storeName: 'The Breakery', storeAddress: 'Jl. Selong, Kuta Utara, Lombok',
        storePhone: '+62 812 3456 7890', timezone: 'Asia/Makassar', currency: 'IDR', autoLogout: true,
    });

    useEffect(() => {
        if (kdsCategories.length > 0) setCategories(kdsCategories as Category[]);
    }, [kdsCategories]);

    const updateCategoryStation = async (categoryId: string, newStation: string) => {
        setSavingCategory(categoryId);
        try {
            const result = await saveCategory({ id: categoryId, dispatch_station: newStation as Category['dispatch_station'] });
            if (!result.success) throw new Error(result.error);
            setCategories((prev) => prev.map((cat) => cat.id === categoryId ? { ...cat, dispatch_station: newStation as Category['dispatch_station'] } : cat));
        } catch (error) {
            logError('Error updating category station:', error);
            toast.error('Error updating station');
        } finally {
            setSavingCategory(null);
        }
    };

    const generateCode = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');

    const openCreateModal = () => {
        setEditingSection(null);
        setSectionForm({ name: '', code: '', description: '', section_type: 'production', icon: '' });
        setShowSectionModal(true);
    };

    const openEditModal = (section: ISettingsSection) => {
        setEditingSection(section);
        setSectionForm({ name: section.name, code: section.code, description: section.description || '', section_type: section.section_type || 'production', icon: section.icon || '' });
        setShowSectionModal(true);
    };

    const handleSectionNameChange = (name: string) => {
        setSectionForm((prev) => ({ ...prev, name, code: editingSection ? prev.code : generateCode(name) }));
    };

    const handleSaveSection = async () => {
        if (!sectionForm.name.trim()) { toast.warning('Section name is required'); return; }
        setSavingSection(true);
        try {
            await saveSectionMutation.mutateAsync({ id: editingSection?.id, name: sectionForm.name, code: sectionForm.code || generateCode(sectionForm.name), description: sectionForm.description || null, section_type: sectionForm.section_type, icon: sectionForm.icon || null });
            setShowSectionModal(false);
        } catch (error) {
            logError('Error saving section:', error);
            toast.error('Error saving section: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setSavingSection(false);
        }
    };

    const handleDeleteSection = async (section: ISettingsSection) => {
        if (!confirm(`Are you sure you want to delete section "${section.name}"?\n\nThis action is irreversible.`)) return;
        try {
            await deleteSectionMutation.mutateAsync(section.id);
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            if (msg.startsWith('PRODUCTS_LINKED:')) { toast.error(`Cannot delete "${section.name}". ${msg.split(':')[1]} product(s) linked. Reassign them first.`); }
            else if (msg.startsWith('STOCK_LINKED:')) { toast.error(`Cannot delete "${section.name}". ${msg.split(':')[1]} stock record(s) exist. Clear stock first.`); }
            else { logError('Error deleting section:', error); toast.error('Error deleting section: ' + msg); }
        }
    };

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white">
            <div className="grid grid-cols-[250px_1fr] gap-6 max-[900px]:grid-cols-1">
                {/* Navigation */}
                <nav className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-2 h-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 bg-transparent border-none rounded-lg text-sm font-medium text-[var(--theme-text-secondary)] cursor-pointer text-left transition-all duration-150 hover:bg-white/5 hover:text-white',
                                activeTab === tab.id && 'bg-[var(--color-gold)]/10 !text-[var(--color-gold)] border-r-2 border-[var(--color-gold)]'
                            )}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="w-5 h-5 flex items-center justify-center">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Content */}
                <div className="flex flex-col gap-6">
                    {activeTab === 'general' && <SettingsGeneralTab settings={settings} onSettingsChange={setSettings} />}
                    {activeTab === 'terminal' && <TerminalSettingsSection />}
                    {activeTab === 'pos_advanced' && <POSAdvancedSettingsSection />}
                    {activeTab === 'modules' && <ModuleSettingsSection />}
                    {activeTab === 'sections' && <SettingsSectionsTab sections={sections} loadingSections={loadingSections} onCreateSection={openCreateModal} onEditSection={openEditModal} onDeleteSection={handleDeleteSection} />}
                    {activeTab === 'kds' && <SettingsKdsTab categories={categories} loadingCategories={loadingCategories} savingCategory={savingCategory} onUpdateCategoryStation={updateCategoryStation} />}
                    {activeTab === 'printers' && <SettingsPrintersTab />}
                    {activeTab === 'notifications' && <NotificationSettingsSection />}
                    {activeTab === 'floorplan' && (
                        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-white/5">
                                <h2 className="text-lg font-display font-bold text-white mb-1">Floor Plan</h2>
                                <p className="text-sm text-[var(--theme-text-muted)]">Configure the floor plan for Dine In orders</p>
                            </div>
                            <div className="p-6"><FloorPlanEditor /></div>
                        </div>
                    )}
                    {activeTab === 'security' && <SettingsSecurityTab autoLogout={settings.autoLogout} onToggleAutoLogout={() => setSettings((prev) => ({ ...prev, autoLogout: !prev.autoLogout }))} />}
                </div>
            </div>

            <SectionModal
                isOpen={showSectionModal}
                editingSection={editingSection}
                sectionForm={sectionForm}
                savingSection={savingSection}
                onClose={() => setShowSectionModal(false)}
                onSectionNameChange={handleSectionNameChange}
                onFormChange={setSectionForm}
                onSave={handleSaveSection}
            />
        </div>
    );
};

export default SettingsPage;
