import {
  createWritingHistoryEntry,
  type WritingHistoryEntry,
} from './writing-history'
import {
  evaluateWriting,
  type WritingEvaluation,
} from './writing-feedback'
import {
  writingPrompts,
  type WritingPrompt,
} from './writing-prompts'

export type WritingSubmissionInput = {
  promptId: string
  draft: string
}

export type WritingSubmissionSuccess = {
  ok: true
  feedback: WritingEvaluation
  historyEntry: WritingHistoryEntry
  storageMode?: 'browser' | 'supabase'
}

export type WritingSubmissionFailure = {
  ok: false
  error: string
}

export type WritingSubmissionResponse =
  | WritingSubmissionSuccess
  | WritingSubmissionFailure

type WritingSubmissionValidation =
  | {
      ok: true
      prompt: WritingPrompt
      draft: string
    }
  | WritingSubmissionFailure

const invalidRequestMessage = 'Invalid writing submission payload.'
const unknownPromptMessage = 'The selected writing prompt could not be found.'
const emptyDraftMessage = 'Write a draft before requesting practice feedback.'

export function getWritingPromptById(promptId: string) {
  return writingPrompts.find((prompt) => prompt.id === promptId) ?? null
}

export function validateWritingSubmission(
  payload: unknown
): WritingSubmissionValidation {
  if (!payload || typeof payload !== 'object') {
    return {
      ok: false,
      error: invalidRequestMessage,
    }
  }

  const { promptId, draft } = payload as Partial<WritingSubmissionInput>

  if (typeof promptId !== 'string' || typeof draft !== 'string') {
    return {
      ok: false,
      error: invalidRequestMessage,
    }
  }

  const prompt = getWritingPromptById(promptId)

  if (!prompt) {
    return {
      ok: false,
      error: unknownPromptMessage,
    }
  }

  const normalizedDraft = draft.trim()

  if (!normalizedDraft) {
    return {
      ok: false,
      error: emptyDraftMessage,
    }
  }

  return {
    ok: true,
    prompt,
    draft: normalizedDraft,
  }
}

export function createWritingSubmission(
  payload: unknown
): WritingSubmissionResponse {
  const validation = validateWritingSubmission(payload)

  if (!validation.ok) {
    return validation
  }

  const feedback = evaluateWriting(validation.prompt, validation.draft)
  const historyEntry = createWritingHistoryEntry({
    prompt: validation.prompt,
    draft: validation.draft,
    feedback,
  })

  return {
    ok: true,
    feedback,
    historyEntry,
  }
}

export const writingSubmissionErrors = {
  emptyDraftMessage,
  invalidRequestMessage,
  unknownPromptMessage,
}
