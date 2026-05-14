import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/practice-sprint/route'

const routeMocks = vi.hoisted(() => ({
  requireLearnerAppSession: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => ({
  requireLearnerAppSession: routeMocks.requireLearnerAppSession,
}))

describe('practice sprint route', () => {
  beforeEach(() => {
    routeMocks.requireLearnerAppSession.mockReset()
  })

  it('returns filtered practice sprints for the current learner', async () => {
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })

    const response = await GET(
      new Request(
        'http://localhost/api/practice-sprint?taskType=Task%201&difficulty=Guided&topic=Process%20diagram&query=water'
      )
    )
    const payload = (await response.json()) as {
      ok: boolean
      sprints: Array<{ id: string; promptTitle: string }>
      summary: { totalSprints: number }
      topics: string[]
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.sprints).toEqual([
      expect.objectContaining({
        id: 'sprint-task1-cycle-diagram',
        promptTitle: 'Water recycling process',
      }),
    ])
    expect(payload.summary.totalSprints).toBe(1)
    expect(payload.topics).toContain('Process diagram')
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
        'http://localhost/api/practice-sprint?taskType=Speaking&difficulty=Extreme&topic=Unknown&query=automation'
      )
    )
    const payload = (await response.json()) as {
      sprints: Array<{ id: string }>
    }

    expect(payload.sprints.map((sprint) => sprint.id)).toContain(
      'sprint-task2-automation-jobs'
    )
  })
})
