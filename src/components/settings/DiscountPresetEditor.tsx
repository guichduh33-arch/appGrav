import { useState } from 'react'
import { Plus, Trash2, ArrowUp, ArrowDown, Tag } from 'lucide-react'
import type { IDiscountPreset } from '@/types/settingsModuleConfig'

interface DiscountPresetEditorProps {
  values: IDiscountPreset[]
  onChange: (values: IDiscountPreset[]) => void
  maxPct?: number
}

const DiscountPresetEditor: React.FC<DiscountPresetEditorProps> = ({
  values,
  onChange,
  maxPct = 100,
}) => {
  const [newName, setNewName] = useState('')
  const [newPct, setNewPct] = useState('')

  const handleAdd = () => {
    const pct = Number(newPct)
    if (isNaN(pct) || newPct.trim() === '' || pct < 0 || pct > maxPct) return
    const name = newName.trim() || `${pct}%`
    onChange([...values, { name, pct }])
    setNewName('')
    setNewPct('')
  }

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index))
  }

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= values.length) return
    const copy = [...values]
    ;[copy[index], copy[target]] = [copy[target], copy[index]]
    onChange(copy)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Existing presets */}
      {values.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {values.map((preset, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 group"
            >
              <Tag size={14} className="text-[var(--color-gold)] shrink-0" />
              <span className="text-sm font-semibold text-white min-w-[40px]">
                {preset.pct}%
              </span>
              <span className="text-sm text-[var(--theme-text-secondary)] flex-1 truncate">
                {preset.name}
              </span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  className="p-1 bg-transparent border-none cursor-pointer text-[var(--theme-text-muted)] hover:text-white transition-colors disabled:opacity-30"
                  onClick={() => handleMove(i, -1)}
                  disabled={i === 0}
                  title="Move up"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  type="button"
                  className="p-1 bg-transparent border-none cursor-pointer text-[var(--theme-text-muted)] hover:text-white transition-colors disabled:opacity-30"
                  onClick={() => handleMove(i, 1)}
                  disabled={i === values.length - 1}
                  title="Move down"
                >
                  <ArrowDown size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="p-1 bg-transparent border-none cursor-pointer text-red-400 hover:text-red-300 transition-colors"
                  title="Remove"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new preset */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="flex-1 h-9 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Name (e.g. Staff Meal)"
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            className="w-20 h-9 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white text-right placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
            value={newPct}
            onChange={(e) => setNewPct(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="10"
            min={0}
            max={maxPct}
          />
          <span className="text-xs text-[var(--theme-text-muted)]">%</span>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
          onClick={handleAdd}
          disabled={!newPct.trim()}
        >
          <Plus size={14} />
          Add
        </button>
      </div>
      <p className="text-[10px] text-[var(--theme-text-muted)]">
        Leave the name empty to default to the percentage value (e.g. "10%").
      </p>
    </div>
  )
}

export default DiscountPresetEditor
