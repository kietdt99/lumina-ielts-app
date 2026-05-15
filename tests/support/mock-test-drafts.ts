type DraftTaskType = 'Task 1' | 'Task 2'

const connectors = [
  'However',
  'Therefore',
  'Moreover',
  'For example',
  'As a result',
  'Furthermore',
  'In contrast',
]

export function countDraftWords(text: string) {
  return text.match(/\b[\w'-]+\b/g)?.length ?? 0
}

function bodySentence(index: number) {
  const connector = connectors[index % connectors.length]

  return `${connector}, point${index} evidence${index} context${index} outcome${index} pattern${index} comparison${index} signal${index} trend${index} anchor${index} supports controlled reasoning.`
}

function splitIntoParagraphs(sentences: string[], paragraphCount: number) {
  const paragraphs = Array.from({ length: paragraphCount }, () => [] as string[])

  sentences.forEach((sentence, index) => {
    const paragraphIndex = Math.min(
      paragraphCount - 1,
      Math.floor((index * paragraphCount) / sentences.length)
    )
    paragraphs[paragraphIndex].push(sentence)
  })

  return paragraphs
    .filter((paragraph) => paragraph.length)
    .map((paragraph) => paragraph.join(' '))
    .join('\n\n')
}

export function buildReadyDraft({
  minimumWords,
  taskType,
}: {
  minimumWords: number
  taskType: DraftTaskType
}) {
  const opening =
    taskType === 'Task 1'
      ? 'Overall, the main feature is that the pattern moves clearly from source evidence to a practical final result.'
      : 'This essay argues that the overall effect is positive because careful decisions improve outcomes while safeguards reduce risk.'
  const closing =
    taskType === 'Task 2'
      ? 'In conclusion, this position is convincing because the benefits remain stronger when the main risks are managed responsibly.'
      : 'This final detail reinforces the overview because the strongest trend remains visible across the whole response.'
  const sentences = [opening]
  let index = 0

  while (countDraftWords([...sentences, closing].join(' ')) < minimumWords) {
    sentences.push(bodySentence(index))
    index += 1
  }

  sentences.push(closing)

  return splitIntoParagraphs(sentences, taskType === 'Task 1' ? 3 : 4)
}
