import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from '@/app/api/admin/accounts/route'

const authMocks = vi.hoisted(() => ({
  listManagedLearnerAccounts: vi.fn(),
  createManagedLearnerAccount: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => authMocks)

describe('/api/admin/accounts', () => {
  beforeEach(() => {
    authMocks.listManagedLearnerAccounts.mockReset()
    authMocks.createManagedLearnerAccount.mockReset()
  })

  it('returns learner accounts for the admin workspace', async () => {
    authMocks.listManagedLearnerAccounts.mockResolvedValue({
      ok: true,
      accounts: [
        {
          id: 'learner-1',
          email: 'learner@example.com',
          fullName: 'Learner',
          role: 'learner',
          mustChangePassword: true,
          onboardingCompleted: false,
          passwordChangedAt: null,
          createdAt: '2026-04-19T00:00:00.000Z',
          temporaryPasswordIssuedAt: '2026-04-19T00:00:00.000Z',
        },
      ],
    })

    const response = await GET()
    const payload = (await response.json()) as {
      ok: boolean
      accounts: Array<{ email: string }>
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.accounts).toHaveLength(1)
    expect(payload.accounts[0]?.email).toBe('learner@example.com')
  })

  it('creates a learner account when the payload is valid', async () => {
    authMocks.createManagedLearnerAccount.mockResolvedValue({
      ok: true,
      account: {
        id: 'learner-1',
        email: 'learner@example.com',
        fullName: 'Learner',
      },
      temporaryPassword: 'LmTemp!2026',
    })

    const response = await POST(
      new Request('http://localhost/api/admin/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: 'Learner',
          email: 'learner@example.com',
        }),
      })
    )

    const payload = (await response.json()) as {
      ok: boolean
      temporaryPassword: string
    }

    expect(response.status).toBe(200)
    expect(payload).toMatchObject({
      ok: true,
      temporaryPassword: 'LmTemp!2026',
      account: {
        email: 'learner@example.com',
        fullName: 'Learner',
      },
    })
    expect(authMocks.createManagedLearnerAccount).toHaveBeenCalledWith({
      fullName: 'Learner',
      email: 'learner@example.com',
    })
  })

  it('rejects incomplete learner account payloads', async () => {
    const response = await POST(
      new Request('http://localhost/api/admin/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: '',
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
      error: 'Full name and email are required.',
    })
  })
})
