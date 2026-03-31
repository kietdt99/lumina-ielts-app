'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { signout } from '@/app/auth/actions'
import type { LearnerGoals } from '@/lib/learner/learner-goals'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import {
  getServerWritingHistorySnapshot,
  getWritingHistorySnapshot,
  subscribeToWritingHistory,
} from '@/lib/ielts/writing-history'
import {
  averageBand,
  bestBand,
  countTaskType,
  latestEntry,
  recentEntries,
} from '@/lib/ielts/writing-history-insights'
import { createStudyRecommendation } from '@/lib/ielts/study-plan'

function formatDate(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

type DashboardOverviewProps = {
  learnerGoals: LearnerGoals
}

export function DashboardOverview({ learnerGoals }: DashboardOverviewProps) {
  const authEnabled = isSupabaseConfigured()
  const entries = useSyncExternalStore(
    subscribeToWritingHistory,
    getWritingHistorySnapshot,
    getServerWritingHistorySnapshot
  )

  const latestSession = latestEntry(entries)
  const recentSessions = recentEntries(entries, 3)
  const recommendation = createStudyRecommendation(learnerGoals, entries)

  return (
    <div className="dashboard-stack">
      <div className="dashboard-header">
        <div className="dashboard-copy">
          <p className="section-label">Dashboard</p>
          <h1>Welcome to Lumina IELTS</h1>
          <p>
            Your AI-supported workspace for building a reliable study rhythm
            and reaching your target band.
          </p>
        </div>
        {authEnabled ? (
          <form action={signout}>
            <button type="submit" className="secondary-button">
              Sign Out
            </button>
          </form>
        ) : (
          <div className="demo-badge">Demo mode</div>
        )}
      </div>

      <div className="dashboard-grid dashboard-metrics">
        <div className="glass dashboard-card">
          <div className="dashboard-section-header">
            <div>
              <h2 className="card-title">Target Band</h2>
              <p className="dashboard-stat">{learnerGoals.targetBand.toFixed(1)}</p>
            </div>
            <Link href="/settings" className="inline-link">
              Update goals
            </Link>
          </div>
          <p>
            Current level: {learnerGoals.currentLevel}. Focus skill:{' '}
            {learnerGoals.focusSkill}. Study rhythm: {learnerGoals.studyFrequency}.
          </p>
        </div>
        <div className="glass dashboard-card">
          <h2 className="card-title">Average Band</h2>
          <p className="dashboard-stat">{averageBand(entries).toFixed(1)}</p>
          <p>Calculated from the writing practice sessions saved on this device.</p>
        </div>
        <div className="glass dashboard-card">
          <h2 className="card-title">Best Result</h2>
          <p className="dashboard-stat">{bestBand(entries).toFixed(1)}</p>
          <p>
            {entries.length
              ? `You have completed ${entries.length} tracked writing session${entries.length === 1 ? '' : 's'}.`
              : 'Start a writing session to begin tracking your progress.'}
          </p>
        </div>
      </div>

      <div className="dashboard-grid dashboard-content">
        <section className="glass dashboard-card">
          <div className="dashboard-section-header">
            <div>
              <h2 className="card-title">Recent Activity</h2>
              <p>Your latest writing checkpoints appear here automatically.</p>
            </div>
            <Link href="/tracker" className="inline-link">
              Open tracker
            </Link>
          </div>

          {recentSessions.length ? (
            <div className="dashboard-activity-feed">
              {recentSessions.map((entry) => (
                <article key={entry.id} className="activity-card">
                  <div className="activity-card-header">
                    <div>
                      <span className="prompt-type">{entry.taskType}</span>
                      <h3>{entry.promptTitle}</h3>
                    </div>
                    <strong className="activity-score">{entry.estimatedBand.toFixed(1)}</strong>
                  </div>
                  <div className="history-meta">
                    <span>{formatDate(entry.createdAt)}</span>
                    <span>{entry.wordCount} words</span>
                  </div>
                  <p>{entry.priorities[0] ?? 'Keep refining your structure and support.'}</p>
                  <Link href={`/tracker/${entry.id}`} className="inline-link">
                    Open detail
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-dashboard-state">
              <p>No activity saved yet.</p>
              <Link href="/writing" className="primary-button">
                Start writing practice
              </Link>
            </div>
          )}
        </section>

        <section className="glass dashboard-card">
          <div className="dashboard-section-header">
            <div>
              <h2 className="card-title">Next Best Step</h2>
              <p>Use learner goals and recent writing data to focus the next revision cycle.</p>
            </div>
            <Link href="/writing" className="inline-link">
              Open workspace
            </Link>
          </div>

          <div className="next-step-stack">
            <div className="metric-pill">
              <span className="metric-label">Recommendation</span>
              <strong>{recommendation.headline}</strong>
            </div>
            <div className="summary-grid">
              <div className="summary-box">
                <span className="metric-label">Recent average</span>
                <strong>{recommendation.recentAverage.toFixed(1)}</strong>
              </div>
              <div className="summary-box">
                <span className="metric-label">Target gap</span>
                <strong>{recommendation.targetGap.toFixed(1)}</strong>
              </div>
              <div className="summary-box">
                <span className="metric-label">Sessions this week</span>
                <strong>{recommendation.sessionsThisWeek}</strong>
              </div>
            </div>
            <p>{recommendation.summary}</p>
          </div>

          {latestSession ? (
            <div className="next-step-stack">
              <div className="metric-pill">
                <span className="metric-label">Latest prompt</span>
                <strong>{latestSession.promptTitle}</strong>
              </div>
              <div className="metric-pill">
                <span className="metric-label">Task balance</span>
                <strong>
                  Task 1: {countTaskType(entries, 'Task 1')} | Task 2:{' '}
                  {countTaskType(entries, 'Task 2')}
                </strong>
              </div>
              <div className="metric-pill">
                <span className="metric-label">Study rhythm</span>
                <strong>{learnerGoals.studyFrequency}</strong>
              </div>
              {recommendation.recurringPriority ? (
                <div className="metric-pill">
                  <span className="metric-label">Recurring focus</span>
                  <strong>{recommendation.recurringPriority}</strong>
                </div>
              ) : null}
              <div className="feedback-section no-divider">
                <h3>Priority right now</h3>
                <ul className="bullet-list compact-list">
                  {recommendation.actions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="empty-dashboard-state">
              <p>
                Aim for Band {learnerGoals.targetBand.toFixed(1)} with a{' '}
                {learnerGoals.studyFrequency.toLowerCase()} rhythm. Complete one
                writing feedback cycle and Lumina will suggest your next revision
                focus here.
              </p>
              <ul className="bullet-list compact-list">
                {recommendation.actions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link href="/settings" className="inline-link">
                Refine learner goals
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
