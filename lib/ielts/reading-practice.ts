export type ReadingPracticeDifficulty = 'Guided' | 'Balanced' | 'Stretch'

export type ReadingPracticeDifficultyFilter = 'All' | ReadingPracticeDifficulty

export type ReadingQuestionType =
  | 'Multiple choice'
  | 'True / False / Not Given'
  | 'Gap fill'

export type ReadingQuestion = {
  id: string
  type: ReadingQuestionType
  prompt: string
  options: string[]
  correctAnswer: string
  explanation: string
  skillFocus: string
}

export type PublicReadingQuestion = Omit<
  ReadingQuestion,
  'correctAnswer' | 'explanation'
>

export type ReadingPracticePassage = {
  id: string
  title: string
  topic: string
  difficulty: ReadingPracticeDifficulty
  estimatedMinutes: number
  wordCount: number
  summary: string
  passage: string[]
  questions: ReadingQuestion[]
}

export type PublicReadingPracticePassage = Omit<
  ReadingPracticePassage,
  'questions'
> & {
  questions: PublicReadingQuestion[]
}

export type ReadingPracticeSummary = {
  totalPassages: number
  guidedPassages: number
  balancedPassages: number
  stretchPassages: number
  totalQuestions: number
  averageMinutes: number
  topics: number
}

export type ReadingPracticeAnswerMap = Record<string, string>

export type ReadingPracticeAttemptInput = {
  passageId: string
  answers: ReadingPracticeAnswerMap
}

export type ReadingQuestionResult = {
  questionId: string
  prompt: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  explanation: string
  skillFocus: string
}

export type ReadingPracticeScoreStatus =
  | 'needs-review'
  | 'building-control'
  | 'strong-control'

export type ReadingPracticeScore = {
  passageId: string
  passageTitle: string
  topic: string
  difficulty: ReadingPracticeDifficulty
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  accuracy: number
  estimatedBand: number
  status: ReadingPracticeScoreStatus
  statusLabel: string
  summary: string
  nextActions: string[]
  questionResults: ReadingQuestionResult[]
}

export type ReadingPracticeScoreSuccess = {
  ok: true
  score: ReadingPracticeScore
}

export type ReadingPracticeScoreFailure = {
  ok: false
  error: string
}

export type ReadingPracticeScoreResponse =
  | ReadingPracticeScoreSuccess
  | ReadingPracticeScoreFailure

const allTopicsOption = 'All topics'
const invalidPayloadMessage = 'Invalid reading practice payload.'
const unknownPassageMessage = 'The selected reading passage could not be found.'

type SearchableReadingPracticePassage =
  | ReadingPracticePassage
  | PublicReadingPracticePassage

