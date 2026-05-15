import { requireLearnerAppSession } from '@/lib/auth/service'
import {
  filterRevisionChecklistItems,
  parseRevisionChecklistCriterionFilter,
  parseRevisionChecklistPriorityFilter,
  parseRevisionChecklistTaskFilter,
  summarizeRevisionChecklist,
} from '@/lib/ielts/revision-checklist'

export async function GET(request: Request) {
  await requireLearnerAppSession()

  const searchParams = new URL(request.url).searchParams
  const items = filterRevisionChecklistItems({
    query: searchParams.get('query') ?? '',
    taskType: parseRevisionChecklistTaskFilter(searchParams.get('taskType')),
    criterion: parseRevisionChecklistCriterionFilter(searchParams.get('criterion')),
    priorityLevel: parseRevisionChecklistPriorityFilter(
      searchParams.get('priorityLevel')
    ),
  })

  return Response.json({
    ok: true,
    items,
    summary: summarizeRevisionChecklist(items),
  })
}
