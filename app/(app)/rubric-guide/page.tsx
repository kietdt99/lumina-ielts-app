import { RubricGuideWorkspace } from './_components/rubric-guide-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { writingRubricCriteria } from '@/lib/ielts/writing-rubric'

export default async function RubricGuidePage() {
  await requireLearnerAppSession()

  return <RubricGuideWorkspace criteria={writingRubricCriteria} />
}
