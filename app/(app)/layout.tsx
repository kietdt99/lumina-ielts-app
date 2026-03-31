import { SidebarNav } from './_components/sidebar-nav'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="layout-container">
      <nav className="app-sidebar glass">
        <div>
          <p className="sidebar-eyebrow">Personal prep workspace</p>
          <h2 className="sidebar-title">Lumina IELTS</h2>
        </div>
        <SidebarNav />
        <div className="sidebar-footer">
          <p>Version 1.0 MVP</p>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  )
}
