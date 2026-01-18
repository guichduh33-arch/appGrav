import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Store, Printer, Bell, Shield, Save, Plus, Settings, RefreshCw, Layers,
    Edit2, Trash2, X, ShoppingCart, Factory, Warehouse
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './SettingsPage.css';

type SettingsTab = 'general' | 'printers' | 'notifications' | 'security' | 'sections';

interface Section {
    id: string;
    name: string;
    slug: string;
    is_sales_point: boolean;
    is_production_point: boolean;
    is_warehouse: boolean;
    created_at: string;
}

const SettingsPage = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [sections, setSections] = useState<Section[]>([]);
    const [loadingSections, setLoadingSections] = useState(false);

    // Section modal state
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [sectionForm, setSectionForm] = useState({
        name: '',
        slug: '',
        is_sales_point: false,
        is_production_point: false,
        is_warehouse: false
    });
    const [savingSection, setSavingSection] = useState(false);

    const [settings, setSettings] = useState({
        storeName: 'The Breakery',
        storeAddress: 'Jl. Selong, Kuta Utara, Lombok',
        storePhone: '+62 812 3456 7890',
        timezone: 'Asia/Makassar',
        currency: 'IDR',
        autoLogout: true,
        printReceipt: true,
        printKitchenTicket: true,
        soundNotifications: true,
        emailReports: false,
    });

    useEffect(() => {
        if (activeTab === 'sections') {
            fetchSections();
        }
    }, [activeTab]);

    const fetchSections = async () => {
        setLoadingSections(true);
        try {
            const { data, error } = await supabase
                .from('sections')
                .select('*')
                .order('name');
            if (error) throw error;
            if (data) setSections(data);
        } catch (error) {
            console.error('Error fetching sections:', error);
        } finally {
            setLoadingSections(false);
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const openCreateModal = () => {
        setEditingSection(null);
        setSectionForm({
            name: '',
            slug: '',
            is_sales_point: false,
            is_production_point: false,
            is_warehouse: false
        });
        setShowSectionModal(true);
    };

    const openEditModal = (section: Section) => {
        setEditingSection(section);
        setSectionForm({
            name: section.name,
            slug: section.slug,
            is_sales_point: section.is_sales_point,
            is_production_point: section.is_production_point,
            is_warehouse: section.is_warehouse
        });
        setShowSectionModal(true);
    };

    const handleSectionNameChange = (name: string) => {
        setSectionForm(prev => ({
            ...prev,
            name,
            slug: editingSection ? prev.slug : generateSlug(name)
        }));
    };

    const handleSaveSection = async () => {
        if (!sectionForm.name.trim()) {
            alert('Le nom de la section est requis');
            return;
        }

        setSavingSection(true);
        try {
            const sectionData = {
                name: sectionForm.name,
                slug: sectionForm.slug || generateSlug(sectionForm.name),
                is_sales_point: sectionForm.is_sales_point,
                is_production_point: sectionForm.is_production_point,
                is_warehouse: sectionForm.is_warehouse
            };

            if (editingSection) {
                const { error } = await supabase
                    .from('sections')
                    .update(sectionData)
                    .eq('id', editingSection.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('sections')
                    .insert(sectionData);

                if (error) throw error;
            }

            setShowSectionModal(false);
            fetchSections();
        } catch (error: any) {
            console.error('Error saving section:', error);
            alert('Erreur lors de la sauvegarde: ' + error.message);
        } finally {
            setSavingSection(false);
        }
    };

    const handleDeleteSection = async (section: Section) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer la section "${section.name}" ?\n\nCette action est irréversible et peut affecter les produits liés à cette section.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('sections')
                .delete()
                .eq('id', section.id);

            if (error) throw error;
            fetchSections();
        } catch (error: any) {
            console.error('Error deleting section:', error);
            alert('Erreur lors de la suppression: ' + error.message);
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
        { id: 'general' as const, label: 'Général', icon: <Store size={18} /> },
        { id: 'sections' as const, label: 'Sections', icon: <Layers size={18} /> },
        { id: 'printers' as const, label: 'Imprimantes', icon: <Printer size={18} /> },
        { id: 'notifications' as const, label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'security' as const, label: 'Sécurité', icon: <Shield size={18} /> },
    ];

    return (
        <div className="settings-page">
            <header className="settings-page__header">
                <h1 className="settings-page__title">Paramètres</h1>
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
                                <h2 className="settings-section__title">Informations du magasin</h2>
                                <p className="settings-section__description">
                                    Paramètres généraux de votre établissement
                                </p>
                            </div>
                            <div className="settings-section__body">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="store-name">Nom du magasin</label>
                                    <input
                                        id="store-name"
                                        type="text"
                                        className="form-input"
                                        value={settings.storeName}
                                        onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="store-address">Adresse</label>
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
                                        <label className="form-label" htmlFor="store-phone">Téléphone</label>
                                        <input
                                            id="store-phone"
                                            type="tel"
                                            className="form-input"
                                            value={settings.storePhone}
                                            onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="store-timezone">Fuseau horaire</label>
                                        <select
                                            id="store-timezone"
                                            className="form-input form-select"
                                            value={settings.timezone}
                                            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                            aria-label="Fuseau horaire"
                                        >
                                            <option value="Asia/Jakarta">Jakarta (WIB)</option>
                                            <option value="Asia/Makassar">Makassar (WITA)</option>
                                            <option value="Asia/Jayapura">Jayapura (WIT)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-footer">
                                    <button className="btn-secondary">Annuler</button>
                                    <button className="btn-primary">
                                        <Save size={18} />
                                        Enregistrer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sections' && (
                        <div className="settings-section">
                            <div className="settings-section__header">
                                <div className="settings-section__header-content">
                                    <div>
                                        <h2 className="settings-section__title">Sections de l'Établissement</h2>
                                        <p className="settings-section__description">
                                            Gérez les différentes sections de votre établissement (cuisine, bar, entrepôt, etc.)
                                        </p>
                                    </div>
                                    <button className="btn-primary" onClick={openCreateModal}>
                                        <Plus size={18} />
                                        Nouvelle Section
                                    </button>
                                </div>
                            </div>
                            <div className="settings-section__body">
                                {loadingSections ? (
                                    <div className="sections-loading">
                                        <RefreshCw size={24} className="spinning" />
                                        <span>Chargement...</span>
                                    </div>
                                ) : sections.length === 0 ? (
                                    <div className="sections-empty">
                                        <Layers size={48} />
                                        <h3>Aucune section configurée</h3>
                                        <p>Créez des sections pour organiser vos stocks et la production.</p>
                                        <button className="btn-primary" onClick={openCreateModal}>
                                            <Plus size={18} />
                                            Créer une section
                                        </button>
                                    </div>
                                ) : (
                                    <div className="sections-list">
                                        {sections.map(section => (
                                            <div key={section.id} className="section-item">
                                                <div className="section-item__info">
                                                    <h3 className="section-item__name">{section.name}</h3>
                                                    <div className="section-item__badges">
                                                        {section.is_sales_point && (
                                                            <span className="section-badge section-badge--sales">
                                                                <ShoppingCart size={12} />
                                                                Point de Vente
                                                            </span>
                                                        )}
                                                        {section.is_production_point && (
                                                            <span className="section-badge section-badge--production">
                                                                <Factory size={12} />
                                                                Production
                                                            </span>
                                                        )}
                                                        {section.is_warehouse && (
                                                            <span className="section-badge section-badge--warehouse">
                                                                <Warehouse size={12} />
                                                                Entrepôt
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="section-item__slug">
                                                    {section.slug}
                                                </div>
                                                <div className="section-item__actions">
                                                    <button
                                                        className="btn-icon"
                                                        onClick={() => openEditModal(section)}
                                                        title="Modifier"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-icon--danger"
                                                        onClick={() => handleDeleteSection(section)}
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'printers' && (
                        <div className="settings-section">
                            <div className="settings-section__header">
                                <h2 className="settings-section__title">Imprimantes</h2>
                                <p className="settings-section__description">
                                    Gérez vos imprimantes de tickets et cuisine
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
                                                    {printer.status === 'connected' ? 'Connecté' : 'Déconnecté'}
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
                                                <button className="btn-secondary" title="Paramètres" aria-label="Paramètres imprimante">
                                                    <Settings size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="form-footer">
                                    <button className="btn-primary">
                                        <Plus size={18} />
                                        Ajouter imprimante
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <div className="settings-section__header">
                                <h2 className="settings-section__title">Notifications</h2>
                                <p className="settings-section__description">
                                    Configurez vos préférences de notification
                                </p>
                            </div>
                            <div className="settings-section__body">
                                <div className="toggle-group">
                                    <div className="toggle-group__info">
                                        <span className="toggle-group__label">Sons de notification</span>
                                        <span className="toggle-group__description">
                                            Jouer un son lors de nouvelles commandes
                                        </span>
                                    </div>
                                    <div
                                        className={`toggle-switch ${settings.soundNotifications ? 'is-on' : ''}`}
                                        onClick={() => toggleSetting('soundNotifications')}
                                    />
                                </div>

                                <div className="toggle-group">
                                    <div className="toggle-group__info">
                                        <span className="toggle-group__label">Imprimer ticket automatiquement</span>
                                        <span className="toggle-group__description">
                                            Impression automatique après paiement
                                        </span>
                                    </div>
                                    <div
                                        className={`toggle-switch ${settings.printReceipt ? 'is-on' : ''}`}
                                        onClick={() => toggleSetting('printReceipt')}
                                    />
                                </div>

                                <div className="toggle-group">
                                    <div className="toggle-group__info">
                                        <span className="toggle-group__label">Ticket cuisine</span>
                                        <span className="toggle-group__description">
                                            Imprimer automatiquement en cuisine
                                        </span>
                                    </div>
                                    <div
                                        className={`toggle-switch ${settings.printKitchenTicket ? 'is-on' : ''}`}
                                        onClick={() => toggleSetting('printKitchenTicket')}
                                    />
                                </div>

                                <div className="toggle-group">
                                    <div className="toggle-group__info">
                                        <span className="toggle-group__label">Rapports par email</span>
                                        <span className="toggle-group__description">
                                            Recevoir le rapport journalier par email
                                        </span>
                                    </div>
                                    <div
                                        className={`toggle-switch ${settings.emailReports ? 'is-on' : ''}`}
                                        onClick={() => toggleSetting('emailReports')}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="settings-section">
                            <div className="settings-section__header">
                                <h2 className="settings-section__title">Sécurité</h2>
                                <p className="settings-section__description">
                                    Options de sécurité et contrôle d'accès
                                </p>
                            </div>
                            <div className="settings-section__body">
                                <div className="toggle-group">
                                    <div className="toggle-group__info">
                                        <span className="toggle-group__label">Déconnexion automatique</span>
                                        <span className="toggle-group__description">
                                            Déconnecter après 30 minutes d'inactivité
                                        </span>
                                    </div>
                                    <div
                                        className={`toggle-switch ${settings.autoLogout ? 'is-on' : ''}`}
                                        onClick={() => toggleSetting('autoLogout')}
                                    />
                                </div>

                                <div className="form-group form-group--mt-lg">
                                    <label className="form-label" htmlFor="manager-pin">Code PIN Manager</label>
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
                                        Modifier PIN
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Section Modal */}
            {showSectionModal && (
                <div
                    className="section-modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}
                    onClick={() => setShowSectionModal(false)}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            width: '100%',
                            maxWidth: '500px',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '24px',
                            borderBottom: '1px solid #e5e7eb'
                        }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
                                {editingSection ? 'Modifier la Section' : 'Nouvelle Section'}
                            </h2>
                            <button
                                onClick={() => setShowSectionModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '8px'
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                                    Nom de la section *
                                </label>
                                <input
                                    type="text"
                                    value={sectionForm.name}
                                    onChange={(e) => handleSectionNameChange(e.target.value)}
                                    placeholder="Ex: Cuisine, Bar, Entrepôt..."
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        height: '48px',
                                        padding: '0 16px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                                    Identifiant (slug)
                                </label>
                                <input
                                    type="text"
                                    value={sectionForm.slug}
                                    onChange={(e) => setSectionForm({ ...sectionForm, slug: e.target.value })}
                                    placeholder="cuisine"
                                    style={{
                                        width: '100%',
                                        height: '48px',
                                        padding: '0 16px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontFamily: 'monospace',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                    Identifiant unique utilisé en interne.
                                </p>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>
                                    Type de section
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                        padding: '16px',
                                        border: sectionForm.is_sales_point ? '2px solid #BA90A2' : '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        backgroundColor: sectionForm.is_sales_point ? 'rgba(186, 144, 162, 0.05)' : 'white'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={sectionForm.is_sales_point}
                                            onChange={(e) => setSectionForm({ ...sectionForm, is_sales_point: e.target.checked })}
                                            style={{ marginTop: '2px', width: '18px', height: '18px' }}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                            <ShoppingCart size={20} style={{ color: '#059669', flexShrink: 0 }} />
                                            <div>
                                                <span style={{ display: 'block', fontWeight: 500 }}>Point de Vente</span>
                                                <span style={{ display: 'block', fontSize: '12px', color: '#6b7280' }}>
                                                    Cette section peut vendre des produits
                                                </span>
                                            </div>
                                        </div>
                                    </label>

                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                        padding: '16px',
                                        border: sectionForm.is_production_point ? '2px solid #BA90A2' : '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        backgroundColor: sectionForm.is_production_point ? 'rgba(186, 144, 162, 0.05)' : 'white'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={sectionForm.is_production_point}
                                            onChange={(e) => setSectionForm({ ...sectionForm, is_production_point: e.target.checked })}
                                            style={{ marginTop: '2px', width: '18px', height: '18px' }}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                            <Factory size={20} style={{ color: '#D97706', flexShrink: 0 }} />
                                            <div>
                                                <span style={{ display: 'block', fontWeight: 500 }}>Point de Production</span>
                                                <span style={{ display: 'block', fontSize: '12px', color: '#6b7280' }}>
                                                    Cette section fabrique ou prépare des produits
                                                </span>
                                            </div>
                                        </div>
                                    </label>

                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                        padding: '16px',
                                        border: sectionForm.is_warehouse ? '2px solid #BA90A2' : '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        backgroundColor: sectionForm.is_warehouse ? 'rgba(186, 144, 162, 0.05)' : 'white'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={sectionForm.is_warehouse}
                                            onChange={(e) => setSectionForm({ ...sectionForm, is_warehouse: e.target.checked })}
                                            style={{ marginTop: '2px', width: '18px', height: '18px' }}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                            <Warehouse size={20} style={{ color: '#2563EB', flexShrink: 0 }} />
                                            <div>
                                                <span style={{ display: 'block', fontWeight: 500 }}>Entrepôt / Stockage</span>
                                                <span style={{ display: 'block', fontSize: '12px', color: '#6b7280' }}>
                                                    Cette section sert au stockage de marchandises
                                                </span>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            padding: '24px',
                            borderTop: '1px solid #e5e7eb'
                        }}>
                            <button
                                onClick={() => setShowSectionModal(false)}
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSaveSection}
                                disabled={savingSection || !sectionForm.name.trim()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: '#BA90A2',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    opacity: (savingSection || !sectionForm.name.trim()) ? 0.5 : 1
                                }}
                            >
                                <Save size={18} />
                                {savingSection ? 'Enregistrement...' : (editingSection ? 'Mettre à jour' : 'Créer')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
