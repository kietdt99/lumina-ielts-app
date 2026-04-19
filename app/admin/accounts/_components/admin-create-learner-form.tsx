'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type CreateAccountResponse =
  | {
      ok: true
      account: {
        email: string
        fullName: string
      }
      temporaryPassword: string
    }
  | {
      ok: false
      error: string
    }

export function AdminCreateLearnerForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    setTemporaryPassword(null)

    try {
      const response = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
        }),
      })

      const payload = (await response.json()) as CreateAccountResponse

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.ok ? 'Unable to create the learner account.' : payload.error
        )
      }

      setTemporaryPassword(payload.temporaryPassword)
      setFullName('')
      setEmail('')
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to create the learner account.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="settings-shell">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Admin</p>
          <h1>Create a learner account</h1>
          <p>
            Lumina generates a temporary password for each new learner account.
            Share it once, then let the learner change it on first login.
          </p>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <span className="metric-label">Flow</span>
            <strong>Admin managed</strong>
          </div>
          <div className="metric-pill">
            <span className="metric-label">Password</span>
            <strong>System generated</strong>
          </div>
          <div className="metric-pill">
            <span className="metric-label">First login</span>
            <strong>Force password change</strong>
          </div>
        </div>
      </section>

      <div className="settings-layout">
        <section className="glass writing-panel">
          <div className="panel-heading">
            <h2>New learner</h2>
            <p>Provide the learner identity and Lumina will generate the credential.</p>
          </div>

          {errorMessage ? (
            <div className="feedback-error" role="alert">
              <strong>Unable to create learner account</strong>
              <p>{errorMessage}</p>
            </div>
          ) : null}

          {temporaryPassword ? (
            <div className="feedback-banner success-banner">
              Temporary password: <strong>{temporaryPassword}</strong>
            </div>
          ) : null}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="learner-full-name">Full name</label>
              <input
                id="learner-full-name"
                className="text-input"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Learner full name"
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="learner-email">Email address</label>
              <input
                id="learner-email"
                type="email"
                className="text-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="learner@example.com"
                required
              />
            </div>

            <div className="settings-actions">
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create learner account'}
              </button>
              <Link href="/admin/accounts" className="secondary-button">
                Back to accounts
              </Link>
            </div>
          </form>
        </section>

        <aside className="glass writing-panel">
          <div className="panel-heading">
            <h2>What happens next</h2>
          </div>

          <ul className="bullet-list">
            <li>Learner signs in with the temporary password.</li>
            <li>Learner is redirected to the password change screen.</li>
            <li>Learner completes onboarding before entering the workspace.</li>
          </ul>
        </aside>
      </div>
    </div>
  )
}
