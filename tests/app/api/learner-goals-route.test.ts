import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, PUT } from '@/app/api/learner-goals/route'
import { defaultLearnerGoals, serializeLearnerGoals } from '@/lib/learner/learner-goals'
import { createLearnerGoals } from '../../helpers/fixtures'

const cookieState = vi.hoisted(() => ({
  value: undefined as string | undefined,
  set: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: () =>
      cookieState.value
        ? {
            name: 'lumina-learner-goals',
            value: cookieState.value,
          }
        : undefined,
    set: cookieState.set,
  })),
}))

describe('learner goals route', () => {
  beforeEach(() => {
    cookieState.value = undefined
    cookieState.set.mockReset()
  })

  it('returns default learner goals when no cookie has been saved yet', async () => {
    const response = await GET()
    const payload = (await response.json()) as {
      ok: boolean
      goals: typeof defaultLearnerGoals
    }

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      ok: true,
      goals: defaultLearnerGoals,
    })
  })

  it('returns learner goals from the saved cookie', async () => {
    const goals = createLearnerGoals({
      targetBand: 8,
      focusSkill: 'Reading',
    })

    cookieState.value = serializeLearnerGoals(goals)

    const response = await GET()
    const payload = (await response.json()) as {
      ok: boolean
      goals: typeof defaultLearnerGoals
    }

    expect(payload.goals).toEqual(goals)
  })

  it('persists learner goals to the cookie store for a valid payload', async () => {
    const goals = createLearnerGoals({
      targetBand: 6.5,
      currentLevel: 'Band 5.0-5.5',
      focusSkill: 'Listening',
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
    }

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      ok: true,
      goals,
    })
    expect(cookieState.set).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'lumina-learner-goals',
        value: serializeLearnerGoals(goals),
        httpOnly: true,
        path: '/',
      })
    )
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
    expect(cookieState.set).not.toHaveBeenCalled()
  })
})
