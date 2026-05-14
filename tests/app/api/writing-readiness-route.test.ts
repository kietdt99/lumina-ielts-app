import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/writing/readiness/route'

const authMocks = vi.hoisted(() => ({
  getAppSession: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => authMocks)

describe('/api/writing/readiness', () => {
  beforeEach(() => {
    authMocks.getAppSession.mockReset()
    authMocks.getAppSession.mockResolvedValue({
      userId: 'learner-1',
      email: 'learner@example.com',
      fullName: 'Learner',
      role: 'learner',
      mustChangePassword: false,
      onboardingCompleted: true,
      passwordResetDeferred: false,
      mode: 'demo',
    })
  })

  it('returns readiness checks for a learner draft', async () => {
    const request = new Request('http://localhost/api/writing/readiness', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promptId: 'task2-remote-work',
        draft: [
          'Remote work can improve productivity because employees have fewer interruptions.',
          '',
          'However, managers still need clear expectations and regular communication.',
          '',
          'In conclusion, remote work is useful when structure supports autonomy.',
        ].join('\n'),
      }),
    })

    const response = await POST(request)
    const payload = (await response.json()) as {
      ok: boolean
      readiness?: { promptId: string; items: unknown[] }
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.readiness?.promptId).toBe('task2-remote-work')
    expect(payload.readiness?.items).toHaveLength(6)
  })

  it('returns 401 when the current session is not a learner', async () => {
    authMocks.getAppSession.mockResolvedValue({
      userId: 'admin-1',
      fullName: 'Admin',
      role: 'admin',
    })

    const request = new Request('http://localhost/api/writing/readiness', {
      method: 'POST',
      body: JSON.stringify({
        promptId: 'task2-remote-work',
        draft: '',
      }),
    })

    const response = await POST(request)
    const payload = (await response.json()) as { ok: boolean; error: string }

    expect(response.status).toBe(401)
    expect(payload).toEqual({
      ok: false,
      error: 'Learner authentication is required.',
    })
  })

  it('returns 400 when the request body is not valid JSON', async () => {
    const request = new Request('http://localhost/api/writing/readiness', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{invalid json',
    })

    const response = await POST(request)
    const payload = (await response.json()) as { ok: boolean; error: string }

    expect(response.status).toBe(400)
    expect(payload).toEqual({
      ok: false,
      error: 'Request body must be valid JSON.',
    })
  })

  it('returns 404 when the prompt does not exist', async () => {
    const request = new Request('http://localhost/api/writing/readiness', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promptId: 'missing-prompt',
        draft: '',
      }),
    })

    const response = await POST(request)
    const payload = (await response.json()) as { ok: boolean; error: string }

    expect(response.status).toBe(404)
    expect(payload).toEqual({
      ok: false,
      error: 'The selected writing prompt could not be found.',
    })
  })
})
