export type SpeakingPracticeDifficulty = 'Guided' | 'Balanced' | 'Stretch'

export type SpeakingPracticeDifficultyFilter = 'All' | SpeakingPracticeDifficulty

export type SpeakingPracticePart = 'Part 1' | 'Part 2' | 'Part 3'

export type SpeakingPracticePartFilter = 'All' | SpeakingPracticePart

export type SpeakingCuePoint = {
  id: string
  label: string
}

export type SpeakingPracticePrompt = {
  id: string
  title: string
  part: SpeakingPracticePart
  topic: string
  difficulty: SpeakingPracticeDifficulty
  prepSeconds: number
  speakingSeconds: number
  targetWords: number
  prompt: string
  cuePoints: SpeakingCuePoint[]
  followUpQuestions: string[]
  vocabularyBank: string[]
  strategyTips: string[]
}

export type SpeakingPracticeSummary = {
  totalPrompts: number
  guidedPrompts: number
  balancedPrompts: number
  stretchPrompts: number
  averageSpeakingSeconds: number
  topics: number
}

export type SpeakingAttemptInput = {
  promptId: string
  transcript: string
  completedCuePointIds?: string[]
}

export type SpeakingScoreStatus =
  | 'needs-practice'
  | 'building-control'
  | 'strong-control'

export type SpeakingCriterionScore = {
  id: 'fluency' | 'lexical' | 'grammar' | 'task'
  label: string
  score: number
  summary: string
}

export type SpeakingAttemptMetrics = {
  wordCount: number
  sentenceCount: number
  transitionCount: number
  topicVocabularyCount: number
  fillerCount: number
  uniqueWordRatio: number
  averageSentenceLength: number
  completedCuePointCount: number
  totalCuePointCount: number
}

export type SpeakingPracticeScore = {
  promptId: string
  promptTitle: string
  part: SpeakingPracticePart
  topic: string
  difficulty: SpeakingPracticeDifficulty
  status: SpeakingScoreStatus
  statusLabel: string
  estimatedBand: number
  readinessScore: number
  summary: string
  metrics: SpeakingAttemptMetrics
  criteria: SpeakingCriterionScore[]
  nextActions: string[]
}

export type SpeakingPracticeScoreSuccess = {
  ok: true
  score: SpeakingPracticeScore
}

export type SpeakingPracticeScoreFailure = {
  ok: false
  error: string
}

export type SpeakingPracticeScoreResponse =
  | SpeakingPracticeScoreSuccess
  | SpeakingPracticeScoreFailure

const allTopicsOption = 'All topics'
const invalidPayloadMessage = 'Invalid speaking practice payload.'
const unknownPromptMessage = 'The selected speaking prompt could not be found.'

const transitionWords = [
  'firstly',
  'however',
  'because',
  'for example',
  'for instance',
  'as a result',
  'in contrast',
  'overall',
  'in addition',
  'on the other hand',
]

const fillerWords = ['um', 'uh', 'er', 'like', 'you know']

