'use client'

import Link from 'next/link'
import { useDeferredValue, useState } from 'react'
import {
  ChecklistIcon,
  CompassIcon,
  QuillIcon,
  SparklesIcon,
  TimerIcon,
  WritingIcon,
} from '@/app/_components/ui/app-icons'
import {
  filterWritingPrompts,
  listWritingPromptTopics,
  summarizeWritingPrompts,
  type WritingPrompt,
  type WritingPromptDifficultyFilter,
  type WritingPromptTaskFilter,
} from '@/lib/ielts/writing-prompts'

type PromptExplorerWorkspaceProps = {
  prompts: WritingPrompt[]
  storageMode: 'library' | 'supabase'
}

const difficultyOptions: WritingPromptDifficultyFilter[] = [
  'All',
  'Guided',
  'Balanced',
  'Stretch',
]

function writingHref(promptId: string, withOutline = false) {
  const params = new URLSearchParams({ promptId })

  if (withOutline) {
    params.set('outline', '1')
  }

  return `/writing?${params.toString()}`
}

function PromptCard({ prompt }: { prompt: WritingPrompt }) {
  return (
    <article className="activity-card prompt-explorer-card">
      <div className="history-kicker-row">
        <span className="surface-kicker">{prompt.taskType}</span>
        <span className="surface-kicker tracker-history-pill">{prompt.topic}</span>
        <span className="surface-kicker tracker-history-pill tracker-history-pill-accent">
          {prompt.difficulty}
        </span>
      </div>

      <div className="activity-card-header">
        <div>
          <span className="prompt-type">Writing prompt</span>
          <h3 className="icon-heading">
            <QuillIcon className="section-icon" />
            <span>{prompt.title}</span>
          </h3>
        </div>
      </div>

      <p>{prompt.brief}</p>

      <div className="prompt-explorer-meta">
        <span className="hero-badge">{prompt.durationMinutes} minutes</span>
        <span className="hero-badge">{prompt.minimumWords}+ words</span>
      </div>

      <div className="prompt-explorer-section">
        <span className="metric-label">Planning checklist</span>
        <ul className="bullet-list compact-list">
          {prompt.planningChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="settings-actions">
        <Link href={writingHref(prompt.id)} className="primary-button">
          Start timed draft
        </Link>
        <Link href={writingHref(prompt.id, true)} className="secondary-button">
          Start with outline
        </Link>
      </div>
    </article>
  )
}

export function PromptExplorerWorkspace({
  prompts,
  storageMode,
}: PromptExplorerWorkspaceProps) {
  const [taskType, setTaskType] = useState<WritingPromptTaskFilter>('All')
  const [difficulty, setDifficulty] = useState<WritingPromptDifficultyFilter>('All')
  const [topic, setTopic] = useState('All topics')
  const [searchValue, setSearchValue] = useState('')
  const deferredSearchValue = useDeferredValue(searchValue)
  const topics = listWritingPromptTopics(prompts)
  const filteredPrompts = filterWritingPrompts({
    prompts,
    query: deferredSearchValue,
    taskType,
    difficulty,
    topic,
  })
  const summary = summarizeWritingPrompts(filteredPrompts)

  return (
    <div className="dashboard-stack prompt-explorer-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Prompt Explorer</p>
          <h1>Choose the right IELTS prompt before the timer starts</h1>
          <p>
            Browse the owned writing prompt bank by task, topic, and difficulty,
            then open the exact prompt in Writing with or without an outline.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">{summary.totalPrompts} visible prompts</span>
            <span className="hero-badge">{summary.taskTwoPrompts} Task 2</span>
            <span className="hero-badge">{summary.taskOnePrompts} Task 1</span>
            <span className="hero-badge">{summary.topics} topics</span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <WritingIcon className="metric-icon" />
            </div>
            <span className="metric-label">Prompt bank</span>
            <strong>{summary.totalPrompts}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TimerIcon className="metric-icon" />
            </div>
            <span className="metric-label">Guided</span>
            <strong>{summary.guidedPrompts}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <SparklesIcon className="metric-icon" />
            </div>
            <span className="metric-label">Source</span>
            <strong>{storageMode}</strong>
          </div>
        </div>
      </section>

      <section className="glass writing-panel prompt-explorer-toolbar">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <CompassIcon className="section-icon" />
              <span>Find a practice target</span>
            </h2>
            <p>
              Start broad, then narrow by difficulty or topic when you want a
              specific kind of writing session.
            </p>
          </div>
          <Link href="/writing" className="inline-link">
            Open writing workspace
          </Link>
        </div>

        <div className="prompt-explorer-controls">
          <div className="task-switcher" role="tablist" aria-label="Prompt explorer task type">
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
            <label htmlFor="prompt-explorer-difficulty">Difficulty</label>
            <select
              id="prompt-explorer-difficulty"
              className="text-input"
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value as WritingPromptDifficultyFilter)
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
            <label htmlFor="prompt-explorer-topic">Topic</label>
            <select
              id="prompt-explorer-topic"
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

          <div className="field-group prompt-explorer-search">
            <label htmlFor="prompt-explorer-search">Search prompts</label>
            <input
              id="prompt-explorer-search"
              className="text-input"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Try transport, overview, advertising, automation..."
            />
          </div>
        </div>
      </section>

      {filteredPrompts.length ? (
        <section className="prompt-explorer-grid" aria-label="Writing prompt bank">
          {filteredPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </section>
      ) : (
        <section className="glass writing-panel empty-state-panel">
          <div className="panel-heading">
            <p className="section-label">Prompt Explorer</p>
            <h2>No prompts match this filter</h2>
            <p>
              Clear the search or switch task, topic, or difficulty to browse
              the full writing prompt bank.
            </p>
          </div>
          <div className="settings-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setSearchValue('')
                setTaskType('All')
                setDifficulty('All')
                setTopic('All topics')
              }}
            >
              Reset filters
            </button>
            <Link href="/writing" className="secondary-button">
              Start writing
            </Link>
          </div>
        </section>
      )}

      <section className="glass writing-panel prompt-explorer-practice-panel">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <ChecklistIcon className="section-icon" />
              <span>How to choose today&apos;s prompt</span>
            </h2>
            <p>
              Pick a Guided prompt when you are learning a pattern, Balanced for
              normal practice, and Stretch when you want exam-pressure variety.
            </p>
          </div>
          <Link href="/study-plan" className="inline-link">
            Check study plan
          </Link>
        </div>
        <div className="model-fragment-two-column">
          <div className="model-fragment-section">
            <span className="metric-label">Before drafting</span>
            <p>
              Open the prompt with an outline when the topic is new or the task
              type feels rusty.
            </p>
          </div>
          <div className="model-fragment-section">
            <span className="metric-label">After feedback</span>
            <p>
              Repeat the same topic later with a different prompt to check
              whether the weakness has improved.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
