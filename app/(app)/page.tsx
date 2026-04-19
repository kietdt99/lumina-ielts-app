import { DashboardOverview } from './_components/dashboard-overview'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { getLearnerGoals } from '@/lib/learner/learner-goals-repository'

export default async function Dashboard() {
  const session = await requireLearnerAppSession()
  const { goals: learnerGoals } = await getLearnerGoals()

  return (
    <DashboardOverview
      learnerGoals={learnerGoals}
      learnerName={session.fullName}
    />
  )
}
