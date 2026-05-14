import { RevisionChecklistWorkspace } from './_components/revision-checklist-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { revisionChecklistItems } from '@/lib/ielts/revision-checklist'

export default async function RevisionChecklistPage() {
  await requireLearnerAppSession()

  return <RevisionChecklistWorkspace items={revisionChecklistItems} />
}
