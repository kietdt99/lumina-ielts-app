import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/mistake-taxonomy/route'

const routeMocks = vi.hoisted(() => ({
  requireLearnerAppSession: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => ({
  requireLearnerAppSession: routeMocks.requireLearnerAppSession,
}))

describe('mistake taxonomy route', () => {
  beforeEach(() => {
    routeMocks.requireLearnerAppSession.mockReset()
  })

  it('returns filtered mistake taxonomy content for the current learner', async () => {
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })

    const response = await GET(
      new Request(
        'http://localhost/api/mistake-taxonomy?taskType=Task%201&criterion=Task%20Achievement'
      )
    )
    const payload = (await response.json()) as {
      ok: boolean
      items: Array<{ code: string; label: string }>
      summary: { totalItems: number }
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.items.map((item) => item.code)).toEqual([
      'task1-missing-overview',
      'task1-detail-dump',
    ])
    expect(payload.summary.totalItems).toBe(2)
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
        'http://localhost/api/mistake-taxonomy?taskType=Speaking&criterion=Fluency&query=vocabulary'
      )
    )
    const payload = (await response.json()) as {
      items: Array<{ code: string }>
    }

    expect(payload.items.map((item) => item.code)).toContain(
      'repetitive-vocabulary'
    )
  })
})
