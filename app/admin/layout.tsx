import { signout } from '@/app/auth/actions'
import { requireAdminSession } from '@/lib/auth/service'
import { SidebarNav } from '@/app/(app)/_components/sidebar-nav'

const adminNavigation = [
  { href: '/admin/accounts', label: 'Learner Accounts' },
  { href: '/admin/accounts/new', label: 'Create Account' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAdminSession()

  return (
    <div className="layout-container">
      <nav className="app-sidebar glass">
        <div>
          <p className="sidebar-eyebrow">Admin workspace</p>
          <h2 className="sidebar-title">Lumina IELTS</h2>
          <p className="sidebar-subtitle">{session.fullName}</p>
        </div>
        <SidebarNav items={adminNavigation} />
        <div className="sidebar-footer">
          <form action={signout} className="sidebar-signout-form">
            <button type="submit" className="secondary-button sidebar-signout-button">
              Sign Out
            </button>
          </form>
          <p>Admin account management</p>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  )
}
