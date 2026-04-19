import {
  defaultLearnerGoals,
  type LearnerGoals,
  validateLearnerGoals,
} from './learner-goals'
import { getLearnerGoalsFromCookies, saveLearnerGoalsToCookies } from './learner-goals-cookie'
import { getDemoLearnerGoals, saveDemoLearnerGoals } from '@/lib/auth/demo-store'
import { readAppSessionCookie } from '@/lib/auth/session-cookies'
import { createClient } from '@/lib/supabase/server'
import { ensureProfileForUser, getAuthenticatedUser } from '@/lib/supabase/session'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export async function getLearnerGoals() {
  if (!isSupabaseConfigured()) {
    const sessionCookie = await readAppSessionCookie()

    if (sessionCookie?.userId) {
      return {
        goals: getDemoLearnerGoals(sessionCookie.userId) ?? defaultLearnerGoals,
        storageMode: 'demo' as const,
      }
    }
  }

  const user = await getAuthenticatedUser()

  if (!user) {
    return {
      goals: await getLearnerGoalsFromCookies(),
      storageMode: 'cookie' as const,
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_goals')
    .select('target_band,current_level,focus_skill,study_frequency')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !data) {
    return {
      goals: defaultLearnerGoals,
      storageMode: 'supabase' as const,
    }
  }

  const normalizedGoals = {
    targetBand: Number(data.target_band),
    currentLevel: data.current_level,
    focusSkill: data.focus_skill,
    studyFrequency: data.study_frequency,
  }
  const validation = validateLearnerGoals(normalizedGoals)

  return {
    goals: validation.ok ? validation.goals : defaultLearnerGoals,
    storageMode: 'supabase' as const,
  }
}

export async function saveLearnerGoals(goals: LearnerGoals) {
  if (!isSupabaseConfigured()) {
    const sessionCookie = await readAppSessionCookie()

    if (sessionCookie?.userId) {
      const result = saveDemoLearnerGoals(sessionCookie.userId, goals)

      if (result.ok) {
        return {
          goals: result.goals,
          storageMode: 'demo' as const,
        }
      }
    }
  }

  const user = await getAuthenticatedUser()

  if (!user) {
    await saveLearnerGoalsToCookies(goals)

    return {
      goals,
      storageMode: 'cookie' as const,
    }
  }

  await ensureProfileForUser(user)

  const supabase = await createClient()
  await supabase.from('user_goals').upsert({
    user_id: user.id,
    target_band: goals.targetBand,
    current_level: goals.currentLevel,
    focus_skill: goals.focusSkill,
    study_frequency: goals.studyFrequency,
  })

  return {
    goals,
    storageMode: 'supabase' as const,
  }
}
