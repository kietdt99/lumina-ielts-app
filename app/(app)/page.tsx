import { DashboardOverview } from './_components/dashboard-overview'
import { getLearnerGoalsFromCookies } from '@/lib/learner/learner-goals-cookie'

export default async function Dashboard() {
  const learnerGoals = await getLearnerGoalsFromCookies()

  return <DashboardOverview learnerGoals={learnerGoals} />
}
