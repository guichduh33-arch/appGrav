import { useState, useEffect } from 'react';
import { RotateCcw, Eye, EyeOff } from 'lucide-react';
import type { Setting, ValidationRules } from '../../types/settings';
import './SettingField.css';

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
            className={`setting-toggle ${parsedValue ? 'is-on' : ''} ${disabled ? 'is-disabled' : ''}`}
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
            className="setting-input setting-input--number"
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
              className="setting-input setting-input--select"
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
            <div className="setting-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="setting-input setting-input--password"
                value={parsedValue as string ?? ''}
                onChange={(e) => handleChange(e.target.value)}
                disabled={disabled}
                autoComplete="off"
              />
              <button
                type="button"
                className="setting-input__toggle"
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
            className="setting-input"
            value={parsedValue as string ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
          />
        );

      case 'array':
        // Render as comma-separated input for simple arrays
        const arrayValue = Array.isArray(parsedValue) ? parsedValue : [];
        return (
          <input
            type="text"
            className="setting-input"
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

      case 'json':
        // For JSON, render a textarea with formatted JSON
        const jsonString = typeof parsedValue === 'object'
          ? JSON.stringify(parsedValue, null, 2)
          : String(parsedValue);
        return (
          <textarea
            className="setting-input setting-input--textarea"
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

      case 'file':
        return (
          <div className="setting-file">
            <input
              type="file"
              className="setting-file__input"
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
              <span className="setting-file__name">{String(parsedValue)}</span>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            className="setting-input"
            value={String(parsedValue ?? '')}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className={`setting-field ${setting.value_type === 'boolean' ? 'setting-field--toggle' : ''}`}>
      <div className="setting-field__header">
        <div className="setting-field__label-group">
          <label className="setting-field__label">
            {name}
            {setting.requires_restart && (
              <span className="setting-field__restart-badge" title="Nécessite un redémarrage">
                Restart
              </span>
            )}
          </label>
          {description && (
            <p className="setting-field__description">{description}</p>
          )}
        </div>
        {setting.value_type !== 'boolean' && (
          <div className="setting-field__actions">
            {showReset && hasChanged && onReset && (
              <button
                type="button"
                className="setting-field__reset"
                onClick={onReset}
                title="Réinitialiser"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="setting-field__control">
        {renderField()}
        {setting.value_type === 'boolean' && showReset && hasChanged && onReset && (
          <button
            type="button"
            className="setting-field__reset setting-field__reset--inline"
            onClick={onReset}
            title="Réinitialiser"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SettingField;