export const readingPracticePassages: ReadingPracticePassage[] = [
  {
    id: 'reading-urban-cooling-corridors',
    title: 'Urban cooling corridors',
    topic: 'Environment and climate',
    difficulty: 'Balanced',
    estimatedMinutes: 14,
    wordCount: 430,
    summary:
      'A city-planning passage about using shade, wind, and vegetation to reduce heat stress.',
    passage: [
      'Many large cities are now treating heat as a planning problem rather than only a weather problem. Dense roads, glass towers, and dark roofs absorb solar energy during the day and release it slowly at night. As a result, central districts can remain several degrees warmer than surrounding rural areas. This effect, known as the urban heat island, increases electricity demand and makes outdoor work more dangerous during heatwaves.',
      'One response is the creation of urban cooling corridors. These are connected routes of trees, water features, pale surfaces, and open space that allow cooler air to move through a city. The idea is not simply to add more parks. A single park may cool the streets around it, but a linked corridor can move air across several neighbourhoods and protect walking routes, bus stops, and school entrances.',
      'Researchers warn that the design must be local. In a windy coastal city, planners may preserve open streets so sea breezes can travel inland. In a dry inland city, shade from trees and covered walkways may matter more than air movement. Maintenance is also important. Young trees provide limited shade, and water features can waste resources if they are not matched to the local climate.',
      'Cooling corridors are not a complete solution to climate change, but they can reduce immediate health risks while cities lower emissions. The strongest projects combine environmental design with social priorities, placing shade and ventilation where vulnerable residents actually travel each day.',
    ],
    questions: [
      {
        id: 'urban-cooling-q1',
        type: 'Multiple choice',
        prompt: 'What is the main purpose of the passage?',
        options: [
          'To explain one planning response to urban heat',
          'To argue that parks are no longer useful in cities',
          'To compare rural and urban architecture',
          'To describe how electricity prices are calculated',
        ],
        correctAnswer: 'To explain one planning response to urban heat',
        explanation:
          'The passage defines the heat problem and explains cooling corridors as a planning response.',
        skillFocus: 'main idea',
      },
      {
        id: 'urban-cooling-q2',
        type: 'True / False / Not Given',
        prompt:
          'A single park can cool nearby streets, but connected corridors can influence a wider area.',
        options: ['True', 'False', 'Not Given'],
        correctAnswer: 'True',
        explanation:
          'Paragraph two states that a park may cool nearby streets, while a linked corridor can move air across several neighbourhoods.',
        skillFocus: 'detail matching',
      },
      {
        id: 'urban-cooling-q3',
        type: 'Gap fill',
        prompt:
          'In coastal cities, planners may protect open streets so ____ can move inland.',
        options: ['sea breezes', 'water features', 'dark roofs', 'school entrances'],
        correctAnswer: 'sea breezes',
        explanation:
          'The passage says windy coastal cities may preserve open streets so sea breezes can travel inland.',
        skillFocus: 'keyword scanning',
      },
      {
        id: 'urban-cooling-q4',
        type: 'True / False / Not Given',
        prompt: 'Cooling corridors remove the need for cities to reduce emissions.',
        options: ['True', 'False', 'Not Given'],
        correctAnswer: 'False',
        explanation:
          'The final paragraph says they reduce immediate health risks while cities lower emissions, not instead of lowering emissions.',
        skillFocus: 'logical contrast',
      },
      {
        id: 'urban-cooling-q5',
        type: 'Multiple choice',
        prompt: 'Which design principle is emphasized by the researchers?',
        options: [
          'Cooling plans should match local climate conditions',
          'Every city should build the same type of water feature',
          'Young trees immediately solve heat problems',
          'Central business districts should receive all investment',
        ],
        correctAnswer: 'Cooling plans should match local climate conditions',
        explanation:
          'Paragraph three repeatedly stresses local design and examples from different climates.',
        skillFocus: 'inference',
      },
    ],
  },
  {
    id: 'reading-micro-credentials-work',
    title: 'Micro-credentials at work',
    topic: 'Education and technology',
    difficulty: 'Guided',
    estimatedMinutes: 12,
    wordCount: 395,
    summary:
      'A workplace learning passage about short online certificates and employer trust.',
    passage: [
      'Short online courses, often called micro-credentials, have become common in workplaces where skills change quickly. Unlike a full degree, a micro-credential usually focuses on one narrow ability, such as data visualization, workplace communication, or basic cyber security. Employees like them because they can study in short blocks, and employers like the promise of faster upskilling.',
      'However, the value of these certificates depends on trust. Some courses require a final project reviewed by a specialist, while others only ask learners to watch videos and answer simple quizzes. For hiring managers, this makes it difficult to know whether a certificate proves real ability or only course completion.',
      'Several companies now use micro-credentials as part of internal promotion systems rather than as a replacement for degrees. A worker might complete a short course, apply the skill in a team project, and then receive recognition from a supervisor. This combination gives the certificate more meaning because performance is observed in context.',
      'Supporters argue that micro-credentials can make learning more flexible and fair, especially for adults who cannot pause work for long programs. Critics respond that the market needs clearer standards. Without them, learners may collect badges that look impressive but do not improve their professional options.',
    ],
    questions: [
      {
        id: 'micro-credentials-q1',
        type: 'Multiple choice',
        prompt: 'Why do employees often prefer micro-credentials?',
        options: [
          'They can study in short blocks',
          'They replace every type of degree',
          'They always guarantee promotion',
          'They remove the need for projects',
        ],
        correctAnswer: 'They can study in short blocks',
        explanation:
          'The first paragraph says employees like micro-credentials because they can study in short blocks.',
        skillFocus: 'detail matching',
      },
      {
        id: 'micro-credentials-q2',
        type: 'True / False / Not Given',
        prompt:
          'All micro-credential courses require a final project reviewed by a specialist.',
        options: ['True', 'False', 'Not Given'],
        correctAnswer: 'False',
        explanation:
          'The passage contrasts stronger courses with others that only require videos and simple quizzes.',
        skillFocus: 'quantifier control',
      },
      {
        id: 'micro-credentials-q3',
        type: 'Gap fill',
        prompt:
          'Some companies connect a course to a team project and recognition from a ____.',
        options: ['supervisor', 'university', 'customer', 'software platform'],
        correctAnswer: 'supervisor',
        explanation:
          'Paragraph three says the worker may receive recognition from a supervisor.',
        skillFocus: 'keyword scanning',
      },
      {
        id: 'micro-credentials-q4',
        type: 'Multiple choice',
        prompt: 'What concern do critics raise?',
        options: [
          'The market needs clearer standards',
          'Adults should avoid flexible learning',
          'Certificates are too difficult to complete',
          'Degrees are never useful for hiring',
        ],
        correctAnswer: 'The market needs clearer standards',
        explanation:
          'The final paragraph states that critics believe clearer standards are needed.',
        skillFocus: 'opinion identification',
      },
      {
        id: 'micro-credentials-q5',
        type: 'True / False / Not Given',
        prompt:
          'The passage claims that micro-credentials are most effective when linked to observed workplace performance.',
        options: ['True', 'False', 'Not Given'],
        correctAnswer: 'True',
        explanation:
          'The third paragraph says the certificate gains meaning when performance is observed in context.',
        skillFocus: 'inference',
      },
    ],
  },
  {
    id: 'reading-shared-transport-hubs',
    title: 'Shared transport hubs',
    topic: 'Urban change and transport',
    difficulty: 'Stretch',
    estimatedMinutes: 16,
    wordCount: 465,
    summary:
      'A transport-planning passage about combining buses, bikes, delivery lockers, and shared vehicles.',
    passage: [
      'Cities that want to reduce private car use often face a practical problem: alternatives are scattered. A commuter may need a bus stop, a secure bicycle rack, a parcel locker, and a shared vehicle, but each service is managed separately. Shared transport hubs attempt to bring these services into one recognizable place.',
      'The simplest hubs are small: a covered waiting area, clear maps, bicycle parking, and space for electric scooters. Larger hubs may include charging points, grocery collection lockers, repair kiosks, and priority lanes for buses. The purpose is to make the transfer between different modes feel predictable rather than improvised.',
      'The model has limitations. If a hub is placed where land is cheap but demand is weak, it can become an attractive structure that few people use. If it is placed in a dense area without careful street design, delivery vehicles and scooters may create new conflicts with pedestrians. Planners therefore need data about travel patterns, not just enthusiasm for visible infrastructure.',
      'Some researchers also argue that hubs should be measured by access, not only by passenger volume. A modest hub near a hospital or college may be valuable even if it serves fewer people than a central station. In this view, success means connecting daily needs with reliable options, especially for residents who do not own cars.',
    ],
    questions: [
      {
        id: 'transport-hubs-q1',
        type: 'Multiple choice',
        prompt: 'What problem do shared transport hubs try to solve?',
        options: [
          'Useful transport alternatives are often scattered',
          'Cities have too many hospitals and colleges',
          'Bicycle repair has become too expensive',
          'Private cars are always faster than buses',
        ],
        correctAnswer: 'Useful transport alternatives are often scattered',
        explanation:
          'The first paragraph explains that alternatives are scattered and hubs bring services into one place.',
        skillFocus: 'main idea',
      },
      {
        id: 'transport-hubs-q2',
        type: 'Gap fill',
        prompt:
          'Larger hubs may include charging points, lockers, repair kiosks, and priority lanes for ____.',
        options: ['buses', 'planes', 'trains', 'ferries'],
        correctAnswer: 'buses',
        explanation:
          'The second paragraph lists priority lanes for buses among larger hub features.',
        skillFocus: 'keyword scanning',
      },
      {
        id: 'transport-hubs-q3',
        type: 'True / False / Not Given',
        prompt:
          'A hub in a cheap location is always more successful than one in a dense area.',
        options: ['True', 'False', 'Not Given'],
        correctAnswer: 'False',
        explanation:
          'The passage warns that a hub where land is cheap but demand is weak may be underused.',
        skillFocus: 'logical contrast',
      },
      {
        id: 'transport-hubs-q4',
        type: 'Multiple choice',
        prompt: 'Why do planners need data about travel patterns?',
        options: [
          'To avoid building visible infrastructure that does not match demand',
          'To prove that pedestrians should not use dense streets',
          'To remove all shared vehicles from city centres',
          'To decide which grocery brand should use lockers',
        ],
        correctAnswer:
          'To avoid building visible infrastructure that does not match demand',
        explanation:
          'Paragraph three connects demand, street conflicts, and the need for travel-pattern data.',
        skillFocus: 'inference',
      },
      {
        id: 'transport-hubs-q5',
        type: 'True / False / Not Given',
        prompt:
          'Some researchers believe passenger volume should be the only measure of hub success.',
        options: ['True', 'False', 'Not Given'],
        correctAnswer: 'False',
        explanation:
          'The final paragraph says hubs should be measured by access, not only passenger volume.',
        skillFocus: 'opinion identification',
      },
    ],
  },
]

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase()
}

