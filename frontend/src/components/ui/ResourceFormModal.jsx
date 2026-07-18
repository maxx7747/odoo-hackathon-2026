import { useEffect, useState } from 'react'
import Modal from './Modal.jsx'

// Generic, schema-driven form used by every "New X" / "Add X" button in the
// app, so each page just declares its fields instead of hand-building a form.
//
// field: {
//   name, label, required?, help?, defaultValue?, checkboxLabel?,
//   type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox',
//   options?: [{ value, label }],   // for type: 'select'
// }
export default function ResourceFormModal({ open, title, fields, onClose, onSubmit, submitLabel = 'Create' }) {
  const [values, setValues] = useState(() => initialValues(fields))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setValues(initialValues(fields))
      setError('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function set(name, value) {
    setValues((v) => ({ ...v, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSubmit(values)
      onClose()
    } catch (err) {
      setError(describeError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-ink-100 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="resource-form-modal"
            disabled={saving}
            className="rounded-lg bg-moss-500 px-4 py-2 text-sm font-medium text-white hover:bg-moss-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : submitLabel}
          </button>
        </>
      }
    >
      <form id="resource-form-modal" onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <FieldInput key={field.name} field={field} value={values[field.name]} onChange={(v) => set(field.name, v)} />
        ))}
        {error && <p className="rounded-lg bg-brick-100 px-3 py-2 text-sm text-brick-700">{error}</p>}
      </form>
    </Modal>
  )
}

function initialValues(fields) {
  const v = {}
  for (const f of fields) v[f.name] = f.defaultValue ?? (f.type === 'checkbox' ? false : '')
  return v
}

function describeError(err) {
  const data = err?.response?.data
  if (data && typeof data === 'object') {
    return Object.entries(data)
      .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
      .join(' ')
  }
  return err?.message || 'Something went wrong. Please try again.'
}

function FieldInput({ field, value, onChange }) {
  const base =
    'w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm text-ink-800 focus:border-moss-500 focus:outline-none'

  if (field.type === 'select') {
    return (
      <Labeled field={field}>
        <select required={field.required} value={value} onChange={(e) => onChange(e.target.value)} className={base}>
          <option value="">Select…</option>
          {(field.options || []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Labeled>
    )
  }

  if (field.type === 'textarea') {
    return (
      <Labeled field={field}>
        <textarea required={field.required} value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={base} />
      </Labeled>
    )
  }

  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 text-sm text-ink-600">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-ink-100" />
        {field.checkboxLabel || field.label}
      </label>
    )
  }

  return (
    <Labeled field={field}>
      <input
        type={field.type || 'text'}
        required={field.required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      />
    </Labeled>
  )
}

function Labeled({ field, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink-600">
        {field.label}
        {field.required && ' *'}
      </label>
      {children}
      {field.help && <p className="mt-1 text-xs text-ink-400">{field.help}</p>}
    </div>
  )
}
