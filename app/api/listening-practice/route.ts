import { requireLearnerAppSession } from '@/lib/auth/service'
import {
  filterListeningPracticeTracks,
  listeningPracticeTracks,
  listListeningPracticeTopics,
  parseListeningPracticeDifficultyFilter,
  parseListeningPracticeSectionFilter,
  parseListeningPracticeTopicFilter,
  scoreListeningPracticeAttempt,
  summarizeListeningPracticeTracks,
  toPublicListeningPracticeTrack,
} from '@/lib/ielts/listening-practice'

export async function GET(request: Request) {
  await requireLearnerAppSession()

  const url = new URL(request.url)
  const query = url.searchParams.get('query') ?? ''
  const section = parseListeningPracticeSectionFilter(
    url.searchParams.get('section')
  )
  const difficulty = parseListeningPracticeDifficultyFilter(
    url.searchParams.get('difficulty')
  )
  const topic = parseListeningPracticeTopicFilter(
    url.searchParams.get('topic'),
    listeningPracticeTracks
  )
  const tracks = filterListeningPracticeTracks({
    tracks: listeningPracticeTracks,
    query,
    section,
    difficulty,
    topic,
  })

  return Response.json({
    ok: true,
    tracks: tracks.map(toPublicListeningPracticeTrack),
    summary: summarizeListeningPracticeTracks(tracks),
    topics: listListeningPracticeTopics(listeningPracticeTracks),
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

  const result = scoreListeningPracticeAttempt(payload)

  if (!result.ok) {
    const status =
      result.error === 'The selected listening track could not be found.'
        ? 404
        : 400

    return Response.json(result, { status })
  }

  return Response.json(result)
}
