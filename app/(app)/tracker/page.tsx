import { ProgressTracker } from './_components/progress-tracker'
import { listWritingSubmissionHistory } from '@/lib/ielts/writing-submissions-repository'
import { getLearnerGoals } from '@/lib/learner/learner-goals-repository'
import { requireLearnerAppSession } from '@/lib/auth/service'

export default async function TrackerPage() {
  await requireLearnerAppSession()
  const { goals: learnerGoals } = await getLearnerGoals()
  const { entries } = await listWritingSubmissionHistory()

  return <ProgressTracker learnerGoals={learnerGoals} initialEntries={entries} />
}
