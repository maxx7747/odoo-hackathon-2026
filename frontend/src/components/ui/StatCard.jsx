export default function StatCard({ label, value, sub, icon: Icon, tone = 'moss' }) {
  const toneMap = {
    moss: 'bg-moss-50 text-moss-700',
    sky: 'bg-sky-100 text-sky-700',
    plum: 'bg-plum-100 text-plum-700',
    gold: 'bg-gold-100 text-gold-700',
    brick: 'bg-brick-100 text-brick-700',
  }
  return (
    <div className="rounded-xl border border-ink-100 bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <p className="text-sm text-ink-400">{label}</p>
        {Icon && (
          <div className={`rounded-lg p-2 ${toneMap[tone]}`}>
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
      </div>
      <p className="mt-2 font-display text-3xl font-semibold text-ink-800">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-400">{sub}</p>}
    </div>
  )
}
