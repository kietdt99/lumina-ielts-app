import { IdeaBankWorkspace } from './_components/idea-bank-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { ideaBankEntries } from '@/lib/ielts/idea-bank'

export default async function IdeaBankPage() {
  await requireLearnerAppSession()

  return <IdeaBankWorkspace entries={ideaBankEntries} />
}
