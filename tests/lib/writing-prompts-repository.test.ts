import { beforeEach, describe, expect, it, vi } from 'vitest'
import { writingPrompts } from '@/lib/ielts/writing-prompts'
import { listWritingPrompts } from '@/lib/ielts/writing-prompts-repository'

const repositoryState = vi.hoisted(() => ({
  isSupabaseConfigured: false,
  rows: [] as unknown[],
  error: null as null | { message: string },
}))

vi.mock('@/lib/supabase/config', () => ({
  isSupabaseConfigured: () => repositoryState.isSupabaseConfigured,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: async () => ({
            data: repositoryState.rows,
            error: repositoryState.error,
          }),
        }),
      }),
    }),
  })),
}))

describe('writing prompts repository', () => {
  beforeEach(() => {
    repositoryState.isSupabaseConfigured = false
    repositoryState.rows = []
    repositoryState.error = null
  })

  it('returns the in-app prompt library when Supabase is not configured', async () => {
    const result = await listWritingPrompts()

    expect(result.storageMode).toBe('library')
    expect(result.prompts).toEqual(writingPrompts)
  })

  it('returns active prompts from Supabase when rows exist', async () => {
    repositoryState.isSupabaseConfigured = true
    repositoryState.rows = [
      {
        id: 'task2-zebra-crossing',
        task_type: 'Task 2',
        title: 'Zebra crossing safety policy',
        duration_minutes: 40,
        minimum_words: 250,
        brief: 'Discuss whether stricter road-safety penalties are effective.',
        instructions: ['Take a clear position.'],
        planning_checklist: ['Plan both sides before you write.'],
        is_active: true,
        source: 'admin',
        created_at: '2026-04-24T00:00:00.000Z',
      },
    ]

    const result = await listWritingPrompts()

    expect(result).toEqual({
      prompts: [
        {
          id: 'task2-zebra-crossing',
          taskType: 'Task 2',
          title: 'Zebra crossing safety policy',
          durationMinutes: 40,
          minimumWords: 250,
          brief: 'Discuss whether stricter road-safety penalties are effective.',
          instructions: ['Take a clear position.'],
          planningChecklist: ['Plan both sides before you write.'],
        },
      ],
      storageMode: 'supabase',
    })
  })

  it('falls back to the in-app prompt library when Supabase returns no rows', async () => {
    repositoryState.isSupabaseConfigured = true

    const result = await listWritingPrompts()

    expect(result.storageMode).toBe('library')
    expect(result.prompts).toHaveLength(writingPrompts.length)
  })
})
