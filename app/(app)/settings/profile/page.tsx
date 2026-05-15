import { LearnerGoalsSettings } from '../_components/learner-goals-settings'
import { PasswordSettingsCard } from '../_components/password-settings-card'
import {
  CompassIcon,
  ProfileIcon,
  TargetIcon,
} from '@/app/_components/ui/app-icons'
import { requireLearnerAppSession } from '@/lib/auth/service'
import { getLearnerGoals } from '@/lib/learner/learner-goals-repository'

export default async function ProfileSettingsPage() {
  const session = await requireLearnerAppSession()
  const { goals } = await getLearnerGoals()

  return (
    <>
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Profile Settings</p>
          <h1>Keep your learner profile aligned with your next IELTS push</h1>
          <p>
            Review your account status, study direction, and password health in
            one place before you update the detailed settings below.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">Target band {goals.targetBand.toFixed(1)}</span>
            <span className="hero-badge">{goals.focusSkill}</span>
            <span className="hero-badge">
              {session.mustChangePassword ? 'Password update required' : 'Password current'}
            </span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TargetIcon className="metric-icon" />
            </div>
            <span className="metric-label">Target band</span>
            <strong>{goals.targetBand.toFixed(1)}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <CompassIcon className="metric-icon" />
            </div>
            <span className="metric-label">Study rhythm</span>
            <strong>{goals.studyFrequency}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <ProfileIcon className="metric-icon" />
            </div>
            <span className="metric-label">Account status</span>
            <strong>{session.mustChangePassword ? 'Action needed' : 'Ready'}</strong>
          </div>
        </div>
      </section>

      <LearnerGoalsSettings initialGoals={goals} />
      <PasswordSettingsCard mustChangePassword={session.mustChangePassword} />
    </>
  )
}
