'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

const demoModeMessage =
  'Supabase auth is not configured yet. The app is running in demo mode.'

export async function login(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: demoModeMessage }
  }

  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: demoModeMessage }
  }

  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      }/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Please check your email to confirm your account.' }
}

export async function signout() {
  if (!isSupabaseConfigured()) {
    redirect('/')
  }

  const supabase = await createClient()
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/auth')
}
