import { VocabularyBuilderWorkspace } from './_components/vocabulary-builder-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { vocabularyBuilderCards } from '@/lib/ielts/vocabulary-builder'

export default async function VocabularyBuilderPage() {
  await requireLearnerAppSession()

  return <VocabularyBuilderWorkspace cards={vocabularyBuilderCards} />
}
