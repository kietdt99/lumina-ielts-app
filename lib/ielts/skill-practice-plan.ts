import type { LearnerGoals } from '@/lib/learner/learner-goals'
import type { WritingHistoryEntry } from './writing-history'

export type IeltsSkill = LearnerGoals['focusSkill']

export type SkillPracticeModule = {
  skill: IeltsSkill
  title: string
  href: string
  shortLabel: string
  description: string
  actionLabel: string
  evidence: string
  recommendedMinutes: number
}

export type SkillPracticeMixItem = {
  skill: IeltsSkill
  sessions: number
  href: string
  label: string
}

export type SkillPracticePlan = {
  headline: string
  summary: string
  actions: string[]
  focusModule: SkillPracticeModule
  modules: SkillPracticeModule[]
  weeklyMix: SkillPracticeMixItem[]
  weeklyTargetSessions: number
  writingCheckpointCount: number
}

const skillOrder: IeltsSkill[] = ['Writing', 'Reading', 'Listening', 'Speaking']

const weeklySessionTargetMap: Record<LearnerGoals['studyFrequency'], number> = {
  '2 sessions/week': 2,
  '4 sessions/week': 4,
  Daily: 7,
}

const skillPracticeModules: Record<IeltsSkill, SkillPracticeModule> = {
  Writing: {
    skill: 'Writing',
    title: 'Writing Assistant',
    href: '/writing',
    shortLabel: 'W',
    description:
      'Draft, review, and turn rubric feedback into a focused rewrite loop.',
    actionLabel: 'Start Writing Practice',
    evidence: 'Tracked band estimates and revision priorities',
    recommendedMinutes: 40,
  },
  Reading: {
    skill: 'Reading',
    title: 'Reading Practice',
    href: '/reading-practice',
    shortLabel: 'R',
    description:
      'Train passage scanning, evidence matching, and answer confidence.',
    actionLabel: 'Start Reading Practice',
    evidence: 'Accuracy checks for question handling',
    recommendedMinutes: 20,
  },
  Listening: {
    skill: 'Listening',
    title: 'Listening Practice',
    href: '/listening-practice',
    shortLabel: 'L',
    description:
      'Practice note completion, detail capture, and section-by-section review.',
    actionLabel: 'Start Listening Practice',
    evidence: 'Transcript-backed answer review',
    recommendedMinutes: 30,
  },
  Speaking: {
    skill: 'Speaking',
    title: 'Speaking Practice',
    href: '/speaking-practice',
    shortLabel: 'S',
    description:
      'Build fluent answers with cue-card planning and follow-up drills.',
    actionLabel: 'Start Speaking Practice',
    evidence: 'Answer structure and fluency prompts',
    recommendedMinutes: 15,
  },
}

function uniqueActions(actions: string[]) {
  return [...new Set(actions)]
}

function createWeeklyMix(
  focusSkill: IeltsSkill,
  weeklyTargetSessions: number
): SkillPracticeMixItem[] {
  const sessionsBySkill = new Map<IeltsSkill, number>(
    skillOrder.map((skill) => [skill, 0])
  )
  const focusSessions = Math.min(
    weeklyTargetSessions,
    Math.max(1, Math.ceil(weeklyTargetSessions * 0.45))
  )
  let remainingSessions = weeklyTargetSessions - focusSessions

  sessionsBySkill.set(focusSkill, focusSessions)

  const supportSkills = skillOrder.filter((skill) => skill !== focusSkill)
  let supportIndex = 0

  while (remainingSessions > 0) {
    const supportSkill = supportSkills[supportIndex % supportSkills.length]
    sessionsBySkill.set(
      supportSkill,
      (sessionsBySkill.get(supportSkill) ?? 0) + 1
    )
    remainingSessions -= 1
    supportIndex += 1
  }

  return skillOrder.map((skill) => ({
    skill,
    sessions: sessionsBySkill.get(skill) ?? 0,
    href: skillPracticeModules[skill].href,
    label: skillPracticeModules[skill].title,
  }))
}

export function getSkillPracticeModules() {
  return skillOrder.map((skill) => skillPracticeModules[skill])
}

export function createSkillPracticePlan(
  goals: LearnerGoals,
  writingEntries: WritingHistoryEntry[]
): SkillPracticePlan {
  const focusModule = skillPracticeModules[goals.focusSkill]
  const weeklyTargetSessions = weeklySessionTargetMap[goals.studyFrequency]
  const weeklyMix = createWeeklyMix(goals.focusSkill, weeklyTargetSessions)
  const latestWritingEntry = writingEntries[0]
  const writingCheckpointCount = writingEntries.length
  const writingEvidence = latestWritingEntry
    ? `Latest writing checkpoint: Band ${latestWritingEntry.estimatedBand.toFixed(1)}`
    : 'No writing checkpoint saved yet'

  return {
    headline: `Prioritize ${focusModule.skill} today`,
    summary: `Your ${goals.studyFrequency.toLowerCase()} plan starts with ${focusModule.title} and keeps a Writing checkpoint in the weekly loop so progress stays measurable.`,
    actions: uniqueActions([
      `Open ${focusModule.title} for the next focused practice block.`,
      writingCheckpointCount
        ? `Use the latest Writing evidence: ${writingEvidence}.`
        : 'Save one Writing checkpoint this week to unlock stronger progress insight.',
      'Rotate one support skill after the focus session to avoid a single-skill plateau.',
    ]),
    focusModule,
    modules: getSkillPracticeModules(),
    weeklyMix,
    weeklyTargetSessions,
    writingCheckpointCount,
  }
}
