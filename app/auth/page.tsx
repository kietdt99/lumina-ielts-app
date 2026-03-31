'use client'

import { useState } from 'react'
import { login, signup } from './actions'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (isLogin) {
        const result = await login(formData)
        if (result?.error) {
          setError(result.error)
        }
      } else {
        const result = await signup(formData)
        if (result?.error) {
          setError(result.error)
        } else if (result?.success) {
          setSuccess(result.success)
        }
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="glass auth-card">
        <div className="auth-copy">
          <p className="section-label">Authentication</p>
          <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p>
            Sign in to continue your IELTS prep or create a new account to save
            your progress.
          </p>
        </div>

        {error ? <div className="feedback-banner error-banner">{error}</div> : null}
        {success ? (
          <div className="feedback-banner success-banner">{success}</div>
        ) : null}

        <form action={handleSubmit} className="auth-form">
          <div className="field-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="text-input"
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Minimum 6 characters"
              required
              minLength={6}
              className="text-input"
            />
          </div>

          <button type="submit" disabled={loading} className="primary-button">
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setError(null)
              setSuccess(null)
            }}
            className="inline-action"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  )
}
