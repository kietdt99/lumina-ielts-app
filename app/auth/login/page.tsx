import { LoginForm } from '../_components/login-form'
import {
  getDemoCredentials,
  redirectAuthenticatedUserFromAuth,
} from '@/lib/auth/service'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export default async function LoginPage() {
  await redirectAuthenticatedUserFromAuth()

  return (
    <LoginForm
      demoCredentials={isSupabaseConfigured() ? undefined : getDemoCredentials()}
    />
  )
}
