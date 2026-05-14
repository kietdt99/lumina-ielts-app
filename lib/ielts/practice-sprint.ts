import {
  ideaBankEntries,
  type IdeaBankEntry,
} from './idea-bank'
import {
  createWritingOutline,
  findBestIdeaBankEntry,
  type WritingOutline,
} from './outline-builder'
import {
  modelFragments,
  type ModelFragment,
} from './model-fragments'
import {
  findRevisionChecklistItems,
  type RevisionChecklistItem,
} from './revision-checklist'
import {
  filterVocabularyBuilderCards,
  type VocabularyBuilderCard,
} from './vocabulary-builder'
import {
  writingPrompts,
  type WritingPrompt,
} from './writing-prompts'

export type PracticeSprintTaskFilter = 'All' | WritingPrompt['taskType']

export type PracticeSprintDifficultyFilter = 'All' | WritingPrompt['difficulty']

export type PracticeSprintStage = {
  id: string
  label: string
  durationMinutes: number
  goal: string
  action: string
}

export type PracticeSprint = {
  id: string
  promptId: string
  promptTitle: string
  promptBrief: string
  taskType: WritingPrompt['taskType']
  topic: string
  difficulty: WritingPrompt['difficulty']
  totalMinutes: number
  wordTarget: number
  headline: string
  summary: string
  ideaBankTopic: string
  thesisFrame: string
  outlineBlocks: WritingOutline['blocks']
  stages: PracticeSprintStage[]
  vocabularyCards: VocabularyBuilderCard[]
  modelFragments: ModelFragment[]
  revisionFocus: RevisionChecklistItem[]
}

export type PracticeSprintSummary = {
  totalSprints: number
  taskOneSprints: number
  taskTwoSprints: number
  guidedSprints: number
  balancedSprints: number
  stretchSprints: number
  averageMinutes: number
}

const allTopicsOption = 'All topics'

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase()
}

function tokenize(value: string) {
  return normalizeSearchValue(value)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 4)
}

function tokenMatches(left: string, right: string) {
  return left === right || left.startsWith(right) || right.startsWith(left)
}

function buildStagePlan(prompt: WritingPrompt): PracticeSprintStage[] {
  const planningMinutes = prompt.taskType === 'Task 1' ? 5 : 8
  const reviewMinutes = prompt.taskType === 'Task 1' ? 5 : 7

  return [
    {
      id: 'warm-up',
      label: 'Warm up vocabulary',
      durationMinutes: 5,
      goal: 'Activate useful topic language before the blank page appears.',
      action:
        'Recall three vocabulary cards and write one original sentence for each.',
    },
    {
      id: 'plan',
      label: 'Plan the response',
      durationMinutes: planningMinutes,
      goal:
        prompt.taskType === 'Task 1'
          ? 'Lock the overview and detail groups before drafting.'
          : 'Lock the position, body paragraph jobs, and counterpoint before drafting.',
      action:
        'Use the outline blocks to decide the role of each paragraph before the timer starts.',
    },
    {
      id: 'draft',
      label: 'Timed draft',
      durationMinutes: prompt.durationMinutes,
      goal: `Write at least ${prompt.minimumWords} words under exam-style pressure.`,
      action:
        'Open the writing workspace with the outline loaded and draft the response in order.',
    },
    {
      id: 'self-check',
      label: 'Self-check pass',
      durationMinutes: reviewMinutes,
      goal: 'Catch the highest-risk band blockers before requesting feedback.',
      action:
        'Apply the revision focus cards, then generate practice feedback when the draft is ready.',
    },
  ]
}

function scoreModelFragment(prompt: WritingPrompt, fragment: ModelFragment) {
  if (!fragment.taskTypes.includes(prompt.taskType)) {
    return -1
  }

  const promptTokens = tokenize(`${prompt.title} ${prompt.topic} ${prompt.brief}`)
  const fragmentTokens = tokenize(
    [
      fragment.topic,
      fragment.title,
      fragment.functionType,
      fragment.fragment,
      fragment.whyItWorks,
      ...fragment.tags,
    ].join(' ')
  )
  const topicBonus =
    normalizeSearchValue(prompt.topic) === normalizeSearchValue(fragment.topic)
      ? 8
      : 0
  const tokenScore = promptTokens.reduce(
    (score, promptToken) =>
      score +
      (fragmentTokens.some((fragmentToken) =>
        tokenMatches(promptToken, fragmentToken)
      )
        ? 1
        : 0),
    0
  )

  return topicBonus + tokenScore
}

function selectModelFragments(prompt: WritingPrompt) {
  return [...modelFragments]
    .map((fragment) => ({
      fragment,
      score: scoreModelFragment(prompt, fragment),
    }))
    .filter((match) => match.score >= 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.fragment.functionType.localeCompare(right.fragment.functionType) ||
        left.fragment.title.localeCompare(right.fragment.title)
    )
    .map((match) => match.fragment)
    .slice(0, 2)
}

function selectVocabularyCards(
  prompt: WritingPrompt,
  ideaBankEntry: IdeaBankEntry | null
) {
  const topicCards = ideaBankEntry
    ? filterVocabularyBuilderCards({
        taskType: prompt.taskType,
        topic: ideaBankEntry.topic,
      })
    : []

  if (topicCards.length >= 4) {
    return topicCards.slice(0, 4)
  }

  return filterVocabularyBuilderCards({
    taskType: prompt.taskType,
    query: prompt.topic,
  }).slice(0, 4)
}

