import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/revision-checklist/route'

const routeMocks = vi.hoisted(() => ({
  requireLearnerAppSession: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => ({
  requireLearnerAppSession: routeMocks.requireLearnerAppSession,
}))

describe('revision checklist route', () => {
  beforeEach(() => {
    routeMocks.requireLearnerAppSession.mockReset()
  })

  it('returns filtered revision checklist items for the current learner', async () => {
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })

    const response = await GET(
      new Request(
        'http://localhost/api/revision-checklist?taskType=Task%202&criterion=Task%20Response&priorityLevel=High&query=thesis'
      )
    )
    const payload = (await response.json()) as {
      ok: boolean
      items: Array<{ id: string; title: string }>
      summary: { totalItems: number }
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.items).toHaveLength(1)
    expect(payload.items[0]).toEqual(
      expect.objectContaining({
        id: 'task2-direct-position',
        title: 'Make the position unmistakable',
      })
    )
    expect(payload.summary.totalItems).toBe(1)
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
        'http://localhost/api/revision-checklist?taskType=Speaking&criterion=Fluency&priorityLevel=Urgent&query=vocabulary'
      )
    )
    const payload = (await response.json()) as {
      items: Array<{ id: string }>
    }

    expect(payload.items.map((item) => item.id)).toContain(
      'vocabulary-replacement-pass'
    )
  })
})
