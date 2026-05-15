import { describe, expect, it } from 'vitest'
import {
  createSkillPracticePlan,
  getSkillPracticeModules,
} from '@/lib/ielts/skill-practice-plan'
import { createHistoryEntry, createLearnerGoals } from '../helpers/fixtures'

describe('skill practice plan', () => {
  it('routes the focus skill to the matching practice module', () => {
    const plan = createSkillPracticePlan(
      createLearnerGoals({
        focusSkill: 'Speaking',
        studyFrequency: 'Daily',
      }),
      []
    )

    expect(plan.focusModule.title).toBe('Speaking Practice')
    expect(plan.focusModule.href).toBe('/speaking-practice')
    expect(plan.focusModule.actionLabel).toBe('Start Speaking Practice')
    expect(plan.headline).toBe('Prioritize Speaking today')
  })

  it('keeps the focus skill weighted while distributing support skills', () => {
    const plan = createSkillPracticePlan(
      createLearnerGoals({
        focusSkill: 'Reading',
        studyFrequency: 'Daily',
      }),
      []
    )

    const totalSessions = plan.weeklyMix.reduce(
      (sum, item) => sum + item.sessions,
      0
    )
    const readingMix = plan.weeklyMix.find((item) => item.skill === 'Reading')
    const writingMix = plan.weeklyMix.find((item) => item.skill === 'Writing')

    expect(totalSessions).toBe(7)
    expect(readingMix?.sessions).toBeGreaterThan(writingMix?.sessions ?? 0)
    expect(writingMix?.sessions).toBeGreaterThan(0)
  })

  it('uses writing checkpoints as evidence when they exist', () => {
    const plan = createSkillPracticePlan(
      createLearnerGoals({
        focusSkill: 'Listening',
      }),
      [
        createHistoryEntry({
          estimatedBand: 7.5,
        }),
      ]
    )

    expect(plan.writingCheckpointCount).toBe(1)
    expect(plan.actions).toContain(
      'Use the latest Writing evidence: Latest writing checkpoint: Band 7.5.'
    )
  })

  it('exposes all four IELTS practice modules in a stable order', () => {
    expect(getSkillPracticeModules().map((module) => module.skill)).toEqual([
      'Writing',
      'Reading',
      'Listening',
      'Speaking',
    ])
  })
})
