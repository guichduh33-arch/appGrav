import { Plus, Edit2, Trash2, CheckCircle, Percent } from 'lucide-react';
import type { TaxRate } from '@/types/settings';

interface TaxRatesSectionProps {
  taxRates: TaxRate[] | undefined;
  isLoading: boolean;
  nameKey: 'name_en';
  onCreateRate: () => void;
  onEditRate: (rate: TaxRate) => void;
  onDeleteRate: (rate: TaxRate) => void;
  onSetDefault: (rate: TaxRate) => void;
}

const TaxRatesSection = ({
  taxRates, isLoading, nameKey,
  onCreateRate, onEditRate, onDeleteRate, onSetDefault,
}: TaxRatesSectionProps) => {
  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-display font-bold text-white mb-1">Tax Rates (PPN)</h2>
            <p className="text-sm text-[var(--theme-text-muted)]">
              Manage applicable VAT rates for products
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 px-5 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-all hover:brightness-110 shrink-0"
            onClick={onCreateRate}
          >
            <Plus size={16} />
            New Rate
          </button>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-4 text-[var(--theme-text-muted)]">
            <div className="w-6 h-6 border-[3px] border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        ) : taxRates?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--theme-text-muted)]">
            <Percent size={48} className="opacity-30 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">No tax rates</h3>
            <p className="mb-6">Create your first tax rate to get started.</p>
            <button
              className="inline-flex items-center gap-2 px-5 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-all hover:brightness-110"
              onClick={onCreateRate}
            >
              <Plus size={16} />
              Create Rate
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {taxRates?.map((rate) => (
              <div
                key={rate.id}
                className={`flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl hover:bg-white/[0.06] transition-all ${!rate.is_active ? 'opacity-50' : ''}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-black/40 rounded-md text-[var(--theme-text-muted)]">{rate.code}</span>
                    {rate.is_default && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 bg-[var(--color-success-bg)] text-[var(--color-success-text)] rounded-full">
                        <CheckCircle size={12} /> Default
                      </span>
                    )}
                    {!rate.is_active && (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-white/5 text-[var(--theme-text-muted)] rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-white">{rate[nameKey]}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-[var(--color-gold)]">{rate.rate}%</span>
                    <span className="text-xs text-[var(--theme-text-muted)] px-1.5 py-0.5 bg-black/40 rounded-md">
                      {rate.is_inclusive ? 'TTC' : 'HT'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1">
                  {!rate.is_default && rate.is_active && (
                    <button
                      className="p-2 bg-transparent border-none rounded-lg text-[var(--theme-text-muted)] cursor-pointer transition-all hover:bg-white/5 hover:text-[var(--color-gold)]"
                      onClick={() => onSetDefault(rate)}
                      title="Set as default"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button
                    className="p-2 bg-transparent border-none rounded-lg text-[var(--theme-text-muted)] cursor-pointer transition-all hover:bg-white/5 hover:text-[var(--color-gold)]"
                    onClick={() => onEditRate(rate)}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="p-2 bg-transparent border-none rounded-lg text-[var(--theme-text-muted)] cursor-pointer transition-all hover:bg-white/5 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => onDeleteRate(rate)}
                    title="Delete"
                    disabled={rate.is_default ?? false}
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
  );
};

export default TaxRatesSection;
