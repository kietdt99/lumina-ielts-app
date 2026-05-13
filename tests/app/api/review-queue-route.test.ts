import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/review-queue/route'
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

describe('review queue route', () => {
  beforeEach(() => {
    routeMocks.requireLearnerAppSession.mockReset()
    routeMocks.listWritingSubmissionHistory.mockReset()
  })

  it('returns a review queue for the current learner', async () => {
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })
    routeMocks.listWritingSubmissionHistory.mockResolvedValue({
      entries: [
        createHistoryEntry({
          id: 'entry-1',
          createdAt: '2026-05-12T12:00:00.000Z',
          estimatedBand: 7,
        }),
      ],
      storageMode: 'browser',
    })

    const response = await GET()
    const payload = (await response.json()) as {
      ok: boolean
      queue: {
        totalItems: number
        sourceSessions: number
        items: Array<{ entryId: string; priority: string }>
      }
      storageMode: string
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.queue.totalItems).toBe(3)
    expect(payload.queue.sourceSessions).toBe(1)
    expect(payload.queue.items[0]).toEqual(
      expect.objectContaining({
        entryId: 'entry-1',
        priority: 'High',
      })
    )
    expect(payload.storageMode).toBe('browser')
    expect(routeMocks.requireLearnerAppSession).toHaveBeenCalled()
  })
})
