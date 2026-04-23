import { WritingPracticeWorkspace } from './_components/writing-practice-workspace'
import { listWritingPrompts } from '@/lib/ielts/writing-prompts-repository'

export default async function WritingPage() {
  const { prompts } = await listWritingPrompts()

  return <WritingPracticeWorkspace prompts={prompts} />
}
