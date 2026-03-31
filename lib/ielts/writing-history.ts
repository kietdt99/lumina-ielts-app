import type { WritingEvaluation } from './writing-feedback'
import type { WritingPrompt } from './writing-prompts'

export type WritingHistoryEntry = {
  id: string
  promptId: string
  promptTitle: string
  taskType: WritingPrompt['taskType']
  createdAt: string
  draftExcerpt: string
  wordCount: number
  estimatedBand: number
  rubric: WritingEvaluation['rubric']
  strengths: string[]
  priorities: string[]
}

const storageKey = 'lumina-writing-history'
const changeEventName = 'lumina-writing-history-change'
const emptyWritingHistory: WritingHistoryEntry[] = []

function sortByNewest(entries: WritingHistoryEntry[]) {
  return [...entries].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  )
}

export function getWritingHistorySnapshot() {
  if (typeof window === 'undefined') {
    return emptyWritingHistory
  }

  const rawValue = window.localStorage.getItem(storageKey)

  if (!rawValue) {
    return emptyWritingHistory
  }

  try {
    const parsedValue = JSON.parse(rawValue) as WritingHistoryEntry[]
    return sortByNewest(parsedValue)
  } catch {
    return emptyWritingHistory
  }
}

function notifyWritingHistoryChange() {
  window.dispatchEvent(new Event(changeEventName))
}

export function subscribeToWritingHistory(onStoreChange: () => void) {
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

export function saveWritingHistoryEntry(entry: WritingHistoryEntry) {
  if (typeof window === 'undefined') {
    return
  }

  const nextEntries = [entry, ...getWritingHistorySnapshot()].slice(0, 20)
  window.localStorage.setItem(storageKey, JSON.stringify(nextEntries))
  notifyWritingHistoryChange()
}

export function clearWritingHistory() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(storageKey)
  notifyWritingHistoryChange()
}

export function createWritingHistoryEntry(args: {
  prompt: WritingPrompt
  draft: string
  feedback: WritingEvaluation
}) {
  const { prompt, draft, feedback } = args

  return {
    id: crypto.randomUUID(),
    promptId: prompt.id,
    promptTitle: prompt.title,
    taskType: prompt.taskType,
    createdAt: new Date().toISOString(),
    draftExcerpt: draft.trim().slice(0, 220),
    wordCount: feedback.wordCount,
    estimatedBand: feedback.estimatedBand,
    rubric: feedback.rubric,
    strengths: feedback.strengths,
    priorities: feedback.priorities,
  } satisfies WritingHistoryEntry
}
