import { WritingPracticeWorkspace } from './_components/writing-practice-workspace'
import { writingPrompts } from '@/lib/ielts/writing-prompts'

export default function WritingPage() {
  return <WritingPracticeWorkspace prompts={writingPrompts} />
}
