import { DashboardOverview } from './_components/dashboard-overview'
import { getLearnerGoals } from '@/lib/learner/learner-goals-repository'

export default async function Dashboard() {
  const { goals: learnerGoals } = await getLearnerGoals()

  return <DashboardOverview learnerGoals={learnerGoals} />
}
