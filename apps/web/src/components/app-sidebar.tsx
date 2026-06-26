'use client'

import { usePathname } from 'next/navigation'

const links = [
  { href: '/chat', label: 'Chat' },
  { href: '/providers', label: 'Providers' },
  { href: '/settings', label: 'Models' },
  { href: '/mcp', label: 'MCP' },
  { href: '/skills', label: 'Skills' },
]

export function AppSidebar({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">AgentHub</div>
        <div className="brand-sub">opencode console</div>
      </div>
      {links.map((link) => (
        <a key={link.href} className={`nav-link${pathname.startsWith(link.href) ? ' active' : ''}`} href={link.href}>{link.label}</a>
      ))}
      {children}
    </aside>
  )
}
