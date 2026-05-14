'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ChecklistIcon,
  CompassIcon,
  RibbonIcon,
  SparklesIcon,
  TargetIcon,
  WritingIcon,
} from '@/app/_components/ui/app-icons'
import {
  getWritingRubric,
  summarizeWritingRubric,
  type RubricTaskType,
  type WritingRubricCriterion,
} from '@/lib/ielts/writing-rubric'

type RubricGuideWorkspaceProps = {
  criteria: WritingRubricCriterion[]
}

function CriterionCard({ criterion }: { criterion: WritingRubricCriterion }) {
  return (
    <article className="activity-card rubric-criterion-card">
      <div className="history-kicker-row">
        <span className="surface-kicker">Rubric criterion</span>
        <span className="surface-kicker tracker-history-pill">
          {criterion.shortName}
        </span>
      </div>
      <div className="activity-card-header">
        <div>
          <span className="prompt-type">Examiner lens</span>
          <h3 className="icon-heading">
            <RibbonIcon className="section-icon" />
            <span>{criterion.name}</span>
          </h3>
        </div>
      </div>
      <p>{criterion.learnerQuestion}</p>

      <div className="rubric-focus-grid">
        {criterion.scoringFocus.map((focus) => (
          <span key={focus} className="idea-chip">
            {focus}
          </span>
        ))}
      </div>

      <div className="rubric-band-stack">
        {criterion.bandDescriptors.map((descriptor) => (
          <section key={descriptor.band} className="rubric-band-card">
            <div className="rubric-band-header">
              <span className="surface-kicker">Band {descriptor.band}</span>
              <strong>{descriptor.label}</strong>
            </div>
            <p>{descriptor.descriptor}</p>
            <div className="rubric-watch-list">
              <span className="metric-label">Watch for</span>
              <ul className="bullet-list compact-list">
                {descriptor.watchFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="writing-helper-strip">
              <span className="surface-kicker">Next upgrade</span>
              <p>{descriptor.nextStep}</p>
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}

export function RubricGuideWorkspace({ criteria }: RubricGuideWorkspaceProps) {
  const [taskType, setTaskType] = useState<RubricTaskType>('Task 2')
  const activeCriteria = getWritingRubric(taskType, criteria)
  const summary = summarizeWritingRubric(criteria)
  const activeDescriptorCount = activeCriteria.reduce(
    (total, criterion) => total + criterion.bandDescriptors.length,
    0
  )

  return (
    <div className="dashboard-stack rubric-guide-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Rubric Guide</p>
          <h1>Understand what moves a writing band</h1>
          <p>
            Compare IELTS writing criteria by task type, then turn each band
            descriptor into a practical pre-submit checklist.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">{activeCriteria.length} active criteria</span>
            <span className="hero-badge">{activeDescriptorCount} band descriptors</span>
            <span className="hero-badge">{taskType} lens</span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TargetIcon className="metric-icon" />
            </div>
            <span className="metric-label">Criteria</span>
            <strong>{summary.totalCriteria}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <ChecklistIcon className="metric-icon" />
            </div>
            <span className="metric-label">Descriptors</span>
            <strong>{summary.totalDescriptors}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <WritingIcon className="metric-icon" />
            </div>
            <span className="metric-label">Current task</span>
            <strong>{taskType}</strong>
          </div>
        </div>
      </section>

      <section className="glass writing-panel rubric-guide-toolbar">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <CompassIcon className="section-icon" />
              <span>Choose the examiner lens</span>
            </h2>
            <p>
              Task 1 and Task 2 share language criteria, but the first criterion
              changes from reporting visuals to developing an argument.
            </p>
          </div>
          <Link href="/writing" className="inline-link">
            Open writing workspace
          </Link>
        </div>

        <div className="task-switcher" role="tablist" aria-label="Rubric task type">
          {(['Task 1', 'Task 2'] as const).map((task) => (
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
      </section>

      <section className="rubric-guide-grid" aria-label="Writing rubric criteria">
        {activeCriteria.map((criterion) => (
          <CriterionCard key={criterion.code} criterion={criterion} />
        ))}
      </section>

      <section className="glass writing-panel rubric-self-check-panel">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <SparklesIcon className="section-icon" />
              <span>Three-minute self-check</span>
            </h2>
            <p>Use this before submitting a draft for feedback.</p>
          </div>
          <Link href="/outline-builder" className="inline-link">
            Build an outline first
          </Link>
        </div>
        <div className="summary-grid">
          <div className="summary-box">
            <span className="surface-kicker">1</span>
            <span className="metric-label">Task answer</span>
            <strong>
              {taskType === 'Task 1'
                ? 'Name the main pattern in the overview.'
                : 'State one clear position and keep it stable.'}
            </strong>
          </div>
          <div className="summary-box">
            <span className="surface-kicker">2</span>
            <span className="metric-label">Reader flow</span>
            <strong>Check that each paragraph has one job.</strong>
          </div>
          <div className="summary-box">
            <span className="surface-kicker">3</span>
            <span className="metric-label">Language control</span>
            <strong>Remove forced vocabulary and repair sentence boundaries.</strong>
          </div>
        </div>
      </section>
    </div>
  )
}
