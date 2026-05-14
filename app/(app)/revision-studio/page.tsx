import { RevisionStudioWorkspace } from './_components/revision-studio-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { listWritingSubmissionHistory } from '@/lib/ielts/writing-submissions-repository'

export default async function RevisionStudioPage() {
  await requireLearnerAppSession()
  const { entries } = await listWritingSubmissionHistory()

  return <RevisionStudioWorkspace initialEntries={entries} />
}
