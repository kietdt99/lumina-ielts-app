import { describe, expect, it } from 'vitest'
import {
  averageBand,
  bestBand,
  countTaskType,
  latestEntry,
  recentEntries,
} from '@/lib/ielts/writing-history-insights'
import { createHistoryEntry } from '../helpers/fixtures'

describe('writing history insights', () => {
  const entries = [
    createHistoryEntry({ id: 'entry-3', estimatedBand: 7.5, taskType: 'Task 2' }),
    createHistoryEntry({ id: 'entry-2', estimatedBand: 6.5, taskType: 'Task 1' }),
    createHistoryEntry({ id: 'entry-1', estimatedBand: 7, taskType: 'Task 2' }),
  ]

  it('calculates average and best bands', () => {
    expect(averageBand(entries)).toBe(7)
    expect(bestBand(entries)).toBe(7.5)
  })

  it('counts task types and reads latest entries', () => {
    expect(countTaskType(entries, 'Task 2')).toBe(2)
    expect(countTaskType(entries, 'Task 1')).toBe(1)
    expect(latestEntry(entries)?.id).toBe('entry-3')
    expect(recentEntries(entries, 2).map((entry) => entry.id)).toEqual([
      'entry-3',
      'entry-2',
    ])
  })

  it('returns safe defaults when no entries exist', () => {
    expect(averageBand([])).toBe(0)
    expect(bestBand([])).toBe(0)
    expect(latestEntry([])).toBeNull()
    expect(recentEntries([])).toEqual([])
  })
})
