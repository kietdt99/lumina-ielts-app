'use server'

import { redirect } from 'next/navigation'
import { logoutUser } from '@/lib/auth/service'

export async function signout() {
  await logoutUser()
  redirect('/auth/login')
}
