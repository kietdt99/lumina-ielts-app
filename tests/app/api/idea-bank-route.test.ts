import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/idea-bank/route'

const routeMocks = vi.hoisted(() => ({
  requireLearnerAppSession: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => ({
  requireLearnerAppSession: routeMocks.requireLearnerAppSession,
}))

describe('idea bank route', () => {
  beforeEach(() => {
    routeMocks.requireLearnerAppSession.mockReset()
  })

  it('returns filtered idea bank content for the current learner', async () => {
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })

    const response = await GET(
      new Request('http://localhost/api/idea-bank?query=renewable&taskType=Task%202')
    )
    const payload = (await response.json()) as {
      ok: boolean
      entries: Array<{ id: string; topic: string }>
      summary: { totalTopics: number }
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.entries).toHaveLength(1)
    expect(payload.entries[0]).toEqual(
      expect.objectContaining({
        id: 'environment-climate',
        topic: 'Environment and climate',
      })
    )
    expect(payload.summary.totalTopics).toBe(1)
    expect(routeMocks.requireLearnerAppSession).toHaveBeenCalled()
  })
})
