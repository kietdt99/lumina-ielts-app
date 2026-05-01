'use client'

import Link from 'next/link'
import { useEffect, useSyncExternalStore } from 'react'
import {
  ChecklistIcon,
  RibbonIcon,
  SparklesIcon,
  TrackerIcon,
} from '@/app/_components/ui/app-icons'
import {
  hydrateWritingHistory,
  getServerWritingHistorySnapshot,
  getWritingHistorySnapshot,
  subscribeToWritingHistory,
  type WritingHistoryEntry,
} from '@/lib/ielts/writing-history'

function formatDate(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function WritingSessionDetailPage({
  entryId,
  initialEntries = [],
}: {
  entryId: string
  initialEntries?: WritingHistoryEntry[]
}) {
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

  const entry = entries.find((item) => item.id === entryId) ?? null

  if (!entry) {
    return (
      <div className="tracker-page">
        <section className="glass writing-panel empty-state-panel">
          <div className="panel-heading">
            <p className="section-label">Submission Detail</p>
            <h1>That writing session is no longer available</h1>
            <p>
              The selected session could not be found in this browser history.
              It may have been cleared locally or does not exist for this learner account.
            </p>
          </div>
          <div className="settings-actions">
            <Link href="/tracker" className="primary-button">
              Back to tracker
            </Link>
            <Link href="/writing" className="secondary-button">
              Start a new writing session
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="tracker-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Submission Detail</p>
          <h1>{entry.promptTitle}</h1>
          <p>
            Review the full rubric snapshot, strengths, and revision priorities
            for this saved writing session.
          </p>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <span className="metric-label">Estimated band</span>
            <strong>{entry.estimatedBand.toFixed(1)}</strong>
          </div>
          <div className="metric-pill">
            <span className="metric-label">Task type</span>
            <strong>{entry.taskType}</strong>
          </div>
          <div className="metric-pill">
            <span className="metric-label">Saved at</span>
            <strong>{formatDate(entry.createdAt)}</strong>
          </div>
        </div>
      </section>

      <div className="tracker-layout tracker-detail-layout">
        <section className="glass writing-panel">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <TrackerIcon className="section-icon" />
              <span>Rubric breakdown</span>
            </h2>
            <p>See how this submission performed across the four IELTS writing criteria.</p>
          </div>

          <div className="summary-grid">
            <div className="summary-box">
              <span className="metric-label">Words</span>
              <strong>{entry.wordCount}</strong>
            </div>
            <div className="summary-box">
              <span className="metric-label">Strengths</span>
              <strong>{entry.strengths.length}</strong>
            </div>
            <div className="summary-box">
              <span className="metric-label">Priorities</span>
              <strong>{entry.priorities.length}</strong>
            </div>
          </div>

          <div className="rubric-list">
            {entry.rubric.map((row) => (
              <div key={row.label} className="rubric-card">
                <div className="rubric-score">
                  <span>{row.label}</span>
                  <strong>{row.score.toFixed(1)}</strong>
                </div>
                <p>{row.summary}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="glass writing-panel">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <RibbonIcon className="section-icon" />
              <span>Revision notes</span>
            </h2>
            <p>Use the saved excerpt and priorities below to plan the next practice pass.</p>
          </div>

          <div className="feedback-section no-divider">
            <h3 className="icon-heading">
              <SparklesIcon className="section-icon" />
              <span>Draft excerpt</span>
            </h3>
            <p>{entry.draftExcerpt}...</p>
          </div>

          <div className="feedback-section">
            <h3 className="icon-heading">
              <SparklesIcon className="section-icon" />
              <span>Strengths</span>
            </h3>
            <ul className="bullet-list compact-list">
              {entry.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="feedback-section">
            <h3 className="icon-heading">
              <ChecklistIcon className="section-icon" />
              <span>Revision priorities</span>
            </h3>
            <ul className="bullet-list compact-list">
              {entry.priorities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="settings-actions">
            <Link href="/tracker" className="secondary-button">
              Back to tracker
            </Link>
            <Link href="/writing" className="primary-button">
              Open writing workspace
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
