'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { LoginIllustration } from '@/app/_components/ui/pastel-illustrations'
import { StatusCallout } from '@/app/_components/ui/status-callout'

type LoginResponse =
  | {
      ok: true
      redirectTo: string
      theme: string
    }
  | {
      ok: false
      error: string
    }

type LoginFormProps = {
  demoCredentials?: {
    admin: {
      email: string
      password: string
    }
    learner: {
      email: string
      password: string
    }
  }
}

export function LoginForm({ demoCredentials }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const payload = (await response.json()) as LoginResponse

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.ok ? 'Unable to sign in right now.' : payload.error
        )
      }

      document.documentElement.dataset.theme = payload.theme
      router.push(payload.redirectTo)
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to sign in right now.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function autofillDemoAccount(role: 'admin' | 'learner') {
    if (!demoCredentials) {
      return
    }

    setEmail(demoCredentials[role].email)
    setPassword(demoCredentials[role].password)
    setErrorMessage(null)
  }

  return (
    <div className="auth-shell">
      <div className="glass auth-card">
        <div className="auth-illustration-wrap">
          <LoginIllustration className="auth-illustration" />
        </div>
        <div className="auth-copy">
          <p className="section-label">Authentication</p>
          <h1>Sign in to Lumina IELTS</h1>
          <p>
            Lumina uses admin-managed learner accounts. Enter the credentials
            you received to access your IELTS practice workspace.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">Learner-only access</span>
            <span className="hero-badge">Pastel theme on each login</span>
          </div>
        </div>

        {!isSupabaseConfigured() && demoCredentials ? (
          <StatusCallout
            variant="info"
            title="Demo mode is active."
            actions={
              <div className="demo-credentials">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => autofillDemoAccount('admin')}
                >
                  Use demo admin
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => autofillDemoAccount('learner')}
                >
                  Use demo learner
                </button>
              </div>
            }
          >
            <p>Use the seeded accounts below or create a learner account from the admin area.</p>
          </StatusCallout>
        ) : null}

        {errorMessage ? (
          <StatusCallout variant="error" title="Unable to sign in right now.">
            <p>{errorMessage}</p>
          </StatusCallout>
        ) : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              className="text-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="learner@example.com"
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="text-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