function searchableText(passage: SearchableReadingPracticePassage) {
  return [
    passage.title,
    passage.topic,
    passage.difficulty,
    passage.summary,
    ...passage.passage,
    ...passage.questions.flatMap((question) => [
      question.type,
      question.prompt,
      question.skillFocus,
      ...question.options,
    ]),
  ].join(' ')
}

function getStatus(accuracy: number): ReadingPracticeScoreStatus {
  if (accuracy >= 80) {
    return 'strong-control'
  }

  return accuracy >= 60 ? 'building-control' : 'needs-review'
}

function getStatusLabel(status: ReadingPracticeScoreStatus) {
  switch (status) {
    case 'strong-control':
      return 'Strong control'
    case 'building-control':
      return 'Building control'
    case 'needs-review':
      return 'Needs review'
  }
}

function getEstimatedBand(accuracy: number) {
  if (accuracy >= 90) {
    return 8
  }

  if (accuracy >= 75) {
    return 7
  }

  if (accuracy >= 60) {
    return 6
  }

  if (accuracy >= 45) {
    return 5
  }

  return 4.5
}

function buildScoreSummary({
  accuracy,
  correctAnswers,
  totalQuestions,
}: {
  accuracy: number
  correctAnswers: number
  totalQuestions: number
}) {
  if (accuracy >= 80) {
    return `You answered ${correctAnswers} of ${totalQuestions} questions correctly. Keep training speed while preserving accuracy.`
  }

  if (accuracy >= 60) {
    return `You answered ${correctAnswers} of ${totalQuestions} questions correctly. The passage is usable, but review the missed question types.`
  }

  return `You answered ${correctAnswers} of ${totalQuestions} questions correctly. Slow down and rebuild the passage map before timing yourself.`
}

