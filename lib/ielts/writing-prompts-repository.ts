import type { WritingPromptRow } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { writingPrompts, type WritingPrompt } from './writing-prompts'

type WritingPromptRepositoryResult = {
  prompts: WritingPrompt[]
  storageMode: 'library' | 'supabase'
}

function normalizePromptRow(row: WritingPromptRow): WritingPrompt {
  return {
    id: row.id,
    taskType: row.task_type,
    title: row.title,
    durationMinutes: row.duration_minutes,
    minimumWords: row.minimum_words,
    brief: row.brief,
    instructions: Array.isArray(row.instructions) ? row.instructions : [],
    planningChecklist: Array.isArray(row.planning_checklist)
      ? row.planning_checklist
      : [],
  }
}

export async function listWritingPrompts(): Promise<WritingPromptRepositoryResult> {
  if (!isSupabaseConfigured()) {
    return {
      prompts: writingPrompts,
      storageMode: 'library',
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('writing_prompts')
    .select(
      'id, task_type, title, duration_minutes, minimum_words, brief, instructions, planning_checklist, is_active, source, created_at'
    )
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error || !data || data.length === 0) {
    return {
      prompts: writingPrompts,
      storageMode: 'library',
    }
  }

  return {
    prompts: (data as WritingPromptRow[]).map((row) => normalizePromptRow(row)),
    storageMode: 'supabase',
  }
}
