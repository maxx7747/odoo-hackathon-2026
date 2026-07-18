import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Cloud, ShieldAlert, Trophy, Clock } from 'lucide-react'
import Layout from '../components/layout/Layout.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import ScoreRing from '../components/ui/ScoreRing.jsx'
import { dashboard } from '../lib/api.js'

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    dashboard.overview().then(setData)
  }, [])

  if (!data) {
    return (
      <Layout title="Overview">
        <p className="text-ink-400">Loading dashboard…</p>
      </Layout>
    )
  }

  const { scores, totalCO2e, openComplianceIssues, overdueIssues, activeChallenges, pendingApprovals, emissionsTrend, departmentScores } = data

  return (
    <Layout title="Overview">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink-100 bg-card p-6 shadow-soft lg:col-span-1">
          <p className="mb-4 text-sm font-medium text-ink-500">Overall ESG Score</p>
          <ScoreRing {...scores} />
          <p className="mt-4 text-xs text-ink-400">
            Weighted average of department scores · Environmental 40% / Social 30% / Governance 30%
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <StatCard label="Total emissions (tCO2e)" value={(totalCO2e / 1000).toFixed(1)} sub="This reporting period" icon={Cloud} tone="moss" />
          <StatCard label="Open compliance issues" value={openComplianceIssues} sub={`${overdueIssues} overdue`} icon={ShieldAlert} tone="brick" />
          <StatCard label="Active challenges" value={activeChallenges} sub="Across all departments" icon={Trophy} tone="gold" />
          <StatCard label="Pending approvals" value={pendingApprovals} sub="CSR + Challenge submissions" icon={Clock} tone="sky" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-ink-100 bg-card p-6 shadow-soft lg:col-span-3">
          <p className="mb-4 text-sm font-medium text-ink-500">Emissions trend (tCO2e)</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={emissionsTrend}>
              <CartesianGrid stroke="#dfe7e2" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5c7d6d' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#5c7d6d' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #dfe7e2', fontSize: 12 }} />
              <Line type="monotone" dataKey="co2e" stroke="#2F6B4F" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-card p-6 shadow-soft lg:col-span-2">
          <p className="mb-4 text-sm font-medium text-ink-500">Department total score</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={departmentScores} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#5c7d6d' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="department" type="category" width={110} tick={{ fontSize: 11, fill: '#5c7d6d' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #dfe7e2', fontSize: 12 }} />
              <Bar dataKey="total" fill="#2F6B4F" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  )
}
