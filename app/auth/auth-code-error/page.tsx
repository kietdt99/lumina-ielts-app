import Link from 'next/link'
import { LoginIllustration } from '@/app/_components/ui/pastel-illustrations'

export default function AuthCodeErrorPage() {
  return (
    <div className="auth-shell">
      <div className="glass auth-card">
        <div className="auth-illustration-wrap">
          <LoginIllustration className="auth-illustration" />
        </div>
        <div className="auth-copy">
          <p className="section-label">Authentication</p>
          <h1>We could not verify your sign-in link</h1>
          <p>
            The authentication callback was missing or expired. Return to the
            sign-in screen and try again.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">Expired callback</span>
            <span className="hero-badge">Safe to retry</span>
          </div>
        </div>

        <div className="soft-note">
          If this keeps happening, start a fresh sign-in attempt instead of
          reusing an older browser tab or email link.
        </div>

        <Link href="/auth" className="primary-button">
          Back to authentication
        </Link>
      </div>
    </div>
  )
}
