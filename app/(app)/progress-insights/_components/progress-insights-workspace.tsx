'use client'

import Link from 'next/link'
import { useEffect, useSyncExternalStore } from 'react'
import {
  ChecklistIcon,
  CompassIcon,
  RibbonIcon,
  SparklesIcon,
  TargetIcon,
  TrackerIcon,
} from '@/app/_components/ui/app-icons'
import { EmptyStateIllustration } from '@/app/_components/ui/pastel-illustrations'
import {
  createProgressInsightsReport,
  type ProgressInsightsReport,
  type RubricProgressInsight,
} from '@/lib/ielts/progress-insights'
import {
  getServerWritingHistorySnapshot,
  getWritingHistorySnapshot,
  hydrateWritingHistory,
  subscribeToWritingHistory,
  type WritingHistoryEntry,
} from '@/lib/ielts/writing-history'
import type { LearnerGoals } from '@/lib/learner/learner-goals'

type ProgressInsightsWorkspaceProps = {
  learnerGoals: LearnerGoals
  initialEntries?: WritingHistoryEntry[]
}

function formatBand(value: number) {
  return value.toFixed(1)
}

function trendCopy(report: ProgressInsightsReport) {
  if (report.trend === 'collecting-baseline') {
    return 'Save more sessions to compare your current average with an earlier baseline.'
  }

  const delta = report.recentAverage - report.previousAverage
  const sign = delta > 0 ? '+' : ''

  return `${sign}${formatBand(delta)} compared with the previous saved practice block.`
}

function RubricInsightCard({ insight }: { insight: RubricProgressInsight }) {
  const progressWidth = `${Math.min(100, Math.max(6, (insight.averageScore / 9) * 100))}%`

  return (
    <article className="progress-insight-rubric-card">
      <div className="history-kicker-row">
        <span className="surface-kicker">{insight.trend.replaceAll('-', ' ')}</span>
        <span className="surface-kicker tracker-history-pill">
          {insight.sessionsBelowTarget} below target
        </span>
      </div>
      <div className="progress-insight-rubric-header">
        <strong>{insight.label}</strong>
        <span>{formatBand(insight.averageScore)}</span>
      </div>
      <div className="progress-insight-bar" aria-label={`${insight.label} average score`}>
        <span style={{ width: progressWidth }} />
      </div>
      <p>{insight.action}</p>
      <Link href={insight.route} className="inline-link">
        Open practice support
      </Link>
    </article>
  )
}

