import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lumina IELTS',
  description: 'AI-powered practice platform to achieve your target IELTS band.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  )
}
