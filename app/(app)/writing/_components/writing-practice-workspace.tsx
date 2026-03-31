'use client'

import { useDeferredValue, useEffect, useState, useTransition } from 'react'
import {
  evaluateWriting,
  getDraftMetrics,
  type WritingEvaluation,
} from '@/lib/ielts/writing-feedback'
import {
  createWritingHistoryEntry,
  saveWritingHistoryEntry,
} from '@/lib/ielts/writing-history'
import type { WritingPrompt } from '@/lib/ielts/writing-prompts'

type WritingPracticeWorkspaceProps = {
  prompts: WritingPrompt[]
}

type DraftState = {
  draft: string
  remainingSeconds: number
  statusMessage: string
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getStorageKey(promptId: string) {
  return `lumina-writing-draft:${promptId}`
}

function getDefaultDraftState(prompt: WritingPrompt): DraftState {
  return {
    draft: '',
    remainingSeconds: prompt.durationMinutes * 60,
    statusMessage: 'Ready for a new draft',
  }
}

function loadDraftState(prompt: WritingPrompt): DraftState {
  if (typeof window === 'undefined') {
    return getDefaultDraftState(prompt)
  }

  const storageKey = getStorageKey(prompt.id)
  const savedState = window.localStorage.getItem(storageKey)

  if (!savedState) {
    return getDefaultDraftState(prompt)
  }

  try {
    const parsedState = JSON.parse(savedState) as Partial<DraftState>
    return {
      draft: parsedState.draft ?? '',
      remainingSeconds:
        typeof parsedState.remainingSeconds === 'number'
          ? parsedState.remainingSeconds
          : prompt.durationMinutes * 60,
      statusMessage: 'Draft restored from local autosave',
    }
  } catch {
    return {
      ...getDefaultDraftState(prompt),
      statusMessage: 'Saved draft could not be restored',
    }
  }
}

export function WritingPracticeWorkspace({
  prompts,
}: WritingPracticeWorkspaceProps) {
  const [selectedTask, setSelectedTask] = useState<'Task 1' | 'Task 2'>('Task 2')
  const filteredPrompts = prompts.filter((prompt) => prompt.taskType === selectedTask)
  const [selectedPromptId, setSelectedPromptId] = useState(filteredPrompts[0]?.id ?? prompts[0].id)
  const selectedPrompt =
    filteredPrompts.find((prompt) => prompt.id === selectedPromptId) ?? filteredPrompts[0]

  function handleTaskChange(task: 'Task 1' | 'Task 2') {
    const nextPrompts = prompts.filter((prompt) => prompt.taskType === task)
    setSelectedTask(task)
    setSelectedPromptId(nextPrompts[0].id)
  }

  return (
    <div className="writing-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Writing Practice</p>
          <h1>Train like a real IELTS session</h1>
          <p>
            Pick a prompt, manage your timer, build your draft, and receive a
            structured practice estimate before we wire in full AI review.
          </p>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <span className="metric-label">Task</span>
            <strong>{selectedPrompt.taskType}</strong>
          </div>
          <div className="metric-pill">
            <span className="metric-label">Word target</span>
            <strong>{selectedPrompt.minimumWords}+</strong>
          </div>
          <div className="metric-pill">
            <span className="metric-label">Focus</span>
            <strong>{selectedPrompt.title}</strong>
          </div>
        </div>
      </section>

      <div className="writing-layout">
        <aside className="glass writing-panel prompt-library">
          <div className="panel-heading">
            <h2>Prompt Library</h2>
            <p>Switch between Task 1 and Task 2 prompts without losing autosaved drafts.</p>
          </div>

          <div className="task-switcher" role="tablist" aria-label="Writing task type">
            {(['Task 1', 'Task 2'] as const).map((task) => (
              <button
                key={task}
                type="button"
                className={`task-chip${selectedTask === task ? ' is-active' : ''}`}
                onClick={() => handleTaskChange(task)}
              >
                {task}
              </button>
            ))}
          </div>

          <div className="prompt-list">
            {filteredPrompts.map((prompt) => (
              <button
                key={prompt.id}
                type="button"
                className={`prompt-card${selectedPrompt.id === prompt.id ? ' is-active' : ''}`}
                onClick={() => setSelectedPromptId(prompt.id)}
              >
                <span className="prompt-type">{prompt.taskType}</span>
                <strong>{prompt.title}</strong>
                <p>{prompt.brief}</p>
              </button>
            ))}
          </div>
        </aside>

        <PromptWorkspacePanel key={selectedPrompt.id} prompt={selectedPrompt} />
      </div>
    </div>
  )
}

function PromptWorkspacePanel({ prompt }: { prompt: WritingPrompt }) {
  const initialDraftState = loadDraftState(prompt)
  const [draft, setDraft] = useState(initialDraftState.draft)
  const [remainingSeconds, setRemainingSeconds] = useState(
    initialDraftState.remainingSeconds
  )
  const [statusMessage, setStatusMessage] = useState(initialDraftState.statusMessage)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [feedback, setFeedback] = useState<WritingEvaluation | null>(null)
  const [isPending, startTransition] = useTransition()
  const deferredDraft = useDeferredValue(draft)
  const draftMetrics = getDraftMetrics(deferredDraft)

  useEffect(() => {
    const storageKey = getStorageKey(prompt.id)

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        draft,
        remainingSeconds,
      })
    )
  }, [draft, remainingSeconds, prompt.id])

  useEffect(() => {
    if (!isTimerRunning) {
      return
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          setIsTimerRunning(false)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [isTimerRunning])

  function markAutosave() {
    setStatusMessage(
      `Autosaved at ${new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    )
  }

  function handleDraftChange(value: string) {
    setDraft(value)

    if (value.trim()) {
      markAutosave()
    } else {
      setStatusMessage('Draft cleared locally')
    }
  }

  function handleSubmit() {
    startTransition(() => {
      const nextFeedback = evaluateWriting(prompt, draft)
      setFeedback(nextFeedback)
      saveWritingHistoryEntry(
        createWritingHistoryEntry({
          prompt,
          draft,
          feedback: nextFeedback,
        })
      )
      setStatusMessage(
        `Practice result saved at ${new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`
      )
    })
  }

  function handleResetTimer() {
    setRemainingSeconds(prompt.durationMinutes * 60)
    setIsTimerRunning(false)
    markAutosave()
  }

  function handleClearDraft() {
    const defaultState = getDefaultDraftState(prompt)
    setDraft(defaultState.draft)
    setRemainingSeconds(defaultState.remainingSeconds)
    setFeedback(null)
    setIsTimerRunning(false)
    window.localStorage.removeItem(getStorageKey(prompt.id))
    setStatusMessage('Draft cleared for this prompt')
  }

  return (
    <>
      <section className="glass writing-panel editor-panel">
        <div className="panel-heading">
          <h2>{prompt.title}</h2>
          <p>{prompt.brief}</p>
        </div>

        <div className="writing-meta-grid">
          <div className="meta-card">
            <span className="metric-label">Recommended time</span>
            <strong>{prompt.durationMinutes} minutes</strong>
          </div>
          <div className="meta-card">
            <span className="metric-label">Word count</span>
            <strong>{draftMetrics.wordCount} words</strong>
          </div>
          <div className="meta-card">
            <span className="metric-label">Autosave</span>
            <strong>{statusMessage}</strong>
          </div>
        </div>

        <div className="editor-toolbar">
          <div className="timer-box">
            <span className="metric-label">Session timer</span>
            <strong>{formatTime(remainingSeconds)}</strong>
          </div>

          <div className="toolbar-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setIsTimerRunning((current) => !current)}
            >
              {isTimerRunning ? 'Pause timer' : 'Start timer'}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={handleResetTimer}
            >
              Reset timer
            </button>
            <button type="button" className="secondary-button" onClick={handleClearDraft}>
              Clear draft
            </button>
          </div>
        </div>

        <div className="writing-guidance">
          <div>
            <h3>Instructions</h3>
            <ul className="bullet-list">
              {prompt.instructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Planning checklist</h3>
            <ul className="bullet-list">
              {prompt.planningChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <label className="editor-label" htmlFor="writing-draft">
          Draft editor
        </label>
        <textarea
          id="writing-draft"
          className="writing-textarea"
          value={draft}
          onChange={(event) => handleDraftChange(event.target.value)}
          placeholder="Write your IELTS response here. Your draft is autosaved locally for the selected prompt."
        />

        <div className="editor-footer">
          <p>
            Paragraphs: {draftMetrics.paragraphCount} | Sentences:{' '}
            {draftMetrics.sentenceCount}
          </p>
          <button
            type="button"
            className="primary-button"
            disabled={!draft.trim() || isPending}
            onClick={handleSubmit}
          >
            {isPending ? 'Reviewing draft...' : 'Generate practice feedback'}
          </button>
        </div>
      </section>

      <aside className="glass writing-panel feedback-panel">
        <div className="panel-heading">
          <h2>Feedback Snapshot</h2>
          <p>
            This practice estimate runs locally and is designed to guide your
            next revision pass.
          </p>
        </div>

        {feedback ? (
          <div className="feedback-stack">
            <div className="score-card">
              <span className="metric-label">Estimated band</span>
              <strong>{feedback.estimatedBand.toFixed(1)}</strong>
              <p>{feedback.coachingNote}</p>
            </div>

            <div className="summary-grid">
              <div className="summary-box">
                <span className="metric-label">Words</span>
                <strong>{feedback.wordCount}</strong>
              </div>
              <div className="summary-box">
                <span className="metric-label">Paragraphs</span>
                <strong>{feedback.paragraphCount}</strong>
              </div>
              <div className="summary-box">
                <span className="metric-label">Sentences</span>
                <strong>{feedback.sentenceCount}</strong>
              </div>
            </div>

            <div className="rubric-list">
              {feedback.rubric.map((row) => (
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
              <h3>Strengths</h3>
              <ul className="bullet-list">
                {feedback.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="feedback-section">
              <h3>Revision priorities</h3>
              <ul className="bullet-list">
                {feedback.priorities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="empty-feedback">
            <p className="metric-label">Ready to review</p>
            <h3>Your draft feedback will appear here</h3>
            <p>
              Use the editor to write a full draft, then generate a practice
              estimate to see rubric signals and revision advice.
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
