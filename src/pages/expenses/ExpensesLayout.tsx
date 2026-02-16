import { NavLink, Outlet } from 'react-router-dom'
import { Receipt, FolderTree } from 'lucide-react'

const navItems = [
  { to: '/expenses', label: 'Expenses', icon: Receipt, end: true },
  { to: '/expenses/categories', label: 'Categories', icon: FolderTree, end: false },
]

export default function ExpensesLayout() {
  return (
    <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Expenses</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[var(--color-gold)]/15 text-[var(--color-gold)] border border-[var(--color-gold)]/30'
                  : 'bg-transparent border border-white/10 text-white/70 hover:border-white/20 hover:text-white'
              }`
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  )
}
