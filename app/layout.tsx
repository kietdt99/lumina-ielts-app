import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lumina IELTS',
  description: 'AI-powered practice platform to achieve your target IELTS band.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <div className="layout-container">
          <nav className="glass" style={{ width: 'var(--nav-width)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'fixed', height: '100vh', left: 0, top: 0, borderTop: 'none', borderLeft: 'none', borderBottom: 'none', borderRadius: 0 }}>
            <h2 style={{ color: 'var(--primary)' }}>Lumina IELTS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '2rem' }}>
              <a href="/" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)', fontWeight: 500 }}>Dashboard</a>
              <a href="/writing" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius)', fontWeight: 500, opacity: 0.8 }}>Writing Assistant</a>
              <a href="/tracker" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius)', fontWeight: 500, opacity: 0.8 }}>Score Tracker</a>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Version 1.0 (MVP)</p>
            </div>
          </nav>
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
