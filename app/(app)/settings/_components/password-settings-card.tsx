'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileIcon } from '@/app/_components/ui/app-icons'

type PasswordSettingsCardProps = {
  mustChangePassword: boolean
}

type ChangePasswordResponse =
  | {
      ok: true
      redirectTo: string
    }
  | {
      ok: false
      error: string
    }

export function PasswordSettingsCard({
  mustChangePassword,
}: PasswordSettingsCardProps) {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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
          requireCurrentPassword: true,
        }),
      })

      const payload = (await response.json()) as ChangePasswordResponse

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.ok ? 'Unable to update your password right now.' : payload.error
        )
      }

      setCurrentPassword('')
      setNextPassword('')
      setConfirmPassword('')
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

  return (
    <section className="glass writing-panel">
      <div className="panel-heading">
        <h2 className="icon-heading">
          <ProfileIcon className="section-icon" />
          <span>Password</span>
        </h2>
        <p>
          Keep your learner account secure. You can change your password here at
          any time.
        </p>
      </div>

      <div className="soft-note">
        Use a long passphrase you will remember. A stronger password means fewer
        interruptions while you focus on practice.
      </div>

      {mustChangePassword ? (
        <div className="feedback-banner info-banner">
          Your account is still marked for a password update. Change it now to
          clear the reminder banner.
        </div>
      ) : null}

      {errorMessage ? (
        <div className="feedback-error" role="alert">
          <strong>Unable to update password</strong>
          <p>{errorMessage}</p>
        </div>
      ) : null}

      {successMessage ? (
        <div className="feedback-banner success-banner">{successMessage}</div>
      ) : null}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="settings-current-password">Current password</label>
          <input
            id="settings-current-password"
            type="password"
            className="text-input"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="settings-new-password">New password</label>
          <input
            id="settings-new-password"
            type="password"
            className="text-input"
            value={nextPassword}
            onChange={(event) => setNextPassword(event.target.value)}
            minLength={12}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="settings-confirm-password">Confirm new password</label>
          <input
            id="settings-confirm-password"
            type="password"
            className="text-input"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={12}
            required
          />
        </div>

        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? 'Updating password...' : 'Update password'}
        </button>
      </form>
    </section>
  )
}
