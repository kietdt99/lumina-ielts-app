'use client'

import Link from 'next/link'
import { useDeferredValue, useState } from 'react'
import {
  ChecklistIcon,
  CompassIcon,
  QuillIcon,
  SparklesIcon,
  WritingIcon,
} from '@/app/_components/ui/app-icons'
import {
  filterModelFragments,
  summarizeModelFragments,
  type ModelFragment,
  type ModelFragmentFunctionFilter,
  type ModelFragmentTaskFilter,
} from '@/lib/ielts/model-fragments'

type ModelFragmentsWorkspaceProps = {
  fragments: ModelFragment[]
}

const functionFilters: ModelFragmentFunctionFilter[] = [
  'All',
  'Introduction',
  'Overview',
  'Body development',
  'Detail grouping',
  'Conclusion',
]

function ModelFragmentCard({ fragment }: { fragment: ModelFragment }) {
  return (
    <article className="activity-card model-fragment-card">
      <div className="history-kicker-row">
        <span className="surface-kicker">{fragment.functionType}</span>
        {fragment.taskTypes.map((taskType) => (
          <span key={taskType} className="surface-kicker tracker-history-pill">
            {taskType}
          </span>
        ))}
      </div>
      <div className="activity-card-header">
        <div>
          <span className="prompt-type">{fragment.topic}</span>
          <h3 className="icon-heading">
            <QuillIcon className="section-icon" />
            <span>{fragment.title}</span>
          </h3>
        </div>
      </div>

      <blockquote className="model-fragment-quote">{fragment.fragment}</blockquote>

      <div className="model-fragment-analysis">
        <span className="metric-label">Why it works</span>
        <p>{fragment.whyItWorks}</p>
      </div>

      <div className="model-fragment-two-column">
        <div className="model-fragment-section">
          <span className="metric-label">How to adapt it</span>
          <ul className="bullet-list compact-list">
            {fragment.usageNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
        <div className="model-fragment-section model-fragment-warning">
          <span className="metric-label">Avoid copying</span>
          <p>{fragment.avoidCopying}</p>
        </div>
      </div>

      <div className="idea-chip-list">
        {fragment.tags.map((tag) => (
          <span key={tag} className="idea-chip">
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}

export function ModelFragmentsWorkspace({
  fragments,
}: ModelFragmentsWorkspaceProps) {
  const [taskType, setTaskType] = useState<ModelFragmentTaskFilter>('All')
  const [functionType, setFunctionType] =
    useState<ModelFragmentFunctionFilter>('All')
  const [searchValue, setSearchValue] = useState('')
  const deferredSearchValue = useDeferredValue(searchValue)
  const filteredFragments = filterModelFragments({
    entries: fragments,
    query: deferredSearchValue,
    taskType,
    functionType,
  })
  const summary = summarizeModelFragments(filteredFragments)

  return (
    <div className="dashboard-stack model-fragments-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Model Fragments</p>
          <h1>Study short fragments, not full essays</h1>
          <p>
            Learn reusable IELTS writing moves for introductions, overviews,
            body development, detail grouping, and conclusions without copying a
            complete answer.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">{summary.totalFragments} visible fragments</span>
            <span className="hero-badge">{summary.taskTwoFragments} Task 2</span>
            <span className="hero-badge">{summary.taskOneFragments} Task 1</span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <QuillIcon className="metric-icon" />
            </div>
            <span className="metric-label">Fragments</span>
            <strong>{summary.totalFragments}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <SparklesIcon className="metric-icon" />
            </div>
            <span className="metric-label">Functions</span>
            <strong>{summary.functionTypes}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <WritingIcon className="metric-icon" />
            </div>
            <span className="metric-label">Current lens</span>
            <strong>{taskType}</strong>
          </div>
        </div>
      </section>

      <section className="glass writing-panel model-fragments-toolbar">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <CompassIcon className="section-icon" />
              <span>Find a writing move</span>
            </h2>
            <p>
              Filter by task type, function, or topic. Use the pattern as a
              training scaffold, then rewrite it in your own words.
            </p>
          </div>
          <Link href="/writing" className="inline-link">
            Open writing workspace
          </Link>
        </div>

        <div className="model-fragments-controls">
          <div className="task-switcher" role="tablist" aria-label="Model fragment task type">
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
            <label htmlFor="model-fragment-function">Writing function</label>
            <select
              id="model-fragment-function"
              className="text-input"
              value={functionType}
              onChange={(event) =>
                setFunctionType(event.target.value as ModelFragmentFunctionFilter)
              }
            >
              {functionFilters.map((filter) => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label htmlFor="model-fragment-search">Search fragments</label>
            <input
              id="model-fragment-search"
              className="text-input"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Try overview, education, conclusion..."
            />
          </div>
        </div>
      </section>

      {filteredFragments.length ? (
        <section className="model-fragments-grid" aria-label="Model fragments">
          {filteredFragments.map((fragment) => (
            <ModelFragmentCard key={fragment.id} fragment={fragment} />
          ))}
        </section>
      ) : (
        <section className="glass writing-panel empty-state-panel">
          <div className="panel-heading">
            <p className="section-label">Model Fragments</p>
            <h2>No model fragments match this filter</h2>
            <p>
              Clear the search or switch writing function to browse the current
              library of short IELTS writing moves.
            </p>
          </div>
          <div className="settings-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setTaskType('All')
                setFunctionType('All')
                setSearchValue('')
              }}
            >
              Reset filters
            </button>
            <Link href="/outline-builder" className="secondary-button">
              Build an outline
            </Link>
          </div>
        </section>
      )}

      <section className="glass writing-panel model-fragments-practice-panel">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <ChecklistIcon className="section-icon" />
              <span>Practice rule</span>
            </h2>
            <p>
              Read one fragment, cover it, then write a new sentence for your
              selected prompt using the same function.
            </p>
          </div>
          <Link href="/rubric-guide" className="inline-link">
            Check rubric expectations
          </Link>
        </div>
      </section>
    </div>
  )
}
