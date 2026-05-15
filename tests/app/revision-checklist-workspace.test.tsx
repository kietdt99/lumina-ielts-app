import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { RevisionChecklistWorkspace } from '@/app/(app)/revision-checklist/_components/revision-checklist-workspace'
import { revisionChecklistItems } from '@/lib/ielts/revision-checklist'

describe('RevisionChecklistWorkspace', () => {
  it('renders revision checklist actions and success signals', () => {
    render(<RevisionChecklistWorkspace items={revisionChecklistItems} />)

    expect(
      screen.getByRole('heading', {
        name: 'Turn feedback into a focused rewrite checklist',
      })
    ).toBeInTheDocument()
    expect(screen.getByText('Rewrite the overview sentence')).toBeInTheDocument()
    expect(screen.getAllByText('Success signal').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Open review queue' })).toHaveAttribute(
      'href',
      '/review-queue'
    )
  })

  it('filters checklist actions by task, criterion, priority, and search', async () => {
    const user = userEvent.setup()

    render(<RevisionChecklistWorkspace items={revisionChecklistItems} />)

    await user.click(screen.getByRole('button', { name: 'Task 2' }))
    await user.selectOptions(screen.getByLabelText('Rubric criterion'), 'Task Response')
    await user.selectOptions(screen.getByLabelText('Priority'), 'High')
    await user.type(screen.getByLabelText('Search checklist actions'), 'thesis')

    expect(screen.getByText('Make the position unmistakable')).toBeInTheDocument()
    expect(screen.queryByText('Rewrite the overview sentence')).not.toBeInTheDocument()
  })

  it('shows an empty state and can reset filters', async () => {
    const user = userEvent.setup()

    render(<RevisionChecklistWorkspace items={revisionChecklistItems} />)

    await user.type(screen.getByLabelText('Search checklist actions'), 'no matching action')

    expect(screen.getByText('No checklist actions match this filter')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset filters' }))

    expect(screen.getByText('Rewrite the overview sentence')).toBeInTheDocument()
  })
})
