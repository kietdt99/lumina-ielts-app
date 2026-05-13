import { requireLearnerAppSession } from '@/lib/auth/service'
import { createReviewQueue } from '@/lib/ielts/review-queue'
import { listWritingSubmissionHistory } from '@/lib/ielts/writing-submissions-repository'

export async function GET() {
  await requireLearnerAppSession()
  const { entries, storageMode } = await listWritingSubmissionHistory()

  return Response.json({
    ok: true,
    queue: createReviewQueue(entries),
    storageMode,
  })
}
