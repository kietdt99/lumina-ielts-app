'use client'

import Link from 'next/link'
import { useDeferredValue, useMemo, useState } from 'react'
import {
  ChecklistIcon,
  CompassIcon,
  SparklesIcon,
  TimerIcon,
  WritingIcon,
} from '@/app/_components/ui/app-icons'
import { StatusCallout } from '@/app/_components/ui/status-callout'
import { getDraftMetrics } from '@/lib/ielts/writing-feedback'
import type {
  WritingReadinessCheck,
  WritingReadinessResponse,
  WritingReadinessStatus,
} from '@/lib/ielts/writing-readiness'
import type { WritingPrompt } from '@/lib/ielts/writing-prompts'

type ReadinessLabWorkspaceProps = {
  prompts: WritingPrompt[]
}

function readinessStatusLabel(status: WritingReadinessStatus) {
  if (status === 'ready') {
    return 'Ready'
  }

  return status === 'needs-work' ? 'Needs work' : 'Missing'
}

function writingHref(promptId: string) {
  return `/writing?${new URLSearchParams({ promptId }).toString()}`
}

function outlineHref(promptId: string) {
  return `/writing?${new URLSearchParams({ promptId, outline: '1' }).toString()}`
}

function ReadinessResultPanel({
  readiness,
}: {
  readiness: WritingReadinessCheck
}) {
  const missingItems = readiness.items.filter((item) => item.status === 'missing')
  const needsWorkItems = readiness.items.filter(
    (item) => item.status === 'needs-work'
  )

  return (
    <section className="writing-readiness-panel" aria-label="Readiness result">
      <div className="dashboard-section-header writing-readiness-header">
        <div className="panel-heading">
          <span className="surface-kicker">Readiness result</span>
          <h2 className="icon-heading">
            <ChecklistIcon className="section-icon" />
            <span>{readiness.headline}</span>
          </h2>
          <p>{readiness.summary}</p>
        </div>
        <div className="readiness-score-card">
          <span className="metric-label">Readiness</span>
          <strong>{readiness.readinessScore}%</strong>
        </div>
      </div>

      <div className="readiness-metric-row">
        <span className="hero-badge">{readiness.metrics.wordCount} words</span>
        <span className="hero-badge">{readiness.metrics.paragraphCount} paragraphs</span>
        <span className="hero-badge">{readiness.metrics.sentenceCount} sentences</span>
        <span className="hero-badge">{readiness.metrics.transitionCount} transitions</span>
      </div>

      <div className="readiness-check-grid">
        {readiness.items.map((item) => (
          <article
            key={item.id}
            className={`readiness-check-card is-${item.status}`}
          >
            <div className="history-kicker-row">
              <span className="surface-kicker">{item.criterion}</span>
              <span className="surface-kicker tracker-history-pill">
                {readinessStatusLabel(item.status)}
              </span>
            </div>
            <h4>{item.label}</h4>
            <p>{item.detail}</p>
            <strong>{item.action}</strong>
          </article>
        ))}
      </div>

      <div className="readiness-lab-summary-grid">
        <div className="model-fragment-section">
          <span className="metric-label">Fix first</span>
          <p>
            {missingItems[0]?.action ??
              needsWorkItems[0]?.action ??
              'The draft is strong enough for a practice feedback run.'}
          </p>
        </div>
        <div className="model-fragment-section">
          <span className="metric-label">Then</span>
          <p>
            {missingItems.length || needsWorkItems.length
              ? 'Run the check again before generating feedback.'
              : 'Move into the Writing workspace and request feedback.'}
          </p>
        </div>
      </div>
    </section>
  )
}

