import { useNavigate } from 'react-router-dom'
import { ChefHat, Coffee, Users, Store, ArrowLeft } from 'lucide-react'
import './KDSStationSelector.css'

interface StationConfig {
    id: string
    name: string
    icon: React.ReactNode
    description: string
    color: string
    gradient: string
}

const STATIONS: StationConfig[] = [
    {
        id: 'hot_kitchen',
        name: 'Hot Kitchen',
        icon: <ChefHat size={48} />,
        description: 'Sandwiches, plates, hot dishes prepared on demand',
        color: '#EF4444',
        gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
    },
    {
        id: 'barista',
        name: 'Barista',
        icon: <Coffee size={48} />,
        description: 'Coffee, espresso drinks, specialty beverages',
        color: '#8B5CF6',
        gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
    },
    {
        id: 'display',
        name: 'Display',
        icon: <Store size={48} />,
        description: 'Juices, pastries, display case items',
        color: '#10B981',
        gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    },
    {
        id: 'waiter',
        name: 'Waiter',
        icon: <Users size={48} />,
        description: 'Complete order overview for serving',
        color: '#3B82F6',
        gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
    }
]

export default function KDSStationSelector() {
    const navigate = useNavigate()

    const handleStationSelect = (stationId: string) => {
        navigate(`/kds/${stationId}`)
    }

    return (
        <div className="kds-selector">
            <header className="kds-selector__header">
                <button className="kds-selector__back" onClick={() => navigate('/pos')}>
                    <ArrowLeft size={24} />
                </button>
                <div className="kds-selector__logo">
                    <span className="kds-selector__emoji">🥐</span>
                    <div>
                        <h1>The Breakery</h1>
                        <span>Kitchen Display System</span>
                    </div>
                </div>
                <div className="kds-selector__time">
                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </header>

            <main className="kds-selector__main">
                <h2 className="kds-selector__title">Select Your Station</h2>
                <p className="kds-selector__subtitle">Choose a station to view orders</p>

                <div className="kds-selector__grid">
                    {STATIONS.map((station) => (
                        <button
                            key={station.id}
                            className="kds-selector__station"
                            onClick={() => handleStationSelect(station.id)}
                            style={{ '--station-color': station.color, '--station-gradient': station.gradient } as React.CSSProperties}
                        >
                            <div className="kds-selector__station-icon">
                                {station.icon}
                            </div>
                            <div className="kds-selector__station-info">
                                <h3>{station.name}</h3>
                                <p>{station.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </main>

            <footer className="kds-selector__footer">
                <p>Touch a station to start viewing orders</p>
            </footer>
        </div>
    )
}
