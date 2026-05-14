import type { WritingPrompt } from './writing-prompts'

export type WritingMistakeCriterion =
  | 'Task Achievement'
  | 'Task Response'
  | 'Coherence and Cohesion'
  | 'Lexical Resource'
  | 'Grammatical Range and Accuracy'

export type MistakeTaxonomyTaskFilter = 'All' | WritingPrompt['taskType']

export type MistakeTaxonomyCriterionFilter = 'All' | WritingMistakeCriterion

export type WritingMistakeTaxonomyItem = {
  code: string
  criterion: WritingMistakeCriterion
  applicableTaskTypes: WritingPrompt['taskType'][]
  label: string
  description: string
  bandRisk: string
  revisionHint: string
  examplePattern: string
  practiceDrill: string
  keywords: string[]
}

export type MistakeTaxonomySummary = {
  totalItems: number
  taskOneItems: number
  taskTwoItems: number
  criteriaCovered: number
  drills: number
}

export const mistakeTaxonomyCriteria: WritingMistakeCriterion[] = [
  'Task Achievement',
  'Task Response',
  'Coherence and Cohesion',
  'Lexical Resource',
  'Grammatical Range and Accuracy',
]

export const writingMistakeTaxonomy: WritingMistakeTaxonomyItem[] = [
  {
    code: 'task1-missing-overview',
    criterion: 'Task Achievement',
    applicableTaskTypes: ['Task 1'],
    label: 'Missing or vague overview',
    description:
      'The report does not clearly summarize the main trend, stage, contrast, or endpoint before details begin.',
    bandRisk:
      'Task 1 answers without a clear overview often struggle to move beyond a mid-band response.',
    revisionHint:
      'Write one overview sentence that names the biggest pattern before adding figures or stage details.',
    examplePattern:
      'The answer lists figures immediately and never says what changed most overall.',
    practiceDrill:
      'Look at a Task 1 prompt and write only the overview sentence in under three minutes.',
    keywords: ['main feature', 'overall', 'overview', 'trend', 'stage', 'pattern'],
  },
  {
    code: 'task1-detail-dump',
    criterion: 'Task Achievement',
    applicableTaskTypes: ['Task 1'],
    label: 'Detail dump without grouping',
    description:
      'The response reports too many individual numbers or stages instead of grouping details around a pattern.',
    bandRisk:
      'Over-reporting makes the examiner work too hard to identify the most important information.',
    revisionHint:
      'Choose two useful groups, then support each group with only the strongest figures or stages.',
    examplePattern:
      'Every number in the chart is mentioned, but the comparisons are not organized.',
    practiceDrill:
      'Underline the two details that best support the overview and delete the rest from your plan.',
    keywords: ['data', 'detail', 'figure', 'figures', 'group', 'numbers', 'select'],
  },
  {
    code: 'unclear-position',
    criterion: 'Task Response',
    applicableTaskTypes: ['Task 2'],
    label: 'Unclear essay position',
    description:
      'The essay needs a sharper main answer, position, or final judgement.',
    bandRisk:
      'A shifting or hidden position weakens Task Response even when the ideas are relevant.',
    revisionHint:
      'Rewrite the introduction or conclusion so the examiner can identify the main answer in one sentence.',
    examplePattern:
      'The introduction gives background but does not clearly answer the prompt.',
    practiceDrill:
      'Write three direct thesis sentences for the same prompt, then pick the clearest one.',
    keywords: [
      'answer',
      'conclusion',
      'judgement',
      'main idea',
      'opinion',
      'position',
      'thesis',
    ],
  },
  {
    code: 'underdeveloped-support',
    criterion: 'Task Response',
    applicableTaskTypes: ['Task 2'],
    label: 'Underdeveloped supporting ideas',
    description:
      'Main points are present, but the explanation, evidence, or example is not strong enough yet.',
    bandRisk:
      'Relevant ideas can still feel low-band if the body paragraph stops before explaining why they matter.',
    revisionHint:
      'Add one concrete example and one cause-and-effect explanation to the weakest body paragraph.',
    examplePattern:
      'A paragraph states a claim but stops before explaining why it matters.',
    practiceDrill:
      'Take one topic sentence and add because, for example, and this means as three follow-up lines.',
    keywords: [
      'concrete',
      'develop',
      'development',
      'evidence',
      'example',
      'explanation',
      'reasoning',
      'specific',
      'support',
    ],
  },
  {
    code: 'weak-organization',
    criterion: 'Coherence and Cohesion',
    applicableTaskTypes: ['Task 1', 'Task 2'],
    label: 'Weak paragraph organization',
    description:
      'The reader journey needs clearer grouping, paragraph boundaries, or logical sequencing.',
    bandRisk:
      'Weak organization makes otherwise useful ideas feel scattered and harder to credit.',
    revisionHint:
      'Rebuild the draft around one purpose per paragraph, then add linking language only where the logic changes.',
    examplePattern:
      'Ideas are relevant, but the paragraph order makes the argument harder to follow.',
    practiceDrill:
      'Label each paragraph with one job: overview, first group, second group, argument, counterpoint, or conclusion.',
    keywords: [
      'boundary',
      'coherence',
      'connect',
      'flow',
      'group',
      'organization',
      'paragraph',
      'stage',
      'structure',
    ],
  },
  {
    code: 'mechanical-cohesion',
    criterion: 'Coherence and Cohesion',
    applicableTaskTypes: ['Task 1', 'Task 2'],
    label: 'Mechanical linking language',
    description:
      'The draft uses connectors in a visible or repetitive way instead of making relationships naturally clear.',
    bandRisk:
      'Too much signposting can make a response sound memorized even when the structure is logical.',
    revisionHint:
      'Keep only the connectors that show a real contrast, result, sequence, or example.',
    examplePattern:
      'The paragraph starts every sentence with a connector such as moreover or furthermore.',
    practiceDrill:
      'Remove half of the linking phrases, then check whether the paragraph still reads logically.',
    keywords: ['connector', 'connectors', 'furthermore', 'link', 'linking', 'moreover', 'transition'],
  },
  {
    code: 'repetitive-vocabulary',
    criterion: 'Lexical Resource',
    applicableTaskTypes: ['Task 1', 'Task 2'],
    label: 'Repetitive or imprecise vocabulary',
    description:
      'The draft relies too much on repeated wording or broad vocabulary instead of precise phrasing.',
    bandRisk:
      'Vocabulary repetition limits range and can hide the exact meaning of the idea.',
    revisionHint:
      'Replace repeated nouns, verbs, and topic words with accurate paraphrases or collocations.',
    examplePattern:
      'The same topic word appears several times in one paragraph without useful variation.',
    practiceDrill:
      'Circle one repeated noun, verb, and adjective, then replace each with one accurate alternative.',
    keywords: [
      'collocation',
      'lexical',
      'paraphrase',
      'paraphrasing',
      'precise',
      'repeat',
      'repeated',
      'repetition',
      'vocabulary',
      'wording',
    ],
  },
  {
    code: 'sentence-control',
    criterion: 'Grammatical Range and Accuracy',
    applicableTaskTypes: ['Task 1', 'Task 2'],
    label: 'Sentence control and grammar range',
    description:
      'The draft needs better sentence variety, accuracy, or control over complex grammar.',
    bandRisk:
      "Grammar errors become more costly when they interrupt the examiner's reading flow.",
    revisionHint:
      'Combine short sentences only when the relationship is clear, then check punctuation and verb control.',
    examplePattern:
      'Several short sentences could become one controlled complex sentence.',
    practiceDrill:
      'Rewrite two simple sentences as one because, although, or which sentence without changing the meaning.',
    keywords: [
      'accuracy',
      'combine',
      'complex',
      'grammar',
      'grammatical',
      'punctuation',
      'sentence',
      'sentences',
      'variety',
    ],
  },
]

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase()
}

