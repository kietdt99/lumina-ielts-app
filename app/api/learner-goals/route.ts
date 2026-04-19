import { getLearnerGoals, saveLearnerGoals } from '@/lib/learner/learner-goals-repository'
import { validateLearnerGoals } from '@/lib/learner/learner-goals'

export async function GET() {
  const result = await getLearnerGoals()

  return Response.json({
    ok: true,
    goals: result.goals,
    storageMode: result.storageMode,
  })
}

export async function PUT(request: Request) {
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

  const validation = validateLearnerGoals(payload)

  if (!validation.ok) {
    return Response.json(validation, { status: 400 })
  }

  const result = await saveLearnerGoals(validation.goals)

  return Response.json({
    ok: true,
    goals: result.goals,
    storageMode: result.storageMode,
  })
}
