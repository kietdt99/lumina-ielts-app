import { NextResponse } from 'next/server'
import {
  appLanguageCookieName,
  isAppLanguage,
} from '@/lib/i18n/app-language'

export async function PUT(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'Request body must be valid JSON.',
      },
      { status: 400 }
    )
  }

  const requestedLanguage =
    payload && typeof payload === 'object' && 'language' in payload
      ? payload.language
      : null
  const languageCandidate =
    typeof requestedLanguage === 'string' ? requestedLanguage : null

  if (!isAppLanguage(languageCandidate)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Unsupported language.',
      },
      { status: 400 }
    )
  }

  const language = languageCandidate

  const response = NextResponse.json({
    ok: true,
    language,
  })

  response.cookies.set(appLanguageCookieName, language, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  })

  return response
}
