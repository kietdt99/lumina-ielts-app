import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSubmissionSuccess } from '../helpers/fixtures'
import {
  listWritingSubmissionHistory,
  saveWritingSubmissionRecord,
} from '@/lib/ielts/writing-submissions-repository'

const repositoryState = vi.hoisted(() => ({
  user: null as null | { id: string; email?: string | null },
  ensureProfileForUser: vi.fn(),
  insertCalls: [] as Array<{ table: string; payload: unknown }>,
  selectRows: [] as unknown[],
  selectError: null as null | { message: string },
}))

vi.mock('@/lib/supabase/session', () => ({
  getAuthenticatedUser: vi.fn(async () => repositoryState.user),
  ensureProfileForUser: repositoryState.ensureProfileForUser,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: (table: string) => ({
      insert: (payload: unknown) => {
        repositoryState.insertCalls.push({ table, payload })

        return {
          select: () => ({
            single: async () => ({
              data:
                table === 'practice_sessions'
                  ? { id: 'session-1' }
                  : table === 'writing_submissions'
                    ? { id: 'submission-1' }
                    : null,
              error: null,
            }),
          }),
        }
      },
      select: () => ({
        eq: () => ({
          order: async () => ({
            data: repositoryState.selectRows,
            error: repositoryState.selectError,
          }),
        }),
      }),
    }),
  })),
}))

describe('writing submissions repository', () => {
  beforeEach(() => {
    repositoryState.user = null
    repositoryState.insertCalls = []
    repositoryState.selectRows = []
    repositoryState.selectError = null
    repositoryState.ensureProfileForUser.mockReset()
  })

  it('returns browser mode when saving anonymously', async () => {
    const submission = createSubmissionSuccess()

    const result = await saveWritingSubmissionRecord(
      {
        promptId: submission.historyEntry.promptId,
        draft: 'A valid draft',
      },
      submission
    )

    expect(result).toEqual({
      historyEntry: submission.historyEntry,
      storageMode: 'browser',
    })
    expect(repositoryState.insertCalls).toEqual([])
  })

  it('persists the writing submission flow to Supabase for authenticated users', async () => {
    const submission = createSubmissionSuccess()

    repositoryState.user = {
      id: 'user-1',
      email: 'learner@example.com',
    }

    const result = await saveWritingSubmissionRecord(
      {
        promptId: submission.historyEntry.promptId,
        draft: 'A valid draft',
      },
      submission
    )

    expect(result).toEqual({
      historyEntry: submission.historyEntry,
      storageMode: 'supabase',
    })
    expect(repositoryState.ensureProfileForUser).toHaveBeenCalledWith(
      repositoryState.user
    )
    expect(repositoryState.insertCalls.map((call) => call.table)).toEqual([
      'practice_sessions',
      'writing_submissions',
      'writing_feedback',
      'activity_logs',
    ])
  })

  it('returns browser mode with an empty history list for anonymous users', async () => {
    const result = await listWritingSubmissionHistory()

    expect(result).toEqual({
      entries: [],
      storageMode: 'browser',
    })
  })

  it('maps Supabase history rows into tracker entries', async () => {
    repositoryState.user = {
      id: 'user-2',
      email: 'learner@example.com',
    }
    repositoryState.selectRows = [
      {
        id: 'submission-1',
        draft: 'A full draft body that can be truncated for preview.',
        word_count: 278,
        submitted_at: '2026-04-19T06:00:00.000Z',
        prompt_id: 'task2-remote-work',
        prompt: {
          title: 'Remote work and employee productivity',
          task_type: 'Task 2',
        },
        feedback: {
          estimated_band: 7.5,
          rubric: createSubmissionSuccess().historyEntry.rubric,
          strengths: ['Strong position'],
          priorities: ['Add a more specific example'],
        },
      },
    ]

    const result = await listWritingSubmissionHistory()

    expect(result.storageMode).toBe('supabase')
    expect(result.entries).toHaveLength(1)
    expect(result.entries[0]).toEqual(
      expect.objectContaining({
        id: 'submission-1',
        promptId: 'task2-remote-work',
        promptTitle: 'Remote work and employee productivity',
        taskType: 'Task 2',
        wordCount: 278,
        estimatedBand: 7.5,
      })
    )
  })
})
