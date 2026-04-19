import { LearnerGoalsSettings } from '../_components/learner-goals-settings'
import { PasswordSettingsCard } from '../_components/password-settings-card'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { getLearnerGoals } from '@/lib/learner/learner-goals-repository'

export default async function ProfileSettingsPage() {
  const session = await requireLearnerAppSession()
  const { goals } = await getLearnerGoals()

  return (
    <>
      <LearnerGoalsSettings initialGoals={goals} />
      <PasswordSettingsCard mustChangePassword={session.mustChangePassword} />
    </>
  )
}
