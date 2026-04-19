import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, PUT } from '@/app/api/learner-goals/route'
import { defaultLearnerGoals } from '@/lib/learner/learner-goals'
import { createLearnerGoals } from '../../helpers/fixtures'

const repositoryMocks = vi.hoisted(() => ({
  getLearnerGoals: vi.fn(),
  saveLearnerGoals: vi.fn(),
}))

vi.mock('@/lib/learner/learner-goals-repository', () => repositoryMocks)

describe('learner goals route', () => {
  beforeEach(() => {
    repositoryMocks.getLearnerGoals.mockReset()
    repositoryMocks.saveLearnerGoals.mockReset()
  })

  it('returns learner goals from the repository', async () => {
    repositoryMocks.getLearnerGoals.mockResolvedValue({
      goals: defaultLearnerGoals,
      storageMode: 'cookie',
    })

    const response = await GET()
    const payload = (await response.json()) as {
      ok: boolean
      goals: typeof defaultLearnerGoals
      storageMode: 'cookie' | 'supabase'
    }

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      ok: true,
      goals: defaultLearnerGoals,
      storageMode: 'cookie',
    })
  })

  it('persists learner goals through the repository for a valid payload', async () => {
    const goals = createLearnerGoals({
      targetBand: 6.5,
      currentLevel: 'Band 5.0-5.5',
      focusSkill: 'Listening',
    })

    repositoryMocks.saveLearnerGoals.mockResolvedValue({
      goals,
      storageMode: 'supabase',
    })

    const response = await PUT(
      new Request('http://localhost/api/learner-goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goals),
      })
    )

    const payload = (await response.json()) as {
      ok: boolean
      goals: typeof defaultLearnerGoals
      storageMode: 'cookie' | 'supabase'
    }

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      ok: true,
      goals,
      storageMode: 'supabase',
    })
    expect(repositoryMocks.saveLearnerGoals).toHaveBeenCalledWith(goals)
  })

  it('rejects invalid learner goals payloads', async () => {
    const response = await PUT(
      new Request('http://localhost/api/learner-goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetBand: 9,
        }),
      })
    )

    const payload = (await response.json()) as {
      ok: boolean
      error: string
    }

    expect(response.status).toBe(400)
    expect(payload.ok).toBe(false)
    expect(repositoryMocks.saveLearnerGoals).not.toHaveBeenCalled()
  })
})
