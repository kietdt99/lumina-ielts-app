import type { WritingHistoryEntry } from './writing-history'
import type { WritingRevisionStep } from './writing-feedback'
import {
  findRevisionChecklistItems,
  type RevisionChecklistItem,
} from './revision-checklist'

export type ReviewQueuePriority = 'High' | 'Medium' | 'Low'

export type ReviewQueueItem = {
  id: string
  entryId: string
  promptTitle: string
  taskType: WritingHistoryEntry['taskType']
  createdAt: string
  estimatedBand: number
  label: string
  action: string
  successCriteria: string
  priority: ReviewQueuePriority
  sourceType: 'revision-plan' | 'priority'
  checklist: RevisionChecklistItem[]
}

export type ReviewQueue = {
  headline: string
  summary: string
  totalItems: number
  sourceSessions: number
  highPriorityCount: number
  topTaskType: WritingHistoryEntry['taskType'] | null
  items: ReviewQueueItem[]
}

const defaultQueueLimit = 8

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural
}

function sortByNewest(entries: WritingHistoryEntry[]) {
  return [...entries].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  )
}

function priorityFor(entryIndex: number, actionIndex: number): ReviewQueuePriority {
  if (entryIndex === 0 && actionIndex === 0) {
    return 'High'
  }

  if (entryIndex <= 1 && actionIndex <= 1) {
    return 'Medium'
  }

  return 'Low'
}

function fallbackRevisionSteps(entry: WritingHistoryEntry): WritingRevisionStep[] {
  return entry.priorities.slice(0, 2).map((priority, index) => ({
    label: `Priority ${index + 1}`,
    action: priority,
    successCriteria:
      'The next draft directly addresses this focus area with clearer evidence or language control.',
  }))
}

function topTaskType(items: ReviewQueueItem[]) {
  const counts = new Map<WritingHistoryEntry['taskType'], number>()

  for (const item of items) {
    counts.set(item.taskType, (counts.get(item.taskType) ?? 0) + 1)
  }

  const [taskType] =
    [...counts.entries()].sort((left, right) => right[1] - left[1])[0] ?? []

  return taskType ?? null
}

export function createReviewQueue(
  entries: WritingHistoryEntry[],
  limit = defaultQueueLimit
): ReviewQueue {
  const items: ReviewQueueItem[] = []

  for (const [entryIndex, entry] of sortByNewest(entries).entries()) {
    const hasRevisionPlan = entry.revisionPlan.length > 0
    const revisionSteps = hasRevisionPlan
      ? entry.revisionPlan
      : fallbackRevisionSteps(entry)

    for (const [actionIndex, step] of revisionSteps.entries()) {
      if (items.length >= limit) {
        break
      }

      items.push({
        id: `${entry.id}-${hasRevisionPlan ? 'revision' : 'priority'}-${actionIndex}`,
        entryId: entry.id,
        promptTitle: entry.promptTitle,
        taskType: entry.taskType,
        createdAt: entry.createdAt,
        estimatedBand: entry.estimatedBand,
        label: step.label,
        action: step.action,
        successCriteria: step.successCriteria,
        priority: priorityFor(entryIndex, actionIndex),
        sourceType: hasRevisionPlan ? 'revision-plan' : 'priority',
        checklist: findRevisionChecklistItems({
          taskType: entry.taskType,
          text: `${step.label} ${step.action} ${step.successCriteria}`,
        }),
      })
    }

    if (items.length >= limit) {
      break
    }
  }

  const sourceSessions = new Set(items.map((item) => item.entryId)).size
  const highPriorityCount = items.filter((item) => item.priority === 'High').length

  if (!items.length) {
    return {
      headline: 'Start your first review loop',
      summary:
        'Complete a writing session, save the feedback, and Lumina will turn the next revision steps into a focused queue.',
      totalItems: 0,
      sourceSessions: 0,
      highPriorityCount: 0,
      topTaskType: null,
      items,
    }
  }

  return {
    headline: `${items.length} review ${pluralize(items.length, 'action')} ready`,
    summary: `Review ${items.length} focused ${pluralize(items.length, 'action')} from ${sourceSessions} saved writing ${pluralize(sourceSessions, 'session')}. Start with the high-priority card before opening the full submission detail.`,
    totalItems: items.length,
    sourceSessions,
    highPriorityCount,
    topTaskType: topTaskType(items),
    items,
  }
}
