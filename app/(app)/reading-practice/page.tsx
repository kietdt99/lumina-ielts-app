import { ReadingPracticeWorkspace } from './_components/reading-practice-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import {
  readingPracticePassages,
  toPublicReadingPracticePassage,
} from '@/lib/ielts/reading-practice'

export default async function ReadingPracticePage() {
  await requireLearnerAppSession()

  return (
    <ReadingPracticeWorkspace
      passages={readingPracticePassages.map(toPublicReadingPracticePassage)}
    />
  )
}
