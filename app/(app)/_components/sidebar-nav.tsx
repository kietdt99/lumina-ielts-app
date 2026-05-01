'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  DashboardIcon,
  ProfileIcon,
  TrackerIcon,
  WritingIcon,
} from '@/app/_components/ui/app-icons'

type NavigationItem = {
  href: string
  label: string
}

type SidebarNavProps = {
  items: NavigationItem[]
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname()
  const iconMap: Record<string, React.ReactNode> = {
    '/': <DashboardIcon className="sidebar-icon" />,
    '/writing': <WritingIcon className="sidebar-icon" />,
    '/tracker': <TrackerIcon className="sidebar-icon" />,
    '/settings/profile': <ProfileIcon className="sidebar-icon" />,
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
              {iconMap[item.href] ?? <DashboardIcon className="sidebar-icon" />}
              <span>{item.label}</span>
            </span>
          </Link>
        )
      })}
    </div>
  )
}
