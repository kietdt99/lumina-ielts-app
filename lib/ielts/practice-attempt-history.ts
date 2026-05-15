import { readSessionHintFromDocument } from '@/lib/auth/session-hint'
import type { ListeningPracticeScore } from './listening-practice'
import type { ReadingPracticeScore } from './reading-practice'
import type { SpeakingPracticeScore } from './speaking-practice'

export type PracticeAttemptSkill = 'Reading' | 'Listening' | 'Speaking'

export type PracticeAttemptHistoryEntry = {
  id: string
  skill: PracticeAttemptSkill
  itemId: string
  itemTitle: string
  topic: string
  difficulty: string
  createdAt: string
  estimatedBand: number
  statusLabel: string
  summary: string
  nextActions: string[]
  metricLabel: string
  metricValue: string
}

const storageKeyPrefix = 'lumina-practice-attempt-history'
const changeEventName = 'lumina-practice-attempt-history-change'
const emptyPracticeAttemptHistory: PracticeAttemptHistoryEntry[] = []
const maxHistoryEntries = 30
let cachedStorageKey: string | null = null
let cachedRawValue: string | null | undefined
let cachedSnapshot: PracticeAttemptHistoryEntry[] = emptyPracticeAttemptHistory

export function getServerPracticeAttemptHistorySnapshot() {
  return emptyPracticeAttemptHistory
}

export function getPracticeAttemptHistoryStorageKey(
  scope = readSessionHintFromDocument()
) {
  return scope ? `${storageKeyPrefix}:${scope}` : storageKeyPrefix
}

function sortByNewest(entries: PracticeAttemptHistoryEntry[]) {
  return [...entries].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  )
}

function normalizeHistoryEntry(
  entry: PracticeAttemptHistoryEntry
): PracticeAttemptHistoryEntry {
  return {
    ...entry,
    nextActions: Array.isArray(entry.nextActions) ? entry.nextActions : [],
    metricLabel: entry.metricLabel ?? 'Score',
    metricValue: entry.metricValue ?? entry.estimatedBand.toFixed(1),
  }
}

function notifyPracticeAttemptHistoryChange() {
  window.dispatchEvent(new Event(changeEventName))
}

export function getPracticeAttemptHistorySnapshot() {
  if (typeof window === 'undefined') {
    return getServerPracticeAttemptHistorySnapshot()
  }

  const storageKey = getPracticeAttemptHistoryStorageKey()
  const rawValue = window.localStorage.getItem(storageKey)

  if (storageKey === cachedStorageKey && rawValue === cachedRawValue) {
    return cachedSnapshot
  }

  cachedStorageKey = storageKey
  cachedRawValue = rawValue

  if (!rawValue) {
    cachedSnapshot = getServerPracticeAttemptHistorySnapshot()
    return cachedSnapshot
  }

  try {
    const parsedValue = JSON.parse(rawValue) as PracticeAttemptHistoryEntry[]
    cachedSnapshot = sortByNewest(parsedValue.map(normalizeHistoryEntry)).slice(
      0,
      maxHistoryEntries
    )
    return cachedSnapshot
  } catch {
    cachedSnapshot = getServerPracticeAttemptHistorySnapshot()
    return cachedSnapshot
  }
}

export function subscribeToPracticeAttemptHistory(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const handleChange = () => onStoreChange()

  window.addEventListener(changeEventName, handleChange)
  window.addEventListener('storage', handleChange)

  return () => {
    window.removeEventListener(changeEventName, handleChange)
    window.removeEventListener('storage', handleChange)
  }
}

export function savePracticeAttemptHistoryEntry(
  entry: PracticeAttemptHistoryEntry
) {
  if (typeof window === 'undefined') {
    return
  }

  const storageKey = getPracticeAttemptHistoryStorageKey()
  const nextEntries = sortByNewest([
    entry,
    ...getPracticeAttemptHistorySnapshot().filter(
      (currentEntry) => currentEntry.id !== entry.id
    ),
  ]).slice(0, maxHistoryEntries)

  window.localStorage.setItem(storageKey, JSON.stringify(nextEntries))
  notifyPracticeAttemptHistoryChange()
}

export function clearPracticeAttemptHistory() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(getPracticeAttemptHistoryStorageKey())
  notifyPracticeAttemptHistoryChange()
}

export function createReadingPracticeAttemptHistoryEntry(
  score: ReadingPracticeScore
): PracticeAttemptHistoryEntry {
  return {
    id: crypto.randomUUID(),
    skill: 'Reading',
    itemId: score.passageId,
    itemTitle: score.passageTitle,
    topic: score.topic,
    difficulty: score.difficulty,
    createdAt: new Date().toISOString(),
    estimatedBand: score.estimatedBand,
    statusLabel: score.statusLabel,
    summary: score.summary,
    nextActions: score.nextActions,
    metricLabel: 'Accuracy',
    metricValue: `${score.accuracy}%`,
  }
}

export function createListeningPracticeAttemptHistoryEntry(
  score: ListeningPracticeScore
): PracticeAttemptHistoryEntry {
  return {
    id: crypto.randomUUID(),
    skill: 'Listening',
    itemId: score.trackId,
    itemTitle: score.trackTitle,
    topic: score.topic,
    difficulty: score.difficulty,
    createdAt: new Date().toISOString(),
    estimatedBand: score.estimatedBand,
    statusLabel: score.statusLabel,
    summary: score.summary,
    nextActions: score.nextActions,
    metricLabel: 'Accuracy',
    metricValue: `${score.accuracy}%`,
  }
}

export function createSpeakingPracticeAttemptHistoryEntry(
  score: SpeakingPracticeScore
): PracticeAttemptHistoryEntry {
  return {
    id: crypto.randomUUID(),
    skill: 'Speaking',
    itemId: score.promptId,
    itemTitle: score.promptTitle,
    topic: score.topic,
    difficulty: score.difficulty,
    createdAt: new Date().toISOString(),
    estimatedBand: score.estimatedBand,
    statusLabel: score.statusLabel,
    summary: score.summary,
    nextActions: score.nextActions,
    metricLabel: 'Readiness',
    metricValue: `${score.readinessScore}%`,
  }
}
