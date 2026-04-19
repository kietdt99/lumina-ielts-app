'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ManagedLearnerAccount } from '@/lib/auth/types'

type ResetPasswordResponse =
  | {
      ok: true
      temporaryPassword: string
    }
  | {
      ok: false
      error: string
    }

type AdminAccountsManagerProps = {
  accounts: ManagedLearnerAccount[]
}

export function AdminAccountsManager({
  accounts,
}: AdminAccountsManagerProps) {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [revealedCredential, setRevealedCredential] = useState<{
    accountId: string
    temporaryPassword: string
  } | null>(null)
  const [pendingAccountId, setPendingAccountId] = useState<string | null>(null)

  async function handleReset(accountId: string) {
    setPendingAccountId(accountId)
    setErrorMessage(null)
    setRevealedCredential(null)

    try {
      const response = await fetch('/api/admin/accounts/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
        }),
      })

      const payload = (await response.json()) as ResetPasswordResponse

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.ok ? 'Unable to reset the learner password.' : payload.error
        )
      }

      setRevealedCredential({
        accountId,
        temporaryPassword: payload.temporaryPassword,
      })
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to reset the learner password.'
      )
    } finally {
      setPendingAccountId(null)
    }
  }

  return (
    <div className="settings-shell">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Admin</p>
          <h1>Manage learner accounts</h1>
          <p>
            Create learner credentials, monitor onboarding status, and reissue
            temporary passwords when needed.
          </p>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <span className="metric-label">Learners</span>
            <strong>{accounts.length}</strong>
          </div>
          <div className="metric-pill">
            <span className="metric-label">Pending onboarding</span>
            <strong>{accounts.filter((account) => !account.onboardingCompleted).length}</strong>
          </div>
          <div className="metric-pill">
            <span className="metric-label">Password resets due</span>
            <strong>{accounts.filter((account) => account.mustChangePassword).length}</strong>
          </div>
        </div>
      </section>

      <div className="settings-actions">
        <Link href="/admin/accounts/new" className="primary-button">
          Create learner account
        </Link>
      </div>

      {errorMessage ? (
        <div className="feedback-error" role="alert">
          <strong>Unable to manage learner accounts</strong>
          <p>{errorMessage}</p>
        </div>
      ) : null}

      {revealedCredential ? (
        <div className="feedback-banner success-banner">
          Temporary password for this learner: <strong>{revealedCredential.temporaryPassword}</strong>
        </div>
      ) : null}

      <div className="history-list">
        {accounts.map((account) => (
          <article key={account.id} className="glass history-card">
            <div className="history-header">
              <div>
                <h2>{account.fullName}</h2>
                <p>{account.email}</p>
              </div>
              <div className="history-score">
                <strong>{account.onboardingCompleted ? 'Ready' : 'Onboarding'}</strong>
                <p>{account.mustChangePassword ? 'Password update required' : 'Password current'}</p>
              </div>
            </div>

            <div className="history-meta">
              <span>Created: {new Date(account.createdAt).toLocaleDateString()}</span>
              <span>
                Password changed:{' '}
                {account.passwordChangedAt
                  ? new Date(account.passwordChangedAt).toLocaleDateString()
                  : 'Not yet'}
              </span>
            </div>

            <div className="settings-actions">
              <button
                type="button"
                className="secondary-button"
                disabled={pendingAccountId === account.id}
                onClick={() => handleReset(account.id)}
              >
                {pendingAccountId === account.id
                  ? 'Resetting password...'
                  : 'Reset temporary password'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
