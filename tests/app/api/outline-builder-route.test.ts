import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/outline-builder/route'

const routeMocks = vi.hoisted(() => ({
  requireLearnerAppSession: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => ({
  requireLearnerAppSession: routeMocks.requireLearnerAppSession,
}))

describe('outline builder route', () => {
  beforeEach(() => {
    routeMocks.requireLearnerAppSession.mockReset()
  })

  it('returns an outline for the selected writing prompt', async () => {
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })

    const response = await GET(
      new Request('http://localhost/api/outline-builder?promptId=task2-remote-work')
    )
    const payload = (await response.json()) as {
      ok: boolean
      outline: {
        promptId: string
        ideaBankTopic: string
        blocks: Array<{ id: string }>
      }
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.outline.promptId).toBe('task2-remote-work')
    expect(payload.outline.ideaBankTopic).toBe('Work and society')
    expect(payload.outline.blocks[0].id).toBe('introduction')
    expect(routeMocks.requireLearnerAppSession).toHaveBeenCalled()
  })

  it('returns a 404 for an unknown prompt id', async () => {
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })

    const response = await GET(
      new Request('http://localhost/api/outline-builder?promptId=missing-prompt')
    )
    const payload = (await response.json()) as {
      ok: boolean
      error: string
    }

    expect(response.status).toBe(404)
    expect(payload.ok).toBe(false)
    expect(payload.error).toBe('Writing prompt was not found for outline generation.')
  })
})
