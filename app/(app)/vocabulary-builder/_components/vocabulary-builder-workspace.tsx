'use client'

import Link from 'next/link'
import { useDeferredValue, useEffect, useState } from 'react'
import {
  ChecklistIcon,
  CompassIcon,
  QuillIcon,
  SparklesIcon,
  WritingIcon,
} from '@/app/_components/ui/app-icons'
import {
  filterVocabularyBuilderCards,
  listVocabularyBuilderTopics,
  summarizeVocabularyBuilderCards,
  type VocabularyBuilderCard,
  type VocabularyBuilderCardTypeFilter,
  type VocabularyBuilderTaskFilter,
} from '@/lib/ielts/vocabulary-builder'

type VocabularyBuilderWorkspaceProps = {
  cards: VocabularyBuilderCard[]
}

type VocabularyCardProgress = 'known' | 'practice'

type VocabularyProgressState = Record<string, VocabularyCardProgress>

const progressStorageKey = 'lumina-vocabulary-builder-progress'

const cardTypeOptions: VocabularyBuilderCardTypeFilter[] = [
  'All',
  'Vocabulary',
  'Collocation',
]

function progressLabel(progress?: VocabularyCardProgress) {
  if (progress === 'known') {
    return 'Known'
  }

  return progress === 'practice' ? 'Needs practice' : 'New card'
}

function VocabularyCard({
  card,
  progress,
  onMark,
}: {
  card: VocabularyBuilderCard
  progress?: VocabularyCardProgress
  onMark: (cardId: string, progress: VocabularyCardProgress) => void
}) {
  return (
    <article className="activity-card vocabulary-builder-card">
      <div className="history-kicker-row">
        <span className="surface-kicker">{card.cardType}</span>
        <span className="surface-kicker tracker-history-pill">{card.topic}</span>
        <span className="surface-kicker tracker-history-pill tracker-history-pill-accent">
          {progressLabel(progress)}
        </span>
      </div>

      <div className="activity-card-header">
        <div>
          <span className="prompt-type">Recall card</span>
          <h3 className="icon-heading">
            <QuillIcon className="section-icon" />
            <span>{card.term}</span>
          </h3>
        </div>
      </div>

      <div className="vocabulary-builder-section">
        <span className="metric-label">Meaning</span>
        <p>{card.meaning}</p>
      </div>

      <div className="vocabulary-builder-section">
        <span className="metric-label">Usage frame</span>
        <p>{card.usageFrame}</p>
      </div>

      <blockquote className="vocabulary-builder-example">
        {card.example}
      </blockquote>

      <div className="vocabulary-builder-section vocabulary-builder-practice">
        <span className="metric-label">Practice prompt</span>
        <p>{card.practicePrompt}</p>
      </div>

      <div className="vocabulary-builder-section">
        <span className="metric-label">Avoid</span>
        <p>{card.avoid}</p>
      </div>

      <div className="settings-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => onMark(card.id, 'practice')}
        >
          Needs practice
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={() => onMark(card.id, 'known')}
        >
          I know this
        </button>
      </div>
    </article>
  )
}

