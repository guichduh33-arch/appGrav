import { useState, useEffect } from 'react';
import {
    Store, Printer, Bell, Shield, Save, Plus, Settings, RefreshCw, Layers,
    Edit2, Trash2, X, ShoppingCart, Factory, Warehouse, ChefHat, Coffee, Monitor, Grid, Wifi, Sliders, Package
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
import FloorPlanEditor from '@/components/settings/FloorPlanEditor';
import TerminalSettingsSection from '@/components/settings/TerminalSettingsSection';
import POSAdvancedSettingsSection from '@/components/settings/POSAdvancedSettingsSection';
import ModuleSettingsSection from '@/components/settings/ModuleSettingsSection';
import NotificationSettingsSection from '@/components/settings/NotificationSettingsSection';
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

const DISPATCH_STATIONS = [
    { value: 'kitchen', label: 'Hot Kitchen', icon: <ChefHat size={16} />, color: '#EF4444' },
    { value: 'barista', label: 'Barista', icon: <Coffee size={16} />, color: '#8B5CF6' },
    { value: 'display', label: 'Display', icon: <Monitor size={16} />, color: '#10B981' },
    { value: 'none', label: 'No Station', icon: <X size={16} />, color: '#6B7280' }
];

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');

    // Sections & KDS via hooks
    const { data: sections = [], isLoading: loadingSections } = useSettingsSections();
    const { data: kdsCategories = [], isLoading: loadingCategories } = useKdsCategories();
    const saveSectionMutation = useSaveSection();
    const deleteSectionMutation = useDeleteSection();
    const [categories, setCategories] = useState<Category[]>([]);
    const [savingCategory, setSavingCategory] = useState<string | null>(null);

    // Section modal state
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [editingSection, setEditingSection] = useState<ISettingsSection | null>(null);
    const [sectionForm, setSectionForm] = useState({
        name: '',
        code: '',
        description: '',
        section_type: 'production' as TSectionType,
        icon: ''
    });
    const [savingSection, setSavingSection] = useState(false);

    // Section type options for the form
    const SECTION_TYPES = [
        { value: 'warehouse' as const, label: 'Warehouse / Storage', icon: <Warehouse size={20} />, color: '#3B82F6' },
        { value: 'production' as const, label: 'Production', icon: <Factory size={20} />, color: '#10B981' },
        { value: 'sales' as const, label: 'Point of Sale', icon: <ShoppingCart size={20} />, color: '#F59E0B' }
    ];

    const [settings, setSettings] = useState({
        storeName: 'The Breakery',
        storeAddress: 'Jl. Selong, Kuta Utara, Lombok',
        storePhone: '+62 812 3456 7890',
        timezone: 'Asia/Makassar',
        currency: 'IDR',
        autoLogout: true,
    });

    // Sync kdsCategories hook data to local categories state
    useEffect(() => {
        if (kdsCategories.length > 0) {
            setCategories(kdsCategories as Category[]);
        }
    }, [kdsCategories]);

    const updateCategoryStation = async (categoryId: string, newStation: string) => {
        setSavingCategory(categoryId);
        try {
            const result = await saveCategory({
                id: categoryId,
                dispatch_station: newStation as Category['dispatch_station']
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            // Update local state
            setCategories(prev => prev.map(cat =>
                cat.id === categoryId
                    ? { ...cat, dispatch_station: newStation as Category['dispatch_station'] }
                    : cat
            ));
        } catch (error) {
            logError('Error updating category station:', error);
            toast.error('Error updating station');
        } finally {
            setSavingCategory(null);
        }
    };

    const generateCode = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/(^_|_$)/g, '');
    };

    const openCreateModal = () => {
        setEditingSection(null);
        setSectionForm({
            name: '',
            code: '',
            description: '',
            section_type: 'production',
            icon: ''
        });
        setShowSectionModal(true);
    };

    const openEditModal = (section: ISettingsSection) => {
        setEditingSection(section);
        setSectionForm({
            name: section.name,
            code: section.code,
            description: section.description || '',
            section_type: section.section_type || 'production',
            icon: section.icon || ''
        });
        setShowSectionModal(true);
    };

    const handleSectionNameChange = (name: string) => {
        setSectionForm(prev => ({
            ...prev,
            name,
            code: editingSection ? prev.code : generateCode(name)
        }));
    };

    const handleSaveSection = async () => {
        if (!sectionForm.name.trim()) {
            toast.warning('Section name is required');
            return;
        }

        setSavingSection(true);
        try {
            await saveSectionMutation.mutateAsync({
                id: editingSection?.id,
                name: sectionForm.name,
                code: sectionForm.code || generateCode(sectionForm.name),
                description: sectionForm.description || null,
                section_type: sectionForm.section_type,
                icon: sectionForm.icon || null,
            });

            setShowSectionModal(false);
        } catch (error) {
            logError('Error saving section:', error);
            toast.error('Error saving section: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setSavingSection(false);
        }
    };

    const handleDeleteSection = async (section: ISettingsSection) => {
        if (!confirm(`Are you sure you want to delete section "${section.name}"?\n\nThis action is irreversible.`)) {
            return;
        }

        try {
            await deleteSectionMutation.mutateAsync(section.id);
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            if (msg.startsWith('PRODUCTS_LINKED:')) {
                const count = msg.split(':')[1];
                toast.error(`Cannot delete "${section.name}". ${count} product(s) linked. Reassign them first.`);
            } else if (msg.startsWith('STOCK_LINKED:')) {
                const count = msg.split(':')[1];
                toast.error(`Cannot delete "${section.name}". ${count} stock record(s) exist. Clear stock first.`);
            } else {
                logError('Error deleting section:', error);
                toast.error('Error deleting section: ' + msg);
            }
        }
    };

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const printers = [
        { id: 1, name: 'Imprimante Caisse', type: 'Receipt', status: 'connected', ip: '192.168.1.100' },
        { id: 2, name: 'Imprimante Cuisine', type: 'Kitchen', status: 'connected', ip: '192.168.1.101' },
        { id: 3, name: 'Imprimante Barista', type: 'Kitchen', status: 'disconnected', ip: '192.168.1.102' },
    ];

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

    return (
        <div className="settings-page">
            <header className="settings-page__header">
                <h1 className="settings-page__title">Settings</h1>
            </header>

            <div className="settings-grid">
                {/* Navigation */}
                <nav className="settings-nav">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`settings-nav__item ${activeTab === tab.id ? 'is-active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="settings-nav__icon">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Content */}
                <div className="settings-content">
                    {activeTab === 'general' && (
                        <div className="settings-section">
                            <div className="settings-section__header">
                                <h2 className="settings-section__title">Store Information</h2>
                                <p className="settings-section__description">
                                    General settings for your establishment
                                </p>
                            </div>
                            <div className="settings-section__body">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="store-name">Store Name</label>
                                    <input
                                        id="store-name"
                                        type="text"
                                        className="form-input"
                                        value={settings.storeName}
                                        onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="store-address">Address</label>
                                    <input
                                        id="store-address"
                                        type="text"
                                        className="form-input"
                                        value={settings.storeAddress}
                                        onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="store-phone">Phone</label>
                                        <input
                                            id="store-phone"
                                            type="tel"
                                            className="form-input"
                                            value={settings.storePhone}
                                            onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="store-timezone">Timezone</label>
                                        <select
                                            id="store-timezone"
                                            className="form-input form-select"
                                            value={settings.timezone}
                                            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                            aria-label="Timezone"
                                        >
                                            <option value="Asia/Jakarta">Jakarta (WIB)</option>
                                            <option value="Asia/Makassar">Makassar (WITA)</option>
                                            <option value="Asia/Jayapura">Jayapura (WIT)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-footer">
                                    <button className="btn-secondary">Cancel</button>
                                    <button className="btn-primary">
                                        <Save size={18} />
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'terminal' && (
                        <TerminalSettingsSection />
                    )}

                    {activeTab === 'pos_advanced' && (
                        <POSAdvancedSettingsSection />
                    )}

                    {activeTab === 'modules' && (
                        <ModuleSettingsSection />
                    )}

                    {activeTab === 'sections' && (
                        <div className="settings-section">
                            <div className="settings-section__header">
                                <div className="settings-section__header-content">
                                    <div>
                                        <h2 className="settings-section__title">Establishment Sections</h2>
                                        <p className="settings-section__description">
                                            Manage the different sections of your establishment (kitchen, bar, warehouse, etc.)
                                        </p>
                                    </div>
                                    <button className="btn-primary" onClick={openCreateModal}>
                                        <Plus size={18} />
                                        New Section
                                    </button>
                                </div>
                            </div>
                            <div className="settings-section__body">
                                {loadingSections ? (
                                    <div className="sections-loading">
                                        <RefreshCw size={24} className="spinning" />
                                        <span>Loading...</span>
                                    </div>
                                ) : sections.length === 0 ? (
                                    <div className="sections-empty">
                                        <Layers size={48} />
                                        <h3>No sections configured</h3>
                                        <p>Create sections to organize your stock and production.</p>
                                        <button className="btn-primary" onClick={openCreateModal}>
                                            <Plus size={18} />
                                            Create a section
                                        </button>
                                    </div>
                                ) : (
                                    <div className="sections-list">
                                        {sections.map(section => {
                                            const sectionTypeInfo = SECTION_TYPES.find(t => t.value === section.section_type);
                                            return (
                                                <div key={section.id} className="section-item">
                                                    <div className="section-item__icon-wrapper" style={{ color: sectionTypeInfo?.color }}>
                                                        {section.icon || sectionTypeInfo?.icon || <Layers size={20} />}
                                                    </div>
                                                    <div className="section-item__info">
                                                        <h3 className="section-item__name">{section.name}</h3>
                                                        <div className="section-item__badges">
                                                            {section.section_type === 'sales' && (
                                                                <span className="section-badge section-badge--sales">
                                                                    <ShoppingCart size={12} />
                                                                    Point of Sale
                                                                </span>
                                                            )}
                                                            {section.section_type === 'production' && (
                                                                <span className="section-badge section-badge--production">
                                                                    <Factory size={12} />
                                                                    Production
                                                                </span>
                                                            )}
                                                            {section.section_type === 'warehouse' && (
                                                                <span className="section-badge section-badge--warehouse">
                                                                    <Warehouse size={12} />
                                                                    Warehouse
                                                                </span>
                                                            )}
                                                        </div>
                                                        {section.description && (
                                                            <p className="section-item__description">{section.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="section-item__code">
                                                        {section.code}
                                                    </div>
                                                    <div className="section-item__actions">
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() => openEditModal(section)}
                                                            title="Edit"
                                                            aria-label="Edit"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            className="btn-icon btn-icon--danger"
                                                            onClick={() => handleDeleteSection(section)}
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
                    )}

                    {activeTab === 'kds' && (
                        <div className="settings-section">
                            <div className="settings-section__header">
                                <div className="settings-section__header-content">
                                    <div>
                                        <h2 className="settings-section__title">KDS Station Configuration</h2>
                                        <p className="settings-section__description">
                                            Assign each product category to a specific KDS station
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="settings-section__body">
                                {/* Station Legend */}
                                <div className="kds-stations-legend">
                                    {DISPATCH_STATIONS.map(station => (
                                        <div key={station.value} className="kds-station-legend-item">
                                            <span
                                                className="kds-station-dot"
                                                style={{ backgroundColor: station.color }}
                                            />
                                            <span className="kds-station-icon" style={{ color: station.color }}>
                                                {station.icon}
                                            </span>
                                            <span>{station.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {loadingCategories ? (
                                    <div className="sections-loading">
                                        <RefreshCw size={24} className="spinning" />
                                        <span>Loading categories...</span>
                                    </div>
                                ) : categories.length === 0 ? (
                                    <div className="sections-empty">
                                        <ChefHat size={48} />
                                        <h3>No categories found</h3>
                                        <p>Product categories will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="kds-categories-list">
                                        {categories.map(category => {
                                            const currentStation = DISPATCH_STATIONS.find(
                                                s => s.value === (category.dispatch_station || 'none')
                                            );
                                            return (
                                                <div key={category.id} className="kds-category-item">
                                                    <div className="kds-category-item__info">
                                                        <span className="kds-category-item__icon">{category.icon}</span>
                                                        <span className="kds-category-item__name">{category.name}</span>
                                                    </div>
                                                    <div className="kds-category-item__station">
                                                        <select
                                                            className="kds-station-select"
                                                            value={category.dispatch_station || 'none'}
                                                            onChange={(e) => updateCategoryStation(category.id, e.target.value)}
                                                            aria-label={`Station pour ${category.name}`}
                                                            disabled={savingCategory === category.id}
                                                            style={{
                                                                borderColor: currentStation?.color,
                                                                backgroundColor: `${currentStation?.color}15`
                                                            }}
                                                        >
                                                            {DISPATCH_STATIONS.map(station => (
                                                                <option key={station.value} value={station.value}>
                                                                    {station.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {savingCategory === category.id && (
                                                            <RefreshCw size={16} className="spinning kds-saving-icon" />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'printers' && (
                        <div className="settings-section">
                            <div className="settings-section__header">
                                <h2 className="settings-section__title">Printers</h2>
                                <p className="settings-section__description">
                                    Manage your receipt and kitchen printers
                                </p>
                            </div>
                            <div className="settings-section__body">
                                <div className="printer-list">
                                    {printers.map(printer => (
                                        <div key={printer.id} className="printer-item">
                                            <div className="printer-item__icon">🖨️</div>
                                            <div className="printer-item__info">
                                                <div className="printer-item__name">{printer.name}</div>
                                                <div className="printer-item__status">
                                                    <span className={`status-dot ${printer.status}`} />
                                                    {printer.status === 'connected' ? 'Connected' : 'Disconnected'}
                                                    <span className="printer-ip">
                                                        • {printer.ip}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="printer-item__actions">
                                                <button className="btn-secondary">
                                                    <RefreshCw size={16} />
                                                    Test
                                                </button>
                                                <button className="btn-secondary" title="Settings" aria-label="Printer settings">
                                                    <Settings size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="form-footer">
                                    <button className="btn-primary">
                                        <Plus size={18} />
                                        Add Printer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <NotificationSettingsSection />
                    )}

                    {activeTab === 'floorplan' && (
                        <div className="settings-section">
                            <div className="settings-section__header">
                                <h2 className="settings-section__title">Floor Plan</h2>
                                <p className="settings-section__description">
                                    Configure the floor plan for Dine In orders
                                </p>
                            </div>
                            <div className="settings-section__body">
                                <FloorPlanEditor />
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="settings-section">
                            <div className="settings-section__header">
                                <h2 className="settings-section__title">Security</h2>
                                <p className="settings-section__description">
                                    Security options and access control
                                </p>
                            </div>
                            <div className="settings-section__body">
                                <div className="toggle-group">
                                    <div className="toggle-group__info">
                                        <span className="toggle-group__label">Auto Logout</span>
                                        <span className="toggle-group__description">
                                            Disconnect after 30 minutes of inactivity
                                        </span>
                                    </div>
                                    <div
                                        className={`toggle-switch ${settings.autoLogout ? 'is-on' : ''}`}
                                        onClick={() => toggleSetting('autoLogout')}
                                    />
                                </div>

                                <div className="form-group form-group--mt-lg">
                                    <label className="form-label" htmlFor="manager-pin">Manager PIN Code</label>
                                    <input
                                        id="manager-pin"
                                        type="password"
                                        className="form-input form-input--narrow"
                                        placeholder="••••"
                                    />
                                </div>

                                <div className="form-footer">
                                    <button className="btn-primary">
                                        <Save size={18} />
                                        Change PIN
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Section Modal */}
            {showSectionModal && (
                <div className="section-modal-overlay" onClick={() => setShowSectionModal(false)}>
                    <div className="section-modal" onClick={e => e.stopPropagation()}>
                        <div className="section-modal__header">
                            <div className="section-modal__header-icon">
                                <Layers size={24} />
                            </div>
                            <div>
                                <h2 className="section-modal__title">
                                    {editingSection ? 'Edit Section' : 'New Section'}
                                </h2>
                                <p className="section-modal__subtitle">
                                    {editingSection ? 'Edit section information' : 'Create a new section to organize your stock'}
                                </p>
                            </div>
                            <button className="section-modal__close" onClick={() => setShowSectionModal(false)} aria-label="Close">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="section-modal__content">
                            <div className="section-form__group">
                                <label className="section-form__label">
                                    Section Name *
                                </label>
                                <input
                                    type="text"
                                    className="section-form__input"
                                    value={sectionForm.name}
                                    onChange={(e) => handleSectionNameChange(e.target.value)}
                                    placeholder="e.g. Kitchen, Bar, Warehouse..."
                                    autoFocus
                                    aria-label="Section name"
                                />
                            </div>

                            <div className="section-form__row">
                                <div className="section-form__group">
                                    <label className="section-form__label">
                                        Code
                                    </label>
                                    <input
                                        type="text"
                                        className="section-form__input section-form__input--mono"
                                        value={sectionForm.code}
                                        onChange={(e) => setSectionForm({ ...sectionForm, code: e.target.value })}
                                        placeholder="kitchen"
                                        aria-label="Section code"
                                    />
                                    <p className="section-form__hint">
                                        Unique identifier. Auto-generated.
                                    </p>
                                </div>
                                <div className="section-form__group">
                                    <label className="section-form__label">
                                        Icon (emoji)
                                    </label>
                                    <input
                                        type="text"
                                        className="section-form__input section-form__input--icon"
                                        value={sectionForm.icon}
                                        onChange={(e) => setSectionForm({ ...sectionForm, icon: e.target.value })}
                                        placeholder="🍳"
                                        maxLength={4}
                                        aria-label="Section icon"
                                    />
                                </div>
                            </div>

                            <div className="section-form__group">
                                <label className="section-form__label">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    className="section-form__input"
                                    value={sectionForm.description}
                                    onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                                    placeholder="Section description..."
                                    aria-label="Section description"
                                />
                            </div>

                            <div className="section-form__group">
                                <label className="section-form__label">Section Type *</label>
                                <div className="section-form__types">
                                    {SECTION_TYPES.map(type => (
                                        <label
                                            key={type.value}
                                            className={`section-type-card ${sectionForm.section_type === type.value ? 'is-selected' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="section_type"
                                                value={type.value}
                                                checked={sectionForm.section_type === type.value}
                                                onChange={() => setSectionForm({ ...sectionForm, section_type: type.value })}
                                            />
                                            <div
                                                className={`section-type-card__icon section-type-card__icon--${type.value}`}
                                            >
                                                {type.icon}
                                            </div>
                                            <div className="section-type-card__content">
                                                <span className="section-type-card__title">{type.label}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="section-modal__footer">
                            <button className="btn-secondary" onClick={() => setShowSectionModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleSaveSection}
                                disabled={savingSection || !sectionForm.name.trim()}
                            >
                                <Save size={18} />
                                {savingSection ? 'Saving...' : (editingSection ? 'Update' : 'Create')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;

import { logError } from '@/utils/logger'