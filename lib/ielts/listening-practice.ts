export type ListeningPracticeDifficulty = 'Guided' | 'Balanced' | 'Stretch'

export type ListeningPracticeDifficultyFilter =
  | 'All'
  | ListeningPracticeDifficulty

export type ListeningPracticeSectionFilter =
  | 'All'
  | ListeningPracticeTrack['section']

export type ListeningQuestionType =
  | 'Multiple choice'
  | 'Form completion'
  | 'Matching'

export type ListeningTranscriptTurn = {
  speaker: string
  text: string
}

export type ListeningQuestion = {
  id: string
  type: ListeningQuestionType
  prompt: string
  options: string[]
  correctAnswer: string
  explanation: string
  skillFocus: string
}

export type PublicListeningQuestion = Omit<
  ListeningQuestion,
  'correctAnswer' | 'explanation'
>

export type ListeningPracticeTrack = {
  id: string
  title: string
  section: 'Part 1' | 'Part 2' | 'Part 3' | 'Part 4'
  topic: string
  difficulty: ListeningPracticeDifficulty
  accent: 'Australian' | 'British' | 'Canadian' | 'New Zealand'
  estimatedMinutes: number
  summary: string
  audioCue: string
  transcript: ListeningTranscriptTurn[]
  questions: ListeningQuestion[]
}

export type PublicListeningPracticeTrack = Omit<
  ListeningPracticeTrack,
  'questions'
> & {
  questions: PublicListeningQuestion[]
}

export type ListeningPracticeSummary = {
  totalTracks: number
  guidedTracks: number
  balancedTracks: number
  stretchTracks: number
  totalQuestions: number
  averageMinutes: number
  topics: number
}

export type ListeningPracticeAnswerMap = Record<string, string>

export type ListeningPracticeAttemptInput = {
  trackId: string
  answers: ListeningPracticeAnswerMap
  notes?: string
}

export type ListeningQuestionResult = {
  questionId: string
  prompt: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  explanation: string
  skillFocus: string
}

export type ListeningPracticeScoreStatus =
  | 'needs-replay'
  | 'building-control'
  | 'strong-control'

export type ListeningPracticeScore = {
  trackId: string
  trackTitle: string
  section: ListeningPracticeTrack['section']
  topic: string
  difficulty: ListeningPracticeDifficulty
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  accuracy: number
  estimatedBand: number
  status: ListeningPracticeScoreStatus
  statusLabel: string
  summary: string
  nextActions: string[]
  questionResults: ListeningQuestionResult[]
}

export type ListeningPracticeScoreSuccess = {
  ok: true
  score: ListeningPracticeScore
}

export type ListeningPracticeScoreFailure = {
  ok: false
  error: string
}

export type ListeningPracticeScoreResponse =
  | ListeningPracticeScoreSuccess
  | ListeningPracticeScoreFailure

const allTopicsOption = 'All topics'
const invalidPayloadMessage = 'Invalid listening practice payload.'
const unknownTrackMessage = 'The selected listening track could not be found.'

type SearchableListeningPracticeTrack =
  | ListeningPracticeTrack
  | PublicListeningPracticeTrack

