import { describe, expect, it } from 'vitest'
import { createReviewQueue } from '@/lib/ielts/review-queue'
import { createHistoryEntry } from '../helpers/fixtures'

describe('review queue', () => {
  it('returns a starter queue when no writing history exists', () => {
    const queue = createReviewQueue([])

    expect(queue.headline).toBe('Start your first review loop')
    expect(queue.totalItems).toBe(0)
    expect(queue.sourceSessions).toBe(0)
    expect(queue.topTaskType).toBeNull()
    expect(queue.items).toEqual([])
  })

  it('turns recent revision plans into prioritized queue items', () => {
    const queue = createReviewQueue([
      createHistoryEntry({
        id: 'older-entry',
        promptTitle: 'Older Task 1 process',
        taskType: 'Task 1',
        createdAt: '2026-05-10T08:00:00.000Z',
        estimatedBand: 6.5,
      }),
      createHistoryEntry({
        id: 'latest-entry',
        promptTitle: 'Latest Task 2 argument',
        taskType: 'Task 2',
        createdAt: '2026-05-12T08:00:00.000Z',
        estimatedBand: 7.5,
        revisionPlan: [
          {
            label: 'Thesis pass',
            action: 'Make the position clearer in the introduction.',
            successCriteria: 'The introduction has one direct answer.',
          },
          {
            label: 'Evidence pass',
            action: 'Add one concrete example to paragraph two.',
            successCriteria: 'The example clearly supports the main claim.',
          },
        ],
      }),
    ])

    expect(queue.headline).toBe('5 review actions ready')
    expect(queue.sourceSessions).toBe(2)
    expect(queue.highPriorityCount).toBe(1)
    expect(queue.topTaskType).toBe('Task 1')
    expect(queue.items[0]).toEqual(
      expect.objectContaining({
        id: 'latest-entry-revision-0',
        entryId: 'latest-entry',
        promptTitle: 'Latest Task 2 argument',
        label: 'Thesis pass',
        priority: 'High',
        action: 'Make the position clearer in the introduction.',
        checklist: expect.arrayContaining([
          expect.objectContaining({
            id: 'task2-direct-position',
            title: 'Make the position unmistakable',
          }),
        ]),
      })
    )
  })

  it('falls back to saved priorities for older entries without revision plans', () => {
    const queue = createReviewQueue([
      createHistoryEntry({
        id: 'legacy-entry',
        taskType: 'Task 1',
        revisionPlan: [],
        priorities: ['Group the overview and supporting details more clearly.'],
      }),
    ])

    expect(queue.totalItems).toBe(1)
    expect(queue.items[0]).toEqual(
      expect.objectContaining({
        id: 'legacy-entry-priority-0',
        sourceType: 'priority',
        label: 'Priority 1',
        action: 'Group the overview and supporting details more clearly.',
        priority: 'High',
        checklist: expect.arrayContaining([
          expect.objectContaining({
            id: 'task1-overview-sentence',
          }),
        ]),
      })
    )
  })

  it('respects the queue limit', () => {
    const queue = createReviewQueue(
      [
        createHistoryEntry({ id: 'entry-1', createdAt: '2026-05-12T08:00:00.000Z' }),
        createHistoryEntry({ id: 'entry-2', createdAt: '2026-05-11T08:00:00.000Z' }),
      ],
      2
    )

    expect(queue.totalItems).toBe(2)
    expect(queue.items).toHaveLength(2)
  })
})