function buildNextActions(results: ReadingQuestionResult[]) {
  const missedFocusAreas = [
    ...new Set(
      results
        .filter((result) => !result.isCorrect)
        .map((result) => result.skillFocus)
    ),
  ]

  if (!missedFocusAreas.length) {
    return [
      'Repeat the passage with a tighter time limit.',
      'Write one sentence explaining why each answer is correct.',
    ]
  }

  return [
    `Review ${missedFocusAreas.slice(0, 2).join(' and ')} before the next passage.`,
    'Underline the sentence that proves each missed answer.',
    'Retry the same passage without looking at the answer explanations.',
  ]
}

export function toPublicReadingPracticePassage(
  passage: ReadingPracticePassage
): PublicReadingPracticePassage {
  return {
    ...passage,
    questions: passage.questions.map(({ id, options, prompt, skillFocus, type }) => ({
      id,
      type,
      prompt,
      options,
      skillFocus,
    })),
  }
}

export function listReadingPracticeTopics(
  passages: SearchableReadingPracticePassage[] = readingPracticePassages
) {
  return [allTopicsOption, ...new Set(passages.map((passage) => passage.topic))]
}

export function summarizeReadingPracticePassages(
  passages: SearchableReadingPracticePassage[] = readingPracticePassages
): ReadingPracticeSummary {
  const totalMinutes = passages.reduce(
    (total, passage) => total + passage.estimatedMinutes,
    0
  )

  return {
    totalPassages: passages.length,
    guidedPassages: passages.filter((passage) => passage.difficulty === 'Guided')
      .length,
    balancedPassages: passages.filter(
      (passage) => passage.difficulty === 'Balanced'
    ).length,
    stretchPassages: passages.filter((passage) => passage.difficulty === 'Stretch')
      .length,
    totalQuestions: passages.reduce(
      (total, passage) => total + passage.questions.length,
      0
    ),
    averageMinutes: passages.length ? Math.round(totalMinutes / passages.length) : 0,
    topics: new Set(passages.map((passage) => passage.topic)).size,
  }
}

