import { writingPrompts, type WritingPrompt } from './writing-prompts'

export type MockTestDifficultyFilter = 'All' | WritingPrompt['difficulty']

export type MockTestCheckpoint = {
  id: string
  label: string
  minuteMark: number
  goal: string
  successSignal: string
}

export type WritingMockTest = {
  id: string
  title: string
  difficulty: WritingPrompt['difficulty']
  topicPair: string
  totalMinutes: number
  totalMinimumWords: number
  taskOnePrompt: WritingPrompt
  taskTwoPrompt: WritingPrompt
  checkpoints: MockTestCheckpoint[]
  readinessChecklist: string[]
}

export type WritingMockTestSummary = {
  totalTests: number
  guidedTests: number
  balancedTests: number
  stretchTests: number
  averageMinutes: number
  topics: number
}

const allTopicsOption = 'All topics'

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase()
}

function getDifficulty(
  taskOnePrompt: WritingPrompt,
  taskTwoPrompt: WritingPrompt
): WritingPrompt['difficulty'] {
  if (
    taskOnePrompt.difficulty === 'Stretch' ||
    taskTwoPrompt.difficulty === 'Stretch'
  ) {
    return 'Stretch'
  }

  if (
    taskOnePrompt.difficulty === 'Guided' &&
    taskTwoPrompt.difficulty === 'Guided'
  ) {
    return 'Guided'
  }

  return 'Balanced'
}

function getTopicPair(taskOnePrompt: WritingPrompt, taskTwoPrompt: WritingPrompt) {
  if (taskOnePrompt.topic === taskTwoPrompt.topic) {
    return taskOnePrompt.topic
  }

  return `${taskOnePrompt.topic} + ${taskTwoPrompt.topic}`
}

function createCheckpoints(
  taskOnePrompt: WritingPrompt,
  taskTwoPrompt: WritingPrompt
): MockTestCheckpoint[] {
  return [
    {
      id: 'scan-prompts',
      label: 'Scan both tasks',
      minuteMark: 3,
      goal: 'Understand the visual/report task and the essay question before writing.',
      successSignal:
        'You can name the Task 1 overview and the Task 2 position before drafting.',
    },
    {
      id: 'finish-task-1',
      label: 'Finish Task 1',
      minuteMark: taskOnePrompt.durationMinutes,
      goal: `Complete ${taskOnePrompt.title.toLowerCase()} without stealing time from Task 2.`,
      successSignal: `Task 1 has at least ${taskOnePrompt.minimumWords} words and a clear overview.`,
    },
    {
      id: 'lock-task-2-plan',
      label: 'Lock Task 2 plan',
      minuteMark: taskOnePrompt.durationMinutes + 5,
      goal: 'Choose the position, body paragraph jobs, and one concrete support move.',
      successSignal:
        'Task 2 has a direct thesis and two body paragraph jobs before drafting.',
    },
    {
      id: 'finish-task-2',
      label: 'Finish Task 2',
      minuteMark: taskOnePrompt.durationMinutes + taskTwoPrompt.durationMinutes,
      goal: `Complete ${taskTwoPrompt.title.toLowerCase()} under exam pressure.`,
      successSignal: `Task 2 has at least ${taskTwoPrompt.minimumWords} words and a short conclusion.`,
    },
    {
      id: 'final-check',
      label: 'Final accuracy check',
      minuteMark: 60,
      goal: 'Use the final minutes for word count, paragraph flow, and sentence boundaries.',
      successSignal: 'Both tasks are complete enough to submit for feedback.',
    },
  ]
}

function createReadinessChecklist(
  taskOnePrompt: WritingPrompt,
  taskTwoPrompt: WritingPrompt
) {
  return [
    `Task 1 reaches ${taskOnePrompt.minimumWords}+ words and includes a clear overview.`,
    `Task 2 reaches ${taskTwoPrompt.minimumWords}+ words and answers the question directly.`,
    'Both drafts are split into readable paragraphs.',
    'The final five minutes are reserved for grammar, linking, and repeated wording.',
  ]
}

function findBestTaskTwoPrompt(
  taskOnePrompt: WritingPrompt,
  taskTwoPrompts: WritingPrompt[],
  index: number
) {
  return (
    taskTwoPrompts.find((prompt) => prompt.topic === taskOnePrompt.topic) ??
    taskTwoPrompts[index % taskTwoPrompts.length]
  )
}

