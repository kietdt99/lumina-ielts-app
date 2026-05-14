import type { WritingPrompt } from './writing-prompts'

export type ModelFragmentTaskFilter = 'All' | WritingPrompt['taskType']

export type ModelFragmentFunction =
  | 'Introduction'
  | 'Overview'
  | 'Body development'
  | 'Detail grouping'
  | 'Conclusion'

export type ModelFragmentFunctionFilter = 'All' | ModelFragmentFunction

export type ModelFragment = {
  id: string
  taskTypes: WritingPrompt['taskType'][]
  functionType: ModelFragmentFunction
  topic: string
  title: string
  fragment: string
  whyItWorks: string
  usageNotes: string[]
  avoidCopying: string
  tags: string[]
}

export type ModelFragmentSummary = {
  totalFragments: number
  taskOneFragments: number
  taskTwoFragments: number
  functionTypes: number
}

export const modelFragments: ModelFragment[] = [
  {
    id: 'task2-balanced-introduction',
    taskTypes: ['Task 2'],
    functionType: 'Introduction',
    topic: 'Work and society',
    title: 'Balanced opinion introduction',
    fragment:
      'While office-based work can support collaboration and training, I believe remote work can be more productive when employees have clear goals and reliable communication routines.',
    whyItWorks:
      'It acknowledges both sides, gives a direct position, and previews the condition that will control the essay.',
    usageNotes: [
      'Use the while-clause to show balance without losing your opinion.',
      'Replace the topic and condition with the exact prompt focus.',
    ],
    avoidCopying:
      'Do not reuse this sentence word-for-word; copy the structure, not the topic wording.',
    tags: ['position', 'balance', 'remote work', 'thesis'],
  },
  {
    id: 'task2-advantage-body',
    taskTypes: ['Task 2'],
    functionType: 'Body development',
    topic: 'Education and technology',
    title: 'Cause-and-effect body paragraph',
    fragment:
      'One clear advantage is that digital tools can make learning more responsive. For example, an AI tutor can identify repeated mistakes immediately and give extra practice before a student falls behind. This matters because feedback is most useful when it arrives while the learner is still engaged with the task.',
    whyItWorks:
      'The paragraph moves from a claim to an example and then explains why the example matters.',
    usageNotes: [
      'Keep the first sentence broad, then make the example specific.',
      'End by explaining the impact instead of adding a second unrelated idea.',
    ],
    avoidCopying:
      'Swap in your own example and impact so the paragraph fits the prompt.',
    tags: ['example', 'development', 'education', 'technology'],
  },
  {
    id: 'task2-counterpoint',
    taskTypes: ['Task 2'],
    functionType: 'Body development',
    topic: 'Health and lifestyle',
    title: 'Controlled counterpoint',
    fragment:
      'This does not mean that government action can solve every health problem. Personal habits still depend on daily choices, but public policy can make healthier choices easier and cheaper for ordinary families.',
    whyItWorks:
      'It handles the opposing view briefly, then returns to the main position without sounding one-sided.',
    usageNotes: [
      'Use this when you need balance in a discuss-both-views or opinion essay.',
      'Keep the counterpoint shorter than your main argument.',
    ],
    avoidCopying:
      'Do not add a counterpoint if the paragraph already has too many ideas.',
    tags: ['counterpoint', 'balance', 'health', 'policy'],
  },
  {
    id: 'task2-conclusion',
    taskTypes: ['Task 2'],
    functionType: 'Conclusion',
    topic: 'Environment and climate',
    title: 'Compact opinion conclusion',
    fragment:
      'Overall, environmental progress is most realistic when individual habits are supported by strong public policy, because large-scale change requires both personal demand and coordinated infrastructure.',
    whyItWorks:
      'It restates the final answer and gives one reason without introducing a new body paragraph idea.',
    usageNotes: [
      'Keep the conclusion shorter than a body paragraph.',
      'Echo the thesis using different wording.',
    ],
    avoidCopying:
      'Avoid adding a brand-new example in the conclusion.',
    tags: ['conclusion', 'environment', 'policy', 'opinion'],
  },
  {
    id: 'task1-process-introduction',
    taskTypes: ['Task 1'],
    functionType: 'Introduction',
    topic: 'Process diagram',
    title: 'Neutral process introduction',
    fragment:
      'The diagram illustrates how used water is collected, treated, and returned for reuse in a modern urban recycling system.',
    whyItWorks:
      'It paraphrases the task neutrally and names the start-to-end process without adding opinion.',
    usageNotes: [
      'Use a neutral verb such as illustrates, shows, or outlines.',
      'Name the process endpoint if it is clear from the visual.',
    ],
    avoidCopying:
      'Do not include minor stages or personal judgement in the introduction.',
    tags: ['process', 'introduction', 'paraphrase', 'water'],
  },
  {
    id: 'task1-process-overview',
    taskTypes: ['Task 1'],
    functionType: 'Overview',
    topic: 'Process diagram',
    title: 'Start-to-end overview',
    fragment:
      'Overall, the process is cyclical: wastewater moves through several treatment stages before it becomes clean enough to be stored and supplied again.',
    whyItWorks:
      'It gives the examiner the main pattern before the detailed stage description begins.',
    usageNotes: [
      'Put this before detailed stage paragraphs.',
      'Use overall when you are summarizing the whole visual.',
    ],
    avoidCopying:
      'Do not overload the overview with every stage in the diagram.',
    tags: ['overview', 'process', 'cyclical', 'task 1'],
  },
  {
    id: 'task1-detail-grouping',
    taskTypes: ['Task 1'],
    functionType: 'Detail grouping',
    topic: 'Urban change and transport',
    title: 'Grouped detail paragraph',
    fragment:
      'In the first part of the period, the most noticeable change was the expansion of public transport links around the residential district, while the central area remained largely unchanged.',
    whyItWorks:
      'It groups related map or trend details and compares them instead of listing isolated facts.',
    usageNotes: [
      'Start with a time, stage, or location anchor.',
      'Use while to compare two related details cleanly.',
    ],
    avoidCopying:
      'Do not invent locations or figures that are not visible in the task.',
    tags: ['map', 'details', 'comparison', 'transport'],
  },
  {
    id: 'shared-lexical-upgrade',
    taskTypes: ['Task 1', 'Task 2'],
    functionType: 'Body development',
    topic: 'General IELTS writing',
    title: 'Precise explanation sentence',
    fragment:
      'This is important because the benefit is not only immediate convenience, but also the longer-term effect on how people manage time, resources, and expectations.',
    whyItWorks:
      'It turns a general benefit into a layered explanation that can support many IELTS topics.',
    usageNotes: [
      'Use this structure after a concrete example.',
      'Replace benefit with risk, change, or trend when needed.',
    ],
    avoidCopying:
      'Avoid using abstract nouns if you cannot connect them to the prompt.',
    tags: ['explanation', 'impact', 'development', 'general'],
  },
]

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase()
}

