import { cookies } from 'next/headers'
import {
  parseLearnerGoals,
  serializeLearnerGoals,
  type LearnerGoals,
} from './learner-goals'

export const learnerGoalsCookieName = 'lumina-learner-goals'

const learnerGoalsCookieOptions = {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 180,
  path: '/',
  sameSite: 'lax' as const,
}

export async function getLearnerGoalsFromCookies() {
  const cookieStore = await cookies()
  return parseLearnerGoals(cookieStore.get(learnerGoalsCookieName)?.value)
}

export async function saveLearnerGoalsToCookies(goals: LearnerGoals) {
  const cookieStore = await cookies()

  cookieStore.set({
    name: learnerGoalsCookieName,
    value: serializeLearnerGoals(goals),
    ...learnerGoalsCookieOptions,
  })
}
