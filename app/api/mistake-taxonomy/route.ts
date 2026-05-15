import { requireLearnerAppSession } from '@/lib/auth/service'
import {
  filterMistakeTaxonomy,
  parseMistakeTaxonomyCriterionFilter,
  parseMistakeTaxonomyTaskFilter,
  summarizeMistakeTaxonomy,
} from '@/lib/ielts/mistake-taxonomy'

export async function GET(request: Request) {
  await requireLearnerAppSession()

  const searchParams = new URL(request.url).searchParams
  const items = filterMistakeTaxonomy({
    query: searchParams.get('query') ?? '',
    taskType: parseMistakeTaxonomyTaskFilter(searchParams.get('taskType')),
    criterion: parseMistakeTaxonomyCriterionFilter(searchParams.get('criterion')),
  })

  return Response.json({
    ok: true,
    items,
    summary: summarizeMistakeTaxonomy(items),
  })
}
