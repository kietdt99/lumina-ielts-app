import type { Metadata } from 'next'
import { readAppLanguageCookie } from '@/lib/i18n/app-language'
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
  const [language, theme] = await Promise.all([
    readAppLanguageCookie(),
    readPastelThemeCookie(),
  ])

  return (
    <html lang={language} data-language={language} data-theme={theme}>
      <body>{children}</body>
    </html>
  )
}
