import './CustomerDisplayPage.css'

// Customer-facing display
export default function CustomerDisplayPage() {
    return (
        <div className="customer-display">
            <div className="display-idle">
                <div className="display-logo">
                    <span className="display-logo__icon">🥐</span>
                    <h1 className="display-logo__text">The Breakery</h1>
                    <p className="display-logo__tagline">Boulangerie Artisanale Française</p>
                </div>

                <div className="display-info">
                    <div className="display-info__item">
                        <span className="display-info__icon">📍</span>
                        <span>Senggigi, Lombok</span>
                    </div>
                    <div className="display-info__item">
                        <span className="display-info__icon">📶</span>
                        <span>WiFi: TheBreakery • Pass: croissant2024</span>
                    </div>
                    <div className="display-info__item">
                        <span className="display-info__icon">⏰</span>
                        <span>Ouvert 7j/7 • 7h - 18h</span>
                    </div>
                </div>

                <div className="display-promo">
                    <p>Essayez notre nouveau</p>
                    <h2>Matcha Latte 🍵</h2>
                    <p className="display-promo__price">Rp 45.000</p>
                </div>
            </div>
        </div>
    )
}