function searchableText(fragment: ModelFragment) {
  return [
    fragment.title,
    fragment.topic,
    fragment.functionType,
    fragment.fragment,
    fragment.whyItWorks,
    fragment.avoidCopying,
    ...fragment.usageNotes,
    ...fragment.tags,
  ].join(' ')
}

export function parseModelFragmentTaskFilter(
  value: string | null
): ModelFragmentTaskFilter {
  return value === 'Task 1' || value === 'Task 2' ? value : 'All'
}

export function parseModelFragmentFunctionFilter(
  value: string | null
): ModelFragmentFunctionFilter {
  return [
    'Introduction',
    'Overview',
    'Body development',
    'Detail grouping',
    'Conclusion',
  ].includes(value ?? '')
    ? (value as ModelFragmentFunction)
    : 'All'
}

export function filterModelFragments({
  entries = modelFragments,
  query = '',
  taskType = 'All',
  functionType = 'All',
}: {
  entries?: ModelFragment[]
  query?: string
  taskType?: ModelFragmentTaskFilter
  functionType?: ModelFragmentFunctionFilter
}) {
  const normalizedQuery = normalizeSearchValue(query)

  return entries.filter((entry) => {
    const matchesTask = taskType === 'All' || entry.taskTypes.includes(taskType)
    const matchesFunction =
      functionType === 'All' || entry.functionType === functionType
    const matchesQuery =
      !normalizedQuery ||
      normalizeSearchValue(searchableText(entry)).includes(normalizedQuery)

    return matchesTask && matchesFunction && matchesQuery
  })
}

export function summarizeModelFragments(
  entries: ModelFragment[] = modelFragments
): ModelFragmentSummary {
  return {
    totalFragments: entries.length,
    taskOneFragments: entries.filter((entry) => entry.taskTypes.includes('Task 1')).length,
    taskTwoFragments: entries.filter((entry) => entry.taskTypes.includes('Task 2')).length,
    functionTypes: new Set(entries.map((entry) => entry.functionType)).size,
  }
}