export const listeningPracticeTracks: ListeningPracticeTrack[] = [
  {
    id: 'listening-library-membership',
    title: 'Library membership enquiry',
    section: 'Part 1',
    topic: 'Daily services',
    difficulty: 'Guided',
    accent: 'British',
    estimatedMinutes: 8,
    summary:
      'A short service conversation about joining a library and booking study rooms.',
    audioCue:
      'You will hear a learner calling a city library to ask about membership options.',
    transcript: [
      {
        speaker: 'Receptionist',
        text: 'Good morning, Westbridge Library. How can I help you?',
      },
      {
        speaker: 'Student',
        text: 'Hello. I have just moved nearby, and I would like to join the library.',
      },
      {
        speaker: 'Receptionist',
        text: 'Of course. Standard membership is free for local residents. You only need proof of address and a photo ID.',
      },
      {
        speaker: 'Student',
        text: 'That sounds simple. Can members book study rooms as well?',
      },
      {
        speaker: 'Receptionist',
        text: 'Yes, small rooms can be booked for two hours at a time. The quiet rooms are on the second floor.',
      },
      {
        speaker: 'Student',
        text: 'Is there a charge for printing documents?',
      },
      {
        speaker: 'Receptionist',
        text: 'Black-and-white printing is ten pence per page, and colour printing is thirty pence.',
      },
      {
        speaker: 'Student',
        text: 'Great. I will bring my rental contract and passport tomorrow afternoon.',
      },
    ],
    questions: [
      {
        id: 'library-membership-q1',
        type: 'Form completion',
        prompt: 'Standard membership is free for local ____.',
        options: ['residents', 'students', 'visitors', 'children'],
        correctAnswer: 'residents',
        explanation:
          'The receptionist says standard membership is free for local residents.',
        skillFocus: 'form detail',
      },
      {
        id: 'library-membership-q2',
        type: 'Multiple choice',
        prompt: 'What documents does the learner need to join?',
        options: [
          'Proof of address and photo ID',
          'A university card and bank statement',
          'A passport and library reference',
          'A printed application and two photos',
        ],
        correctAnswer: 'Proof of address and photo ID',
        explanation:
          'The receptionist says proof of address and a photo ID are required.',
        skillFocus: 'detail matching',
      },
      {
        id: 'library-membership-q3',
        type: 'Form completion',
        prompt: 'Small study rooms can be booked for ____ hours.',
        options: ['two', 'three', 'four', 'six'],
        correctAnswer: 'two',
        explanation:
          'The receptionist says small rooms can be booked for two hours at a time.',
        skillFocus: 'number listening',
      },
      {
        id: 'library-membership-q4',
        type: 'Multiple choice',
        prompt: 'Where are the quiet study rooms?',
        options: [
          'On the second floor',
          'Near the entrance',
          'Beside the cafe',
          'Behind the printing desk',
        ],
        correctAnswer: 'On the second floor',
        explanation:
          'The receptionist directly states that quiet rooms are on the second floor.',
        skillFocus: 'location detail',
      },
      {
        id: 'library-membership-q5',
        type: 'Form completion',
        prompt: 'Colour printing costs ____ pence per page.',
        options: ['thirty', 'ten', 'twenty', 'fifty'],
        correctAnswer: 'thirty',
        explanation:
          'Colour printing is described as thirty pence per page.',
        skillFocus: 'price listening',
      },
    ],
  },
  {
    id: 'listening-museum-tour',
    title: 'Museum volunteer tour',
    section: 'Part 2',
    topic: 'Culture and community',
    difficulty: 'Balanced',
    accent: 'Australian',
    estimatedMinutes: 10,
    summary:
      'A museum guide explains the layout, visitor rules, and volunteer activities.',
    audioCue:
      'You will hear a guide introducing a community museum tour to new volunteers.',
    transcript: [
      {
        speaker: 'Guide',
        text: 'Welcome to the Riverside Museum volunteer tour. We will begin in the entrance hall before moving to the transport gallery.',
      },
      {
        speaker: 'Guide',
        text: 'The transport gallery is popular with school groups because it has a restored tram and a hands-on signal display.',
      },
      {
        speaker: 'Guide',
        text: 'Please remind visitors not to touch the glass cases in the local history room. The objects are small and easily damaged.',
      },
      {
        speaker: 'Guide',
        text: 'On weekends, volunteers help at the information desk, guide families to workshops, and collect visitor feedback.',
      },
      {
        speaker: 'Guide',
        text: 'The temporary exhibition is upstairs. This month it focuses on river trade and how the town developed around the port.',
      },
      {
        speaker: 'Guide',
        text: 'If a visitor asks about accessibility, tell them the lift is beside the gift shop, not next to the cafe.',
      },
    ],
    questions: [
      {
        id: 'museum-tour-q1',
        type: 'Multiple choice',
        prompt: 'Where does the tour begin?',
        options: [
          'The entrance hall',
          'The transport gallery',
          'The local history room',
          'The gift shop',
        ],
        correctAnswer: 'The entrance hall',
        explanation:
          'The guide says the tour will begin in the entrance hall.',
        skillFocus: 'sequence',
      },
      {
        id: 'museum-tour-q2',
        type: 'Matching',
        prompt: 'The transport gallery is popular with school groups because it has a restored ____.',
        options: ['tram', 'ship', 'bus', 'train'],
        correctAnswer: 'tram',
        explanation:
          'The guide mentions a restored tram and a hands-on signal display.',
        skillFocus: 'keyword recognition',
      },
      {
        id: 'museum-tour-q3',
        type: 'Multiple choice',
        prompt: 'Which rule should volunteers remind visitors about?',
        options: [
          'Do not touch the glass cases',
          'Do not enter the transport gallery',
          'Do not ask about workshops',
          'Do not use the lift',
        ],
        correctAnswer: 'Do not touch the glass cases',
        explanation:
          'The guide asks volunteers to remind visitors not to touch the glass cases.',
        skillFocus: 'instruction detail',
      },
      {
        id: 'museum-tour-q4',
        type: 'Form completion',
        prompt: 'The temporary exhibition focuses on river ____.',
        options: ['trade', 'wildlife', 'pollution', 'engineering'],
        correctAnswer: 'trade',
        explanation:
          'The temporary exhibition is about river trade and the town around the port.',
        skillFocus: 'topic detail',
      },
      {
        id: 'museum-tour-q5',
        type: 'Multiple choice',
        prompt: 'Where is the lift located?',
        options: [
          'Beside the gift shop',
          'Next to the cafe',
          'Inside the transport gallery',
          'Behind the information desk',
        ],
        correctAnswer: 'Beside the gift shop',
        explanation:
          'The guide corrects a possible confusion and says the lift is beside the gift shop.',
        skillFocus: 'distractor control',
      },
    ],
  },
  {
    id: 'listening-research-seminar',
    title: 'Seminar on urban gardens',
    section: 'Part 4',
    topic: 'Environment and society',
    difficulty: 'Stretch',
    accent: 'Canadian',
    estimatedMinutes: 12,
    summary:
      'An academic talk about urban gardens, community outcomes, and research limitations.',
    audioCue:
      'You will hear part of a university seminar about the effects of urban gardens.',
    transcript: [
      {
        speaker: 'Lecturer',
        text: 'Today we are looking at urban gardens, not as decorative spaces, but as small systems that can influence food access and social connection.',
      },
      {
        speaker: 'Lecturer',
        text: 'A recent study compared three neighbourhoods with long-running community gardens and two similar neighbourhoods without them.',
      },
      {
        speaker: 'Lecturer',
        text: 'The strongest finding was not a dramatic improvement in diet. Instead, residents reported more frequent informal conversations with neighbours.',
      },
      {
        speaker: 'Lecturer',
        text: 'This matters because social trust can affect whether people share local information, borrow tools, or support older residents during emergencies.',
      },
      {
        speaker: 'Lecturer',
        text: 'However, the researchers were careful about limitations. The gardens were already managed by active local groups, so the results may not apply to every district.',
      },
      {
        speaker: 'Lecturer',
        text: 'The next stage of research will examine whether training new organisers is more important than the physical size of the garden itself.',
      },
    ],
    questions: [
      {
        id: 'urban-gardens-q1',
        type: 'Multiple choice',
        prompt: 'What is the lecture mainly about?',
        options: [
          'Urban gardens as systems that affect food access and social connection',
          'The history of decorative garden design',
          'Emergency planning in older residential buildings',
          'How to measure the cost of public parks',
        ],
        correctAnswer:
          'Urban gardens as systems that affect food access and social connection',
        explanation:
          'The lecturer frames urban gardens as systems influencing food access and social connection.',
        skillFocus: 'main idea',
      },
      {
        id: 'urban-gardens-q2',
        type: 'Form completion',
        prompt: 'The study compared three neighbourhoods with gardens and ____ without them.',
        options: ['two', 'four', 'five', 'six'],
        correctAnswer: 'two',
        explanation:
          'The lecturer says the study compared three garden neighbourhoods and two similar neighbourhoods without them.',
        skillFocus: 'number listening',
      },
      {
        id: 'urban-gardens-q3',
        type: 'Multiple choice',
        prompt: 'What was the strongest finding?',
        options: [
          'Residents had more informal conversations with neighbours',
          'Residents completely changed their diets',
          'Gardens reduced all emergency risks',
          'Physical garden size explained every result',
        ],
        correctAnswer:
          'Residents had more informal conversations with neighbours',
        explanation:
          'The lecturer says the strongest finding was more frequent informal conversations.',
        skillFocus: 'contrast listening',
      },
      {
        id: 'urban-gardens-q4',
        type: 'Matching',
        prompt: 'Social trust may help residents support older people during ____.',
        options: ['emergencies', 'lectures', 'rent increases', 'garden contests'],
        correctAnswer: 'emergencies',
        explanation:
          'The lecture connects social trust with supporting older residents during emergencies.',
        skillFocus: 'detail matching',
      },
      {
        id: 'urban-gardens-q5',
        type: 'Multiple choice',
        prompt: 'What limitation do the researchers mention?',
        options: [
          'The gardens were already managed by active local groups',
          'The study had no comparison neighbourhoods',
          'Residents refused to speak with researchers',
          'The gardens were decorative rather than productive',
        ],
        correctAnswer:
          'The gardens were already managed by active local groups',
        explanation:
          'The lecturer says the gardens were already managed by active local groups, which may limit wider application.',
        skillFocus: 'limitation recognition',
      },
    ],
  },
]

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase()
}