export function ReadinessLabWorkspace({ prompts }: ReadinessLabWorkspaceProps) {
  const [selectedPromptId, setSelectedPromptId] = useState(
    prompts.find((prompt) => prompt.id === 'task2-remote-work')?.id ??
      prompts[0]?.id ??
      ''
  )
  const [draft, setDraft] = useState('')
  const [readiness, setReadiness] = useState<WritingReadinessCheck | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const selectedPrompt =
    prompts.find((prompt) => prompt.id === selectedPromptId) ??
    (prompts[0] as WritingPrompt)
  const deferredDraft = useDeferredValue(draft)
  const metrics = getDraftMetrics(deferredDraft)
  const promptOptionsByTask = useMemo(
    () => ({
      taskOne: prompts.filter((prompt) => prompt.taskType === 'Task 1'),
      taskTwo: prompts.filter((prompt) => prompt.taskType === 'Task 2'),
    }),
    [prompts]
  )

  async function runReadinessCheck() {
    setIsChecking(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/writing/readiness', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId: selectedPrompt.id,
          draft,
        }),
      })
      const payload = (await response.json()) as WritingReadinessResponse

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? 'Unable to run readiness check.' : payload.error)
      }

      setReadiness(payload.readiness)
    } catch (error) {
      setReadiness(null)
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to run readiness check.'
      )
    } finally {
      setIsChecking(false)
    }
  }

  function handlePromptChange(promptId: string) {
    setSelectedPromptId(promptId)
    setReadiness(null)
    setErrorMessage(null)
  }

  return (
    <div className="dashboard-stack readiness-lab-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Readiness Lab</p>
          <h1>Check a draft before asking for feedback</h1>
          <p>
            Paste a draft, choose the matching IELTS prompt, and run a
            pre-submit check for structure, word target, cohesion, vocabulary,
            and sentence control.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">{prompts.length} prompts supported</span>
            <span className="hero-badge">{metrics.wordCount} live words</span>
            <span className="hero-badge">{metrics.paragraphCount} paragraphs</span>
            <span className="hero-badge">{selectedPrompt.taskType}</span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <WritingIcon className="metric-icon" />
            </div>
            <span className="metric-label">Target</span>
            <strong>{selectedPrompt.minimumWords}+</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TimerIcon className="metric-icon" />
            </div>
            <span className="metric-label">Time</span>
            <strong>{selectedPrompt.durationMinutes}m</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <SparklesIcon className="metric-icon" />
            </div>
            <span className="metric-label">Difficulty</span>
            <strong>{selectedPrompt.difficulty}</strong>
          </div>
        </div>
      </section>

      <div className="readiness-lab-layout">
        <section className="glass writing-panel readiness-lab-editor">
          <div className="dashboard-section-header">
            <div className="panel-heading">
              <h2 className="icon-heading">
                <CompassIcon className="section-icon" />
                <span>Run a readiness check</span>
              </h2>
              <p>
                Use this before generating feedback when you want to catch the
                obvious blockers yourself first.
              </p>
            </div>
            <Link href="/practice-sprint" className="inline-link">
              Open practice sprints
            </Link>
          </div>

          <div className="readiness-lab-controls">
            <div className="field-group">
              <label htmlFor="readiness-lab-prompt">Writing prompt</label>
              <select
                id="readiness-lab-prompt"
                className="text-input"
                value={selectedPrompt.id}
                onChange={(event) => handlePromptChange(event.target.value)}
              >
                <optgroup label="Task 2">
                  {promptOptionsByTask.taskTwo.map((prompt) => (
                    <option key={prompt.id} value={prompt.id}>
                      {prompt.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Task 1">
                  {promptOptionsByTask.taskOne.map((prompt) => (
                    <option key={prompt.id} value={prompt.id}>
                      {prompt.title}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="readiness-lab-prompt-card">
              <span className="surface-kicker">{selectedPrompt.topic}</span>
              <h3>{selectedPrompt.title}</h3>
              <p>{selectedPrompt.brief}</p>
              <div className="hero-badge-row">
                <span className="hero-badge">{selectedPrompt.taskType}</span>
                <span className="hero-badge">{selectedPrompt.minimumWords}+ words</span>
                <span className="hero-badge">{selectedPrompt.durationMinutes} minutes</span>
              </div>
            </div>
          </div>

          <label className="editor-label" htmlFor="readiness-lab-draft">
            Draft to check
          </label>
          <textarea
            id="readiness-lab-draft"
            className="writing-textarea readiness-lab-textarea"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value)
              setReadiness(null)
              setErrorMessage(null)
            }}
            placeholder="Paste or write your IELTS draft here. The lab will check readiness signals before you request feedback."
          />

          <div className="readiness-lab-action-row">
            <div className="hero-badge-row">
              <span className="hero-badge">{metrics.wordCount} words</span>
              <span className="hero-badge">{metrics.sentenceCount} sentences</span>
              <span className="hero-badge">{metrics.transitionCount} transitions</span>
            </div>
            <button
              type="button"
              className="primary-button"
              disabled={isChecking}
              onClick={runReadinessCheck}
            >
              {isChecking ? 'Checking draft...' : 'Run readiness check'}
            </button>
          </div>

          {errorMessage ? (
            <StatusCallout variant="error" title="Readiness check failed.">
              <p>{errorMessage}</p>
            </StatusCallout>
          ) : null}
        </section>

        <aside className="glass writing-panel readiness-lab-help">
          <div className="panel-heading">
            <span className="surface-kicker">How to use this lab</span>
            <h2 className="icon-heading">
              <ChecklistIcon className="section-icon" />
              <span>Fix blockers before feedback</span>
            </h2>
            <p>
              The check is not a band score. It tells you whether the draft has
              enough structure and language signals for feedback to be useful.
            </p>
          </div>
          <div className="model-fragment-section">
            <span className="metric-label">Best moment</span>
            <p>
              Run this after the first complete draft, before saving the final
              feedback result.
            </p>
          </div>
          <div className="model-fragment-section">
            <span className="metric-label">Next move</span>
            <p>
              When readiness reaches 80% or more, move into Writing and request
              the full practice feedback snapshot.
            </p>
          </div>
          <div className="settings-actions">
            <Link href={outlineHref(selectedPrompt.id)} className="primary-button">
              Open with outline
            </Link>
            <Link href={writingHref(selectedPrompt.id)} className="secondary-button">
              Open draft workspace
            </Link>
          </div>
        </aside>
      </div>

      {readiness ? <ReadinessResultPanel readiness={readiness} /> : (
        <section className="glass writing-panel empty-state-panel">
          <div className="panel-heading">
            <p className="section-label">Readiness Lab</p>
            <h2>No readiness result yet</h2>
            <p>
              Paste a draft and run the check to see which feedback blockers are
              ready, missing, or still need work.
            </p>
          </div>
          <div className="model-fragment-two-column">
            <div className="model-fragment-section">
              <span className="metric-label">Task focus</span>
              <p>
                Task 1 looks for an overview signal. Task 2 looks for a clear
                position and conclusion signal.
              </p>
            </div>
            <div className="model-fragment-section">
              <span className="metric-label">Language control</span>
              <p>
                The lab checks transitions, sentence control, and vocabulary
                range before you spend a feedback run.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