export const speakingPracticePrompts: SpeakingPracticePrompt[] = [
  {
    id: 'speaking-part1-study-routine',
    title: 'Study routine',
    part: 'Part 1',
    topic: 'Study habits',
    difficulty: 'Guided',
    prepSeconds: 15,
    speakingSeconds: 60,
    targetWords: 90,
    prompt: 'Do you prefer studying alone or with other people? Why?',
    cuePoints: [
      { id: 'preference', label: 'State a clear preference' },
      { id: 'reason', label: 'Give one practical reason' },
      { id: 'example', label: 'Add a personal example' },
    ],
    followUpQuestions: [
      'Has your study routine changed recently?',
      'What makes a study session productive for you?',
      'Do you think students should take more breaks?',
    ],
    vocabularyBank: [
      'concentration',
      'routine',
      'accountability',
      'distraction',
      'revision',
    ],
    strategyTips: [
      'Answer directly in the first sentence.',
      'Use one short example instead of listing many reasons.',
      'Keep the answer natural and conversational.',
    ],
  },
  {
    id: 'speaking-part2-useful-device',
    title: 'A useful device',
    part: 'Part 2',
    topic: 'Technology and daily life',
    difficulty: 'Balanced',
    prepSeconds: 60,
    speakingSeconds: 120,
    targetWords: 180,
    prompt: 'Describe a device that you use almost every day.',
    cuePoints: [
      { id: 'what-it-is', label: 'What the device is' },
      { id: 'how-you-use-it', label: 'How you use it' },
      { id: 'why-useful', label: 'Why it is useful' },
      { id: 'future-change', label: 'Whether you would change it in the future' },
    ],
    followUpQuestions: [
      'Do people rely too much on digital devices?',
      'How have devices changed the way people study?',
      'Should schools limit phone use?',
    ],
    vocabularyBank: [
      'convenient',
      'portable',
      'reliable',
      'screen time',
      'productivity',
    ],
    strategyTips: [
      'Spend the first 10 seconds giving context.',
      'Move through the cue points in order.',
      'End with a short reflection rather than stopping suddenly.',
    ],
  },
  {
    id: 'speaking-part2-city-park',
    title: 'A public park',
    part: 'Part 2',
    topic: 'Cities and environment',
    difficulty: 'Balanced',
    prepSeconds: 60,
    speakingSeconds: 120,
    targetWords: 180,
    prompt: 'Describe a public park or green space that you know.',
    cuePoints: [
      { id: 'where', label: 'Where it is' },
      { id: 'features', label: 'What features it has' },
      { id: 'visitors', label: 'Who uses it' },
      { id: 'importance', label: 'Why it matters to the community' },
    ],
    followUpQuestions: [
      'Should cities invest more in public parks?',
      'Why do some people avoid outdoor spaces?',
      'How can parks support healthier lifestyles?',
    ],
    vocabularyBank: [
      'green space',
      'community',
      'shade',
      'well-being',
      'recreation',
    ],
    strategyTips: [
      'Use location language early.',
      'Group details into physical features and social benefits.',
      'Use sensory details to make the answer easier to follow.',
    ],
  },
  {
    id: 'speaking-part3-remote-work',
    title: 'Remote work and society',
    part: 'Part 3',
    topic: 'Work and society',
    difficulty: 'Stretch',
    prepSeconds: 20,
    speakingSeconds: 90,
    targetWords: 140,
    prompt:
      'Do you think remote work will have a positive or negative effect on society in the long term?',
    cuePoints: [
      { id: 'position', label: 'Give a clear long-term position' },
      { id: 'benefit', label: 'Explain one social benefit' },
      { id: 'risk', label: 'Explain one social risk' },
      { id: 'judgement', label: 'End with a balanced judgement' },
    ],
    followUpQuestions: [
      'Which jobs should not be done remotely?',
      'How can companies maintain teamwork online?',
      'Will offices become less important in the future?',
    ],
    vocabularyBank: [
      'flexibility',
      'isolation',
      'collaboration',
      'commuting',
      'work-life balance',
    ],
    strategyTips: [
      'Do not give only one-sided advantages.',
      'Use abstract language, but support it with a concrete example.',
      'Finish with a judgement that answers the question directly.',
    ],
  },
]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase()
}

function countMatches(text: string, phrases: string[]) {
  const lowerText = text.toLowerCase()

  return phrases.reduce((total, phrase) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const matches = lowerText.match(new RegExp(`\\b${escaped}\\b`, 'g'))
    return total + (matches?.length ?? 0)
  }, 0)
}

function searchableText(prompt: SpeakingPracticePrompt) {
  return [
    prompt.title,
    prompt.part,
    prompt.topic,
    prompt.difficulty,
    prompt.prompt,
    ...prompt.cuePoints.map((cuePoint) => cuePoint.label),
    ...prompt.followUpQuestions,
    ...prompt.vocabularyBank,
    ...prompt.strategyTips,
  ].join(' ')
}

function roundToHalfBand(value: number) {
  return Math.round(value * 2) / 2
}

function statusFromScore(score: number): SpeakingScoreStatus {
  if (score >= 75) {
    return 'strong-control'
  }

  return score >= 55 ? 'building-control' : 'needs-practice'
}

function statusLabel(status: SpeakingScoreStatus) {
  switch (status) {
    case 'strong-control':
      return 'Strong control'
    case 'building-control':
      return 'Building control'
    case 'needs-practice':
      return 'Needs practice'
  }
}

