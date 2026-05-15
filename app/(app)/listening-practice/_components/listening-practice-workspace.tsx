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
  filterListeningPracticeTracks,
  listListeningPracticeTopics,
  summarizeListeningPracticeTracks,
  type ListeningPracticeAnswerMap,
  type ListeningPracticeDifficultyFilter,
  type ListeningPracticeScore,
  type ListeningPracticeSectionFilter,
  type PublicListeningPracticeTrack,
} from '@/lib/ielts/listening-practice'

type ListeningPracticeWorkspaceProps = {
  tracks: PublicListeningPracticeTrack[]
}

type ListeningTrackState = {
  answers: ListeningPracticeAnswerMap
  notes: string
  revealedTurns: number
}

type ListeningPracticeState = Record<string, ListeningTrackState>

const difficultyOptions: ListeningPracticeDifficultyFilter[] = [
  'All',
  'Guided',
  'Balanced',
  'Stretch',
]

const sectionOptions: ListeningPracticeSectionFilter[] = [
  'All',
  'Part 1',
  'Part 2',
  'Part 3',
  'Part 4',
]

function getStorageKey() {
  const scope = readSessionHintFromDocument()
  return scope
    ? `lumina-listening-practice:${scope}`
    : 'lumina-listening-practice'
}

function emptyStateForTrack(track: PublicListeningPracticeTrack): ListeningTrackState {
  return {
    answers: Object.fromEntries(
      track.questions.map((question) => [question.id, ''])
    ) as ListeningPracticeAnswerMap,
    notes: '',
    revealedTurns: 0,
  }
}

function readStoredState(): ListeningPracticeState {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const rawValue = window.localStorage.getItem(getStorageKey())
    return rawValue ? (JSON.parse(rawValue) as ListeningPracticeState) : {}
  } catch {
    return {}
  }
}

function writeStoredState(state: ListeningPracticeState) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getStorageKey(), JSON.stringify(state))
}

function ListeningTrackPickerCard({
  isActive,
  onSelect,
  track,
}: {
  isActive: boolean
  onSelect: () => void
  track: PublicListeningPracticeTrack
}) {
  return (
    <button
      type="button"
      className={`reading-practice-picker-card ${isActive ? 'is-active' : ''}`}
      onClick={onSelect}
    >
      <span className="surface-kicker">{track.section}</span>
      <strong>{track.title}</strong>
      <span>{track.topic}</span>
      <span>{track.accent} accent</span>
    </button>
  )
}

