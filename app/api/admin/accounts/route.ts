import { NextResponse } from 'next/server'
import {
  createManagedLearnerAccount,
  listManagedLearnerAccounts,
} from '@/lib/auth/service'

export async function GET() {
  const result = await listManagedLearnerAccounts()

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<{
    email: string
    fullName: string
  }>

  if (!payload.email || !payload.fullName) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Full name and email are required.',
      },
      { status: 400 }
    )
  }

  const result = await createManagedLearnerAccount({
    email: payload.email,
    fullName: payload.fullName,
  })

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result)
}
