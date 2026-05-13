import { requireLearnerAppSession } from '@/lib/auth/service'
import { createMistakeJournal } from '@/lib/ielts/mistake-journal'
import { listWritingSubmissionHistory } from '@/lib/ielts/writing-submissions-repository'

export async function GET() {
  await requireLearnerAppSession()
  const { entries, storageMode } = await listWritingSubmissionHistory()

  return Response.json({
    ok: true,
    journal: createMistakeJournal(entries),
    storageMode,
  })
}
