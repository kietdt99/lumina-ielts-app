import { getAppSession } from '@/lib/auth/service'
import {
  createWritingReadiness,
  type WritingReadinessInput,
} from '@/lib/ielts/writing-readiness'

export async function POST(request: Request) {
  const session = await getAppSession()

  if (!session || session.role !== 'learner') {
    return Response.json(
      {
        ok: false,
        error: 'Learner authentication is required.',
      },
      { status: 401 }
    )
  }

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

  const result = createWritingReadiness(payload as WritingReadinessInput)

  if (!result.ok) {
    const status =
      result.error === 'The selected writing prompt could not be found.'
        ? 404
        : 400

    return Response.json(result, { status })
  }

  return Response.json(result)
}
