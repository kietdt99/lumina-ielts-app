import {
  ideaBankEntries,
  type IdeaBankEntry,
} from './idea-bank'
import type { WritingPrompt } from './writing-prompts'

export type WritingOutlineBlock = {
  id: string
  label: string
  purpose: string
  sentenceFrame: string
  checkpoints: string[]
}

export type WritingOutline = {
  promptId: string
  promptTitle: string
  taskType: WritingPrompt['taskType']
  topic: string
  headline: string
  summary: string
  ideaBankTopic: string
  thesisFrame: string
  blocks: WritingOutlineBlock[]
  vocabulary: string[]
  collocations: string[]
  contrastPairs: string[]
  planningChecklist: string[]
  nextDraftPrompt: string
}

const defaultVocabulary = [
  'clear position',
  'main feature',
  'supporting detail',
  'logical progression',
]

const defaultCollocations = [
  'state a clear answer',
  'support the main point',
  'group related details',
  'check sentence control',
]

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
}

function tokenize(value: string) {
  return normalize(value)
    .split(/\s+/)
    .filter((token) => token.length >= 4)
}

function tokenMatches(left: string, right: string) {
  return left === right || left.startsWith(right) || right.startsWith(left)
}

function scoreIdeaBankEntry(prompt: WritingPrompt, entry: IdeaBankEntry) {
  if (!entry.taskTypes.includes(prompt.taskType)) {
    return -1
  }

  const promptTokens = tokenize(`${prompt.title} ${prompt.topic} ${prompt.brief}`)
  const entryTokens = tokenize(
    [
      entry.topic,
      entry.description,
      ...entry.commonQuestions,
      ...entry.usefulVocabulary,
      ...entry.collocations,
      ...entry.ideaStarters,
      ...entry.contrastPairs,
    ].join(' ')
  )
  const exactTopicBonus =
    normalize(prompt.topic).trim() === normalize(entry.topic).trim() ? 8 : 0
  const tokenScore = promptTokens.reduce(
    (score, promptToken) =>
      score +
      (entryTokens.some((entryToken) => tokenMatches(promptToken, entryToken))
        ? 1
        : 0),
    0
  )

  return exactTopicBonus + tokenScore
}

export function findBestIdeaBankEntry(
  prompt: WritingPrompt,
  entries: IdeaBankEntry[] = ideaBankEntries
) {
  return (
    [...entries]
      .sort(
        (left, right) =>
          scoreIdeaBankEntry(prompt, right) - scoreIdeaBankEntry(prompt, left)
      )
      .find((entry) => scoreIdeaBankEntry(prompt, entry) >= 0) ?? null
  )
}

function buildTaskTwoBlocks(
  prompt: WritingPrompt,
  ideaBankEntry: IdeaBankEntry | null
): WritingOutlineBlock[] {
  const firstIdea =
    ideaBankEntry?.ideaStarters[0] ??
    'The first main point should explain the strongest reason clearly.'
  const secondIdea =
    ideaBankEntry?.ideaStarters[1] ??
    'The second main point should acknowledge the other side or add a contrasting reason.'
  const firstContrast =
    ideaBankEntry?.contrastPairs[0] ?? 'main advantage versus possible limitation'

  return [
    {
      id: 'introduction',
      label: 'Introduction',
      purpose: 'Paraphrase the question and give a direct position.',
      sentenceFrame: `This essay will argue that ${prompt.topic.toLowerCase()} should be judged through ${firstContrast}.`,
      checkpoints: [
        'Paraphrase the prompt without copying long phrases.',
        'State your overall judgement before the body paragraphs.',
      ],
    },
    {
      id: 'body-1',
      label: 'Body paragraph 1',
      purpose: 'Develop the strongest supporting reason.',
      sentenceFrame: firstIdea,
      checkpoints: [
        'Open with one clear topic sentence.',
        'Add one concrete example and explain the impact.',
      ],
    },
    {
      id: 'body-2',
      label: 'Body paragraph 2',
      purpose: 'Add balance, contrast, or the second major reason.',
      sentenceFrame: secondIdea,
      checkpoints: [
        'Use a linking phrase to show contrast or progression.',
        'Keep the paragraph focused on one controlling idea.',
      ],
    },
    {
      id: 'conclusion',
      label: 'Conclusion',
      purpose: 'Confirm the final answer in one compact paragraph.',
      sentenceFrame:
        'Overall, the stronger view is that the benefits are meaningful when the main risks are managed carefully.',
      checkpoints: [
        'Do not introduce a new reason.',
        'Echo the position using different wording from the introduction.',
      ],
    },
  ]
}

