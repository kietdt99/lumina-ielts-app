import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from '@/app/auth/_components/login-form'

const routerState = {
  push: vi.fn(),
  refresh: vi.fn(),
}

vi.mock('next/navigation', () => ({
  useRouter: () => routerState,
}))

vi.mock('@/lib/supabase/config', () => ({
  isSupabaseConfigured: () => false,
}))

describe('LoginForm', () => {
  beforeEach(() => {
    routerState.push.mockReset()
    routerState.refresh.mockReset()
    globalThis.fetch = vi.fn()
  })

  it('autofills the demo learner credentials', async () => {
    const user = userEvent.setup()

    render(
      <LoginForm
        demoCredentials={{
          admin: {
            email: 'admin@lumina.local',
            password: 'LuminaAdmin!2026',
          },
          learner: {
            email: 'learner@lumina.local',
            password: 'LuminaLearner!2026',
          },
        }}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Use demo learner' }))

    expect(screen.getByLabelText('Email address')).toHaveValue(
      'learner@lumina.local'
    )
    expect(screen.getByLabelText('Password')).toHaveValue(
      'LuminaLearner!2026'
    )
  })

  it('submits credentials and routes the learner to the next page', async () => {
    const user = userEvent.setup()

    vi.mocked(globalThis.fetch).mockResolvedValue(
      Response.json({
        ok: true,
        redirectTo: '/auth/change-password',
        theme: 'sky',
      })
    )

    render(
      <LoginForm
        demoCredentials={{
          admin: {
            email: 'admin@lumina.local',
            password: 'LuminaAdmin!2026',
          },
          learner: {
            email: 'learner@lumina.local',
            password: 'LuminaLearner!2026',
          },
        }}
      />
    )

    await user.type(screen.getByLabelText('Email address'), 'learner@example.com')
    await user.type(screen.getByLabelText('Password'), 'TempPassword!123')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'learner@example.com',
          password: 'TempPassword!123',
        }),
      })
    })

    expect(routerState.push).toHaveBeenCalledWith('/auth/change-password')
    expect(routerState.refresh).toHaveBeenCalledTimes(1)
    expect(document.documentElement.dataset.theme).toBe('sky')
  })
})
