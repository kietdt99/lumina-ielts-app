import { requireLearnerAppSession } from '@/lib/auth/service'
import {
  filterVocabularyBuilderCards,
  listVocabularyBuilderTopics,
  parseVocabularyBuilderCardTypeFilter,
  parseVocabularyBuilderTaskFilter,
  parseVocabularyBuilderTopicFilter,
  summarizeVocabularyBuilderCards,
  vocabularyBuilderCards,
} from '@/lib/ielts/vocabulary-builder'

export async function GET(request: Request) {
  await requireLearnerAppSession()

  const url = new URL(request.url)
  const query = url.searchParams.get('query') ?? ''
  const taskType = parseVocabularyBuilderTaskFilter(
    url.searchParams.get('taskType')
  )
  const cardType = parseVocabularyBuilderCardTypeFilter(
    url.searchParams.get('cardType')
  )
  const topic = parseVocabularyBuilderTopicFilter(
    url.searchParams.get('topic'),
    vocabularyBuilderCards
  )
  const cards = filterVocabularyBuilderCards({
    cards: vocabularyBuilderCards,
    query,
    taskType,
    cardType,
    topic,
  })

  return Response.json({
    ok: true,
    cards,
    summary: summarizeVocabularyBuilderCards(cards),
    topics: listVocabularyBuilderTopics(vocabularyBuilderCards),
  })
}
