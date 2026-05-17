import { signout } from '@/app/auth/actions'
import { UserAvatar } from '@/app/_components/ui/user-avatar'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { readAppLanguageCookie, type AppLanguage } from '@/lib/i18n/app-language'
import { LanguageSwitch } from './_components/language-switch'
import { SidebarNav } from './_components/sidebar-nav'
import type { NavigationItem } from './_components/sidebar-nav'

const appShellCopy: Record<
  AppLanguage,
  {
    eyebrow: string
    subtitle: string
    themeLabel: string
    themeName: string
    navGroups: {
      start: string
      practice: string
      progress: string
    }
    nav: {
      dashboard: string
      writing: string
      mockTest: string
      studyPlan: string
      tracker: string
      profile: string
    }
    languageLabel: string
    learnerRole: string
    signOut: string
    version: string
    footnote: string
  }
> = {
  vi: {
    eyebrow: 'Workspace luyện IELTS',
    subtitle: 'Không gian học cá nhân',
    themeLabel: 'Giao diện hiện tại: Peach Focus',
    themeName: 'Peach Focus',
    navGroups: {
      start: 'Bắt đầu',
      practice: 'Luyện tập',
      progress: 'Tiến độ',
    },
    nav: {
      dashboard: 'Hôm nay',
      writing: 'Luyện Writing',
      mockTest: 'Mock Test',
      studyPlan: 'Lộ trình',
      tracker: 'Điểm số',
      profile: 'Hồ sơ',
    },
    languageLabel: 'Chọn ngôn ngữ',
    learnerRole: 'Learner',
    signOut: 'Đăng xuất',
    version: 'Version 2',
    footnote: 'Workspace luyện IELTS bốn kỹ năng',
  },
  en: {
    eyebrow: 'IELTS practice workspace',
    subtitle: 'Personal study space',
    themeLabel: 'Current app theme: Peach Focus',
    themeName: 'Peach Focus',
    navGroups: {
      start: 'Start',
      practice: 'Practice',
      progress: 'Progress',
    },
    nav: {
      dashboard: 'Today',
      writing: 'Writing Lab',
      mockTest: 'Mock Test',
      studyPlan: 'Study Plan',
      tracker: 'Progress',
      profile: 'Profile',
    },
    languageLabel: 'Language selector',
    learnerRole: 'Learner',
    signOut: 'Sign Out',
    version: 'Version 2',
    footnote: 'Four-skill learner workspace',
  },
}

function createLearnerNavigation(language: AppLanguage): NavigationItem[] {
  const copy = appShellCopy[language]

  return [
    {
      href: '/dashboard',
      label: copy.nav.dashboard,
      group: copy.navGroups.start,
      icon: 'dashboard',
    },
    {
      href: '/study-plan',
      label: copy.nav.studyPlan,
      group: copy.navGroups.start,
      icon: 'plan',
    },
    {
      href: '/writing',
      label: copy.nav.writing,
      group: copy.navGroups.practice,
      icon: 'writing',
    },
    {
      href: '/mock-test',
      label: copy.nav.mockTest,
      group: copy.navGroups.practice,
      icon: 'timer',
    },
    {
      href: '/tracker',
      label: copy.nav.tracker,
      group: copy.navGroups.progress,
      icon: 'tracker',
    },
    {
      href: '/settings/profile',
      label: copy.nav.profile,
      group: copy.navGroups.progress,
      icon: 'profile',
    },
  ]
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, language] = await Promise.all([
    requireLearnerAppSession(),
    readAppLanguageCookie(),
  ])
  const copy = appShellCopy[language]
  const learnerNavigation = createLearnerNavigation(language)

  return (
    <div className="layout-container">
      <nav className="app-sidebar glass">
        <div>
          <p className="sidebar-eyebrow">{copy.eyebrow}</p>
          <h2 className="sidebar-title">Lumina IELTS</h2>
          <p className="sidebar-subtitle">{copy.subtitle}</p>
          <div className="theme-chip" aria-label={copy.themeLabel}>
            <span className="theme-chip-dot" />
            <span>{copy.themeName}</span>
          </div>
          <LanguageSwitch
            currentLanguage={language}
            label={copy.languageLabel}
          />
        </div>
        <SidebarNav items={learnerNavigation} />
        <div className="sidebar-footer">
          <div className="sidebar-user-strip">
            <UserAvatar avatarUrl={session.avatarUrl} name={session.fullName} />
            <div>
              <strong>{session.fullName}</strong>
              <p>{copy.learnerRole}</p>
            </div>
          </div>
          <form action={signout} className="sidebar-signout-form">
            <button type="submit" className="secondary-button sidebar-signout-button">
              {copy.signOut}
            </button>
          </form>
          <p>{copy.version}</p>
          <p className="sidebar-footnote">{copy.footnote}</p>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  )
}
