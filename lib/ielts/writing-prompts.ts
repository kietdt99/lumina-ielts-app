export type WritingPrompt = {
  id: string
  taskType: 'Task 1' | 'Task 2'
  title: string
  topic: string
  difficulty: 'Guided' | 'Balanced' | 'Stretch'
  durationMinutes: number
  minimumWords: number
  brief: string
  instructions: string[]
  planningChecklist: string[]
}

export type WritingPromptTaskFilter = 'All' | WritingPrompt['taskType']

export type WritingPromptDifficultyFilter = 'All' | WritingPrompt['difficulty']

export type WritingPromptSummary = {
  totalPrompts: number
  taskOnePrompts: number
  taskTwoPrompts: number
  guidedPrompts: number
  balancedPrompts: number
  stretchPrompts: number
  topics: number
}

export const writingPrompts: WritingPrompt[] = [
  {
    id: 'task2-remote-work',
    taskType: 'Task 2',
    title: 'Remote work and employee productivity',
    topic: 'Work and society',
    difficulty: 'Balanced',
    durationMinutes: 40,
    minimumWords: 250,
    brief:
      'Some people believe remote work improves productivity, while others think employees work better in an office. Discuss both views and give your own opinion.',
    instructions: [
      'Present both views in a balanced way before giving your final position.',
      'Support your opinion with clear reasons and practical examples.',
      'Aim for a focused four-paragraph structure.',
    ],
    planningChecklist: [
      'Clarify your position before you begin writing.',
      'Write one body paragraph for each side of the argument.',
      'Use a short conclusion that reinforces your opinion.',
    ],
  },
  {
    id: 'task2-ai-education',
    taskType: 'Task 2',
    title: 'AI tools in school education',
    topic: 'Education and technology',
    difficulty: 'Stretch',
    durationMinutes: 40,
    minimumWords: 250,
    brief:
      'Schools are increasingly using AI tools to support teaching and learning. Do the advantages outweigh the disadvantages?',
    instructions: [
      'State a clear overall judgement early in the essay.',
      'Explain both the opportunities and the risks of AI in education.',
      'Keep examples realistic and directly connected to the main point.',
    ],
    planningChecklist: [
      'Decide whether your essay is mainly positive, negative, or balanced.',
      'Use topic sentences to make the argument easy to follow.',
      'Avoid listing ideas without explaining their impact.',
    ],
  },
  {
    id: 'task1-cycle-diagram',
    taskType: 'Task 1',
    title: 'Water recycling process',
    topic: 'Process diagram',
    difficulty: 'Guided',
    durationMinutes: 20,
    minimumWords: 150,
    brief:
      'The diagram shows the stages used to recycle water in a modern city. Summarize the information by selecting and reporting the main features.',
    instructions: [
      'Write an overview that identifies the start and end of the cycle.',
      'Group related stages together instead of describing every step in isolation.',
      'Use precise process language and sequencing connectors.',
    ],
    planningChecklist: [
      'Write a one-sentence overview before the detailed description.',
      'Move through the process in a logical order.',
      'Check verb tenses and passive voice choices.',
    ],
  },
  {
    id: 'task2-public-transport-funding',
    taskType: 'Task 2',
    title: 'Public transport funding',
    topic: 'Urban change and transport',
    difficulty: 'Guided',
    durationMinutes: 40,
    minimumWords: 250,
    brief:
      'Some people think governments should make public transport free to reduce traffic congestion. Others believe this is too expensive. Discuss both views and give your opinion.',
    instructions: [
      'Explain the traffic and cost sides of the argument.',
      'Give a clear final position instead of staying neutral throughout.',
      'Use examples connected to cities, commuters, or public budgets.',
    ],
    planningChecklist: [
      'Decide whether the public benefit is worth the financial cost.',
      'Plan one paragraph about congestion and one about funding limits.',
      'Make the conclusion answer the question directly.',
    ],
  },
  {
    id: 'task2-health-advertising',
    taskType: 'Task 2',
    title: 'Advertising and unhealthy lifestyles',
    topic: 'Health and lifestyle',
    difficulty: 'Balanced',
    durationMinutes: 40,
    minimumWords: 250,
    brief:
      'Many advertisements encourage people to buy unhealthy food and drinks. Should governments restrict this type of advertising?',
    instructions: [
      'State whether restriction is necessary, excessive, or partly justified.',
      'Explain the public health impact and the freedom-of-choice concern.',
      'Use a realistic policy example rather than a vague claim.',
    ],
    planningChecklist: [
      'Choose a clear position on government restriction.',
      'Separate health consequences from personal responsibility.',
      'Add one example about children, hospitals, or consumer habits.',
    ],
  },
  {
    id: 'task2-environment-responsibility',
    taskType: 'Task 2',
    title: 'Environmental responsibility',
    topic: 'Environment and climate',
    difficulty: 'Balanced',
    durationMinutes: 40,
    minimumWords: 250,
    brief:
      'Some people believe individuals should take responsibility for protecting the environment, while others think governments and companies have the greatest responsibility. Discuss both views and give your opinion.',
    instructions: [
      'Compare individual habits with large-scale policy and business decisions.',
      'Avoid claiming that only one group matters.',
      'Support the final opinion with cause-and-effect explanation.',
    ],
    planningChecklist: [
      'Plan one paragraph for individual behavior and one for institutions.',
      'Use concrete examples such as transport, waste, or energy.',
      'Show why your chosen side has greater impact.',
    ],
  },
  {
    id: 'task2-automation-jobs',
    taskType: 'Task 2',
    title: 'Automation and future jobs',
    topic: 'Work and society',
    difficulty: 'Stretch',
    durationMinutes: 40,
    minimumWords: 250,
    brief:
      'Automation is replacing some types of work. Do you think this change creates more opportunities or more problems for society?',
    instructions: [
      'Take a clear position on the overall impact of automation.',
      'Discuss both job loss and new forms of work or productivity.',
      'Keep examples specific enough to show real-world understanding.',
    ],
    planningChecklist: [
      'Decide whether opportunity or risk is stronger overall.',
      'Use one paragraph for economic benefits and one for worker disruption.',
      'End with a practical judgement about retraining or policy support.',
    ],
  },
  {
    id: 'task2-social-media-news',
    taskType: 'Task 2',
    title: 'Social media as a news source',
    topic: 'Education and technology',
    difficulty: 'Stretch',
    durationMinutes: 40,
    minimumWords: 250,
    brief:
      'More people now get news from social media rather than traditional newspapers or television. Is this a positive or negative development?',
    instructions: [
      'Judge the development clearly instead of listing only advantages and disadvantages.',
      'Explain speed and accessibility alongside misinformation risks.',
      'Use examples about media literacy, public debate, or trust.',
    ],
    planningChecklist: [
      'Choose whether the overall effect is positive, negative, or mixed.',
      'Plan one paragraph about access and one about reliability.',
      'Make the final answer connect to informed decision-making.',
    ],
  },
  {
    id: 'task1-city-centre-map',
    taskType: 'Task 1',
    title: 'City centre redevelopment map',
    topic: 'Urban change and transport',
    difficulty: 'Balanced',
    durationMinutes: 20,
    minimumWords: 150,
    brief:
      'The maps show changes to a city centre between 2000 and 2025. Summarize the information by selecting and reporting the main features.',
    instructions: [
      'Introduce the two maps without giving opinions.',
      'Highlight the biggest land-use and transport changes in the overview.',
      'Group details by area of the city rather than listing every building.',
    ],
    planningChecklist: [
      'Identify what was added, removed, or relocated.',
      'Write an overview about the overall direction of redevelopment.',
      'Use past and present perfect forms accurately.',
    ],
  },
  {
    id: 'task1-energy-line-chart',
    taskType: 'Task 1',
    title: 'Household energy use trends',
    topic: 'Environment and climate',
    difficulty: 'Balanced',
    durationMinutes: 20,
    minimumWords: 150,
    brief:
      'The line chart compares household energy use from renewable and non-renewable sources between 2010 and 2030. Summarize the information by selecting and reporting the main features.',
    instructions: [
      'State the overall direction of both lines in the overview.',
      'Compare the two sources at meaningful points instead of every year.',
      'Use trend language accurately.',
    ],
    planningChecklist: [
      'Find the starting point, crossing point, and final point.',
      'Group the description into early and later periods.',
      'Check comparative language such as higher than and overtook.',
    ],
  },
  {
    id: 'task1-commuter-bar-chart',
    taskType: 'Task 1',
    title: 'Commuter transport choices',
    topic: 'Urban change and transport',
    difficulty: 'Guided',
    durationMinutes: 20,
    minimumWords: 150,
    brief:
      'The bar chart shows the percentage of commuters using cars, buses, trains, and bicycles in three cities. Summarize the information by selecting and reporting the main features.',
    instructions: [
      'Compare the most and least popular transport choices.',
      'Group cities or transport types where the patterns are similar.',
      'Avoid describing each bar in isolation.',
    ],
    planningChecklist: [
      'Identify the highest and lowest categories first.',
      'Choose two comparison groups before writing.',
      'Use percentages and comparative phrases carefully.',
    ],
  },
  {
    id: 'task1-recycling-table',
    taskType: 'Task 1',
    title: 'Recycling rates by material',
    topic: 'Environment and climate',
    difficulty: 'Stretch',
    durationMinutes: 20,
    minimumWords: 150,
    brief:
      'The table compares recycling rates for paper, plastic, glass, and metal in four countries in 2024. Summarize the information by selecting and reporting the main features.',
    instructions: [
      'Identify the strongest and weakest recycling performance.',
      'Group materials or countries to avoid a long list of numbers.',
      'Include only figures that support the main comparisons.',
    ],
    planningChecklist: [
      'Find the highest country-material combination.',
      'Group similar rates together before drafting.',
      'Use cautious comparison language for close figures.',
    ],
  },
  {
    id: 'task1-online-learning-pie-charts',
    taskType: 'Task 1',
    title: 'Online learning platform usage',
    topic: 'Education and technology',
    difficulty: 'Balanced',
    durationMinutes: 20,
    minimumWords: 150,
    brief:
      'The pie charts compare how students used online learning platforms for lectures, assignments, discussion, and revision in 2018 and 2024. Summarize the information by selecting and reporting the main features.',
    instructions: [
      'Compare the two years and focus on the largest proportional changes.',
      'Write an overview that identifies the overall shift in platform usage.',
      'Avoid over-reporting small slices unless they support the main pattern.',
    ],
    planningChecklist: [
      'Identify which category grew the most.',
      'Group stable categories separately from changing categories.',
      'Use proportion language such as share, accounted for, and declined.',
    ],
  },
]

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase()
}

