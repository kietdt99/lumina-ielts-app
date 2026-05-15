import { ProgressInsightsWorkspace } from './_components/progress-insights-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { listWritingSubmissionHistory } from '@/lib/ielts/writing-submissions-repository'
import { getLearnerGoals } from '@/lib/learner/learner-goals-repository'

export default async function ProgressInsightsPage() {
  await requireLearnerAppSession()
  const [{ goals: learnerGoals }, { entries }] = await Promise.all([
    getLearnerGoals(),
    listWritingSubmissionHistory(),
  ])

  return (
    <ProgressInsightsWorkspace
      learnerGoals={learnerGoals}
      initialEntries={entries}
    />
  )
}
