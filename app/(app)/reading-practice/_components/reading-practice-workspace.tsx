'use client'

import { useDeferredValue, useEffect, useState, useSyncExternalStore } from 'react'
import { PracticeAttemptHistoryPanel } from '@/app/(app)/_components/practice-attempt-history-panel'
import {
  ChecklistIcon,
  CompassIcon,
  SparklesIcon,
  TimerIcon,
  WritingIcon,
} from '@/app/_components/ui/app-icons'
import { readSessionHintFromDocument } from '@/lib/auth/session-hint'
import {
  filterReadingPracticePassages,
  listReadingPracticeTopics,
  summarizeReadingPracticePassages,
  type PublicReadingPracticePassage,
  type ReadingPracticeAnswerMap,
  type ReadingPracticeDifficultyFilter,
  type ReadingPracticeScore,
} from '@/lib/ielts/reading-practice'
import {
  createReadingPracticeAttemptHistoryEntry,
  getPracticeAttemptHistorySnapshot,
  getServerPracticeAttemptHistorySnapshot,
  savePracticeAttemptHistoryEntry,
  subscribeToPracticeAttemptHistory,
} from '@/lib/ielts/practice-attempt-history'

type ReadingPracticeWorkspaceProps = {
  passages: PublicReadingPracticePassage[]
}

type ReadingAnswerState = Record<string, ReadingPracticeAnswerMap>

const difficultyOptions: ReadingPracticeDifficultyFilter[] = [
  'All',
  'Guided',
  'Balanced',
  'Stretch',
]

function getStorageKey() {
  const scope = readSessionHintFromDocument()
  return scope
    ? `lumina-reading-practice-answers:${scope}`
    : 'lumina-reading-practice-answers'
}

function readStoredAnswers(): ReadingAnswerState {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const rawValue = window.localStorage.getItem(getStorageKey())
    return rawValue ? (JSON.parse(rawValue) as ReadingAnswerState) : {}
  } catch {
    return {}
  }
}

function writeStoredAnswers(state: ReadingAnswerState) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getStorageKey(), JSON.stringify(state))
}

function emptyAnswersForPassage(passage: PublicReadingPracticePassage) {
  return Object.fromEntries(
    passage.questions.map((question) => [question.id, ''])
  ) as ReadingPracticeAnswerMap
}

function ReadingPassagePickerCard({
  isActive,
  onSelect,
  passage,
}: {
  isActive: boolean
  onSelect: () => void
  passage: PublicReadingPracticePassage
}) {
  return (
    <button
      type="button"
      className={`reading-practice-picker-card ${isActive ? 'is-active' : ''}`}
      onClick={onSelect}
    >
      <span className="surface-kicker">{passage.difficulty}</span>
      <strong>{passage.title}</strong>
      <span>{passage.topic}</span>
      <span>{passage.estimatedMinutes} minutes</span>
    </button>
  )
}

