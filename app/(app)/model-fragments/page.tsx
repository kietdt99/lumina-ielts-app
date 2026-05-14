import { ModelFragmentsWorkspace } from './_components/model-fragments-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { modelFragments } from '@/lib/ielts/model-fragments'

export default async function ModelFragmentsPage() {
  await requireLearnerAppSession()

  return <ModelFragmentsWorkspace fragments={modelFragments} />
}
