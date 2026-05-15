import {
  getDraftMetrics,
  type DraftMetrics,
} from './writing-feedback'
import { createWritingReadinessCheck } from './writing-readiness'
import type { WritingMockTest } from './mock-test-lab'

export type MockTestDebriefStatus =
  | 'not-started'
  | 'incomplete'
  | 'needs-review'
  | 'ready-for-feedback'

export type MockTestTimeStatus =
  | 'not-started'
  | 'on-track'
  | 'rushed'
  | 'banked-time'

export type MockTaskDebrief = {
  taskType: 'Task 1' | 'Task 2'
  promptId: string
  promptTitle: string
  wordCount: number
  minimumWords: number
  wordGap: number
  readinessScore: number
  status: 'not-started' | 'below-target' | 'ready'
  summary: string
  actions: string[]
  metrics: DraftMetrics
}

export type MockTestDebrief = {
  status: MockTestDebriefStatus
  statusLabel: string
  headline: string
  summary: string
  totalWordCount: number
  totalMinimumWords: number
  completionScore: number
  remainingSeconds: number
  timeUsedMinutes: number
  timeStatus: MockTestTimeStatus
  timeStatusLabel: string
  checkpointCompletion: number
  completedCheckpointCount: number
  totalCheckpointCount: number
  priorityTask: MockTaskDebrief | null
  taskOne: MockTaskDebrief
  taskTwo: MockTaskDebrief
  nextActions: string[]
}

