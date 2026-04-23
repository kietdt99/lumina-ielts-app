import { WritingSessionDetailPage } from '../_components/writing-session-detail-page'
import { listWritingSubmissionHistory } from '@/lib/ielts/writing-submissions-repository'
import { requireLearnerAppSession } from '@/lib/auth/service'

export default async function TrackerEntryPage({
  params,
}: {
  params: Promise<{ entryId: string }>
}) {
  await requireLearnerAppSession()
  const { entryId } = await params
  const { entries } = await listWritingSubmissionHistory()

  return <WritingSessionDetailPage entryId={entryId} initialEntries={entries} />
}