export function filterReadingPracticePassages<
  T extends SearchableReadingPracticePassage = ReadingPracticePassage,
>({
  passages,
  query = '',
  difficulty = 'All',
  topic = allTopicsOption,
}: {
  passages?: T[]
  query?: string
  difficulty?: ReadingPracticeDifficultyFilter
  topic?: string
}) {
  const source = (passages ?? readingPracticePassages) as T[]
  const normalizedQuery = normalizeSearchValue(query)

  return source.filter((passage) => {
    const matchesDifficulty =
      difficulty === 'All' || passage.difficulty === difficulty
    const matchesTopic = topic === allTopicsOption || passage.topic === topic
    const matchesQuery =
      !normalizedQuery ||
      normalizeSearchValue(searchableText(passage)).includes(normalizedQuery)

    return matchesDifficulty && matchesTopic && matchesQuery
  })
}

export function parseReadingPracticeDifficultyFilter(
  value: string | null
): ReadingPracticeDifficultyFilter {
  return value === 'Guided' || value === 'Balanced' || value === 'Stretch'
    ? value
    : 'All'
}

export function parseReadingPracticeTopicFilter(
  value: string | null,
  passages: ReadingPracticePassage[] = readingPracticePassages
) {
  const topics = listReadingPracticeTopics(passages)

  return value && topics.includes(value) ? value : allTopicsOption
}

export function scoreReadingPracticeAttempt(
  payload: unknown,
  passages: ReadingPracticePassage[] = readingPracticePassages
): ReadingPracticeScoreResponse {
  if (!payload || typeof payload !== 'object') {
    return {
      ok: false,
      error: invalidPayloadMessage,
    }
  }

  const { answers, passageId } = payload as Partial<ReadingPracticeAttemptInput>

  if (
    typeof passageId !== 'string' ||
    !answers ||
    typeof answers !== 'object' ||
    Array.isArray(answers)
  ) {
    return {
      ok: false,
      error: invalidPayloadMessage,
    }
  }

  const passage = passages.find((candidate) => candidate.id === passageId)

  if (!passage) {
    return {
      ok: false,
      error: unknownPassageMessage,
    }
  }

  const normalizedAnswers = answers as ReadingPracticeAnswerMap
  const questionResults = passage.questions.map((question) => {
    const userAnswer = normalizedAnswers[question.id]?.trim() ?? ''

    return {
      questionId: question.id,
      prompt: question.prompt,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect:
        userAnswer.toLowerCase() === question.correctAnswer.toLowerCase(),
      explanation: question.explanation,
      skillFocus: question.skillFocus,
    }
  })
  const totalQuestions = questionResults.length
  const answeredQuestions = questionResults.filter(
    (result) => result.userAnswer.length > 0
  ).length
  const correctAnswers = questionResults.filter((result) => result.isCorrect).length
  const accuracy = totalQuestions
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0
  const status = getStatus(accuracy)

  return {
    ok: true,
    score: {
      passageId: passage.id,
      passageTitle: passage.title,
      topic: passage.topic,
      difficulty: passage.difficulty,
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      accuracy,
      estimatedBand: getEstimatedBand(accuracy),
      status,
      statusLabel: getStatusLabel(status),
      summary: buildScoreSummary({
        accuracy,
        correctAnswers,
        totalQuestions,
      }),
      nextActions: buildNextActions(questionResults),
      questionResults,
    },
  }
}