function searchableText(track: SearchableListeningPracticeTrack) {
  return [
    track.title,
    track.section,
    track.topic,
    track.difficulty,
    track.accent,
    track.summary,
    track.audioCue,
    ...track.transcript.flatMap((turn) => [turn.speaker, turn.text]),
    ...track.questions.flatMap((question) => [
      question.type,
      question.prompt,
      question.skillFocus,
      ...question.options,
    ]),
  ].join(' ')
}

function getStatus(accuracy: number): ListeningPracticeScoreStatus {
  if (accuracy >= 80) {
    return 'strong-control'
  }

  return accuracy >= 60 ? 'building-control' : 'needs-replay'
}

function getStatusLabel(status: ListeningPracticeScoreStatus) {
  switch (status) {
    case 'strong-control':
      return 'Strong control'
    case 'building-control':
      return 'Building control'
    case 'needs-replay':
      return 'Needs replay'
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
    return `You answered ${correctAnswers} of ${totalQuestions} questions correctly. Your listening control is strong enough to increase speed pressure.`
  }

  if (accuracy >= 60) {
    return `You answered ${correctAnswers} of ${totalQuestions} questions correctly. Replay the track and focus on the missed skill areas.`
  }

  return `You answered ${correctAnswers} of ${totalQuestions} questions correctly. Replay in smaller chunks and rebuild the notes before scoring again.`
}

