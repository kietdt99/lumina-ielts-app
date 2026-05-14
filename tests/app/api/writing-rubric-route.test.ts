import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/writing/rubric/route'

const routeMocks = vi.hoisted(() => ({
  requireLearnerAppSession: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => ({
  requireLearnerAppSession: routeMocks.requireLearnerAppSession,
}))

describe('writing rubric route', () => {
  beforeEach(() => {
    routeMocks.requireLearnerAppSession.mockReset()
  })

  it('returns task-specific rubric criteria for the current learner', async () => {
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })

    const response = await GET(
      new Request('http://localhost/api/writing/rubric?taskType=Task%201')
    )
    const payload = (await response.json()) as {
      ok: boolean
      taskType: string
      criteria: Array<{ code: string; name: string }>
      summary: { totalCriteria: number }
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.taskType).toBe('Task 1')
    expect(payload.criteria).toHaveLength(4)
    expect(payload.criteria[0]).toEqual(
      expect.objectContaining({
        code: 'task-achievement',
        name: 'Task Achievement',
      })
    )
    expect(payload.criteria.map((criterion) => criterion.code)).not.toContain(
      'task-response'
    )
    expect(payload.summary.totalCriteria).toBe(4)
    expect(routeMocks.requireLearnerAppSession).toHaveBeenCalled()
  })

  it('defaults to Task 2 when the query task type is not supported', async () => {
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })

    const response = await GET(
      new Request('http://localhost/api/writing/rubric?taskType=Speaking')
    )
    const payload = (await response.json()) as {
      taskType: string
      criteria: Array<{ code: string }>
    }

    expect(payload.taskType).toBe('Task 2')
    expect(payload.criteria.map((criterion) => criterion.code)).toContain(
      'task-response'
    )
  })
})
