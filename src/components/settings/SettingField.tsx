import { useState, useEffect } from 'react';
import { RotateCcw, Eye, EyeOff } from 'lucide-react';
import type { Setting, ValidationRules } from '../../types/settings';
import { cn } from '@/lib/utils';

interface SettingFieldProps {
  setting: Setting;
  value: unknown;
  onChange: (value: unknown) => void;
  onReset?: () => void;
  disabled?: boolean;
  showReset?: boolean;
}

const inputBase =
  'w-full h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--theme-text-muted)] transition-all focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 disabled:opacity-50 disabled:cursor-not-allowed';

const selectBase = `${inputBase} cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2716%27%20height=%2716%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%239ca3af%27%20stroke-width=%272%27%3E%3Cpath%20d=%27M6%209l6%206%206-6%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center] pr-10`;

const SettingField: React.FC<SettingFieldProps> = ({
  setting,
  value,
  onChange,
  onReset,
  disabled = false,
  showReset = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const name = setting.name_en;
  const description = setting.description_en;

  const parseValue = (val: unknown): unknown => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return val;
  };

  const parsedValue = parseValue(localValue);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: unknown) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const hasChanged = setting.default_value !== undefined &&
    JSON.stringify(parsedValue) !== JSON.stringify(parseValue(setting.default_value));

  const renderField = () => {
    const validation = setting.validation_rules as ValidationRules | undefined;

    switch (setting.value_type) {
      case 'boolean':
        return (
          <div
            className={cn(
              'w-12 h-7 rounded-full bg-white/10 cursor-pointer transition-all relative shrink-0',
              'after:content-[""] after:absolute after:top-[3px] after:left-[3px] after:w-[22px] after:h-[22px] after:rounded-full after:bg-white after:shadow-[0_2px_4px_rgba(0,0,0,0.3)] after:transition-all',
              !!parsedValue && 'bg-[var(--color-gold)] after:left-[23px]',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => !disabled && handleChange(!parsedValue)}
            role="switch"
            aria-checked={!!parsedValue}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && !disabled && handleChange(!parsedValue)}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            className={cn(inputBase, 'max-w-[150px]')}
            value={parsedValue as number ?? ''}
            onChange={(e) => handleChange(e.target.value === '' ? null : Number(e.target.value))}
            min={validation?.min}
            max={validation?.max}
            disabled={disabled}
          />
        );

      case 'string':
        if (validation?.options && validation.options.length > 0) {
          return (
            <select
              className={selectBase}
              value={parsedValue as string ?? ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={disabled}
            >
              {validation.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }

        if (setting.is_sensitive) {
          return (
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                className={cn(inputBase, 'pr-11')}
                value={parsedValue as string ?? ''}
                onChange={(e) => handleChange(e.target.value)}
                disabled={disabled}
                autoComplete="off"
              />
              <button
                type="button"
                className="absolute right-2 flex items-center justify-center w-7 h-7 border-none bg-transparent text-[var(--theme-text-muted)] cursor-pointer rounded-lg hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          );
        }

        return (
          <input
            type="text"
            className={inputBase}
            value={parsedValue as string ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
          />
        );

      case 'array': {
        const arrayValue = Array.isArray(parsedValue) ? parsedValue : [];
        return (
          <input
            type="text"
            className={inputBase}
            value={arrayValue.join(', ')}
            onChange={(e) => {
              const items = e.target.value.split(',').map((s) => {
                const trimmed = s.trim();
                const num = Number(trimmed);
                return isNaN(num) ? trimmed : num;
              });
              handleChange(items);
            }}
            placeholder="value1, value2, value3"
            disabled={disabled}
          />
        );
      }

      case 'json': {
        const jsonString = typeof parsedValue === 'object'
          ? JSON.stringify(parsedValue, null, 2)
          : String(parsedValue);
        return (
          <textarea
            className="w-full min-h-[100px] p-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono resize-y transition-all focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            value={jsonString}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleChange(parsed);
              } catch {
                // Keep as string if invalid JSON
              }
            }}
            disabled={disabled}
            rows={4}
          />
        );
      }

      case 'file':
        return (
          <div className="flex items-center gap-3">
            <input
              type="file"
              className="flex-1 text-sm text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-white/10 file:bg-transparent file:text-white file:font-medium file:cursor-pointer hover:file:border-white/20"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleChange(file.name);
                }
              }}
              disabled={disabled}
              accept="image/*"
            />
            {parsedValue != null && (
              <span className="text-sm text-[var(--theme-text-muted)] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                {String(parsedValue)}
              </span>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            className={inputBase}
            value={String(parsedValue ?? '')}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
          />
        );
    }
  };

  const resetButton = (
    <button
      type="button"
      className="flex items-center justify-center w-6 h-6 border-none bg-transparent text-[var(--theme-text-muted)] cursor-pointer rounded-lg transition-colors hover:bg-white/5 hover:text-[var(--color-gold)]"
      onClick={onReset}
      title="Reset"
    >
      <RotateCcw size={14} />
    </button>
  );

  return (
    <div className={cn(
      'py-3 border-b border-white/5 last:border-b-0',
      setting.value_type === 'boolean' && 'flex items-center justify-between gap-4'
    )}>
      <div className={cn(
        'flex justify-between items-start mb-2',
        setting.value_type === 'boolean' && 'flex-1 mb-0'
      )}>
        <div className="flex-1">
          <label className="flex items-center gap-2 text-sm font-medium text-white">
            {name}
            {setting.requires_restart && (
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-md">
                Restart
              </span>
            )}
          </label>
          {description && (
            <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">{description}</p>
          )}
        </div>
        {setting.value_type !== 'boolean' && (
          <div className="flex items-center gap-1">
            {showReset && hasChanged && onReset && resetButton}
          </div>
        )}
      </div>
      <div className={cn(
        setting.value_type === 'boolean' && 'flex items-center gap-2'
      )}>
        {renderField()}
        {setting.value_type === 'boolean' && showReset && hasChanged && onReset && resetButton}
      </div>
    </div>
  );
};

export default SettingField;
