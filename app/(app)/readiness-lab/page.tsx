import { ReadinessLabWorkspace } from './_components/readiness-lab-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { listWritingPrompts } from '@/lib/ielts/writing-prompts-repository'

export default async function ReadinessLabPage() {
  await requireLearnerAppSession()

  const { prompts } = await listWritingPrompts()

  return <ReadinessLabWorkspace prompts={prompts} />
}
