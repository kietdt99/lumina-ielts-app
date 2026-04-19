import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createLearnerGoals } from '../helpers/fixtures'
import { defaultLearnerGoals } from '@/lib/learner/learner-goals'
import { getLearnerGoals, saveLearnerGoals } from '@/lib/learner/learner-goals-repository'

const repositoryState = vi.hoisted(() => ({
  user: null as null | { id: string; email?: string | null },
  cookieGoals: null as null | typeof defaultLearnerGoals,
  maybeSingleResult: { data: null, error: null as null | { message: string } },
  upsertCalls: [] as unknown[],
  ensureProfileForUser: vi.fn(),
}))

vi.mock('@/lib/supabase/session', () => ({
  getAuthenticatedUser: vi.fn(async () => repositoryState.user),
  ensureProfileForUser: repositoryState.ensureProfileForUser,
}))

vi.mock('@/lib/learner/learner-goals-cookie', () => ({
  getLearnerGoalsFromCookies: vi.fn(
    async () => repositoryState.cookieGoals ?? defaultLearnerGoals
  ),
  saveLearnerGoalsToCookies: vi.fn(async (goals) => {
    repositoryState.cookieGoals = goals
  }),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => repositoryState.maybeSingleResult,
        }),
      }),
      upsert: async (payload: unknown) => {
        repositoryState.upsertCalls.push(payload)
        return { error: null }
      },
    }),
  })),
}))

describe('learner goals repository', () => {
  beforeEach(() => {
    repositoryState.user = null
    repositoryState.cookieGoals = defaultLearnerGoals
    repositoryState.maybeSingleResult = { data: null, error: null }
    repositoryState.upsertCalls = []
    repositoryState.ensureProfileForUser.mockReset()
  })

  it('returns cookie-backed goals when there is no authenticated user', async () => {
    const goals = createLearnerGoals({
      targetBand: 8,
      focusSkill: 'Reading',
    })
    repositoryState.cookieGoals = goals

    const result = await getLearnerGoals()

    expect(result).toEqual({
      goals,
      storageMode: 'cookie',
    })
  })

  it('returns Supabase-backed goals for an authenticated user', async () => {
    repositoryState.user = {
      id: 'user-1',
      email: 'learner@example.com',
    }
    repositoryState.maybeSingleResult = {
      data: {
        target_band: 6.5,
        current_level: 'Band 5.0-5.5',
        focus_skill: 'Listening',
        study_frequency: '2 sessions/week',
      },
      error: null,
    }

    const result = await getLearnerGoals()

    expect(result).toEqual({
      goals: {
        targetBand: 6.5,
        currentLevel: 'Band 5.0-5.5',
        focusSkill: 'Listening',
        studyFrequency: '2 sessions/week',
      },
      storageMode: 'supabase',
    })
  })

  it('persists goals to cookies for anonymous usage', async () => {
    const goals = createLearnerGoals({
      focusSkill: 'Speaking',
    })

    const result = await saveLearnerGoals(goals)

    expect(result).toEqual({
      goals,
      storageMode: 'cookie',
    })
  })

  it('persists goals to Supabase for authenticated users', async () => {
    const goals = createLearnerGoals({
      targetBand: 6,
      currentLevel: 'Band 5.0-5.5',
    })

    repositoryState.user = {
      id: 'user-2',
      email: 'learner@example.com',
    }

    const result = await saveLearnerGoals(goals)

    expect(result).toEqual({
      goals,
      storageMode: 'supabase',
    })
    expect(repositoryState.ensureProfileForUser).toHaveBeenCalledWith(
      repositoryState.user
    )
    expect(repositoryState.upsertCalls).toEqual([
      {
        user_id: 'user-2',
        target_band: goals.targetBand,
        current_level: goals.currentLevel,
        focus_skill: goals.focusSkill,
        study_frequency: goals.studyFrequency,
      },
    ])
  })
})
