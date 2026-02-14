import { Printer, RefreshCw, Settings, Plus } from 'lucide-react';

const printers = [
  { id: 1, name: 'Imprimante Caisse', type: 'Receipt', status: 'connected', ip: '192.168.1.100' },
  { id: 2, name: 'Imprimante Cuisine', type: 'Kitchen', status: 'connected', ip: '192.168.1.101' },
  { id: 3, name: 'Imprimante Barista', type: 'Kitchen', status: 'disconnected', ip: '192.168.1.102' },
];

const SettingsPrintersTab = () => {
  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-lg font-display font-bold text-white mb-1">Printers</h2>
        <p className="text-sm text-[var(--theme-text-muted)]">
          Manage your receipt and kitchen printers
        </p>
      </div>
      <div className="p-6">
        <div className="flex flex-col gap-2">
          {printers.map((printer) => (
            <div key={printer.id} className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl">
              <div className="w-12 h-12 flex items-center justify-center bg-black/40 rounded-lg text-[var(--theme-text-muted)]">
                <Printer size={20} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">{printer.name}</div>
                <div className="text-xs text-[var(--theme-text-muted)] flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${printer.status === 'connected' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  {printer.status === 'connected' ? 'Connected' : 'Disconnected'}
                  <span className="ml-2 text-[var(--theme-text-muted)]">{printer.ip}</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl text-sm transition-all">
                  <RefreshCw size={16} />
                  Test
                </button>
                <button className="w-9 h-9 flex items-center justify-center bg-transparent border border-white/10 text-[var(--theme-text-muted)] hover:border-white/20 rounded-xl transition-all" title="Settings" aria-label="Printer settings">
                  <Settings size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-6 border-t border-white/5 mt-6">
          <button className="inline-flex items-center gap-2 px-5 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-all hover:brightness-110">
            <Plus size={18} />
            Add Printer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPrintersTab;
