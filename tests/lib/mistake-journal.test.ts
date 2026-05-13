import { describe, expect, it } from 'vitest'
import { createMistakeJournal } from '@/lib/ielts/mistake-journal'
import { createHistoryEntry } from '../helpers/fixtures'

describe('mistake journal', () => {
  it('returns an empty journal before any feedback evidence exists', () => {
    const journal = createMistakeJournal([])

    expect(journal.headline).toBe('Build your mistake journal')
    expect(journal.totalPatterns).toBe(0)
    expect(journal.totalEvidence).toBe(0)
    expect(journal.sourceSessions).toBe(0)
    expect(journal.mostAffectedCriterion).toBeNull()
    expect(journal.topPattern).toBeNull()
  })

  it('groups repeated task response evidence into a top mistake pattern', () => {
    const journal = createMistakeJournal([
      createHistoryEntry({
        id: 'entry-older',
        createdAt: '2026-05-10T08:00:00.000Z',
        priorities: ['Add one concrete example to support the second paragraph.'],
        revisionPlan: [
          {
            label: 'Evidence pass',
            action: 'Develop the weakest reason with a more specific example.',
            successCriteria: 'The example clearly supports the main claim.',
          },
        ],
      }),
      createHistoryEntry({
        id: 'entry-latest',
        createdAt: '2026-05-12T08:00:00.000Z',
        priorities: ['Add more development and concrete evidence to body paragraph two.'],
        revisionPlan: [
          {
            label: 'Development pass',
            action: 'Explain why the workplace example matters for the argument.',
            successCriteria: 'The paragraph has one clear explanation and one example.',
          },
        ],
      }),
    ])

    expect(journal.headline).toBe('2 mistake patterns found')
    expect(journal.sourceSessions).toBe(2)
    expect(journal.mostAffectedCriterion).toBe('Task Response')
    expect(journal.topPattern).toEqual(
      expect.objectContaining({
        code: 'underdeveloped-support',
        label: 'Underdeveloped supporting ideas',
        count: 4,
      })
    )
    expect(journal.topPattern?.evidence[0]).toEqual(
      expect.objectContaining({
        entryId: 'entry-latest',
        sourceType: 'priority',
      })
    )
  })

  it('detects lexical and grammar patterns from revision plan language', () => {
    const journal = createMistakeJournal([
      createHistoryEntry({
        id: 'entry-language',
        revisionPlan: [
          {
            label: 'Language pass',
            action: 'Replace repeated wording with more precise vocabulary.',
            successCriteria: 'The final draft avoids obvious repetition.',
          },
          {
            label: 'Grammar pass',
            action: 'Combine short sentences to show stronger complex grammar.',
            successCriteria: 'The paragraph uses controlled sentence variety.',
          },
        ],
      }),
    ])

    expect(journal.patterns.map((pattern) => pattern.code)).toEqual(
      expect.arrayContaining(['repetitive-vocabulary', 'sentence-control'])
    )
  })

  it('respects the pattern limit', () => {
    const journal = createMistakeJournal(
      [
        createHistoryEntry({
          priorities: [
            'Clarify the thesis position.',
            'Develop support with a concrete example.',
            'Rebuild paragraph structure.',
            'Replace repeated vocabulary.',
            'Combine short sentences for grammar range.',
          ],
        }),
      ],
      2
    )

    expect(journal.patterns).toHaveLength(2)
    expect(journal.totalPatterns).toBe(2)
  })
})
