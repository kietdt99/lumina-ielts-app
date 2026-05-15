import {
  getDraftMetrics,
  type DraftMetrics,
} from './writing-feedback'
import {
  writingPrompts,
  type WritingPrompt,
} from './writing-prompts'

export type WritingReadinessStatus = 'ready' | 'needs-work' | 'missing'

export type WritingReadinessItem = {
  id: string
  label: string
  criterion: string
  status: WritingReadinessStatus
  detail: string
  action: string
}

export type WritingReadinessCheck = {
  promptId: string
  taskType: WritingPrompt['taskType']
  readinessScore: number
  headline: string
  summary: string
  metrics: Pick<
    DraftMetrics,
    'wordCount' | 'paragraphCount' | 'sentenceCount' | 'transitionCount'
  >
  items: WritingReadinessItem[]
}

export type WritingReadinessInput = {
  promptId: string
  draft: string
}

export type WritingReadinessSuccess = {
  ok: true
  readiness: WritingReadinessCheck
}

export type WritingReadinessFailure = {
  ok: false
  error: string
}

export type WritingReadinessResponse =
  | WritingReadinessSuccess
  | WritingReadinessFailure

const invalidRequestMessage = 'Invalid writing readiness payload.'
const unknownPromptMessage = 'The selected writing prompt could not be found.'

function getWritingPromptById(promptId: string) {
  return writingPrompts.find((prompt) => prompt.id === promptId) ?? null
}

function scoreStatus(status: WritingReadinessStatus) {
  if (status === 'ready') {
    return 1
  }

  return status === 'needs-work' ? 0.5 : 0
}

function statusFromThresholds({
  current,
  ready,
  partial,
}: {
  current: number
  ready: number
  partial: number
}): WritingReadinessStatus {
  if (current >= ready) {
    return 'ready'
  }

  return current >= partial ? 'needs-work' : 'missing'
}

function hasTaskTwoConclusion(draft: string) {
  return /\bin conclusion\b|\bto conclude\b|\boverall\b/i.test(draft)
}

function hasTaskOneOverview(draft: string) {
  return /\boverall\b|\boverview\b|\bmain feature\b|\bthe clearest\b/i.test(draft)
}

function buildWordTargetItem(
  prompt: WritingPrompt,
  metrics: DraftMetrics
): WritingReadinessItem {
  const status = statusFromThresholds({
    current: metrics.wordCount,
    ready: prompt.minimumWords,
    partial: Math.floor(prompt.minimumWords * 0.75),
  })

  return {
    id: 'word-target',
    label: 'Word target',
    criterion:
      prompt.taskType === 'Task 1' ? 'Task Achievement' : 'Task Response',
    status,
    detail: `${metrics.wordCount} of ${prompt.minimumWords}+ recommended words.`,
    action:
      status === 'ready'
        ? 'Keep the draft concise while preserving the main support.'
        : `Expand the weakest paragraph until the response reaches at least ${prompt.minimumWords} words.`,
  }
}

function buildStructureItem(
  prompt: WritingPrompt,
  metrics: DraftMetrics
): WritingReadinessItem {
  const expectedParagraphs = prompt.taskType === 'Task 1' ? 3 : 4
  const status = statusFromThresholds({
    current: metrics.paragraphCount,
    ready: expectedParagraphs,
    partial: expectedParagraphs - 1,
  })

  return {
    id: 'paragraph-structure',
    label: 'Paragraph structure',
    criterion: 'Coherence and Cohesion',
    status,
    detail: `${metrics.paragraphCount} paragraph${metrics.paragraphCount === 1 ? '' : 's'} detected.`,
    action:
      status === 'ready'
        ? 'Scan each paragraph for one clear job before submitting.'
        : prompt.taskType === 'Task 1'
          ? 'Separate the introduction, overview, and grouped detail paragraphs.'
          : 'Use an introduction, two focused body paragraphs, and a conclusion.',
  }
}

function buildTaskFocusItem(
  prompt: WritingPrompt,
  draft: string
): WritingReadinessItem {
  const hasFocus =
    prompt.taskType === 'Task 1'
      ? hasTaskOneOverview(draft)
      : hasTaskTwoConclusion(draft)
  const hasAnyDraft = draft.trim().length > 0

  return {
    id: 'task-focus',
    label: prompt.taskType === 'Task 1' ? 'Overview signal' : 'Position signal',
    criterion:
      prompt.taskType === 'Task 1' ? 'Task Achievement' : 'Task Response',
    status: hasFocus ? 'ready' : hasAnyDraft ? 'needs-work' : 'missing',
    detail:
      prompt.taskType === 'Task 1'
        ? hasFocus
          ? 'The draft contains an overview-style signal.'
          : 'No clear overview signal was detected yet.'
        : hasFocus
          ? 'The draft contains a conclusion or overall judgement signal.'
          : 'No conclusion or overall judgement signal was detected yet.',
    action:
      prompt.taskType === 'Task 1'
        ? 'Add one overview sentence that names the main pattern before details.'
        : 'Add a direct position in the introduction and confirm it in a short conclusion.',
  }
}

