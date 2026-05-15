import { MockTestLabWorkspace } from './_components/mock-test-lab-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { writingMockTests } from '@/lib/ielts/mock-test-lab'

export default async function MockTestLabPage() {
  await requireLearnerAppSession()

  return <MockTestLabWorkspace tests={writingMockTests} />
}
