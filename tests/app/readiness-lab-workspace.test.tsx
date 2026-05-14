import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ReadinessLabWorkspace } from '@/app/(app)/readiness-lab/_components/readiness-lab-workspace'
import { createWritingReadiness } from '@/lib/ielts/writing-readiness'
import { writingPrompts } from '@/lib/ielts/writing-prompts'

const strongDraft = [
  'Remote work can improve productivity because employees protect focused time and avoid tiring commutes.',
  '',
  'For example, a software developer may complete complex tasks faster at home because fewer interruptions break concentration. Moreover, flexible schedules can help people work during their most productive hours.',
  '',
  'However, office work remains useful because new employees often need direct mentoring and quick informal feedback. Therefore, companies should create communication routines instead of assuming remote work succeeds automatically.',
  '',
  'In conclusion, remote work is productive when autonomy is balanced with accountability and clear team communication.',
].join('\n')

describe('ReadinessLabWorkspace', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        const payload = JSON.parse(String(init?.body ?? '{}'))
        return Response.json(createWritingReadiness(payload))
      })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the readiness lab and writing handoff links', () => {
    render(<ReadinessLabWorkspace prompts={writingPrompts} />)

    expect(
      screen.getByRole('heading', {
        name: 'Check a draft before asking for feedback',
      })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Writing prompt')).toHaveValue('task2-remote-work')
    expect(screen.getByRole('link', { name: 'Open with outline' })).toHaveAttribute(
      'href',
      '/writing?promptId=task2-remote-work&outline=1'
    )
  })

  it('runs readiness checks through the API contract', async () => {
    const user = userEvent.setup()

    render(<ReadinessLabWorkspace prompts={writingPrompts} />)

    fireEvent.change(screen.getByLabelText('Draft to check'), {
      target: { value: strongDraft },
    })
    await user.click(screen.getByRole('button', { name: 'Run readiness check' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Readiness result')).toBeInTheDocument()
    })
    expect(screen.getByText('Ready for practice feedback')).toBeInTheDocument()
    expect(screen.getByText('Readiness')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(
      '/api/writing/readiness',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"promptId":"task2-remote-work"'),
      })
    )
  })

  it('switches prompts and clears stale readiness results', async () => {
    const user = userEvent.setup()

    render(<ReadinessLabWorkspace prompts={writingPrompts} />)

    fireEvent.change(screen.getByLabelText('Draft to check'), {
      target: { value: strongDraft },
    })
    await user.click(screen.getByRole('button', { name: 'Run readiness check' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Readiness result')).toBeInTheDocument()
    })

    await user.selectOptions(screen.getByLabelText('Writing prompt'), 'task1-cycle-diagram')

    expect(screen.queryByLabelText('Readiness result')).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Water recycling process' })
    ).toBeInTheDocument()
  })

  it('shows API failures without keeping stale results', async () => {
    const user = userEvent.setup()

    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json(
        {
          ok: false,
          error: 'Learner authentication is required.',
        },
        { status: 401 }
      )
    )

    render(<ReadinessLabWorkspace prompts={writingPrompts} />)

    await user.click(screen.getByRole('button', { name: 'Run readiness check' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Readiness check failed.'
      )
    })
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Learner authentication is required.'
    )
    expect(screen.queryByLabelText('Readiness result')).not.toBeInTheDocument()
  })
})