function buildNextActions(results: ListeningQuestionResult[], notes: string) {
  const missedFocusAreas = [
    ...new Set(
      results
        .filter((result) => !result.isCorrect)
        .map((result) => result.skillFocus)
    ),
  ]
  const actions = missedFocusAreas.length
    ? [
        `Replay the track for ${missedFocusAreas.slice(0, 2).join(' and ')}.`,
        'Write the exact words that prove each missed answer.',
        'Retry the same questions without opening the transcript.',
      ]
    : [
        'Repeat the track at exam speed without pausing.',
        'Summarize the conversation from memory in three bullet points.',
      ]

  if (notes.trim().length < 20) {
    actions.push('Add short notes while listening so details do not disappear.')
  }

  return actions
}

export function toPublicListeningPracticeTrack(
  track: ListeningPracticeTrack
): PublicListeningPracticeTrack {
  return {
    ...track,
    questions: track.questions.map(({ id, options, prompt, skillFocus, type }) => ({
      id,
      type,
      prompt,
      options,
      skillFocus,
    })),
  }
}

export function listListeningPracticeTopics(
  tracks: SearchableListeningPracticeTrack[] = listeningPracticeTracks
) {
  return [allTopicsOption, ...new Set(tracks.map((track) => track.topic))]
}

export function summarizeListeningPracticeTracks(
  tracks: SearchableListeningPracticeTrack[] = listeningPracticeTracks
): ListeningPracticeSummary {
  const totalMinutes = tracks.reduce(
    (total, track) => total + track.estimatedMinutes,
    0
  )

  return {
    totalTracks: tracks.length,
    guidedTracks: tracks.filter((track) => track.difficulty === 'Guided').length,
    balancedTracks: tracks.filter((track) => track.difficulty === 'Balanced')
      .length,
    stretchTracks: tracks.filter((track) => track.difficulty === 'Stretch')
      .length,
    totalQuestions: tracks.reduce(
      (total, track) => total + track.questions.length,
      0
    ),
    averageMinutes: tracks.length ? Math.round(totalMinutes / tracks.length) : 0,
    topics: new Set(tracks.map((track) => track.topic)).size,
  }
}

