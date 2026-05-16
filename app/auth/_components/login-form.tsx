'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StatusCallout } from '@/app/_components/ui/status-callout'
import type { AppLanguage } from '@/lib/i18n/app-language'

const loginCopy: Record<
  AppLanguage,
  {
    demoAdmin: string
    demoBody: string
    demoLearner: string
    demoTitle: string
    emailLabel: string
    emailPlaceholder: string
    errorTitle: string
    passwordLabel: string
    passwordPlaceholder: string
    submit: string
    submitting: string
    unknownError: string
  }
> = {
  vi: {
    demoAdmin: 'Dùng demo admin',
    demoBody: 'Dùng tài khoản demo bên dưới hoặc tạo learner mới từ khu vực admin.',
    demoLearner: 'Dùng demo learner',
    demoTitle: 'Demo mode đang bật.',
    emailLabel: 'Email',
    emailPlaceholder: 'Enter your email',
    errorTitle: 'Chưa thể đăng nhập.',
    passwordLabel: 'Mật khẩu',
    passwordPlaceholder: 'Nhập mật khẩu',
    submit: 'Đăng nhập',
    submitting: 'Đang đăng nhập...',
    unknownError: 'Chưa thể đăng nhập lúc này.',
  },
  en: {
    demoAdmin: 'Use demo admin',
    demoBody: 'Use the seeded accounts below or create a learner account from the admin area.',
    demoLearner: 'Use demo learner',
    demoTitle: 'Demo mode is active.',
    emailLabel: 'Email address',
    emailPlaceholder: 'Enter your email',
    errorTitle: 'Unable to sign in right now.',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    submit: 'Log In',
    submitting: 'Signing in...',
    unknownError: 'Unable to sign in right now.',
  },
}

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
  language?: AppLanguage
}

export function LoginForm({
  demoCredentials,
  language = 'en',
}: LoginFormProps) {
  const router = useRouter()
  const copy = loginCopy[language]
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
          payload.ok ? copy.unknownError : payload.error
        )
      }

      document.documentElement.dataset.theme = payload.theme
      router.push(payload.redirectTo)
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : copy.unknownError
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
    <>
      {demoCredentials ? (
        <StatusCallout
          variant="info"
          title={copy.demoTitle}
          actions={
            <div className="demo-credentials">
              <button
                type="button"
                className="secondary-button"
                onClick={() => autofillDemoAccount('admin')}
              >
                {copy.demoAdmin}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => autofillDemoAccount('learner')}
              >
                {copy.demoLearner}
              </button>
            </div>
          }
        >
          <p>{copy.demoBody}</p>
        </StatusCallout>
      ) : null}

      {errorMessage ? (
        <StatusCallout variant="error" title={copy.errorTitle}>
          <p>{errorMessage}</p>
        </StatusCallout>
      ) : null}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="login-email">{copy.emailLabel}</label>
          <input
            id="login-email"
            type="email"
            className="text-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={copy.emailPlaceholder}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="login-password">{copy.passwordLabel}</label>
          <input
            id="login-password"
            type="password"
            className="text-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={copy.passwordPlaceholder}
            required
          />
        </div>

        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? copy.submitting : copy.submit}
        </button>
      </form>
    </>
  )
}
