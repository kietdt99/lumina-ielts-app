import { requireLearnerAppSession } from '@/lib/auth/service'
import {
  filterPracticeSprints,
  listPracticeSprintTopics,
  parsePracticeSprintDifficultyFilter,
  parsePracticeSprintTaskFilter,
  parsePracticeSprintTopicFilter,
  practiceSprints,
  summarizePracticeSprints,
} from '@/lib/ielts/practice-sprint'

export async function GET(request: Request) {
  await requireLearnerAppSession()

  const url = new URL(request.url)
  const query = url.searchParams.get('query') ?? ''
  const taskType = parsePracticeSprintTaskFilter(url.searchParams.get('taskType'))
  const difficulty = parsePracticeSprintDifficultyFilter(
    url.searchParams.get('difficulty')
  )
  const topic = parsePracticeSprintTopicFilter(
    url.searchParams.get('topic'),
    practiceSprints
  )
  const sprints = filterPracticeSprints({
    sprints: practiceSprints,
    query,
    taskType,
    difficulty,
    topic,
  })

  return Response.json({
    ok: true,
    sprints,
    summary: summarizePracticeSprints(sprints),
    topics: listPracticeSprintTopics(practiceSprints),
  })
}
