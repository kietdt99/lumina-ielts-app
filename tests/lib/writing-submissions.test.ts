import { describe, expect, it } from 'vitest'
import {
  createWritingSubmission,
  validateWritingSubmission,
  writingSubmissionErrors,
} from '@/lib/ielts/writing-submissions'

describe('writing submissions service', () => {
  it('validates a payload with a known prompt and non-empty draft', () => {
    const result = validateWritingSubmission({
      promptId: 'task2-remote-work',
      draft: '  This is a valid IELTS practice draft.  ',
    })

    expect(result.ok).toBe(true)

    if (result.ok) {
      expect(result.prompt.id).toBe('task2-remote-work')
      expect(result.draft).toBe('This is a valid IELTS practice draft.')
    }
  })

  it('rejects invalid payload shapes and unknown prompts', () => {
    expect(validateWritingSubmission(null)).toEqual({
      ok: false,
      error: writingSubmissionErrors.invalidRequestMessage,
    })

    expect(
      validateWritingSubmission({
        promptId: 'unknown-prompt',
        draft: 'A draft',
      })
    ).toEqual({
      ok: false,
      error: writingSubmissionErrors.unknownPromptMessage,
    })
  })

  it('creates a full submission response for valid input', () => {
    const result = createWritingSubmission({
      promptId: 'task2-remote-work',
      draft: [
        'Remote work can improve productivity when employees have more control over their time.',
        '',
        'However, businesses still need clear systems so teams can collaborate well and stay accountable.',
        '',
        'In conclusion, remote work is most effective when organisations balance flexibility with structure.',
      ].join('\n'),
    })

    expect(result.ok).toBe(true)

    if (result.ok) {
      expect(result.historyEntry.promptId).toBe('task2-remote-work')
      expect(result.historyEntry.estimatedBand).toBe(result.feedback.estimatedBand)
      expect(result.feedback.rubric).toHaveLength(4)
    }
  })

  it('returns a failure result when the draft is empty', () => {
    expect(
      createWritingSubmission({
        promptId: 'task2-remote-work',
        draft: '   ',
      })
    ).toEqual({
      ok: false,
      error: writingSubmissionErrors.emptyDraftMessage,
    })
  })
})
