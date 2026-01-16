import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './KDSMainPage.css'

// Placeholder KDS page
export default function KDSMainPage() {
    const { t, i18n } = useTranslation()
    const { station } = useParams()

    return (
        <div className="kds-app">
            <header className="kds-header">
                <div className="kds-header__logo">
                    <span>🥐</span>
                    <span>The Breakery KDS</span>
                </div>
                <div className="kds-header__station">
                    {station === 'barista' ? `☕ ${t('kds_page.station_barista')}` :
                        station === 'cuisine' ? `🍳 ${t('kds_page.station_cuisine')}` :
                            `📺 ${t('kds_page.station_display')}`}
                </div>
                <div className="kds-header__time">
                    {new Date().toLocaleTimeString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </header>

            <main className="kds-main">
                <div className="kds-placeholder">
                    <span className="kds-placeholder__icon">🚧</span>
                    <h2>{t('kds_page.placeholder_title')}</h2>
                    <p>{t('kds_page.placeholder_text')}</p>
                    <p className="kds-placeholder__hint">
                        {t('kds_page.placeholder_hint')}
                    </p>
                </div>
            </main>
        </div>
    )
}
