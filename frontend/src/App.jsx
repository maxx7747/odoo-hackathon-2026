import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import EnvironmentalDashboard from './pages/environmental/EnvironmentalDashboard.jsx'
import SocialDashboard from './pages/social/SocialDashboard.jsx'
import GovernanceDashboard from './pages/governance/GovernanceDashboard.jsx'
import GamificationDashboard from './pages/gamification/GamificationDashboard.jsx'
import Reports from './pages/reports/Reports.jsx'
import Settings from './pages/settings/Settings.jsx'
import Login from './pages/Login.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/environmental" element={<EnvironmentalDashboard />} />
      <Route path="/social" element={<SocialDashboard />} />
      <Route path="/governance" element={<GovernanceDashboard />} />
      <Route path="/gamification" element={<GamificationDashboard />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}
