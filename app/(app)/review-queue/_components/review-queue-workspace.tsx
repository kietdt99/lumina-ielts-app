'use client'

import Link from 'next/link'
import { useEffect, useSyncExternalStore } from 'react'
import {
  ChecklistIcon,
  CompassIcon,
  SparklesIcon,
  TargetIcon,
  TimerIcon,
  TrackerIcon,
  WritingIcon,
} from '@/app/_components/ui/app-icons'
import { EmptyStateIllustration } from '@/app/_components/ui/pastel-illustrations'
import {
  createReviewQueue,
  type ReviewQueueItem,
} from '@/lib/ielts/review-queue'
import {
  hydrateWritingHistory,
  getServerWritingHistorySnapshot,
  getWritingHistorySnapshot,
  subscribeToWritingHistory,
  type WritingHistoryEntry,
} from '@/lib/ielts/writing-history'

type ReviewQueueWorkspaceProps = {
  initialEntries?: WritingHistoryEntry[]
}

function formatDate(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function priorityClass(item: ReviewQueueItem) {
  return `review-queue-card priority-${item.priority.toLowerCase()}`
}

function ReviewQueueCard({ item }: { item: ReviewQueueItem }) {
  return (
    <article className={`activity-card ${priorityClass(item)}`}>
      <div className="history-kicker-row">
        <span className="surface-kicker">{item.priority} priority</span>
        <span className="surface-kicker tracker-history-pill">
          {item.taskType}
        </span>
        <span className="surface-kicker tracker-history-pill tracker-history-pill-accent">
          Band {item.estimatedBand.toFixed(1)}
        </span>
      </div>
      <div className="activity-card-header">
        <div>
          <span className="prompt-type">{item.promptTitle}</span>
          <h3 className="icon-heading">
            <ChecklistIcon className="section-icon" />
            <span>{item.label}</span>
          </h3>
        </div>
      </div>
      <p>{item.action}</p>
      <div className="review-queue-success">
        <span className="metric-label">Success criteria</span>
        <strong>{item.successCriteria}</strong>
      </div>
      <div className="review-checklist-panel">
        <span className="metric-label">Revision checklist</span>
        <div className="review-checklist-list">
          {item.checklist.map((checklistItem) => (
            <article key={checklistItem.id} className="review-checklist-item">
              <div className="history-kicker-row">
                <span className="surface-kicker">{checklistItem.criterion}</span>
                <span className="surface-kicker tracker-history-pill">
                  {checklistItem.priorityLevel}
                </span>
              </div>
              <strong>{checklistItem.title}</strong>
              <p>{checklistItem.instruction}</p>
              <span>{checklistItem.successSignal}</span>
            </article>
          ))}
        </div>
      </div>
      <div className="review-queue-card-footer">
        <span>{formatDate(item.createdAt)}</span>
        <Link href={`/tracker/${item.entryId}`} className="inline-link">
          Open full detail
        </Link>
      </div>
    </article>
  )
}

export function ReviewQueueWorkspace({
  initialEntries = [],
}: ReviewQueueWorkspaceProps) {
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
  const queue = createReviewQueue(entries)
  const firstItem = queue.items[0] ?? null

  return (
    <div className="dashboard-stack review-queue-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Review Queue</p>
          <h1>{queue.headline}</h1>
          <p>{queue.summary}</p>
          <div className="hero-badge-row">
            <span className="hero-badge">{entries.length} saved sessions</span>
            <span className="hero-badge">
              {queue.topTaskType ?? 'Writing review'}
            </span>
            <span className="hero-badge">
              {queue.highPriorityCount} high priority
            </span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <ChecklistIcon className="metric-icon" />
            </div>
            <span className="metric-label">Review actions</span>
            <strong>{queue.totalItems}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TrackerIcon className="metric-icon" />
            </div>
            <span className="metric-label">Source sessions</span>
            <strong>{queue.sourceSessions}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TimerIcon className="metric-icon" />
            </div>
            <span className="metric-label">Next action</span>
            <strong>{firstItem?.priority ?? 'Ready'}</strong>
          </div>
        </div>
      </section>

      {queue.items.length ? (
        <>
          <section className="dashboard-grid dashboard-metrics">
            <article className="glass dashboard-card">
              <span className="surface-kicker">Start here</span>
              <h2 className="card-title icon-heading">
                <TargetIcon className="section-icon" />
                <span>Highest Impact</span>
              </h2>
              <p>{firstItem?.action}</p>
              <Link href={firstItem ? `/tracker/${firstItem.entryId}` : '/tracker'} className="inline-link">
                Open source feedback
              </Link>
            </article>
            <article className="glass dashboard-card">
              <span className="surface-kicker">Focus</span>
              <h2 className="card-title icon-heading">
                <CompassIcon className="section-icon" />
                <span>Task Focus</span>
              </h2>
              <p>
                {queue.topTaskType
                  ? `${queue.topTaskType} revision work is the dominant focus in this queue.`
                  : 'Keep saving feedback to reveal your dominant task focus.'}
              </p>
            </article>
            <article className="glass dashboard-card">
              <span className="surface-kicker">Practice loop</span>
              <h2 className="card-title icon-heading">
                <WritingIcon className="section-icon" />
                <span>Rewrite Next</span>
              </h2>
              <p>Use one card, rewrite the weak section, then run another feedback pass.</p>
              <Link href="/writing" className="inline-link">
                Open writing workspace
              </Link>
            </article>
          </section>

          <section className="glass writing-panel">
            <div className="dashboard-section-header">
              <div className="panel-heading">
                <h2 className="icon-heading">
                  <SparklesIcon className="section-icon" />
                  <span>Today&apos;s Revision Queue</span>
                </h2>
                <p>Work from top to bottom and stop after one complete rewrite cycle.</p>
              </div>
              <Link href="/tracker" className="inline-link">
                Review all progress
              </Link>
            </div>

            <div className="review-queue-grid">
              {queue.items.map((item) => (
                <ReviewQueueCard key={item.id} item={item} />
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
            <p className="section-label">Review Queue</p>
            <h2>No revision actions yet</h2>
            <p>
              Run a writing practice session and save the feedback. The revision
              plan will appear here as a step-by-step queue.
            </p>
          </div>
          <div className="empty-state-helper-strip">
            <span className="surface-kicker">Quick win</span>
            <p>
              Start with one Task 2 draft, review the three generated revision
              passes, and rewrite the weakest paragraph first.
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
