import {
  getAppSession,
  updateLearnerProfile,
} from '@/lib/auth/service'
import { validateLearnerProfile } from '@/lib/profile/learner-profile'

export async function GET() {
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

  return Response.json({
    ok: true,
    profile: {
      avatarUrl: session.avatarUrl,
      displayName: session.fullName,
    },
  })
}

export async function PUT(request: Request) {
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

  const validation = validateLearnerProfile(payload)

  if (!validation.ok) {
    return Response.json(validation, { status: 400 })
  }

  const result = await updateLearnerProfile(validation.profile)

  if (!result.ok) {
    return Response.json(result, { status: 400 })
  }

  return Response.json(result)
}
