import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, PUT } from '@/app/api/profile/route'

const authMocks = vi.hoisted(() => ({
  getAppSession: vi.fn(),
  updateLearnerProfile: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => authMocks)

describe('profile route', () => {
  beforeEach(() => {
    authMocks.getAppSession.mockReset()
    authMocks.updateLearnerProfile.mockReset()
    authMocks.getAppSession.mockResolvedValue({
      avatarUrl: null,
      userId: 'learner-1',
      email: 'learner@example.com',
      fullName: 'Demo Learner',
      role: 'learner',
      mustChangePassword: false,
      onboardingCompleted: true,
      passwordResetDeferred: false,
      mode: 'demo',
    })
  })

  it('returns the current learner profile', async () => {
    const response = await GET()
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      ok: true,
      profile: {
        avatarUrl: null,
        displayName: 'Demo Learner',
      },
    })
  })

  it('updates a valid learner profile payload', async () => {
    authMocks.updateLearnerProfile.mockResolvedValue({
      ok: true,
      profile: {
        avatarUrl: null,
        displayName: 'Kiet Learner',
      },
    })

    const response = await PUT(
      new Request('http://localhost/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatarUrl: null,
          displayName: 'Kiet Learner',
        }),
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      ok: true,
      profile: {
        avatarUrl: null,
        displayName: 'Kiet Learner',
      },
    })
    expect(authMocks.updateLearnerProfile).toHaveBeenCalledWith({
      avatarUrl: null,
      displayName: 'Kiet Learner',
    })
  })

  it('rejects invalid profile payloads', async () => {
    const response = await PUT(
      new Request('http://localhost/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatarUrl: null,
          displayName: 'A',
        }),
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.ok).toBe(false)
    expect(authMocks.updateLearnerProfile).not.toHaveBeenCalled()
  })
})