function searchableText(sprint: PracticeSprint) {
  return [
    sprint.promptTitle,
    sprint.promptBrief,
    sprint.taskType,
    sprint.topic,
    sprint.difficulty,
    sprint.ideaBankTopic,
    sprint.thesisFrame,
    ...sprint.vocabularyCards.map((card) => card.term),
    ...sprint.modelFragments.map((fragment) => fragment.title),
    ...sprint.revisionFocus.map((item) => item.title),
  ].join(' ')
}

export function createPracticeSprint(
  prompt: WritingPrompt,
  entries: IdeaBankEntry[] = ideaBankEntries
): PracticeSprint {
  const ideaBankEntry = findBestIdeaBankEntry(prompt, entries)
  const outline = createWritingOutline(prompt, entries)
  const stages = buildStagePlan(prompt)
  const totalMinutes = stages.reduce(
    (total, stage) => total + stage.durationMinutes,
    0
  )
  const revisionFocus = findRevisionChecklistItems({
    taskType: prompt.taskType,
    text: [
      prompt.title,
      prompt.brief,
      prompt.topic,
      ...prompt.instructions,
      ...prompt.planningChecklist,
    ].join(' '),
    limit: 3,
  })

  return {
    id: `sprint-${prompt.id}`,
    promptId: prompt.id,
    promptTitle: prompt.title,
    promptBrief: prompt.brief,
    taskType: prompt.taskType,
    topic: prompt.topic,
    difficulty: prompt.difficulty,
    totalMinutes,
    wordTarget: prompt.minimumWords,
    headline:
      prompt.taskType === 'Task 1'
        ? `Complete a ${totalMinutes}-minute Task 1 sprint`
        : `Complete a ${totalMinutes}-minute Task 2 sprint`,
    summary: `Warm up, plan, draft, and self-check ${prompt.title.toLowerCase()} with supporting learning content already attached.`,
    ideaBankTopic: ideaBankEntry?.topic ?? outline.ideaBankTopic,
    thesisFrame: outline.thesisFrame,
    outlineBlocks: outline.blocks,
    stages,
    vocabularyCards: selectVocabularyCards(prompt, ideaBankEntry),
    modelFragments: selectModelFragments(prompt),
    revisionFocus,
  }
}

export function createPracticeSprints(
  prompts: WritingPrompt[] = writingPrompts,
  entries: IdeaBankEntry[] = ideaBankEntries
) {
  return prompts.map((prompt) => createPracticeSprint(prompt, entries))
}

export const practiceSprints = createPracticeSprints()

export function listPracticeSprintTopics(
  sprints: PracticeSprint[] = practiceSprints
) {
  return [allTopicsOption, ...new Set(sprints.map((sprint) => sprint.topic))]
}

export function filterPracticeSprints({
  sprints = practiceSprints,
  query = '',
  taskType = 'All',
  difficulty = 'All',
  topic = allTopicsOption,
}: {
  sprints?: PracticeSprint[]
  query?: string
  taskType?: PracticeSprintTaskFilter
  difficulty?: PracticeSprintDifficultyFilter
  topic?: string
}) {
  const normalizedQuery = normalizeSearchValue(query)

  return sprints.filter((sprint) => {
    const matchesTask = taskType === 'All' || sprint.taskType === taskType
    const matchesDifficulty =
      difficulty === 'All' || sprint.difficulty === difficulty
    const matchesTopic = topic === allTopicsOption || sprint.topic === topic
    const matchesQuery =
      !normalizedQuery ||
      normalizeSearchValue(searchableText(sprint)).includes(normalizedQuery)

    return matchesTask && matchesDifficulty && matchesTopic && matchesQuery
  })
}

export function summarizePracticeSprints(
  sprints: PracticeSprint[] = practiceSprints
): PracticeSprintSummary {
  const totalMinutes = sprints.reduce(
    (total, sprint) => total + sprint.totalMinutes,
    0
  )

  return {
    totalSprints: sprints.length,
    taskOneSprints: sprints.filter((sprint) => sprint.taskType === 'Task 1')
      .length,
    taskTwoSprints: sprints.filter((sprint) => sprint.taskType === 'Task 2')
      .length,
    guidedSprints: sprints.filter((sprint) => sprint.difficulty === 'Guided')
      .length,
    balancedSprints: sprints.filter((sprint) => sprint.difficulty === 'Balanced')
      .length,
    stretchSprints: sprints.filter((sprint) => sprint.difficulty === 'Stretch')
      .length,
    averageMinutes: sprints.length ? Math.round(totalMinutes / sprints.length) : 0,
  }
}

export function parsePracticeSprintTaskFilter(
  value: string | null
): PracticeSprintTaskFilter {
  return value === 'Task 1' || value === 'Task 2' ? value : 'All'
}

export function parsePracticeSprintDifficultyFilter(
  value: string | null
): PracticeSprintDifficultyFilter {
  return value === 'Guided' || value === 'Balanced' || value === 'Stretch'
    ? value
    : 'All'
}

export function parsePracticeSprintTopicFilter(
  value: string | null,
  sprints: PracticeSprint[] = practiceSprints
) {
  const topics = listPracticeSprintTopics(sprints)

  return value && topics.includes(value) ? value : allTopicsOption
}
