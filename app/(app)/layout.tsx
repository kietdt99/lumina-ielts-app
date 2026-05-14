import { signout } from '@/app/auth/actions'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { pastelThemeLabels, readPastelThemeCookie } from '@/lib/theme/pastel-theme'
import { SidebarNav } from './_components/sidebar-nav'
import type { NavigationItem } from './_components/sidebar-nav'

const learnerNavigation: NavigationItem[] = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/writing', label: 'Writing Assistant', icon: 'writing' },
  { href: '/rubric-guide', label: 'Rubric Guide', icon: 'review' },
  { href: '/idea-bank', label: 'Idea Bank', icon: 'ideas' },
  { href: '/model-fragments', label: 'Model Fragments', icon: 'outline' },
  { href: '/outline-builder', label: 'Outline Builder', icon: 'outline' },
  { href: '/tracker', label: 'Score Tracker', icon: 'tracker' },
  { href: '/study-plan', label: 'Study Plan', icon: 'plan' },
  { href: '/review-queue', label: 'Review Queue', icon: 'review' },
  { href: '/mistake-library', label: 'Mistake Library', icon: 'journal' },
  { href: '/mistake-journal', label: 'Mistake Journal', icon: 'journal' },
  { href: '/settings/profile', label: 'Profile Settings', icon: 'profile' },
]

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireLearnerAppSession()
  const theme = await readPastelThemeCookie()

  return (
    <div className="layout-container">
      <nav className="app-sidebar glass">
        <div>
          <p className="sidebar-eyebrow">Personal prep workspace</p>
          <h2 className="sidebar-title">Lumina IELTS</h2>
          <p className="sidebar-subtitle">{session.fullName}</p>
          <div className="theme-chip" aria-label={`Current pastel theme: ${pastelThemeLabels[theme]}`}>
            <span className="theme-chip-dot" />
            <span>{pastelThemeLabels[theme]}</span>
          </div>
        </div>
        <SidebarNav items={learnerNavigation} />
        <div className="sidebar-footer">
          <form action={signout} className="sidebar-signout-form">
            <button type="submit" className="secondary-button sidebar-signout-button">
              Sign Out
            </button>
          </form>
          <p>Version 1.0 MVP</p>
          <p className="sidebar-footnote">Writing-first learner workspace</p>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  )
}
