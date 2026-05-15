import { requireLearnerAppSession } from '@/lib/auth/service'
import {
  filterSpeakingPracticePrompts,
  listSpeakingPracticeTopics,
  parseSpeakingPracticeDifficultyFilter,
  parseSpeakingPracticePartFilter,
  parseSpeakingPracticeTopicFilter,
  scoreSpeakingPracticeAttempt,
  speakingPracticePrompts,
  summarizeSpeakingPracticePrompts,
} from '@/lib/ielts/speaking-practice'

export async function GET(request: Request) {
  await requireLearnerAppSession()

  const url = new URL(request.url)
  const query = url.searchParams.get('query') ?? ''
  const part = parseSpeakingPracticePartFilter(url.searchParams.get('part'))
  const difficulty = parseSpeakingPracticeDifficultyFilter(
    url.searchParams.get('difficulty')
  )
  const topic = parseSpeakingPracticeTopicFilter(
    url.searchParams.get('topic'),
    speakingPracticePrompts
  )
  const prompts = filterSpeakingPracticePrompts({
    prompts: speakingPracticePrompts,
    query,
    part,
    difficulty,
    topic,
  })

  return Response.json({
    ok: true,
    prompts,
    summary: summarizeSpeakingPracticePrompts(prompts),
    topics: listSpeakingPracticeTopics(speakingPracticePrompts),
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

  const result = scoreSpeakingPracticeAttempt(payload)

  if (!result.ok) {
    const status =
      result.error === 'The selected speaking prompt could not be found.'
        ? 404
        : 400

    return Response.json(result, { status })
  }

  return Response.json(result)
}
