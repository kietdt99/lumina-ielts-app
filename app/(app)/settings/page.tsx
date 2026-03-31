import { LearnerGoalsSettings } from './_components/learner-goals-settings'
import { getLearnerGoalsFromCookies } from '@/lib/learner/learner-goals-cookie'

export default async function SettingsPage() {
  const learnerGoals = await getLearnerGoalsFromCookies()

  return <LearnerGoalsSettings initialGoals={learnerGoals} />
}
