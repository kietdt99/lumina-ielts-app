import type { WritingPrompt } from './writing-prompts'

export type RevisionChecklistPriority = 'High' | 'Medium' | 'Low'

export type RevisionChecklistCriterion =
  | 'Task Achievement'
  | 'Task Response'
  | 'Coherence and Cohesion'
  | 'Lexical Resource'
  | 'Grammatical Range and Accuracy'

export type RevisionChecklistItem = {
  id: string
  taskTypes: Array<WritingPrompt['taskType']>
  criterion: RevisionChecklistCriterion
  title: string
  instruction: string
  successSignal: string
  priorityLevel: RevisionChecklistPriority
  keywords: string[]
}

export type RevisionChecklistSummary = {
  totalItems: number
  taskOneItems: number
  taskTwoItems: number
  highPriorityItems: number
}

type ChecklistMatchInput = {
  taskType: WritingPrompt['taskType']
  text: string
  limit?: number
}

const priorityRank: Record<RevisionChecklistPriority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
}

export const revisionChecklistItems: RevisionChecklistItem[] = [
  {
    id: 'task1-overview-sentence',
    taskTypes: ['Task 1'],
    criterion: 'Task Achievement',
    title: 'Rewrite the overview sentence',
    instruction:
      'Write one sentence that names the start-to-end pattern, biggest change, or main comparison before adding details.',
    successSignal:
      'The overview can stand alone and does not include personal opinion or minor details.',
    priorityLevel: 'High',
    keywords: ['overview', 'main feature', 'pattern', 'stage', 'detail', 'summarize'],
  },
  {
    id: 'task2-direct-position',
    taskTypes: ['Task 2'],
    criterion: 'Task Response',
    title: 'Make the position unmistakable',
    instruction:
      'Rewrite the thesis so it gives one direct answer to the question and previews the main reason.',
    successSignal:
      'A reader can underline your position in the introduction without guessing.',
    priorityLevel: 'High',
    keywords: ['position', 'thesis', 'opinion', 'answer', 'judgement', 'introduction'],
  },
  {
    id: 'support-specific-example',
    taskTypes: ['Task 1', 'Task 2'],
    criterion: 'Task Response',
    title: 'Add one concrete support move',
    instruction:
      'Choose the weakest body paragraph and add one specific example, comparison, cause, or result.',
    successSignal:
      'The paragraph explains why the point matters instead of only naming the point.',
    priorityLevel: 'High',
    keywords: ['example', 'support', 'evidence', 'develop', 'development', 'specific'],
  },
  {
    id: 'paragraph-one-job',
    taskTypes: ['Task 1', 'Task 2'],
    criterion: 'Coherence and Cohesion',
    title: 'Give each paragraph one job',
    instruction:
      'Label the purpose of each paragraph, then remove or move any sentence that does not fit that purpose.',
    successSignal:
      'Every paragraph has one controlling idea and the paragraph order feels easy to follow.',
    priorityLevel: 'Medium',
    keywords: ['paragraph', 'structure', 'organization', 'group', 'boundary', 'flow'],
  },
  {
    id: 'linking-audit',
    taskTypes: ['Task 1', 'Task 2'],
    criterion: 'Coherence and Cohesion',
    title: 'Audit linking words',
    instruction:
      'Add connectors only where the logic changes, and remove repeated connectors that do not add meaning.',
    successSignal:
      'The draft shows contrast, sequence, or cause naturally without sounding mechanical.',
    priorityLevel: 'Medium',
    keywords: ['link', 'transition', 'connect', 'cohesion', 'sequence', 'contrast'],
  },
  {
    id: 'vocabulary-replacement-pass',
    taskTypes: ['Task 1', 'Task 2'],
    criterion: 'Lexical Resource',
    title: 'Replace repeated topic words',
    instruction:
      'Circle repeated nouns and verbs, then replace only the ones that have accurate topic-specific alternatives.',
    successSignal:
      'The final draft uses precise wording without forced advanced vocabulary.',
    priorityLevel: 'Medium',
    keywords: ['vocabulary', 'lexical', 'repeat', 'repeated', 'paraphrase', 'collocation'],
  },
  {
    id: 'sentence-boundary-pass',
    taskTypes: ['Task 1', 'Task 2'],
    criterion: 'Grammatical Range and Accuracy',
    title: 'Repair sentence boundaries',
    instruction:
      'Find run-ons, fragments, and overlong sentences, then split or combine them with controlled punctuation.',
    successSignal:
      'Each sentence has a clear subject, verb, and punctuation boundary.',
    priorityLevel: 'High',
    keywords: ['grammar', 'sentence', 'sentences', 'punctuation', 'accuracy', 'complex'],
  },
  {
    id: 'task1-data-grouping',
    taskTypes: ['Task 1'],
    criterion: 'Task Achievement',
    title: 'Group details by pattern',
    instruction:
      'Put related stages, figures, or changes together instead of describing every point in isolation.',
    successSignal:
      'The detail paragraphs support the overview and avoid listing every minor detail.',
    priorityLevel: 'Medium',
    keywords: ['group', 'stage', 'process', 'figure', 'comparison', 'details'],
  },
  {
    id: 'task2-counterpoint-control',
    taskTypes: ['Task 2'],
    criterion: 'Task Response',
    title: 'Control the counterpoint',
    instruction:
      'If you mention the other side, explain it briefly and then return to your main position.',
    successSignal:
      'The essay stays balanced without weakening or changing your final answer.',
    priorityLevel: 'Low',
    keywords: ['counterpoint', 'however', 'both views', 'balanced', 'opposing', 'contrast'],
  },
]

function normalizeText(value: string) {
  return value.toLowerCase()
}

function keywordScore(item: RevisionChecklistItem, text: string) {
  return item.keywords.reduce(
    (score, keyword) => score + (text.includes(keyword) ? 1 : 0),
    0
  )
}

function appliesToTask(item: RevisionChecklistItem, taskType: WritingPrompt['taskType']) {
  return item.taskTypes.includes(taskType)
}

export function findRevisionChecklistItems({
  taskType,
  text,
  limit = 3,
}: ChecklistMatchInput) {
  const normalizedText = normalizeText(text)
  const taskItems = revisionChecklistItems.filter((item) =>
    appliesToTask(item, taskType)
  )
  const matchedItems = taskItems
    .map((item) => ({
      item,
      score: keywordScore(item, normalizedText),
    }))
    .filter((match) => match.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        priorityRank[right.item.priorityLevel] -
          priorityRank[left.item.priorityLevel] ||
        left.item.title.localeCompare(right.item.title)
    )
    .map((match) => match.item)

  if (matchedItems.length >= limit) {
    return matchedItems.slice(0, limit)
  }

  const fallbackItems = taskItems
    .filter((item) => !matchedItems.some((match) => match.id === item.id))
    .sort(
      (left, right) =>
        priorityRank[right.priorityLevel] - priorityRank[left.priorityLevel] ||
        left.title.localeCompare(right.title)
    )

  return [...matchedItems, ...fallbackItems].slice(0, limit)
}

export function summarizeRevisionChecklist(
  items: RevisionChecklistItem[] = revisionChecklistItems
): RevisionChecklistSummary {
  return {
    totalItems: items.length,
    taskOneItems: items.filter((item) => item.taskTypes.includes('Task 1')).length,
    taskTwoItems: items.filter((item) => item.taskTypes.includes('Task 2')).length,
    highPriorityItems: items.filter((item) => item.priorityLevel === 'High').length,
  }
}
