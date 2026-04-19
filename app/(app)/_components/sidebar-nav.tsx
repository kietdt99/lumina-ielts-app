'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavigationItem = {
  href: string
  label: string
}

type SidebarNavProps = {
  items: NavigationItem[]
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname()

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
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
