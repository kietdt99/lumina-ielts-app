import { PracticeSprintWorkspace } from './_components/practice-sprint-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { practiceSprints } from '@/lib/ielts/practice-sprint'

export default async function PracticeSprintPage() {
  await requireLearnerAppSession()

  return <PracticeSprintWorkspace sprints={practiceSprints} />
}