function getMetrics({
  completedCuePointIds,
  prompt,
  transcript,
}: {
  completedCuePointIds: string[]
  prompt: SpeakingPracticePrompt
  transcript: string
}): SpeakingAttemptMetrics {
  const normalizedTranscript = transcript.trim()
  const words = normalizedTranscript.match(/\b[\w'-]+\b/g) ?? []
  const sentences = normalizedTranscript
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
  const validCuePointIds = new Set(prompt.cuePoints.map((cuePoint) => cuePoint.id))
  const completedCuePointCount = new Set(
    completedCuePointIds.filter((cuePointId) => validCuePointIds.has(cuePointId))
  ).size

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    transitionCount: countMatches(normalizedTranscript, transitionWords),
    topicVocabularyCount: countMatches(
      normalizedTranscript,
      prompt.vocabularyBank
    ),
    fillerCount: countMatches(normalizedTranscript, fillerWords),
    uniqueWordRatio: words.length
      ? new Set(words.map((word) => word.toLowerCase())).size / words.length
      : 0,
    averageSentenceLength: sentences.length ? words.length / sentences.length : 0,
    completedCuePointCount,
    totalCuePointCount: prompt.cuePoints.length,
  }
}

function criterionSummary(label: string, score: number) {
  if (score >= 75) {
    return `${label} is a strength in this practice answer.`
  }

  if (score >= 55) {
    return `${label} is developing, but still needs a cleaner pass.`
  }

  return `${label} needs more control before exam-style pressure.`
}

function buildCriteria(
  prompt: SpeakingPracticePrompt,
  metrics: SpeakingAttemptMetrics
): SpeakingCriterionScore[] {
  const wordTargetRatio = clamp(metrics.wordCount / prompt.targetWords, 0, 1)
  const cueRatio = metrics.totalCuePointCount
    ? metrics.completedCuePointCount / metrics.totalCuePointCount
    : 1
  const sentenceControl =
    metrics.averageSentenceLength >= 7 && metrics.averageSentenceLength <= 24
      ? 1
      : 0.55
  const fluency = Math.round(
    clamp(
      wordTargetRatio * 48 +
        Math.min(metrics.transitionCount, 5) * 8 +
        Math.min(metrics.sentenceCount, 6) * 4 -
        metrics.fillerCount * 4,
      0,
      100
    )
  )
  const lexical = Math.round(
    clamp(metrics.uniqueWordRatio * 72 + metrics.topicVocabularyCount * 9, 0, 100)
  )
  const grammar = Math.round(
    clamp(sentenceControl * 58 + Math.min(metrics.sentenceCount, 6) * 7, 0, 100)
  )
  const task = Math.round(clamp(cueRatio * 72 + wordTargetRatio * 28, 0, 100))

  return [
    {
      id: 'fluency',
      label: 'Fluency and coherence',
      score: fluency,
      summary: criterionSummary('Fluency and coherence', fluency),
    },
    {
      id: 'lexical',
      label: 'Lexical resource',
      score: lexical,
      summary: criterionSummary('Lexical resource', lexical),
    },
    {
      id: 'grammar',
      label: 'Grammar range and control',
      score: grammar,
      summary: criterionSummary('Grammar range and control', grammar),
    },
    {
      id: 'task',
      label: 'Task coverage',
      score: task,
      summary: criterionSummary('Task coverage', task),
    },
  ]
}

function buildNextActions({
  criteria,
  metrics,
  prompt,
}: {
  criteria: SpeakingCriterionScore[]
  metrics: SpeakingAttemptMetrics
  prompt: SpeakingPracticePrompt
}) {
  const actions: string[] = []

  if (metrics.wordCount < prompt.targetWords) {
    actions.push(
      `Extend the answer toward ${prompt.targetWords} words before scoring again.`
    )
  }

  if (metrics.completedCuePointCount < metrics.totalCuePointCount) {
    actions.push('Cover every cue point before moving to follow-up questions.')
  }

  const weakestCriterion = [...criteria].sort((a, b) => a.score - b.score)[0]

  if (weakestCriterion?.score < 75) {
    actions.push(`Run one focused pass for ${weakestCriterion.label.toLowerCase()}.`)
  }

  if (metrics.transitionCount < 3) {
    actions.push('Add natural linking phrases to show sequence, contrast, or cause.')
  }

  return actions.length
    ? actions
    : ['Repeat the same prompt under stricter timing without reading notes.']
}

export function listSpeakingPracticeTopics(
  prompts: SpeakingPracticePrompt[] = speakingPracticePrompts
) {
  return [allTopicsOption, ...new Set(prompts.map((prompt) => prompt.topic))]
}

export function summarizeSpeakingPracticePrompts(
  prompts: SpeakingPracticePrompt[] = speakingPracticePrompts
): SpeakingPracticeSummary {
  const totalSpeakingSeconds = prompts.reduce(
    (total, prompt) => total + prompt.speakingSeconds,
    0
  )

  return {
    totalPrompts: prompts.length,
    guidedPrompts: prompts.filter((prompt) => prompt.difficulty === 'Guided')
      .length,
    balancedPrompts: prompts.filter((prompt) => prompt.difficulty === 'Balanced')
      .length,
    stretchPrompts: prompts.filter((prompt) => prompt.difficulty === 'Stretch')
      .length,
    averageSpeakingSeconds: prompts.length
      ? Math.round(totalSpeakingSeconds / prompts.length)
      : 0,
    topics: new Set(prompts.map((prompt) => prompt.topic)).size,
  }
}

export function filterSpeakingPracticePrompts({
  prompts = speakingPracticePrompts,
  query = '',
  part = 'All',
  difficulty = 'All',
  topic = allTopicsOption,
}: {
  prompts?: SpeakingPracticePrompt[]
  query?: string
  part?: SpeakingPracticePartFilter
  difficulty?: SpeakingPracticeDifficultyFilter
  topic?: string
}) {
  const normalizedQuery = normalizeSearchValue(query)

  return prompts.filter((prompt) => {
    const matchesPart = part === 'All' || prompt.part === part
    const matchesDifficulty =
      difficulty === 'All' || prompt.difficulty === difficulty
    const matchesTopic = topic === allTopicsOption || prompt.topic === topic
    const matchesQuery =
      !normalizedQuery ||
      normalizeSearchValue(searchableText(prompt)).includes(normalizedQuery)

    return matchesPart && matchesDifficulty && matchesTopic && matchesQuery
  })
}

export function parseSpeakingPracticePartFilter(
  value: string | null
): SpeakingPracticePartFilter {
  return value === 'Part 1' || value === 'Part 2' || value === 'Part 3'
    ? value
    : 'All'
}

export function parseSpeakingPracticeDifficultyFilter(
  value: string | null
): SpeakingPracticeDifficultyFilter {
  return value === 'Guided' || value === 'Balanced' || value === 'Stretch'
    ? value
    : 'All'
}

export function parseSpeakingPracticeTopicFilter(
  value: string | null,
  prompts: SpeakingPracticePrompt[] = speakingPracticePrompts
) {
  const topics = listSpeakingPracticeTopics(prompts)

  return value && topics.includes(value) ? value : allTopicsOption
}

export function scoreSpeakingPracticeAttempt(
  payload: unknown,
  prompts: SpeakingPracticePrompt[] = speakingPracticePrompts
): SpeakingPracticeScoreResponse {
  if (!payload || typeof payload !== 'object') {
    return {
      ok: false,
      error: invalidPayloadMessage,
    }
  }

  const {
    completedCuePointIds = [],
    promptId,
    transcript,
  } = payload as Partial<SpeakingAttemptInput>

  if (
    typeof promptId !== 'string' ||
    typeof transcript !== 'string' ||
    !Array.isArray(completedCuePointIds) ||
    !completedCuePointIds.every((cuePointId) => typeof cuePointId === 'string')
  ) {
    return {
      ok: false,
      error: invalidPayloadMessage,
    }
  }

  const prompt = prompts.find((candidate) => candidate.id === promptId)

  if (!prompt) {
    return {
      ok: false,
      error: unknownPromptMessage,
    }
  }

  const metrics = getMetrics({
    completedCuePointIds,
    prompt,
    transcript,
  })
  const criteria = buildCriteria(prompt, metrics)
  const readinessScore = Math.round(
    criteria.reduce((total, criterion) => total + criterion.score, 0) /
      criteria.length
  )
  const status = statusFromScore(readinessScore)
  const estimatedBand = roundToHalfBand(
    clamp(4 + (readinessScore / 100) * 4.5, 4, 8.5)
  )

  return {
    ok: true,
    score: {
      promptId: prompt.id,
      promptTitle: prompt.title,
      part: prompt.part,
      topic: prompt.topic,
      difficulty: prompt.difficulty,
      status,
      statusLabel: statusLabel(status),
      estimatedBand,
      readinessScore,
      summary:
        status === 'strong-control'
          ? 'This answer is controlled enough to repeat under stricter timing.'
          : status === 'building-control'
            ? 'This answer has a usable base, but one or two speaking criteria need a focused pass.'
            : 'This answer needs more structure and coverage before exam-style pressure.',
      metrics,
      criteria,
      nextActions: buildNextActions({
        criteria,
        metrics,
        prompt,
      }),
    },
  }
}
