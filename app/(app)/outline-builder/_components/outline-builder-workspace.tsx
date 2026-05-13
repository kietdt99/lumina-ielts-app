'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ChecklistIcon,
  CompassIcon,
  QuillIcon,
  SparklesIcon,
  TargetIcon,
  WritingIcon,
} from '@/app/_components/ui/app-icons'
import type { IdeaBankEntry } from '@/lib/ielts/idea-bank'
import {
  createWritingOutline,
  type WritingOutlineBlock,
} from '@/lib/ielts/outline-builder'
import type { WritingPrompt } from '@/lib/ielts/writing-prompts'

type OutlineBuilderWorkspaceProps = {
  prompts: WritingPrompt[]
  ideaBankEntries: IdeaBankEntry[]
}

function OutlineBlockCard({ block }: { block: WritingOutlineBlock }) {
  return (
    <article className="activity-card outline-block-card">
      <div className="history-kicker-row">
        <span className="surface-kicker">Outline block</span>
        <span className="surface-kicker tracker-history-pill">
          {block.label}
        </span>
      </div>
      <h3 className="icon-heading">
        <ChecklistIcon className="section-icon" />
        <span>{block.label}</span>
      </h3>
      <p>{block.purpose}</p>
      <div className="outline-frame">
        <span className="metric-label">Sentence frame</span>
        <strong>{block.sentenceFrame}</strong>
      </div>
      <div className="outline-checkpoints">
        <span className="metric-label">Check before drafting</span>
        <ul className="bullet-list compact-list">
          {block.checkpoints.map((checkpoint) => (
            <li key={checkpoint}>{checkpoint}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export function OutlineBuilderWorkspace({
  prompts,
  ideaBankEntries,
}: OutlineBuilderWorkspaceProps) {
  const initialTask = prompts[0]?.taskType ?? 'Task 2'
  const [selectedTask, setSelectedTask] =
    useState<WritingPrompt['taskType']>(initialTask)
  const filteredPrompts = prompts.filter((prompt) => prompt.taskType === selectedTask)
  const [selectedPromptId, setSelectedPromptId] = useState(
    filteredPrompts[0]?.id ?? prompts[0]?.id ?? ''
  )
  const selectedPrompt =
    filteredPrompts.find((prompt) => prompt.id === selectedPromptId) ??
    filteredPrompts[0] ??
    prompts[0] as WritingPrompt
  const outline = createWritingOutline(selectedPrompt, ideaBankEntries)

  function handleTaskChange(task: WritingPrompt['taskType']) {
    const nextPrompt = prompts.find((prompt) => prompt.taskType === task)

    setSelectedTask(task)
    setSelectedPromptId(nextPrompt?.id ?? prompts[0]?.id ?? '')
  }

  return (
    <div className="dashboard-stack outline-builder-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Outline Builder</p>
          <h1>Plan the answer before the timer starts</h1>
          <p>
            Turn a prompt into a clear IELTS-ready outline with a thesis frame,
            paragraph blocks, vocabulary, and checks before drafting.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">{outline.taskType}</span>
            <span className="hero-badge">{outline.topic}</span>
            <span className="hero-badge">{outline.ideaBankTopic}</span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <CompassIcon className="metric-icon" />
            </div>
            <span className="metric-label">Blocks</span>
            <strong>{outline.blocks.length}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <SparklesIcon className="metric-icon" />
            </div>
            <span className="metric-label">Vocabulary</span>
            <strong>{outline.vocabulary.length}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <TargetIcon className="metric-icon" />
            </div>
            <span className="metric-label">Word target</span>
            <strong>{selectedPrompt.minimumWords}+</strong>
          </div>
        </div>
      </section>

      <section className="glass writing-panel outline-builder-controls">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <QuillIcon className="section-icon" />
              <span>Choose a prompt to outline</span>
            </h2>
            <p>Switch task type and prompt, then use the generated plan as your drafting map.</p>
          </div>
          <Link href="/idea-bank" className="inline-link">
            Open idea bank
          </Link>
        </div>

        <div className="outline-builder-picker">
          <div className="task-switcher" role="tablist" aria-label="Outline task type">
            {(['Task 1', 'Task 2'] as const).map((task) => (
              <button
                key={task}
                type="button"
                className={`task-chip${selectedTask === task ? ' is-active' : ''}`}
                onClick={() => handleTaskChange(task)}
              >
                <span className="task-chip-dot" aria-hidden="true" />
                {task}
              </button>
            ))}
          </div>

          <div className="field-group">
            <label htmlFor="outline-prompt">Writing prompt</label>
            <select
              id="outline-prompt"
              className="select-input"
              value={selectedPrompt.id}
              onChange={(event) => setSelectedPromptId(event.target.value)}
            >
              {filteredPrompts.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="dashboard-grid dashboard-metrics">
        <article className="glass dashboard-card">
          <span className="surface-kicker">Selected prompt</span>
          <h2 className="card-title icon-heading">
            <WritingIcon className="section-icon" />
            <span>{outline.promptTitle}</span>
          </h2>
          <p>{selectedPrompt.brief}</p>
        </article>
        <article className="glass dashboard-card">
          <span className="surface-kicker">Main frame</span>
          <h2 className="card-title icon-heading">
            <TargetIcon className="section-icon" />
            <span>Thesis or Overview</span>
          </h2>
          <p>{outline.thesisFrame}</p>
        </article>
        <article className="glass dashboard-card">
          <span className="surface-kicker">Next action</span>
          <h2 className="card-title icon-heading">
            <SparklesIcon className="section-icon" />
            <span>Draft Next</span>
          </h2>
          <p>{outline.nextDraftPrompt}</p>
          <Link href="/writing" className="inline-link">
            Open writing workspace
          </Link>
        </article>
      </section>

      <section className="glass writing-panel">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <CompassIcon className="section-icon" />
              <span>Outline Blocks</span>
            </h2>
            <p>{outline.summary}</p>
          </div>
        </div>

        <div className="outline-block-grid">
          {outline.blocks.map((block) => (
            <OutlineBlockCard key={block.id} block={block} />
          ))}
        </div>
      </section>

      <section className="outline-support-grid">
        <article className="glass writing-panel">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <SparklesIcon className="section-icon" />
              <span>Vocabulary Pack</span>
            </h2>
            <p>Use these phrases naturally; do not force every item into the same draft.</p>
          </div>
          <div className="idea-chip-list">
            {outline.vocabulary.map((item) => (
              <span key={item} className="idea-chip">
                {item}
              </span>
            ))}
          </div>
        </article>

        <article className="glass writing-panel">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <QuillIcon className="section-icon" />
              <span>Collocation Pack</span>
            </h2>
            <p>Keep collocations accurate and connected to the paragraph purpose.</p>
          </div>
          <div className="idea-chip-list">
            {outline.collocations.map((item) => (
              <span key={item} className="idea-chip">
                {item}
              </span>
            ))}
          </div>
        </article>

        <article className="glass writing-panel">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <ChecklistIcon className="section-icon" />
              <span>Planning Checklist</span>
            </h2>
            <p>Use this as your final pre-draft check.</p>
          </div>
          <ul className="bullet-list compact-list">
            {outline.planningChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  )
}
