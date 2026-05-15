import { SpeakingPracticeWorkspace } from './_components/speaking-practice-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { speakingPracticePrompts } from '@/lib/ielts/speaking-practice'

export default async function SpeakingPracticePage() {
  await requireLearnerAppSession()

  return <SpeakingPracticeWorkspace prompts={speakingPracticePrompts} />
}
