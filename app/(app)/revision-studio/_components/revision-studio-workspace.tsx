'use client'

import Link from 'next/link'
import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  ChecklistIcon,
  CompassIcon,
  QuillIcon,
  SparklesIcon,
  TrackerIcon,
} from '@/app/_components/ui/app-icons'
import { EmptyStateIllustration } from '@/app/_components/ui/pastel-illustrations'
import {
  createRevisionStudioSession,
  createRevisionStudioSummary,
  sortRevisionEntries,
  type RevisionStudioSession,
} from '@/lib/ielts/revision-studio'
import {
  getServerWritingHistorySnapshot,
  getWritingHistorySnapshot,
  getWritingHistoryStorageKey,
  hydrateWritingHistory,
  subscribeToWritingHistory,
  type WritingHistoryEntry,
} from '@/lib/ielts/writing-history'

type RevisionStudioWorkspaceProps = {
  initialEntries?: WritingHistoryEntry[]
}

const draftStorageKeyPrefix = 'lumina-revision-studio-drafts'

function getDraftStorageKey() {
  return `${draftStorageKeyPrefix}:${getWritingHistoryStorageKey()}`
}

function formatDate(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatWordDelta(value: number) {
  if (value === 0) {
    return 'No change'
  }

  return `${value > 0 ? '+' : ''}${value} words`
}

function readStoredDrafts() {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const rawValue = window.localStorage.getItem(getDraftStorageKey())
    return rawValue ? (JSON.parse(rawValue) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

function writeStoredDrafts(drafts: Record<string, string>) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getDraftStorageKey(), JSON.stringify(drafts))
}

function SessionButton({
  session,
  isActive,
  onSelect,
}: {
  session: RevisionStudioSession
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={`revision-studio-session-card ${isActive ? 'is-active' : ''}`}
      onClick={onSelect}
    >
      <span className="surface-kicker">{session.statusLabel}</span>
      <strong>{session.promptTitle}</strong>
      <span>
        {session.taskType} · Band {session.estimatedBand.toFixed(1)} ·{' '}
        {session.rewriteWordCount} rewrite words
      </span>
    </button>
  )
}

export function RevisionStudioWorkspace({
  initialEntries = [],
}: RevisionStudioWorkspaceProps) {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [rewriteDrafts, setRewriteDrafts] = useState<Record<string, string>>(
    () => readStoredDrafts()
  )

  useEffect(() => {
    if (initialEntries.length) {
      hydrateWritingHistory(initialEntries)
    }
  }, [initialEntries])

  useEffect(() => {
    writeStoredDrafts(rewriteDrafts)
  }, [rewriteDrafts])

  const entries = useSyncExternalStore(
    subscribeToWritingHistory,
    getWritingHistorySnapshot,
    () =>
      initialEntries.length
        ? initialEntries
        : getServerWritingHistorySnapshot()
  )
  const sortedEntries = sortRevisionEntries(entries)
  const sessions = sortedEntries.map((entry) =>
    createRevisionStudioSession(entry, rewriteDrafts[entry.id] ?? '')
  )
  const summary = createRevisionStudioSummary(sortedEntries, rewriteDrafts)
  const selectedSession =
    sessions.find((session) => session.entryId === selectedEntryId) ??
    sessions[0] ??
    null
  const selectedEntry =
    sortedEntries.find((entry) => entry.id === selectedSession?.entryId) ??
    sortedEntries[0] ??
    null
  const selectedDraft = selectedSession
    ? rewriteDrafts[selectedSession.entryId] ?? ''
    : ''

  function handleRewriteChange(value: string) {
    if (!selectedSession) {
      return
    }

    setRewriteDrafts((currentDrafts) => ({
      ...currentDrafts,
      [selectedSession.entryId]: value,
    }))
  }

  return (
    <div className="dashboard-stack revision-studio-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Revision Studio</p>
          <h1>{summary.headline}</h1>
          <p>{summary.summary}</p>
          <div className="hero-badge-row">
            <span className="hero-badge">{summary.totalSessions} saved sessions</span>
            <span className="hero-badge">
              {summary.averageBand ? `Avg band ${summary.averageBand.toFixed(1)}` : 'No band yet'}
            </span>
            <span className="hero-badge">
              {summary.readySessions} ready for check
            </span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <QuillIcon className="metric-icon" />
            </div>
            <span className="metric-label">Task 2 drafts</span>
            <strong>{summary.taskTwoSessions}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TrackerIcon className="metric-icon" />
            </div>
            <span className="metric-label">Task 1 drafts</span>
            <strong>{summary.taskOneSessions}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <SparklesIcon className="metric-icon" />
            </div>
            <span className="metric-label">Current rewrite</span>
            <strong>{selectedSession?.statusLabel ?? 'Ready'}</strong>
          </div>
        </div>
      </section>

      {selectedSession && selectedEntry ? (
        <div className="revision-studio-layout">
          <aside className="glass writing-panel revision-studio-session-list">
            <div className="panel-heading">
              <h2 className="icon-heading">
                <CompassIcon className="section-icon" />
                <span>Choose a feedback session</span>
              </h2>
              <p>Pick one saved submission and complete a rewrite cycle before moving on.</p>
            </div>

            <div className="revision-studio-session-list-inner">
              {sessions.map((session) => (
                <SessionButton
                  key={session.entryId}
                  session={session}
                  isActive={session.entryId === selectedSession.entryId}
                  onSelect={() => setSelectedEntryId(session.entryId)}
                />
              ))}
            </div>
          </aside>

          <section className="glass writing-panel revision-studio-editor">
            <div className="dashboard-section-header">
              <div className="panel-heading">
                <p className="section-label">Rewrite workspace</p>
                <h2 className="icon-heading">
                  <QuillIcon className="section-icon" />
                  <span>Rewrite one saved draft with a clear revision target</span>
                </h2>
                <p>{selectedSession.summary}</p>
              </div>
              <div className="history-kicker-row">
                <span className="surface-kicker">{selectedSession.taskType}</span>
                <span className="surface-kicker tracker-history-pill">
                  Saved {formatDate(selectedSession.createdAt)}
                </span>
              </div>
            </div>

            <div className="revision-studio-focus-grid">
              <article className="revision-studio-focus-card">
                <span className="surface-kicker">Revision target</span>
                <strong>{selectedSession.rewriteTarget}</strong>
                <p>{selectedSession.weakestRubric?.summary ?? 'Focus on the clearest feedback item first.'}</p>
              </article>
              <article className="revision-studio-focus-card">
                <span className="surface-kicker">Weakest rubric</span>
                <strong>{selectedSession.weakestRubric?.label ?? 'Rubric review'}</strong>
                <p>
                  {selectedSession.weakestRubric
                    ? `Band ${selectedSession.weakestRubric.score.toFixed(1)} is the main score lever for this rewrite.`
                    : 'Use the saved priorities to decide the main score lever.'}
                </p>
              </article>
            </div>

            <div className="revision-studio-comparison">
              <article className="revision-studio-excerpt">
                <span className="surface-kicker">Original excerpt</span>
                <p>{selectedSession.draftExcerpt}...</p>
              </article>
              <article className="revision-studio-excerpt">
                <span className="surface-kicker">Sample rewrite</span>
                <p>
                  {selectedSession.sampleRewrite ??
                    'No sample rewrite was saved for this session. Use the checklist below as your guide.'}
                </p>
              </article>
            </div>

            <div className="revision-plan-list">
              {selectedSession.focusSteps.map((step) => (
                <article key={step.id} className="revision-step-card">
                  <span className="surface-kicker">{step.label}</span>
                  <p>{step.action}</p>
                  <strong>{step.successCriteria}</strong>
                  <div className="revision-studio-checklist-hint">
                    <ChecklistIcon className="section-icon" />
                    <span>{step.checklistItem.title}: {step.checklistItem.successSignal}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="field-group">
              <label htmlFor="revision-studio-draft" className="editor-label">
                Rewrite draft
              </label>
              <textarea
                id="revision-studio-draft"
                className="writing-textarea revision-studio-textarea"
                value={selectedDraft}
                onChange={(event) => handleRewriteChange(event.target.value)}
                placeholder="Rewrite the improved version here. Focus on the first revision target before polishing language."
              />
            </div>

            <div className="revision-studio-metric-row">
              <div className="summary-box">
                <span className="metric-label">Original words</span>
                <strong>{selectedSession.originalWordCount}</strong>
              </div>
              <div className="summary-box">
                <span className="metric-label">Rewrite words</span>
                <strong>{selectedSession.rewriteWordCount}</strong>
              </div>
              <div className="summary-box">
                <span className="metric-label">Delta</span>
                <strong>{formatWordDelta(selectedSession.wordDelta)}</strong>
              </div>
              <div className="summary-box">
                <span className="metric-label">Status</span>
                <strong>{selectedSession.statusLabel}</strong>
              </div>
            </div>

            <div className="review-checklist-panel">
              <span className="metric-label">Checklist for this rewrite</span>
              <div className="review-checklist-list">
                {selectedSession.priorityChecklist.map((item) => (
                  <article key={item.id} className="review-checklist-item">
                    <div className="history-kicker-row">
                      <span className="surface-kicker">{item.criterion}</span>
                      <span className="surface-kicker tracker-history-pill">
                        {item.priorityLevel}
                      </span>
                    </div>
                    <strong>{item.title}</strong>
                    <p>{item.instruction}</p>
                    <span>{item.successSignal}</span>
                  </article>
                ))}
              </div>
            </div>

            <div className="settings-actions">
              <Link href={`/tracker/${selectedSession.entryId}`} className="secondary-button">
                Open full detail
              </Link>
              <Link href="/readiness-lab" className="primary-button">
                Check readiness
              </Link>
              <Link href={`/writing?promptId=${selectedEntry.promptId}`} className="inline-link">
                Open writing workspace
              </Link>
            </div>
          </section>
        </div>
      ) : (
        <section className="glass writing-panel empty-state-panel">
          <div className="empty-state-illustration-wrap">
            <EmptyStateIllustration className="empty-state-illustration" />
          </div>
          <div className="panel-heading">
            <p className="section-label">Revision Studio</p>
            <h2>No saved feedback to revise yet</h2>
            <p>
              Complete a writing practice session first. Once feedback is saved,
              this page becomes your focused rewrite desk.
            </p>
          </div>
          <div className="empty-state-helper-strip">
            <span className="surface-kicker">Best first loop</span>
            <p>
              Write one Task 2 draft, save the feedback, then come back here to
              rewrite the weakest paragraph with a checklist.
            </p>
          </div>
          <div className="settings-actions">
            <Link href="/writing" className="primary-button">
              Open writing workspace
            </Link>
            <Link href="/review-queue" className="secondary-button">
              View review queue
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
