'use client'

import { useDeferredValue, useEffect, useState } from 'react'
import {
  ChecklistIcon,
  CompassIcon,
  SparklesIcon,
  TimerIcon,
  WritingIcon,
} from '@/app/_components/ui/app-icons'
import { readSessionHintFromDocument } from '@/lib/auth/session-hint'
import {
  filterSpeakingPracticePrompts,
  listSpeakingPracticeTopics,
  summarizeSpeakingPracticePrompts,
  type SpeakingPracticeDifficultyFilter,
  type SpeakingPracticePartFilter,
  type SpeakingPracticePrompt,
  type SpeakingPracticeScore,
} from '@/lib/ielts/speaking-practice'

type SpeakingPracticeWorkspaceProps = {
  prompts: SpeakingPracticePrompt[]
}

type SpeakingPromptState = {
  transcript: string
  completedCuePointIds: string[]
  prepSecondsRemaining: number
  speakingSecondsRemaining: number
}

type SpeakingPracticeState = Record<string, SpeakingPromptState>

const partOptions: SpeakingPracticePartFilter[] = [
  'All',
  'Part 1',
  'Part 2',
  'Part 3',
]

const difficultyOptions: SpeakingPracticeDifficultyFilter[] = [
  'All',
  'Guided',
  'Balanced',
  'Stretch',
]

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getStorageKey() {
  const scope = readSessionHintFromDocument()
  return scope
    ? `lumina-speaking-practice:${scope}`
    : 'lumina-speaking-practice'
}

function emptyStateForPrompt(prompt: SpeakingPracticePrompt): SpeakingPromptState {
  return {
    transcript: '',
    completedCuePointIds: [],
    prepSecondsRemaining: prompt.prepSeconds,
    speakingSecondsRemaining: prompt.speakingSeconds,
  }
}

function readStoredState(): SpeakingPracticeState {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const rawValue = window.localStorage.getItem(getStorageKey())
    return rawValue ? (JSON.parse(rawValue) as SpeakingPracticeState) : {}
  } catch {
    return {}
  }
}

function writeStoredState(state: SpeakingPracticeState) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getStorageKey(), JSON.stringify(state))
}

function SpeakingPromptPickerCard({
  isActive,
  onSelect,
  prompt,
}: {
  isActive: boolean
  onSelect: () => void
  prompt: SpeakingPracticePrompt
}) {
  return (
    <button
      type="button"
      className={`reading-practice-picker-card ${isActive ? 'is-active' : ''}`}
      onClick={onSelect}
    >
      <span className="surface-kicker">{prompt.part}</span>
      <strong>{prompt.title}</strong>
      <span>{prompt.topic}</span>
      <span>{prompt.difficulty}</span>
    </button>
  )
}

