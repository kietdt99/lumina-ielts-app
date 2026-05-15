import { ListeningPracticeWorkspace } from './_components/listening-practice-workspace'
import { requireLearnerAppSession } from '@/lib/auth/service'
import {
  listeningPracticeTracks,
  toPublicListeningPracticeTrack,
} from '@/lib/ielts/listening-practice'

export default async function ListeningPracticePage() {
  await requireLearnerAppSession()

  return (
    <ListeningPracticeWorkspace
      tracks={listeningPracticeTracks.map(toPublicListeningPracticeTrack)}
    />
  )
}
