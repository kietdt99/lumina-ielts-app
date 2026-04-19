import { NextResponse } from 'next/server'
import { resetManagedLearnerPassword } from '@/lib/auth/service'

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<{
    accountId: string
  }>

  if (!payload.accountId) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Learner account id is required.',
      },
      { status: 400 }
    )
  }

  const result = await resetManagedLearnerPassword(payload.accountId)

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result)
}
