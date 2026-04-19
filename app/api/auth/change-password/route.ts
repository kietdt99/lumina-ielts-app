import { NextResponse } from 'next/server'
import { changePassword } from '@/lib/auth/service'

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<{
    currentPassword: string
    nextPassword: string
    requireCurrentPassword: boolean
  }>

  if (!payload.nextPassword) {
    return NextResponse.json(
      {
        ok: false,
        error: 'A new password is required.',
      },
      { status: 400 }
    )
  }

  const result = await changePassword({
    currentPassword: payload.currentPassword,
    nextPassword: payload.nextPassword,
    skipCurrentPasswordCheck: !payload.requireCurrentPassword,
  })

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result)
}
