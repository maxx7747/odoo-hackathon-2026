const TONES = {
  green: 'bg-moss-50 text-moss-700 border-moss-100',
  blue: 'bg-sky-100 text-sky-700 border-sky-100',
  purple: 'bg-plum-100 text-plum-700 border-plum-100',
  gold: 'bg-gold-100 text-gold-700 border-gold-100',
  red: 'bg-brick-100 text-brick-700 border-brick-100',
  neutral: 'bg-ink-100 text-ink-500 border-ink-100',
}

// Maps common status strings to a sensible tone automatically, so callers
// can just pass the raw status text from the API.
const STATUS_TONE = {
  active: 'green', approved: 'green', resolved: 'green', 'on track': 'green', acknowledged: 'green', completed: 'green', satisfactory: 'green',
  pending: 'gold', 'under review': 'gold', 'in progress': 'gold', 'at risk': 'gold', draft: 'gold',
  overdue: 'red', open: 'red', rejected: 'red', high: 'red', 'out of stock': 'red',
  medium: 'gold', low: 'blue', archived: 'neutral', inactive: 'neutral',
}

export default function Pill({ children, tone }) {
  const resolvedTone = tone || STATUS_TONE[String(children).toLowerCase()] || 'neutral'
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${TONES[resolvedTone]}`}>
      {children}
    </span>
  )
}
