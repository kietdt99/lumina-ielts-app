'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { href: '/', label: 'Dashboard' },
  { href: '/writing', label: 'Writing Assistant' },
  { href: '/tracker', label: 'Score Tracker' },
  { href: '/settings', label: 'Settings' },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <div className="sidebar-nav">
      {navigation.map((item) => {
        const isActive =
          item.href === '/' ? pathname === item.href : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link${isActive ? ' is-active' : ''}`}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
