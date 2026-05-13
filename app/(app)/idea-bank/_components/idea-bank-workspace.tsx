'use client'

import Link from 'next/link'
import { useDeferredValue, useState } from 'react'
import {
  CompassIcon,
  QuillIcon,
  SparklesIcon,
  WritingIcon,
} from '@/app/_components/ui/app-icons'
import {
  filterIdeaBankEntries,
  summarizeIdeaBank,
  type IdeaBankEntry,
  type IdeaBankTaskFilter,
} from '@/lib/ielts/idea-bank'

type IdeaBankWorkspaceProps = {
  entries: IdeaBankEntry[]
}

function IdeaBankEntryCard({ entry }: { entry: IdeaBankEntry }) {
  return (
    <article className="activity-card idea-bank-card">
      <div className="history-kicker-row">
        <span className="surface-kicker">{entry.topic}</span>
        {entry.taskTypes.map((taskType) => (
          <span key={taskType} className="surface-kicker tracker-history-pill">
            {taskType}
          </span>
        ))}
      </div>
      <div className="activity-card-header">
        <div>
          <span className="prompt-type">Topic bank</span>
          <h3 className="icon-heading">
            <SparklesIcon className="section-icon" />
            <span>{entry.topic}</span>
          </h3>
        </div>
      </div>
      <p>{entry.description}</p>

      <div className="idea-bank-section">
        <span className="metric-label">Common questions</span>
        <ul className="bullet-list compact-list">
          {entry.commonQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
      </div>

      <div className="idea-bank-two-column">
        <div className="idea-bank-section">
          <span className="metric-label">Useful vocabulary</span>
          <div className="idea-chip-list">
            {entry.usefulVocabulary.map((item) => (
              <span key={item} className="idea-chip">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="idea-bank-section">
          <span className="metric-label">Collocations</span>
          <div className="idea-chip-list">
            {entry.collocations.map((item) => (
              <span key={item} className="idea-chip">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="idea-bank-section">
        <span className="metric-label">Idea starters</span>
        <ul className="bullet-list compact-list">
          {entry.ideaStarters.map((starter) => (
            <li key={starter}>{starter}</li>
          ))}
        </ul>
      </div>

      <div className="idea-bank-section">
        <span className="metric-label">Contrast pairs</span>
        <div className="idea-chip-list">
          {entry.contrastPairs.map((item) => (
            <span key={item} className="idea-chip idea-chip-accent">
              {item}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

export function IdeaBankWorkspace({ entries }: IdeaBankWorkspaceProps) {
  const [taskType, setTaskType] = useState<IdeaBankTaskFilter>('All')
  const [searchValue, setSearchValue] = useState('')
  const deferredSearchValue = useDeferredValue(searchValue)
  const filteredEntries = filterIdeaBankEntries({
    entries,
    query: deferredSearchValue,
    taskType,
  })
  const summary = summarizeIdeaBank(filteredEntries)

  return (
    <div className="dashboard-stack idea-bank-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Idea Bank</p>
          <h1>Build answers faster with topic-ready ideas</h1>
          <p>
            Browse product-owned IELTS writing topics with question angles,
            vocabulary, collocations, and argument starters before drafting.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">{summary.totalTopics} visible topics</span>
            <span className="hero-badge">{summary.vocabularyItems} vocabulary items</span>
            <span className="hero-badge">{summary.collocationItems} collocations</span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <SparklesIcon className="metric-icon" />
            </div>
            <span className="metric-label">Topics</span>
            <strong>{summary.totalTopics}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <WritingIcon className="metric-icon" />
            </div>
            <span className="metric-label">Task 2 topics</span>
            <strong>{summary.taskTwoTopics}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <QuillIcon className="metric-icon" />
            </div>
            <span className="metric-label">Task 1 topics</span>
            <strong>{summary.taskOneTopics}</strong>
          </div>
        </div>
      </section>

      <section className="glass writing-panel idea-bank-toolbar">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <CompassIcon className="section-icon" />
              <span>Find usable ideas</span>
            </h2>
            <p>Filter by task type or search for a topic, problem, or vocabulary phrase.</p>
          </div>
          <Link href="/writing" className="inline-link">
            Open writing workspace
          </Link>
        </div>

        <div className="idea-bank-controls">
          <div className="task-switcher" role="tablist" aria-label="Idea bank task type">
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
          <div className="field-group idea-bank-search">
            <label htmlFor="idea-bank-search">Search the idea bank</label>
            <input
              id="idea-bank-search"
              className="text-input"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Try environment, remote work, vocabulary..."
            />
          </div>
        </div>
      </section>

      {filteredEntries.length ? (
        <section className="idea-bank-grid" aria-label="Idea bank topics">
          {filteredEntries.map((entry) => (
            <IdeaBankEntryCard key={entry.id} entry={entry} />
          ))}
        </section>
      ) : (
        <section className="glass writing-panel empty-state-panel">
          <div className="panel-heading">
            <p className="section-label">Idea Bank</p>
            <h2>No idea bank topics match this search</h2>
            <p>
              Clear the search or switch task type to browse the full set of
              IELTS writing idea starters.
            </p>
          </div>
          <div className="settings-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setSearchValue('')
                setTaskType('All')
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
    </div>
  )
}
