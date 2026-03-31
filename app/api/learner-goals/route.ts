import { getLearnerGoalsFromCookies, saveLearnerGoalsToCookies } from '@/lib/learner/learner-goals-cookie'
import { validateLearnerGoals } from '@/lib/learner/learner-goals'

export async function GET() {
  const goals = await getLearnerGoalsFromCookies()

  return Response.json({
    ok: true,
    goals,
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

  await saveLearnerGoalsToCookies(validation.goals)

  return Response.json({
    ok: true,
    goals: validation.goals,
  })
}
