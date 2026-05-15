import { describe, expect, it } from 'vitest'
import { createProgressInsightsReport } from '@/lib/ielts/progress-insights'
import { createHistoryEntry, createLearnerGoals } from '../helpers/fixtures'

function rubricScores(overrides: Record<string, number>) {
  return [
    {
      label: 'Task Response',
      score: overrides['Task Response'] ?? 7,
      summary: 'Task response summary.',
    },
    {
      label: 'Coherence and Cohesion',
      score: overrides['Coherence and Cohesion'] ?? 7,
      summary: 'Coherence summary.',
    },
    {
      label: 'Lexical Resource',
      score: overrides['Lexical Resource'] ?? 7,
      summary: 'Lexical summary.',
    },
    {
      label: 'Grammatical Range and Accuracy',
      score: overrides['Grammatical Range and Accuracy'] ?? 7,
      summary: 'Grammar summary.',
    },
  ]
}

describe('progress insights', () => {
  it('returns a baseline report before the learner has writing history', () => {
    const report = createProgressInsightsReport(createLearnerGoals(), [])

    expect(report.headline).toBe('Build your first progress signal')
    expect(report.totalSessions).toBe(0)
    expect(report.riskLevel).toBe('Baseline')
    expect(report.nextActions[0]).toMatchObject({
      label: 'Create the first signal',
      route: '/writing',
    })
  })

  it('identifies the weakest rubric criterion and recurring priority pattern', () => {
    const goals = createLearnerGoals({ targetBand: 7.5 })
    const report = createProgressInsightsReport(
      goals,
      [
        createHistoryEntry({
          id: 'newest',
          createdAt: '2026-05-14T10:00:00.000Z',
          estimatedBand: 7,
          rubric: rubricScores({
            'Task Response': 7,
            'Coherence and Cohesion': 6,
            'Lexical Resource': 7,
            'Grammatical Range and Accuracy': 6.5,
          }),
          priorities: ['Improve paragraph progression.', 'Add specific support.'],
        }),
        createHistoryEntry({
          id: 'middle',
          createdAt: '2026-05-12T10:00:00.000Z',
          estimatedBand: 6.5,
          rubric: rubricScores({
            'Task Response': 6.5,
            'Coherence and Cohesion': 6,
            'Lexical Resource': 7,
            'Grammatical Range and Accuracy': 6.5,
          }),
          priorities: ['Improve paragraph progression.', 'Clarify the thesis.'],
        }),
        createHistoryEntry({
          id: 'older',
          createdAt: '2026-05-01T10:00:00.000Z',
          estimatedBand: 6.5,
          rubric: rubricScores({
            'Task Response': 6.5,
            'Coherence and Cohesion': 6,
            'Lexical Resource': 6.5,
            'Grammatical Range and Accuracy': 6.5,
          }),
          priorities: ['Improve paragraph progression.'],
        }),
      ],
      new Date('2026-05-15T00:00:00.000Z')
    )

    expect(report.headline).toBe('Close a 0.8 band gap with focused practice')
    expect(report.totalSessions).toBe(3)
    expect(report.recentAverage).toBe(6.7)
    expect(report.targetGap).toBe(0.8)
    expect(report.sessionsThisWeek).toBe(2)
    expect(report.weakestCriterion?.label).toBe('Coherence and Cohesion')
    expect(report.weakestCriterion?.route).toBe('/outline-builder')
    expect(report.priorityPatterns[0]).toMatchObject({
      priority: 'Improve paragraph progression.',
      count: 3,
      impactLevel: 'High',
    })
    expect(report.nextActions[0]).toMatchObject({
      label: 'Lift Coherence and Cohesion',
      route: '/outline-builder',
    })
  })

  it('detects improvement by comparing recent and previous practice blocks', () => {
    const report = createProgressInsightsReport(
      createLearnerGoals({ targetBand: 7 }),
      [
        createHistoryEntry({ id: 'one', createdAt: '2026-05-14T10:00:00.000Z', estimatedBand: 7 }),
        createHistoryEntry({ id: 'two', createdAt: '2026-05-13T10:00:00.000Z', estimatedBand: 7 }),
        createHistoryEntry({ id: 'three', createdAt: '2026-05-12T10:00:00.000Z', estimatedBand: 6.5 }),
        createHistoryEntry({ id: 'four', createdAt: '2026-04-30T10:00:00.000Z', estimatedBand: 6 }),
        createHistoryEntry({ id: 'five', createdAt: '2026-04-29T10:00:00.000Z', estimatedBand: 6 }),
        createHistoryEntry({ id: 'six', createdAt: '2026-04-28T10:00:00.000Z', estimatedBand: 6 }),
      ]
    )

    expect(report.trend).toBe('improving')
    expect(report.trendLabel).toBe('Improving')
    expect(report.recentAverage).toBe(6.8)
    expect(report.previousAverage).toBe(6)
  })
})
