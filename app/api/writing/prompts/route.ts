import { listWritingPrompts } from '@/lib/ielts/writing-prompts-repository'

export async function GET() {
  const result = await listWritingPrompts()

  return Response.json({
    ok: true,
    prompts: result.prompts,
    storageMode: result.storageMode,
  })
}
