'use client'

import Link from 'next/link'
import { useDeferredValue, useState } from 'react'
import {
  ChecklistIcon,
  CompassIcon,
  RibbonIcon,
  TargetIcon,
  WritingIcon,
} from '@/app/_components/ui/app-icons'
import {
  filterMistakeTaxonomy,
  mistakeTaxonomyCriteria,
  summarizeMistakeTaxonomy,
  type MistakeTaxonomyCriterionFilter,
  type MistakeTaxonomyTaskFilter,
  type WritingMistakeTaxonomyItem,
} from '@/lib/ielts/mistake-taxonomy'

type MistakeLibraryWorkspaceProps = {
  items: WritingMistakeTaxonomyItem[]
}

function MistakeLibraryCard({ item }: { item: WritingMistakeTaxonomyItem }) {
  return (
    <article className="activity-card mistake-library-card">
      <div className="history-kicker-row">
        <span className="surface-kicker">{item.criterion}</span>
        {item.applicableTaskTypes.map((taskType) => (
          <span key={taskType} className="surface-kicker tracker-history-pill">
            {taskType}
          </span>
        ))}
      </div>

      <div className="activity-card-header">
        <div>
          <span className="prompt-type">Mistake pattern</span>
          <h3 className="icon-heading">
            <RibbonIcon className="section-icon" />
            <span>{item.label}</span>
          </h3>
        </div>
      </div>

      <p>{item.description}</p>

      <div className="mistake-library-analysis">
        <div className="mistake-library-section">
          <span className="metric-label">Band risk</span>
          <p>{item.bandRisk}</p>
        </div>
        <div className="mistake-library-section">
          <span className="metric-label">Revision hint</span>
          <p>{item.revisionHint}</p>
        </div>
      </div>

      <div className="mistake-library-two-column">
        <div className="mistake-library-section">
          <span className="metric-label">Typical pattern</span>
          <p>{item.examplePattern}</p>
        </div>
        <div className="mistake-library-section mistake-library-drill">
          <span className="metric-label">Practice drill</span>
          <p>{item.practiceDrill}</p>
        </div>
      </div>
    </article>
  )
}

export function MistakeLibraryWorkspace({ items }: MistakeLibraryWorkspaceProps) {
  const [taskType, setTaskType] = useState<MistakeTaxonomyTaskFilter>('All')
  const [criterion, setCriterion] =
    useState<MistakeTaxonomyCriterionFilter>('All')
  const [searchValue, setSearchValue] = useState('')
  const deferredSearchValue = useDeferredValue(searchValue)
  const filteredItems = filterMistakeTaxonomy({
    items,
    query: deferredSearchValue,
    taskType,
    criterion,
  })
  const summary = summarizeMistakeTaxonomy(filteredItems)

  return (
    <div className="dashboard-stack mistake-library-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Mistake Library</p>
          <h1>Learn the mistakes before they steal band points</h1>
          <p>
            Study common IELTS writing weaknesses by rubric criterion, understand
            why each one hurts the score, then rehearse a focused correction
            drill before the next timed draft.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">{summary.totalItems} visible patterns</span>
            <span className="hero-badge">{summary.criteriaCovered} criteria</span>
            <span className="hero-badge">{summary.drills} practice drills</span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <RibbonIcon className="metric-icon" />
            </div>
            <span className="metric-label">Patterns</span>
            <strong>{summary.totalItems}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <WritingIcon className="metric-icon" />
            </div>
            <span className="metric-label">Task 2</span>
            <strong>{summary.taskTwoItems}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TargetIcon className="metric-icon" />
            </div>
            <span className="metric-label">Task 1</span>
            <strong>{summary.taskOneItems}</strong>
          </div>
        </div>
      </section>

      <section className="glass writing-panel mistake-library-toolbar">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <CompassIcon className="section-icon" />
              <span>Find the next weakness to rehearse</span>
            </h2>
            <p>
              Filter by task, rubric criterion, or search for a symptom such as
              overview, vocabulary, linking, or grammar.
            </p>
          </div>
          <Link href="/mistake-journal" className="inline-link">
            Open mistake journal
          </Link>
        </div>

        <div className="mistake-library-controls">
          <div className="task-switcher" role="tablist" aria-label="Mistake library task type">
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
            <label htmlFor="mistake-library-criterion">Rubric criterion</label>
            <select
              id="mistake-library-criterion"
              className="text-input"
              value={criterion}
              onChange={(event) =>
                setCriterion(event.target.value as MistakeTaxonomyCriterionFilter)
              }
            >
              <option value="All">All criteria</option>
              {mistakeTaxonomyCriteria.map((criterionOption) => (
                <option key={criterionOption} value={criterionOption}>
                  {criterionOption}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group mistake-library-search">
            <label htmlFor="mistake-library-search">Search mistake patterns</label>
            <input
              id="mistake-library-search"
              className="text-input"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Try overview, linking, vocabulary, grammar..."
            />
          </div>
        </div>
      </section>

      {filteredItems.length ? (
        <section className="mistake-library-grid" aria-label="Mistake library patterns">
          {filteredItems.map((item) => (
            <MistakeLibraryCard key={item.code} item={item} />
          ))}
        </section>
      ) : (
        <section className="glass writing-panel empty-state-panel">
          <div className="panel-heading">
            <p className="section-label">Mistake Library</p>
            <h2>No mistake patterns match this filter</h2>
            <p>
              Clear the search or switch criterion to browse the full set of
              IELTS writing mistake patterns.
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

      <section className="glass writing-panel mistake-library-practice-panel">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <ChecklistIcon className="section-icon" />
              <span>How to use this library</span>
            </h2>
            <p>
              Pick one pattern before writing, run the drill, then check the
              same weakness in your saved feedback.
            </p>
          </div>
          <Link href="/rubric-guide" className="inline-link">
            Check rubric guide
          </Link>
        </div>
        <div className="model-fragment-two-column">
          <div className="model-fragment-section">
            <span className="metric-label">Before drafting</span>
            <p>
              Choose a single mistake pattern as a guardrail. This keeps practice
              focused instead of trying to fix every weakness at once.
            </p>
          </div>
          <div className="model-fragment-section">
            <span className="metric-label">After feedback</span>
            <p>
              Compare the feedback priorities with this library and move repeated
              issues into your mistake journal and review queue.
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