function searchableText(item: WritingMistakeTaxonomyItem) {
  return [
    item.code,
    item.criterion,
    item.label,
    item.description,
    item.bandRisk,
    item.revisionHint,
    item.examplePattern,
    item.practiceDrill,
    ...item.keywords,
  ].join(' ')
}

export function filterMistakeTaxonomy({
  items = writingMistakeTaxonomy,
  query = '',
  taskType = 'All',
  criterion = 'All',
}: {
  items?: WritingMistakeTaxonomyItem[]
  query?: string
  taskType?: MistakeTaxonomyTaskFilter
  criterion?: MistakeTaxonomyCriterionFilter
}) {
  const normalizedQuery = normalizeSearchValue(query)

  return items.filter((item) => {
    const matchesTask =
      taskType === 'All' || item.applicableTaskTypes.includes(taskType)
    const matchesCriterion = criterion === 'All' || item.criterion === criterion
    const matchesQuery =
      !normalizedQuery ||
      normalizeSearchValue(searchableText(item)).includes(normalizedQuery)

    return matchesTask && matchesCriterion && matchesQuery
  })
}

export function summarizeMistakeTaxonomy(
  items: WritingMistakeTaxonomyItem[] = writingMistakeTaxonomy
): MistakeTaxonomySummary {
  return {
    totalItems: items.length,
    taskOneItems: items.filter((item) =>
      item.applicableTaskTypes.includes('Task 1')
    ).length,
    taskTwoItems: items.filter((item) =>
      item.applicableTaskTypes.includes('Task 2')
    ).length,
    criteriaCovered: new Set(items.map((item) => item.criterion)).size,
    drills: items.filter((item) => item.practiceDrill).length,
  }
}

export function parseMistakeTaxonomyTaskFilter(
  value: string | null
): MistakeTaxonomyTaskFilter {
  return value === 'Task 1' || value === 'Task 2' ? value : 'All'
}

export function parseMistakeTaxonomyCriterionFilter(
  value: string | null
): MistakeTaxonomyCriterionFilter {
  return mistakeTaxonomyCriteria.includes(value as WritingMistakeCriterion)
    ? (value as WritingMistakeCriterion)
    : 'All'
}
