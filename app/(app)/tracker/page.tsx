import { ProgressTracker } from './_components/progress-tracker'
import { getLearnerGoalsFromCookies } from '@/lib/learner/learner-goals-cookie'

export default async function TrackerPage() {
  const learnerGoals = await getLearnerGoalsFromCookies()

  return <ProgressTracker learnerGoals={learnerGoals} />
}
