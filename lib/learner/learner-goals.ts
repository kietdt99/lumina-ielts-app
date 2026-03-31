export const learnerGoalTargetBandOptions = [6, 6.5, 7, 7.5, 8] as const
export const learnerGoalCurrentLevelOptions = [
  'Band 5.0-5.5',
  'Band 6.0-6.5',
  'Band 7.0+',
] as const
export const learnerGoalFocusSkillOptions = [
  'Writing',
  'Reading',
  'Listening',
  'Speaking',
] as const
export const learnerGoalStudyFrequencyOptions = [
  '2 sessions/week',
  '4 sessions/week',
  'Daily',
] as const

export type LearnerGoals = {
  targetBand: (typeof learnerGoalTargetBandOptions)[number]
  currentLevel: (typeof learnerGoalCurrentLevelOptions)[number]
  focusSkill: (typeof learnerGoalFocusSkillOptions)[number]
  studyFrequency: (typeof learnerGoalStudyFrequencyOptions)[number]
}

export const defaultLearnerGoals: LearnerGoals = {
  targetBand: 7.5,
  currentLevel: 'Band 6.0-6.5',
  focusSkill: 'Writing',
  studyFrequency: '4 sessions/week',
}

const invalidLearnerGoalsMessage = 'Invalid learner goals payload.'

function isOption<T extends readonly string[] | readonly number[]>(
  value: unknown,
  options: T
): value is T[number] {
  return options.some((option) => option === value)
}

export function validateLearnerGoals(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return {
      ok: false as const,
      error: invalidLearnerGoalsMessage,
    }
  }

  const {
    targetBand,
    currentLevel,
    focusSkill,
    studyFrequency,
  } = payload as Partial<LearnerGoals>

  if (
    !isOption(targetBand, learnerGoalTargetBandOptions) ||
    !isOption(currentLevel, learnerGoalCurrentLevelOptions) ||
    !isOption(focusSkill, learnerGoalFocusSkillOptions) ||
    !isOption(studyFrequency, learnerGoalStudyFrequencyOptions)
  ) {
    return {
      ok: false as const,
      error: invalidLearnerGoalsMessage,
    }
  }

  return {
    ok: true as const,
    goals: {
      targetBand,
      currentLevel,
      focusSkill,
      studyFrequency,
    } satisfies LearnerGoals,
  }
}

export function serializeLearnerGoals(goals: LearnerGoals) {
  return JSON.stringify(goals)
}

export function parseLearnerGoals(value: string | undefined) {
  if (!value) {
    return defaultLearnerGoals
  }

  try {
    const parsedValue = JSON.parse(value) as unknown
    const validation = validateLearnerGoals(parsedValue)

    return validation.ok ? validation.goals : defaultLearnerGoals
  } catch {
    return defaultLearnerGoals
  }
}

export const learnerGoalErrors = {
  invalidLearnerGoalsMessage,
}
