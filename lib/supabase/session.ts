import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured } from './config'
import { createClient } from './server'

export async function getAuthenticatedUser() {
  if (!isSupabaseConfigured()) {
    return null
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    return user
  } catch {
    return null
  }
}

export async function ensureProfileForUser(user: User) {
  const supabase = await createClient()

  await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email ?? null,
  })
}
