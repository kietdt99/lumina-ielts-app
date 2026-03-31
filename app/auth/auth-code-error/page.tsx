import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="auth-shell">
      <div className="glass auth-card">
        <div className="auth-copy">
          <p className="section-label">Authentication</p>
          <h1>We could not verify your sign-in link</h1>
          <p>
            The authentication callback was missing or expired. Return to the
            sign-in screen and try again.
          </p>
        </div>

        <Link href="/auth" className="primary-button">
          Back to authentication
        </Link>
      </div>
    </div>
  )
}
