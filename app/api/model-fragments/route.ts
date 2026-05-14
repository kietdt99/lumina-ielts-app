import { requireLearnerAppSession } from '@/lib/auth/service'
import {
  filterModelFragments,
  parseModelFragmentFunctionFilter,
  parseModelFragmentTaskFilter,
  summarizeModelFragments,
} from '@/lib/ielts/model-fragments'

export async function GET(request: Request) {
  await requireLearnerAppSession()

  const url = new URL(request.url)
  const query = url.searchParams.get('query') ?? ''
  const taskType = parseModelFragmentTaskFilter(url.searchParams.get('taskType'))
  const functionType = parseModelFragmentFunctionFilter(
    url.searchParams.get('functionType')
  )
  const fragments = filterModelFragments({
    query,
    taskType,
    functionType,
  })

  return Response.json({
    ok: true,
    fragments,
    summary: summarizeModelFragments(fragments),
  })
}
