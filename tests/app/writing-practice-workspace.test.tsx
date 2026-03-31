import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WritingPracticeWorkspace } from '@/app/(app)/writing/_components/writing-practice-workspace'
import { writingPrompts } from '@/lib/ielts/writing-prompts'
import {
  createEvaluation,
  createHistoryEntry,
  createSubmissionSuccess,
} from '../helpers/fixtures'

describe('WritingPracticeWorkspace', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('autosaves drafts per prompt and restores them when switching tasks', async () => {
    const user = userEvent.setup()

    render(<WritingPracticeWorkspace prompts={writingPrompts} />)

    const editor = screen.getByLabelText('Draft editor')
    await user.type(editor, 'Task 2 draft content')

    expect(
      window.localStorage.getItem('lumina-writing-draft:task2-remote-work')
    ).toContain('Task 2 draft content')

    await user.click(screen.getByRole('button', { name: 'Task 1' }))

    const taskOneEditor = screen.getByLabelText('Draft editor')
    await user.type(taskOneEditor, 'Task 1 draft content')

    expect(
      window.localStorage.getItem('lumina-writing-draft:task1-cycle-diagram')
    ).toContain('Task 1 draft content')

    await user.click(screen.getByRole('button', { name: 'Task 2' }))

    expect(screen.getByLabelText('Draft editor')).toHaveValue('Task 2 draft content')
  })

  it('generates feedback and saves a practice result to local history', async () => {
    const user = userEvent.setup()
    const submission = createSubmissionSuccess({
      feedback: createEvaluation({
        estimatedBand: 7.5,
      }),
      historyEntry: createHistoryEntry({
        promptId: 'task2-remote-work',
        promptTitle: 'Remote work and employee productivity',
        estimatedBand: 7.5,
      }),
    })

    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      Response.json(submission, {
        status: 201,
      })
    )

    render(<WritingPracticeWorkspace prompts={writingPrompts} />)

    const editor = screen.getByLabelText('Draft editor')
    await user.type(
      editor,
      [
        'Remote work can improve productivity when employees have fewer interruptions and better control over their schedule.',
        '',
        'However, teams still need clear systems because some workers benefit from direct collaboration and immediate feedback.',
        '',
        'In conclusion, remote work is effective when companies support communication and set strong expectations.',
      ].join('\n')
    )

    await user.click(
      screen.getByRole('button', { name: 'Generate practice feedback' })
    )

    await waitFor(() => {
      expect(screen.getByText('Estimated band')).toBeInTheDocument()
    })

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/writing/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('"promptId":"task2-remote-work"'),
    })

    const rawHistory = window.localStorage.getItem('lumina-writing-history')

    expect(rawHistory).not.toBeNull()
    expect(rawHistory).toContain('task2-remote-work')
    expect(rawHistory).toContain('Remote work and employee productivity')
  })

  it('shows an error message when the API returns a submission failure', async () => {
    const user = userEvent.setup()

    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      Response.json(
        {
          ok: false,
          error: 'Write a draft before requesting practice feedback.',
        },
        {
          status: 400,
        }
      )
    )

    render(<WritingPracticeWorkspace prompts={writingPrompts} />)

    await user.type(screen.getByLabelText('Draft editor'), 'A short draft')
    await user.click(
      screen.getByRole('button', { name: 'Generate practice feedback' })
    )

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    const alert = screen.getByRole('alert')

    expect(alert).toHaveTextContent('Practice review failed')
    expect(alert).toHaveTextContent(
      'Write a draft before requesting practice feedback.'
    )
    expect(window.localStorage.getItem('lumina-writing-history')).toBeNull()
  })

  it('updates the session timer while the timer is running', async () => {
    vi.useFakeTimers()

    render(<WritingPracticeWorkspace prompts={writingPrompts} />)

    expect(screen.getByText('40:00')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Start timer' }))

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByText('39:58')).toBeInTheDocument()
  })
})
