import { describe, expect, it } from 'vitest'
import {
  defaultLearnerGoals,
  learnerGoalErrors,
  parseLearnerGoals,
  serializeLearnerGoals,
  validateLearnerGoals,
} from '@/lib/learner/learner-goals'
import { createLearnerGoals } from '../helpers/fixtures'

describe('learner goals domain', () => {
  it('accepts a valid learner goals payload', () => {
    const validation = validateLearnerGoals(
      createLearnerGoals({
        targetBand: 8,
        focusSkill: 'Reading',
        studyFrequency: 'Daily',
      })
    )

    expect(validation).toEqual({
      ok: true,
      goals: {
        targetBand: 8,
        currentLevel: 'Band 6.0-6.5',
        focusSkill: 'Reading',
        studyFrequency: 'Daily',
      },
    })
  })

  it('rejects an invalid learner goals payload', () => {
    const validation = validateLearnerGoals({
      targetBand: 9,
      currentLevel: 'Band 9.0',
      focusSkill: 'Grammar',
      studyFrequency: 'Always',
    })

    expect(validation).toEqual({
      ok: false,
      error: learnerGoalErrors.invalidLearnerGoalsMessage,
    })
  })

  it('parses a valid serialized cookie value', () => {
    const goals = createLearnerGoals({
      targetBand: 7,
      currentLevel: 'Band 5.0-5.5',
    })

    expect(parseLearnerGoals(serializeLearnerGoals(goals))).toEqual(goals)
  })

  it('falls back to defaults when the cookie value is invalid', () => {
    expect(parseLearnerGoals('not-json')).toEqual(defaultLearnerGoals)
    expect(parseLearnerGoals(JSON.stringify({ targetBand: 9 }))).toEqual(
      defaultLearnerGoals
    )
    expect(parseLearnerGoals(undefined)).toEqual(defaultLearnerGoals)
  })
})
