import { useState } from 'react'
import { FileText, Leaf, Users, ShieldCheck, LayoutDashboard, Download } from 'lucide-react'
import Layout from '../../components/layout/Layout.jsx'
import { reports } from '../../lib/api.js'

const STANDARD = [
  { key: 'environmental', title: 'Environmental Report', icon: Leaf, tone: 'text-moss-700 bg-moss-50' },
  { key: 'social', title: 'Social Report', icon: Users, tone: 'text-sky-700 bg-sky-100' },
  { key: 'governance', title: 'Governance Report', icon: ShieldCheck, tone: 'text-plum-700 bg-plum-100' },
  { key: 'summary', title: 'ESG Summary Report', icon: LayoutDashboard, tone: 'text-gold-700 bg-gold-100' },
]

const FILTER_FIELDS = ['Department', 'Date Range', 'Module', 'Employee', 'Challenge', 'ESG Category']

export default function Reports() {
  const [filters, setFilters] = useState({})
  const [format, setFormat] = useState('PDF')
  const [status, setStatus] = useState('')

  function updateFilter(field, value) {
    setFilters((f) => ({ ...f, [field]: value }))
  }

  async function handleGenerate() {
    setStatus('Generating…')
    const res = await reports.generate({ filters, format })
    setStatus(res.message || 'Report generated.')
  }

  return (
    <Layout title="Reports">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STANDARD.map(({ key, title, icon: Icon, tone }) => (
          <div key={key} className="rounded-xl border border-ink-100 bg-card p-5 shadow-soft">
            <div className={`mb-3 inline-flex rounded-lg p-2 ${tone}`}>
              <Icon size={18} />
            </div>
            <p className="font-medium text-ink-800">{title}</p>
            <p className="mt-1 text-xs text-ink-400">Current reporting period</p>
            <button
              onClick={() => reports.generate({ report: key, format: 'PDF' }).then((r) => setStatus(r.message))}
              className="mt-4 flex items-center gap-1.5 text-sm font-medium text-moss-700 hover:text-moss-600"
            >
              <Download size={14} /> Export PDF
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-ink-100 bg-card p-6 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <FileText size={18} className="text-ink-500" />
          <p className="font-display text-lg font-semibold text-ink-800">Custom Report Builder</p>
        </div>
        <p className="mb-5 text-sm text-ink-400">Combine any of the filters below, then export the result.</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FILTER_FIELDS.map((field) => (
            <div key={field}>
              <label className="mb-1 block text-sm font-medium text-ink-600">{field}</label>
              <input
                onChange={(e) => updateFilter(field, e.target.value)}
                placeholder={field === 'Date Range' ? 'e.g. Jun 1 – Jul 15, 2026' : `Filter by ${field.toLowerCase()}`}
                className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm text-ink-800 focus:border-moss-500"
              />
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-600">Export format</label>
            <div className="flex gap-2">
              {['PDF', 'Excel', 'CSV'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                    format === f ? 'border-moss-500 bg-moss-50 text-moss-700' : 'border-ink-100 text-ink-500 hover:bg-ink-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleGenerate}
            className="ml-auto mt-6 flex items-center gap-1.5 rounded-lg bg-moss-500 px-4 py-2 text-sm font-medium text-white hover:bg-moss-600"
          >
            <Download size={15} /> Generate Report
          </button>
        </div>
        {status && <p className="mt-3 text-sm text-ink-500">{status}</p>}
      </div>
    </Layout>
  )
}
