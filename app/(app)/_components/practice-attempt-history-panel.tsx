import type {
  PracticeAttemptHistoryEntry,
  PracticeAttemptSkill,
} from '@/lib/ielts/practice-attempt-history'
import { SparklesIcon } from '@/app/_components/ui/app-icons'

function formatAttemptDate(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

type PracticeAttemptHistoryPanelProps = {
  attempts: PracticeAttemptHistoryEntry[]
  description?: string
  showSkillLabel?: boolean
  skill?: PracticeAttemptSkill
  title?: string
}

export function PracticeAttemptHistoryPanel({
  attempts,
  description = 'Lumina saves successful scoring runs locally so you can compare your latest practice results without repeating the full drill.',
  showSkillLabel = false,
  skill,
  title,
}: PracticeAttemptHistoryPanelProps) {
  if (!attempts.length) {
    return null
  }

  const heading = title ?? `Recent ${skill} attempts`

  return (
    <section className="glass writing-panel practice-attempt-history-panel">
      <div className="dashboard-section-header">
        <div className="panel-heading">
          <span className="surface-kicker">Saved practice</span>
          <h2 className="icon-heading">
            <SparklesIcon className="section-icon" />
            <span>{heading}</span>
          </h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="practice-attempt-history-grid">
        {attempts.slice(0, 3).map((attempt) => (
          <article key={attempt.id} className="practice-attempt-card">
            <div className="history-kicker-row">
              {showSkillLabel ? (
                <span className="surface-kicker tracker-history-pill tracker-history-pill-accent">
                  {attempt.skill}
                </span>
              ) : null}
              <span className="surface-kicker">{attempt.topic}</span>
              <span className="surface-kicker tracker-history-pill">
                {attempt.difficulty}
              </span>
            </div>
            <div className="activity-card-header">
              <div>
                <h3>{attempt.itemTitle}</h3>
                <p>{formatAttemptDate(attempt.createdAt)}</p>
              </div>
              <strong className="activity-score">
                {attempt.estimatedBand.toFixed(1)}
              </strong>
            </div>
            <div className="summary-grid practice-attempt-summary">
              <div className="summary-box">
                <span className="metric-label">{attempt.metricLabel}</span>
                <strong>{attempt.metricValue}</strong>
              </div>
              <div className="summary-box">
                <span className="metric-label">Status</span>
                <strong>{attempt.statusLabel}</strong>
              </div>
            </div>
            <p>{attempt.summary}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
