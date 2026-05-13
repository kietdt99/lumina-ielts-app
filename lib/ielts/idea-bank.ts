import type { WritingPrompt } from './writing-prompts'

export type IdeaBankTaskFilter = 'All' | WritingPrompt['taskType']

export type IdeaBankEntry = {
  id: string
  topic: string
  taskTypes: WritingPrompt['taskType'][]
  description: string
  commonQuestions: string[]
  usefulVocabulary: string[]
  collocations: string[]
  ideaStarters: string[]
  contrastPairs: string[]
}

export type IdeaBankSummary = {
  totalTopics: number
  taskOneTopics: number
  taskTwoTopics: number
  vocabularyItems: number
  collocationItems: number
}

export const ideaBankEntries: IdeaBankEntry[] = [
  {
    id: 'education-technology',
    topic: 'Education and technology',
    taskTypes: ['Task 2'],
    description:
      'Use this topic when writing about digital classrooms, AI tutors, online learning, and changes in how students study.',
    commonQuestions: [
      'Do the advantages of educational technology outweigh the disadvantages?',
      'Should schools rely more on digital tools than traditional teaching?',
      'How can technology improve access to education?',
    ],
    usefulVocabulary: [
      'personalized learning',
      'digital literacy',
      'student engagement',
      'academic integrity',
      'teacher-led instruction',
    ],
    collocations: [
      'bridge learning gaps',
      'support independent study',
      'reduce classroom inequality',
      'undermine critical thinking',
    ],
    ideaStarters: [
      'Technology can make lessons more adaptive because students receive instant practice and feedback.',
      'The main risk is that students may depend on tools without building independent reasoning skills.',
    ],
    contrastPairs: [
      'access versus distraction',
      'personalization versus overreliance',
      'innovation versus privacy concerns',
    ],
  },
  {
    id: 'work-society',
    topic: 'Work and society',
    taskTypes: ['Task 2'],
    description:
      'Use this topic for remote work, productivity, work-life balance, automation, and changing career expectations.',
    commonQuestions: [
      'Does remote work make employees more productive?',
      'Should governments protect workers from automation?',
      'Is work-life balance more important than salary?',
    ],
    usefulVocabulary: [
      'flexible schedule',
      'workplace autonomy',
      'career stability',
      'professional development',
      'employee wellbeing',
    ],
    collocations: [
      'improve productivity',
      'protect focused work',
      'strengthen team communication',
      'blur work-life boundaries',
    ],
    ideaStarters: [
      'Remote work can improve productivity when employees have fewer interruptions and clearer goals.',
      'Office work remains useful for training, collaboration, and informal feedback.',
    ],
    contrastPairs: [
      'autonomy versus isolation',
      'productivity versus communication cost',
      'flexibility versus accountability',
    ],
  },
  {
    id: 'environment-climate',
    topic: 'Environment and climate',
    taskTypes: ['Task 1', 'Task 2'],
    description:
      'Use this topic for pollution, recycling, energy, climate policy, process diagrams, and environmental data trends.',
    commonQuestions: [
      'Should individuals or governments take more responsibility for environmental protection?',
      'What are the best ways to reduce urban pollution?',
      'Summarize changes in energy use, recycling, or emissions over time.',
    ],
    usefulVocabulary: [
      'renewable energy',
      'carbon emissions',
      'waste management',
      'sustainable transport',
      'resource conservation',
    ],
    collocations: [
      'reduce environmental impact',
      'adopt cleaner technology',
      'dispose of waste safely',
      'invest in public transport',
    ],
    ideaStarters: [
      'Government policy matters because large-scale infrastructure decisions are beyond individual control.',
      'Individual habits still matter when they create demand for cleaner products and transport.',
    ],
    contrastPairs: [
      'individual habits versus public policy',
      'short-term cost versus long-term sustainability',
      'economic growth versus environmental protection',
    ],
  },
  {
    id: 'health-lifestyle',
    topic: 'Health and lifestyle',
    taskTypes: ['Task 2'],
    description:
      'Use this topic for public health, exercise, diet, mental wellbeing, advertising, and lifestyle choices.',
    commonQuestions: [
      'Should governments do more to encourage healthy lifestyles?',
      'Is prevention more important than medical treatment?',
      "How does advertising influence people's health choices?",
    ],
    usefulVocabulary: [
      'preventive healthcare',
      'sedentary lifestyle',
      'mental wellbeing',
      'public awareness',
      'balanced diet',
    ],
    collocations: [
      'promote healthier habits',
      'place pressure on hospitals',
      'discourage excessive consumption',
      'improve long-term wellbeing',
    ],
    ideaStarters: [
      'Prevention is usually cheaper than treatment because it reduces long-term pressure on health services.',
      'Personal responsibility still matters because daily habits cannot be controlled entirely by policy.',
    ],
    contrastPairs: [
      'personal choice versus government responsibility',
      'prevention versus treatment',
      'convenience versus long-term wellbeing',
    ],
  },
  {
    id: 'urban-change',
    topic: 'Urban change and transport',
    taskTypes: ['Task 1', 'Task 2'],
    description:
      'Use this topic for city growth, public transport, maps, infrastructure, housing, and traffic trends.',
    commonQuestions: [
      'How can cities reduce traffic congestion?',
      'Should public transport be free or heavily subsidized?',
      'Describe how a city map or transport system changes over time.',
    ],
    usefulVocabulary: [
      'urban planning',
      'traffic congestion',
      'public infrastructure',
      'residential area',
      'commuter demand',
    ],
    collocations: [
      'expand public transport',
      'ease traffic pressure',
      'redevelop unused land',
      'connect residential districts',
    ],
    ideaStarters: [
      'Reliable public transport reduces congestion because commuters have a practical alternative to driving.',
      'Urban redevelopment can improve quality of life if it protects green space and affordable housing.',
    ],
    contrastPairs: [
      'private cars versus public transport',
      'redevelopment versus community disruption',
      'density versus liveability',
    ],
  },
]

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase()
}

function searchableText(entry: IdeaBankEntry) {
  return [
    entry.topic,
    entry.description,
    ...entry.commonQuestions,
    ...entry.usefulVocabulary,
    ...entry.collocations,
    ...entry.ideaStarters,
    ...entry.contrastPairs,
  ].join(' ')
}

export function filterIdeaBankEntries({
  entries = ideaBankEntries,
  query = '',
  taskType = 'All',
}: {
  entries?: IdeaBankEntry[]
  query?: string
  taskType?: IdeaBankTaskFilter
}) {
  const normalizedQuery = normalizeSearchValue(query)

  return entries.filter((entry) => {
    const matchesTask = taskType === 'All' || entry.taskTypes.includes(taskType)
    const matchesQuery =
      !normalizedQuery ||
      normalizeSearchValue(searchableText(entry)).includes(normalizedQuery)

    return matchesTask && matchesQuery
  })
}

export function summarizeIdeaBank(entries: IdeaBankEntry[] = ideaBankEntries): IdeaBankSummary {
  return {
    totalTopics: entries.length,
    taskOneTopics: entries.filter((entry) => entry.taskTypes.includes('Task 1')).length,
    taskTwoTopics: entries.filter((entry) => entry.taskTypes.includes('Task 2')).length,
    vocabularyItems: entries.reduce(
      (total, entry) => total + entry.usefulVocabulary.length,
      0
    ),
    collocationItems: entries.reduce(
      (total, entry) => total + entry.collocations.length,
      0
    ),
  }
}

export function parseIdeaBankTaskFilter(value: string | null): IdeaBankTaskFilter {
  return value === 'Task 1' || value === 'Task 2' ? value : 'All'
}
