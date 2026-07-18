import EmptyState from './EmptyState.jsx'

export default function DataTable({ columns, rows, keyField = 'id', emptyLabel = 'No records yet', actions }) {
  if (!rows || rows.length === 0) {
    return <EmptyState label={emptyLabel} />
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-100 bg-card shadow-soft">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink-100 bg-ink-50/50">
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 font-medium text-ink-400">
                {col.header}
              </th>
            ))}
            {actions && <th className="px-4 py-3 text-right font-medium text-ink-400">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[keyField]} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/40">
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-4 py-3 text-ink-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
