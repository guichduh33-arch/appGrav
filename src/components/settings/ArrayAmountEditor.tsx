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
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium"
            style={{ background: 'var(--color-blanc-creme)' }}
          >
            <span style={{ color: 'var(--color-brun-chocolat)' }}>
              {formatDisplay(v)}
            </span>
            <button
              type="button"
              className="btn-ghost--small"
              onClick={() => handleMove(i, -1)}
              disabled={i === 0}
              style={{ padding: 2, background: 'none', border: 'none', cursor: 'pointer', opacity: i === 0 ? 0.3 : 1 }}
            >
              <ArrowUp size={12} />
            </button>
            <button
              type="button"
              className="btn-ghost--small"
              onClick={() => handleMove(i, 1)}
              disabled={i === values.length - 1}
              style={{ padding: 2, background: 'none', border: 'none', cursor: 'pointer', opacity: i === values.length - 1 ? 0.3 : 1 }}
            >
              <ArrowDown size={12} />
            </button>
            <button
              type="button"
              onClick={() => handleRemove(i)}
              style={{ padding: 2, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-urgent)' }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="form-input-group">
        <span className="form-input-suffix">{suffix}</span>
        <input
          type="number"
          className="form-input form-input--narrow"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          placeholder={placeholder || 'Add value'}
          min={min}
          max={max}
        />
        <button
          type="button"
          className="btn-secondary"
          onClick={handleAdd}
          disabled={!newValue.trim()}
          style={{ padding: '6px 12px' }}
        >
          <Plus size={14} />
          Add
        </button>
      </div>
    </div>
  );
};

export default ArrayAmountEditor;
