import { requireLearnerAppSession } from '@/lib/auth/service'
import { createWeeklyStudyPlan } from '@/lib/ielts/study-plan'
import { listWritingSubmissionHistory } from '@/lib/ielts/writing-submissions-repository'
import { getLearnerGoals } from '@/lib/learner/learner-goals-repository'

export async function GET() {
  await requireLearnerAppSession()
  const { goals } = await getLearnerGoals()
  const { entries, storageMode } = await listWritingSubmissionHistory()

  return Response.json({
    ok: true,
    plan: createWeeklyStudyPlan(goals, entries),
    storageMode,
  })
}
