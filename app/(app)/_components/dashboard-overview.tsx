'use client'

import Link from 'next/link'
import { useEffect, useSyncExternalStore } from 'react'
import { signout } from '@/app/auth/actions'
import { PracticeAttemptHistoryPanel } from '@/app/(app)/_components/practice-attempt-history-panel'
import {
  CompassIcon,
  SparklesIcon,
  TargetIcon,
  TrophyIcon,
} from '@/app/_components/ui/app-icons'
import type { LearnerGoals } from '@/lib/learner/learner-goals'
import {
  hydrateWritingHistory,
  getServerWritingHistorySnapshot,
  getWritingHistorySnapshot,
  subscribeToWritingHistory,
  type WritingHistoryEntry,
} from '@/lib/ielts/writing-history'
import {
  averageBand,
  bestBand,
  countTaskType,
  latestEntry,
  recentEntries,
} from '@/lib/ielts/writing-history-insights'
import {
  getPracticeAttemptHistorySnapshot,
  getServerPracticeAttemptHistorySnapshot,
  subscribeToPracticeAttemptHistory,
} from '@/lib/ielts/practice-attempt-history'
import { createSkillPracticePlan } from '@/lib/ielts/skill-practice-plan'
import { createStudyRecommendation } from '@/lib/ielts/study-plan'

