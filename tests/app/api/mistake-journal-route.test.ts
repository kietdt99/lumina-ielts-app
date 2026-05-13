import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/mistake-journal/route'
import { createHistoryEntry } from '../../helpers/fixtures'

const routeMocks = vi.hoisted(() => ({
  requireLearnerAppSession: vi.fn(),
  listWritingSubmissionHistory: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => ({
  requireLearnerAppSession: routeMocks.requireLearnerAppSession,
}))

vi.mock('@/lib/ielts/writing-submissions-repository', () => ({
  listWritingSubmissionHistory: routeMocks.listWritingSubmissionHistory,
}))

describe('mistake journal route', () => {
  beforeEach(() => {
    routeMocks.requireLearnerAppSession.mockReset()
    routeMocks.listWritingSubmissionHistory.mockReset()
  })

  it('returns a mistake journal for the current learner', async () => {
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })
    routeMocks.listWritingSubmissionHistory.mockResolvedValue({
      entries: [
        createHistoryEntry({
          id: 'entry-1',
          priorities: ['Add one concrete example to support the second paragraph.'],
        }),
      ],
      storageMode: 'browser',
    })

    const response = await GET()
    const payload = (await response.json()) as {
      ok: boolean
      journal: {
        totalPatterns: number
        sourceSessions: number
        topPattern: { code: string; label: string } | null
      }
      storageMode: string
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.journal.totalPatterns).toBeGreaterThan(0)
    expect(payload.journal.sourceSessions).toBe(1)
    expect(payload.journal.topPattern).toEqual(
      expect.objectContaining({
        code: 'underdeveloped-support',
      })
    )
    expect(payload.storageMode).toBe('browser')
    expect(routeMocks.requireLearnerAppSession).toHaveBeenCalled()
  })
})
