import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearWritingHistory,
  createWritingHistoryEntry,
  getWritingHistorySnapshot,
  saveWritingHistoryEntry,
  subscribeToWritingHistory,
} from '@/lib/ielts/writing-history'
import { createEvaluation, createHistoryEntry, createPrompt } from '../helpers/fixtures'

describe('writing history store', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.useRealTimers()
  })

  it('returns a stable empty snapshot when no local history exists', () => {
    const firstSnapshot = getWritingHistorySnapshot()
    const secondSnapshot = getWritingHistorySnapshot()

    expect(firstSnapshot).toEqual([])
    expect(firstSnapshot).toBe(secondSnapshot)
  })

  it('saves entries in newest-first order and caps the history at twenty items', () => {
    for (let index = 0; index < 21; index += 1) {
      saveWritingHistoryEntry(
        createHistoryEntry({
          id: `entry-${index + 1}`,
          createdAt: new Date(Date.UTC(2026, 2, index + 1, 10)).toISOString(),
        })
      )
    }

    const snapshot = getWritingHistorySnapshot()

    expect(snapshot).toHaveLength(20)
    expect(snapshot[0]?.id).toBe('entry-21')
    expect(snapshot.at(-1)?.id).toBe('entry-2')
  })

  it('notifies subscribers when history changes', () => {
    const onStoreChange = vi.fn()
    const unsubscribe = subscribeToWritingHistory(onStoreChange)

    saveWritingHistoryEntry(createHistoryEntry())
    clearWritingHistory()
    unsubscribe()

    expect(onStoreChange).toHaveBeenCalledTimes(2)
  })

  it('creates a history entry from the selected prompt and feedback', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-31T10:15:00.000Z'))

    const prompt = createPrompt()
    const feedback = createEvaluation()
    const entry = createWritingHistoryEntry({
      prompt,
      draft: 'This is a complete practice response that should be saved for later review.',
      feedback,
    })

    expect(entry.promptId).toBe(prompt.id)
    expect(entry.promptTitle).toBe(prompt.title)
    expect(entry.taskType).toBe(prompt.taskType)
    expect(entry.estimatedBand).toBe(feedback.estimatedBand)
    expect(entry.wordCount).toBe(feedback.wordCount)
    expect(entry.createdAt).toBe('2026-03-31T10:15:00.000Z')
    expect(entry.id).toEqual(expect.any(String))
  })
})
