import { describe, expect, it } from 'vitest'
import {
  filterVocabularyBuilderCards,
  listVocabularyBuilderTopics,
  parseVocabularyBuilderCardTypeFilter,
  parseVocabularyBuilderTaskFilter,
  parseVocabularyBuilderTopicFilter,
  summarizeVocabularyBuilderCards,
  vocabularyBuilderCards,
} from '@/lib/ielts/vocabulary-builder'

describe('vocabulary builder', () => {
  it('creates recall cards from the idea bank vocabulary and collocations', () => {
    const summary = summarizeVocabularyBuilderCards(vocabularyBuilderCards)

    expect(summary).toEqual({
      totalCards: 45,
      vocabularyCards: 25,
      collocationCards: 20,
      taskOneCards: 18,
      taskTwoCards: 45,
      topics: 5,
    })
    expect(vocabularyBuilderCards.map((card) => card.id)).toContain(
      'environment-climate-vocabulary-renewable-energy'
    )
  })

  it('filters cards by task, card type, topic, and search', () => {
    const cards = filterVocabularyBuilderCards({
      taskType: 'Task 1',
      cardType: 'Collocation',
      topic: 'Environment and climate',
      query: 'impact',
    })

    expect(cards.map((card) => card.id)).toEqual([
      'environment-climate-collocation-reduce-environmental-impact',
    ])
  })

  it('lists topics with the all-topics option first', () => {
    expect(listVocabularyBuilderTopics(vocabularyBuilderCards)).toEqual([
      'All topics',
      'Education and technology',
      'Work and society',
      'Environment and climate',
      'Health and lifestyle',
      'Urban change and transport',
    ])
  })

  it('parses unsupported filters back to broad defaults', () => {
    expect(parseVocabularyBuilderTaskFilter('Speaking')).toBe('All')
    expect(parseVocabularyBuilderCardTypeFilter('Phrase')).toBe('All')
    expect(parseVocabularyBuilderTopicFilter('Unknown topic')).toBe('All topics')
  })
})
