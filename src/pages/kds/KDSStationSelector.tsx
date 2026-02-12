import { useNavigate } from 'react-router-dom'
import { ChefHat, Coffee, Users, Store, ArrowLeft } from 'lucide-react'
import { BreakeryLogo } from '@/components/ui/BreakeryLogo'

interface StationConfig {
    id: string
    name: string
    icon: React.ReactNode
    description: string
    color: string
    gradient: string
}

const STATIONS: StationConfig[] = [
    { id: 'hot_kitchen', name: 'Hot Kitchen', icon: <ChefHat size={48} />, description: 'Sandwiches, plates, hot dishes prepared on demand', color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' },
    { id: 'barista', name: 'Barista', icon: <Coffee size={48} />, description: 'Coffee, espresso drinks, specialty beverages', color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' },
    { id: 'display', name: 'Display', icon: <Store size={48} />, description: 'Juices, pastries, display case items', color: '#10B981', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
    { id: 'waiter', name: 'Waiter', icon: <Users size={48} />, description: 'Complete order overview for serving', color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' },
]

export default function KDSStationSelector() {
    const navigate = useNavigate()

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[var(--kds-bg)] to-[#0a0a0a] text-white">
            <header className="flex items-center justify-between py-5 px-8 bg-[var(--kds-surface)] border-b border-[var(--kds-border)] max-md:px-5 max-md:py-4">
                <button
                    className="bg-[var(--kds-surface-elevated)] border-none text-white w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[var(--kds-surface-hover)] hover:scale-105"
                    onClick={() => navigate('/pos')}
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex items-center gap-4">
                    <BreakeryLogo size="lg" variant="light" showText={false} />
                    <div>
                        <h1 className="text-[1.75rem] font-bold text-white m-0">The Breakery</h1>
                        <span className="text-[0.9rem] text-gray-500">Kitchen Display System</span>
                    </div>
                </div>
                <div className="font-mono text-2xl text-gray-500">
                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-10">
                <h2 className="text-[2.5rem] font-bold m-0 mb-2 text-center max-md:text-[1.75rem]">Select Your Station</h2>
                <p className="text-lg text-gray-500 m-0 mb-12 text-center">Choose a station to view orders</p>

                <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6 max-w-[900px] w-full">
                    {STATIONS.map((station) => (
                        <button
                            key={station.id}
                            className="bg-[var(--kds-surface)] border-2 border-[var(--kds-border)] rounded-[20px] p-8 max-md:p-6 cursor-pointer flex items-center gap-6 transition-all duration-300 text-left hover:bg-[var(--kds-surface-elevated)] hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.3)] active:translate-y-0"
                            onClick={() => navigate(`/kds/${station.id}`)}
                            style={{ borderColor: undefined }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = station.color)}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--kds-border)')}
                        >
                            <div
                                className="w-[90px] h-[90px] max-md:w-[70px] max-md:h-[70px] rounded-[20px] flex items-center justify-center text-white shrink-0"
                                style={{ background: station.gradient }}
                            >
                                {station.icon}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white m-0 mb-2">{station.name}</h3>
                                <p className="text-[0.95rem] text-gray-500 m-0 leading-relaxed">{station.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </main>

            <footer className="py-5 text-center border-t border-[var(--kds-border)] text-gray-600 text-[0.9rem]">
                <p>Touch a station to start viewing orders</p>
            </footer>
        </div>
    )
}
