import { randomUUID } from 'node:crypto'
import {
  defaultLearnerGoals,
  type LearnerGoals,
} from '@/lib/learner/learner-goals'
import {
  generateTemporaryPassword,
  hashPassword,
  validatePassword,
  verifyPassword,
} from './password-policy'
import type {
  AppRole,
  CreateLearnerAccountInput,
  ManagedLearnerAccount,
} from './types'

type DemoAccount = {
  id: string
  email: string
  fullName: string
  role: AppRole
  passwordDigest: string
  mustChangePassword: boolean
  onboardingCompleted: boolean
  passwordChangedAt: string | null
  createdAt: string
  temporaryPasswordIssuedAt: string | null
  createdByAdminId: string | null
  goals: LearnerGoals
}

type DemoStore = {
  accounts: Map<string, DemoAccount>
}

const defaultAdminEmail = 'admin@lumina.local'
const defaultAdminPassword = 'LuminaAdmin!2026'
const defaultLearnerEmail = 'learner@lumina.local'
const defaultLearnerPassword = 'LuminaLearner!2026'
export const defaultDemoAdminId = 'demo-admin'
export const defaultDemoLearnerId = 'demo-learner'

declare global {
  var __luminaDemoAuthStore: DemoStore | undefined
}

function cloneGoals(goals: LearnerGoals): LearnerGoals {
  return {
    targetBand: goals.targetBand,
    currentLevel: goals.currentLevel,
    focusSkill: goals.focusSkill,
    studyFrequency: goals.studyFrequency,
  }
}

function createAccount(args: {
  id?: string
  email: string
  fullName: string
  password: string
  role: AppRole
  mustChangePassword: boolean
  onboardingCompleted: boolean
  createdByAdminId: string | null
}) {
  const createdAt = new Date().toISOString()

  return {
    id: args.id ?? randomUUID(),
    email: args.email.trim().toLowerCase(),
    fullName: args.fullName.trim(),
    role: args.role,
    passwordDigest: hashPassword(args.password),
    mustChangePassword: args.mustChangePassword,
    onboardingCompleted: args.onboardingCompleted,
    passwordChangedAt: args.mustChangePassword ? null : createdAt,
    createdAt,
    temporaryPasswordIssuedAt: args.mustChangePassword ? createdAt : null,
    createdByAdminId: args.createdByAdminId,
    goals: cloneGoals(defaultLearnerGoals),
  } satisfies DemoAccount
}

function getDemoStore() {
  if (!globalThis.__luminaDemoAuthStore) {
    const adminAccount = createAccount({
      id: defaultDemoAdminId,
      email: defaultAdminEmail,
      fullName: 'Lumina Admin',
      password: defaultAdminPassword,
      role: 'admin',
      mustChangePassword: false,
      onboardingCompleted: true,
      createdByAdminId: null,
    })
    const learnerAccount = createAccount({
      id: defaultDemoLearnerId,
      email: defaultLearnerEmail,
      fullName: 'Demo Learner',
      password: defaultLearnerPassword,
      role: 'learner',
      mustChangePassword: false,
      onboardingCompleted: true,
      createdByAdminId: adminAccount.id,
    })

    globalThis.__luminaDemoAuthStore = {
      accounts: new Map([
        [adminAccount.id, adminAccount],
        [learnerAccount.id, learnerAccount],
      ]),
    }
  }

  return globalThis.__luminaDemoAuthStore
}

function findAccountByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase()

  return [...getDemoStore().accounts.values()].find(
    (account) => account.email === normalizedEmail
  )
}

export function getDemoCredentials() {
  return {
    admin: {
      email: defaultAdminEmail,
      password: defaultAdminPassword,
    },
    learner: {
      email: defaultLearnerEmail,
      password: defaultLearnerPassword,
    },
  }
}

export function getDemoAccountById(accountId: string) {
  return getDemoStore().accounts.get(accountId) ?? null
}

export function authenticateDemoAccount(email: string, password: string) {
  const account = findAccountByEmail(email)

  if (!account || !verifyPassword(password, account.passwordDigest)) {
    return null
  }

  return account
}

