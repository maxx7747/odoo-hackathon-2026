import { NavLink } from 'react-router-dom'
import { LayoutGrid, Leaf, Users, ShieldCheck, Trophy, FileBarChart, Settings, Sprout } from 'lucide-react'

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/environmental', label: 'Environmental', icon: Leaf },
  { to: '/social', label: 'Social', icon: Users },
  { to: '/governance', label: 'Governance', icon: ShieldCheck },
  { to: '/gamification', label: 'Gamification', icon: Trophy },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-100 bg-ink-800 text-ink-100 md:flex">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-moss-500 text-white">
          <Sprout size={18} />
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-white leading-none">EcoSphere</p>
          <p className="text-[11px] uppercase tracking-wider text-ink-300">ESG Platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive ? 'bg-moss-600/40 text-white font-medium' : 'text-ink-200 hover:bg-ink-700 hover:text-white'
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink-700 px-6 py-4 text-xs text-ink-300">
        <p>Overall weighting</p>
        <p className="mt-1 font-mono text-ink-200">E 40 · S 30 · G 30</p>
      </div>
    </aside>
  )
}
