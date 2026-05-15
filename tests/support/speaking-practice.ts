import type { SpeakingPracticePrompt } from '@/lib/ielts/speaking-practice'

function countWords(text: string) {
  return text.match(/\b[\w'-]+\b/g)?.length ?? 0
}

export function buildSpeakingTranscript(prompt: SpeakingPracticePrompt) {
  const sentences = [
    `Overall, I would like to talk about ${prompt.title.toLowerCase()} because it connects closely with my daily life and gives me a clear example to explain.`,
    `Firstly, my main point is that this topic is practical, memorable, and easy to describe with specific details rather than vague opinions.`,
    `For example, I can explain the situation, the people involved, and the reason it matters to me in a natural order.`,
    `In addition, it affects my concentration, routine, productivity, flexibility, collaboration, and well-being in several small but important ways.`,
    `However, there are also some disadvantages, especially when convenience creates distraction or when a useful habit becomes too automatic.`,
    `As a result, I try to use it carefully and keep a balance between personal comfort and long-term progress.`,
    `On the other hand, this experience also helps me understand why other people may have a different view of the same topic.`,
    `For instance, someone with a different schedule, community, or work-life balance might value another feature more strongly.`,
    `Overall, I think the most important point is that a good answer should explain both the personal example and the wider reason behind it.`,
  ]

  while (countWords(sentences.join(' ')) < prompt.targetWords) {
    sentences.push(
      `Because of this, I can add one more concrete detail about ${prompt.topic.toLowerCase()} and link it back to the question clearly.`
    )
  }

  return sentences.join(' ')
}
