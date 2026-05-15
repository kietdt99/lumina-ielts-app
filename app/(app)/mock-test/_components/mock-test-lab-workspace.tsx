'use client'

import Link from 'next/link'
import { useDeferredValue, useEffect, useState } from 'react'
import {
  ChecklistIcon,
  CompassIcon,
  QuillIcon,
  TimerIcon,
  WritingIcon,
} from '@/app/_components/ui/app-icons'
import { readSessionHintFromDocument } from '@/lib/auth/session-hint'
import { getDraftMetrics } from '@/lib/ielts/writing-feedback'
import {
  filterWritingMockTests,
  listWritingMockTestTopics,
  summarizeWritingMockTests,
  type MockTestDifficultyFilter,
  type WritingMockTest,
} from '@/lib/ielts/mock-test-lab'

type MockTestLabWorkspaceProps = {
  tests: WritingMockTest[]
}

type MockTestDraftState = {
  taskOneDraft: string
  taskTwoDraft: string
  completedCheckpoints: string[]
}

type MockTestState = Record<string, MockTestDraftState>

const difficultyOptions: MockTestDifficultyFilter[] = [
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
  return scope ? `lumina-mock-test-lab:${scope}` : 'lumina-mock-test-lab'
}

function readStoredState(): MockTestState {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const rawValue = window.localStorage.getItem(getStorageKey())
    return rawValue ? (JSON.parse(rawValue) as MockTestState) : {}
  } catch {
    return {}
  }
}

function writeStoredState(state: MockTestState) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getStorageKey(), JSON.stringify(state))
}

function writingHref(promptId: string) {
  return `/writing?${new URLSearchParams({ promptId }).toString()}`
}

function emptyDraftState(): MockTestDraftState {
  return {
    taskOneDraft: '',
    taskTwoDraft: '',
    completedCheckpoints: [],
  }
}

function MockTestPickerCard({
  isActive,
  onSelect,
  test,
}: {
  isActive: boolean
  onSelect: () => void
  test: WritingMockTest
}) {
  return (
    <button
      type="button"
      className={`mock-test-picker-card ${isActive ? 'is-active' : ''}`}
      onClick={onSelect}
    >
      <span className="surface-kicker">{test.difficulty}</span>
      <strong>{test.title}</strong>
      <span>{test.topicPair}</span>
    </button>
  )
}

