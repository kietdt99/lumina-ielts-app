import { DashboardOverview } from '../_components/dashboard-overview'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { listWritingSubmissionHistory } from '@/lib/ielts/writing-submissions-repository'
import { readAppLanguageCookie } from '@/lib/i18n/app-language'
import { getLearnerGoals } from '@/lib/learner/learner-goals-repository'

export default async function Dashboard() {
  const [session, { goals: learnerGoals }, { entries }, language] =
    await Promise.all([
      requireLearnerAppSession(),
      getLearnerGoals(),
      listWritingSubmissionHistory(),
      readAppLanguageCookie(),
    ])

  return (
    <DashboardOverview
      language={language}
      learnerAvatarUrl={session.avatarUrl}
      learnerGoals={learnerGoals}
      learnerName={session.fullName}
      initialEntries={entries}
    />
  )
}
