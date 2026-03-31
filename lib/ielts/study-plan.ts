import type { LearnerGoals } from '@/lib/learner/learner-goals'
import type { WritingHistoryEntry } from './writing-history'

type StudyRecommendation = {
  headline: string
  summary: string
  actions: string[]
  recentAverage: number
  targetGap: number
  sessionsThisWeek: number
  recurringPriority: string | null
}

const currentLevelEstimateMap: Record<LearnerGoals['currentLevel'], number> = {
  'Band 5.0-5.5': 5.25,
  'Band 6.0-6.5': 6.25,
  'Band 7.0+': 7,
}

function roundBand(value: number) {
  return Math.round(value * 10) / 10
}

function uniqueActions(actions: string[]) {
  return [...new Set(actions)]
}

export function recentAverageBand(
  entries: WritingHistoryEntry[],
  limit = 3
) {
  if (!entries.length) {
    return 0
  }

  const scopedEntries = entries.slice(0, limit)
  const total = scopedEntries.reduce((sum, entry) => sum + entry.estimatedBand, 0)
  return roundBand(total / scopedEntries.length)
}

export function sessionsThisWeek(
  entries: WritingHistoryEntry[],
  referenceDate = new Date()
) {
  const sevenDaysAgo = referenceDate.getTime() - 7 * 24 * 60 * 60 * 1000

  return entries.filter(
    (entry) => new Date(entry.createdAt).getTime() >= sevenDaysAgo
  ).length
}

export function recurringPriority(entries: WritingHistoryEntry[]) {
  const counts = new Map<string, number>()

  for (const entry of entries.slice(0, 5)) {
    for (const priority of entry.priorities.slice(0, 2)) {
      counts.set(priority, (counts.get(priority) ?? 0) + 1)
    }
  }

  const [topPriority] =
    [...counts.entries()].sort((left, right) => right[1] - left[1])[0] ?? []

  return topPriority ?? null
}

export function createStudyRecommendation(
  goals: LearnerGoals,
  entries: WritingHistoryEntry[],
  referenceDate = new Date()
): StudyRecommendation {
  const recentAverage = recentAverageBand(entries)
  const sessionsCompletedThisWeek = sessionsThisWeek(entries, referenceDate)
  const recurringFocus = recurringPriority(entries)

  if (!entries.length) {
    const targetGap = roundBand(
      Math.max(0, goals.targetBand - currentLevelEstimateMap[goals.currentLevel])
    )

    return {
      headline: `Start your ${goals.focusSkill.toLowerCase()} study loop`,
      summary: `You are building from ${goals.currentLevel} toward Band ${goals.targetBand.toFixed(1)}. Start with one complete ${goals.focusSkill.toLowerCase()} session and review the feedback immediately after.`,
      actions: uniqueActions([
        `Complete your first ${goals.focusSkill.toLowerCase()} practice session.`,
        `Protect a ${goals.studyFrequency.toLowerCase()} rhythm this week.`,
        'Capture one clear revision takeaway after each practice run.',
      ]),
      recentAverage,
      targetGap,
      sessionsThisWeek: sessionsCompletedThisWeek,
      recurringPriority: recurringFocus,
    }
  }

  const targetGap = roundBand(Math.max(0, goals.targetBand - recentAverage))
  const latestEntry = entries[0]
  const headline =
    targetGap <= 0.3
      ? 'Protect your current band level'
      : `Close the gap to Band ${goals.targetBand.toFixed(1)}`
  const summary =
    targetGap <= 0.3
      ? `Your latest sessions are close to the target. Stay consistent with ${goals.studyFrequency.toLowerCase()} and keep refining the recurring weak spots.`
      : `Your latest ${Math.min(entries.length, 3)} writing session${entries.length === 1 ? '' : 's'} average ${recentAverage.toFixed(1)}, leaving a ${targetGap.toFixed(1)} band gap to your target.`

  return {
    headline,
    summary,
    actions: uniqueActions([
      latestEntry?.priorities[0] ??
        `Complete another ${goals.focusSkill.toLowerCase()} session this week.`,
      recurringFocus ?? 'Keep reviewing repeated rubric weaknesses across sessions.',
      `Maintain a ${goals.studyFrequency.toLowerCase()} study rhythm.`,
    ]),
    recentAverage,
    targetGap,
    sessionsThisWeek: sessionsCompletedThisWeek,
    recurringPriority: recurringFocus,
  }
}
