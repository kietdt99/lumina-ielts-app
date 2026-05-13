import { requireLearnerAppSession } from '@/lib/auth/service'
import {
  filterIdeaBankEntries,
  parseIdeaBankTaskFilter,
  summarizeIdeaBank,
} from '@/lib/ielts/idea-bank'

export async function GET(request: Request) {
  await requireLearnerAppSession()

  const url = new URL(request.url)
  const query = url.searchParams.get('query') ?? ''
  const taskType = parseIdeaBankTaskFilter(url.searchParams.get('taskType'))
  const entries = filterIdeaBankEntries({ query, taskType })

  return Response.json({
    ok: true,
    entries,
    summary: summarizeIdeaBank(entries),
  })
}