export function filterListeningPracticeTracks<
  T extends SearchableListeningPracticeTrack = ListeningPracticeTrack,
>({
  tracks,
  query = '',
  section = 'All',
  difficulty = 'All',
  topic = allTopicsOption,
}: {
  tracks?: T[]
  query?: string
  section?: ListeningPracticeSectionFilter
  difficulty?: ListeningPracticeDifficultyFilter
  topic?: string
}) {
  const source = (tracks ?? listeningPracticeTracks) as T[]
  const normalizedQuery = normalizeSearchValue(query)

  return source.filter((track) => {
    const matchesSection = section === 'All' || track.section === section
    const matchesDifficulty =
      difficulty === 'All' || track.difficulty === difficulty
    const matchesTopic = topic === allTopicsOption || track.topic === topic
    const matchesQuery =
      !normalizedQuery ||
      normalizeSearchValue(searchableText(track)).includes(normalizedQuery)

    return matchesSection && matchesDifficulty && matchesTopic && matchesQuery
  })
}

export function parseListeningPracticeSectionFilter(
  value: string | null
): ListeningPracticeSectionFilter {
  return value === 'Part 1' ||
    value === 'Part 2' ||
    value === 'Part 3' ||
    value === 'Part 4'
    ? value
    : 'All'
}

export function parseListeningPracticeDifficultyFilter(
  value: string | null
): ListeningPracticeDifficultyFilter {
  return value === 'Guided' || value === 'Balanced' || value === 'Stretch'
    ? value
    : 'All'
}

export function parseListeningPracticeTopicFilter(
  value: string | null,
  tracks: ListeningPracticeTrack[] = listeningPracticeTracks
) {
  const topics = listListeningPracticeTopics(tracks)

  return value && topics.includes(value) ? value : allTopicsOption
}

export function scoreListeningPracticeAttempt(
  payload: unknown,
  tracks: ListeningPracticeTrack[] = listeningPracticeTracks
): ListeningPracticeScoreResponse {
  if (!payload || typeof payload !== 'object') {
    return {
      ok: false,
      error: invalidPayloadMessage,
    }
  }

  const {
    answers,
    notes = '',
    trackId,
  } = payload as Partial<ListeningPracticeAttemptInput>

  if (
    typeof trackId !== 'string' ||
    !answers ||
    typeof answers !== 'object' ||
    Array.isArray(answers) ||
    typeof notes !== 'string'
  ) {
    return {
      ok: false,
      error: invalidPayloadMessage,
    }
  }

  const track = tracks.find((candidate) => candidate.id === trackId)

  if (!track) {
    return {
      ok: false,
      error: unknownTrackMessage,
    }
  }

  const normalizedAnswers = answers as ListeningPracticeAnswerMap
  const questionResults = track.questions.map((question) => {
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
      trackId: track.id,
      trackTitle: track.title,
      section: track.section,
      topic: track.topic,
      difficulty: track.difficulty,
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
      nextActions: buildNextActions(questionResults, notes),
      questionResults,
    },
  }
}
