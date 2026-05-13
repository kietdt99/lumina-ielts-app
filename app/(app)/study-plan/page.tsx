import { StudyPlanWorkspace } from './_components/study-plan-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { listWritingSubmissionHistory } from '@/lib/ielts/writing-submissions-repository'
import { getLearnerGoals } from '@/lib/learner/learner-goals-repository'

export default async function StudyPlanPage() {
  await requireLearnerAppSession()
  const { goals: learnerGoals } = await getLearnerGoals()
  const { entries } = await listWritingSubmissionHistory()

  return (
    <StudyPlanWorkspace
      learnerGoals={learnerGoals}
      initialEntries={entries}
    />
  )
}
