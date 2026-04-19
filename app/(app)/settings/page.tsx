import { LearnerGoalsSettings } from './_components/learner-goals-settings'
import { getLearnerGoals } from '@/lib/learner/learner-goals-repository'

export default async function SettingsPage() {
  const { goals: learnerGoals } = await getLearnerGoals()

  return <LearnerGoalsSettings initialGoals={learnerGoals} />
}
