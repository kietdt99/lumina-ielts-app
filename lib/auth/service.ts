import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import {
  authenticateDemoAccount,
  createDemoLearnerAccount,
  getDemoAccountById,
  getDemoCredentials,
  getDemoLearnerGoals,
  listDemoLearnerAccounts,
  markDemoOnboardingComplete,
  resetDemoLearnerPassword,
  saveDemoLearnerGoals,
  updateDemoAccountPassword,
} from './demo-store'
import {
  clearAppSessionCookies,
  readAppSessionCookie,
  writeAppSessionCookies,
} from './session-cookies'
import {
  generateTemporaryPassword,
  validatePassword,
} from './password-policy'
import type {
  AppSession,
  CreateLearnerAccountInput,
  ManagedLearnerAccount,
} from './types'
import {
  defaultLearnerGoals,
  type LearnerGoals,
} from '@/lib/learner/learner-goals'
import { saveLearnerGoals } from '@/lib/learner/learner-goals-repository'
import {
  getSupabaseConfig,
  getSupabaseServiceRoleConfig,
  isSupabaseConfigured,
} from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

type SupabaseProfileRow = {
  id: string
  email: string | null
  full_name: string | null
  role: 'admin' | 'learner' | null
}

type SupabaseSecurityRow = {
  must_change_password: boolean | null
  password_changed_at: string | null
}

type SupabaseGoalsRow = {
  completed_onboarding: boolean | null
}

function createDirectSupabaseClient() {
  const config = getSupabaseConfig()

  if (!config) {
    throw new Error('Supabase auth is not configured.')
  }

  return createSupabaseClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function createServiceRoleClient() {
  const config = getSupabaseServiceRoleConfig()

  if (!config) {
    throw new Error(
      'Supabase service role credentials are not configured for admin account management.'
    )
  }

  return createSupabaseClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function normalizeManagedLearnerAccount(row: {
  id: string
  email: string | null
  full_name: string | null
  created_at: string
  user_security_settings:
    | SupabaseSecurityRow
    | SupabaseSecurityRow[]
    | null
  user_goals: SupabaseGoalsRow | SupabaseGoalsRow[] | null
}) {
  const security = Array.isArray(row.user_security_settings)
    ? row.user_security_settings[0] ?? null
    : row.user_security_settings
  const goals = Array.isArray(row.user_goals)
    ? row.user_goals[0] ?? null
    : row.user_goals

  return {
    id: row.id,
    email: row.email ?? 'unknown@example.com',
    fullName: row.full_name ?? 'Learner',
    role: 'learner' as const,
    mustChangePassword: security?.must_change_password ?? true,
    onboardingCompleted: goals?.completed_onboarding ?? false,
    passwordChangedAt: security?.password_changed_at ?? null,
    createdAt: row.created_at,
    temporaryPasswordIssuedAt: null,
  } satisfies ManagedLearnerAccount
}

async function buildSupabaseSession() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const sessionCookie = await readAppSessionCookie()

  const [{ data: profile }, { data: security }, { data: goals }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .maybeSingle<SupabaseProfileRow>(),
    supabase
      .from('user_security_settings')
      .select('must_change_password, password_changed_at')
      .eq('user_id', user.id)
      .maybeSingle<SupabaseSecurityRow>(),
    supabase
      .from('user_goals')
      .select('completed_onboarding')
      .eq('user_id', user.id)
      .maybeSingle<SupabaseGoalsRow>(),
  ])

  return {
    userId: user.id,
    email: profile?.email ?? user.email ?? '',
    fullName: profile?.full_name ?? user.user_metadata.full_name ?? 'Lumina user',
    role: profile?.role ?? 'learner',
    mustChangePassword: security?.must_change_password ?? false,
    onboardingCompleted: goals?.completed_onboarding ?? false,
    passwordResetDeferred:
      sessionCookie?.userId === user.id
        ? sessionCookie.passwordResetDeferred
        : false,
    mode: 'supabase',
  } satisfies AppSession
}

async function writeSessionFromResolvedSession(session: AppSession) {
  await writeAppSessionCookies({
    userId: session.userId,
    passwordResetDeferred: session.passwordResetDeferred,
  })
}

export async function getAppSession() {
  if (isSupabaseConfigured()) {
    return buildSupabaseSession()
  }

  const sessionCookie = await readAppSessionCookie()

  if (!sessionCookie?.userId) {
    return null
  }

  const account = getDemoAccountById(sessionCookie.userId)

  if (!account) {
    await clearAppSessionCookies()
    return null
  }

  return {
    userId: account.id,
    email: account.email,
    fullName: account.fullName,
    role: account.role,
    mustChangePassword: account.mustChangePassword,
    onboardingCompleted: account.onboardingCompleted,
    passwordResetDeferred: sessionCookie.passwordResetDeferred,
    mode: 'demo',
  } satisfies AppSession
}

