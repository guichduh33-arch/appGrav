import { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface ArrayAmountEditorProps {
  values: number[];
  onChange: (values: number[]) => void;
  formatAs?: 'idr' | 'percent';
  placeholder?: string;
  min?: number;
  max?: number;
}

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID').format(n);

const ArrayAmountEditor: React.FC<ArrayAmountEditorProps> = ({
  values,
  onChange,
  formatAs = 'idr',
  placeholder,
  min,
  max,
}) => {
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    const num = Number(newValue.replace(/[^0-9.-]/g, ''));
    if (isNaN(num) || newValue.trim() === '') return;
    if (min !== undefined && num < min) return;
    if (max !== undefined && num > max) return;
    onChange([...values, num]);
    setNewValue('');
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= values.length) return;
    const copy = [...values];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  };

  const formatDisplay = (v: number) =>
    formatAs === 'percent' ? `${v}%` : `IDR ${formatIDR(v)}`;

  const suffix = formatAs === 'percent' ? '%' : 'IDR';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {values.map((v, i) => (
          <div
            key={i}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 border border-white/10"
          >
            <span className="text-white">
              {formatDisplay(v)}
            </span>
            <button
              type="button"
              className="p-0.5 bg-transparent border-none cursor-pointer text-[var(--theme-text-muted)] hover:text-white transition-colors disabled:opacity-30"
              onClick={() => handleMove(i, -1)}
              disabled={i === 0}
            >
              <ArrowUp size={12} />
            </button>
            <button
              type="button"
              className="p-0.5 bg-transparent border-none cursor-pointer text-[var(--theme-text-muted)] hover:text-white transition-colors disabled:opacity-30"
              onClick={() => handleMove(i, 1)}
              disabled={i === values.length - 1}
            >
              <ArrowDown size={12} />
            </button>
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="p-0.5 bg-transparent border-none cursor-pointer text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">{suffix}</span>
        <input
          type="number"
          className="w-28 h-9 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          placeholder={placeholder || 'Add value'}
          min={min}
          max={max}
        />
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
          onClick={handleAdd}
          disabled={!newValue.trim()}
        >
          <Plus size={14} />
          Add
        </button>
      </div>
    </div>
  );
};

export default ArrayAmountEditor;
