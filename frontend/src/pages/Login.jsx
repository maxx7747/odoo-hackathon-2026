import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sprout } from 'lucide-react'
import { auth } from '../lib/api.js'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const { token } = await auth.login(username, password)
      localStorage.setItem('ecosphere_token', token)
      navigate('/')
    } catch (err) {
      setError('Invalid credentials. Check your username and password.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-800 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-soft">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-moss-500 text-white">
            <Sprout size={18} />
          </div>
          <div>
            <p className="font-display text-lg font-semibold leading-none text-ink-800">EcoSphere</p>
            <p className="text-[11px] uppercase tracking-wider text-ink-400">ESG Platform</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-600">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm text-ink-800 focus:border-moss-500"
              placeholder="demo.admin"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm text-ink-800 focus:border-moss-500"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-sm text-brick-600">{error}</p>}
          <button type="submit" className="w-full rounded-lg bg-moss-500 py-2.5 text-sm font-medium text-white hover:bg-moss-600">
            Sign in
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-ink-400">
          Connects to the Django API at <code>/api/auth-token/</code>
        </p>
      </div>
    </div>
  )
}
