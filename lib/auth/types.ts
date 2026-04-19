export type AppRole = 'admin' | 'learner'

export type AppSessionMode = 'demo' | 'supabase'

export type AppSession = {
  userId: string
  email: string
  fullName: string
  role: AppRole
  mustChangePassword: boolean
  onboardingCompleted: boolean
  passwordResetDeferred: boolean
  mode: AppSessionMode
}

export type ManagedLearnerAccount = {
  id: string
  email: string
  fullName: string
  role: 'learner'
  mustChangePassword: boolean
  onboardingCompleted: boolean
  passwordChangedAt: string | null
  createdAt: string
  temporaryPasswordIssuedAt: string | null
}

export type CreateLearnerAccountInput = {
  email: string
  fullName: string
}
