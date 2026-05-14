import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/prompt-explorer/route'
import { writingPrompts } from '@/lib/ielts/writing-prompts'

const routeMocks = vi.hoisted(() => ({
  requireLearnerAppSession: vi.fn(),
  listWritingPrompts: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => ({
  requireLearnerAppSession: routeMocks.requireLearnerAppSession,
}))

vi.mock('@/lib/ielts/writing-prompts-repository', () => ({
  listWritingPrompts: routeMocks.listWritingPrompts,
}))

describe('prompt explorer route', () => {
  beforeEach(() => {
    routeMocks.requireLearnerAppSession.mockReset()
    routeMocks.listWritingPrompts.mockReset()
  })

  it('returns filtered prompts for the current learner', async () => {
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })
    routeMocks.listWritingPrompts.mockResolvedValue({
      prompts: writingPrompts,
      storageMode: 'library',
    })

    const response = await GET(
      new Request(
        'http://localhost/api/prompt-explorer?taskType=Task%201&difficulty=Balanced&topic=Urban%20change%20and%20transport&query=map'
      )
    )
    const payload = (await response.json()) as {
      ok: boolean
      prompts: Array<{ id: string; title: string }>
      summary: { totalPrompts: number }
      topics: string[]
      storageMode: 'library' | 'supabase'
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.prompts).toEqual([
      expect.objectContaining({
        id: 'task1-city-centre-map',
        title: 'City centre redevelopment map',
      }),
    ])
    expect(payload.summary.totalPrompts).toBe(1)
    expect(payload.topics).toContain('Urban change and transport')
    expect(payload.storageMode).toBe('library')
    expect(routeMocks.requireLearnerAppSession).toHaveBeenCalled()
  })

  it('falls back to broad filters when query params are unsupported', async () => {
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })
    routeMocks.listWritingPrompts.mockResolvedValue({
      prompts: writingPrompts,
      storageMode: 'library',
    })

    const response = await GET(
      new Request(
        'http://localhost/api/prompt-explorer?taskType=Speaking&difficulty=Extreme&query=automation'
      )
    )
    const payload = (await response.json()) as {
      prompts: Array<{ id: string }>
    }

    expect(payload.prompts.map((prompt) => prompt.id)).toContain(
      'task2-automation-jobs'
    )
  })
})
