'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChecklistIcon,
  CompassIcon,
  DashboardIcon,
  ProfileIcon,
  SparklesIcon,
  TrackerIcon,
  WritingIcon,
} from '@/app/_components/ui/app-icons'

type NavigationItem = {
  href: string
  label: string
  icon?:
    | 'dashboard'
    | 'writing'
    | 'tracker'
    | 'plan'
    | 'review'
    | 'profile'
    | 'accounts'
    | 'create'
}

type SidebarNavProps = {
  items: NavigationItem[]
}

export type { NavigationItem }

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname()
  const iconMap: Record<NonNullable<NavigationItem['icon']>, React.ReactNode> = {
    dashboard: <DashboardIcon className="sidebar-icon" />,
    writing: <WritingIcon className="sidebar-icon" />,
    tracker: <TrackerIcon className="sidebar-icon" />,
    plan: <CompassIcon className="sidebar-icon" />,
    review: <ChecklistIcon className="sidebar-icon" />,
    profile: <ProfileIcon className="sidebar-icon" />,
    accounts: <ProfileIcon className="sidebar-icon" />,
    create: <SparklesIcon className="sidebar-icon" />,
  }

  return (
    <div className="sidebar-nav">
      {items.map((item) => {
        const isActive =
          item.href === '/' ? pathname === item.href : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link${isActive ? ' is-active' : ''}`}
          >
            <span className="sidebar-link-content">
              {item.icon ? iconMap[item.icon] : <DashboardIcon className="sidebar-icon" />}
              <span>{item.label}</span>
            </span>
            <span className="sidebar-link-accent" aria-hidden="true" />
          </Link>
        )
      })}
    </div>
  )
}
