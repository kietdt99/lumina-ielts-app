import { redirect } from 'next/navigation'
import { LearnerGoalsSettings } from '@/app/(app)/settings/_components/learner-goals-settings'
import { getLearnerGoals } from '@/lib/learner/learner-goals-repository'
import { requireLearnerSession } from '@/lib/auth/service'

export default async function OnboardingPage() {
  const session = await requireLearnerSession()

  if (session.mustChangePassword && !session.passwordResetDeferred) {
    redirect('/auth/change-password')
  }

  if (session.onboardingCompleted) {
    redirect('/')
  }

  const { goals } = await getLearnerGoals()

  return <LearnerGoalsSettings initialGoals={goals} mode="onboarding" />
}
