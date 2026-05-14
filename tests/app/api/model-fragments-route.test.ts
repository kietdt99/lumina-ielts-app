import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/model-fragments/route'

const routeMocks = vi.hoisted(() => ({
  requireLearnerAppSession: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => ({
  requireLearnerAppSession: routeMocks.requireLearnerAppSession,
}))

describe('model fragments route', () => {
  beforeEach(() => {
    routeMocks.requireLearnerAppSession.mockReset()
  })

  it('returns filtered model fragments for the current learner', async () => {
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })

    const response = await GET(
      new Request(
        'http://localhost/api/model-fragments?taskType=Task%201&functionType=Overview'
      )
    )
    const payload = (await response.json()) as {
      ok: boolean
      fragments: Array<{ id: string; title: string }>
      summary: { totalFragments: number }
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.fragments).toHaveLength(1)
    expect(payload.fragments[0]).toEqual(
      expect.objectContaining({
        id: 'task1-process-overview',
        title: 'Start-to-end overview',
      })
    )
    expect(payload.summary.totalFragments).toBe(1)
    expect(routeMocks.requireLearnerAppSession).toHaveBeenCalled()
  })

  it('falls back to broad filters when query params are unsupported', async () => {
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })

    const response = await GET(
      new Request(
        'http://localhost/api/model-fragments?taskType=Speaking&functionType=Full%20essay&query=remote'
      )
    )
    const payload = (await response.json()) as {
      fragments: Array<{ id: string }>
    }

    expect(payload.fragments.map((fragment) => fragment.id)).toContain(
      'task2-balanced-introduction'
    )
  })
})