export function ListeningPracticeWorkspace({
  tracks,
}: ListeningPracticeWorkspaceProps) {
  const [section, setSection] = useState<ListeningPracticeSectionFilter>('All')
  const [difficulty, setDifficulty] =
    useState<ListeningPracticeDifficultyFilter>('All')
  const [topic, setTopic] = useState('All topics')
  const [searchValue, setSearchValue] = useState('')
  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0]?.id ?? '')
  const [practiceState, setPracticeState] = useState<ListeningPracticeState>(() =>
    readStoredState()
  )
  const [score, setScore] = useState<ListeningPracticeScore | null>(null)
  const [isScoring, setIsScoring] = useState(false)
  const [scoreError, setScoreError] = useState<string | null>(null)
  const deferredSearchValue = useDeferredValue(searchValue)
  const topics = listListeningPracticeTopics(tracks)
  const filteredTracks = filterListeningPracticeTracks({
    tracks,
    query: deferredSearchValue,
    section,
    difficulty,
    topic,
  })
  const summary = summarizeListeningPracticeTracks(filteredTracks)
  const selectedTrack =
    filteredTracks.find((track) => track.id === selectedTrackId) ??
    filteredTracks[0] ??
    tracks[0] ??
    null
  const selectedState = selectedTrack
    ? practiceState[selectedTrack.id] ?? emptyStateForTrack(selectedTrack)
    : null
  const selectedAnswers = selectedState?.answers ?? {}
  const answeredCount = Object.values(selectedAnswers).filter(Boolean).length
  const revealedTurns = selectedState?.revealedTurns ?? 0
  const visibleTranscript = selectedTrack
    ? selectedTrack.transcript.slice(0, revealedTurns)
    : []

  useEffect(() => {
    writeStoredState(practiceState)
  }, [practiceState])

  function updateSelectedState(nextState: Partial<ListeningTrackState>) {
    if (!selectedTrack) {
      return
    }

    setPracticeState((currentState) => ({
      ...currentState,
      [selectedTrack.id]: {
        ...(currentState[selectedTrack.id] ?? emptyStateForTrack(selectedTrack)),
        ...nextState,
      },
    }))
  }

  function updateAnswer(questionId: string, value: string) {
    updateSelectedState({
      answers: {
        ...selectedAnswers,
        [questionId]: value,
      },
    })
    setScore(null)
    setScoreError(null)
  }

  function resetFilters() {
    setSection('All')
    setDifficulty('All')
    setTopic('All topics')
    setSearchValue('')
  }

  function resetSelectedTrack() {
    if (!selectedTrack) {
      return
    }

    setPracticeState((currentState) => ({
      ...currentState,
      [selectedTrack.id]: emptyStateForTrack(selectedTrack),
    }))
    setScore(null)
    setScoreError(null)
  }

  async function scoreSelectedTrack() {
    if (!selectedTrack || !selectedState) {
      return
    }

    setIsScoring(true)
    setScoreError(null)

    try {
      const response = await fetch('/api/listening-practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackId: selectedTrack.id,
          answers: selectedAnswers,
          notes: selectedState.notes,
        }),
      })
      const payload = (await response.json()) as
        | { ok: true; score: ListeningPracticeScore }
        | { ok: false; error: string }

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.ok ? 'Unable to score this listening attempt.' : payload.error
        )
      }

      setScore(payload.score)
    } catch (error) {
      setScoreError(
        error instanceof Error
          ? error.message
          : 'Unable to score this listening attempt.'
      )
    } finally {
      setIsScoring(false)
    }
  }

  return (
    <div className="dashboard-stack reading-practice-page listening-practice-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Listening Practice</p>
          <h1>Train IELTS Listening with replayable simulations</h1>
          <p>
            Listen through a transcript-based audio simulation, take short
            notes, answer IELTS-style questions, then review the evidence behind
            each answer.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">{summary.totalTracks} visible tracks</span>
            <span className="hero-badge">{summary.totalQuestions} questions</span>
            <span className="hero-badge">{summary.averageMinutes} min average</span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <CompassIcon className="metric-icon" />
            </div>
            <span className="metric-label">Topics</span>
            <strong>{summary.topics}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <ChecklistIcon className="metric-icon" />
            </div>
            <span className="metric-label">Answered</span>
            <strong>{answeredCount}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TimerIcon className="metric-icon" />
            </div>
            <span className="metric-label">Track time</span>
            <strong>{selectedTrack?.estimatedMinutes ?? 0} min</strong>
          </div>
        </div>
      </section>

      <section className="glass writing-panel reading-practice-toolbar">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <SparklesIcon className="section-icon" />
              <span>Choose a listening track</span>
            </h2>
            <p>
              Filter by IELTS section, topic, difficulty, or keyword when you
              want a targeted listening drill.
            </p>
          </div>
        </div>

        <div className="listening-practice-controls">
          <div className="field-group">
            <label htmlFor="listening-practice-section">Section</label>
            <select
              id="listening-practice-section"
              className="text-input"
              value={section}
              onChange={(event) =>
                setSection(event.target.value as ListeningPracticeSectionFilter)
              }
            >
              {sectionOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All sections' : option}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="listening-practice-difficulty">Difficulty</label>
            <select
              id="listening-practice-difficulty"
              className="text-input"
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value as ListeningPracticeDifficultyFilter)
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
            <label htmlFor="listening-practice-topic">Topic focus</label>
            <select
              id="listening-practice-topic"
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

          <div className="field-group listening-practice-search">
            <label htmlFor="listening-practice-search">Search tracks</label>
            <input
              id="listening-practice-search"
              className="text-input"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Try library, museum, gardens..."
            />
          </div>

          <button type="button" className="secondary-button" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
      </section>

      {filteredTracks.length && selectedTrack && selectedState ? (
        <div className="reading-practice-layout">
          <aside className="glass writing-panel reading-practice-picker">
            <div className="panel-heading">
              <span className="surface-kicker">Listening bank</span>
              <h2>{filteredTracks.length} matching tracks</h2>
            </div>
            <div className="reading-practice-picker-list">
              {filteredTracks.map((track) => (
                <ListeningTrackPickerCard
                  key={track.id}
                  track={track}
                  isActive={track.id === selectedTrack.id}
                  onSelect={() => {
                    setSelectedTrackId(track.id)
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
                <p className="section-label">Audio simulation</p>
                <h2 className="icon-heading">
                  <WritingIcon className="section-icon" />
                  <span>{selectedTrack.title}</span>
                </h2>
                <p>{selectedTrack.summary}</p>
              </div>
              <div className="readiness-score-card">
                <span className="metric-label">Questions</span>
                <strong>{selectedTrack.questions.length}</strong>
              </div>
            </div>

            <article className="listening-transcript-card">
              <div className="history-kicker-row">
                <span className="surface-kicker">{selectedTrack.section}</span>
                <span className="surface-kicker tracker-history-pill">
                  {selectedTrack.accent} accent
                </span>
                <span className="surface-kicker tracker-history-pill tracker-history-pill-accent">
                  {selectedTrack.difficulty}
                </span>
              </div>
              <strong>{selectedTrack.audioCue}</strong>
              <div className="settings-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    updateSelectedState({
                      revealedTurns: Math.max(1, revealedTurns),
                    })
                  }
                >
                  Start audio simulation
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    updateSelectedState({
                      revealedTurns: Math.min(
                        selectedTrack.transcript.length,
                        revealedTurns + 1
                      ),
                    })
                  }
                >
                  Reveal next line
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    updateSelectedState({
                      revealedTurns: selectedTrack.transcript.length,
                    })
                  }
                >
                  Show full transcript
                </button>
              </div>
              <div className="listening-transcript-list">
                {visibleTranscript.length ? (
                  visibleTranscript.map((turn, index) => (
                    <p key={`${turn.speaker}-${index}`}>
                      <strong>{turn.speaker}:</strong> {turn.text}
                    </p>
                  ))
                ) : (
                  <p>
                    Start the simulation when you are ready. Reveal lines one by
                    one if you want a stricter listening drill.
                  </p>
                )}
              </div>
            </article>

            <div className="field-group">
              <label htmlFor="listening-notes">Listening notes</label>
              <textarea
                id="listening-notes"
                className="writing-textarea listening-note-textarea"
                value={selectedState.notes}
                onChange={(event) =>
                  updateSelectedState({ notes: event.target.value })
                }
                placeholder="Take short notes: names, numbers, locations, contrast words, and corrections."
              />
            </div>

            <div className="reading-question-list">
              {selectedTrack.questions.map((question, index) => (
                <article key={question.id} className="reading-question-card">
                  <div className="history-kicker-row">
                    <span className="surface-kicker">Question {index + 1}</span>
                    <span className="surface-kicker tracker-history-pill">
                      {question.type}
                    </span>
                    <span className="surface-kicker tracker-history-pill tracker-history-pill-accent">
                      {question.skillFocus}
                    </span>
                  </div>
                  <div className="field-group">
                    <label htmlFor={`listening-answer-${question.id}`}>
                      {question.prompt}
                    </label>
                    <select
                      id={`listening-answer-${question.id}`}
                      className="text-input"
                      value={selectedAnswers[question.id] ?? ''}
                      onChange={(event) =>
                        updateAnswer(question.id, event.target.value)
                      }
                    >
                      <option value="">Choose an answer</option>
                      {question.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              ))}
            </div>

            <div className="settings-actions">
              <button
                type="button"
                className="primary-button"
                onClick={scoreSelectedTrack}
                disabled={isScoring}
              >
                {isScoring ? 'Scoring answers...' : 'Score listening answers'}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={resetSelectedTrack}
              >
                Reset track
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
                    <span className="surface-kicker">Listening score report</span>
                    <h3>{score.statusLabel}</h3>
                    <p>{score.summary}</p>
                  </div>
                  <div className="readiness-score-card">
                    <span className="metric-label">Accuracy</span>
                    <strong>{score.accuracy}%</strong>
                  </div>
                </div>

                <div className="reading-score-grid">
                  <div className="summary-box">
                    <span className="metric-label">Correct answers</span>
                    <strong>
                      {score.correctAnswers}/{score.totalQuestions}
                    </strong>
                  </div>
                  <div className="summary-box">
                    <span className="metric-label">Answered</span>
                    <strong>
                      {score.answeredQuestions}/{score.totalQuestions}
                    </strong>
                  </div>
                  <div className="summary-box">
                    <span className="metric-label">Estimated band</span>
                    <strong>{score.estimatedBand.toFixed(1)}</strong>
                  </div>
                </div>

                <div className="reading-score-section">
                  <span className="metric-label">Next actions</span>
                  <ul className="mock-test-action-list">
                    {score.nextActions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </div>

                <div className="reading-question-review-list">
                  {score.questionResults.map((result, index) => (
                    <article
                      key={result.questionId}
                      className={`reading-question-review-card${
                        result.isCorrect ? ' is-correct' : ' is-incorrect'
                      }`}
                    >
                      <span className="surface-kicker">
                        Question {index + 1}: {result.isCorrect ? 'Correct' : 'Replay'}
                      </span>
                      <strong>{result.prompt}</strong>
                      <p>{result.explanation}</p>
                      <span className="hero-badge">
                        Correct answer: {result.correctAnswer}
                      </span>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </section>
        </div>
      ) : (
        <section className="glass writing-panel empty-state-panel">
          <div className="panel-heading">
            <p className="section-label">Listening Practice</p>
            <h2>No listening tracks match this filter</h2>
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