export function SpeakingPracticeWorkspace({
  prompts,
}: SpeakingPracticeWorkspaceProps) {
  const [part, setPart] = useState<SpeakingPracticePartFilter>('All')
  const [difficulty, setDifficulty] =
    useState<SpeakingPracticeDifficultyFilter>('All')
  const [topic, setTopic] = useState('All topics')
  const [searchValue, setSearchValue] = useState('')
  const [selectedPromptId, setSelectedPromptId] = useState(prompts[0]?.id ?? '')
  const [practiceState, setPracticeState] = useState<SpeakingPracticeState>(() =>
    readStoredState()
  )
  const [activeTimer, setActiveTimer] = useState<'prep' | 'speaking' | null>(null)
  const [score, setScore] = useState<SpeakingPracticeScore | null>(null)
  const [isScoring, setIsScoring] = useState(false)
  const [scoreError, setScoreError] = useState<string | null>(null)
  const deferredSearchValue = useDeferredValue(searchValue)
  const topics = listSpeakingPracticeTopics(prompts)
  const filteredPrompts = filterSpeakingPracticePrompts({
    prompts,
    query: deferredSearchValue,
    part,
    difficulty,
    topic,
  })
  const summary = summarizeSpeakingPracticePrompts(filteredPrompts)
  const selectedPrompt =
    filteredPrompts.find((prompt) => prompt.id === selectedPromptId) ??
    filteredPrompts[0] ??
    prompts[0] ??
    null
  const selectedState = selectedPrompt
    ? practiceState[selectedPrompt.id] ?? emptyStateForPrompt(selectedPrompt)
    : null
  const completedCueCount = selectedState?.completedCuePointIds.length ?? 0
  const transcriptWordCount =
    selectedState?.transcript.match(/\b[\w'-]+\b/g)?.length ?? 0

  useEffect(() => {
    writeStoredState(practiceState)
  }, [practiceState])

  useEffect(() => {
    if (!activeTimer || !selectedPrompt) {
      return
    }

    const intervalId = window.setInterval(() => {
      setPracticeState((currentState) => {
        const currentPromptState =
          currentState[selectedPrompt.id] ?? emptyStateForPrompt(selectedPrompt)
        const key =
          activeTimer === 'prep'
            ? 'prepSecondsRemaining'
            : 'speakingSecondsRemaining'
        const nextValue = Math.max(0, currentPromptState[key] - 1)

        if (nextValue === 0) {
          setActiveTimer(null)
        }

        return {
          ...currentState,
          [selectedPrompt.id]: {
            ...currentPromptState,
            [key]: nextValue,
          },
        }
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [activeTimer, selectedPrompt])

  function updateSelectedState(nextState: Partial<SpeakingPromptState>) {
    if (!selectedPrompt) {
      return
    }

    setPracticeState((currentState) => ({
      ...currentState,
      [selectedPrompt.id]: {
        ...(currentState[selectedPrompt.id] ?? emptyStateForPrompt(selectedPrompt)),
        ...nextState,
      },
    }))
  }

  function toggleCuePoint(cuePointId: string) {
    if (!selectedState) {
      return
    }

    const completedCuePointIds = selectedState.completedCuePointIds.includes(
      cuePointId
    )
      ? selectedState.completedCuePointIds.filter((id) => id !== cuePointId)
      : [...selectedState.completedCuePointIds, cuePointId]

    updateSelectedState({ completedCuePointIds })
    setScore(null)
    setScoreError(null)
  }

  function resetFilters() {
    setPart('All')
    setDifficulty('All')
    setTopic('All topics')
    setSearchValue('')
  }

  function resetSelectedPrompt() {
    if (!selectedPrompt) {
      return
    }

    setPracticeState((currentState) => ({
      ...currentState,
      [selectedPrompt.id]: emptyStateForPrompt(selectedPrompt),
    }))
    setActiveTimer(null)
    setScore(null)
    setScoreError(null)
  }

  async function scoreSelectedPrompt() {
    if (!selectedPrompt || !selectedState) {
      return
    }

    setIsScoring(true)
    setScoreError(null)

    try {
      const response = await fetch('/api/speaking-practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId: selectedPrompt.id,
          transcript: selectedState.transcript,
          completedCuePointIds: selectedState.completedCuePointIds,
        }),
      })
      const payload = (await response.json()) as
        | { ok: true; score: SpeakingPracticeScore }
        | { ok: false; error: string }

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.ok ? 'Unable to score this speaking attempt.' : payload.error
        )
      }

      setScore(payload.score)
    } catch (error) {
      setScoreError(
        error instanceof Error
          ? error.message
          : 'Unable to score this speaking attempt.'
      )
    } finally {
      setIsScoring(false)
    }
  }

  return (
    <div className="dashboard-stack reading-practice-page speaking-practice-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Speaking Practice</p>
          <h1>Train IELTS Speaking with cue-card drills</h1>
          <p>
            Prepare, speak out loud, then paste or type your answer transcript
            to get structured feedback on fluency, vocabulary, grammar, and task
            coverage.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">{summary.totalPrompts} visible prompts</span>
            <span className="hero-badge">{summary.topics} topics</span>
            <span className="hero-badge">
              {summary.averageSpeakingSeconds}s average answer
            </span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TimerIcon className="metric-icon" />
            </div>
            <span className="metric-label">Prep timer</span>
            <strong>{formatTime(selectedState?.prepSecondsRemaining ?? 0)}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <SparklesIcon className="metric-icon" />
            </div>
            <span className="metric-label">Speak timer</span>
            <strong>{formatTime(selectedState?.speakingSecondsRemaining ?? 0)}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <ChecklistIcon className="metric-icon" />
            </div>
            <span className="metric-label">Cue points</span>
            <strong>
              {completedCueCount}/{selectedPrompt?.cuePoints.length ?? 0}
            </strong>
          </div>
        </div>
      </section>

      <section className="glass writing-panel reading-practice-toolbar">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <CompassIcon className="section-icon" />
              <span>Choose a speaking prompt</span>
            </h2>
            <p>
              Filter by part, difficulty, topic, or keyword when you want a
              specific speaking drill.
            </p>
          </div>
        </div>

        <div className="speaking-practice-controls">
          <div className="field-group">
            <label htmlFor="speaking-practice-part">Part</label>
            <select
              id="speaking-practice-part"
              className="text-input"
              value={part}
              onChange={(event) =>
                setPart(event.target.value as SpeakingPracticePartFilter)
              }
            >
              {partOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All parts' : option}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="speaking-practice-difficulty">Difficulty</label>
            <select
              id="speaking-practice-difficulty"
              className="text-input"
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value as SpeakingPracticeDifficultyFilter)
              }
            >
              {difficultyOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All difficulties' : option}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="speaking-practice-topic">Topic focus</label>
            <select
              id="speaking-practice-topic"
              className="text-input"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            >
              {topics.map((topicOption) => (
                <option key={topicOption} value={topicOption}>
                  {topicOption}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group speaking-practice-search">
            <label htmlFor="speaking-practice-search">Search prompts</label>
            <input
              id="speaking-practice-search"
              className="text-input"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Try device, park, study, remote..."
            />
          </div>

          <button type="button" className="secondary-button" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
      </section>

      {filteredPrompts.length && selectedPrompt && selectedState ? (
        <div className="reading-practice-layout">
          <aside className="glass writing-panel reading-practice-picker">
            <div className="panel-heading">
              <span className="surface-kicker">Speaking bank</span>
              <h2>{filteredPrompts.length} matching prompts</h2>
            </div>
            <div className="reading-practice-picker-list">
              {filteredPrompts.map((prompt) => (
                <SpeakingPromptPickerCard
                  key={prompt.id}
                  prompt={prompt}
                  isActive={prompt.id === selectedPrompt.id}
                  onSelect={() => {
                    setSelectedPromptId(prompt.id)
                    setActiveTimer(null)
                    setScore(null)
                    setScoreError(null)
                  }}
                />
              ))}
            </div>
          </aside>

          <section className="glass writing-panel reading-practice-workspace">
            <div className="dashboard-section-header">
              <div className="panel-heading">
                <p className="section-label">Speaking drill</p>
                <h2 className="icon-heading">
                  <WritingIcon className="section-icon" />
                  <span>{selectedPrompt.title}</span>
                </h2>
                <p>{selectedPrompt.prompt}</p>
              </div>
              <div className="readiness-score-card">
                <span className="metric-label">Target</span>
                <strong>{selectedPrompt.targetWords}+ words</strong>
              </div>
            </div>

            <article className="speaking-prompt-card">
              <div className="history-kicker-row">
                <span className="surface-kicker">{selectedPrompt.part}</span>
                <span className="surface-kicker tracker-history-pill">
                  {selectedPrompt.topic}
                </span>
                <span className="surface-kicker tracker-history-pill tracker-history-pill-accent">
                  {selectedPrompt.difficulty}
                </span>
              </div>

              <div className="speaking-timer-grid">
                <div className="summary-box">
                  <span className="metric-label">Preparation</span>
                  <strong>{formatTime(selectedState.prepSecondsRemaining)}</strong>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      setActiveTimer((current) =>
                        current === 'prep' ? null : 'prep'
                      )
                    }
                  >
                    {activeTimer === 'prep' ? 'Pause prep' : 'Start prep'}
                  </button>
                </div>
                <div className="summary-box">
                  <span className="metric-label">Speaking</span>
                  <strong>
                    {formatTime(selectedState.speakingSecondsRemaining)}
                  </strong>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      setActiveTimer((current) =>
                        current === 'speaking' ? null : 'speaking'
                      )
                    }
                  >
                    {activeTimer === 'speaking' ? 'Pause speaking' : 'Start speaking'}
                  </button>
                </div>
              </div>

              <div className="speaking-cue-grid">
                {selectedPrompt.cuePoints.map((cuePoint) => {
                  const isDone = selectedState.completedCuePointIds.includes(
                    cuePoint.id
                  )

                  return (
                    <button
                      key={cuePoint.id}
                      type="button"
                      className={`practice-sprint-stage${isDone ? ' is-done' : ''}`}
                      aria-pressed={isDone}
                      aria-label={`${isDone ? 'Unmark' : 'Mark'} ${cuePoint.label} covered`}
                      onClick={() => toggleCuePoint(cuePoint.id)}
                    >
                      <span className="surface-kicker">Cue point</span>
                      <strong>{cuePoint.label}</strong>
                    </button>
                  )
                })}
              </div>
            </article>

            <div className="model-fragment-two-column">
              <section className="practice-sprint-section">
                <span className="metric-label">Follow-up questions</span>
                <ul className="bullet-list compact-list">
                  {selectedPrompt.followUpQuestions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </section>

              <section className="practice-sprint-section">
                <span className="metric-label">Vocabulary bank</span>
                <div className="idea-chip-list">
                  {selectedPrompt.vocabularyBank.map((item) => (
                    <span key={item} className="idea-chip">
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            <section className="practice-sprint-section">
              <span className="metric-label">Strategy tips</span>
              <ul className="bullet-list compact-list">
                {selectedPrompt.strategyTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>

            <div className="field-group">
              <label htmlFor="speaking-transcript">Speaking transcript</label>
              <textarea
                id="speaking-transcript"
                className="writing-textarea speaking-transcript-textarea"
                value={selectedState.transcript}
                onChange={(event) => {
                  updateSelectedState({ transcript: event.target.value })
                  setScore(null)
                  setScoreError(null)
                }}
                placeholder="Speak out loud first, then paste or type the answer transcript here for structured feedback."
              />
            </div>
            <div className="hero-badge-row">
              <span className="hero-badge">{transcriptWordCount} words</span>
              <span className="hero-badge">
                {transcriptWordCount >= selectedPrompt.targetWords
                  ? 'Target met'
                  : 'Target not met'}
              </span>
            </div>

            <div className="settings-actions">
              <button
                type="button"
                className="primary-button"
                onClick={scoreSelectedPrompt}
                disabled={isScoring}
              >
                {isScoring ? 'Scoring answer...' : 'Score speaking answer'}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={resetSelectedPrompt}
              >
                Reset prompt
              </button>
            </div>

            {scoreError ? (
              <div className="form-error" role="alert">
                {scoreError}
              </div>
            ) : null}

            {score ? (
              <section className={`reading-score-card is-${score.status}`}>
                <div className="dashboard-section-header">
                  <div className="panel-heading">
                    <span className="surface-kicker">Speaking score report</span>
                    <h3>{score.statusLabel}</h3>
                    <p>{score.summary}</p>
                  </div>
                  <div className="readiness-score-card">
                    <span className="metric-label">Readiness</span>
                    <strong>{score.readinessScore}%</strong>
                  </div>
                </div>

                <div className="reading-score-grid">
                  <div className="summary-box">
                    <span className="metric-label">Estimated band</span>
                    <strong>{score.estimatedBand.toFixed(1)}</strong>
                  </div>
                  <div className="summary-box">
                    <span className="metric-label">Words</span>
                    <strong>{score.metrics.wordCount}</strong>
                  </div>
                  <div className="summary-box">
                    <span className="metric-label">Transitions</span>
                    <strong>{score.metrics.transitionCount}</strong>
                  </div>
                </div>

                <div className="progress-insight-rubric-grid">
                  {score.criteria.map((criterion) => (
                    <article key={criterion.id} className="progress-insight-rubric-card">
                      <div className="progress-insight-rubric-header">
                        <strong>{criterion.label}</strong>
                        <span>{criterion.score}%</span>
                      </div>
                      <div className="progress-insight-bar" aria-hidden="true">
                        <span style={{ width: `${criterion.score}%` }} />
                      </div>
                      <p>{criterion.summary}</p>
                    </article>
                  ))}
                </div>

                <div className="reading-score-section">
                  <span className="metric-label">Next actions</span>
                  <ul className="mock-test-action-list">
                    {score.nextActions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : null}
          </section>
        </div>
      ) : (
        <section className="glass writing-panel empty-state-panel">
          <div className="panel-heading">
            <p className="section-label">Speaking Practice</p>
            <h2>No speaking prompts match this filter</h2>
            <p>Clear filters or search a broader topic to return to the bank.</p>
          </div>
          <button type="button" className="primary-button" onClick={resetFilters}>
            Reset filters
          </button>
        </section>
      )}
    </div>
  )
}