export function resolvePostLoginPath(session: AppSession) {
  if (session.role === 'admin') {
    return '/admin/accounts'
  }

  if (session.mustChangePassword && !session.passwordResetDeferred) {
    return '/auth/change-password'
  }

  if (!session.onboardingCompleted) {
    return '/onboarding'
  }

  return '/'
}

export async function requireAppSession() {
  const session = await getAppSession()

  if (!session) {
    redirect('/auth/login')
  }

  return session
}

export async function requireLearnerSession() {
  const session = await requireAppSession()

  if (session.role !== 'learner') {
    redirect('/admin/accounts')
  }

  return session
}

export async function requireLearnerAppSession() {
  const session = await requireLearnerSession()

  if (!session.onboardingCompleted) {
    redirect('/onboarding')
  }

  return session
}

export async function requireAdminSession() {
  const session = await requireAppSession()

  if (session.role !== 'admin') {
    redirect('/')
  }

  return session
}

export async function redirectAuthenticatedUserFromAuth() {
  const session = await getAppSession()

  if (session) {
    redirect(resolvePostLoginPath(session))
  }
}

export async function loginUser(args: {
  email: string
  password: string
}) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: args.email,
      password: args.password,
    })

    if (error) {
      return {
        ok: false as const,
        error: error.message,
      }
    }

    const session = await buildSupabaseSession()

    if (!session) {
      return {
        ok: false as const,
        error: 'Unable to load your account session.',
      }
    }

    await writeSessionFromResolvedSession({
      ...session,
      passwordResetDeferred: false,
    })

    return {
      ok: true as const,
      session: {
        ...session,
        passwordResetDeferred: false,
      },
    }
  }

  const account = authenticateDemoAccount(args.email, args.password)

  if (!account) {
    return {
      ok: false as const,
      error: 'Email or password is incorrect.',
    }
  }

  const session = {
    userId: account.id,
    email: account.email,
    fullName: account.fullName,
    role: account.role,
    mustChangePassword: account.mustChangePassword,
    onboardingCompleted: account.onboardingCompleted,
    passwordResetDeferred: false,
    mode: 'demo',
  } satisfies AppSession

  await writeSessionFromResolvedSession(session)

  return {
    ok: true as const,
    session,
  }
}

export async function logoutUser() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  await clearAppSessionCookies()
}

export async function skipForcedPasswordChange() {
  const session = await requireLearnerSession()

  await writeAppSessionCookies({
    userId: session.userId,
    passwordResetDeferred: true,
  })

  return {
    ok: true as const,
    redirectTo: session.onboardingCompleted ? '/' : '/onboarding',
  }
}

export async function changePassword(args: {
  currentPassword?: string
  nextPassword: string
  skipCurrentPasswordCheck?: boolean
}) {
  const validation = validatePassword(args.nextPassword)

  if (!validation.ok) {
    return validation
  }

  const session = await requireAppSession()

  if (session.mode === 'demo') {
    const result = updateDemoAccountPassword({
      accountId: session.userId,
      currentPassword: args.currentPassword,
      nextPassword: args.nextPassword,
      skipCurrentPasswordCheck: args.skipCurrentPasswordCheck,
    })

    if (!result.ok) {
      return result
    }

    await writeAppSessionCookies({
      userId: session.userId,
      passwordResetDeferred: false,
    })

    return {
      ok: true as const,
      redirectTo:
        session.role === 'admin'
          ? '/admin/accounts'
          : session.onboardingCompleted
            ? '/'
            : '/onboarding',
    }
  }

  if (!args.skipCurrentPasswordCheck) {
    const verifier = createDirectSupabaseClient()
    const verification = await verifier.auth.signInWithPassword({
      email: session.email,
      password: args.currentPassword ?? '',
    })

    if (verification.error) {
      return {
        ok: false as const,
        error: 'Current password is incorrect.',
      }
    }

    await verifier.auth.signOut()
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: args.nextPassword,
  })

  if (error) {
    return {
      ok: false as const,
      error: error.message,
    }
  }

  await supabase.from('user_security_settings').upsert({
    user_id: session.userId,
    must_change_password: false,
    password_changed_at: new Date().toISOString(),
  })

  await writeAppSessionCookies({
    userId: session.userId,
    passwordResetDeferred: false,
  })

  return {
    ok: true as const,
    redirectTo:
      session.role === 'admin'
        ? '/admin/accounts'
        : session.onboardingCompleted
          ? '/'
          : '/onboarding',
  }
}

export async function completeLearnerOnboarding(goals: LearnerGoals) {
  const session = await requireLearnerSession()

  if (session.mode === 'demo') {
    const saveResult = saveDemoLearnerGoals(session.userId, goals)

    if (!saveResult.ok) {
      return saveResult
    }

    const onboardingResult = markDemoOnboardingComplete(session.userId)

    if (!onboardingResult.ok) {
      return onboardingResult
    }
  } else {
    await saveLearnerGoals(goals)

    const supabase = await createClient()
    const { error } = await supabase.from('user_goals').upsert({
      user_id: session.userId,
      target_band: goals.targetBand,
      current_level: goals.currentLevel,
      focus_skill: goals.focusSkill,
      study_frequency: goals.studyFrequency,
      completed_onboarding: true,
    })

    if (error) {
      return {
        ok: false as const,
        error: error.message,
      }
    }
  }

  await writeAppSessionCookies({
    userId: session.userId,
    passwordResetDeferred: session.passwordResetDeferred,
  })

  return {
    ok: true as const,
  }
}

