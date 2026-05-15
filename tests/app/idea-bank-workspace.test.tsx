import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { IdeaBankWorkspace } from '@/app/(app)/idea-bank/_components/idea-bank-workspace'
import { ideaBankEntries } from '@/lib/ielts/idea-bank'

describe('IdeaBankWorkspace', () => {
  it('renders product-owned topic content', () => {
    render(<IdeaBankWorkspace entries={ideaBankEntries} />)

    expect(
      screen.getByRole('heading', { name: 'Build answers faster with topic-ready ideas' })
    ).toBeInTheDocument()
    expect(screen.getAllByText('Education and technology').length).toBeGreaterThan(0)
    expect(screen.getByText('personalized learning')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open writing workspace' })).toHaveAttribute(
      'href',
      '/writing'
    )
  })

  it('filters the idea bank by search and task type', async () => {
    const user = userEvent.setup()

    render(<IdeaBankWorkspace entries={ideaBankEntries} />)

    await user.type(screen.getByLabelText('Search the idea bank'), 'renewable')

    expect(screen.getAllByText('Environment and climate').length).toBeGreaterThan(0)
    expect(screen.queryByText('Work and society')).not.toBeInTheDocument()

    await user.clear(screen.getByLabelText('Search the idea bank'))
    await user.click(screen.getByRole('button', { name: 'Task 1' }))

    expect(screen.getAllByText('Environment and climate').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Urban change and transport').length).toBeGreaterThan(0)
    expect(screen.queryByText('Education and technology')).not.toBeInTheDocument()
  })

  it('shows an empty state and can reset filters', async () => {
    const user = userEvent.setup()

    render(<IdeaBankWorkspace entries={ideaBankEntries} />)

    await user.type(screen.getByLabelText('Search the idea bank'), 'no matching topic')

    expect(screen.getByText('No idea bank topics match this search')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset filters' }))

    expect(screen.getAllByText('Education and technology').length).toBeGreaterThan(0)
  })
})
