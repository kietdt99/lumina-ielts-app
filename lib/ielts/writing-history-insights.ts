import type { WritingHistoryEntry } from './writing-history'

export function averageBand(entries: WritingHistoryEntry[]) {
  if (!entries.length) {
    return 0
  }

  const total = entries.reduce((sum, entry) => sum + entry.estimatedBand, 0)
  return Math.round((total / entries.length) * 10) / 10
}

export function bestBand(entries: WritingHistoryEntry[]) {
  if (!entries.length) {
    return 0
  }

  return Math.max(...entries.map((entry) => entry.estimatedBand))
}

export function countTaskType(
  entries: WritingHistoryEntry[],
  taskType: WritingHistoryEntry['taskType']
) {
  return entries.filter((entry) => entry.taskType === taskType).length
}

export function latestEntry(entries: WritingHistoryEntry[]) {
  return entries[0] ?? null
}

export function recentEntries(entries: WritingHistoryEntry[], limit = 3) {
  return entries.slice(0, limit)
}
