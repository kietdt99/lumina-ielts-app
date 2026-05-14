import { requireLearnerAppSession } from '@/lib/auth/service'
import { listWritingPrompts } from '@/lib/ielts/writing-prompts-repository'
import {
  filterWritingPrompts,
  listWritingPromptTopics,
  parseWritingPromptDifficultyFilter,
  parseWritingPromptTaskFilter,
  summarizeWritingPrompts,
} from '@/lib/ielts/writing-prompts'

export async function GET(request: Request) {
  await requireLearnerAppSession()

  const { prompts, storageMode } = await listWritingPrompts()
  const searchParams = new URL(request.url).searchParams
  const filteredPrompts = filterWritingPrompts({
    prompts,
    query: searchParams.get('query') ?? '',
    taskType: parseWritingPromptTaskFilter(searchParams.get('taskType')),
    difficulty: parseWritingPromptDifficultyFilter(searchParams.get('difficulty')),
    topic: searchParams.get('topic') ?? 'All topics',
  })

  return Response.json({
    ok: true,
    prompts: filteredPrompts,
    summary: summarizeWritingPrompts(filteredPrompts),
    topics: listWritingPromptTopics(prompts),
    storageMode,
  })
}
