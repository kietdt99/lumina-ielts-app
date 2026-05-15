import { requireLearnerAppSession } from '@/lib/auth/service'
import {
  filterReadingPracticePassages,
  listReadingPracticeTopics,
  parseReadingPracticeDifficultyFilter,
  parseReadingPracticeTopicFilter,
  readingPracticePassages,
  scoreReadingPracticeAttempt,
  summarizeReadingPracticePassages,
  toPublicReadingPracticePassage,
} from '@/lib/ielts/reading-practice'

export async function GET(request: Request) {
  await requireLearnerAppSession()

  const url = new URL(request.url)
  const query = url.searchParams.get('query') ?? ''
  const difficulty = parseReadingPracticeDifficultyFilter(
    url.searchParams.get('difficulty')
  )
  const topic = parseReadingPracticeTopicFilter(
    url.searchParams.get('topic'),
    readingPracticePassages
  )
  const passages = filterReadingPracticePassages({
    passages: readingPracticePassages,
    query,
    difficulty,
    topic,
  })

  return Response.json({
    ok: true,
    passages: passages.map(toPublicReadingPracticePassage),
    summary: summarizeReadingPracticePassages(passages),
    topics: listReadingPracticeTopics(readingPracticePassages),
  })
}

export async function POST(request: Request) {
  await requireLearnerAppSession()

  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return Response.json(
      {
        ok: false,
        error: 'Request body must be valid JSON.',
      },
      { status: 400 }
    )
  }

  const result = scoreReadingPracticeAttempt(payload)

  if (!result.ok) {
    const status =
      result.error === 'The selected reading passage could not be found.'
        ? 404
        : 400

    return Response.json(result, { status })
  }

  return Response.json(result)
}
