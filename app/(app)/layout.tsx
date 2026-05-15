import { signout } from '@/app/auth/actions'
import { UserAvatar } from '@/app/_components/ui/user-avatar'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { SidebarNav } from './_components/sidebar-nav'
import type { NavigationItem } from './_components/sidebar-nav'

const learnerNavigation: NavigationItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/writing', label: 'Writing Assistant', icon: 'writing' },
  { href: '/reading-practice', label: 'Reading Practice', icon: 'review' },
  { href: '/listening-practice', label: 'Listening Practice', icon: 'timer' },
  { href: '/speaking-practice', label: 'Speaking Practice', icon: 'writing' },
  { href: '/mock-test', label: 'Mock Test Lab', icon: 'timer' },
  { href: '/study-plan', label: 'Study Plan', icon: 'plan' },
  { href: '/tracker', label: 'Score Tracker', icon: 'tracker' },
  { href: '/settings/profile', label: 'Profile Settings', icon: 'profile' },
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
          <div className="theme-chip" aria-label="Current app theme: Peach Focus">
            <span className="theme-chip-dot" />
            <span>Peach Focus</span>
          </div>
        </div>
        <SidebarNav items={learnerNavigation} />
        <div className="sidebar-footer">
          <div className="sidebar-user-strip">
            <UserAvatar avatarUrl={session.avatarUrl} name={session.fullName} />
            <div>
              <strong>{session.fullName}</strong>
              <p>Learner</p>
            </div>
          </div>
          <form action={signout} className="sidebar-signout-form">
            <button type="submit" className="secondary-button sidebar-signout-button">
              Sign Out
            </button>
          </form>
          <p>Version 2</p>
          <p className="sidebar-footnote">Four-skill learner workspace</p>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  )
}
