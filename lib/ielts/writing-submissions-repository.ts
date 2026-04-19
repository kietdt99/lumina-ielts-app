import type { WritingHistoryEntry } from './writing-history'
import type {
  WritingSubmissionInput,
  WritingSubmissionSuccess,
} from './writing-submissions'
import { createClient } from '@/lib/supabase/server'
import { ensureProfileForUser, getAuthenticatedUser } from '@/lib/supabase/session'

type WritingSubmissionRecord = {
  storageMode: 'browser' | 'supabase'
  historyEntry: WritingHistoryEntry
}

type SupabaseHistoryRow = {
  id: string
  draft: string
  word_count: number
  submitted_at: string
  prompt_id: string
  prompt:
    | {
        title: string
        task_type: WritingHistoryEntry['taskType']
      }
    | Array<{
        title: string
        task_type: WritingHistoryEntry['taskType']
      }>
    | null
  feedback:
    | {
        estimated_band: number
        rubric: WritingHistoryEntry['rubric']
        strengths: string[]
        priorities: string[]
      }
    | Array<{
        estimated_band: number
        rubric: WritingHistoryEntry['rubric']
        strengths: string[]
        priorities: string[]
      }>
    | null
}

export async function saveWritingSubmissionRecord(
  input: WritingSubmissionInput,
  result: WritingSubmissionSuccess
): Promise<WritingSubmissionRecord> {
  const user = await getAuthenticatedUser()

  if (!user) {
    return {
      storageMode: 'browser',
      historyEntry: result.historyEntry,
    }
  }

  await ensureProfileForUser(user)

  const supabase = await createClient()
  const startedAt = new Date().toISOString()

  const { data: session } = await supabase
    .from('practice_sessions')
    .insert({
      user_id: user.id,
      skill_type: 'Writing',
      status: 'reviewed',
      started_at: startedAt,
      completed_at: startedAt,
      metadata: {
        promptId: input.promptId,
      },
    })
    .select('id')
    .single()

  const { data: submission } = await supabase
    .from('writing_submissions')
    .insert({
      session_id: session?.id ?? null,
      user_id: user.id,
      prompt_id: result.historyEntry.promptId,
      draft: input.draft.trim(),
      word_count: result.feedback.wordCount,
      source: 'web',
    })
    .select('id')
    .single()

  if (submission?.id) {
    await supabase.from('writing_feedback').insert({
      submission_id: submission.id,
      estimated_band: result.feedback.estimatedBand,
      rubric: result.feedback.rubric,
      strengths: result.feedback.strengths,
      priorities: result.feedback.priorities,
      coaching_note: result.feedback.coachingNote,
      sample_rewrite: null,
      provider: 'heuristic',
    })

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      event_name: 'writing_submission_reviewed',
      payload: {
        submissionId: submission.id,
        promptId: result.historyEntry.promptId,
      },
    })
  }

  return {
    storageMode: 'supabase',
    historyEntry: result.historyEntry,
  }
}

function unwrapSingleRelation<T>(value: T | T[] | null) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value
}

function toHistoryEntry(row: SupabaseHistoryRow): WritingHistoryEntry | null {
  const prompt = unwrapSingleRelation(row.prompt)
  const feedback = unwrapSingleRelation(row.feedback)

  if (!prompt || !feedback) {
    return null
  }

  return {
    id: row.id,
    promptId: row.prompt_id,
    promptTitle: prompt.title,
    taskType: prompt.task_type,
    createdAt: row.submitted_at,
    draftExcerpt: row.draft.trim().slice(0, 220),
    wordCount: row.word_count,
    estimatedBand: Number(feedback.estimated_band),
    rubric: feedback.rubric,
    strengths: feedback.strengths,
    priorities: feedback.priorities,
  }
}

export async function listWritingSubmissionHistory() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return {
      entries: [] as WritingHistoryEntry[],
      storageMode: 'browser' as const,
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('writing_submissions')
    .select(
      `
        id,
        draft,
        word_count,
        submitted_at,
        prompt_id,
        prompt:writing_prompts(title, task_type),
        feedback:writing_feedback(estimated_band, rubric, strengths, priorities)
      `
    )
    .eq('user_id', user.id)
    .order('submitted_at', { ascending: false })

  if (error || !data) {
    return {
      entries: [] as WritingHistoryEntry[],
      storageMode: 'supabase' as const,
    }
  }

  return {
    entries: ((data as unknown) as SupabaseHistoryRow[])
      .map(toHistoryEntry)
      .filter((entry): entry is WritingHistoryEntry => entry !== null),
    storageMode: 'supabase' as const,
  }
}
