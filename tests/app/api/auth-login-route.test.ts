import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/auth/login/route'

const authMocks = vi.hoisted(() => ({
  loginUser: vi.fn(),
  resolvePostLoginPath: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => authMocks)

describe('/api/auth/login', () => {
  beforeEach(() => {
    authMocks.loginUser.mockReset()
    authMocks.resolvePostLoginPath.mockReset()
  })

  it('returns a redirect target for valid credentials', async () => {
    const session = {
      userId: 'learner-1',
      email: 'learner@example.com',
      fullName: 'Learner',
      role: 'learner',
      mustChangePassword: true,
      onboardingCompleted: false,
      passwordResetDeferred: false,
      mode: 'demo',
    }

    authMocks.loginUser.mockResolvedValue({
      ok: true,
      session,
    })
    authMocks.resolvePostLoginPath.mockReturnValue('/auth/change-password')

    const response = await POST(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'learner@example.com',
          password: 'TempPassword!123',
        }),
      })
    )

    const payload = (await response.json()) as {
      ok: boolean
      redirectTo: string
    }

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      ok: true,
      redirectTo: '/auth/change-password',
    })
    expect(authMocks.loginUser).toHaveBeenCalledWith({
      email: 'learner@example.com',
      password: 'TempPassword!123',
    })
  })

  it('rejects incomplete payloads', async () => {
    const response = await POST(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: '',
        }),
      })
    )

    const payload = (await response.json()) as {
      ok: boolean
      error: string
    }

    expect(response.status).toBe(400)
    expect(payload).toEqual({
      ok: false,
      error: 'Email and password are required.',
    })
  })

  it('returns 401 for invalid credentials', async () => {
    authMocks.loginUser.mockResolvedValue({
      ok: false,
      error: 'Email or password is incorrect.',
    })

    const response = await POST(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'learner@example.com',
          password: 'wrong-password',
        }),
      })
    )

    const payload = (await response.json()) as {
      ok: boolean
      error: string
    }

    expect(response.status).toBe(401)
    expect(payload).toEqual({
      ok: false,
      error: 'Email or password is incorrect.',
    })
  })
})
