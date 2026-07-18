// Signature visual for the platform: the Overall ESG Score rendered as
// growth rings. Ring thickness maps to each pillar's weight in the
// scoring formula (Environmental 40 / Social 30 / Governance 30), and
// each ring fills clockwise to that pillar's score out of 100 — an
// annual-ring motif that reads as "how far this org has grown."

const R_OUTER = 92 // Environmental — thickest (40%)
const R_MID = 70 // Social (30%)
const R_INNER = 50 // Governance (30%)

function ringPath(radius, pct) {
  const clamped = Math.max(0, Math.min(100, pct))
  const circumference = 2 * Math.PI * radius
  const dash = (clamped / 100) * circumference
  return { circumference, dash }
}

function Ring({ radius, pct, colorClass, trackClass, strokeWidth }) {
  const { circumference, dash } = ringPath(radius, pct)
  return (
    <>
      <circle
        cx="110"
        cy="110"
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className={trackClass}
      />
      <circle
        cx="110"
        cy="110"
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        transform="rotate(-90 110 110)"
        className={colorClass}
      />
    </>
  )
}

export default function ScoreRing({ environmental, social, governance, total, size = 220 }) {
  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox="0 0 220 220" role="img" aria-label={`Overall ESG score ${total}`}>
        <Ring radius={R_OUTER} pct={environmental} strokeWidth={14} colorClass="stroke-moss-500" trackClass="stroke-moss-100" />
        <Ring radius={R_MID} pct={social} strokeWidth={11} colorClass="stroke-sky-500" trackClass="stroke-sky-100" />
        <Ring radius={R_INNER} pct={governance} strokeWidth={9} colorClass="stroke-plum-500" trackClass="stroke-plum-100" />
        <text x="110" y="104" textAnchor="middle" className="fill-ink-800 font-display font-semibold" style={{ fontSize: 40 }}>
          {total}
        </text>
        <text x="110" y="128" textAnchor="middle" className="fill-ink-400 font-mono" style={{ fontSize: 12, letterSpacing: '0.08em' }}>
          ESG SCORE
        </text>
      </svg>
      <ul className="space-y-3 text-sm">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-moss-500" />
          <span className="text-ink-500">Environmental</span>
          <span className="ml-auto font-mono font-medium text-ink-800">{environmental}</span>
          <span className="text-ink-300 font-mono text-xs">· 40%</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
          <span className="text-ink-500">Social</span>
          <span className="ml-auto font-mono font-medium text-ink-800">{social}</span>
          <span className="text-ink-300 font-mono text-xs">· 30%</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-plum-500" />
          <span className="text-ink-500">Governance</span>
          <span className="ml-auto font-mono font-medium text-ink-800">{governance}</span>
          <span className="text-ink-300 font-mono text-xs">· 30%</span>
        </li>
      </ul>
    </div>
  )
}