function searchableText(prompt: WritingPrompt) {
  return [
    prompt.title,
    prompt.taskType,
    prompt.topic,
    prompt.difficulty,
    prompt.brief,
    ...prompt.instructions,
    ...prompt.planningChecklist,
  ].join(' ')
}

export function filterWritingPrompts({
  prompts = writingPrompts,
  query = '',
  taskType = 'All',
  difficulty = 'All',
  topic = 'All topics',
}: {
  prompts?: WritingPrompt[]
  query?: string
  taskType?: WritingPromptTaskFilter
  difficulty?: WritingPromptDifficultyFilter
  topic?: string
}) {
  const normalizedQuery = normalizeSearchValue(query)

  return prompts.filter((prompt) => {
    const matchesTask = taskType === 'All' || prompt.taskType === taskType
    const matchesDifficulty =
      difficulty === 'All' || prompt.difficulty === difficulty
    const matchesTopic = topic === 'All topics' || prompt.topic === topic
    const matchesQuery =
      !normalizedQuery ||
      normalizeSearchValue(searchableText(prompt)).includes(normalizedQuery)

    return matchesTask && matchesDifficulty && matchesTopic && matchesQuery
  })
}

export function summarizeWritingPrompts(
  prompts: WritingPrompt[] = writingPrompts
): WritingPromptSummary {
  return {
    totalPrompts: prompts.length,
    taskOnePrompts: prompts.filter((prompt) => prompt.taskType === 'Task 1').length,
    taskTwoPrompts: prompts.filter((prompt) => prompt.taskType === 'Task 2').length,
    guidedPrompts: prompts.filter((prompt) => prompt.difficulty === 'Guided').length,
    balancedPrompts: prompts.filter((prompt) => prompt.difficulty === 'Balanced').length,
    stretchPrompts: prompts.filter((prompt) => prompt.difficulty === 'Stretch').length,
    topics: new Set(prompts.map((prompt) => prompt.topic)).size,
  }
}

export function listWritingPromptTopics(prompts: WritingPrompt[] = writingPrompts) {
  return ['All topics', ...new Set(prompts.map((prompt) => prompt.topic))]
}

export function parseWritingPromptTaskFilter(
  value: string | null
): WritingPromptTaskFilter {
  return value === 'Task 1' || value === 'Task 2' ? value : 'All'
}

export function parseWritingPromptDifficultyFilter(
  value: string | null
): WritingPromptDifficultyFilter {
  return value === 'Guided' || value === 'Balanced' || value === 'Stretch'
    ? value
    : 'All'
}
