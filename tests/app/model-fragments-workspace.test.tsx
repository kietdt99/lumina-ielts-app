import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ModelFragmentsWorkspace } from '@/app/(app)/model-fragments/_components/model-fragments-workspace'
import { modelFragments } from '@/lib/ielts/model-fragments'

describe('ModelFragmentsWorkspace', () => {
  it('renders short model fragments and adaptation guidance', () => {
    render(<ModelFragmentsWorkspace fragments={modelFragments} />)

    expect(
      screen.getByRole('heading', { name: 'Study short fragments, not full essays' })
    ).toBeInTheDocument()
    expect(screen.getByText('Balanced opinion introduction')).toBeInTheDocument()
    expect(screen.getAllByText('Why it works').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Avoid copying').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Open writing workspace' })).toHaveAttribute(
      'href',
      '/writing'
    )
  })

  it('filters fragments by task type, writing function, and search', async () => {
    const user = userEvent.setup()

    render(<ModelFragmentsWorkspace fragments={modelFragments} />)

    await user.click(screen.getByRole('button', { name: 'Task 1' }))
    await user.selectOptions(screen.getByLabelText('Writing function'), 'Overview')

    expect(screen.getByText('Start-to-end overview')).toBeInTheDocument()
    expect(screen.queryByText('Balanced opinion introduction')).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Writing function'), 'All')
    await user.type(screen.getByLabelText('Search fragments'), 'transport')

    expect(screen.getByText('Grouped detail paragraph')).toBeInTheDocument()
    expect(screen.queryByText('Start-to-end overview')).not.toBeInTheDocument()
  })

  it('shows an empty state and can reset filters', async () => {
    const user = userEvent.setup()

    render(<ModelFragmentsWorkspace fragments={modelFragments} />)

    await user.type(screen.getByLabelText('Search fragments'), 'no matching fragment')

    expect(screen.getByText('No model fragments match this filter')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset filters' }))

    expect(screen.getByText('Balanced opinion introduction')).toBeInTheDocument()
  })
})
