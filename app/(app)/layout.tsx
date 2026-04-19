import { signout } from '@/app/auth/actions'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { SidebarNav } from './_components/sidebar-nav'

const learnerNavigation = [
  { href: '/', label: 'Dashboard' },
  { href: '/writing', label: 'Writing Assistant' },
  { href: '/tracker', label: 'Score Tracker' },
  { href: '/settings/profile', label: 'Profile Settings' },
]

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireLearnerAppSession()

  return (
    <div className="layout-container">
      <nav className="app-sidebar glass">
        <div>
          <p className="sidebar-eyebrow">Personal prep workspace</p>
          <h2 className="sidebar-title">Lumina IELTS</h2>
          <p className="sidebar-subtitle">{session.fullName}</p>
        </div>
        <SidebarNav items={learnerNavigation} />
        <div className="sidebar-footer">
          <form action={signout} className="sidebar-signout-form">
            <button type="submit" className="secondary-button sidebar-signout-button">
              Sign Out
            </button>
          </form>
          <p>Version 1.0 MVP</p>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  )
}
