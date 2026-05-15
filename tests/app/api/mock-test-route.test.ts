import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/mock-test/route'

const routeMocks = vi.hoisted(() => ({
  requireLearnerAppSession: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => ({
  requireLearnerAppSession: routeMocks.requireLearnerAppSession,
}))

describe('mock test route', () => {
  beforeEach(() => {
    routeMocks.requireLearnerAppSession.mockReset()
  })

  it('returns filtered mock tests for the current learner', async () => {
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })

    const response = await GET(
      new Request(
        'http://localhost/api/mock-test?difficulty=Balanced&topic=Environment%20and%20climate&query=energy'
      )
    )
    const payload = (await response.json()) as {
      ok: boolean
      tests: Array<{ id: string; title: string }>
      summary: { totalTests: number }
      topics: string[]
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.tests).toEqual([
      expect.objectContaining({
        id: 'mock-task1-energy-line-chart-task2-environment-responsibility',
      }),
    ])
    expect(payload.summary.totalTests).toBe(1)
    expect(payload.topics).toContain('Environment and climate')
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
        'http://localhost/api/mock-test?difficulty=Extreme&topic=Unknown&query=education'
      )
    )
    const payload = (await response.json()) as {
      tests: Array<{ id: string }>
    }

    expect(payload.tests.map((test) => test.id)).toContain(
      'mock-task1-online-learning-pie-charts-task2-ai-education'
    )
  })
})
