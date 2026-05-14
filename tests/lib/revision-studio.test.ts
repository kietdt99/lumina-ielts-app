import { describe, expect, it } from 'vitest'
import {
  createRevisionStudioSession,
  createRevisionStudioSummary,
  sortRevisionEntries,
} from '@/lib/ielts/revision-studio'
import { createHistoryEntry } from '../helpers/fixtures'

describe('revision studio', () => {
  it('creates a focused revision session from saved feedback', () => {
    const session = createRevisionStudioSession(
      createHistoryEntry({
        id: 'entry-focused',
        wordCount: 250,
        rubric: [
          {
            label: 'Task Response',
            score: 6,
            summary: 'Task Response needs sharper support.',
          },
          {
            label: 'Coherence and Cohesion',
            score: 7,
            summary: 'Coherence is controlled.',
          },
          {
            label: 'Lexical Resource',
            score: 7,
            summary: 'Vocabulary is controlled.',
          },
          {
            label: 'Grammatical Range and Accuracy',
            score: 6.5,
            summary: 'Grammar is improving.',
          },
        ],
      })
    )

    expect(session.entryId).toBe('entry-focused')
    expect(session.status).toBe('not-started')
    expect(session.statusLabel).toBe('Not started')
    expect(session.readyWordTarget).toBe(100)
    expect(session.weakestRubric?.label).toBe('Task Response')
    expect(session.focusSteps).toHaveLength(3)
    expect(session.focusSteps[0].action).toBe(
      'Clarify the topic sentence before adding more support.'
    )
    expect(session.priorityChecklist[0].title).toBe('Add one concrete support move')
  })

  it('marks a rewrite as ready after it reaches the readiness word target', () => {
    const rewriteDraft = Array.from({ length: 120 }, (_, index) => `word${index}`)
      .join(' ')
    const session = createRevisionStudioSession(createHistoryEntry(), rewriteDraft)

    expect(session.rewriteWordCount).toBe(120)
    expect(session.wordDelta).toBe(-160)
    expect(session.status).toBe('ready-for-check')
    expect(session.statusLabel).toBe('Ready for readiness check')
  })

  it('summarizes saved sessions and rewrite readiness', () => {
    const entries = [
      createHistoryEntry({
        id: 'task-1-entry',
        taskType: 'Task 1',
        estimatedBand: 6,
      }),
      createHistoryEntry({
        id: 'task-2-entry',
        taskType: 'Task 2',
        estimatedBand: 7,
      }),
    ]
    const summary = createRevisionStudioSummary(entries, {
      'task-2-entry': Array.from({ length: 120 }, (_, index) => `word${index}`)
        .join(' '),
    })

    expect(summary.totalSessions).toBe(2)
    expect(summary.averageBand).toBe(6.5)
    expect(summary.taskOneSessions).toBe(1)
    expect(summary.taskTwoSessions).toBe(1)
    expect(summary.readySessions).toBe(1)
    expect(summary.headline).toBe('2 saved drafts are ready for rewrite')
  })

  it('sorts revision entries by newest first', () => {
    const sortedEntries = sortRevisionEntries([
      createHistoryEntry({
        id: 'older',
        createdAt: '2026-03-31T10:00:00.000Z',
      }),
      createHistoryEntry({
        id: 'newer',
        createdAt: '2026-05-12T10:00:00.000Z',
      }),
    ])

    expect(sortedEntries.map((entry) => entry.id)).toEqual(['newer', 'older'])
  })
})
