import { useState } from 'react';
import { Store, Printer, Bell, Shield, Save, Plus, Settings, RefreshCw } from 'lucide-react';
import './SettingsPage.css';

type SettingsTab = 'general' | 'printers' | 'notifications' | 'security';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
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
        </div>
    );
};

export default SettingsPage;
