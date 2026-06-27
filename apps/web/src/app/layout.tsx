import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgentHub | Hosted OpenCode control plane',
  description: 'Hosted OpenCode workspace for provider auth, model routing, MCP servers, skills, and isolated AI sessions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
