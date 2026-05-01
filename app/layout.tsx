import type { Metadata } from 'next'
import { readPastelThemeCookie } from '@/lib/theme/pastel-theme'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lumina IELTS',
  description: 'AI-powered practice platform to achieve your target IELTS band.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const theme = await readPastelThemeCookie()

  return (
    <html lang="en" data-theme={theme}>
      <body>{children}</body>
    </html>
  )
}