export function listDemoLearnerAccounts(): ManagedLearnerAccount[] {
  return [...getDemoStore().accounts.values()]
    .filter((account) => account.role === 'learner')
    .sort((left, right) => left.email.localeCompare(right.email))
    .map((account) => ({
      id: account.id,
      email: account.email,
      fullName: account.fullName,
      role: 'learner',
      mustChangePassword: account.mustChangePassword,
      onboardingCompleted: account.onboardingCompleted,
      passwordChangedAt: account.passwordChangedAt,
      createdAt: account.createdAt,
      temporaryPasswordIssuedAt: account.temporaryPasswordIssuedAt,
    }))
}

export function createDemoLearnerAccount(
  input: CreateLearnerAccountInput,
  createdByAdminId: string
) {
  if (findAccountByEmail(input.email)) {
    return {
      ok: false as const,
      error: 'A learner account with this email already exists.',
    }
  }

  const temporaryPassword = generateTemporaryPassword()
  const account = createAccount({
    email: input.email,
    fullName: input.fullName,
    password: temporaryPassword,
    role: 'learner',
    mustChangePassword: true,
    onboardingCompleted: false,
    createdByAdminId,
  })

  getDemoStore().accounts.set(account.id, account)

  return {
    ok: true as const,
    account: {
      id: account.id,
      email: account.email,
      fullName: account.fullName,
      role: 'learner' as const,
      mustChangePassword: account.mustChangePassword,
      onboardingCompleted: account.onboardingCompleted,
      passwordChangedAt: account.passwordChangedAt,
      createdAt: account.createdAt,
      temporaryPasswordIssuedAt: account.temporaryPasswordIssuedAt,
    },
    temporaryPassword,
  }
}

export function resetDemoLearnerPassword(accountId: string) {
  const account = getDemoAccountById(accountId)

  if (!account || account.role !== 'learner') {
    return {
      ok: false as const,
      error: 'Learner account not found.',
    }
  }

  const temporaryPassword = generateTemporaryPassword()
  const nextAccount = {
    ...account,
    passwordDigest: hashPassword(temporaryPassword),
    mustChangePassword: true,
    temporaryPasswordIssuedAt: new Date().toISOString(),
  }

  getDemoStore().accounts.set(accountId, nextAccount)

  return {
    ok: true as const,
    temporaryPassword,
  }
}

export function updateDemoAccountPassword(args: {
  accountId: string
  currentPassword?: string
  nextPassword: string
  skipCurrentPasswordCheck?: boolean
}) {
  const validation = validatePassword(args.nextPassword)

  if (!validation.ok) {
    return validation
  }

  const account = getDemoAccountById(args.accountId)

  if (!account) {
    return {
      ok: false as const,
      error: 'Account not found.',
    }
  }

  if (
    !args.skipCurrentPasswordCheck &&
    (!args.currentPassword ||
      !verifyPassword(args.currentPassword, account.passwordDigest))
  ) {
    return {
      ok: false as const,
      error: 'Current password is incorrect.',
    }
  }

  const nextAccount = {
    ...account,
    passwordDigest: hashPassword(args.nextPassword),
    mustChangePassword: false,
    passwordChangedAt: new Date().toISOString(),
    temporaryPasswordIssuedAt: null,
  }

  getDemoStore().accounts.set(account.id, nextAccount)

  return {
    ok: true as const,
    account: nextAccount,
  }
}

export function getDemoLearnerGoals(accountId: string) {
  const account = getDemoAccountById(accountId)

  return account?.role === 'learner' ? cloneGoals(account.goals) : null
}

export function saveDemoLearnerGoals(accountId: string, goals: LearnerGoals) {
  const account = getDemoAccountById(accountId)

  if (!account || account.role !== 'learner') {
    return {
      ok: false as const,
      error: 'Learner account not found.',
    }
  }

  const nextAccount = {
    ...account,
    goals: cloneGoals(goals),
  }

  getDemoStore().accounts.set(account.id, nextAccount)

  return {
    ok: true as const,
    goals: cloneGoals(nextAccount.goals),
  }
}

export function markDemoOnboardingComplete(accountId: string) {
  const account = getDemoAccountById(accountId)

  if (!account || account.role !== 'learner') {
    return {
      ok: false as const,
      error: 'Learner account not found.',
    }
  }

  const nextAccount = {
    ...account,
    onboardingCompleted: true,
  }

  getDemoStore().accounts.set(account.id, nextAccount)

  return {
    ok: true as const,
    account: nextAccount,
  }
}

export function resetDemoAuthStore() {
  delete globalThis.__luminaDemoAuthStore
}
