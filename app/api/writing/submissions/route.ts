import { listWritingSubmissionHistory, saveWritingSubmissionRecord } from '@/lib/ielts/writing-submissions-repository'
import { createWritingSubmission, type WritingSubmissionInput } from '@/lib/ielts/writing-submissions'

export async function GET() {
  const result = await listWritingSubmissionHistory()

  return Response.json({
    ok: true,
    entries: result.entries,
    storageMode: result.storageMode,
  })
}

export async function POST(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return Response.json(
      {
        ok: false,
        error: 'Request body must be valid JSON.',
      },
      { status: 400 }
    )
  }

  const result = createWritingSubmission(payload)

  if (!result.ok) {
    const status =
      result.error === 'The selected writing prompt could not be found.'
        ? 404
        : 400

    return Response.json(result, { status })
  }

  const persistence = await saveWritingSubmissionRecord(
    payload as WritingSubmissionInput,
    result
  )

  return Response.json(
    {
      ...result,
      storageMode: persistence.storageMode,
    },
    { status: 201 }
  )
}
