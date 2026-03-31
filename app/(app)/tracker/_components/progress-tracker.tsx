'use client'

import Link from 'next/link'
import { useState, useSyncExternalStore } from 'react'
import type { LearnerGoals } from '@/lib/learner/learner-goals'
import {
  clearWritingHistory,
  getServerWritingHistorySnapshot,
  getWritingHistorySnapshot,
  subscribeToWritingHistory,
} from '@/lib/ielts/writing-history'
import {
  averageBand,
  bestBand,
} from '@/lib/ielts/writing-history-insights'
import { createStudyRecommendation } from '@/lib/ielts/study-plan'

function formatDate(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function ProgressTracker({ learnerGoals }: { learnerGoals: LearnerGoals }) {
  const entries = useSyncExternalStore(
    subscribeToWritingHistory,
    getWritingHistorySnapshot,
    getServerWritingHistorySnapshot
  )
  const [selectedTask, setSelectedTask] = useState<'All' | 'Task 1' | 'Task 2'>('All')

  const filteredEntries =
    selectedTask === 'All'
      ? entries
      : entries.filter((entry) => entry.taskType === selectedTask)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const selectedEntry =
    filteredEntries.find((entry) => entry.id === selectedEntryId) ??
    filteredEntries[0] ??
    null
  const recommendation = createStudyRecommendation(learnerGoals, filteredEntries)

  const timelineBars = filteredEntries
    .slice(0, 8)
    .reverse()
    .map((entry) => ({
      id: entry.id,
      label: entry.promptTitle,
      score: entry.estimatedBand,
      height: `${Math.max(28, entry.estimatedBand * 12)}px`,
    }))

  return (
    <div className="tracker-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Progress Tracker</p>
          <h1>See how your writing practice is evolving</h1>
          <p>
            Every feedback run in the writing workspace is saved locally and
            appears here as a new practice checkpoint.
          </p>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <span className="metric-label">Saved sessions</span>
            <strong>{entries.length}</strong>
          </div>
          <div className="metric-pill">
            <span className="metric-label">Average band</span>
            <strong>{averageBand(filteredEntries).toFixed(1)}</strong>
          </div>
          <div className="metric-pill">
            <span className="metric-label">Best band</span>
            <strong>{bestBand(filteredEntries).toFixed(1)}</strong>
          </div>
        </div>
      </section>

      <section className="tracker-toolbar">
        <div className="task-switcher" role="tablist" aria-label="Filter writing sessions">
          {(['All', 'Task 1', 'Task 2'] as const).map((task) => (
            <button
              key={task}
              type="button"
              className={`task-chip${selectedTask === task ? ' is-active' : ''}`}
              onClick={() => setSelectedTask(task)}
            >
              {task}
            </button>
          ))}
        </div>

        {entries.length ? (
          <button type="button" className="secondary-button" onClick={clearWritingHistory}>
            Clear local history
          </button>
        ) : null}
      </section>

      {entries.length ? (
        <section className="dashboard-grid tracker-insights-grid">
          <article className="glass dashboard-card">
            <h2 className="card-title">Target Gap</h2>
            <p className="dashboard-stat">{recommendation.targetGap.toFixed(1)}</p>
            <p>
              Based on the filtered sessions, you are working toward Band{' '}
              {learnerGoals.targetBand.toFixed(1)}.
            </p>
          </article>

          <article className="glass dashboard-card">
            <h2 className="card-title">Sessions This Week</h2>
            <p className="dashboard-stat">{recommendation.sessionsThisWeek}</p>
            <p>Use this to check whether your current rhythm matches the study plan.</p>
          </article>

          <article className="glass dashboard-card">
            <h2 className="card-title">Recurring Focus</h2>
            <p className="tracker-focus-copy">
              {recommendation.recurringPriority ??
                'Complete more writing sessions to identify a repeated focus area.'}
            </p>
            <Link href="/writing" className="inline-link">
              Open writing workspace
            </Link>
          </article>
        </section>
      ) : null}

      {entries.length ? (
        <div className="tracker-layout">
          <section className="glass writing-panel tracker-overview">
            <div className="panel-heading">
              <h2>Band trend</h2>
              <p>The most recent practice checkpoints saved from your writing workspace.</p>
            </div>

            <div className="trend-chart" aria-label="Band trend">
              {timelineBars.map((bar) => (
                <div key={bar.id} className="trend-bar-group">
                  <span className="trend-score">{bar.score.toFixed(1)}</span>
                  <div className="trend-bar" style={{ height: bar.height }} />
                  <span className="trend-label">{bar.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="glass writing-panel tracker-history">
            <div className="panel-heading">
              <h2>Practice history</h2>
              <p>Open your latest drafts and revision priorities in one place.</p>
            </div>

            <div className="history-list">
              {filteredEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={`history-card selectable-card${
                    selectedEntry?.id === entry.id ? ' is-selected' : ''
                  }`}
                  onClick={() => setSelectedEntryId(entry.id)}
                >
                  <div className="history-header">
                    <div>
                      <span className="prompt-type">{entry.taskType}</span>
                      <h3>{entry.promptTitle}</h3>
                    </div>
                    <div className="history-score">
                      <span className="metric-label">Estimated band</span>
                      <strong>{entry.estimatedBand.toFixed(1)}</strong>
                    </div>
                  </div>

                  <div className="history-meta">
                    <span>{formatDate(entry.createdAt)}</span>
                    <span>{entry.wordCount} words</span>
                  </div>

                  <p className="history-excerpt">{entry.draftExcerpt}...</p>

                  <div className="history-rubric">
                    {entry.rubric.map((row) => (
                      <span key={row.label} className="rubric-pill">
                        {row.label}: {row.score.toFixed(1)}
                      </span>
                    ))}
                  </div>

                  <div className="history-columns">
                    <div>
                      <h4>Strengths</h4>
                      <ul className="bullet-list compact-list">
                        {entry.strengths.slice(0, 2).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4>Next focus</h4>
                      <ul className="bullet-list compact-list">
                        {entry.priorities.slice(0, 2).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <aside className="glass writing-panel tracker-detail">
            <div className="panel-heading">
              <h2>Session detail</h2>
              <p>Inspect the selected submission more closely before your next revision pass.</p>
            </div>

            <div className="feedback-error tracker-recommendation-card" role="status">
              <strong>{recommendation.headline}</strong>
              <p>{recommendation.summary}</p>
            </div>

            {selectedEntry ? (
              <div className="feedback-stack">
                <div className="score-card">
                  <span className="metric-label">Selected session</span>
                  <strong>{selectedEntry.estimatedBand.toFixed(1)}</strong>
                  <p>
                    {selectedEntry.promptTitle} · {selectedEntry.taskType} ·{' '}
                    {formatDate(selectedEntry.createdAt)}
                  </p>
                </div>

                <div className="summary-grid">
                  <div className="summary-box">
                    <span className="metric-label">Words</span>
                    <strong>{selectedEntry.wordCount}</strong>
                  </div>
                  <div className="summary-box">
                    <span className="metric-label">Rubric rows</span>
                    <strong>{selectedEntry.rubric.length}</strong>
                  </div>
                  <div className="summary-box">
                    <span className="metric-label">Focus count</span>
                    <strong>{selectedEntry.priorities.length}</strong>
                  </div>
                </div>

                <div className="rubric-list">
                  {selectedEntry.rubric.map((row) => (
                    <div key={row.label} className="rubric-card">
                      <div className="rubric-score">
                        <span>{row.label}</span>
                        <strong>{row.score.toFixed(1)}</strong>
                      </div>
                      <p>{row.summary}</p>
                    </div>
                  ))}
                </div>

                <div className="feedback-section">
                  <h3>Draft excerpt</h3>
                  <p>{selectedEntry.draftExcerpt}...</p>
                </div>

                <div className="feedback-section">
                  <h3>Strengths</h3>
                  <ul className="bullet-list compact-list">
                    {selectedEntry.strengths.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="feedback-section">
                  <h3>Revision priorities</h3>
                  <ul className="bullet-list compact-list">
                    {selectedEntry.priorities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/tracker/${selectedEntry.id}`}
                  className="primary-button"
                >
                  Open full detail page
                </Link>
              </div>
            ) : (
              <div className="empty-feedback">
                <p className="metric-label">No selection</p>
                <h3>Choose a saved session to inspect</h3>
                <p>
                  Select a history card to review the full rubric snapshot and
                  targeted revision advice.
                </p>
              </div>
            )}
          </aside>
        </div>
      ) : (
        <section className="glass writing-panel empty-state-panel">
          <div className="panel-heading">
            <h2>No tracked writing sessions yet</h2>
            <p>
              Generate feedback in the writing workspace and your first practice
              history cards will appear here automatically.
            </p>
          </div>
          <Link href="/writing" className="primary-button">
            Open writing workspace
          </Link>
        </section>
      )}
    </div>
  )
}
