'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserAvatar } from '@/app/_components/ui/user-avatar'

type ProfileIdentitySettingsProps = {
  avatarUrl: string | null
  displayName: string
  email: string
}

type ProfileResponse =
  | {
      ok: true
      profile: {
        avatarUrl: string | null
        displayName: string
      }
    }
  | {
      ok: false
      error: string
    }

export function ProfileIdentitySettings({
  avatarUrl,
  displayName,
  email,
}: ProfileIdentitySettingsProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [draftAvatarUrl, setDraftAvatarUrl] = useState<string | null>(avatarUrl)
  const [draftDisplayName, setDraftDisplayName] = useState(displayName)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function handleAvatarUpload(file: File | undefined) {
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!file) {
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Use a PNG, JPG, JPEG, or WebP image.')
      return
    }

    if (file.size > 120 * 1024) {
      setErrorMessage('Use an avatar image under 120 KB.')
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDraftAvatarUrl(reader.result)
      }
    }

    reader.onerror = () => {
      setErrorMessage('Unable to read that avatar image.')
    }

    reader.readAsDataURL(file)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatarUrl: draftAvatarUrl,
          displayName: draftDisplayName,
        }),
      })
      const payload = (await response.json()) as ProfileResponse

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.ok ? 'Unable to save your profile.' : payload.error
        )
      }

      setDraftAvatarUrl(payload.profile.avatarUrl)
      setDraftDisplayName(payload.profile.displayName)
      setSuccessMessage('Profile updated.')
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to save your profile.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="glass dashboard-card profile-identity-card">
      <div className="dashboard-section-header">
        <div>
          <span className="surface-kicker">Profile identity</span>
          <h2 className="card-title">Avatar and display name</h2>
          <p>
            Keep the name and avatar you see in the learner workspace friendly
            and easy to recognize.
          </p>
        </div>
        <UserAvatar avatarUrl={draftAvatarUrl} name={draftDisplayName} />
      </div>

      <form className="profile-identity-form" onSubmit={handleSubmit}>
        <div className="profile-avatar-row">
          <UserAvatar
            avatarUrl={draftAvatarUrl}
            className="profile-avatar-preview"
            name={draftDisplayName}
          />
          <div className="profile-avatar-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => handleAvatarUpload(event.target.files?.[0])}
            />
            <button
              type="button"
              className="secondary-button"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload avatar
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setDraftAvatarUrl(null)}
            >
              Remove avatar
            </button>
          </div>
        </div>

        <div className="settings-grid">
          <div className="field-group">
            <label htmlFor="profile-display-name">Display name</label>
            <input
              id="profile-display-name"
              type="text"
              className="text-input"
              value={draftDisplayName}
              onChange={(event) => setDraftDisplayName(event.target.value)}
              minLength={2}
              maxLength={80}
              required
            />
          </div>
          <div className="field-group">
            <label htmlFor="profile-email">Email address</label>
            <input
              id="profile-email"
              type="email"
              className="text-input"
              value={email}
              readOnly
            />
          </div>
        </div>

        {errorMessage ? (
          <p className="settings-status settings-status-error">{errorMessage}</p>
        ) : null}
        {successMessage ? (
          <p className="settings-status settings-status-success">{successMessage}</p>
        ) : null}

        <button type="submit" className="primary-button" disabled={isSaving}>
          {isSaving ? 'Saving profile...' : 'Save profile'}
        </button>
      </form>
    </section>
  )
}
