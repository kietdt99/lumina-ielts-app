import { NextResponse } from 'next/server'
import { loginUser, resolvePostLoginPath } from '@/lib/auth/service'

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<{
    email: string
    password: string
  }>

  if (!payload.email || !payload.password) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Email and password are required.',
      },
      { status: 400 }
    )
  }

  const result = await loginUser({
    email: payload.email,
    password: payload.password,
  })

  if (!result.ok) {
    return NextResponse.json(result, { status: 401 })
  }

  return NextResponse.json({
    ok: true,
    redirectTo: resolvePostLoginPath(result.session),
  })
}
