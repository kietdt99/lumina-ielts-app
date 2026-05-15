import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ListeningPracticeWorkspace } from '@/app/(app)/listening-practice/_components/listening-practice-workspace'
import {
  listeningPracticeTracks,
  scoreListeningPracticeAttempt,
  toPublicListeningPracticeTrack,
} from '@/lib/ielts/listening-practice'

const publicTracks = listeningPracticeTracks.map(toPublicListeningPracticeTrack)

function mockScoringApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init?: RequestInit) => {
      const payload = JSON.parse(init?.body as string)
      const result = scoreListeningPracticeAttempt(payload)

      return new Response(JSON.stringify(result), {
        status: result.ok ? 200 : 400,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })
  )
}

describe('ListeningPracticeWorkspace', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mockScoringApi()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the listening practice workspace and simulation controls', () => {
    render(<ListeningPracticeWorkspace tracks={publicTracks} />)

    expect(
      screen.getByRole('heading', {
        name: 'Train IELTS Listening with replayable simulations',
      })
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('heading', { name: 'Library membership enquiry' })
        .length
    ).toBeGreaterThan(0)
    expect(
      screen.getByRole('button', { name: 'Start audio simulation' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Listening notes')).toBeInTheDocument()
  })

  it('filters tracks by section, difficulty, topic, and search', async () => {
    const user = userEvent.setup()

    render(<ListeningPracticeWorkspace tracks={publicTracks} />)

    await user.selectOptions(screen.getByLabelText('Section'), 'Part 2')
    await user.selectOptions(screen.getByLabelText('Difficulty'), 'Balanced')
    await user.selectOptions(screen.getByLabelText('Topic focus'), 'Culture and community')
    await user.type(screen.getByLabelText('Search tracks'), 'museum')

    expect(
      screen.getAllByRole('heading', { name: 'Museum volunteer tour' }).length
    ).toBeGreaterThan(0)
    expect(
      screen.queryByRole('heading', { name: 'Library membership enquiry' })
    ).not.toBeInTheDocument()
  })

  it('stores notes and answers locally and shows the API score report', async () => {
    const user = userEvent.setup()
    const track = listeningPracticeTracks[0]

    render(<ListeningPracticeWorkspace tracks={publicTracks} />)

    await user.click(screen.getByRole('button', { name: 'Show full transcript' }))
    await user.type(
      screen.getByLabelText('Listening notes'),
      'membership residents address study rooms printing'
    )

    for (const question of track.questions) {
      await user.selectOptions(
        screen.getByLabelText(question.prompt),
        question.correctAnswer
      )
    }

    await user.click(screen.getByRole('button', { name: 'Score listening answers' }))

    await waitFor(() => {
      expect(screen.getByText('Listening score report')).toBeInTheDocument()
    })
    expect(screen.getByText('Strong control')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('Correct answer: thirty')).toBeInTheDocument()

    const storedState = JSON.parse(
      window.localStorage.getItem('lumina-listening-practice') ?? '{}'
    ) as Record<string, { answers: Record<string, string>; notes: string }>

    expect(storedState[track.id].answers[track.questions[0].id]).toBe(
      track.questions[0].correctAnswer
    )
    expect(storedState[track.id].notes).toContain('membership residents')
  })

  it('shows an empty state and can reset filters', async () => {
    const user = userEvent.setup()

    render(<ListeningPracticeWorkspace tracks={publicTracks} />)

    await user.type(screen.getByLabelText('Search tracks'), 'no listening match')

    expect(screen.getByText('No listening tracks match this filter')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Reset filters' })[0])

    expect(
      screen.getAllByRole('heading', { name: 'Library membership enquiry' })
        .length
    ).toBeGreaterThan(0)
  })
})
