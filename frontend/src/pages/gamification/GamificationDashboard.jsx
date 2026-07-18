import { useEffect, useState } from 'react'
import { Plus, Trophy, Lock, Gift } from 'lucide-react'
import Layout from '../../components/layout/Layout.jsx'
import Tabs from '../../components/ui/Tabs.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Pill from '../../components/ui/Pill.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import ResourceFormModal from '../../components/ui/ResourceFormModal.jsx'
import { challenges, badges, rewards, employees, categories, rewardRedemptions } from '../../lib/api.js'

const TABS = ['Challenges', 'Badges', 'Rewards', 'Leaderboard']

const LIFECYCLE = ['Draft', 'Active', 'Under Review', 'Completed', 'Archived']

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]
const CHALLENGE_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

export default function GamificationDashboard() {
  const [active, setActive] = useState(TABS[0])
  const [challengeList, setChallengeList] = useState([])
  const [badgeList, setBadgeList] = useState([])
  const [rewardList, setRewardList] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [showNewChallenge, setShowNewChallenge] = useState(false)
  const [redeemTarget, setRedeemTarget] = useState(null)

  function reload() {
    challenges.list().then(setChallengeList)
    badges.list().then(setBadgeList)
    rewards.list().then(setRewardList)
    employees.list().then((rows) => {
      setLeaderboard([...rows].sort((a, b) => b.xp - a.xp))
      setEmployeeOptions(rows.map((e) => ({ value: e.id, label: `${e.name} (${e.department})` })))
    })
  }

  useEffect(() => {
    reload()
    categories.list().then((rows) => setCategoryOptions(rows.filter((c) => c.type === 'Challenge').map((c) => ({ value: c.id, label: c.name }))))
  }, [])

  async function createChallenge(values) {
    await challenges.create({
      title: values.title,
      category: values.category || null,
      description: values.description,
      xp: Number(values.xp) || 0,
      difficulty: values.difficulty || 'medium',
      evidence_required: !!values.evidence_required,
      deadline: values.deadline,
      status: values.status || 'draft',
    })
    reload()
  }

  async function redeem(values) {
    await rewardRedemptions.redeem(redeemTarget.id, values.employee)
    reload()
  }

  return (
    <Layout title="Gamification">
      <Tabs tabs={TABS} active={active} onChange={setActive} />

      {active === 'Challenges' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-2 text-xs text-ink-400">
              {LIFECYCLE.map((stage, i) => (
                <span key={stage} className="flex items-center gap-1">
                  {i > 0 && <span className="text-ink-200">→</span>}
                  {stage}
                </span>
              ))}
              <span className="text-ink-200">| Archived at any point</span>
            </div>
            <button
              onClick={() => setShowNewChallenge(true)}
              className="flex items-center gap-1.5 rounded-lg bg-moss-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-moss-600"
            >
              <Plus size={15} /> New Challenge
            </button>
          </div>
          <DataTable
            columns={[
              { key: 'title', header: 'Challenge' },
              { key: 'category', header: 'Category' },
              { key: 'difficulty', header: 'Difficulty' },
              { key: 'xp', header: 'XP' },
              { key: 'deadline', header: 'Deadline' },
              { key: 'status', header: 'Status', render: (r) => <Pill>{r.status}</Pill> },
            ]}
            rows={challengeList}
          />
        </div>
      )}

      {active === 'Badges' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {badgeList.map((b) => (
            <div key={b.id} className="flex flex-col items-center rounded-xl border border-ink-100 bg-card p-5 text-center shadow-soft">
              <span className="mb-2 text-3xl">{b.icon}</span>
              <p className="font-medium text-ink-800">{b.name}</p>
              <p className="mt-1 text-xs text-ink-400">{b.description}</p>
              <div className="mt-3 flex items-center gap-1 rounded-full bg-ink-50 px-2 py-1 text-[11px] text-ink-400">
                <Lock size={11} /> Auto-awarded
              </div>
            </div>
          ))}
        </div>
      )}

      {active === 'Rewards' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {rewardList.map((r) => (
            <div key={r.id} className="rounded-xl border border-ink-100 bg-card p-5 shadow-soft">
              <div className="mb-2 flex items-center justify-between">
                <Gift size={18} className="text-gold-700" />
                <Pill tone={r.status === 'Out of Stock' ? 'red' : 'green'}>{r.status}</Pill>
              </div>
              <p className="font-medium text-ink-800">{r.name}</p>
              <p className="mt-1 text-xs text-ink-400">{r.description}</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-mono font-medium text-ink-700">{r.pointsRequired} pts</span>
                <span className="text-xs text-ink-400">{r.stock} left</span>
              </div>
              <button
                onClick={() => setRedeemTarget(r)}
                disabled={r.status === 'Out of Stock'}
                className="mt-3 w-full rounded-lg bg-gold-500 py-2 text-sm font-medium text-white hover:bg-gold-700 disabled:cursor-not-allowed disabled:bg-ink-100 disabled:text-ink-400"
              >
                Redeem
              </button>
            </div>
          ))}
        </div>
      )}

      {active === 'Leaderboard' && (
        <div className="rounded-2xl border border-ink-100 bg-card p-2 shadow-soft">
          {leaderboard.map((e, i) => (
            <div key={e.id} className="flex items-center gap-4 border-b border-ink-100 px-4 py-3 last:border-0">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-semibold ${
                i === 0 ? 'bg-gold-100 text-gold-700' : i === 1 ? 'bg-ink-100 text-ink-500' : i === 2 ? 'bg-brick-100 text-brick-700' : 'bg-ink-50 text-ink-400'
              }`}>
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-ink-800">{e.name}</p>
                <p className="text-xs text-ink-400">{e.department}</p>
              </div>
              <div className="w-40">
                <ProgressBar value={e.xp} max={leaderboard[0]?.xp || 1} colorClass="bg-moss-500" />
              </div>
              <div className="flex w-20 items-center justify-end gap-1 font-mono text-sm font-medium text-ink-700">
                <Trophy size={13} className="text-gold-700" /> {e.xp}
              </div>
            </div>
          ))}
        </div>
      )}

      <ResourceFormModal
        open={showNewChallenge}
        title="New Challenge"
        onClose={() => setShowNewChallenge(false)}
        onSubmit={createChallenge}
        fields={[
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'category', label: 'Category', type: 'select', options: categoryOptions },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'xp', label: 'XP reward', type: 'number', defaultValue: 0 },
          { name: 'difficulty', label: 'Difficulty', type: 'select', options: DIFFICULTY_OPTIONS, defaultValue: 'medium' },
          { name: 'evidence_required', label: 'Evidence required', type: 'checkbox', checkboxLabel: 'Participants must submit proof', defaultValue: true },
          { name: 'deadline', label: 'Deadline', type: 'date', required: true },
          { name: 'status', label: 'Status', type: 'select', options: CHALLENGE_STATUS_OPTIONS, defaultValue: 'draft' },
        ]}
      />

      <ResourceFormModal
        open={!!redeemTarget}
        title={redeemTarget ? `Redeem: ${redeemTarget.name}` : 'Redeem'}
        submitLabel="Redeem"
        onClose={() => setRedeemTarget(null)}
        onSubmit={redeem}
        fields={[
          {
            name: 'employee',
            label: 'Employee',
            type: 'select',
            required: true,
            options: employeeOptions,
            help: `Costs ${redeemTarget?.pointsRequired ?? 0} points. The backend checks the employee's point balance and remaining stock.`,
          },
        ]}
      />
    </Layout>
  )
}
