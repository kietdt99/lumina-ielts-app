import { ReviewQueueWorkspace } from './_components/review-queue-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { listWritingSubmissionHistory } from '@/lib/ielts/writing-submissions-repository'

export default async function ReviewQueuePage() {
  await requireLearnerAppSession()
  const { entries } = await listWritingSubmissionHistory()

  return <ReviewQueueWorkspace initialEntries={entries} />
}
