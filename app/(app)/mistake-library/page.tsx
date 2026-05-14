import { MistakeLibraryWorkspace } from './_components/mistake-library-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { writingMistakeTaxonomy } from '@/lib/ielts/mistake-taxonomy'

export default async function MistakeLibraryPage() {
  await requireLearnerAppSession()

  return <MistakeLibraryWorkspace items={writingMistakeTaxonomy} />
}
