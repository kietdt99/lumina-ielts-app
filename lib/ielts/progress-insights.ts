import type { LearnerGoals } from '@/lib/learner/learner-goals'
import type { WritingHistoryEntry } from './writing-history'

export type ProgressTrend = 'collecting-baseline' | 'improving' | 'steady' | 'declining'

export type ProgressRiskLevel = 'Baseline' | 'Low' | 'Medium' | 'High'

export type RubricProgressInsight = {
  label: string
  averageScore: number
  latestScore: number
  lowestScore: number
  sessionsBelowTarget: number
  gapToTarget: number
  trend: ProgressTrend
  action: string
  route: string
}

export type PriorityProgressPattern = {
  priority: string
  count: number
  impactLevel: 'High' | 'Medium' | 'Low'
}

export type ProgressNextAction = {
  label: string
  description: string
  route: string
}

export type ProgressInsightsReport = {
  headline: string
  summary: string
  totalSessions: number
  targetBand: number
  recentAverage: number
  previousAverage: number
  bestBand: number
  targetGap: number
  trend: ProgressTrend
  trendLabel: string
  riskLevel: ProgressRiskLevel
  sessionsThisWeek: number
  taskOneCount: number
  taskTwoCount: number
  dominantTask: 'Task 1' | 'Task 2' | 'Balanced' | 'None'
  weakestCriterion: RubricProgressInsight | null
  strongestCriterion: RubricProgressInsight | null
  rubricInsights: RubricProgressInsight[]
  priorityPatterns: PriorityProgressPattern[]
  nextActions: ProgressNextAction[]
}

const oneWeekMs = 7 * 24 * 60 * 60 * 1000

function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10
}

function sortNewest(entries: WritingHistoryEntry[]) {
  return [...entries].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  )
}

function average(values: number[]) {
  if (!values.length) {
    return 0
  }

  return roundToOneDecimal(
    values.reduce((total, value) => total + value, 0) / values.length
  )
}

function getTrend(currentAverage: number, previousAverage: number): ProgressTrend {
  if (!previousAverage) {
    return 'collecting-baseline'
  }

  const delta = roundToOneDecimal(currentAverage - previousAverage)

  if (delta >= 0.3) {
    return 'improving'
  }

  if (delta <= -0.3) {
    return 'declining'
  }

  return 'steady'
}

function getTrendLabel(trend: ProgressTrend) {
  switch (trend) {
    case 'improving':
      return 'Improving'
    case 'declining':
      return 'Needs attention'
    case 'steady':
      return 'Stable'
    case 'collecting-baseline':
      return 'Collecting baseline'
  }
}

function getRiskLevel(totalSessions: number, targetGap: number): ProgressRiskLevel {
  if (!totalSessions) {
    return 'Baseline'
  }

  if (targetGap >= 1) {
    return 'High'
  }

  if (targetGap >= 0.5) {
    return 'Medium'
  }

  return 'Low'
}

function getRubricAction(label: string) {
  if (/task response|task achievement/i.test(label)) {
    return {
      action: 'Rewrite the answer focus and add one clearer support move.',
      route: '/revision-studio',
    }
  }

  if (/coherence/i.test(label)) {
    return {
      action: 'Rebuild paragraph jobs before writing the next full draft.',
      route: '/outline-builder',
    }
  }

  if (/lexical/i.test(label)) {
    return {
      action: 'Train topic-specific wording and replace repeated language.',
      route: '/vocabulary-builder',
    }
  }

  return {
    action: 'Run a sentence-boundary and grammar control pass.',
    route: '/revision-checklist',
  }
}

function createRubricInsights(
  entries: WritingHistoryEntry[],
  targetBand: number
): RubricProgressInsight[] {
  const scoresByCriterion = new Map<string, number[]>()
  const latestByCriterion = new Map<string, number>()

  for (const entry of entries) {
    for (const row of entry.rubric) {
      const currentScores = scoresByCriterion.get(row.label) ?? []
      scoresByCriterion.set(row.label, [...currentScores, row.score])

      if (!latestByCriterion.has(row.label)) {
        latestByCriterion.set(row.label, row.score)
      }
    }
  }

  return [...scoresByCriterion.entries()]
    .map(([label, scores]) => {
      const averageScore = average(scores)
      const latestScore = latestByCriterion.get(label) ?? averageScore
      const firstHalfAverage = average(scores.slice(0, 3))
      const secondHalfAverage = average(scores.slice(3, 6))
      const { action, route } = getRubricAction(label)

      return {
        label,
        averageScore,
        latestScore,
        lowestScore: Math.min(...scores),
        sessionsBelowTarget: scores.filter((score) => score < targetBand).length,
        gapToTarget: roundToOneDecimal(Math.max(0, targetBand - averageScore)),
        trend: getTrend(firstHalfAverage, secondHalfAverage),
        action,
        route,
      } satisfies RubricProgressInsight
    })
    .sort(
      (left, right) =>
        right.gapToTarget - left.gapToTarget ||
        left.averageScore - right.averageScore ||
        left.label.localeCompare(right.label)
    )
}

