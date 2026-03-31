import { describe, expect, it } from 'vitest'
import { createLearnerGoals, createHistoryEntry } from '../helpers/fixtures'
import {
  createStudyRecommendation,
  recurringPriority,
  recentAverageBand,
  sessionsThisWeek,
} from '@/lib/ielts/study-plan'

describe('study plan insights', () => {
  it('builds a starter recommendation when no writing sessions exist', () => {
    const goals = createLearnerGoals({
      targetBand: 8,
      currentLevel: 'Band 5.0-5.5',
      focusSkill: 'Writing',
      studyFrequency: 'Daily',
    })

    const recommendation = createStudyRecommendation(goals, [])

    expect(recommendation.headline).toBe('Start your writing study loop')
    expect(recommendation.targetGap).toBe(2.8)
    expect(recommendation.actions[0]).toContain('writing practice session')
  })

  it('calculates recent average, sessions this week, and recurring priorities', () => {
    const entries = [
      createHistoryEntry({
        id: 'entry-3',
        createdAt: '2026-03-31T12:00:00.000Z',
        estimatedBand: 7.5,
        priorities: ['Clarify the thesis in the introduction.'],
      }),
      createHistoryEntry({
        id: 'entry-2',
        createdAt: '2026-03-29T12:00:00.000Z',
        estimatedBand: 7,
        priorities: ['Clarify the thesis in the introduction.'],
      }),
      createHistoryEntry({
        id: 'entry-1',
        createdAt: '2026-03-20T12:00:00.000Z',
        estimatedBand: 6.5,
        priorities: ['Develop the second body paragraph with more precise support.'],
      }),
    ]

    expect(recentAverageBand(entries)).toBe(7)
    expect(sessionsThisWeek(entries, new Date('2026-03-31T18:00:00.000Z'))).toBe(2)
    expect(recurringPriority(entries)).toBe('Clarify the thesis in the introduction.')
  })

  it('builds a targeted recommendation from recent writing history', () => {
    const goals = createLearnerGoals({
      targetBand: 8,
      studyFrequency: '4 sessions/week',
    })
    const entries = [
      createHistoryEntry({
        id: 'entry-3',
        createdAt: '2026-03-31T12:00:00.000Z',
        estimatedBand: 7.5,
        priorities: ['Clarify the thesis in the introduction.'],
      }),
      createHistoryEntry({
        id: 'entry-2',
        createdAt: '2026-03-30T12:00:00.000Z',
        estimatedBand: 7,
        priorities: ['Clarify the thesis in the introduction.'],
      }),
      createHistoryEntry({
        id: 'entry-1',
        createdAt: '2026-03-29T12:00:00.000Z',
        estimatedBand: 6.5,
        priorities: ['Develop the second body paragraph with more precise support.'],
      }),
    ]

    const recommendation = createStudyRecommendation(
      goals,
      entries,
      new Date('2026-03-31T18:00:00.000Z')
    )

    expect(recommendation.headline).toBe('Close the gap to Band 8.0')
    expect(recommendation.recentAverage).toBe(7)
    expect(recommendation.targetGap).toBe(1)
    expect(recommendation.sessionsThisWeek).toBe(3)
    expect(recommendation.recurringPriority).toBe(
      'Clarify the thesis in the introduction.'
    )
  })
})
