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

  // Use English
  const name = setting.name_en;
  const description = setting.description_en;

  // Parse value from JSONB
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

  // Sync local value with prop
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle value change with validation
  const handleChange = (newValue: unknown) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  // Check if value has changed from default
  const hasChanged = setting.default_value !== undefined &&
    JSON.stringify(parsedValue) !== JSON.stringify(parseValue(setting.default_value));

  // Render based on value type
  const renderField = () => {
    const validation = setting.validation_rules as ValidationRules | undefined;

    switch (setting.value_type) {
      case 'boolean':
        return (
          <div
            className={cn(
              'w-12 h-7 rounded-[14px] bg-smoke cursor-pointer transition-all duration-fast ease-standard relative shrink-0',
              'after:content-[""] after:absolute after:top-[3px] after:left-[3px] after:w-[22px] after:h-[22px] after:rounded-full after:bg-white after:shadow-[0_2px_4px_rgba(0,0,0,0.15)] after:transition-all after:duration-fast after:ease-standard',
              'focus-visible:outline-2 focus-visible:outline-[var(--color-rose-poudre)] focus-visible:outline-offset-2',
              !!parsedValue && 'bg-success after:left-[23px]',
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
            className="w-full h-10 px-md bg-cream border border-border rounded-sm text-sm text-espresso transition-all duration-fast ease-standard focus:outline-none focus:border-[var(--color-rose-poudre)] focus:shadow-[0_0_0_3px_rgba(var(--color-rose-poudre-rgb),0.2)] disabled:opacity-60 disabled:cursor-not-allowed max-w-[150px]"
            value={parsedValue as number ?? ''}
            onChange={(e) => handleChange(e.target.value === '' ? null : Number(e.target.value))}
            min={validation?.min}
            max={validation?.max}
            disabled={disabled}
          />
        );

      case 'string':
        // Check if it's a select from options
        if (validation?.options && validation.options.length > 0) {
          return (
            <select
              className="w-full h-10 px-md bg-cream border border-border rounded-sm text-sm text-espresso transition-all duration-fast ease-standard focus:outline-none focus:border-[var(--color-rose-poudre)] focus:shadow-[0_0_0_3px_rgba(var(--color-rose-poudre-rgb),0.2)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2716%27%20height=%2716%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%236B7280%27%20stroke-width=%272%27%3E%3Cpath%20d=%27M6%209l6%206%206-6%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center] pr-10"
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

        // Sensitive field (password)
        if (setting.is_sensitive) {
          return (
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                className="flex-1 w-full h-10 px-md pr-11 bg-cream border border-border rounded-sm text-sm text-espresso transition-all duration-fast ease-standard focus:outline-none focus:border-[var(--color-rose-poudre)] focus:shadow-[0_0_0_3px_rgba(var(--color-rose-poudre-rgb),0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
                value={parsedValue as string ?? ''}
                onChange={(e) => handleChange(e.target.value)}
                disabled={disabled}
                autoComplete="off"
              />
              <button
                type="button"
                className="absolute right-2 flex items-center justify-center w-7 h-7 border-none bg-transparent text-smoke cursor-pointer rounded-sm hover:text-espresso"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          );
        }

        // Regular string input
        return (
          <input
            type="text"
            className="w-full h-10 px-md bg-cream border border-border rounded-sm text-sm text-espresso transition-all duration-fast ease-standard focus:outline-none focus:border-[var(--color-rose-poudre)] focus:shadow-[0_0_0_3px_rgba(var(--color-rose-poudre-rgb),0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
            value={parsedValue as string ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
          />
        );

      case 'array': {
        // Render as comma-separated input for simple arrays
        const arrayValue = Array.isArray(parsedValue) ? parsedValue : [];
        return (
          <input
            type="text"
            className="w-full h-10 px-md bg-cream border border-border rounded-sm text-sm text-espresso transition-all duration-fast ease-standard focus:outline-none focus:border-[var(--color-rose-poudre)] focus:shadow-[0_0_0_3px_rgba(var(--color-rose-poudre-rgb),0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
            value={arrayValue.join(', ')}
            onChange={(e) => {
              const items = e.target.value.split(',').map((s) => {
                const trimmed = s.trim();
                const num = Number(trimmed);
                return isNaN(num) ? trimmed : num;
              });
              handleChange(items);
            }}
            placeholder="valeur1, valeur2, valeur3"
            disabled={disabled}
          />
        );
      }

      case 'json': {
        // For JSON, render a textarea with formatted JSON
        const jsonString = typeof parsedValue === 'object'
          ? JSON.stringify(parsedValue, null, 2)
          : String(parsedValue);
        return (
          <textarea
            className="w-full h-auto min-h-[100px] p-md bg-cream border border-border rounded-sm text-xs text-espresso font-mono resize-y transition-all duration-fast ease-standard focus:outline-none focus:border-[var(--color-rose-poudre)] focus:shadow-[0_0_0_3px_rgba(var(--color-rose-poudre-rgb),0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
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
          <div className="flex items-center gap-md">
            <input
              type="file"
              className="flex-1"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Handle file upload - for now just store the name
                  handleChange(file.name);
                }
              }}
              disabled={disabled}
              accept="image/*"
            />
            {parsedValue != null && (
              <span className="text-sm text-smoke max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">{String(parsedValue)}</span>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            className="w-full h-10 px-md bg-cream border border-border rounded-sm text-sm text-espresso transition-all duration-fast ease-standard focus:outline-none focus:border-[var(--color-rose-poudre)] focus:shadow-[0_0_0_3px_rgba(var(--color-rose-poudre-rgb),0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
            value={String(parsedValue ?? '')}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className={cn(
      'py-md border-b border-border last:border-b-0',
      setting.value_type === 'boolean' && 'flex items-center justify-between gap-lg'
    )}>
      <div className={cn(
        'flex justify-between items-start mb-sm',
        setting.value_type === 'boolean' && 'flex-1 mb-0'
      )}>
        <div className="flex-1">
          <label className="flex items-center gap-sm text-sm font-medium text-espresso">
            {name}
            {setting.requires_restart && (
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 bg-warning text-white rounded-sm">
                Restart
              </span>
            )}
          </label>
          {description && (
            <p className="text-xs text-smoke mt-0.5">{description}</p>
          )}
        </div>
        {setting.value_type !== 'boolean' && (
          <div className="flex items-center gap-xs">
            {showReset && hasChanged && onReset && (
              <button
                type="button"
                className="flex items-center justify-center w-6 h-6 border-none bg-transparent text-smoke cursor-pointer rounded-sm transition-all duration-fast ease-standard hover:bg-cream hover:text-warning"
                onClick={onReset}
                title="Reset"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        )}
      </div>
      <div className={cn(
        setting.value_type === 'boolean' && 'flex items-center gap-sm'
      )}>
        {renderField()}
        {setting.value_type === 'boolean' && showReset && hasChanged && onReset && (
          <button
            type="button"
            className="flex items-center justify-center w-6 h-6 border-none bg-transparent text-smoke cursor-pointer rounded-sm transition-all duration-fast ease-standard hover:bg-cream hover:text-warning ml-sm"
            onClick={onReset}
            title="Reset"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SettingField;