function buildTaskOneBlocks(
  prompt: WritingPrompt,
  ideaBankEntry: IdeaBankEntry | null
): WritingOutlineBlock[] {
  const firstCollocation =
    ideaBankEntry?.collocations[0] ?? 'summarize the most important change'
  const secondCollocation =
    ideaBankEntry?.collocations[1] ?? 'group related details logically'

  return [
    {
      id: 'introduction',
      label: 'Introduction',
      purpose: 'Paraphrase what the visual information shows.',
      sentenceFrame: `The diagram or data illustrates ${prompt.topic.toLowerCase()} and the main stages or changes involved.`,
      checkpoints: [
        'Keep this sentence factual and neutral.',
        'Do not include detailed numbers or minor steps yet.',
      ],
    },
    {
      id: 'overview',
      label: 'Overview',
      purpose: 'Summarize the main pattern before details.',
      sentenceFrame: `Overall, the clearest feature is how the process or trend moves through several connected stages to ${firstCollocation}.`,
      checkpoints: [
        'Mention the start and end point or the largest overall change.',
        'Avoid listing every detail in the overview.',
      ],
    },
    {
      id: 'detail-group-1',
      label: 'Detail group 1',
      purpose: 'Describe the first logical group of stages or figures.',
      sentenceFrame: `In the first stage, the response should ${secondCollocation} while using precise sequencing language.`,
      checkpoints: [
        'Group related stages instead of describing isolated points.',
        'Use passive voice where the process requires it.',
      ],
    },
    {
      id: 'detail-group-2',
      label: 'Detail group 2',
      purpose: 'Describe the remaining stages or contrasting figures.',
      sentenceFrame:
        'The later details should complete the process or comparison without repeating the overview.',
      checkpoints: [
        'Compare only details that help the reader understand the main pattern.',
        'Check tense consistency before moving to drafting.',
      ],
    },
  ]
}

function buildThesisFrame(
  prompt: WritingPrompt,
  ideaBankEntry: IdeaBankEntry | null
) {
  if (prompt.taskType === 'Task 1') {
    return `Overall, ${prompt.topic.toLowerCase()} should be summarized by grouping the main stages and highlighting the clearest overall pattern.`
  }

  const contrast = ideaBankEntry?.contrastPairs[0] ?? 'benefits versus risks'
  return `Although ${contrast} both matter, my view is that the stronger argument depends on clear evidence and practical impact.`
}

export function createWritingOutline(
  prompt: WritingPrompt,
  entries: IdeaBankEntry[] = ideaBankEntries
): WritingOutline {
  const ideaBankEntry = findBestIdeaBankEntry(prompt, entries)
  const blocks =
    prompt.taskType === 'Task 1'
      ? buildTaskOneBlocks(prompt, ideaBankEntry)
      : buildTaskTwoBlocks(prompt, ideaBankEntry)
  const vocabulary = ideaBankEntry?.usefulVocabulary.slice(0, 5) ?? defaultVocabulary
  const collocations = ideaBankEntry?.collocations.slice(0, 4) ?? defaultCollocations
  const contrastPairs = ideaBankEntry?.contrastPairs.slice(0, 3) ?? []

  return {
    promptId: prompt.id,
    promptTitle: prompt.title,
    taskType: prompt.taskType,
    topic: prompt.topic,
    headline:
      prompt.taskType === 'Task 1'
        ? `Plan a clear ${prompt.taskType} response`
        : `Plan a focused ${prompt.taskType} argument`,
    summary: `Use this outline to organize ${prompt.title.toLowerCase()} before opening the timed writing workspace.`,
    ideaBankTopic: ideaBankEntry?.topic ?? 'General IELTS writing',
    thesisFrame: buildThesisFrame(prompt, ideaBankEntry),
    blocks,
    vocabulary,
    collocations,
    contrastPairs,
    planningChecklist: prompt.planningChecklist,
    nextDraftPrompt: `Open ${prompt.title} in the writing workspace, then draft each block in order before requesting feedback.`,
  }
}

export function createOutlineLibrary(
  prompts: WritingPrompt[],
  entries: IdeaBankEntry[] = ideaBankEntries
) {
  return prompts.map((prompt) => createWritingOutline(prompt, entries))
}
