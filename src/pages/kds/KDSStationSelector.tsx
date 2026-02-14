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
        <div className="flex flex-col min-h-screen bg-[#0D0D0F] text-white">
            {/* Header matching Stitch pattern */}
            <header className="sticky top-0 z-30 flex items-center justify-between py-4 px-8 border-b border-[var(--kds-accent)]/10 bg-[var(--kds-bg)]/80 backdrop-blur-md max-md:px-5 max-md:py-3">
                <button
                    className="bg-[var(--kds-surface-elevated)] border-none text-[var(--stone-text)] w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[var(--kds-surface-hover)] hover:scale-105"
                    onClick={() => navigate('/pos')}
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-4">
                    <BreakeryLogo size="lg" variant="light" showText={false} />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold tracking-[0.3em] uppercase text-[var(--kds-accent)]">The Breakery</span>
                        <span className="text-sm font-semibold tracking-widest uppercase text-[var(--stone-text)]">Kitchen Display System</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-mono text-lg font-bold tabular-nums text-[var(--stone-text)]">
                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-10">
                <h2 className="text-[2.5rem] font-bold m-0 mb-2 text-center text-[var(--stone-text)] max-md:text-[1.75rem]">Select Your Station</h2>
                <p className="text-sm tracking-widest uppercase text-[var(--muted-smoke)] m-0 mb-12 text-center">Choose a station to view orders</p>

                <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6 max-w-[900px] w-full">
                    {STATIONS.map((station) => (
                        <button
                            key={station.id}
                            className="bg-[var(--kds-surface)] border border-white/5 rounded-2xl p-8 max-md:p-6 cursor-pointer flex items-center gap-6 transition-all duration-300 text-left hover:bg-[var(--kds-surface-elevated)] hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)] hover:border-[var(--kds-accent)]/30 active:translate-y-0"
                            onClick={() => navigate(`/kds/${station.id}`)}
                        >
                            <div
                                className="w-[90px] h-[90px] max-md:w-[70px] max-md:h-[70px] rounded-2xl flex items-center justify-center text-white shrink-0"
                                style={{ background: station.gradient }}
                            >
                                {station.icon}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-[var(--stone-text)] m-0 mb-2">{station.name}</h3>
                                <p className="text-sm text-[var(--muted-smoke)] m-0 leading-relaxed">{station.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </main>

            <footer className="py-4 text-center border-t border-white/5 text-[var(--muted-smoke)] text-xs tracking-widest uppercase">
                <p>Touch a station to start viewing orders</p>
            </footer>
        </div>
    )
}