function createPriorityPatterns(entries: WritingHistoryEntry[]) {
  const counts = new Map<string, number>()

  for (const entry of entries.slice(0, 8)) {
    for (const priority of entry.priorities.slice(0, 3)) {
      counts.set(priority, (counts.get(priority) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .sort(
      (left, right) =>
        right[1] - left[1] ||
        left[0].localeCompare(right[0])
    )
    .slice(0, 5)
    .map(([priority, count]) => ({
      priority,
      count,
      impactLevel: count >= 3 ? 'High' : count === 2 ? 'Medium' : 'Low',
    })) satisfies PriorityProgressPattern[]
}

function getDominantTask(taskOneCount: number, taskTwoCount: number) {
  if (!taskOneCount && !taskTwoCount) {
    return 'None' as const
  }

  if (taskOneCount === taskTwoCount) {
    return 'Balanced' as const
  }

  return taskOneCount > taskTwoCount ? 'Task 1' as const : 'Task 2' as const
}

function createNextActions(args: {
  entries: WritingHistoryEntry[]
  goals: LearnerGoals
  weakestCriterion: RubricProgressInsight | null
  priorityPatterns: PriorityProgressPattern[]
  targetGap: number
}) {
  const { entries, goals, weakestCriterion, priorityPatterns, targetGap } = args

  if (!entries.length) {
    return [
      {
        label: 'Create the first signal',
        description: `Complete one ${goals.focusSkill.toLowerCase()} practice session so the app can measure progress.`,
        route: '/writing',
      },
      {
        label: 'Set the weekly rhythm',
        description: `Protect a ${goals.studyFrequency.toLowerCase()} cadence before optimizing the details.`,
        route: '/study-plan',
      },
    ] satisfies ProgressNextAction[]
  }

  return [
    weakestCriterion
      ? {
          label: `Lift ${weakestCriterion.label}`,
          description: weakestCriterion.action,
          route: weakestCriterion.route,
        }
      : {
          label: 'Review the latest feedback',
          description: 'Open the tracker and inspect the newest saved writing session.',
          route: '/tracker',
        },
    priorityPatterns[0]
      ? {
          label: 'Break the recurring pattern',
          description: priorityPatterns[0].priority,
          route: '/review-queue',
        }
      : {
          label: 'Build a review queue',
          description: 'Save more feedback so recurring priorities become visible.',
          route: '/review-queue',
        },
    {
      label: targetGap >= 0.5 ? 'Run a targeted sprint' : 'Protect the gain',
      description:
        targetGap >= 0.5
          ? 'Choose a guided sprint that directly supports the weakest criterion.'
          : 'Stay consistent and use revision work to keep the current band stable.',
      route: targetGap >= 0.5 ? '/practice-sprint' : '/revision-studio',
    },
  ] satisfies ProgressNextAction[]
}

export function createProgressInsightsReport(
  goals: LearnerGoals,
  entries: WritingHistoryEntry[],
  referenceDate = new Date()
): ProgressInsightsReport {
  const sortedEntries = sortNewest(entries)
  const recentEntries = sortedEntries.slice(0, 3)
  const previousEntries = sortedEntries.slice(3, 6)
  const totalSessions = sortedEntries.length
  const recentAverage = average(recentEntries.map((entry) => entry.estimatedBand))
  const previousAverage = average(
    previousEntries.map((entry) => entry.estimatedBand)
  )
  const bestBand = totalSessions
    ? Math.max(...sortedEntries.map((entry) => entry.estimatedBand))
    : 0
  const targetGap = totalSessions
    ? roundToOneDecimal(Math.max(0, goals.targetBand - recentAverage))
    : roundToOneDecimal(Math.max(0, goals.targetBand - 0))
  const trend = getTrend(recentAverage, previousAverage)
  const taskOneCount = sortedEntries.filter((entry) => entry.taskType === 'Task 1')
    .length
  const taskTwoCount = sortedEntries.filter((entry) => entry.taskType === 'Task 2')
    .length
  const rubricInsights = createRubricInsights(sortedEntries, goals.targetBand)
  const weakestCriterion = rubricInsights[0] ?? null
  const strongestCriterion =
    [...rubricInsights].sort(
      (left, right) =>
        right.averageScore - left.averageScore ||
        left.label.localeCompare(right.label)
    )[0] ?? null
  const priorityPatterns = createPriorityPatterns(sortedEntries)
  const sessionsThisWeek = sortedEntries.filter(
    (entry) =>
      new Date(entry.createdAt).getTime() >= referenceDate.getTime() - oneWeekMs
  ).length
  const nextActions = createNextActions({
    entries: sortedEntries,
    goals,
    weakestCriterion,
    priorityPatterns,
    targetGap,
  })

  if (!totalSessions) {
    return {
      headline: 'Build your first progress signal',
      summary:
        'Complete a writing session and save feedback so Lumina can identify rubric gaps, recurring priorities, and the next best practice move.',
      totalSessions,
      targetBand: goals.targetBand,
      recentAverage,
      previousAverage,
      bestBand,
      targetGap,
      trend,
      trendLabel: getTrendLabel(trend),
      riskLevel: getRiskLevel(totalSessions, targetGap),
      sessionsThisWeek,
      taskOneCount,
      taskTwoCount,
      dominantTask: getDominantTask(taskOneCount, taskTwoCount),
      weakestCriterion,
      strongestCriterion,
      rubricInsights,
      priorityPatterns,
      nextActions,
    }
  }

  return {
    headline:
      targetGap <= 0.3
        ? 'Your writing band is close to target'
        : `Close a ${targetGap.toFixed(1)} band gap with focused practice`,
    summary: weakestCriterion
      ? `${weakestCriterion.label} is currently the highest-leverage criterion. Focus the next rewrite on that gap before adding more full drafts.`
      : 'Your saved writing history is ready for review. Use the next actions to keep momentum steady.',
    totalSessions,
    targetBand: goals.targetBand,
    recentAverage,
    previousAverage,
    bestBand,
    targetGap,
    trend,
    trendLabel: getTrendLabel(trend),
    riskLevel: getRiskLevel(totalSessions, targetGap),
    sessionsThisWeek,
    taskOneCount,
    taskTwoCount,
    dominantTask: getDominantTask(taskOneCount, taskTwoCount),
    weakestCriterion,
    strongestCriterion,
    rubricInsights,
    priorityPatterns,
    nextActions,
  }
}
