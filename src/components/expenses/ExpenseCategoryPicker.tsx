import { useExpenseCategories } from '@/hooks/expenses'

interface Props {
  value: string
  onChange: (id: string) => void
  className?: string
}

export function ExpenseCategoryPicker({ value, onChange, className }: Props) {
  const { activeCategories, isLoading } = useExpenseCategories()

  if (isLoading) {
    return (
      <select className={className} disabled>
        <option>Loading...</option>
      </select>
    )
  }

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={className}
    >
      <option value="">Select category...</option>
      {activeCategories.map(cat => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  )
}
