'use client'

import Link from 'next/link'
import { useEffect, useSyncExternalStore } from 'react'
import {
  CompassIcon,
  RibbonIcon,
  SparklesIcon,
  TargetIcon,
  TrackerIcon,
  WritingIcon,
} from '@/app/_components/ui/app-icons'
import { EmptyStateIllustration } from '@/app/_components/ui/pastel-illustrations'
import {
  createMistakeJournal,
  type MistakeJournalPattern,
} from '@/lib/ielts/mistake-journal'
import {
  hydrateWritingHistory,
  getServerWritingHistorySnapshot,
  getWritingHistorySnapshot,
  subscribeToWritingHistory,
  type WritingHistoryEntry,
} from '@/lib/ielts/writing-history'

type MistakeJournalWorkspaceProps = {
  initialEntries?: WritingHistoryEntry[]
}

function formatDate(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function MistakePatternCard({ pattern }: { pattern: MistakeJournalPattern }) {
  return (
    <article className="activity-card mistake-pattern-card">
      <div className="history-kicker-row">
        <span className="surface-kicker">{pattern.criterion}</span>
        <span className="surface-kicker tracker-history-pill">
          {pattern.count} evidence points
        </span>
        <span className="surface-kicker tracker-history-pill tracker-history-pill-accent">
          {pattern.taskTypes.join(' + ')}
        </span>
      </div>
      <div className="activity-card-header">
        <div>
          <span className="prompt-type">Mistake pattern</span>
          <h3 className="icon-heading">
            <RibbonIcon className="section-icon" />
            <span>{pattern.label}</span>
          </h3>
        </div>
      </div>
      <p>{pattern.description}</p>
      <div className="mistake-revision-hint">
        <span className="metric-label">Revision hint</span>
        <strong>{pattern.revisionHint}</strong>
      </div>
      <div className="mistake-example">
        <span className="metric-label">Typical pattern</span>
        <p>{pattern.examplePattern}</p>
      </div>
      <div className="mistake-evidence-list">
        {pattern.evidence.map((evidence) => (
          <Link
            key={evidence.id}
            href={`/tracker/${evidence.entryId}`}
            className="mistake-evidence-card"
          >
            <span className="surface-kicker">
              {evidence.sourceType === 'revision-plan' ? 'Revision plan' : 'Priority'}
            </span>
            <strong>{evidence.promptTitle}</strong>
            <p>{evidence.text}</p>
            <span>{formatDate(evidence.createdAt)}</span>
          </Link>
        ))}
      </div>
    </article>
  )
}

export function MistakeJournalWorkspace({
  initialEntries = [],
}: MistakeJournalWorkspaceProps) {
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
  const journal = createMistakeJournal(entries)
  const topPattern = journal.topPattern

  return (
    <div className="dashboard-stack mistake-journal-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Mistake Journal</p>
          <h1>{journal.headline}</h1>
          <p>{journal.summary}</p>
          <div className="hero-badge-row">
            <span className="hero-badge">{entries.length} saved sessions</span>
            <span className="hero-badge">
              {journal.mostAffectedCriterion ?? 'Pattern discovery'}
            </span>
            <span className="hero-badge">{journal.totalEvidence} evidence points</span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <RibbonIcon className="metric-icon" />
            </div>
            <span className="metric-label">Patterns</span>
            <strong>{journal.totalPatterns}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TrackerIcon className="metric-icon" />
            </div>
            <span className="metric-label">Evidence</span>
            <strong>{journal.totalEvidence}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TargetIcon className="metric-icon" />
            </div>
            <span className="metric-label">Top focus</span>
            <strong>{topPattern?.criterion ?? 'Ready'}</strong>
          </div>
        </div>
      </section>

      {journal.patterns.length ? (
        <>
          <section className="dashboard-grid dashboard-metrics">
            <article className="glass dashboard-card">
              <span className="surface-kicker">Start here</span>
              <h2 className="card-title icon-heading">
                <TargetIcon className="section-icon" />
                <span>Top Pattern</span>
              </h2>
              <p>{topPattern?.label}</p>
              <p>{topPattern?.revisionHint}</p>
            </article>
            <article className="glass dashboard-card">
              <span className="surface-kicker">Rubric lens</span>
              <h2 className="card-title icon-heading">
                <CompassIcon className="section-icon" />
                <span>Affected Criterion</span>
              </h2>
              <p>
                {journal.mostAffectedCriterion
                  ? `${journal.mostAffectedCriterion} is currently carrying the most repeated evidence.`
                  : 'Save more feedback to identify a criterion trend.'}
              </p>
            </article>
            <article className="glass dashboard-card">
              <span className="surface-kicker">Practice loop</span>
              <h2 className="card-title icon-heading">
                <WritingIcon className="section-icon" />
                <span>Apply It</span>
              </h2>
              <p>Pick one pattern, rewrite one paragraph, then run a fresh feedback pass.</p>
              <Link href="/review-queue" className="inline-link">
                Open review queue
              </Link>
            </article>
          </section>

          <section className="glass writing-panel">
            <div className="dashboard-section-header">
              <div className="panel-heading">
                <h2 className="icon-heading">
                  <SparklesIcon className="section-icon" />
                  <span>Recurring Mistake Patterns</span>
                </h2>
                <p>Use these patterns as your pre-writing checklist before the next task.</p>
              </div>
              <Link href="/writing" className="inline-link">
                Start a new draft
              </Link>
            </div>

            <div className="mistake-pattern-grid">
              {journal.patterns.map((pattern) => (
                <MistakePatternCard key={pattern.code} pattern={pattern} />
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
            <p className="section-label">Mistake Journal</p>
            <h2>No mistake patterns yet</h2>
            <p>
              Complete a few writing feedback runs and this journal will group
              repeated priorities into IELTS rubric patterns.
            </p>
          </div>
          <div className="empty-state-helper-strip">
            <span className="surface-kicker">Quick win</span>
            <p>
              Save two drafts on related topics. Repeated revision priorities
              will reveal your first reliable mistake pattern.
            </p>
          </div>
          <div className="settings-actions">
            <Link href="/writing" className="primary-button">
              Open writing workspace
            </Link>
            <Link href="/tracker" className="secondary-button">
              View tracker
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
