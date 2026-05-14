import { requireLearnerAppSession } from '@/lib/auth/service'
import {
  getWritingRubric,
  summarizeWritingRubric,
  type RubricTaskType,
} from '@/lib/ielts/writing-rubric'

function parseTaskType(value: string | null): RubricTaskType {
  return value === 'Task 1' ? 'Task 1' : 'Task 2'
}

export async function GET(request: Request) {
  await requireLearnerAppSession()

  const url = new URL(request.url)
  const taskType = parseTaskType(url.searchParams.get('taskType'))
  const criteria = getWritingRubric(taskType)

  return Response.json({
    ok: true,
    taskType,
    criteria,
    summary: summarizeWritingRubric(criteria),
  })
}
