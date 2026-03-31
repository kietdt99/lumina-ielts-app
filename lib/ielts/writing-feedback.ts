import type { WritingPrompt } from './writing-prompts'

export type WritingRubricRow = {
  label: string
  score: number
  summary: string
}

export type WritingEvaluation = {
  estimatedBand: number
  wordCount: number
  paragraphCount: number
  sentenceCount: number
  rubric: WritingRubricRow[]
  strengths: string[]
  priorities: string[]
  coachingNote: string
}

type DraftMetrics = {
  wordCount: number
  paragraphCount: number
  sentenceCount: number
  transitionCount: number
  complexMarkerCount: number
  uniqueWordRatio: number
  averageSentenceLength: number
  hasConclusion: boolean
}

const transitionWords = [
  'however',
  'therefore',
  'moreover',
  'furthermore',
  'in contrast',
  'for example',
  'for instance',
  'overall',
  'in conclusion',
  'as a result',
]

const complexMarkers = [
  'although',
  'while',
  'whereas',
  'unless',
  'because',
  'since',
  'despite',
  'instead',
  'therefore',
  'consequently',
]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function roundToHalfBand(value: number) {
  return Math.round(value * 2) / 2
}

function countMatches(text: string, phrases: string[]) {
  const lowerText = text.toLowerCase()
  return phrases.reduce((total, phrase) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const matches = lowerText.match(new RegExp(`\\b${escaped}\\b`, 'g'))
    return total + (matches?.length ?? 0)
  }, 0)
}