export function MockTestLabWorkspace({ tests }: MockTestLabWorkspaceProps) {
  const [difficulty, setDifficulty] =
    useState<MockTestDifficultyFilter>('All')
  const [topic, setTopic] = useState('All topics')
  const [searchValue, setSearchValue] = useState('')
  const [selectedTestId, setSelectedTestId] = useState(tests[0]?.id ?? '')
  const [mockState, setMockState] = useState<MockTestState>(() => readStoredState())
  const [remainingSeconds, setRemainingSeconds] = useState(60 * 60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const deferredSearchValue = useDeferredValue(searchValue)
  const topics = listWritingMockTestTopics(tests)
  const filteredTests = filterWritingMockTests({
    tests,
    query: deferredSearchValue,
    difficulty,
    topic,
  })
  const summary = summarizeWritingMockTests(filteredTests)
  const selectedTest =
    filteredTests.find((test) => test.id === selectedTestId) ??
    filteredTests[0] ??
    tests[0] ??
    null
  const selectedState = selectedTest
    ? mockState[selectedTest.id] ?? emptyDraftState()
    : emptyDraftState()
  const taskOneMetrics = getDraftMetrics(selectedState.taskOneDraft)
  const taskTwoMetrics = getDraftMetrics(selectedState.taskTwoDraft)
  const completedCheckpointCount = selectedState.completedCheckpoints.length
  const totalWordCount = taskOneMetrics.wordCount + taskTwoMetrics.wordCount
  const isTaskOneReady = selectedTest
    ? taskOneMetrics.wordCount >= selectedTest.taskOnePrompt.minimumWords
    : false
  const isTaskTwoReady = selectedTest
    ? taskTwoMetrics.wordCount >= selectedTest.taskTwoPrompt.minimumWords
    : false
  const isMockReady = isTaskOneReady && isTaskTwoReady

  useEffect(() => {
    writeStoredState(mockState)
  }, [mockState])

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

  function updateSelectedState(nextState: Partial<MockTestDraftState>) {
    if (!selectedTest) {
      return
    }

    setMockState((currentState) => ({
      ...currentState,
      [selectedTest.id]: {
        ...(currentState[selectedTest.id] ?? emptyDraftState()),
        ...nextState,
      },
    }))
  }

  function toggleCheckpoint(checkpointId: string) {
    const completedCheckpoints = selectedState.completedCheckpoints.includes(
      checkpointId
    )
      ? selectedState.completedCheckpoints.filter((id) => id !== checkpointId)
      : [...selectedState.completedCheckpoints, checkpointId]

    updateSelectedState({ completedCheckpoints })
  }

  function resetFilters() {
    setDifficulty('All')
    setTopic('All topics')
    setSearchValue('')
  }

  function resetSelectedTest() {
    if (!selectedTest) {
      return
    }

    setMockState((currentState) => ({
      ...currentState,
      [selectedTest.id]: emptyDraftState(),
    }))
    setRemainingSeconds(60 * 60)
    setIsTimerRunning(false)
  }

  return (
    <div className="dashboard-stack mock-test-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Mock Test Lab</p>
          <h1>Complete a full IELTS Writing mock test</h1>
          <p>
            Pair Task 1 and Task 2, run a 60-minute exam simulation, and keep
            both drafts in one focused workspace before asking for feedback.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">{summary.totalTests} visible tests</span>
            <span className="hero-badge">{summary.averageMinutes || 60} min format</span>
            <span className="hero-badge">{summary.topics} topic pairs</span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TimerIcon className="metric-icon" />
            </div>
            <span className="metric-label">Mock timer</span>
            <strong>{formatTime(remainingSeconds)}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <QuillIcon className="metric-icon" />
            </div>
            <span className="metric-label">Words written</span>
            <strong>{totalWordCount}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <ChecklistIcon className="metric-icon" />
            </div>
            <span className="metric-label">Checkpoints</span>
            <strong>{completedCheckpointCount}/5</strong>
          </div>
        </div>
      </section>

      <section className="glass writing-panel mock-test-toolbar">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <CompassIcon className="section-icon" />
              <span>Choose a mock test pair</span>
            </h2>
            <p>Filter by difficulty, topic pair, or prompt text.</p>
          </div>
          <Link href="/practice-sprint" className="inline-link">
            Need a shorter sprint?
          </Link>
        </div>

        <div className="mock-test-controls">
          <div className="field-group">
            <label htmlFor="mock-test-difficulty">Difficulty</label>
            <select
              id="mock-test-difficulty"
              className="text-input"
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value as MockTestDifficultyFilter)
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
            <label htmlFor="mock-test-topic">Topic pair</label>
            <select
              id="mock-test-topic"
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

          <div className="field-group mock-test-search">
            <label htmlFor="mock-test-search">Search mock tests</label>
            <input
              id="mock-test-search"
              className="text-input"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Try environment, transport, education..."
            />
          </div>

          <button type="button" className="secondary-button" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
      </section>

      {filteredTests.length && selectedTest ? (
        <div className="mock-test-layout">
          <aside className="glass writing-panel mock-test-picker">
            <div className="panel-heading">
              <span className="surface-kicker">Mock test bank</span>
              <h2>{filteredTests.length} matching pairs</h2>
            </div>
            <div className="mock-test-picker-list">
              {filteredTests.map((test) => (
                <MockTestPickerCard
                  key={test.id}
                  test={test}
                  isActive={test.id === selectedTest.id}
                  onSelect={() => setSelectedTestId(test.id)}
                />
              ))}
            </div>
          </aside>

          <section className="glass writing-panel mock-test-workspace">
            <div className="dashboard-section-header">
              <div className="panel-heading">
                <p className="section-label">60-minute simulation</p>
                <h2 className="icon-heading">
                  <WritingIcon className="section-icon" />
                  <span>{selectedTest.title}</span>
                </h2>
                <p>{selectedTest.topicPair}</p>
              </div>
              <div className="toolbar-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsTimerRunning((current) => !current)}
                >
                  {isTimerRunning ? 'Pause mock timer' : 'Start mock timer'}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setRemainingSeconds(60 * 60)
                    setIsTimerRunning(false)
                  }}
                >
                  Reset timer
                </button>
              </div>
            </div>

            <div className="mock-test-draft-grid">
              <article className="mock-test-draft-panel">
                <div className="history-kicker-row">
                  <span className="surface-kicker">Task 1</span>
                  <span className="surface-kicker tracker-history-pill">
                    {selectedTest.taskOnePrompt.minimumWords}+ words
                  </span>
                </div>
                <h3>{selectedTest.taskOnePrompt.title}</h3>
                <p>{selectedTest.taskOnePrompt.brief}</p>
                <textarea
                  id="mock-task-1-draft"
                  className="writing-textarea mock-test-textarea"
                  value={selectedState.taskOneDraft}
                  onChange={(event) =>
                    updateSelectedState({ taskOneDraft: event.target.value })
                  }
                  aria-label="Task 1 draft"
                  placeholder="Write your Task 1 response here."
                />
                <div className="hero-badge-row">
                  <span className="hero-badge">{taskOneMetrics.wordCount} words</span>
                  <span className="hero-badge">
                    {isTaskOneReady ? 'Target met' : 'Target not met'}
                  </span>
                </div>
                <Link
                  href={writingHref(selectedTest.taskOnePrompt.id)}
                  className="inline-link"
                >
                  Open Task 1 in Writing
                </Link>
              </article>

              <article className="mock-test-draft-panel">
                <div className="history-kicker-row">
                  <span className="surface-kicker">Task 2</span>
                  <span className="surface-kicker tracker-history-pill">
                    {selectedTest.taskTwoPrompt.minimumWords}+ words
                  </span>
                </div>
                <h3>{selectedTest.taskTwoPrompt.title}</h3>
                <p>{selectedTest.taskTwoPrompt.brief}</p>
                <textarea
                  id="mock-task-2-draft"
                  className="writing-textarea mock-test-textarea"
                  value={selectedState.taskTwoDraft}
                  onChange={(event) =>
                    updateSelectedState({ taskTwoDraft: event.target.value })
                  }
                  aria-label="Task 2 draft"
                  placeholder="Write your Task 2 essay here."
                />
                <div className="hero-badge-row">
                  <span className="hero-badge">{taskTwoMetrics.wordCount} words</span>
                  <span className="hero-badge">
                    {isTaskTwoReady ? 'Target met' : 'Target not met'}
                  </span>
                </div>
                <Link
                  href={writingHref(selectedTest.taskTwoPrompt.id)}
                  className="inline-link"
                >
                  Open Task 2 in Writing
                </Link>
              </article>
            </div>

            <div className="mock-test-support-grid">
              <section className="mock-test-section">
                <span className="metric-label">Exam checkpoints</span>
                <div className="mock-test-checkpoint-list">
                  {selectedTest.checkpoints.map((checkpoint) => {
                    const isDone = selectedState.completedCheckpoints.includes(
                      checkpoint.id
                    )

                    return (
                      <button
                        key={checkpoint.id}
                        type="button"
                        className={`mock-test-checkpoint${isDone ? ' is-done' : ''}`}
                        aria-pressed={isDone}
                        aria-label={`${isDone ? 'Unmark' : 'Mark'} ${checkpoint.label} done`}
                        onClick={() => toggleCheckpoint(checkpoint.id)}
                      >
                        <span className="surface-kicker">
                          Minute {checkpoint.minuteMark}
                        </span>
                        <strong>{checkpoint.label}</strong>
                        <span>{checkpoint.goal}</span>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="mock-test-section">
                <span className="metric-label">Mock readiness</span>
                <div className="mock-test-readiness-list">
                  {selectedTest.readinessChecklist.map((item) => (
                    <article key={item} className="mock-test-readiness-card">
                      <ChecklistIcon className="section-icon" />
                      <span>{item}</span>
                    </article>
                  ))}
                </div>
                <div className="writing-helper-strip">
                  <span className="surface-kicker">
                    {isMockReady ? 'Ready for feedback' : 'Keep writing'}
                  </span>
                  <p>
                    {isMockReady
                      ? 'Both tasks have reached their word targets. Review accuracy, then submit each task in Writing for feedback.'
                      : 'Reach both word targets before treating this as a complete mock test.'}
                  </p>
                </div>
                <div className="settings-actions">
                  <Link href="/revision-studio" className="primary-button">
                    Review saved feedback
                  </Link>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={resetSelectedTest}
                  >
                    Reset this mock
                  </button>
                </div>
              </section>
            </div>
          </section>
        </div>
      ) : (
        <section className="glass writing-panel empty-state-panel">
          <div className="panel-heading">
            <p className="section-label">Mock Test Lab</p>
            <h2>No mock tests match this filter</h2>
            <p>Clear filters or search a broader topic to return to the mock test bank.</p>
          </div>
          <div className="settings-actions">
            <button type="button" className="primary-button" onClick={resetFilters}>
              Reset filters
            </button>
            <Link href="/practice-sprint" className="secondary-button">
              Try a shorter sprint
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
