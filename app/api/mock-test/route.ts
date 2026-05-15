import { requireLearnerAppSession } from '@/lib/auth/service'
import {
  filterWritingMockTests,
  listWritingMockTestTopics,
  parseMockTestDifficultyFilter,
  parseMockTestTopicFilter,
  summarizeWritingMockTests,
  writingMockTests,
} from '@/lib/ielts/mock-test-lab'

export async function GET(request: Request) {
  await requireLearnerAppSession()

  const url = new URL(request.url)
  const query = url.searchParams.get('query') ?? ''
  const difficulty = parseMockTestDifficultyFilter(
    url.searchParams.get('difficulty')
  )
  const topic = parseMockTestTopicFilter(
    url.searchParams.get('topic'),
    writingMockTests
  )
  const tests = filterWritingMockTests({
    tests: writingMockTests,
    query,
    difficulty,
    topic,
  })

  return Response.json({
    ok: true,
    tests,
    summary: summarizeWritingMockTests(tests),
    topics: listWritingMockTestTopics(writingMockTests),
  })
}
