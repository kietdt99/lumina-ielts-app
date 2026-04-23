import { DashboardOverview } from './_components/dashboard-overview'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { listWritingSubmissionHistory } from '@/lib/ielts/writing-submissions-repository'
import { getLearnerGoals } from '@/lib/learner/learner-goals-repository'

export default async function Dashboard() {
  const session = await requireLearnerAppSession()
  const { goals: learnerGoals } = await getLearnerGoals()
  const { entries } = await listWritingSubmissionHistory()

  return (
    <DashboardOverview
      learnerGoals={learnerGoals}
      learnerName={session.fullName}
      initialEntries={entries}
    />
  )
}
