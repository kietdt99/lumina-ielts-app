import { NextResponse } from 'next/server'
import { skipForcedPasswordChange } from '@/lib/auth/service'

export async function POST() {
  const result = await skipForcedPasswordChange()
  return NextResponse.json(result)
}
