import { redirect } from 'next/navigation'
import { ChangePasswordForm } from '../_components/change-password-form'
import { requireLearnerSession, resolvePostLoginPath } from '@/lib/auth/service'

export default async function ChangePasswordPage() {
  const session = await requireLearnerSession()

  if (!session.mustChangePassword) {
    redirect(resolvePostLoginPath(session))
  }

  return (
    <ChangePasswordForm allowSkip={!session.passwordResetDeferred} requireCurrentPassword={false} />
  )
}
