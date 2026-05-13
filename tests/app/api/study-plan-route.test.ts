import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/study-plan/route'
import { createHistoryEntry, createLearnerGoals } from '../../helpers/fixtures'

const routeMocks = vi.hoisted(() => ({
  requireLearnerAppSession: vi.fn(),
  getLearnerGoals: vi.fn(),
  listWritingSubmissionHistory: vi.fn(),
}))

vi.mock('@/lib/auth/service', () => ({
  requireLearnerAppSession: routeMocks.requireLearnerAppSession,
}))

vi.mock('@/lib/learner/learner-goals-repository', () => ({
  getLearnerGoals: routeMocks.getLearnerGoals,
}))

vi.mock('@/lib/ielts/writing-submissions-repository', () => ({
  listWritingSubmissionHistory: routeMocks.listWritingSubmissionHistory,
}))

describe('study plan route', () => {
  beforeEach(() => {
    routeMocks.requireLearnerAppSession.mockReset()
    routeMocks.getLearnerGoals.mockReset()
    routeMocks.listWritingSubmissionHistory.mockReset()
  })

  it('returns a weekly study plan for the current learner', async () => {
    routeMocks.requireLearnerAppSession.mockResolvedValue({
      userId: 'learner-1',
      fullName: 'Demo Learner',
      role: 'learner',
    })
    routeMocks.getLearnerGoals.mockResolvedValue({
      goals: createLearnerGoals({
        targetBand: 8,
        studyFrequency: '4 sessions/week',
      }),
      storageMode: 'cookie',
    })
    routeMocks.listWritingSubmissionHistory.mockResolvedValue({
      entries: [
        createHistoryEntry({
          createdAt: '2026-05-12T12:00:00.000Z',
          estimatedBand: 7,
        }),
      ],
      storageMode: 'browser',
    })

    const response = await GET()
    const payload = (await response.json()) as {
      ok: boolean
      plan: {
        weeklyTargetSessions: number
        priorityFocus: string
        sessions: Array<{ label: string }>
      }
      storageMode: string
    }

    expect(response.status).toBe(200)
    expect(payload.ok).toBe(true)
    expect(payload.plan.weeklyTargetSessions).toBe(4)
    expect(payload.plan.sessions[0].label).toBe('Session 1')
    expect(payload.storageMode).toBe('browser')
    expect(routeMocks.requireLearnerAppSession).toHaveBeenCalled()
  })
})
