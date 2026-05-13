import { requireLearnerAppSession } from '@/lib/auth/service'
import { createWritingOutline } from '@/lib/ielts/outline-builder'
import { writingPrompts } from '@/lib/ielts/writing-prompts'

export async function GET(request: Request) {
  await requireLearnerAppSession()

  const url = new URL(request.url)
  const promptId = url.searchParams.get('promptId') ?? writingPrompts[0]?.id
  const prompt = writingPrompts.find((item) => item.id === promptId)

  if (!prompt) {
    return Response.json(
      {
        ok: false,
        error: 'Writing prompt was not found for outline generation.',
      },
      { status: 404 }
    )
  }

  return Response.json({
    ok: true,
    outline: createWritingOutline(prompt),
  })
}
