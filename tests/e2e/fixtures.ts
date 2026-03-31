import { expect, test as base, type Page } from '@playwright/test'

type E2EFixtures = {
  gotoAndAssertOk: (path: string) => Promise<void>
}

const writingHistoryStorageKey = 'lumina-writing-history'

function formatError(source: string, message: string) {
  return `${source}: ${message}`
}

function isExpectedNavigationAbort(url: string, errorText: string | undefined) {
  return errorText === 'net::ERR_ABORTED' && (url.includes('_rsc=') || url.includes('/_next/'))
}

export const test = base.extend<E2EFixtures>({
  page: async ({ page }, runFixture) => {
    const runtimeErrors: string[] = []

    page.on('pageerror', (error) => {
      runtimeErrors.push(formatError('pageerror', error.message))
    })

    page.on('console', (message) => {
      if (message.type() === 'error') {
        runtimeErrors.push(formatError('console.error', message.text()))
      }
    })

    page.on('requestfailed', (request) => {
      const failureText = request.failure()?.errorText

      if (
        request.method() === 'GET' &&
        isExpectedNavigationAbort(request.url(), failureText)
      ) {
        return
      }

      runtimeErrors.push(
        formatError(
          'requestfailed',
          `${request.method()} ${request.url()} (${failureText ?? 'unknown error'})`
        )
      )
    })

    await runFixture(page)

    expect(
      runtimeErrors,
      `Unexpected browser runtime errors:\n${runtimeErrors.join('\n')}`
    ).toEqual([])
  },
  gotoAndAssertOk: async ({ page, baseURL }, runFixture) => {
    await runFixture(async (path: string) => {
      const response = await page.goto(path, {
        waitUntil: 'domcontentloaded',
      })

      expect(response, `No response returned for ${path}`).not.toBeNull()
      expect(
        response?.ok(),
        `Navigation failed for ${baseURL ?? ''}${path} with status ${response?.status()}`
      ).toBe(true)
    })
  },
})

export { expect }

export function createStoredHistoryEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: 'entry-1',
    promptId: 'task2-remote-work',
    promptTitle: 'Remote work and employee productivity',
    taskType: 'Task 2',
    createdAt: '2026-03-31T10:00:00.000Z',
    draftExcerpt: 'A focused IELTS draft excerpt',
    wordCount: 280,
    estimatedBand: 7,
    rubric: [
      {
        label: 'Task Response',
        score: 7,
        summary: 'Task response is moving in the right direction but still needs refinement.',
      },
      {
        label: 'Coherence and Cohesion',
        score: 7,
        summary:
          'Coherence and cohesion is moving in the right direction but still needs refinement.',
      },
      {
        label: 'Lexical Resource',
        score: 7,
        summary: 'Lexical resource is moving in the right direction but still needs refinement.',
      },
      {
        label: 'Grammatical Range and Accuracy',
        score: 7,
        summary: 'Grammar control is moving in the right direction but still needs refinement.',
      },
    ],
    strengths: ['The draft has a clear structure.'],
    priorities: ['Develop the second body paragraph with more precise support.'],
    ...overrides,
  }
}

export async function seedWritingHistory(page: Page, entries: unknown[]) {
  await page.addInitScript(
    ({ storageKey, storedEntries }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(storedEntries))
    },
    {
      storageKey: writingHistoryStorageKey,
      storedEntries: entries,
    }
  )
}
