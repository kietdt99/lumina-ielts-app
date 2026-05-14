'use client'

import Link from 'next/link'
import { useDeferredValue, useEffect, useState } from 'react'
import {
  ChecklistIcon,
  CompassIcon,
  SparklesIcon,
  TimerIcon,
  WritingIcon,
} from '@/app/_components/ui/app-icons'
import {
  filterPracticeSprints,
  listPracticeSprintTopics,
  summarizePracticeSprints,
  type PracticeSprint,
  type PracticeSprintDifficultyFilter,
  type PracticeSprintTaskFilter,
} from '@/lib/ielts/practice-sprint'

type PracticeSprintWorkspaceProps = {
  sprints: PracticeSprint[]
}

type SprintProgressState = Record<string, string[]>

const progressStorageKey = 'lumina-practice-sprint-progress'

const difficultyOptions: PracticeSprintDifficultyFilter[] = [
  'All',
  'Guided',
  'Balanced',
  'Stretch',
]

function writingHref(promptId: string) {
  const params = new URLSearchParams({
    promptId,
    outline: '1',
  })

  return `/writing?${params.toString()}`
}

function completedStagesForSprint(
  progress: SprintProgressState,
  sprintId: string
) {
  return progress[sprintId] ?? []
}

function PracticeSprintCard({
  completedStages,
  onToggleStage,
  sprint,
}: {
  completedStages: string[]
  onToggleStage: (sprintId: string, stageId: string) => void
  sprint: PracticeSprint
}) {
  const completedCount = completedStages.length

  return (
    <article className="activity-card practice-sprint-card">
      <div className="history-kicker-row">
        <span className="surface-kicker">{sprint.taskType}</span>
        <span className="surface-kicker tracker-history-pill">{sprint.topic}</span>
        <span className="surface-kicker tracker-history-pill tracker-history-pill-accent">
          {sprint.difficulty}
        </span>
      </div>

      <div className="activity-card-header">
        <div>
          <span className="prompt-type">Practice sprint</span>
          <h3 className="icon-heading">
            <TimerIcon className="section-icon" />
            <span>{sprint.promptTitle}</span>
          </h3>
        </div>
        <div className="readiness-score-card">
          <span className="metric-label">Done</span>
          <strong>
            {completedCount}/{sprint.stages.length}
          </strong>
        </div>
      </div>

      <p>{sprint.promptBrief}</p>

      <div className="prompt-explorer-meta">
        <span className="hero-badge">{sprint.totalMinutes} minutes</span>
        <span className="hero-badge">{sprint.wordTarget}+ words</span>
        <span className="hero-badge">{sprint.ideaBankTopic}</span>
      </div>

      <div className="practice-sprint-section practice-sprint-plan">
        <span className="metric-label">Sprint plan</span>
        <div className="practice-sprint-stage-list">
          {sprint.stages.map((stage) => {
            const isDone = completedStages.includes(stage.id)

            return (
              <button
                key={stage.id}
                type="button"
                className={`practice-sprint-stage${isDone ? ' is-done' : ''}`}
                aria-pressed={isDone}
                aria-label={`${isDone ? 'Unmark' : 'Mark'} ${stage.label} done`}
                onClick={() => onToggleStage(sprint.id, stage.id)}
              >
                <span className="surface-kicker">{stage.durationMinutes} min</span>
                <strong>{stage.label}</strong>
                <span>{stage.goal}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="model-fragment-two-column">
        <div className="practice-sprint-section">
          <span className="metric-label">Vocabulary warm-up</span>
          <div className="idea-chip-list">
            {sprint.vocabularyCards.slice(0, 4).map((card) => (
              <span key={card.id} className="idea-chip">
                {card.term}
              </span>
            ))}
          </div>
        </div>

        <div className="practice-sprint-section">
          <span className="metric-label">Revision focus</span>
          <ul className="bullet-list compact-list">
            {sprint.revisionFocus.map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="practice-sprint-section">
        <span className="metric-label">Outline thesis frame</span>
        <p>{sprint.thesisFrame}</p>
      </div>

      {sprint.modelFragments[0] ? (
        <blockquote className="practice-sprint-fragment">
          {sprint.modelFragments[0].fragment}
        </blockquote>
      ) : null}

      <div className="settings-actions">
        <Link href={writingHref(sprint.promptId)} className="primary-button">
          Start sprint in Writing
        </Link>
        <Link href="/vocabulary-builder" className="secondary-button">
          Warm up vocabulary
        </Link>
      </div>
    </article>
  )
}

export function PracticeSprintWorkspace({
  sprints,
}: PracticeSprintWorkspaceProps) {
  const [taskType, setTaskType] = useState<PracticeSprintTaskFilter>('All')
  const [difficulty, setDifficulty] =
    useState<PracticeSprintDifficultyFilter>('All')
  const [topic, setTopic] = useState('All topics')
  const [searchValue, setSearchValue] = useState('')
  const [progress, setProgress] = useState<SprintProgressState>({})
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false)
  const deferredSearchValue = useDeferredValue(searchValue)
  const topics = listPracticeSprintTopics(sprints)
  const filteredSprints = filterPracticeSprints({
    sprints,
    query: deferredSearchValue,
    taskType,
    difficulty,
    topic,
  })
  const summary = summarizePracticeSprints(filteredSprints)
  const completedStageCount = filteredSprints.reduce(
    (total, sprint) =>
      total + completedStagesForSprint(progress, sprint.id).length,
    0
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const savedProgress = window.localStorage.getItem(progressStorageKey)
      setProgress(savedProgress ? JSON.parse(savedProgress) : {})
    } catch {
      setProgress({})
    } finally {
      setHasLoadedProgress(true)
    }
  }, [])

  useEffect(() => {
    if (!hasLoadedProgress || typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(progressStorageKey, JSON.stringify(progress))
  }, [hasLoadedProgress, progress])

  function toggleStage(sprintId: string, stageId: string) {
    setProgress((current) => {
      const completedStages = current[sprintId] ?? []
      const nextStages = completedStages.includes(stageId)
        ? completedStages.filter((id) => id !== stageId)
        : [...completedStages, stageId]

      return {
        ...current,
        [sprintId]: nextStages,
      }
    })
  }

  function resetFilters() {
    setSearchValue('')
    setTaskType('All')
    setDifficulty('All')
    setTopic('All topics')
  }

  return (
    <div className="dashboard-stack practice-sprint-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Practice Sprint</p>
          <h1>Start a focused IELTS writing sprint</h1>
          <p>
            Choose a ready-made practice block that bundles a prompt, outline,
            vocabulary warm-up, model fragment, and revision focus.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">{summary.totalSprints} visible sprints</span>
            <span className="hero-badge">{summary.taskTwoSprints} Task 2</span>
            <span className="hero-badge">{summary.taskOneSprints} Task 1</span>
            <span className="hero-badge">{summary.averageMinutes} min average</span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <WritingIcon className="metric-icon" />
            </div>
            <span className="metric-label">Sprint bank</span>
            <strong>{summary.totalSprints}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <ChecklistIcon className="metric-icon" />
            </div>
            <span className="metric-label">Completed stages</span>
            <strong>{completedStageCount}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <SparklesIcon className="metric-icon" />
            </div>
            <span className="metric-label">Stretch</span>
            <strong>{summary.stretchSprints}</strong>
          </div>
        </div>
      </section>

      <section className="glass writing-panel practice-sprint-toolbar">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <CompassIcon className="section-icon" />
              <span>Pick today&apos;s sprint</span>
            </h2>
            <p>
              Start broad, or narrow by task, topic, difficulty, and search
              when you want a specific training target.
            </p>
          </div>
          <Link href="/prompt-explorer" className="inline-link">
            Browse prompts
          </Link>
        </div>

        <div className="practice-sprint-controls">
          <div
            className="task-switcher"
            role="tablist"
            aria-label="Practice sprint task type"
          >
            {(['All', 'Task 1', 'Task 2'] as const).map((task) => (
              <button
                key={task}
                type="button"
                className={`task-chip${taskType === task ? ' is-active' : ''}`}
                onClick={() => setTaskType(task)}
              >
                <span className="task-chip-dot" aria-hidden="true" />
                {task}
              </button>
            ))}
          </div>

          <div className="field-group">
            <label htmlFor="practice-sprint-difficulty">Difficulty</label>
            <select
              id="practice-sprint-difficulty"
              className="text-input"
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value as PracticeSprintDifficultyFilter)
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
            <label htmlFor="practice-sprint-topic">Topic focus</label>
            <select
              id="practice-sprint-topic"
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

          <div className="field-group practice-sprint-search">
            <label htmlFor="practice-sprint-search">Search sprints</label>
            <input
              id="practice-sprint-search"
              className="text-input"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Try automation, overview, transport, vocabulary..."
            />
          </div>
        </div>
      </section>

      {filteredSprints.length ? (
        <section className="practice-sprint-grid" aria-label="Practice sprint bank">
          {filteredSprints.map((sprint) => (
            <PracticeSprintCard
              key={sprint.id}
              sprint={sprint}
              completedStages={completedStagesForSprint(progress, sprint.id)}
              onToggleStage={toggleStage}
            />
          ))}
        </section>
      ) : (
        <section className="glass writing-panel empty-state-panel">
          <div className="panel-heading">
            <p className="section-label">Practice Sprint</p>
            <h2>No practice sprints match this filter</h2>
            <p>
              Clear the search or switch task, topic, or difficulty to browse
              the full sprint bank.
            </p>
          </div>
          <div className="settings-actions">
            <button type="button" className="primary-button" onClick={resetFilters}>
              Reset filters
            </button>
            <Link href="/writing" className="secondary-button">
              Start writing
            </Link>
          </div>
        </section>
      )}

      <section className="glass writing-panel practice-sprint-practice-panel">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <ChecklistIcon className="section-icon" />
              <span>How to use a sprint</span>
            </h2>
            <p>
              Tick each stage as you work. The goal is not to study everything,
              but to carry one focused plan into one finished draft.
            </p>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setProgress({})}
          >
            Reset progress
          </button>
        </div>
        <div className="model-fragment-two-column">
          <div className="model-fragment-section">
            <span className="metric-label">Before writing</span>
            <p>
              Do the warm-up and plan stages first so your draft starts with
              vocabulary and structure already loaded.
            </p>
          </div>
          <div className="model-fragment-section">
            <span className="metric-label">After writing</span>
            <p>
              Use the self-check stage before feedback so the review loop starts
              from your strongest realistic draft.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
