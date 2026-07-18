import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function Layout({ title, children }) {
  return (
    <div className="flex h-screen bg-paper">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">{children}</main>
      </div>
    </div>
  )
}
