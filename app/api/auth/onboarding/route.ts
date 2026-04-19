import { NextResponse } from 'next/server'
import { completeLearnerOnboarding } from '@/lib/auth/service'
import { validateLearnerGoals } from '@/lib/learner/learner-goals'

export async function PUT(request: Request) {
  const payload = await request.json()
  const validation = validateLearnerGoals(payload)

  if (!validation.ok) {
    return NextResponse.json(validation, { status: 400 })
  }

  const result = await completeLearnerOnboarding(validation.goals)

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json({
    ok: true,
    goals: validation.goals,
  })
}