function buildCohesionItem(metrics: DraftMetrics): WritingReadinessItem {
  const status = statusFromThresholds({
    current: metrics.transitionCount,
    ready: 4,
    partial: 2,
  })

  return {
    id: 'cohesion',
    label: 'Linking control',
    criterion: 'Coherence and Cohesion',
    status,
    detail: `${metrics.transitionCount} useful transition signal${metrics.transitionCount === 1 ? '' : 's'} detected.`,
    action:
      status === 'ready'
        ? 'Remove any connector that feels mechanical or repeated.'
        : 'Add natural connectors that show contrast, sequence, cause, or conclusion.',
  }
}

function buildLexicalItem(metrics: DraftMetrics): WritingReadinessItem {
  const ratio = Math.round(metrics.uniqueWordRatio * 100)
  const status =
    metrics.wordCount < 40
      ? 'missing'
      : metrics.uniqueWordRatio >= 0.52
        ? 'ready'
        : metrics.uniqueWordRatio >= 0.42
          ? 'needs-work'
          : 'missing'

  return {
    id: 'lexical-range',
    label: 'Vocabulary range',
    criterion: 'Lexical Resource',
    status,
    detail: `Unique word ratio is about ${ratio}%.`,
    action:
      status === 'ready'
        ? 'Keep precise collocations and avoid adding forced advanced words.'
        : 'Replace repeated key nouns and verbs with accurate topic-specific phrasing.',
  }
}

function buildGrammarItem(metrics: DraftMetrics): WritingReadinessItem {
  const hasEnoughSentences = metrics.sentenceCount >= 5
  const hasControlledLength =
    metrics.averageSentenceLength >= 9 && metrics.averageSentenceLength <= 26
  const status =
    hasEnoughSentences && hasControlledLength
      ? 'ready'
      : metrics.sentenceCount >= 3
        ? 'needs-work'
        : 'missing'

  return {
    id: 'grammar-control',
    label: 'Sentence control',
    criterion: 'Grammatical Range and Accuracy',
    status,
    detail: `${metrics.sentenceCount} sentence${metrics.sentenceCount === 1 ? '' : 's'} with an average length of ${metrics.averageSentenceLength.toFixed(1)} words.`,
    action:
      status === 'ready'
        ? 'Check punctuation and article use before requesting feedback.'
        : 'Split run-ons, combine very short sentences, and keep each sentence grammatically complete.',
  }
}

function buildHeadline(readinessScore: number) {
  if (readinessScore >= 80) {
    return 'Ready for practice feedback'
  }

  if (readinessScore >= 50) {
    return 'Almost ready, fix the highlighted checks'
  }

  return 'Build the draft before requesting feedback'
}

export function createWritingReadinessCheck(
  prompt: WritingPrompt,
  draft: string
): WritingReadinessCheck {
  const normalizedDraft = draft.trim()
  const metrics = getDraftMetrics(normalizedDraft)
  const items = [
    buildWordTargetItem(prompt, metrics),
    buildStructureItem(prompt, metrics),
    buildTaskFocusItem(prompt, normalizedDraft),
    buildCohesionItem(metrics),
    buildLexicalItem(metrics),
    buildGrammarItem(metrics),
  ]
  const readinessScore = Math.round(
    (items.reduce((total, item) => total + scoreStatus(item.status), 0) /
      items.length) *
      100
  )
  const needsAttention = items.filter((item) => item.status !== 'ready').length

  return {
    promptId: prompt.id,
    taskType: prompt.taskType,
    readinessScore,
    headline: buildHeadline(readinessScore),
    summary: needsAttention
      ? `${needsAttention} readiness check${needsAttention === 1 ? '' : 's'} still need attention before the strongest feedback run.`
      : 'All readiness checks look strong enough for a feedback run.',
    metrics: {
      wordCount: metrics.wordCount,
      paragraphCount: metrics.paragraphCount,
      sentenceCount: metrics.sentenceCount,
      transitionCount: metrics.transitionCount,
    },
    items,
  }
}

export function createWritingReadiness(
  payload: unknown
): WritingReadinessResponse {
  if (!payload || typeof payload !== 'object') {
    return {
      ok: false,
      error: invalidRequestMessage,
    }
  }

  const { promptId, draft } = payload as Partial<WritingReadinessInput>

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

  return {
    ok: true,
    readiness: createWritingReadinessCheck(prompt, draft),
  }
}

export const writingReadinessErrors = {
  invalidRequestMessage,
  unknownPromptMessage,
}
