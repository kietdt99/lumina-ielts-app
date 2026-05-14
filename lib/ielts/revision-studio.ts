import {
  findRevisionChecklistItems,
  type RevisionChecklistItem,
} from './revision-checklist'
import { getDraftMetrics, type DraftMetrics } from './writing-feedback'
import type { WritingHistoryEntry } from './writing-history'
import type { WritingRevisionStep } from './writing-feedback'

export type RevisionStudioStatus =
  | 'not-started'
  | 'in-progress'
  | 'ready-for-check'

export type RevisionStudioFocusStep = WritingRevisionStep & {
  id: string
  checklistItem: RevisionChecklistItem
}

export type RevisionStudioSession = {
  entryId: string
  promptId: string
  promptTitle: string
  taskType: WritingHistoryEntry['taskType']
  createdAt: string
  estimatedBand: number
  originalWordCount: number
  rewriteWordCount: number
  wordDelta: number
  readyWordTarget: number
  rewriteMetrics: DraftMetrics
  status: RevisionStudioStatus
  statusLabel: string
  headline: string
  summary: string
  rewriteTarget: string
  weakestRubric: WritingHistoryEntry['rubric'][number] | null
  focusSteps: RevisionStudioFocusStep[]
  priorityChecklist: RevisionChecklistItem[]
  sampleRewrite: string | null
  draftExcerpt: string
}

export type RevisionStudioSummary = {
  totalSessions: number
  averageBand: number | null
  taskOneSessions: number
  taskTwoSessions: number
  readySessions: number
  headline: string
  summary: string
}

const statusLabels: Record<RevisionStudioStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'Rewrite in progress',
  'ready-for-check': 'Ready for readiness check',
}

function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10
}

function getReadyWordTarget(entry: WritingHistoryEntry) {
  return Math.max(60, Math.ceil(entry.wordCount * 0.4))
}

function getRevisionStatus(
  rewriteWordCount: number,
  readyWordTarget: number
): RevisionStudioStatus {
  if (rewriteWordCount === 0) {
    return 'not-started'
  }

  return rewriteWordCount >= readyWordTarget ? 'ready-for-check' : 'in-progress'
}

function getWeakestRubric(entry: WritingHistoryEntry) {
  return [...entry.rubric].sort(
    (left, right) =>
      left.score - right.score || left.label.localeCompare(right.label)
  )[0] ?? null
}

function createFallbackSteps(entry: WritingHistoryEntry): WritingRevisionStep[] {
  const priorities = entry.priorities.length
    ? entry.priorities
    : ['Rewrite the weakest paragraph with clearer support.']

  return priorities.slice(0, 3).map((priority, index) => ({
    label: `Priority pass ${index + 1}`,
    action: priority,
    successCriteria:
      'The rewrite makes the main idea easier to follow and more specific for the reader.',
  }))
}

function getChecklistText(entry: WritingHistoryEntry, step: WritingRevisionStep) {
  return [
    step.label,
    step.action,
    step.successCriteria,
    entry.priorities.join(' '),
    entry.draftExcerpt,
  ].join(' ')
}

function uniqueChecklistItems(items: RevisionChecklistItem[]) {
  return items.filter(
    (item, index, source) =>
      source.findIndex((candidate) => candidate.id === item.id) === index
  )
}

function createFocusSteps(entry: WritingHistoryEntry): RevisionStudioFocusStep[] {
  const steps = entry.revisionPlan.length
    ? entry.revisionPlan
    : createFallbackSteps(entry)

  return steps.map((step, index) => {
    const [checklistItem] = findRevisionChecklistItems({
      taskType: entry.taskType,
      text: getChecklistText(entry, step),
      limit: 1,
    })

    return {
      ...step,
      id: `${entry.id}-${index}`,
      checklistItem,
    }
  })
}

export function sortRevisionEntries(entries: WritingHistoryEntry[]) {
  return [...entries].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  )
}

export function createRevisionStudioSession(
  entry: WritingHistoryEntry,
  rewriteDraft = ''
): RevisionStudioSession {
  const rewriteMetrics = getDraftMetrics(rewriteDraft)
  const readyWordTarget = getReadyWordTarget(entry)
  const status = getRevisionStatus(rewriteMetrics.wordCount, readyWordTarget)
  const focusSteps = createFocusSteps(entry)
  const weakestRubric = getWeakestRubric(entry)
  const primaryFocus = focusSteps[0]
  const priorityChecklist = uniqueChecklistItems(
    focusSteps.map((step) => step.checklistItem)
  ).slice(0, 3)

  return {
    entryId: entry.id,
    promptId: entry.promptId,
    promptTitle: entry.promptTitle,
    taskType: entry.taskType,
    createdAt: entry.createdAt,
    estimatedBand: entry.estimatedBand,
    originalWordCount: entry.wordCount,
    rewriteWordCount: rewriteMetrics.wordCount,
    wordDelta: rewriteMetrics.wordCount - entry.wordCount,
    readyWordTarget,
    rewriteMetrics,
    status,
    statusLabel: statusLabels[status],
    headline: `${entry.promptTitle} revision`,
    summary: primaryFocus
      ? `${primaryFocus.label}: ${primaryFocus.action}`
      : 'Use this saved feedback to complete one focused rewrite pass.',
    rewriteTarget: `Write at least ${readyWordTarget} revised words before running a readiness check.`,
    weakestRubric,
    focusSteps,
    priorityChecklist,
    sampleRewrite: entry.sampleRewrite,
    draftExcerpt: entry.draftExcerpt,
  }
}

export function createRevisionStudioSummary(
  entries: WritingHistoryEntry[],
  rewriteDrafts: Record<string, string> = {}
): RevisionStudioSummary {
  const sessions = entries.map((entry) =>
    createRevisionStudioSession(entry, rewriteDrafts[entry.id] ?? '')
  )
  const totalSessions = sessions.length
  const averageBand = totalSessions
    ? roundToOneDecimal(
        sessions.reduce((total, session) => total + session.estimatedBand, 0) /
          totalSessions
      )
    : null
  const readySessions = sessions.filter(
    (session) => session.status === 'ready-for-check'
  ).length

  if (!totalSessions) {
    return {
      totalSessions,
      averageBand,
      taskOneSessions: 0,
      taskTwoSessions: 0,
      readySessions,
      headline: 'Start your first revision studio',
      summary:
        'Save writing feedback first, then return here to rewrite one draft with a clear checklist.',
    }
  }

  return {
    totalSessions,
    averageBand,
    taskOneSessions: sessions.filter((session) => session.taskType === 'Task 1')
      .length,
    taskTwoSessions: sessions.filter((session) => session.taskType === 'Task 2')
      .length,
    readySessions,
    headline: `${totalSessions} saved ${
      totalSessions === 1 ? 'draft is' : 'drafts are'
    } ready for rewrite`,
    summary:
      'Choose one saved feedback session, complete a focused rewrite, then send the improved draft through readiness checks.',
  }
}
