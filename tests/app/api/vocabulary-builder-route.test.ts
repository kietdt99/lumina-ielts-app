import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/vocabulary-builder/route'

const routeMocks = vi.hoisted(() => ({
  requireLearnerAppSession: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => ({
  requireLearnerAppSession: routeMocks.requireLearnerAppSession,
}))

describe('vocabulary builder route', () => {
  beforeEach(() => {
    routeMocks.requireLearnerAppSession.mockReset()
  })

  it('returns filtered vocabulary cards for the current learner', async () => {
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })

    const response = await GET(
      new Request(
        'http://localhost/api/vocabulary-builder?taskType=Task%201&cardType=Collocation&topic=Environment%20and%20climate&query=impact'
      )
    )
    const payload = (await response.json()) as {
      ok: boolean
      cards: Array<{ id: string; term: string }>
      summary: { totalCards: number }
      topics: string[]
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.cards).toEqual([
      expect.objectContaining({
        id: 'environment-climate-collocation-reduce-environmental-impact',
        term: 'reduce environmental impact',
      }),
    ])
    expect(payload.summary.totalCards).toBe(1)
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
        'http://localhost/api/vocabulary-builder?taskType=Speaking&cardType=Phrase&topic=Unknown&query=autonomy'
      )
    )
    const payload = (await response.json()) as {
      cards: Array<{ id: string }>
    }

    expect(payload.cards.map((card) => card.id)).toContain(
      'work-society-vocabulary-workplace-autonomy'
    )
  })
})