function formatDate(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

type DashboardOverviewProps = {
  learnerGoals: LearnerGoals
  learnerName: string
  initialEntries?: WritingHistoryEntry[]
}

export function DashboardOverview({
  learnerGoals,
  learnerName,
  initialEntries = [],
}: DashboardOverviewProps) {
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
  const recentPracticeAttempts = useSyncExternalStore(
    subscribeToPracticeAttemptHistory,
    getPracticeAttemptHistorySnapshot,
    getServerPracticeAttemptHistorySnapshot
  )

  const latestSession = latestEntry(entries)
  const recentSessions = recentEntries(entries, 3)
  const recommendation = createStudyRecommendation(learnerGoals, entries)
  const skillPlan = createSkillPracticePlan(learnerGoals, entries)

  return (
    <div className="dashboard-stack">
      <div className="dashboard-header">
        <div className="dashboard-copy">
          <p className="section-label">Dashboard</p>
          <h1>Welcome back, {learnerName}</h1>
          <p>
            Your AI-supported workspace for building a reliable study rhythm
            and reaching your target band.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">Target {learnerGoals.targetBand.toFixed(1)}</span>
            <span className="hero-badge">{learnerGoals.focusSkill} focus</span>
            <span className="hero-badge">{learnerGoals.studyFrequency}</span>
          </div>
          <div className="dashboard-helper-strip">
            <span className="surface-kicker">Today&apos;s direction</span>
            <p>
              {entries.length
                ? `You have ${entries.length} saved writing session${entries.length === 1 ? '' : 's'} and today's four-skill plan starts with ${skillPlan.focusModule.title}.`
                : `Start with ${skillPlan.focusModule.title} today, then add one Writing checkpoint so Lumina can personalize the next loop.`}
            </p>
            <div className="dashboard-helper-metrics">
              <div className="dashboard-helper-chip">
                <span className="metric-label">Latest checkpoint</span>
                <strong>{latestSession ? latestSession.estimatedBand.toFixed(1) : 'Not yet'}</strong>
              </div>
              <div className="dashboard-helper-chip">
                <span className="metric-label">Current focus</span>
                <strong>{skillPlan.focusModule.skill}</strong>
              </div>
              <div className="dashboard-helper-chip">
                <span className="metric-label">Next module</span>
                <strong>{skillPlan.focusModule.title}</strong>
              </div>
            </div>
          </div>
        </div>
        <form action={signout}>
          <button type="submit" className="secondary-button">
            Sign Out
          </button>
        </form>
      </div>

      <div className="dashboard-grid dashboard-metrics">
        <div className="glass dashboard-card">
          <div className="dashboard-section-header">
            <div>
              <span className="surface-kicker">Learning path</span>
              <h2 className="card-title icon-heading">
                <TargetIcon className="section-icon" />
                <span>Target Band</span>
              </h2>
              <p className="dashboard-stat">{learnerGoals.targetBand.toFixed(1)}</p>
            </div>
            <Link href="/settings/profile" className="inline-link">
              Update goals
            </Link>
          </div>
          <p>
            Current level: {learnerGoals.currentLevel}. Focus skill:{' '}
            {learnerGoals.focusSkill}. Study rhythm: {learnerGoals.studyFrequency}.
          </p>
        </div>
        <div className="glass dashboard-card">
          <span className="surface-kicker">Momentum</span>
          <h2 className="card-title icon-heading">
            <SparklesIcon className="section-icon" />
            <span>Average Band</span>
          </h2>
          <p className="dashboard-stat">{averageBand(entries).toFixed(1)}</p>
          <p>Calculated from the writing practice sessions saved for this learner account.</p>
        </div>
        <div className="glass dashboard-card">
          <span className="surface-kicker">Best snapshot</span>
          <h2 className="card-title icon-heading">
            <TrophyIcon className="section-icon" />
            <span>Best Result</span>
          </h2>
          <p className="dashboard-stat">{bestBand(entries).toFixed(1)}</p>
          <p>
            {entries.length
              ? `You have completed ${entries.length} tracked writing session${entries.length === 1 ? '' : 's'}.`
              : 'Start a writing session to begin tracking your progress.'}
          </p>
        </div>
      </div>

      <section className="glass dashboard-card skill-practice-panel">
        <div className="dashboard-section-header">
          <div>
            <span className="surface-kicker">Practice route</span>
            <h2 className="card-title icon-heading">
              <CompassIcon className="section-icon" />
              <span>Four-Skill Practice Mix</span>
            </h2>
            <p>{skillPlan.summary}</p>
          </div>
          <Link href={skillPlan.focusModule.href} className="inline-link">
            Open focus workspace
          </Link>
        </div>

        <div className="skill-practice-grid">
          {skillPlan.modules.map((module) => {
            const isFocusModule = module.skill === skillPlan.focusModule.skill

            return (
              <Link
                key={module.skill}
                href={module.href}
                className={`skill-practice-card${isFocusModule ? ' is-focus' : ''}`}
                aria-label={`Open ${module.skill} practice module`}
              >
                <div className="skill-practice-card-header">
                  <span className="skill-practice-mark" aria-hidden="true">
                    {module.shortLabel}
                  </span>
                  <span className="surface-kicker">{module.skill}</span>
                  {isFocusModule ? (
                    <span className="skill-focus-badge">Current focus</span>
                  ) : null}
                </div>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <span className="metric-label">
                  {module.recommendedMinutes} min | {module.evidence}
                </span>
              </Link>
            )
          })}
        </div>

        <div className="skill-practice-mix" aria-label="Weekly practice mix">
          {skillPlan.weeklyMix.map((item) => (
            <Link key={item.skill} href={item.href} className="skill-practice-chip">
              <span>{item.skill}</span>
              <strong>
                {item.sessions} session{item.sessions === 1 ? '' : 's'}
              </strong>
            </Link>
          ))}
        </div>
      </section>

      <PracticeAttemptHistoryPanel
        attempts={recentPracticeAttempts}
        title="Recent Skill Attempts"
        description="Recent Reading, Listening, and Speaking scoring runs appear here after a learner completes a practice check."
        showSkillLabel
      />

      <div className="dashboard-grid dashboard-content">
        <section className="glass dashboard-card">
          <div className="dashboard-section-header">
            <div>
              <h2 className="card-title icon-heading">
                <SparklesIcon className="section-icon" />
                <span>Recent Activity</span>
              </h2>
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
                  <div className="history-kicker-row">
                    <span className="surface-kicker">Latest checkpoint</span>
                    <span className="surface-kicker">{entry.taskType}</span>
                    <span className="surface-kicker dashboard-activity-pill">
                      {entry.wordCount} words
                    </span>
                  </div>
                  <div className="activity-card-header">
                    <div>
                      <h3>{entry.promptTitle}</h3>
                    </div>
                    <strong className="activity-score">{entry.estimatedBand.toFixed(1)}</strong>
                  </div>
                  <div className="history-meta">
                    <span>{formatDate(entry.createdAt)}</span>
                    <span>{entry.wordCount} words</span>
                  </div>
                  <div className="history-kicker-row">
                    <span className="surface-kicker dashboard-activity-pill">
                      Next focus
                    </span>
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
              <p className="surface-kicker">First checkpoint</p>
              <h3>No activity saved yet.</h3>
              <p>
                The moment you finish a reviewed draft, Lumina will surface your
                latest band estimate, prompt title, and revision focus here.
              </p>
              <div className="empty-state-helper-strip">
                <span className="surface-kicker">Suggested start</span>
                <p>Open the focus module first, then keep one Writing draft in the loop so your dashboard has measurable feedback.</p>
              </div>
              <Link href={skillPlan.focusModule.href} className="primary-button">
                {skillPlan.focusModule.actionLabel}
              </Link>
            </div>
          )}
        </section>

        <section className="glass dashboard-card">
          <div className="dashboard-section-header">
            <div>
              <h2 className="card-title icon-heading">
                <CompassIcon className="section-icon" />
                <span>Next Best Step</span>
              </h2>
              <p>Use learner goals, focus skill, and recent writing data to choose the next study block.</p>
            </div>
            <Link href={skillPlan.focusModule.href} className="inline-link">
              Open focus module
            </Link>
          </div>

          <div className="next-step-stack">
            <div className="metric-pill">
              <span className="metric-label">Focus module</span>
              <strong>{skillPlan.focusModule.title}</strong>
            </div>
            <div className="metric-pill">
              <span className="metric-label">Recommendation</span>
              <strong>{recommendation.headline}</strong>
            </div>
            <div className="summary-grid">
              <div className="summary-box">
                <span className="surface-kicker">Now</span>
                <span className="metric-label">Recent average</span>
                <strong>{recommendation.recentAverage.toFixed(1)}</strong>
              </div>
              <div className="summary-box">
                <span className="surface-kicker">Gap</span>
                <span className="metric-label">Target gap</span>
                <strong>{recommendation.targetGap.toFixed(1)}</strong>
              </div>
              <div className="summary-box">
                <span className="surface-kicker">Rhythm</span>
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
                <span className="surface-kicker">Current focus</span>
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
              <p className="surface-kicker">Build momentum</p>
              <p>
                Aim for Band {learnerGoals.targetBand.toFixed(1)} with a{' '}
                {learnerGoals.studyFrequency.toLowerCase()} rhythm. Complete one
                writing feedback cycle and Lumina will suggest your next revision
                focus here.
              </p>
              <div className="empty-state-helper-strip">
                <span className="surface-kicker">First recommendation</span>
                <p>Start with {skillPlan.focusModule.title}, then review one Writing draft so this panel can turn evidence into a concrete next-step plan.</p>
              </div>
              <div className="hero-badge-row">
                <span className="hero-badge">First review</span>
                <span className="hero-badge">Dashboard insight</span>
              </div>
              <ul className="bullet-list compact-list">
                {recommendation.actions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link href={skillPlan.focusModule.href} className="primary-button">
                Open {skillPlan.focusModule.skill} focus module
              </Link>
              <Link href="/settings/profile" className="inline-link">
                Refine learner goals
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
