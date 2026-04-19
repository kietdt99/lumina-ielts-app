import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { appSessionCookieName } from '@/lib/auth/cookie-names'
import { getSupabaseConfig } from './config'

export async function updateSession(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next({
      request,
    })
  }

  const config = getSupabaseConfig()
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')

  if (!config) {
    const hasDemoSession = request.cookies.has(appSessionCookieName)

    if (!hasDemoSession && !isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    config.url,
    config.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    const redirectResponse = NextResponse.redirect(url)

    const cookies = supabaseResponse.cookies.getAll()
    cookies.forEach((cookie) => redirectResponse.cookies.set(cookie.name, cookie.value))
    return redirectResponse
  }

  return supabaseResponse
}
