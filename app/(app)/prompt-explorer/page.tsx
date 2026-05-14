import { PromptExplorerWorkspace } from './_components/prompt-explorer-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { listWritingPrompts } from '@/lib/ielts/writing-prompts-repository'

export default async function PromptExplorerPage() {
  await requireLearnerAppSession()
  const { prompts, storageMode } = await listWritingPrompts()

  return <PromptExplorerWorkspace prompts={prompts} storageMode={storageMode} />
}
