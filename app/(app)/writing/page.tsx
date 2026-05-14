import { WritingPracticeWorkspace } from './_components/writing-practice-workspace'
import { listWritingPrompts } from '@/lib/ielts/writing-prompts-repository'

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function WritingPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
} = {}) {
  const { prompts } = await listWritingPrompts()
  const params = (await searchParams) ?? {}
  const initialPromptId = firstSearchParam(params.promptId)
  const shouldShowOutline = firstSearchParam(params.outline) === '1'

  return (
    <WritingPracticeWorkspace
      initialPromptId={initialPromptId}
      prompts={prompts}
      showOutline={shouldShowOutline}
    />
  )
}
