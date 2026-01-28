import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { History, User, Clock, ArrowRight, Search } from 'lucide-react';
import { useSettingsHistory } from '../../hooks/settings';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, id } from 'date-fns/locale';

const LOCALES = { fr, en: enUS, id };

const SettingsHistoryPage = () => {
  const { i18n } = useTranslation();
  const { data: history, isLoading } = useSettingsHistory();
  const [searchQuery, setSearchQuery] = useState('');

  // Language
  const lang = (i18n.language?.substring(0, 2) || 'fr') as 'fr' | 'en' | 'id';
  const locale = LOCALES[lang] || LOCALES.fr;
  const nameKey = `name_${lang}` as 'name_fr' | 'name_en' | 'name_id';

  // Format value for display
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Define type for history items
  type HistoryItem = {
    id: string;
    old_value: unknown;
    new_value: unknown;
    change_reason?: string | null;
    changed_at: string | null;
    setting?: { key?: string; name_fr?: string; name_en?: string; name_id?: string } | null;
    user?: { display_name?: string; first_name?: string; last_name?: string } | null;
  };

  // Filter history
  const filteredHistory = history?.filter((item: HistoryItem) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    const setting = item.setting;
    return (
      setting?.key?.toLowerCase().includes(search) ||
      setting?.name_fr?.toLowerCase().includes(search) ||
      setting?.name_en?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <div className="settings-section__header-content">
          <div>
            <h2 className="settings-section__title">Historique des Modifications</h2>
            <p className="settings-section__description">
              Journal des modifications apportées aux paramètres
            </p>
          </div>
        </div>
      </div>

      <div className="settings-section__body">
        {/* Search */}
        <div className="settings-history-search">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher un paramètre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="settings-section__loading">
            <div className="spinner" />
            <span>Chargement...</span>
          </div>
        ) : !filteredHistory || filteredHistory.length === 0 ? (
          <div className="settings-section__empty">
            <History size={48} />
            <h3>Aucune modification</h3>
            <p>L'historique des modifications apparaîtra ici.</p>
          </div>
        ) : (
          <div className="settings-history-list">
            {filteredHistory.map((item: HistoryItem) => {
              const setting = item.setting;
              const user = item.user;
              const userName = user?.display_name ||
                (user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : 'Système');

              return (
                <div key={item.id} className="settings-history-item">
                  <div className="settings-history-item__icon">
                    <History size={16} />
                  </div>
                  <div className="settings-history-item__content">
                    <div className="settings-history-item__header">
                      <span className="settings-history-item__setting">
                        {setting?.[nameKey] || setting?.name_en || setting?.key || 'Paramètre inconnu'}
                      </span>
                      <span className="settings-history-item__key">
                        {setting?.key}
                      </span>
                    </div>
                    <div className="settings-history-item__change">
                      <span className="settings-history-item__old-value">
                        {formatValue(item.old_value)}
                      </span>
                      <ArrowRight size={14} />
                      <span className="settings-history-item__new-value">
                        {formatValue(item.new_value)}
                      </span>
                    </div>
                    {item.change_reason && (
                      <div className="settings-history-item__reason">
                        Raison: {item.change_reason}
                      </div>
                    )}
                    <div className="settings-history-item__meta">
                      <span className="settings-history-item__user">
                        <User size={12} />
                        {userName}
                      </span>
                      <span className="settings-history-item__time">
                        <Clock size={12} />
                        {item.changed_at ? formatDistanceToNow(new Date(item.changed_at), {
                          addSuffix: true,
                          locale,
                        }) : '-'}
                      </span>
                    </div>
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

export default SettingsHistoryPage;