export type CreateMockTestDebriefInput = {
  test: WritingMockTest
  taskOneDraft?: string
  taskTwoDraft?: string
  remainingSeconds?: number
  completedCheckpointIds?: string[]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function scorePercent(value: number) {
  return Math.round(clamp(value, 0, 100))
}

function getStatusLabel(status: MockTestDebriefStatus) {
  switch (status) {
    case 'not-started':
      return 'Not started'
    case 'incomplete':
      return 'Incomplete'
    case 'needs-review':
      return 'Needs review'
    case 'ready-for-feedback':
      return 'Ready for feedback'
  }
}

function getTimeStatusLabel(status: MockTestTimeStatus) {
  switch (status) {
    case 'not-started':
      return 'Not started'
    case 'on-track':
      return 'On track'
    case 'rushed':
      return 'Rushed'
    case 'banked-time':
      return 'Banked time'
  }
}

function buildTaskActions({
  minimumWords,
  readinessScore,
  taskType,
  wordCount,
  wordGap,
}: {
  minimumWords: number
  readinessScore: number
  taskType: MockTaskDebrief['taskType']
  wordCount: number
  wordGap: number
}) {
  if (wordCount === 0) {
    return [`Write the ${taskType} draft before reviewing accuracy.`]
  }

  if (wordGap > 0) {
    return [
      `Add ${wordGap} more words to reach the ${minimumWords}-word target.`,
      `Expand the weakest ${taskType} paragraph before polishing language.`,
    ]
  }

  if (readinessScore < 80) {
    return [
      `Fix the ${taskType} readiness checks before asking for feedback.`,
      'Scan paragraph jobs, linking, vocabulary range, and sentence control.',
    ]
  }

  return [
    `Use a final ${taskType} check pass for grammar, linking, and repeated wording.`,
  ]
}

function buildTaskSummary({
  readinessScore,
  taskType,
  wordCount,
  wordGap,
}: {
  readinessScore: number
  taskType: MockTaskDebrief['taskType']
  wordCount: number
  wordGap: number
}) {
  if (wordCount === 0) {
    return `${taskType} has not been drafted yet.`
  }

  if (wordGap > 0) {
    return `${taskType} is ${wordGap} words below the target.`
  }

  if (readinessScore < 80) {
    return `${taskType} reached the word target, but readiness checks still show risk.`
  }

  return `${taskType} is ready for a focused feedback run.`
}

function createTaskDebrief({
  draft,
  minimumWords,
  promptId,
  promptTitle,
  taskType,
  test,
}: {
  draft: string
  minimumWords: number
  promptId: string
  promptTitle: string
  taskType: MockTaskDebrief['taskType']
  test: WritingMockTest
}): MockTaskDebrief {
  const metrics = getDraftMetrics(draft)
  const prompt =
    taskType === 'Task 1' ? test.taskOnePrompt : test.taskTwoPrompt
  const readiness = createWritingReadinessCheck(prompt, draft)
  const wordGap = Math.max(0, minimumWords - metrics.wordCount)
  const status =
    metrics.wordCount === 0
      ? 'not-started'
      : wordGap > 0
        ? 'below-target'
        : 'ready'

  return {
    taskType,
    promptId,
    promptTitle,
    wordCount: metrics.wordCount,
    minimumWords,
    wordGap,
    readinessScore: readiness.readinessScore,
    status,
    summary: buildTaskSummary({
      readinessScore: readiness.readinessScore,
      taskType,
      wordCount: metrics.wordCount,
      wordGap,
    }),
    actions: buildTaskActions({
      minimumWords,
      readinessScore: readiness.readinessScore,
      taskType,
      wordCount: metrics.wordCount,
      wordGap,
    }),
    metrics,
  }
}

function getPriorityTask(taskOne: MockTaskDebrief, taskTwo: MockTaskDebrief) {
  if (taskOne.status === 'ready' && taskTwo.status === 'ready') {
    if (taskOne.readinessScore >= 80 && taskTwo.readinessScore >= 80) {
      return null
    }
  }

  const taskOneRisk = taskOne.wordGap * 2 + (100 - taskOne.readinessScore)
  const taskTwoRisk = taskTwo.wordGap * 2 + (100 - taskTwo.readinessScore)

  return taskTwoRisk >= taskOneRisk ? taskTwo : taskOne
}

function buildStatus({
  checkpointCompletion,
  taskOne,
  taskTwo,
}: {
  checkpointCompletion: number
  taskOne: MockTaskDebrief
  taskTwo: MockTaskDebrief
}): MockTestDebriefStatus {
  const totalWordCount = taskOne.wordCount + taskTwo.wordCount

  if (totalWordCount === 0) {
    return 'not-started'
  }

  if (taskOne.status !== 'ready' || taskTwo.status !== 'ready') {
    return 'incomplete'
  }

  if (
    taskOne.readinessScore >= 80 &&
    taskTwo.readinessScore >= 80 &&
    checkpointCompletion === 100
  ) {
    return 'ready-for-feedback'
  }

  return 'needs-review'
}

function buildHeadline(status: MockTestDebriefStatus) {
  switch (status) {
    case 'not-started':
      return 'Start both tasks before reviewing the mock'
    case 'incomplete':
      return 'Finish the missing exam requirements first'
    case 'needs-review':
      return 'Good draft base, but debrief found review risks'
    case 'ready-for-feedback':
      return 'Ready to send both tasks for feedback'
  }
}

function buildSummary({
  checkpointCompletion,
  priorityTask,
  status,
}: {
  checkpointCompletion: number
  priorityTask: MockTaskDebrief | null
  status: MockTestDebriefStatus
}) {
  switch (status) {
    case 'not-started':
      return 'Choose a pair, write both drafts, then use this debrief to decide what to fix first.'
    case 'incomplete':
      return priorityTask
        ? `${priorityTask.taskType} should be fixed first before this feels like a complete 60-minute mock.`
        : 'One or both tasks still need more words before the mock can be reviewed.'
    case 'needs-review':
      return checkpointCompletion < 100
        ? 'The drafts have enough words, but the exam checkpoints are not fully confirmed yet.'
        : 'The drafts have enough words, but one readiness area still needs a careful review pass.'
    case 'ready-for-feedback':
      return 'Both tasks meet the core mock-test checks. Submit them for feedback, then review the results in Revision Studio.'
  }
}

function buildTimeStatus({
  remainingSeconds,
  status,
  totalWordCount,
}: {
  remainingSeconds: number
  status: MockTestDebriefStatus
  totalWordCount: number
}): MockTestTimeStatus {
  if (totalWordCount === 0) {
    return 'not-started'
  }

  if (remainingSeconds <= 0 && status !== 'ready-for-feedback') {
    return 'rushed'
  }

  if (remainingSeconds >= 5 * 60 && status === 'ready-for-feedback') {
    return 'banked-time'
  }

  return 'on-track'
}

function buildNextActions({
  checkpointCompletion,
  priorityTask,
  status,
  taskOne,
  taskTwo,
}: {
  checkpointCompletion: number
  priorityTask: MockTaskDebrief | null
  status: MockTestDebriefStatus
  taskOne: MockTaskDebrief
  taskTwo: MockTaskDebrief
}) {
  const actions: string[] = []

  if (taskOne.wordGap > 0) {
    actions.push('Finish Task 1 word target before polishing Task 2.')
  }

  if (taskTwo.wordGap > 0) {
    actions.push('Finish Task 2 word target before treating the mock as complete.')
  }

  if (priorityTask && priorityTask.readinessScore < 80) {
    actions.push(...priorityTask.actions.slice(0, 1))
  }

  if (checkpointCompletion < 100) {
    actions.push('Complete the remaining exam checkpoints.')
  }

  if (status === 'ready-for-feedback') {
    actions.push(
      'Submit each task in Writing for feedback, then review the results in Revision Studio.'
    )
  }

  return actions.length
    ? actions
    : ['Run one final accuracy pass before leaving the mock test.']
}

function normalizeRemainingSeconds(
  remainingSeconds: number | undefined,
  totalSeconds: number
) {
  if (typeof remainingSeconds !== 'number' || !Number.isFinite(remainingSeconds)) {
    return totalSeconds
  }

  return Math.round(clamp(remainingSeconds, 0, totalSeconds))
}

export function createMockTestDebrief({
  test,
  taskOneDraft = '',
  taskTwoDraft = '',
  remainingSeconds,
  completedCheckpointIds = [],
}: CreateMockTestDebriefInput): MockTestDebrief {
  const totalSeconds = test.totalMinutes * 60
  const normalizedRemainingSeconds = normalizeRemainingSeconds(
    remainingSeconds,
    totalSeconds
  )
  const validCheckpointIds = new Set(test.checkpoints.map((checkpoint) => checkpoint.id))
  const completedCheckpointCount = new Set(
    completedCheckpointIds.filter((checkpointId) =>
      validCheckpointIds.has(checkpointId)
    )
  ).size
  const totalCheckpointCount = test.checkpoints.length
  const checkpointCompletion = totalCheckpointCount
    ? scorePercent((completedCheckpointCount / totalCheckpointCount) * 100)
    : 100
  const taskOne = createTaskDebrief({
    draft: taskOneDraft,
    minimumWords: test.taskOnePrompt.minimumWords,
    promptId: test.taskOnePrompt.id,
    promptTitle: test.taskOnePrompt.title,
    taskType: 'Task 1',
    test,
  })
  const taskTwo = createTaskDebrief({
    draft: taskTwoDraft,
    minimumWords: test.taskTwoPrompt.minimumWords,
    promptId: test.taskTwoPrompt.id,
    promptTitle: test.taskTwoPrompt.title,
    taskType: 'Task 2',
    test,
  })
  const totalWordCount = taskOne.wordCount + taskTwo.wordCount
  const wordCompletion = scorePercent(
    ((Math.min(taskOne.wordCount / taskOne.minimumWords, 1) +
      Math.min(taskTwo.wordCount / taskTwo.minimumWords, 1)) /
      2) *
      100
  )
  const readinessAverage = (taskOne.readinessScore + taskTwo.readinessScore) / 2
  const completionScore = scorePercent(
    wordCompletion * 0.45 + readinessAverage * 0.35 + checkpointCompletion * 0.2
  )
  const status = buildStatus({
    checkpointCompletion,
    taskOne,
    taskTwo,
  })
  const priorityTask = getPriorityTask(taskOne, taskTwo)
  const timeStatus = buildTimeStatus({
    remainingSeconds: normalizedRemainingSeconds,
    status,
    totalWordCount,
  })
  const timeUsedMinutes = Math.ceil(
    (totalSeconds - normalizedRemainingSeconds) / 60
  )

  return {
    status,
    statusLabel: getStatusLabel(status),
    headline: buildHeadline(status),
    summary: buildSummary({
      checkpointCompletion,
      priorityTask,
      status,
    }),
    totalWordCount,
    totalMinimumWords: test.totalMinimumWords,
    completionScore,
    remainingSeconds: normalizedRemainingSeconds,
    timeUsedMinutes,
    timeStatus,
    timeStatusLabel: getTimeStatusLabel(timeStatus),
    checkpointCompletion,
    completedCheckpointCount,
    totalCheckpointCount,
    priorityTask,
    taskOne,
    taskTwo,
    nextActions: buildNextActions({
      checkpointCompletion,
      priorityTask,
      status,
      taskOne,
      taskTwo,
    }),
  }
}