export function ProgressInsightsWorkspace({
  learnerGoals,
  initialEntries = [],
}: ProgressInsightsWorkspaceProps) {
  useEffect(() => {
    if (initialEntries.length) {
      hydrateWritingHistory(initialEntries)
    }
  }, [initialEntries])

  const entries = useSyncExternalStore(
    subscribeToWritingHistory,
    getWritingHistorySnapshot,
    () =>
      initialEntries.length
        ? initialEntries
        : getServerWritingHistorySnapshot()
  )
  const report = createProgressInsightsReport(learnerGoals, entries)

  return (
    <div className="dashboard-stack progress-insights-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Progress Insights</p>
          <h1>{report.headline}</h1>
          <p>{report.summary}</p>
          <div className="hero-badge-row">
            <span className="hero-badge">{report.totalSessions} saved sessions</span>
            <span className="hero-badge">Target Band {formatBand(report.targetBand)}</span>
            <span className="hero-badge">{report.trendLabel}</span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <SparklesIcon className="metric-icon" />
            </div>
            <span className="metric-label">Recent average</span>
            <strong>{formatBand(report.recentAverage)}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TargetIcon className="metric-icon" />
            </div>
            <span className="metric-label">Band gap</span>
            <strong>{formatBand(report.targetGap)}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <RibbonIcon className="metric-icon" />
            </div>
            <span className="metric-label">Risk level</span>
            <strong>{report.riskLevel}</strong>
          </div>
        </div>
      </section>

      {report.totalSessions ? (
        <>
          <section className="dashboard-grid dashboard-metrics">
            <article className="glass dashboard-card">
              <span className="surface-kicker">Trend</span>
              <h2 className="card-title icon-heading">
                <TrackerIcon className="section-icon" />
                <span>{report.trendLabel}</span>
              </h2>
              <p>{trendCopy(report)}</p>
            </article>
            <article className="glass dashboard-card">
              <span className="surface-kicker">Weakest criterion</span>
              <h2 className="card-title icon-heading">
                <TargetIcon className="section-icon" />
                <span>{report.weakestCriterion?.label ?? 'Keep collecting'}</span>
              </h2>
              <p>
                {report.weakestCriterion
                  ? `Average ${formatBand(report.weakestCriterion.averageScore)} with a ${formatBand(report.weakestCriterion.gapToTarget)} gap to target.`
                  : 'Save more sessions to reveal the strongest pattern.'}
              </p>
            </article>
            <article className="glass dashboard-card">
              <span className="surface-kicker">Task balance</span>
              <h2 className="card-title icon-heading">
                <CompassIcon className="section-icon" />
                <span>{report.dominantTask}</span>
              </h2>
              <p>
                {report.taskOneCount} Task 1 and {report.taskTwoCount} Task 2 sessions are in this progress sample.
              </p>
            </article>
          </section>

          <div className="progress-insights-layout">
            <section className="glass writing-panel progress-insights-main">
              <div className="dashboard-section-header">
                <div className="panel-heading">
                  <h2 className="icon-heading">
                    <TargetIcon className="section-icon" />
                    <span>Rubric heatmap</span>
                  </h2>
                  <p>Use the lowest average criterion as the next score lever.</p>
                </div>
                <Link href="/tracker" className="inline-link">
                  Open tracker
                </Link>
              </div>

              <div className="progress-insight-rubric-grid">
                {report.rubricInsights.map((insight) => (
                  <RubricInsightCard key={insight.label} insight={insight} />
                ))}
              </div>
            </section>

            <aside className="glass writing-panel progress-insights-side">
              <div className="panel-heading">
                <h2 className="icon-heading">
                  <ChecklistIcon className="section-icon" />
                  <span>Recurring priority patterns</span>
                </h2>
                <p>Repeated feedback usually points to the fastest band gain.</p>
              </div>

              {report.priorityPatterns.length ? (
                <div className="progress-priority-list">
                  {report.priorityPatterns.map((pattern) => (
                    <article key={pattern.priority} className="progress-priority-card">
                      <div className="history-kicker-row">
                        <span className="surface-kicker">{pattern.impactLevel} impact</span>
                        <span className="surface-kicker tracker-history-pill">
                          {pattern.count}x
                        </span>
                      </div>
                      <p>{pattern.priority}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p>No recurring priority has appeared yet.</p>
              )}
            </aside>
          </div>

          <section className="glass writing-panel">
            <div className="dashboard-section-header">
              <div className="panel-heading">
                <h2 className="icon-heading">
                  <SparklesIcon className="section-icon" />
                  <span>Next best moves</span>
                </h2>
                <p>Follow one action at a time, then save the next feedback result.</p>
              </div>
              <span className="surface-kicker">{report.sessionsThisWeek} this week</span>
            </div>

            <div className="progress-action-grid">
              {report.nextActions.map((action) => (
                <article key={action.label} className="activity-card progress-action-card">
                  <h3 className="icon-heading">
                    <SparklesIcon className="section-icon" />
                    <span>{action.label}</span>
                  </h3>
                  <p>{action.description}</p>
                  <Link href={action.route} className="inline-link">
                    Start action
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="glass writing-panel empty-state-panel">
          <div className="empty-state-illustration-wrap">
            <EmptyStateIllustration className="empty-state-illustration" />
          </div>
          <div className="panel-heading">
            <p className="section-label">Progress Insights</p>
            <h2>No progress pattern yet</h2>
            <p>
              Save your first reviewed writing draft and this page will reveal
              the rubric gap, repeated priority, and next best practice move.
            </p>
          </div>
          <div className="empty-state-helper-strip">
            <span className="surface-kicker">Best first signal</span>
            <p>
              Complete one Task 2 response, generate feedback, then return here
              to see the first band-gap reading.
            </p>
          </div>
          <div className="settings-actions">
            <Link href="/writing" className="primary-button">
              Open writing workspace
            </Link>
            <Link href="/study-plan" className="secondary-button">
              View study plan
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
