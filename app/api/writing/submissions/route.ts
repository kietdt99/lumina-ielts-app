import { createWritingSubmission } from '@/lib/ielts/writing-submissions'

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

  return Response.json(result, { status: 201 })
}