export function getDraftMetrics(text: string): DraftMetrics {
  const normalizedText = text.trim()
  const words = normalizedText.match(/\b[\w'-]+\b/g) ?? []
  const paragraphs = normalizedText
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  const sentences = normalizedText
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
  const uniqueWordRatio = words.length
    ? new Set(words.map((word) => word.toLowerCase())).size / words.length
    : 0
  const averageSentenceLength = sentences.length ? words.length / sentences.length : 0

  return {
    wordCount: words.length,
    paragraphCount: paragraphs.length,
    sentenceCount: sentences.length,
    transitionCount: countMatches(normalizedText, transitionWords),
    complexMarkerCount: countMatches(normalizedText, complexMarkers),
    uniqueWordRatio,
    averageSentenceLength,
    hasConclusion: /\bin conclusion\b|\bto conclude\b|\boverall\b/i.test(
      normalizedText
    ),
  }
}

function buildTaskResponseScore(prompt: WritingPrompt, metrics: DraftMetrics) {
  const targetRatio = clamp(metrics.wordCount / prompt.minimumWords, 0, 1.3)
  const structureBonus =
    prompt.taskType === 'Task 2'
      ? metrics.paragraphCount >= 4
        ? 0.7
        : 0
      : metrics.paragraphCount >= 3
        ? 0.7
        : 0
  const completionBonus = metrics.hasConclusion ? 0.3 : 0
  return clamp(4.5 + targetRatio * 2 + structureBonus + completionBonus, 4.5, 8.5)
}

function buildCoherenceScore(prompt: WritingPrompt, metrics: DraftMetrics) {
  const paragraphTarget = prompt.taskType === 'Task 2' ? 4 : 3
  const paragraphScore = clamp(metrics.paragraphCount / paragraphTarget, 0, 1.1)
  const transitionScore = clamp(metrics.transitionCount / 5, 0, 1)
  return clamp(4.5 + paragraphScore * 1.8 + transitionScore * 1.4, 4.5, 8.5)
}

function buildLexicalScore(metrics: DraftMetrics) {
  const rangeScore = clamp((metrics.uniqueWordRatio - 0.35) / 0.25, 0, 1.1)
  return clamp(4.5 + rangeScore * 3, 4.5, 8)
}

function buildGrammarScore(metrics: DraftMetrics) {
  const sentenceLengthScore =
    metrics.averageSentenceLength >= 10 && metrics.averageSentenceLength <= 24 ? 1 : 0.55
  const sentenceVolumeScore = clamp(metrics.sentenceCount / 10, 0, 1)
  const complexityScore = clamp(metrics.complexMarkerCount / 4, 0, 1)
  return clamp(
    4.5 + sentenceLengthScore * 1.2 + sentenceVolumeScore * 1.2 + complexityScore * 1.1,
    4.5,
    8
  )
}

function rubricSummary(label: string, score: number) {
  if (score >= 7.5) {
    return `${label} is a visible strength in this draft.`
  }

  if (score >= 6.5) {
    return `${label} is moving in the right direction but still needs refinement.`
  }

  return `${label} needs more control and clearer execution.`
}

export function evaluateWriting(prompt: WritingPrompt, draft: string): WritingEvaluation {
  const metrics = getDraftMetrics(draft)
  const taskResponse = buildTaskResponseScore(prompt, metrics)
  const coherence = buildCoherenceScore(prompt, metrics)
  const lexical = buildLexicalScore(metrics)
  const grammar = buildGrammarScore(metrics)
  const estimatedBand = roundToHalfBand(
    (taskResponse + coherence + lexical + grammar) / 4
  )

  const strengths: string[] = []
  const priorities: string[] = []

  if (metrics.wordCount >= prompt.minimumWords) {
    strengths.push('You met the recommended word count for this task.')
  } else {
    priorities.push(
      `Add more development so the response reaches at least ${prompt.minimumWords} words.`
    )
  }

  if (
    (prompt.taskType === 'Task 2' && metrics.paragraphCount >= 4) ||
    (prompt.taskType === 'Task 1' && metrics.paragraphCount >= 3)
  ) {
    strengths.push('The paragraph structure is strong enough for a clear reader journey.')
  } else {
    priorities.push('Rebuild the response around clearer paragraph boundaries.')
  }

  if (metrics.transitionCount >= 4) {
    strengths.push('Linking language helps the ideas flow naturally.')
  } else {
    priorities.push('Use more transitions to connect ideas and comparisons.')
  }

  if (metrics.uniqueWordRatio >= 0.52) {
    strengths.push('The vocabulary range looks varied for a practice draft.')
  } else {
    priorities.push('Repeat fewer words by paraphrasing key ideas more actively.')
  }

  if (!metrics.hasConclusion && prompt.taskType === 'Task 2') {
    priorities.push('Finish with a short conclusion that confirms your opinion.')
  }

  if (metrics.averageSentenceLength < 9) {
    priorities.push('Combine some short sentences to show more control over complex grammar.')
  }

  if (!strengths.length) {
    strengths.push('You already have a complete draft to review and improve.')
  }

  if (!priorities.length) {
    priorities.push('Revise one paragraph to make your reasoning more specific and persuasive.')
  }

  const rubric = [
    {
      label: 'Task Response',
      score: roundToHalfBand(taskResponse),
      summary: rubricSummary('Task response', taskResponse),
    },
    {
      label: 'Coherence and Cohesion',
      score: roundToHalfBand(coherence),
      summary: rubricSummary('Coherence and cohesion', coherence),
    },
    {
      label: 'Lexical Resource',
      score: roundToHalfBand(lexical),
      summary: rubricSummary('Lexical resource', lexical),
    },
    {
      label: 'Grammatical Range and Accuracy',
      score: roundToHalfBand(grammar),
      summary: rubricSummary('Grammar control', grammar),
    },
  ]

  const coachingNote =
    prompt.taskType === 'Task 2'
      ? 'For Task 2, the fastest score gains usually come from clearer position statements and better developed body paragraphs.'
      : 'For Task 1, the fastest score gains usually come from a sharper overview and more controlled process or trend language.'

  return {
    estimatedBand,
    wordCount: metrics.wordCount,
    paragraphCount: metrics.paragraphCount,
    sentenceCount: metrics.sentenceCount,
    rubric,
    strengths,
    priorities,
    coachingNote,
  }
}
