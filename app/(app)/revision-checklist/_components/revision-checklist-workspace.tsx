'use client'

import Link from 'next/link'
import { useDeferredValue, useState } from 'react'
import {
  ChecklistIcon,
  CompassIcon,
  SparklesIcon,
  TargetIcon,
  WritingIcon,
} from '@/app/_components/ui/app-icons'
import {
  filterRevisionChecklistItems,
  revisionChecklistCriteria,
  revisionChecklistPriorities,
  summarizeRevisionChecklist,
  type RevisionChecklistCriterionFilter,
  type RevisionChecklistItem,
  type RevisionChecklistPriorityFilter,
  type RevisionChecklistTaskFilter,
} from '@/lib/ielts/revision-checklist'

type RevisionChecklistWorkspaceProps = {
  items: RevisionChecklistItem[]
}

function priorityClass(priority: RevisionChecklistItem['priorityLevel']) {
  return `revision-library-card priority-${priority.toLowerCase()}`
}

function RevisionChecklistCard({ item }: { item: RevisionChecklistItem }) {
  return (
    <article className={`activity-card ${priorityClass(item.priorityLevel)}`}>
      <div className="history-kicker-row">
        <span className="surface-kicker">{item.priorityLevel} priority</span>
        <span className="surface-kicker tracker-history-pill">{item.criterion}</span>
        {item.taskTypes.map((taskType) => (
          <span key={taskType} className="surface-kicker tracker-history-pill">
            {taskType}
          </span>
        ))}
      </div>

      <div className="activity-card-header">
        <div>
          <span className="prompt-type">Revision checklist</span>
          <h3 className="icon-heading">
            <ChecklistIcon className="section-icon" />
            <span>{item.title}</span>
          </h3>
        </div>
      </div>

      <div className="revision-library-section">
        <span className="metric-label">Action</span>
        <p>{item.instruction}</p>
      </div>

      <div className="revision-library-section revision-library-success">
        <span className="metric-label">Success signal</span>
        <p>{item.successSignal}</p>
      </div>
    </article>
  )
}

export function RevisionChecklistWorkspace({
  items,
}: RevisionChecklistWorkspaceProps) {
  const [taskType, setTaskType] = useState<RevisionChecklistTaskFilter>('All')
  const [criterion, setCriterion] =
    useState<RevisionChecklistCriterionFilter>('All')
  const [priorityLevel, setPriorityLevel] =
    useState<RevisionChecklistPriorityFilter>('All')
  const [searchValue, setSearchValue] = useState('')
  const deferredSearchValue = useDeferredValue(searchValue)
  const filteredItems = filterRevisionChecklistItems({
    items,
    query: deferredSearchValue,
    taskType,
    criterion,
    priorityLevel,
  })
  const summary = summarizeRevisionChecklist(filteredItems)

  return (
    <div className="dashboard-stack revision-library-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Revision Checklist</p>
          <h1>Turn feedback into a focused rewrite checklist</h1>
          <p>
            Browse practical IELTS writing revision moves by task, criterion,
            and priority so each rewrite has one clear action and one visible
            success signal.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">{summary.totalItems} visible checks</span>
            <span className="hero-badge">{summary.highPriorityItems} high priority</span>
            <span className="hero-badge">{summary.taskTwoItems} Task 2 checks</span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <ChecklistIcon className="metric-icon" />
            </div>
            <span className="metric-label">Checks</span>
            <strong>{summary.totalItems}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TargetIcon className="metric-icon" />
            </div>
            <span className="metric-label">High priority</span>
            <strong>{summary.highPriorityItems}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <WritingIcon className="metric-icon" />
            </div>
            <span className="metric-label">Task 1</span>
            <strong>{summary.taskOneItems}</strong>
          </div>
        </div>
      </section>

      <section className="glass writing-panel revision-library-toolbar">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <CompassIcon className="section-icon" />
              <span>Find a rewrite move</span>
            </h2>
            <p>
              Filter for the exact revision action you want before opening the
              writing workspace or review queue.
            </p>
          </div>
          <Link href="/review-queue" className="inline-link">
            Open review queue
          </Link>
        </div>

        <div className="revision-library-controls">
          <div className="task-switcher" role="tablist" aria-label="Revision checklist task type">
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
            <label htmlFor="revision-library-criterion">Rubric criterion</label>
            <select
              id="revision-library-criterion"
              className="text-input"
              value={criterion}
              onChange={(event) =>
                setCriterion(event.target.value as RevisionChecklistCriterionFilter)
              }
            >
              <option value="All">All criteria</option>
              {revisionChecklistCriteria.map((criterionOption) => (
                <option key={criterionOption} value={criterionOption}>
                  {criterionOption}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="revision-library-priority">Priority</label>
            <select
              id="revision-library-priority"
              className="text-input"
              value={priorityLevel}
              onChange={(event) =>
                setPriorityLevel(event.target.value as RevisionChecklistPriorityFilter)
              }
            >
              <option value="All">All priorities</option>
              {revisionChecklistPriorities.map((priorityOption) => (
                <option key={priorityOption} value={priorityOption}>
                  {priorityOption}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group revision-library-search">
            <label htmlFor="revision-library-search">Search checklist actions</label>
            <input
              id="revision-library-search"
              className="text-input"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Try overview, thesis, support, vocabulary..."
            />
          </div>
        </div>
      </section>

      {filteredItems.length ? (
        <section className="revision-library-grid" aria-label="Revision checklist actions">
          {filteredItems.map((item) => (
            <RevisionChecklistCard key={item.id} item={item} />
          ))}
        </section>
      ) : (
        <section className="glass writing-panel empty-state-panel">
          <div className="panel-heading">
            <p className="section-label">Revision Checklist</p>
            <h2>No checklist actions match this filter</h2>
            <p>
              Clear the search or switch task, criterion, or priority to browse
              the full revision checklist library.
            </p>
          </div>
          <div className="settings-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setSearchValue('')
                setTaskType('All')
                setCriterion('All')
                setPriorityLevel('All')
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

      <section className="glass writing-panel revision-library-practice-panel">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <SparklesIcon className="section-icon" />
              <span>Use one checklist at a time</span>
            </h2>
            <p>
              Pick one card, apply it to a paragraph, then compare the result
              against the success signal before asking for fresh feedback.
            </p>
          </div>
          <Link href="/mistake-library" className="inline-link">
            Browse mistake library
          </Link>
        </div>
        <div className="model-fragment-two-column">
          <div className="model-fragment-section">
            <span className="metric-label">Before writing</span>
            <p>
              Use the high-priority cards as a pre-submit guardrail for the task
              type you are practicing.
            </p>
          </div>
          <div className="model-fragment-section">
            <span className="metric-label">After feedback</span>
            <p>
              Match feedback priorities to checklist cards and rewrite only the
              weakest section first.
            </p>
          </div>
        </div>
        <Link href="/writing" className="primary-button">
          Open writing workspace
        </Link>
      </section>
    </div>
  )
}
