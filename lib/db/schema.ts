export type ProfileRow = {
  id: string
  email: string | null
  full_name: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export type UserGoalRow = {
  id: string
  user_id: string
  target_band: number
  current_level: string
  focus_skill: string
  study_frequency: string
  created_at: string
  updated_at: string
}

export type WritingPromptRow = {
  id: string
  task_type: 'Task 1' | 'Task 2'
  title: string
  duration_minutes: number
  minimum_words: number
  brief: string
  instructions: string[]
  planning_checklist: string[]
  is_active: boolean
  source: 'seed' | 'admin'
  created_at: string
}

export type PracticeSessionRow = {
  id: string
  user_id: string
  skill_type: 'Writing'
  status: 'draft' | 'submitted' | 'reviewed'
  started_at: string
  completed_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type WritingSubmissionRow = {
  id: string
  session_id: string | null
  user_id: string
  prompt_id: string
  draft: string
  word_count: number
  source: 'web'
  submitted_at: string
  created_at: string
}

export type WritingFeedbackRow = {
  id: string
  submission_id: string
  estimated_band: number
  rubric: Array<{
    label: string
    score: number
    summary: string
  }>
  strengths: string[]
  priorities: string[]
  coaching_note: string
  sample_rewrite: string | null
  provider: 'heuristic' | 'openai'
  created_at: string
}

export type ActivityLogRow = {
  id: string
  user_id: string
  event_name: string
  payload: Record<string, unknown>
  created_at: string
}
