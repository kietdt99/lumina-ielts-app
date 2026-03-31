import { WritingSessionDetailPage } from '../_components/writing-session-detail-page'

export default async function TrackerEntryPage({
  params,
}: {
  params: Promise<{ entryId: string }>
}) {
  const { entryId } = await params

  return <WritingSessionDetailPage entryId={entryId} />
}
