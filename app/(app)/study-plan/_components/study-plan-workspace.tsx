'use client'

import Link from 'next/link'
import { useEffect, useSyncExternalStore } from 'react'
import {
  ChecklistIcon,
  CompassIcon,
  SparklesIcon,
  TargetIcon,
  TimerIcon,
} from '@/app/_components/ui/app-icons'
import {
  createWeeklyStudyPlan,
  type WeeklyStudyPlanSession,
} from '@/lib/ielts/study-plan'
import {
  hydrateWritingHistory,
  getServerWritingHistorySnapshot,
  getWritingHistorySnapshot,
  subscribeToWritingHistory,
  type WritingHistoryEntry,
} from '@/lib/ielts/writing-history'
import type { LearnerGoals } from '@/lib/learner/learner-goals'

type StudyPlanWorkspaceProps = {
  learnerGoals: LearnerGoals
  initialEntries?: WritingHistoryEntry[]
}

function StudyPlanSessionCard({
  session,
}: {
  session: WeeklyStudyPlanSession
}) {
  return (
    <article className="activity-card study-plan-session-card">
      <div className="history-kicker-row">
        <span className="surface-kicker">{session.label}</span>
        <span className="surface-kicker tracker-history-pill">
          {session.taskType}
        </span>
        <span className="surface-kicker tracker-history-pill">
          {session.durationMinutes} min
        </span>
      </div>
      <h3 className="icon-heading">
        <CompassIcon className="section-icon" />
        <span>{session.focus}</span>
      </h3>
      <p>{session.checkpoint}</p>
      <ul className="bullet-list compact-list">
        {session.actions.map((action) => (
          <li key={action}>{action}</li>
        ))}
      </ul>
    </article>
  )
}

export function StudyPlanWorkspace({
  learnerGoals,
  initialEntries = [],
}: StudyPlanWorkspaceProps) {
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
  const plan = createWeeklyStudyPlan(learnerGoals, entries)

  return (
    <div className="dashboard-stack study-plan-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Study Plan</p>
          <h1>{plan.headline}</h1>
          <p>{plan.summary}</p>
          <div className="hero-badge-row">
            <span className="hero-badge">Target Band {learnerGoals.targetBand.toFixed(1)}</span>
            <span className="hero-badge">{learnerGoals.studyFrequency}</span>
            <span className="hero-badge">{plan.priorityFocus}</span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TargetIcon className="metric-icon" />
            </div>
            <span className="metric-label">Weekly target</span>
            <strong>{plan.weeklyTargetSessions}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <SparklesIcon className="metric-icon" />
            </div>
            <span className="metric-label">Completed</span>
            <strong>{plan.completedSessionsThisWeek}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TimerIcon className="metric-icon" />
            </div>
            <span className="metric-label">Remaining</span>
            <strong>{plan.remainingSessions}</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-grid dashboard-metrics">
        <article className="glass dashboard-card">
          <span className="surface-kicker">Performance</span>
          <h2 className="card-title icon-heading">
            <SparklesIcon className="section-icon" />
            <span>Recent Average</span>
          </h2>
          <p className="dashboard-stat">{plan.recentAverage.toFixed(1)}</p>
          <p>Based on the most recent writing sessions saved for this learner account.</p>
        </article>
        <article className="glass dashboard-card">
          <span className="surface-kicker">Target</span>
          <h2 className="card-title icon-heading">
            <TargetIcon className="section-icon" />
            <span>Band Gap</span>
          </h2>
          <p className="dashboard-stat">{plan.targetGap.toFixed(1)}</p>
          <p>Use the plan below to focus on the highest-impact revision work first.</p>
        </article>
        <article className="glass dashboard-card">
          <span className="surface-kicker">Focus</span>
          <h2 className="card-title icon-heading">
            <ChecklistIcon className="section-icon" />
            <span>Priority Focus</span>
          </h2>
          <p>{plan.priorityFocus}</p>
          <Link href="/writing" className="inline-link">
            Open writing workspace
          </Link>
        </article>
      </section>

      <section className="glass writing-panel">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <CompassIcon className="section-icon" />
              <span>This Week&apos;s Practice Blocks</span>
            </h2>
            <p>Follow these focused sessions, then save feedback after each run.</p>
          </div>
          <Link href="/tracker" className="inline-link">
            Review progress
          </Link>
        </div>

        <div className="study-plan-session-grid">
          {plan.sessions.map((session) => (
            <StudyPlanSessionCard key={session.label} session={session} />
          ))}
        </div>
      </section>
    </div>
  )
}
