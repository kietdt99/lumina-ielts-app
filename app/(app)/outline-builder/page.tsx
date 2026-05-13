import { OutlineBuilderWorkspace } from './_components/outline-builder-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { ideaBankEntries } from '@/lib/ielts/idea-bank'
import { writingPrompts } from '@/lib/ielts/writing-prompts'

export default async function OutlineBuilderPage() {
  await requireLearnerAppSession()

  return (
    <OutlineBuilderWorkspace
      ideaBankEntries={ideaBankEntries}
      prompts={writingPrompts}
    />
  )
}
