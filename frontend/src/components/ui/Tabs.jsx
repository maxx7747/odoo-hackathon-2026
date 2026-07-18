export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="mb-6 flex gap-1 rounded-xl border border-ink-100 bg-card p-1 shadow-soft w-fit">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            active === tab ? 'bg-moss-500 text-white' : 'text-ink-500 hover:bg-ink-50'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
