'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginIllustration } from '@/app/_components/ui/pastel-illustrations'
import { StatusCallout } from '@/app/_components/ui/status-callout'

type ChangePasswordResponse =
  | {
      ok: true
      redirectTo: string
    }
  | {
      ok: false
      error: string
    }

type ChangePasswordFormProps = {
  allowSkip: boolean
  requireCurrentPassword: boolean
}

export function ChangePasswordForm({
  allowSkip,
  requireCurrentPassword,
}: ChangePasswordFormProps) {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    if (nextPassword !== confirmPassword) {
      setErrorMessage('The new password confirmation does not match.')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          nextPassword,
          requireCurrentPassword,
        }),
      })

      const payload = (await response.json()) as ChangePasswordResponse

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.ok ? 'Unable to update your password right now.' : payload.error
        )
      }

      setSuccessMessage('Password updated successfully.')
      router.push(payload.redirectTo)
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to update your password right now.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSkip() {
    setIsSkipping(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/auth/skip-password-change', {
        method: 'POST',
      })
      const payload = (await response.json()) as ChangePasswordResponse

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.ok ? 'Unable to continue right now.' : payload.error
        )
      }

      router.push(payload.redirectTo)
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to continue right now.'
      )
    } finally {
      setIsSkipping(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="glass auth-card">
        <div className="auth-illustration-wrap">
          <LoginIllustration className="auth-illustration" />
        </div>
        <div className="auth-copy">
          <p className="section-label">Security</p>
          <h1>Change your password before you continue</h1>
          <p>
            Your learner account started with a temporary password. Update it
            now, or skip once and change it later from profile settings.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">Temporary password</span>
            <span className="hero-badge">One-time setup</span>
          </div>
        </div>

        <div className="soft-note">
          Use a memorable passphrase with at least 12 characters so you can get
          back into practice without friction.
        </div>

        {errorMessage ? (
          <StatusCallout variant="error" title="Unable to update your password">
            <p>{errorMessage}</p>
          </StatusCallout>
        ) : null}

        {successMessage ? (
          <StatusCallout variant="success" title="Password updated successfully.">
            <p>{successMessage}</p>
          </StatusCallout>
        ) : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          {requireCurrentPassword ? (
            <div className="field-group">
              <label htmlFor="current-password">Current password</label>
              <input
                id="current-password"
                type="password"
                className="text-input"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </div>
          ) : null}

          <div className="field-group">
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              className="text-input"
              value={nextPassword}
              onChange={(event) => setNextPassword(event.target.value)}
              minLength={12}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              type="password"
              className="text-input"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={12}
              required
            />
          </div>

          <div className="auth-helper-strip">
            <span className="surface-kicker">Security tip</span>
            <p>Mix a memorable phrase with numbers or symbols so the password stays strong and easy to recall.</p>
          </div>

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Updating password...' : 'Update password'}
          </button>
        </form>

        {allowSkip ? (
          <div className="auth-secondary-actions">
            <button
              type="button"
              className="secondary-button"
              disabled={isSkipping}
              onClick={handleSkip}
            >
              {isSkipping ? 'Continuing...' : 'Skip once and continue'}
            </button>
            <p className="auth-support-copy">
              You can always change it later from profile settings.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
