import { X } from 'lucide-react'

export default function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink-800">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-700" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}