function searchableText(test: WritingMockTest) {
  return [
    test.title,
    test.topicPair,
    test.difficulty,
    test.taskOnePrompt.title,
    test.taskOnePrompt.brief,
    test.taskTwoPrompt.title,
    test.taskTwoPrompt.brief,
    ...test.readinessChecklist,
  ].join(' ')
}

export function createWritingMockTest({
  taskOnePrompt,
  taskTwoPrompt,
}: {
  taskOnePrompt: WritingPrompt
  taskTwoPrompt: WritingPrompt
}): WritingMockTest {
  const difficulty = getDifficulty(taskOnePrompt, taskTwoPrompt)
  const topicPair = getTopicPair(taskOnePrompt, taskTwoPrompt)

  return {
    id: `mock-${taskOnePrompt.id}-${taskTwoPrompt.id}`,
    title: `${taskOnePrompt.title} + ${taskTwoPrompt.title}`,
    difficulty,
    topicPair,
    totalMinutes: 60,
    totalMinimumWords: taskOnePrompt.minimumWords + taskTwoPrompt.minimumWords,
    taskOnePrompt,
    taskTwoPrompt,
    checkpoints: createCheckpoints(taskOnePrompt, taskTwoPrompt),
    readinessChecklist: createReadinessChecklist(taskOnePrompt, taskTwoPrompt),
  }
}

export function createWritingMockTests(
  prompts: WritingPrompt[] = writingPrompts
) {
  const taskOnePrompts = prompts.filter((prompt) => prompt.taskType === 'Task 1')
  const taskTwoPrompts = prompts.filter((prompt) => prompt.taskType === 'Task 2')

  if (!taskOnePrompts.length || !taskTwoPrompts.length) {
    return []
  }

  return taskOnePrompts.map((taskOnePrompt, index) =>
    createWritingMockTest({
      taskOnePrompt,
      taskTwoPrompt: findBestTaskTwoPrompt(taskOnePrompt, taskTwoPrompts, index),
    })
  )
}

export const writingMockTests = createWritingMockTests()

export function listWritingMockTestTopics(
  tests: WritingMockTest[] = writingMockTests
) {
  return [
    allTopicsOption,
    ...new Set(
      tests.flatMap((test) => [
        test.topicPair,
        test.taskOnePrompt.topic,
        test.taskTwoPrompt.topic,
      ])
    ),
  ]
}

export function filterWritingMockTests({
  tests = writingMockTests,
  query = '',
  difficulty = 'All',
  topic = allTopicsOption,
}: {
  tests?: WritingMockTest[]
  query?: string
  difficulty?: MockTestDifficultyFilter
  topic?: string
}) {
  const normalizedQuery = normalizeSearchValue(query)

  return tests.filter((test) => {
    const matchesDifficulty =
      difficulty === 'All' || test.difficulty === difficulty
    const matchesTopic =
      topic === allTopicsOption ||
      test.topicPair === topic ||
      test.taskOnePrompt.topic === topic ||
      test.taskTwoPrompt.topic === topic
    const matchesQuery =
      !normalizedQuery ||
      normalizeSearchValue(searchableText(test)).includes(normalizedQuery)

    return matchesDifficulty && matchesTopic && matchesQuery
  })
}

export function summarizeWritingMockTests(
  tests: WritingMockTest[] = writingMockTests
): WritingMockTestSummary {
  const totalMinutes = tests.reduce((total, test) => total + test.totalMinutes, 0)

  return {
    totalTests: tests.length,
    guidedTests: tests.filter((test) => test.difficulty === 'Guided').length,
    balancedTests: tests.filter((test) => test.difficulty === 'Balanced').length,
    stretchTests: tests.filter((test) => test.difficulty === 'Stretch').length,
    averageMinutes: tests.length ? Math.round(totalMinutes / tests.length) : 0,
    topics: new Set(tests.map((test) => test.topicPair)).size,
  }
}

export function parseMockTestDifficultyFilter(
  value: string | null
): MockTestDifficultyFilter {
  return value === 'Guided' || value === 'Balanced' || value === 'Stretch'
    ? value
    : 'All'
}

export function parseMockTestTopicFilter(
  value: string | null,
  tests: WritingMockTest[] = writingMockTests
) {
  const topics = listWritingMockTestTopics(tests)

  return value && topics.includes(value) ? value : allTopicsOption
}