export function VocabularyBuilderWorkspace({
  cards,
}: VocabularyBuilderWorkspaceProps) {
  const [taskType, setTaskType] = useState<VocabularyBuilderTaskFilter>('All')
  const [cardType, setCardType] =
    useState<VocabularyBuilderCardTypeFilter>('All')
  const [topic, setTopic] = useState('All topics')
  const [searchValue, setSearchValue] = useState('')
  const [progress, setProgress] = useState<VocabularyProgressState>({})
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false)
  const deferredSearchValue = useDeferredValue(searchValue)
  const topics = listVocabularyBuilderTopics(cards)
  const filteredCards = filterVocabularyBuilderCards({
    cards,
    query: deferredSearchValue,
    taskType,
    cardType,
    topic,
  })
  const summary = summarizeVocabularyBuilderCards(filteredCards)
  const knownVisibleCount = filteredCards.filter(
    (card) => progress[card.id] === 'known'
  ).length
  const practiceVisibleCount = filteredCards.filter(
    (card) => progress[card.id] === 'practice'
  ).length

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

  function markCard(cardId: string, nextProgress: VocabularyCardProgress) {
    setProgress((current) => ({
      ...current,
      [cardId]: nextProgress,
    }))
  }

  function resetFilters() {
    setSearchValue('')
    setTaskType('All')
    setCardType('All')
    setTopic('All topics')
  }

  return (
    <div className="dashboard-stack vocabulary-builder-page">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">Vocabulary Builder</p>
          <h1>Turn useful vocabulary into active IELTS recall</h1>
          <p>
            Practice topic vocabulary and collocations as short recall cards,
            then carry the strongest phrases into a real Writing session.
          </p>
          <div className="hero-badge-row">
            <span className="hero-badge">{summary.totalCards} visible cards</span>
            <span className="hero-badge">{summary.vocabularyCards} vocabulary</span>
            <span className="hero-badge">{summary.collocationCards} collocations</span>
            <span className="hero-badge">{knownVisibleCount} known cards</span>
            <span className="hero-badge">{practiceVisibleCount} practice cards</span>
          </div>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <div className="metric-pill-header">
              <SparklesIcon className="metric-icon" />
            </div>
            <span className="metric-label">Cards</span>
            <strong>{summary.totalCards}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <ChecklistIcon className="metric-icon" />
            </div>
            <span className="metric-label">Known</span>
            <strong>{knownVisibleCount}</strong>
          </div>
          <div className="metric-pill">
            <div className="metric-pill-header">
              <WritingIcon className="metric-icon" />
            </div>
            <span className="metric-label">Practice</span>
            <strong>{practiceVisibleCount}</strong>
          </div>
        </div>
      </section>

      <section className="glass writing-panel vocabulary-builder-toolbar">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <CompassIcon className="section-icon" />
              <span>Choose a recall set</span>
            </h2>
            <p>
              Filter by task, topic, or card type when you want focused lexical
              practice before drafting.
            </p>
          </div>
          <Link href="/writing" className="inline-link">
            Open writing workspace
          </Link>
        </div>

        <div className="vocabulary-builder-controls">
          <div
            className="task-switcher"
            role="tablist"
            aria-label="Vocabulary builder task type"
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
            <label htmlFor="vocabulary-builder-card-type">Card type</label>
            <select
              id="vocabulary-builder-card-type"
              className="text-input"
              value={cardType}
              onChange={(event) =>
                setCardType(event.target.value as VocabularyBuilderCardTypeFilter)
              }
            >
              {cardTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All card types' : option}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="vocabulary-builder-topic">Topic focus</label>
            <select
              id="vocabulary-builder-topic"
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

          <div className="field-group vocabulary-builder-search">
            <label htmlFor="vocabulary-builder-search">Search vocabulary</label>
            <input
              id="vocabulary-builder-search"
              className="text-input"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Try renewable, autonomy, congestion, prevention..."
            />
          </div>
        </div>
      </section>

      {filteredCards.length ? (
        <section
          className="vocabulary-builder-grid"
          aria-label="Vocabulary card bank"
        >
          {filteredCards.map((card) => (
            <VocabularyCard
              key={card.id}
              card={card}
              progress={progress[card.id]}
              onMark={markCard}
            />
          ))}
        </section>
      ) : (
        <section className="glass writing-panel empty-state-panel">
          <div className="panel-heading">
            <p className="section-label">Vocabulary Builder</p>
            <h2>No vocabulary cards match this filter</h2>
            <p>
              Clear the search or switch task, topic, or card type to browse
              the full vocabulary set.
            </p>
          </div>
          <div className="settings-actions">
            <button type="button" className="primary-button" onClick={resetFilters}>
              Reset filters
            </button>
            <Link href="/idea-bank" className="secondary-button">
              Open idea bank
            </Link>
          </div>
        </section>
      )}

      <section className="glass writing-panel vocabulary-builder-practice-panel">
        <div className="dashboard-section-header">
          <div className="panel-heading">
            <h2 className="icon-heading">
              <ChecklistIcon className="section-icon" />
              <span>How to make recall stick</span>
            </h2>
            <p>
              Mark cards honestly, then write one fresh sentence before moving
              the phrase into a full essay.
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
            <span className="metric-label">Warm-up</span>
            <p>
              Pick five cards from one topic and say a sentence out loud before
              writing it.
            </p>
          </div>
          <div className="model-fragment-section">
            <span className="metric-label">Writing transfer</span>
            <p>
              Use only two or three accurate phrases in a draft. Precision beats
              memorized word dumping.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
