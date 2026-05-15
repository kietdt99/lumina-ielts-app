import { MistakeJournalWorkspace } from './_components/mistake-journal-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { listWritingSubmissionHistory } from '@/lib/ielts/writing-submissions-repository'

export default async function MistakeJournalPage() {
  await requireLearnerAppSession()
  const { entries } = await listWritingSubmissionHistory()

  return <MistakeJournalWorkspace initialEntries={entries} />
}
