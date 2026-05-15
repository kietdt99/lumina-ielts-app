import { describe, expect, it } from 'vitest'
import {
  filterRevisionChecklistItems,
  findRevisionChecklistItems,
  parseRevisionChecklistCriterionFilter,
  parseRevisionChecklistPriorityFilter,
  parseRevisionChecklistTaskFilter,
  summarizeRevisionChecklist,
} from '@/lib/ielts/revision-checklist'

describe('revision checklist', () => {
  it('matches Task 2 thesis feedback to position and support checks', () => {
    const items = findRevisionChecklistItems({
      taskType: 'Task 2',
      text: 'Make the thesis and position clearer, then add one concrete example to paragraph two.',
    })

    expect(items.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        'task2-direct-position',
        'support-specific-example',
      ])
    )
    expect(items[0].priorityLevel).toBe('High')
  })

  it('matches Task 1 overview feedback to Task 1-only checks', () => {
    const items = findRevisionChecklistItems({
      taskType: 'Task 1',
      text: 'Group the process stages and write a clearer overview of the main feature.',
    })

    expect(items.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        'task1-overview-sentence',
        'task1-data-grouping',
      ])
    )
    expect(items.map((item) => item.id)).not.toContain('task2-direct-position')
  })

  it('falls back to high-priority task checks when there is no keyword match', () => {
    const items = findRevisionChecklistItems({
      taskType: 'Task 2',
      text: 'Improve this response.',
      limit: 2,
    })

    expect(items).toHaveLength(2)
    expect(items[0]).toEqual(
      expect.objectContaining({
        id: 'support-specific-example',
        priorityLevel: 'High',
      })
    )
  })

  it('summarizes the checklist library', () => {
    expect(summarizeRevisionChecklist()).toEqual({
      totalItems: 9,
      taskOneItems: 7,
      taskTwoItems: 7,
      highPriorityItems: 4,
    })
  })

  it('filters checklist items by task, criterion, priority, and search', () => {
    const items = filterRevisionChecklistItems({
      taskType: 'Task 2',
      criterion: 'Task Response',
      priorityLevel: 'High',
      query: 'thesis',
    })

    expect(items.map((item) => item.id)).toEqual(['task2-direct-position'])
  })

  it('falls back to broad filters for unsupported query params', () => {
    expect(parseRevisionChecklistTaskFilter('Speaking')).toBe('All')
    expect(parseRevisionChecklistCriterionFilter('Fluency')).toBe('All')
    expect(parseRevisionChecklistPriorityFilter('Urgent')).toBe('All')
  })
})