export async function getCurrentLearnerGoals() {
  const session = await requireLearnerSession()

  if (session.mode === 'demo') {
    return getDemoLearnerGoals(session.userId) ?? defaultLearnerGoals
  }

  return null
}

export async function listManagedLearnerAccounts() {
  const session = await requireAdminSession()

  if (session.mode === 'demo') {
    return {
      ok: true as const,
      accounts: listDemoLearnerAccounts(),
    }
  }

  const serviceClient = createServiceRoleClient()
  const { data, error } = await serviceClient
    .from('profiles')
    .select(
      'id, email, full_name, created_at, user_security_settings(must_change_password, password_changed_at), user_goals(completed_onboarding)'
    )
    .eq('role', 'learner')

  if (error) {
    return {
      ok: false as const,
      error: error.message,
    }
  }

  return {
    ok: true as const,
    accounts: (data ?? []).map((row) =>
      normalizeManagedLearnerAccount(
        row as {
          id: string
          email: string | null
          full_name: string | null
          created_at: string
          user_security_settings:
            | SupabaseSecurityRow
            | SupabaseSecurityRow[]
            | null
          user_goals: SupabaseGoalsRow | SupabaseGoalsRow[] | null
        }
      )
    ),
  }
}

export async function createManagedLearnerAccount(input: CreateLearnerAccountInput) {
  const session = await requireAdminSession()

  if (session.mode === 'demo') {
    return createDemoLearnerAccount(input, session.userId)
  }

  const serviceClient = createServiceRoleClient()
  const temporaryPassword = generateTemporaryPassword()
  const { data: createdUser, error: authError } =
    await serviceClient.auth.admin.createUser({
      email: input.email.trim().toLowerCase(),
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName.trim(),
      },
    })

  if (authError || !createdUser.user) {
    return {
      ok: false as const,
      error: authError?.message ?? 'Unable to create the learner account.',
    }
  }

  const userId = createdUser.user.id
  const now = new Date().toISOString()

  const [profileInsert, securityInsert, goalsInsert] = await Promise.all([
    serviceClient.from('profiles').upsert({
      id: userId,
      email: input.email.trim().toLowerCase(),
      full_name: input.fullName.trim(),
      role: 'learner',
    }),
    serviceClient.from('user_security_settings').upsert({
      user_id: userId,
      must_change_password: true,
      temporary_password_issued_at: now,
      created_by_admin_id: session.userId,
    }),
    serviceClient.from('user_goals').upsert({
      user_id: userId,
      target_band: defaultLearnerGoals.targetBand,
      current_level: defaultLearnerGoals.currentLevel,
      focus_skill: defaultLearnerGoals.focusSkill,
      study_frequency: defaultLearnerGoals.studyFrequency,
      completed_onboarding: false,
    }),
  ])

  const insertError =
    profileInsert.error ?? securityInsert.error ?? goalsInsert.error ?? null

  if (insertError) {
    await serviceClient.auth.admin.deleteUser(userId)

    return {
      ok: false as const,
      error: insertError.message,
    }
  }

  return {
    ok: true as const,
    account: {
      id: userId,
      email: input.email.trim().toLowerCase(),
      fullName: input.fullName.trim(),
      role: 'learner' as const,
      mustChangePassword: true,
      onboardingCompleted: false,
      passwordChangedAt: null,
      createdAt: now,
      temporaryPasswordIssuedAt: now,
    },
    temporaryPassword,
  }
}

export async function resetManagedLearnerPassword(accountId: string) {
  const session = await requireAdminSession()

  if (session.mode === 'demo') {
    return resetDemoLearnerPassword(accountId)
  }

  const serviceClient = createServiceRoleClient()
  const temporaryPassword = generateTemporaryPassword()
  const now = new Date().toISOString()
  const { error: updateError } = await serviceClient.auth.admin.updateUserById(
    accountId,
    {
      password: temporaryPassword,
    }
  )

  if (updateError) {
    return {
      ok: false as const,
      error: updateError.message,
    }
  }

  const { error: securityError } = await serviceClient
    .from('user_security_settings')
    .upsert({
      user_id: accountId,
      must_change_password: true,
      temporary_password_issued_at: now,
      created_by_admin_id: session.userId,
    })

  if (securityError) {
    return {
      ok: false as const,
      error: securityError.message,
    }
  }

  return {
    ok: true as const,
    temporaryPassword,
  }
}

export { getDemoCredentials }
