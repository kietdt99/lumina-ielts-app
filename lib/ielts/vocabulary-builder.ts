import {
  ideaBankEntries,
  type IdeaBankEntry,
} from './idea-bank'
import type { WritingPrompt } from './writing-prompts'

export type VocabularyBuilderTaskFilter = 'All' | WritingPrompt['taskType']

export type VocabularyBuilderCardType = 'Vocabulary' | 'Collocation'

export type VocabularyBuilderCardTypeFilter = 'All' | VocabularyBuilderCardType

export type VocabularyBuilderCard = {
  id: string
  sourceEntryId: string
  topic: string
  taskTypes: WritingPrompt['taskType'][]
  cardType: VocabularyBuilderCardType
  term: string
  meaning: string
  usageFrame: string
  example: string
  avoid: string
  practicePrompt: string
}

export type VocabularyBuilderSummary = {
  totalCards: number
  vocabularyCards: number
  collocationCards: number
  taskOneCards: number
  taskTwoCards: number
  topics: number
}

const allTopicsOption = 'All topics'

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase()
}

function createLearningNote(
  entry: IdeaBankEntry,
  term: string,
  cardType: VocabularyBuilderCardType
) {
  const topicLower = entry.topic.toLowerCase()
  const questionCue = entry.commonQuestions[0] ?? `Write about ${topicLower}.`

  if (cardType === 'Collocation') {
    return {
      meaning: `A natural word partnership for ${topicLower} answers.`,
      usageFrame: `Use "${term}" when the sentence needs a precise action, result, or contrast.`,
      example: `A strong answer could explain why people or governments should ${term}.`,
      avoid:
        'Avoid dropping the phrase into a sentence unless the grammar around it still works.',
      practicePrompt: `Write one IELTS sentence using "${term}" for this angle: ${questionCue}`,
    }
  }

  return {
    meaning: `A topic-specific phrase that helps name an issue, trend, group, or result in ${topicLower} essays.`,
    usageFrame: `Use "${term}" when it makes the idea more exact than a basic word like thing, problem, or good.`,
    example: `A strong answer could connect ${term} to a clear cause, effect, or example.`,
    avoid:
      'Avoid using this phrase as decoration; keep it only when it improves precision.',
    practicePrompt: `Write one IELTS sentence using "${term}" for this angle: ${questionCue}`,
  }
}

function createCard(
  entry: IdeaBankEntry,
  term: string,
  cardType: VocabularyBuilderCardType
): VocabularyBuilderCard {
  const note = createLearningNote(entry, term, cardType)

  return {
    id: `${entry.id}-${slugify(cardType)}-${slugify(term)}`,
    sourceEntryId: entry.id,
    topic: entry.topic,
    taskTypes: entry.taskTypes,
    cardType,
    term,
    ...note,
  }
}

function searchableText(card: VocabularyBuilderCard) {
  return [
    card.term,
    card.topic,
    card.cardType,
    card.meaning,
    card.usageFrame,
    card.example,
    card.practicePrompt,
    ...card.taskTypes,
  ].join(' ')
}

export function createVocabularyBuilderCards(
  entries: IdeaBankEntry[] = ideaBankEntries
) {
  return entries.flatMap((entry) => [
    ...entry.usefulVocabulary.map((term) =>
      createCard(entry, term, 'Vocabulary')
    ),
    ...entry.collocations.map((term) => createCard(entry, term, 'Collocation')),
  ])
}

export const vocabularyBuilderCards = createVocabularyBuilderCards()

export function listVocabularyBuilderTopics(
  cards: VocabularyBuilderCard[] = vocabularyBuilderCards
) {
  return [allTopicsOption, ...new Set(cards.map((card) => card.topic))]
}

export function filterVocabularyBuilderCards({
  cards = vocabularyBuilderCards,
  query = '',
  taskType = 'All',
  cardType = 'All',
  topic = allTopicsOption,
}: {
  cards?: VocabularyBuilderCard[]
  query?: string
  taskType?: VocabularyBuilderTaskFilter
  cardType?: VocabularyBuilderCardTypeFilter
  topic?: string
}) {
  const normalizedQuery = normalizeSearchValue(query)

  return cards.filter((card) => {
    const matchesTask = taskType === 'All' || card.taskTypes.includes(taskType)
    const matchesCardType = cardType === 'All' || card.cardType === cardType
    const matchesTopic = topic === allTopicsOption || card.topic === topic
    const matchesQuery =
      !normalizedQuery ||
      normalizeSearchValue(searchableText(card)).includes(normalizedQuery)

    return matchesTask && matchesCardType && matchesTopic && matchesQuery
  })
}

export function summarizeVocabularyBuilderCards(
  cards: VocabularyBuilderCard[] = vocabularyBuilderCards
): VocabularyBuilderSummary {
  return {
    totalCards: cards.length,
    vocabularyCards: cards.filter((card) => card.cardType === 'Vocabulary')
      .length,
    collocationCards: cards.filter((card) => card.cardType === 'Collocation')
      .length,
    taskOneCards: cards.filter((card) => card.taskTypes.includes('Task 1'))
      .length,
    taskTwoCards: cards.filter((card) => card.taskTypes.includes('Task 2'))
      .length,
    topics: new Set(cards.map((card) => card.topic)).size,
  }
}

export function parseVocabularyBuilderTaskFilter(
  value: string | null
): VocabularyBuilderTaskFilter {
  return value === 'Task 1' || value === 'Task 2' ? value : 'All'
}

export function parseVocabularyBuilderCardTypeFilter(
  value: string | null
): VocabularyBuilderCardTypeFilter {
  return value === 'Vocabulary' || value === 'Collocation' ? value : 'All'
}

export function parseVocabularyBuilderTopicFilter(
  value: string | null,
  cards: VocabularyBuilderCard[] = vocabularyBuilderCards
) {
  const topics = listVocabularyBuilderTopics(cards)

  return value && topics.includes(value) ? value : allTopicsOption
}