export function ReadingPracticeWorkspace({
  passages,
}: ReadingPracticeWorkspaceProps) {
  const [difficulty, setDifficulty] =
    useState<ReadingPracticeDifficultyFilter>('All')
  const [topic, setTopic] = useState('All topics')
  const [searchValue, setSearchValue] = useState('')
  const [selectedPassageId, setSelectedPassageId] = useState(
    passages[0]?.id ?? ''
  )
  const [answers, setAnswers] = useState<ReadingAnswerState>(() =>
    readStoredAnswers()
  )
  const [score, setScore] = useState<ReadingPracticeScore | null>(null)
  const [isScoring, setIsScoring] = useState(false)
  const [scoreError, setScoreError] = useState<string | null>(null)
  const deferredSearchValue = useDeferredValue(searchValue)
  const topics = listReadingPracticeTopics(passages)
  const filteredPassages = filterReadingPracticePassages({
    passages,
    query: deferredSearchValue,
    difficulty,
    topic,
  })
  const summary = summarizeReadingPracticePassages(filteredPassages)
  const selectedPassage =
    filteredPassages.find((passage) => passage.id === selectedPassageId) ??
    filteredPassages[0] ??
    passages[0] ??
    null
  const selectedAnswers = selectedPassage
    ? answers[selectedPassage.id] ?? emptyAnswersForPassage(selectedPassage)
    : {}
  const answeredCount = Object.values(selectedAnswers).filter(Boolean).length
  const recentReadingAttempts = useSyncExternalStore(
    subscribeToPracticeAttemptHistory,
    getPracticeAttemptHistorySnapshot,
    getServerPracticeAttemptHistorySnapshot
  ).filter((attempt) => attempt.skill === 'Reading')

  useEffect(() => {
    writeStoredAnswers(answers)
  }, [answers])

  function updateAnswer(questionId: string, value: string) {
    if (!selectedPassage) {
      return
    }

    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [selectedPassage.id]: {
        ...(currentAnswers[selectedPassage.id] ??
          emptyAnswersForPassage(selectedPassage)),
        [questionId]: value,
      },
    }))
    setScore(null)
    setScoreError(null)
  }

  function resetFilters() {
    setDifficulty('All')
    setTopic('All topics')
    setSearchValue('')
  }

  function resetSelectedPassage() {
    if (!selectedPassage) {
      return
    }

    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [selectedPassage.id]: emptyAnswersForPassage(selectedPassage),
    }))
    setScore(null)
    setScoreError(null)
  }

  async function scoreSelectedPassage() {
    if (!selectedPassage) {
      return
    }

    setIsScoring(true)
    setScoreError(null)

    try {
      const response = await fetch('/api/reading-practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passageId: selectedPassage.id,
          answers: selectedAnswers,
        }),
      })
      const payload = (await response.json()) as
        | { ok: true; score: ReadingPracticeScore }
        | { ok: false; error: string }

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.ok ? 'Unable to score this reading attempt.' : payload.error
        )
      }

      setScore(payload.score)
      savePracticeAttemptHistoryEntry(
        createReadingPracticeAttemptHistoryEntry(payload.score)
      )
    } catch (error) {
      setScoreError(
        error instanceof Error
          ? error.message
          : 'Unable to score this reading attempt.'
      )
    } finally {
      setIsScoring(false)
    }
  }

  return (
    <div className="dashboard-stack reading-practice-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Reading Practice</p>
          <h1>Train IELTS Reading with instant explanations</h1>
          <p>
            Pick a short passage, answer IELTS-style questions, then review the
            evidence and question skills you need to tighten before timing
            yourself.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">{summary.totalPassages} visible passages</span>
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
            <span className="metric-label">Passage time</span>
            <strong>{selectedPassage?.estimatedMinutes ?? 0} min</strong>
          </div>
        </div>
      </section>

      <PracticeAttemptHistoryPanel
        attempts={recentReadingAttempts}
        skill="Reading"
      />

      <section className="glass writing-panel reading-practice-toolbar">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <SparklesIcon className="section-icon" />
              <span>Choose a reading passage</span>
            </h2>
            <p>
              Filter by topic, difficulty, or keyword when you want a targeted
              reading drill.
            </p>
          </div>
        </div>

        <div className="reading-practice-controls">
          <div className="field-group">
            <label htmlFor="reading-practice-difficulty">Difficulty</label>
            <select
              id="reading-practice-difficulty"
              className="text-input"
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value as ReadingPracticeDifficultyFilter)
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
            <label htmlFor="reading-practice-topic">Topic focus</label>
            <select
              id="reading-practice-topic"
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

          <div className="field-group reading-practice-search">
            <label htmlFor="reading-practice-search">Search passages</label>
            <input
              id="reading-practice-search"
              className="text-input"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Try heat, credentials, transport..."
            />
          </div>

          <button type="button" className="secondary-button" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
      </section>

      {filteredPassages.length && selectedPassage ? (
        <div className="reading-practice-layout">
          <aside className="glass writing-panel reading-practice-picker">
            <div className="panel-heading">
              <span className="surface-kicker">Passage bank</span>
              <h2>{filteredPassages.length} matching passages</h2>
            </div>
            <div className="reading-practice-picker-list">
              {filteredPassages.map((passage) => (
                <ReadingPassagePickerCard
                  key={passage.id}
                  passage={passage}
                  isActive={passage.id === selectedPassage.id}
                  onSelect={() => {
                    setSelectedPassageId(passage.id)
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
                <p className="section-label">Timed reading drill</p>
                <h2 className="icon-heading">
                  <WritingIcon className="section-icon" />
                  <span>{selectedPassage.title}</span>
                </h2>
                <p>{selectedPassage.summary}</p>
              </div>
              <div className="readiness-score-card">
                <span className="metric-label">Questions</span>
                <strong>{selectedPassage.questions.length}</strong>
              </div>
            </div>

            <article className="reading-passage-card">
              <div className="history-kicker-row">
                <span className="surface-kicker">{selectedPassage.topic}</span>
                <span className="surface-kicker tracker-history-pill">
                  {selectedPassage.difficulty}
                </span>
                <span className="surface-kicker tracker-history-pill">
                  {selectedPassage.wordCount} words
                </span>
              </div>
              {selectedPassage.passage.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>

            <div className="reading-question-list">
              {selectedPassage.questions.map((question, index) => (
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
                    <label htmlFor={`reading-answer-${question.id}`}>
                      {question.prompt}
                    </label>
                    <select
                      id={`reading-answer-${question.id}`}
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
                onClick={scoreSelectedPassage}
                disabled={isScoring}
              >
                {isScoring ? 'Scoring answers...' : 'Score reading answers'}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={resetSelectedPassage}
              >
                Reset passage
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
                    <span className="surface-kicker">Reading score report</span>
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
                        Question {index + 1}: {result.isCorrect ? 'Correct' : 'Review'}
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
            <p className="section-label">Reading Practice</p>
            <h2>No reading passages match this filter</h2>
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
