'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminIllustration } from '@/app/_components/ui/pastel-illustrations'
import { ProfileIcon, SparklesIcon, TargetIcon } from '@/app/_components/ui/app-icons'
import { StatusCallout } from '@/app/_components/ui/status-callout'
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
          <div className="hero-badge-row">
            <span className="hero-badge">{accounts.length} learner accounts</span>
            <span className="hero-badge">
              {accounts.filter((account) => !account.onboardingCompleted).length} onboarding pending
            </span>
          </div>
        </div>
        <div className="writing-hero-visual">
          <AdminIllustration className="hero-illustration" />
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <ProfileIcon className="metric-icon" />
            </div>
            <span className="metric-label">Learners</span>
            <strong>{accounts.length}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <SparklesIcon className="metric-icon" />
            </div>
            <span className="metric-label">Pending onboarding</span>
            <strong>{accounts.filter((account) => !account.onboardingCompleted).length}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TargetIcon className="metric-icon" />
            </div>
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
        <StatusCallout variant="error" title="Unable to manage learner accounts.">
          <p>{errorMessage}</p>
        </StatusCallout>
      ) : null}

      {revealedCredential ? (
        <StatusCallout variant="success" title="Temporary password generated.">
          <p>
            Temporary password for this learner:{' '}
            <strong>{revealedCredential.temporaryPassword}</strong>
          </p>
        </StatusCallout>
      ) : null}

      {accounts.length ? (
        <div className="history-list">
        {accounts.map((account) => (
          <article key={account.id} className="glass history-card">
            <div className="history-kicker-row">
              <span className="surface-kicker">Learner account</span>
              <span
                className={`surface-kicker account-status-pill${
                  account.onboardingCompleted
                    ? ' account-status-pill-success'
                    : ' account-status-pill-info'
                }`}
              >
                {account.onboardingCompleted
                  ? 'Onboarding complete'
                  : 'Onboarding pending'}
              </span>
              <span
                className={`surface-kicker account-status-pill${
                  account.mustChangePassword
                    ? ' account-status-pill-warning'
                    : ' account-status-pill-success'
                }`}
              >
                {account.mustChangePassword
                  ? 'Password update required'
                  : 'Password current'}
              </span>
            </div>

            <div className="history-header">
              <div>
                <h2>{account.fullName}</h2>
                <p>{account.email}</p>
              </div>
              <div className="history-score">
                <strong>{account.onboardingCompleted ? 'Ready' : 'Onboarding'}</strong>
                <p>
                  {account.mustChangePassword
                    ? 'Learner should change the temporary password next.'
                    : 'Credential is already refreshed for ongoing practice.'}
                </p>
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
      ) : (
        <section className="glass writing-panel empty-state-panel">
          <div className="empty-state-illustration-wrap">
            <AdminIllustration className="empty-state-illustration" />
          </div>
          <div className="panel-heading">
            <h2>No learner accounts yet</h2>
            <p>
              Create the first learner profile to start handing out credentials
              and guiding people into the IELTS workspace.
            </p>
          </div>
          <div className="settings-actions">
            <Link href="/admin/accounts/new" className="primary-button">
              Create first learner
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
