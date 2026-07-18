import { useEffect, useState } from 'react'
import { Bell, ChevronDown } from 'lucide-react'
import { notifications as notificationsApi, client, USE_MOCKS } from '../../lib/api.js'

export default function Topbar({ title }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [backendStatus, setBackendStatus] = useState(USE_MOCKS ? 'mock-forced' : 'checking')

  useEffect(() => {
    notificationsApi.list().then(setItems)
  }, [])

  useEffect(() => {
    if (USE_MOCKS) return // VITE_USE_MOCKS=true — intentionally showing sample data, no need to ping the API
    client
      .get('/core/departments/', { params: { page_size: 1 } })
      .then(() => setBackendStatus('live'))
      .catch(() => setBackendStatus('unreachable'))
  }, [])

  const unread = items.filter((n) => !n.read).length

  return (
    <header className="flex items-center justify-between border-b border-ink-100 bg-paper/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-xl font-semibold text-ink-800">{title}</h1>
        <DataSourceBadge status={backendStatus} />
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 rounded-lg border border-ink-100 bg-card px-3 py-1.5 text-sm text-ink-600 hover:bg-ink-50">
          Acme Manufacturing Ltd.
          <ChevronDown size={14} />
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative rounded-lg p-2 text-ink-500 hover:bg-ink-50"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brick-500 text-[10px] font-medium text-white">
                {unread}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-ink-100 bg-card p-2 shadow-soft">
              <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-400">Notifications</p>
              <div className="max-h-72 overflow-y-auto scrollbar-thin">
                {items.length === 0 && <p className="px-2 py-3 text-sm text-ink-400">No notifications.</p>}
                {items.map((n) => (
                  <div key={n.id} className="rounded-lg px-2 py-2 hover:bg-ink-50">
                    <p className="text-sm text-ink-700">{n.message}</p>
                    <p className="mt-0.5 text-xs text-ink-400">{n.type} · {n.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-l border-ink-100 pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-moss-100 font-medium text-moss-700">DA</div>
          <div className="hidden text-sm leading-tight lg:block">
            <p className="font-medium text-ink-700">Demo Admin</p>
            <p className="text-xs text-ink-400">ESG Administrator</p>
          </div>
        </div>
      </div>
    </header>
  )
}

function DataSourceBadge({ status }) {
  if (status === 'checking') return null

  const CONFIG = {
    live: { label: 'Live data', dot: 'bg-moss-500', tone: 'bg-moss-50 text-moss-700 border-moss-100' },
    'mock-forced': {
      label: 'Demo data',
      dot: 'bg-gold-500',
      tone: 'bg-gold-100 text-gold-700 border-gold-100',
      title: 'VITE_USE_MOCKS is set to true in frontend/.env — set it to false to use your real backend.',
    },
    unreachable: {
      label: 'Demo data (backend unreachable)',
      dot: 'bg-brick-500',
      tone: 'bg-brick-100 text-brick-700 border-brick-100',
      title: "Couldn't reach the Django API at /api — falling back to sample data. Check that `python manage.py runserver` is running.",
    },
  }
  const cfg = CONFIG[status]
  if (!cfg) return null

  return (
    <span title={cfg.title} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.tone}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
